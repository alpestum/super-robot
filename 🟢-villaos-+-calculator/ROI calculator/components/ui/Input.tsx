
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  unit?: string;
  // placeholder is part of React.InputHTMLAttributes
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  id, 
  unit, 
  placeholder,
  type,     
  value,    
  onChange, 
  ...restInputProps // All other standard input attributes like name, min, max, disabled, etc.
}) => {

  // Determine the value to display in the input field
  // If type is number, original value is 0 (as number or string "0"), and a placeholder exists,
  // display an empty string to allow the placeholder to be visible.
  // Otherwise, display the original value.
  const internalDisplayValue = (type === 'number' && (value === 0 || value === '0') && placeholder) 
    ? '' 
    : value;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          type={type}
          // Ensure value passed to input is not undefined or null, default to empty string
          value={internalDisplayValue === undefined || internalDisplayValue === null ? '' : internalDisplayValue}
          onChange={onChange}
          {...restInputProps}
          className="mt-1 block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm disabled:bg-gray-100 text-gray-900"
        />
        {unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">{unit}</span>}
      </div>
    </div>
  );
};
