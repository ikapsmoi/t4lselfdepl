import React from 'react';
import { MessageCircle } from 'lucide-react';

interface MobileBottomBarProps {
  onClick: () => void;
  contextLabel?: string;
  contextValue?: string;
  buttonLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onClick,
  contextLabel,
  contextValue,
  buttonLabel = 'Design My Trip',
  disabled = false,
  className = '',
}) => (
  <div className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-gray-200 bg-white/95 p-3.5 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg md:hidden ${className}`}>
    <div className="min-w-0">
      {contextValue ? (
        <>
          <p className="text-[11px] font-medium uppercase text-gray-500">{contextLabel || 'From'}</p>
          <p className="truncate text-lg font-bold leading-tight text-gray-900">{contextValue}</p>
        </>
      ) : (
        <p className="whitespace-nowrap text-[13px] font-semibold leading-relaxed text-gray-900 sm:text-sm">{contextLabel || 'Need Expert Help?'}</p>
      )}
    </div>
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#ffc7b2] bg-white px-4 text-sm font-semibold text-[#bd2f20] shadow-sm transition-colors duration-150 hover:border-[#ff7654] hover:bg-[#fff3ee] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7654] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
    >
      <MessageCircle className="h-4 w-4 text-[#bd2f20]" aria-hidden="true" />
      {buttonLabel}
    </button>
  </div>
);
