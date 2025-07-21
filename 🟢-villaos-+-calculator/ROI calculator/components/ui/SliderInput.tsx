
import React from 'react';

interface SliderInputProps {
  label: string;
  id: string;
  name: string;
  value: number; 
  onChange: (name: string, value: number) => void;
  min?: number; 
  max?: number; 
  step?: number; 
  unit?: string;
  isPercentageDisplay?: boolean; 
  disabled?: boolean;
  description?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  unit = '%',
  isPercentageDisplay = true,
  disabled = false,
  description,
}) => {
  const displayValue = isPercentageDisplay 
    ? Math.round(value * 100).toString() 
    : value.toFixed(2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, parseFloat(e.target.value));
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {description && <p className="text-xs text-gray-500 mb-1">{description}</p>}
      <div className="flex items-center space-x-3">
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer accent-blue-600 disabled:bg-gray-200 disabled:accent-gray-400"
        />
        <span className="text-sm text-gray-700 w-20 text-right tabular-nums">
          {displayValue} {isPercentageDisplay ? unit : ''}
        </span>
      </div>
    </div>
  );
};