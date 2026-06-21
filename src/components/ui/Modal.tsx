import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  disableClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  disableClose = false,
}) => {
  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={disableClose ? undefined : onClose}
      />
      <div className={`relative bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[95vh] sm:max-h-[90vh] transform transition-all overflow-hidden`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {!disableClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[calc(95vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};