import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, Calendar, Users, DollarSign, Heart, CheckCircle, Mail } from 'lucide-react';
import { INDIA_CATEGORIES } from '../../utils/constants';

interface IndiaTripInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IndiaTripInquiryModal: React.FC<IndiaTripInquiryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destinations: '',
    startDate: '',
    endDate: '',
    travelers: '2',
    budget: '',
    interests: [] as string[],
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate trip duration
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Construct email content
      const subject = 'Custom India Trip Inquiry - TravelTag';
      const body = `New custom India trip inquiry received:

TRAVELER DETAILS:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}

TRIP PREFERENCES:
- Preferred Destinations: ${formData.destinations}
- Travel Dates: ${new Date(formData.startDate).toLocaleDateString()} to ${new Date(formData.endDate).toLocaleDateString()}
- Duration: ${duration} days
- Number of Travelers: ${formData.travelers}
- Budget per Person: $${formData.budget}

INTERESTS:
${formData.interests.map(interest => `- ${INDIA_CATEGORIES.find(cat => cat.value === interest)?.label || interest}`).join('\n')}

SPECIAL REQUESTS:
${formData.specialRequests || 'None specified'}

---
This inquiry was submitted through the TravelTag India Specials section.
Please respond to the customer within 24 hours.

Best regards,
TravelTag Team`;

      // Create mailto link
      const mailtoLink = `mailto:support@traveltag.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        destinations: '',
        startDate: '',
        endDate: '',
        travelers: '2',
        budget: '',
        interests: [],
        specialRequests: ''
      });
      
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
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
      title={showSuccess ? "Inquiry Sent!" : "Plan Your Custom India Trip"}
      maxWidth="max-w-3xl"
    >
      {showSuccess ? (
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Your custom India trip inquiry has been sent. Our India travel experts will contact you within 24 hours to create your perfect itinerary.
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center text-orange-800">
              <span className="text-2xl mr-2">🇮🇳</span>
              <div className="text-left">
                <div className="font-semibold text-sm sm:text-base">What's Next?</div>
                <div className="text-xs sm:text-sm">Check your email for a confirmation and expect a call from our India specialists.</div>
              </div>
            </div>
          </div>
          <Button variant="primary" onClick={handleClose} className="w-full" size="sm">
            Explore More India Trips
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="text-center mb-6">
             {/*<div className="flex items-center justify-center mb-3">
              <span className="text-3xl mr-2">🇮🇳</span>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Incredible India Awaits</h3>
            </div>*/}
            
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
          />

          {/* Trip Preferences */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Places in India and Additional Requreiments Details
            </label>
            <textarea
              value={formData.destinations}
              onChange={(e) => handleInputChange('destinations', e.target.value)}
              placeholder="e.g., Rajasthan (Jaipur, Udaipur), Kerala (Kochi, Munnar), Goa beaches, Himachal Pradesh..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              required
            />
          </div>

          {/* Travel Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              required
            />
          </div>

          {/* Group Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Number of Travelers
              </label>
              <select
                value={formData.travelers}
                onChange={(e) => handleInputChange('travelers', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num.toString()}>
                    {num} {num === 1 ? 'traveler' : 'travelers'}
                  </option>
                ))}
              </select>
            </div>
          </div>

           {/*  </div>

            <Input
              label="Budget per Person (INR)"
              type="number"
              placeholder="e.g., 1500"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              required
            />
          </div>*/}

          {/* Interests 
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              What interests you most about India?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {INDIA_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInterestToggle(category.value)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-center ${
                    formData.interests.includes(category.value)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300 text-gray-600'
                  }`}
                >
                  <div className="text-lg sm:text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs font-medium leading-tight">{category.label}</div>
                </button>
              ))}
            </div>
          </div>*/}

          {/* Special Requests 
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Special Requests or Requirements
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              placeholder="Any dietary restrictions, accessibility needs, special occasions, or specific experiences you'd like to include..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>*/}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" size="sm">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              loading={isSubmitting}
              icon={Mail}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              size="sm"
            >
              Send Inquiry
            </Button>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">ℹ️</span>
              <div className="text-xs sm:text-sm text-blue-800">
                <strong>How it works:</strong> Our India travel specialists will review your preferences and create a personalized itinerary. You'll receive a detailed proposal within 24 hours including accommodations, activities, and pricing.
              </div>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};