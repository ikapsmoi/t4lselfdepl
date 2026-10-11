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
  const titleId = React.useId();

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={disableClose ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-xl animate-mobile-sheet ${maxWidth} sm:max-h-[90vh] sm:animate-none sm:rounded-2xl`}
      >
        <div className="mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-gray-200 sm:hidden" aria-hidden="true" />
        <div className="flex shrink-0 items-center justify-between gap-4 border-b p-4 sm:p-6">
          <h3 id={titleId} className="text-xl font-semibold text-gray-900">{title}</h3>
          {!disableClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};