import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Trip } from '../../types';
import { MessageCircle, Send, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';

interface MessageHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const MessageHostModal: React.FC<MessageHostModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { user } = useAuth();
  const { sendMessage } = useMessages(user?.id || '');
  const [subject, setSubject] = useState(`Inquiry about ${trip.title}`);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to message the host');
      return;
    }

    if (!trip.host_id) {
      alert('Host information is missing for this trip. Please try again later or contact support.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send message through the messaging system
      await sendMessage(trip.host_id, `Subject: ${subject}\n\n${message}`, trip.id);
      
      // Also send email notification to host
      const emailSubject = `New Message About Your Trip: ${trip.title}`;
      const emailBody = `You have received a new message about your trip "${trip.title}".

From: ${user.name} (${user.email})
Subject: ${subject}

Message:
${message}

Trip Details:
- Trip: ${trip.title}
- Destination: ${trip.destination}
- Duration: ${trip.duration} days
- Start Date: ${new Date(trip.start_date).toLocaleDateString()}

Please respond to this message through your Travel4life dashboard or reply to this email.

Best regards,
Travel4life Team`;

      const mailtoLink = `mailto:${trip.host?.email || 'info@travel4life.net'}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoLink, '_blank');
      
      setShowSuccess(true);
      setSubject(`Inquiry about ${trip.title}`);
      setMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "Message Sent!" : "Message Host"}
      maxWidth="max-w-lg"
    >
      {showSuccess ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
            <p className="text-gray-600">
              Your message has been sent to the host. They will receive an email notification and can respond through their dashboard.
            </p>
          </div>
          <Button variant="primary" onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Host Info */}
          {trip.host && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  {trip.host.avatar ? (
                    <img src={trip.host.avatar} alt={trip.host.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{trip.host.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{trip.host.name}</span>
                    {trip.host.verified && (
                      <Badge variant="success" size="sm" className="bg-green-100 text-green-800 border-green-200 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Host of {trip.title}</div>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Subject"
            placeholder="What would you like to ask about?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about availability, group details, itinerary, or any specific questions..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <MessageCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Tip:</strong> Be specific about your questions to get the best response from the host. 
                They typically respond within 24 hours.
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              loading={isSubmitting}
              icon={Send}
              className="flex-1"
            >
              Send Message
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};