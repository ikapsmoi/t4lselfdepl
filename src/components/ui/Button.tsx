import React, { memo } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'tahoe';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = memo(({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  ariaLabel,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-contiki-teal hover:bg-contiki-teal/90 text-white shadow-contiki hover:shadow-lg transform hover:scale-105 focus:ring-contiki-teal rounded-contiki',
    secondary: 'bg-contiki-navy hover:bg-contiki-navy/90 text-white shadow-contiki hover:shadow-lg transform hover:scale-105 focus:ring-contiki-navy rounded-contiki',
    accent: 'bg-contiki-coral hover:bg-contiki-coral/90 text-white shadow-contiki hover:shadow-lg transform hover:scale-105 focus:ring-contiki-coral rounded-contiki',
    outline: 'border-2 border-contiki-teal text-contiki-teal hover:bg-contiki-teal hover:text-white hover:shadow-contiki transform hover:scale-105 focus:ring-contiki-teal rounded-contiki',
    ghost: 'text-contiki-teal hover:bg-contiki-grayLight hover:text-contiki-navy focus:ring-contiki-teal rounded-contiki',
    tahoe: 'bg-contiki-teal hover:bg-contiki-teal/90 text-white shadow-contiki hover:shadow-lg transform hover:scale-105 focus:ring-contiki-teal rounded-contiki'
  };
  
  const sizeClasses = {
    sm: 'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium min-h-[44px] min-w-[44px]',
    md: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold min-h-[44px] min-w-[44px]',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold min-h-[44px] min-w-[44px]'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-5 h-5 mr-2" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5 ml-2" />}
    </button>
  );
});

Button.displayName = 'Button';