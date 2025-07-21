
import React from 'react';
import { HomeIcon } from './Icons';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
    onHomeClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHomeClick }) => {
    return (
        <nav className="bg-white/90 dark:bg-dark-ios-gray-200/90 backdrop-blur-lg fixed top-0 left-0 right-0 z-40 border-b border-ios-gray-200/80 dark:border-dark-ios-gray-300/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <button 
                            onClick={onHomeClick}
                            className="flex items-center gap-2 text-xl font-bold text-apple-blue dark:text-apple-blue-light"
                            aria-label="Back to listings"
                        >
                            <HomeIcon className="w-6 h-6"/>
                            <span className="hidden sm:inline">VillaOS</span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
