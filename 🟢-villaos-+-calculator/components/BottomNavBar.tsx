
import React from 'react';
import { ChartPieIcon, QueueListIcon } from './Icons';

interface BottomNavBarProps {
  currentView: 'dashboard' | 'listings';
  onNavigate: (view: 'dashboard' | 'listings') => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: ChartPieIcon },
    { view: 'listings', label: 'Listings', icon: QueueListIcon },
  ] as const;

  const itemClass = "flex flex-col items-center justify-center flex-1 transition-colors duration-200 ease-in-out";
  const activeClass = "text-apple-blue dark:text-apple-blue-light";
  const inactiveClass = "text-ios-gray-600 dark:text-dark-ios-gray-600 hover:text-apple-blue/80 dark:hover:text-apple-blue-light/80";

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-dark-ios-gray-200/80 backdrop-blur-lg border-t border-ios-gray-200 dark:border-dark-ios-gray-300 shadow-lg z-30">
      <div className="flex justify-around items-stretch h-full">
        {navItems.map(item => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`${itemClass} ${isActive ? activeClass : inactiveClass}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="w-6 h-6 mb-0.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
