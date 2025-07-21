
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-ios-gray-600 dark:text-dark-ios-gray-600 hover:bg-ios-gray-200 dark:hover:bg-dark-ios-gray-300"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
