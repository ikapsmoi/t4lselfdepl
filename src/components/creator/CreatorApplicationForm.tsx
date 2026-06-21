import React, { useState } from 'react';
import { Instagram, Youtube, Mail, CheckCircle, Star, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface CreatorApplicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  tripName?: string;
}

export const CreatorApplicationForm: React.FC<CreatorApplicationFormProps> = ({
  onSuccess,
  onCancel,
  tripName
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    instagram_handle: '',
    tiktok_handle: '',
    youtube_channel: '',
    email: user?.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // At least one social media handle required
    const hasAtLeastOneSocial = formData.instagram_handle.trim() || 
                               formData.tiktok_handle.trim() || 
                               formData.youtube_channel.trim();
    
    if (!hasAtLeastOneSocial) {
      newErrors.social = 'Please provide at least one social media handle';
    }

    // Instagram handle validation (if provided)
    if (formData.instagram_handle.trim()) {
      const sanitizedInstagram = formData.instagram_handle.trim().replace(/^@/, '');
      const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
      if (!instagramRegex.test(sanitizedInstagram)) {
        newErrors.instagram_handle = 'Invalid Instagram handle format';
      }
    }

    // TikTok handle validation (if provided)
    if (formData.tiktok_handle.trim()) {
      const sanitizedTiktok = formData.tiktok_handle.trim().replace(/^@/, '');
      const tiktokRegex = /^[a-zA-Z0-9._]{1,24}$/;
      if (!tiktokRegex.test(sanitizedTiktok)) {
        newErrors.tiktok_handle = 'Invalid TikTok handle format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize social media handles
      const sanitizedData = {
        instagram_handle: formData.instagram_handle.trim().replace(/^@/, '') || null,
        tiktok_handle: formData.tiktok_handle.trim().replace(/^@/, '') || null,
        youtube_channel: formData.youtube_channel.trim() || null,
        email: formData.email.toLowerCase().trim(),
        trip_name: tripName || null
      };

      // Submit via Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-creator-application`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitizedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error submitting creator application:', errorData);
        if (response.status === 409) {
          setErrors({ submit: 'You have already submitted a creator application with this email.' });
        } else {
          setErrors({ submit: errorData.error || 'Failed to submit application. Please try again.' });
        }
        return;
      }

      // Show success state
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        instagram_handle: '',
        tiktok_handle: '',
        youtube_channel: '',
        email: user?.email || ''
      });

    } catch (error) {
      console.error('Creator application error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
            Application Submitted!
          </h3>
        </div>
        <div className="text-center mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Thank you for your interest in becoming a creator!
          </p>
          {tripName && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
              <div className="flex items-center text-purple-800">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm font-semibold">
                  <strong>Trip Interest:</strong> {tripName}
                </span>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-center text-purple-800 mb-2">
            <Star className="w-5 h-5 mr-2 text-purple-600" />
            <span className="font-semibold">What's Next?</span>
          </div>
          <p className="text-purple-700 text-sm">
            Check your email for confirmation and prepare your content strategy. 
            Our team will review your social media presence and get in touch soon!
          </p>
        </div>
        <Button variant="primary" onClick={onSuccess} className="w-full">
          Continue Exploring
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="text-center mb-2 sm:mb-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
        </div>
        {tripName && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-center text-purple-800">
              <Star className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">
                Interested in hosting: <span className="font-bold">{tripName}</span>
              </span>
            </div>
          </div>
        )}
        {!tripName && (
          <p className="text-sm sm:text-base text-gray-600">
            Join our creator community and host amazing trips!
          </p>
        )}
      </div>

      {/* Social Media Handles - Better spacing and visibility */}
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Instagram className="w-4 h-4 inline mr-2 text-pink-500" />
              Instagram Handle
            </label> 
            <Input
              placeholder="@your_instagram_handle"
              value={formData.instagram_handle}
              onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
              error={errors.instagram_handle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Youtube className="w-4 h-4 inline mr-2 text-red-500" />
              YouTube Channel
            </label> 
            <Input
              placeholder="Your channel name or URL"
              value={formData.youtube_channel}
              onChange={(e) => handleInputChange('youtube_channel', e.target.value)}
            />
          </div>
        </div>

        {/* Error message for social media requirement */}
        {errors.social && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.social}</p>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-3 sm:space-y-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            <Mail className="w-4 h-4 inline mr-2 text-blue-500" />
            Email Address
          </label>
          <Input
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />
        </div>
      </div>

      {/* Requirements Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
          <Star className="w-5 h-5 mr-2 text-purple-600" />
          Creator Benefits
        </h4>
        <ul className="text-sm text-purple-800 space-y-2">
          <li>• All-inclusive free trip experiences</li>
          <li>• Revenue sharing opportunities</li>
          <li>• Verified creator badge</li>
        </ul>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Make sure your social media profiles showcase your travel content and engagement. 
            Our team will review your content quality and audience engagement as part of the application process.
          </div>
        </div>
      </div>
    </form>
  );
};