import React from 'react';
import { Modal } from '../ui/Modal';
import { CreatorApplicationForm } from './CreatorApplicationForm';

interface CreatorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripName?: string;
}

export const CreatorApplicationModal: React.FC<CreatorApplicationModalProps> = ({
  isOpen,
  onClose,
  tripName
}) => {
  const handleSuccess = () => {
    // Close modal after showing success message
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <CreatorApplicationForm
        onSuccess={handleSuccess}
        onCancel={onClose}
        tripName={tripName}
      />
    </Modal>
  );
};