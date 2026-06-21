import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Trip } from '../../types';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { useMessages } from '../../hooks/useMessages';

interface InquireNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const InquireNowModal: React.FC<InquireNowModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { user } = useAuth();
  const { saveTrip, refreshData } = useDashboard(user?.id || '', 'traveler');
  const { sendMessage } = useMessages(user?.id || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construct email content
      const subject = `Trip Inquiry - ${trip.title}`;
      const body = `New trip inquiry received:

Trip Details:
- Trip: ${trip.title}
- Destination: ${trip.destination}
- Duration: ${trip.duration} days
- Price: $${trip.price} per person
- Start Date: ${new Date(trip.start_date).toLocaleDateString()}

Customer Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

Message from customer:
${message}

Please respond to this inquiry as soon as possible.`;

      // Create mailto link
      const mailtoLink = `mailto:support@traveltag.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      // Send message to host's dashboard if user is logged in
      if (user && trip.host_id) {
        try {
          const dashboardMessage = `New inquiry for "${trip.title}" from ${name}

Travel Details:
- Dates: ${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}
- Travelers: ${user.name}
- Contact: ${email}

Message: ${message}

Please check your email for complete details.`;

          await sendMessage(trip.host_id, dashboardMessage, trip.id);
        } catch (error) {
          console.error('Error sending dashboard message:', error);
          // Don't fail the entire operation if dashboard message fails
        }
      }
      
      // Send inquiry details to admin email
      const adminEmailSubject = `Trip Inquiry Received - ${trip.title}`;
      const adminEmailBody = `New trip inquiry received:

Inquiry Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Message: ${message}

Trip Details:
- Trip: ${trip.title}
- Destination: ${trip.destination}
- Duration: ${trip.duration} days
- Price: $${trip.price} per person
- Start Date: ${new Date(trip.start_date).toLocaleDateString()}

Please ensure the host responds to this inquiry promptly.

Best regards,
TravelTag System`;

      const adminMailtoLink = `mailto:support@traveltag.net?subject=${encodeURIComponent(adminEmailSubject)}&body=${encodeURIComponent(adminEmailBody)}`;
      window.open(adminMailtoLink, '_blank');
      
      // Save trip to user's saved trips if user is logged in
      if (user) {
        try {
          await saveTrip(trip.id);
          await refreshData();
        } catch (error) {
          console.error('Error saving trip:', error);
        }
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      
    } catch (error) {
      console.error('Error sending inquiry:', error);
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
      title={showSuccess ? "Inquiry Sent!" : "Inquire About This Trip"}
      maxWidth="max-w-lg"
    >
      {showSuccess ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inquiry Sent Successfully!</h3>
            <p className="text-gray-600">
              Host will confirm your booking and share details via email within 48 Hours. Looking forward to Hosting you.
            </p>
          </div>
          <Button variant="primary" onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-1">{trip.title}</h3>
            <p className="text-sm text-gray-600">{trip.destination} • {trip.duration} days</p>
            <p className="text-sm text-gray-600">${trip.price} per person</p>
          </div>

          <Input
            label="Your Name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Host
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about availability, group details, or any specific questions..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              loading={isSubmitting}
              icon={MessageCircle}
              className="flex-1"
            >
              Send Inquiry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};