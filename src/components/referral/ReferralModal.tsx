import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Copy, CheckCircle, Instagram, Share2, Users, Gift, Star, Plane } from 'lucide-react';
import { useAnalytics } from '../../utils/analytics';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'host' | 'traveler';
  userName: string;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userName
}) => {
  const { referralSent } = useAnalytics();
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [copied, setCopied] = useState(false);

  const generateReferralMessage = () => {
    const baseMessage = userRole === 'host' 
      ? `🌟 Hey! I've been hosting amazing trips on TravelTag and it's been incredible!

🎯 As a host, I've:
✈️ Connected with amazing travelers worldwide
💰 Earned great income sharing my passion
🏆 Built my reputation as a verified host
🌍 Shared my local expertise globally

Join me as a ${userRole === 'host' ? 'fellow host' : 'traveler'} and let's create unforgettable adventures together!`
      : `🌟 Just discovered TravelTag and I'm obsessed!

🎯 Why you'll love it:
✈️ Join small groups of amazing people
🏆 Verified hosts & safe adventures
💫 Unique experiences you can't find elsewhere
🌍 Travel buddies & lifelong friendships

Join me on this incredible platform!`;

    return `${baseMessage}

🎁 Special perks when you sign up:
• 5% off your first adventure
• Early access to exclusive trips
• Connect with verified travel community
• Earn points & unlock rewards

Sign up at TravelTag.com and mention my name "${userName}" for bonus points! 🚀

#TravelTag #GroupTravel #Adventure #TravelCommunity #Wanderlust`;
  };

  const generateInstagramStory = () => {
    return `🔥 Found the BEST travel platform!

TravelTag = Game Changer ✨

${userRole === 'host' ? '🎯 Hosting trips & earning' : '🎯 Amazing group adventures'}
🌍 Verified hosts & safety first
💫 Incredible community vibes

Swipe up to join! 👆
Use code "${userName.toUpperCase()}" 🎁`;
  };

  const templates = [
    {
      id: 'general',
      name: 'General Share',
      description: 'Perfect for any platform',
      content: generateReferralMessage(),
      icon: Share2
    },
    {
      id: 'story',
      name: 'Instagram Story',
      description: 'Short & engaging for stories',
      content: generateInstagramStory(),
      icon: Instagram
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(currentTemplate.content);
      referralSent(userName, 'clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleShareToInstagram = () => {
    const instagramUrl = `https://www.instagram.com/create/story/`;
    window.open(instagramUrl, '_blank');
    referralSent(userName, 'instagram');
    handleCopyText();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Refer Friends to TravelTag"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Share TravelTag</h3>
          
        </div>

        {/* Referral Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-green-600" />
            Referral Rewards
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <span>You: 200 points + 5% off Every Referral</span>
            </div>
            <div className="flex items-center">
              <Gift className="w-3 h-3 text-green-500 mr-1" />
              <span>They: 5% off</span>
            </div>
            <div className="flex items-center">
              <Plane className="w-3 h-3 text-blue-500 mr-1" />
              <span>Both: Early access</span>
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 text-purple-500 mr-1" />
              <span>4 referrals Upgraded rooms + Dinner Vouchers</span>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Choose Template</h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <template.icon className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                <div className="font-medium text-gray-900 text-xs">{template.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Preview */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
              {currentTemplate.content}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleCopyText}
            icon={copied ? CheckCircle : Copy}
            className={`w-full text-sm ${copied ? 'text-green-600 border-green-300' : ''}`}
            size="sm"
          >
            {copied ? 'Copied!' : 'Copy Message'}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleShareToInstagram}
            icon={Instagram}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-sm"
            size="sm"
          >
            Instagram
          </Button>
        </div>

        {/* Referral Code */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <div className="text-lg mr-2">🎁</div>
            <div className="text-xs text-yellow-800">
              <strong>Your Referral Code:</strong> {userName.toUpperCase()}
              <br />
              <span>Friends mention this for bonus points!</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};