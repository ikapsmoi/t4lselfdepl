import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAnalytics } from '../../utils/analytics';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export const EnhancedLoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchToSignup, 
  onForgotPassword 
}) => {
  const { login } = useAuth();
  const { login: trackLogin } = useAnalytics();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showLockoutModal, setShowLockoutModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Normalize email
      const normalizedEmail = formData.email.toLowerCase().trim();
      
      // Use the useAuth login function which handles profile fetching and error cases
      const user = await login(normalizedEmail, formData.password);
      
      if (user) {
        // Success - user profile was fetched successfully
        trackLogin();
        onSuccess(user);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message === 'Email not confirmed') {
        setShowVerificationModal(true);
        return;
      }
      
      if (error.message === 'Invalid login credentials') {
        setErrors({ submit: 'Incorrect email or password. Please try again.' });
        return;
      }
      
      // Handle other authentication errors
      setErrors({ submit: error.message || 'Sign in failed. Please check your credentials.' });
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
        alert('Verification email sent! Please check your inbox and spam folder.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setResendingVerification(false);
    }
  };

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockoutTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimeRemaining]);

  const formatLockoutTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
          <p className="text-gray-600 mt-1">Sign in to continue your adventure</p>
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign In
        </Button>

        {/* Forgot Password */}
        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        {/* Switch to Signup */}
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </form>

      {/* Email Verification Modal */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title="Email Verification Required"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Email</h3>
            <p className="text-gray-600">
              Please check your email and click the verification link before signing in.
              If you don't see it, check your spam folder.
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

      {/* Password Reset Triggered Modal */}
      <Modal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        title="Password Reset Sent"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Protection Activated</h3>
            <p className="text-gray-600">
              After 3 incorrect password attempts, we've sent a password reset link to your email for security. 
              Please check your inbox and spam folder.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Account temporarily locked:</strong> For security, your account is locked for 15 minutes. 
                Use the reset link to regain access immediately.
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => setShowPasswordResetModal(false)}
              className="w-full"
            >
              I'll Check My Email
            </Button>
            <Button
              variant="outline"
              onClick={onForgotPassword}
              className="w-full"
            >
              Send Another Reset Link
            </Button>
          </div>
        </div>
      </Modal>
      {/* Account Lockout Modal */}
      <Modal
        isOpen={showLockoutModal}
        onClose={() => setShowLockoutModal(false)}
        title="Account Temporarily Locked"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Too Many Failed Attempts</h3>
            <p className="text-gray-600">
              Your account has been temporarily locked due to multiple failed login attempts.
              A password reset link has been sent to your email.
            </p>
            {lockoutTimeRemaining > 0 && (
              <p className="text-red-600 font-medium">
                Try again in: {formatLockoutTime(lockoutTimeRemaining)}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={onForgotPassword}
              className="w-full"
            >
              Reset Password Instead
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowLockoutModal(false)}
              className="w-full"
            >
              I'll Wait
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};