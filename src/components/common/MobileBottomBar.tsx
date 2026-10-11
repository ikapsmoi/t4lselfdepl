import React from 'react';

interface MobileBottomBarProps {
  onClick: () => void;
  contextLabel?: string;
  contextValue?: string;
  buttonLabel?: string;
  disabled?: boolean;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onClick,
  contextLabel,
  contextValue,
  buttonLabel = 'Design My Trip',
  disabled = false,
}) => (
  <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-gray-200 bg-white/95 p-3.5 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg md:hidden">
    <div className="min-w-0">
      {contextValue ? (
        <>
          <p className="text-[11px] font-medium uppercase text-gray-500">{contextLabel || 'From'}</p>
          <p className="truncate text-lg font-bold leading-tight text-gray-900">{contextValue}</p>
        </>
      ) : (
        <p className="text-sm font-semibold leading-relaxed text-gray-900">{contextLabel || 'Need Expert Help?'}</p>
      )}
    </div>
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-green-500 px-6 text-sm font-semibold text-white shadow-md transition-transform duration-150 ease-out hover:bg-green-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {buttonLabel}
    </button>
  </div>
);
