import React from 'react';

const VillaCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-dark-ios-gray-200 border border-ios-gray-200 dark:border-dark-ios-gray-300 shadow-lg dark:shadow-dark-ios-card rounded-lg overflow-hidden flex flex-col">
      <div className="w-full h-56 bg-ios-gray-300 dark:bg-dark-ios-gray-400 animate-pulse"></div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-6 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-1/2 mb-3 animate-pulse"></div>
        
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-3">
          <div className="h-3 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-4/6 animate-pulse"></div>
          <div className="h-3 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-full col-span-2 animate-pulse"></div>
          <div className="h-3 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-full col-span-2 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm mb-4 mt-auto">
          <div className="h-4 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="mt-auto pt-3 border-t border-ios-gray-200 dark:border-dark-ios-gray-300 flex justify-between items-center">
          <div className="h-6 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded w-28 animate-pulse"></div>
          <div className="h-5 w-5 bg-ios-gray-300 dark:bg-dark-ios-gray-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default VillaCardSkeleton;