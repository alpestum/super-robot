
import React from 'react';
import { Villa } from '../../types';
import VillaCard from '../VillaCard';

interface SimilarVillasListProps {
  villas: Villa[];
  onVillaSelect: (villa: Villa) => void;
}

const SimilarVillasList: React.FC<SimilarVillasListProps> = ({ villas, onVillaSelect }) => {
  return (
    <div className="flex overflow-x-auto space-x-4 pb-4 -mb-4 -mx-5 px-5 similar-villas-scrollbar">
      {villas.map(villa => (
        <div key={villa.id} className="flex-shrink-0 w-80">
          <VillaCard villa={villa} onSelect={onVillaSelect} />
        </div>
      ))}
      <style>{`
        .similar-villas-scrollbar::-webkit-scrollbar { height: 7px; }
        .similar-villas-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .similar-villas-scrollbar::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .dark .similar-villas-scrollbar::-webkit-scrollbar-thumb { background: #48484A; }
        .similar-villas-scrollbar::-webkit-scrollbar-thumb:hover { background: #AEAEB2; }
        .dark .similar-villas-scrollbar::-webkit-scrollbar-thumb:hover { background: #636366; }
      `}</style>
    </div>
  );
};

export default SimilarVillasList;
