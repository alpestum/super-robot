import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string | null; // Set to null to hide text
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', text = "Loading...", className = '' }) => {
  let dimension = 'h-12 w-12';
  if (size === 'small') dimension = 'h-6 w-6';
  if (size === 'large') dimension = 'h-16 w-16';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-live="polite">
        <svg aria-hidden="true" className={`animate-spin text-apple-blue dark:text-apple-blue-light ${dimension}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text && <p className="mt-2 text-ios-gray-600 dark:text-dark-ios-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default Spinner;