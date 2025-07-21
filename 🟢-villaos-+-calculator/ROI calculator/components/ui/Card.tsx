import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className, actions }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className || ''}`}>
      {title && (
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};