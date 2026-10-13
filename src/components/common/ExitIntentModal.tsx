import React from 'react';
import { Plane } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useAnalytics } from '../../utils/analytics';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (isExitIntentSignup?: boolean) => void;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({
  isOpen,
  onClose,
  onSignUp
}) => {
  const { user } = useAuth();
  const { exitIntent } = useAnalytics();

  // Track exit intent when modal is shown
  React.useEffect(() => {
    if (isOpen) {
      exitIntent();
    }
  }, [isOpen]);

  // Don't show if user is already logged in
  if (user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-10 h-10 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Keep exploring Travel4life</h2>
          <p className="text-gray-600 text-lg">
            Create an account to access traveler tools. Creating an account does not reserve a trip or confirm its availability.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => onSignUp(true)}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg font-bold py-4"
          >
            Continue to sign up
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-gray-600"
          >
            Maybe Later
          </Button>
        </div>

      </div>
    </Modal>
  );
};