
import React from 'react';
import { Villa } from '../types';
import VillaCard from './VillaCard';

interface VillaListProps {
  villas: Villa[];
  onVillaSelect: (villa: Villa) => void;
}

const VillaList: React.FC<VillaListProps> = ({ villas, onVillaSelect }) => {
  if (villas.length === 0) {
    return <div className="text-center py-10 text-ios-gray-600 dark:text-dark-ios-gray-600 text-base bg-ios-gray-100 dark:bg-dark-ios-gray-200 border border-ios-gray-200 dark:border-dark-ios-gray-300 rounded-xl shadow-sm dark:shadow-dark-ios-subtle">No villas match your current criteria.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"> {}
      {villas.map(villa => (
        <VillaCard key={String(villa.id)} villa={villa} onSelect={onVillaSelect} />
      ))}
    </div>
  );
};

export default VillaList;
