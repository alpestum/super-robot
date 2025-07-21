
import React from 'react';
import { LOGO_URL, APP_NAME } from '../constants';

interface HeaderProps {
  isReport?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isReport = false }) => {
  return (
    <header className={`py-4 px-4 sm:px-6 lg:px-8 ${isReport ? 'bg-white text-black' : 'bg-white shadow-sm no-print'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img src={LOGO_URL} alt="The Bali Homes Logo" className="h-8 w-auto sm:h-9" />
          {!isReport && (
             <h1 className="ml-4 text-xl sm:text-2xl font-semibold text-gray-800">{APP_NAME}</h1>
          )}
        </div>
         {isReport && (
             <h1 className="ml-4 text-2xl font-bold text-black text-right">{APP_NAME}</h1>
          )}
      </div>
    </header>
  );
};

export default Header;
