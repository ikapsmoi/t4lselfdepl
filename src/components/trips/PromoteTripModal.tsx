import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trip } from '../../types';
import { Instagram, Share2, Copy, Download, CheckCircle, Smartphone, Camera } from 'lucide-react';
import { useAnalytics } from '../../utils/analytics';

interface PromoteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const PromoteTripModal: React.FC<PromoteTripModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { shareTrip } = useAnalytics();
  const [selectedTemplate, setSelectedTemplate] = useState('story');
  const [copied, setCopied] = useState(false);

  const generateInstagramCaption = () => {
    const hashtags = [
      '#TravelTag', '#GroupTravel', '#Adventure', '#TravelCommunity',
      `#${trip.destination.replace(/\s+/g, '').replace(/,/g, '')}`,
      `#${trip.type}Travel`, '#Wanderlust', '#TravelGram'
    ].join(' ');

    return `🌟 Just discovered this amazing trip: ${trip.title}!

📍 ${trip.destination}
⏰ ${trip.duration} days of pure adventure
💰 Starting from $${trip.price} per person
⭐ ${trip.rating}/5 rating from fellow travelers

${trip.description}

Who's ready to join me on this incredible journey? 🚀

Book now on TravelTag and let's create unforgettable memories together! ✈️

${hashtags}

#ad #sponsored #travel #adventure #grouptravel`;
  };

  const generateStoryText = () => {
    return `🔥 Found the PERFECT trip!

${trip.title}
📍 ${trip.destination}
💸 $${trip.price}/person
⭐ ${trip.rating} rating

Swipe up to book! 👆`;
  };

  const templates = [
    {
      id: 'story',
      name: 'Instagram Story',
      description: 'Perfect for Instagram Stories',
      content: generateStoryText(),
      icon: Smartphone
    },
    {
      id: 'post',
      name: 'Instagram Post',
      description: 'Full caption for feed posts',
      content: generateInstagramCaption(),
      icon: Camera
    },
    {
      id: 'simple',
      name: 'Simple Share',
      description: 'Quick and easy sharing',
      content: `Check out this amazing trip: ${trip.title} in ${trip.destination}! ${trip.duration} days for $${trip.price}. Book on TravelTag! ✈️`,
      icon: Share2
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(currentTemplate.content);
      shareTrip(trip.id, 'clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleShareToInstagram = () => {
    // Create Instagram share URL with pre-filled caption
    const instagramUrl = `https://www.instagram.com/create/story/`;
    window.open(instagramUrl, '_blank');
    
    // Track share event
    shareTrip(trip.id, 'instagram');
    
    // Also copy the text to clipboard for easy pasting
    handleCopyText();
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Promote This Trip"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="text-center">
          <Instagram className="w-12 h-12 text-pink-600 mx-auto mb-3" />
          <p className="text-gray-600">
            Spread the word and You get 3% off for successful referrals!
          </p>
        </div>

        {/* Trip Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <img
              src={trip.images[0]}
              alt={trip.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{trip.title}</h4>
              <p className="text-sm text-gray-600">{trip.destination} • {trip.duration} days</p>
              <p className="text-sm text-green-600 font-semibold">${trip.price} per person</p>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Choose Template</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedTemplate === template.id
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <template.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                <div className="text-xs text-gray-600">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Preview */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {currentTemplate.content}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCopyText}
            icon={copied ? CheckCircle : Copy}
            className={`w-full ${copied ? 'text-green-600 border-green-300' : ''}`}
          >
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleShareToInstagram}
            icon={Instagram}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Share to Instagram
          </Button>
        </div>

        {/* Referral Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-2xl mr-3">🎁</div>
            <div className="text-sm text-yellow-800">
              <strong>Earn Rewards:</strong> Get 100 points for every successful booking through your referral! 
              Points can be redeemed for trip discounts and exclusive perks.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};