import React from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  className = '',
  required = false,
  error,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium !text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
          error ? 'border-red-500' : 'border-gray-300'
        } min-h-[48px]`}
      />
      {error && <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>}
    </div>
  );
};