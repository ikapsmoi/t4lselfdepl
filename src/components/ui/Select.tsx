import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  className?: string;
  required?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  onChange,
  options,
  className = '',
  required = false,
  error,
}) => {
  // Safeguard: ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          required={required}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none text-xs sm:text-sm text-gray-900 bg-white ${
            error ? 'border-red-500' : 'border-gray-300'
          } min-h-[48px]`}
        >
          <option value="">{placeholder}</option>
          {safeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 sm:right-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>}
    </div>
  );
};