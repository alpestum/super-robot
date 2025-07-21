
import React from 'react';

interface ToggleSwitchProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (name: string, checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  name,
  label,
  checked,
  onChange,
  className = '',
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(name, !checked);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label htmlFor={id} className="text-sm text-black dark:text-dark-ios-gray-800 cursor-pointer select-none">
        {label}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        className={`relative inline-flex flex-shrink-0 h-[28px] w-[50px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-apple-blue dark:focus:ring-offset-dark-ios-gray-200 dark:focus:ring-apple-blue-light ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${checked ? 'bg-apple-blue dark:bg-apple-blue-dark' : 'bg-ios-gray-300 dark:bg-dark-ios-gray-400'}`}
      >
        <span className="sr-only">Use {label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white dark:bg-dark-ios-gray-100 shadow transform ring-0 transition ease-in-out duration-200 ${
            checked ? 'translate-x-[22px]' : 'translate-x-0' // Adjusted for slightly larger toggle
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;