import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { EnhancedSignupForm } from './EnhancedSignupForm';
import { EnhancedLoginForm } from './EnhancedLoginForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'forgot';
  onSwitchMode: (mode: 'login' | 'signup' | 'forgot') => void;
  onSuccess: (user: any) => void;
}

export const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
  onSuccess,
}) => {
  // Check if this signup originated from exit intent
  const isExitIntentSignup = sessionStorage.getItem('exitIntentSignup') === 'true';
  
  React.useEffect(() => {
    // Clear the flag when modal closes
    if (!isOpen) {
      sessionStorage.removeItem('exitIntentSignup');
    }
  }, [isOpen]);

  const handleAuthSuccess = (user: any) => {
    onSuccess(user);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Globe className="w-10 h-10 text-yellow-500" />
        </div>
      </div>

      {mode === 'signup' && (
        <EnhancedSignupForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => onSwitchMode('login')}
          isExitIntentSignup={isExitIntentSignup}
        />
      )}

      {mode === 'login' && (
        <EnhancedLoginForm
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={() => onSwitchMode('signup')}
          onForgotPassword={() => onSwitchMode('forgot')}
        />
      )}

      {mode === 'forgot' && (
        <ForgotPasswordForm
          onBackToLogin={() => onSwitchMode('login')}
        />
      )}
    </Modal>
  );
};