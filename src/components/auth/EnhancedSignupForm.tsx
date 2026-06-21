import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Instagram, Eye, EyeOff, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAnalytics } from '../../utils/analytics';
import { useAuth } from '../../hooks/useAuth';

interface SignupFormProps {
  onSuccess: (user: any) => void;
  onSwitchToLogin: () => void;
  isExitIntentSignup?: boolean;
}

export const EnhancedSignupForm: React.FC<SignupFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin, 
  isExitIntentSignup = false 
}) => {
  const { signUp, hostSignup } = useAnalytics();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'traveler' as 'host' | 'traveler',
    instagramId: '',
    selectedCity: ''
  });

  const [showRoleSpecificContent, setShowRoleSpecificContent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Check for host signup data attribute
  React.useEffect(() => {
    const hostSignupButton = document.querySelector('[data-host-signup]');
    if (hostSignupButton) {
      setFormData(prev => ({ ...prev, role: 'host' }));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Instagram ID validation (optional)
    if (formData.instagramId.trim()) {
      const sanitizedInstagram = formData.instagramId.trim().replace(/^@/, '');
      const instagramRegex = /^[a-zA-Z0-9._]{1,40}$/;
      if (!instagramRegex.test(sanitizedInstagram)) {
        newErrors.instagramId = 'Instagram ID can only contain letters, numbers, dots, and underscores (max 40 characters)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted, validating...');
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    console.log('Form validation passed, submitting...');
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.instagramId || undefined,
        undefined, // cityData
        isExitIntentSignup ? 'exit_intent_discount' : 'direct',
        isExitIntentSignup
      );

      if (result.success) {
        // Track successful signup
        signUp(formData.role, { source: isExitIntentSignup ? 'exit_intent_discount' : 'direct' });
        if (formData.role === 'host') {
          hostSignup();
        }
        
        if (result.user) {
          onSuccess(result.user);
        } else {
          // Email confirmation required
          setShowVerificationModal(true);
        }
      } else {
        // Handle signup errors
        if (result.error === 'User already registered') {
          setErrors({ submit: 'This email is already registered. Please try logging in or use a different email address.' });
        } else {
          setErrors({ submit: result.error || 'Failed to create account' });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email.toLowerCase().trim(),
          }),
        }
      );

      if (response.ok) {
        // Handle success
      }
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <>
      {!showRoleSpecificContent ? (
        // Role Selection Landing Page
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Join TravelTag</h2>
            <p className="text-gray-600 mt-1">Choose how you want to experience travel</p>
          </div>

        

          {/* Host Option */}
          <div 
            className="p-6 rounded-xl border-2 border-gray-200 hover:border-green-500 cursor-pointer transition-all group"
            onClick={() => {
              setFormData(prev => ({ ...prev, role: 'host' }));
              setShowRoleSpecificContent(true);
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Host</h3>
              <p className="text-green-600 font-semibold mb-3">Earn money hosting trips. Share your world with travelers.</p>
              
              {/* Social Proof */}
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-bold text-green-900">₹50K-100K</div>
                    <div className="text-green-700">Avg Earnings/Trip</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-900">2,500+</div>
                    <div className="text-green-700">Active Hosts</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-900">15%</div>
                    <div className="text-green-700">Commission Only</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-900">24/7</div>
                    <div className="text-green-700">Support</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                ✓ Insurance coverage • ✓ 24/7 support • ✓ Verified payments
              </div>
            </div>
          </div>
  {/* Traveler Option */}
          <div 
            className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all group"
            onClick={() => {
              setFormData(prev => ({ ...prev, role: 'traveler' }));
              setShowRoleSpecificContent(true);
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Traveler</h3>
              <p className="text-blue-600 font-semibold mb-3">Join group adventures, make friends, and travel for less.</p>
              
              {/* Trust Signals */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-bold text-blue-900">18K+</div>
                    <div className="text-blue-700">Happy Travelers</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">60+</div>
                    <div className="text-blue-700">Destinations</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">4.65★</div>
                    <div className="text-blue-700">Average Rating</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">100%</div>
                    <div className="text-blue-700">Insured</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                ✓ Backed by insurance • ✓ Safe payments • ✓ Verified hosts
              </div>
            </div>
          </div>
          {/* Switch to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      ) : (
        // Actual Signup Form
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={() => setShowRoleSpecificContent(false)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center mx-auto"
          >
            ← Back to role selection
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {formData.role === 'traveler' ? 'Join as Traveler' : 'Become a Host'}
          </h2>
          <p className="text-gray-600 mt-1">
            {formData.role === 'traveler' 
              ? 'Start your adventure with amazing group trips'
              : 'Share your expertise and earn money hosting trips'
            }
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            required
          />
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              error={errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              error={errors.confirmPassword}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        Instagram ID 
        <div className="relative">
          <Input
            label="Instagram Handle (Optional)"
            placeholder="your_instagram_handle"
            value={formData.instagramId}
            onChange={(e) => setFormData(prev => ({ ...prev, instagramId: e.target.value }))}
            error={errors.instagramId}
          />
          <Instagram className="absolute right-3 top-9 w-5 h-5 text-gray-400" />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {formData.role === 'traveler' ? (
            <>
              <Button
                variant="primary"
                onClick={() => window.location.hash = 'trips'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Find Your Trip
              </Button>
              <Button
                type="submit"
                variant="outline"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up & Save'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Creating Account...' : 'Become a Host'}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.hash = 'creator-trips'}
                className="w-full"
              >
                See Host Stories
              </Button>
            </>
          )}
        </div>

        {/* Switch to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
      )}

      {/* Email Verification Modal */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title="Verify Your Email"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
            <p className="text-gray-600">
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please check your inbox and spam folder.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleResendVerification}
              loading={resendingVerification}
              className="w-full"
            >
              Resend Verification Email
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowVerificationModal(false)}
              className="w-full"
            >
              I'll Check My Email
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};