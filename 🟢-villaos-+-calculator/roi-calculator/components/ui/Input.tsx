
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  unit?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  id, 
  unit, 
  placeholder,
  type,     
  value,    
  onChange, 
  ...restInputProps
}) => {

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
