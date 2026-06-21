import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { EnhancedSignupForm } from './EnhancedSignupForm';
import { EnhancedLoginForm } from './EnhancedLoginForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Globe } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>(mode);

  // Update mode when prop changes
  React.useEffect(() => {
    setAuthMode(mode);
  }, [mode]);

  const handleAuthSuccess = (user: any) => {
    onClose();
    
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'host') {
      window.location.hash = 'host-dashboard';
    } else {
      window.location.hash = 'traveler-dashboard';
    }
  };

  const handleSwitchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setAuthMode(newMode);
    if (newMode === 'login' || newMode === 'signup') {
      onSwitchMode(newMode);
    }
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

      {authMode === 'signup' && (
        <EnhancedSignupForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => handleSwitchMode('login')}
        />
      )}

      {authMode === 'login' && (
        <EnhancedLoginForm
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={() => handleSwitchMode('signup')}
          onForgotPassword={() => handleSwitchMode('forgot')}
        />
      )}

      {authMode === 'forgot' && (
        <ForgotPasswordForm
          onBackToLogin={() => handleSwitchMode('login')}
        />
      )}
    </Modal>
  );
};