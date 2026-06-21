import React, { useState, useEffect } from 'react';
import { X, Gift, Star, Users, Plane } from 'lucide-react';
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
            <Gift className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            Limited Time!
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wait! Don't Miss Out!</h2>
          <p className="text-gray-600 text-lg">
            Join 50,000+ adventurers and get exclusive benefits
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What you get when you sign up:</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Gift className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700">5% off your first adventure</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">Early access to Sold Out Festivals</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Group with verified travel buddies</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <Plane className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-gray-700">Access to Influencers-led adventures</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => onSignUp(true)}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg font-bold py-4"
          >
            🎉 Regsiter Now- Book your 1st Trip - Flat 5% Off.
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-gray-600"
          >
            Maybe Later
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span>4.9/5 Rating</span>
          </div>
          <div>•</div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>50K+ Members</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};