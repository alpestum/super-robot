
import React from 'react';

interface SwitchProps {
  label: string;
  id: string;
  name: string;
  checked: boolean;
  onChange: (name: string, checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  id,
  name,
  checked,
  onChange,
  description,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(name, !checked);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 py-1">
      <span className="flex-grow mr-3">
        <label
          htmlFor={id}
          className={`block text-sm font-medium ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}`}
          onClick={handleToggle}
        >
          {label}
        </label>
        {description && (
          <p className={`text-xs mt-0.5 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={handleToggle}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          checked ? (disabled ? 'bg-blue-300' : 'bg-blue-600') : (disabled ? 'bg-gray-100' : 'bg-gray-200')
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
