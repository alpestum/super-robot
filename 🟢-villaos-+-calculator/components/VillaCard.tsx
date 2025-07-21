
import React from 'react';
import { Villa } from '../types';
import { BedIcon, BathIcon, LocationMarkerIcon, PriceTagIcon, BuildingSizeIcon, ContractIcon, PropertyTypeIcon, AvailabilityIcon, CalendarDaysIcon, LinkIcon, LandAreaIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from './Icons';

interface VillaCardProps {
  villa: Villa;
  onSelect: (villa: Villa) => void;
}

const formatDisplayVillaTitle = (villa: Villa): string => {
  const { bedrooms, propertyType, district, districtArea, name } = villa;
  if (name && name !== 'Unnamed Villa' && !name.startsWith('Villa Ref') && name.length > 5) return name; // Use provided name if descriptive

  const locationPart = districtArea || district || 'Location N/A';
  let title = `${bedrooms}BR`;
  if (propertyType && propertyType.toLowerCase() !== 'n/a' && propertyType.trim() !== '') {
    title += ` ${propertyType}`; // Removed hyphen for a cleaner look
  }
  title += ` in ${locationPart}`;
  return title.replace(/\s-\s*$/, '').trim(); 
};


const VillaCard: React.FC<VillaCardProps> = ({ villa, onSelect }) => {
  const placeholderImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23e5e5ea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='24px' fill='%23aeaebe'%3ENo Image Available%3C/text%3E%3C/svg%3E";
  const isValidPrice = typeof villa.price === 'number' && isFinite(villa.price);
  const displayTitle = formatDisplayVillaTitle(villa);

  const getAvailabilityInfo = (availability?: string) => {
    switch (availability?.toLowerCase()) {
      case 'available':
        return {
          bgColor: 'bg-green-500/90 backdrop-blur-sm',
          icon: <CheckCircleIcon className="w-4 h-4" />,
        };
      case 'sold out':
        return {
          bgColor: 'bg-red-500/90 backdrop-blur-sm',
          icon: <XCircleIcon className="w-4 h-4" />,
        };
      default:
        return {
          bgColor: 'bg-yellow-500/90 backdrop-blur-sm',
          icon: <QuestionMarkCircleIcon className="w-4 h-4" />,
        };
    }
  };
  
  const availabilityInfo = getAvailabilityInfo(villa.availability);

  return (
    <div 
      className="bg-white dark:bg-dark-ios-gray-200 border border-ios-gray-200/80 dark:border-dark-ios-gray-300/80 shadow-ios-card dark:shadow-dark-ios-card rounded-xl flex flex-col cursor-pointer transform hover:shadow-ios-modal dark:hover:shadow-dark-ios-modal transition-shadow duration-200 ease-in-out"
      onClick={() => onSelect(villa)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(villa);}}
      aria-label={`View details for ${displayTitle}`}
    >
      <div className="relative">
        <img 
          src={villa.image_url || placeholderImageUrl} 
          alt={displayTitle} 
          className="w-full h-48 object-cover rounded-t-xl" 
          onError={(e) => { (e.target as HTMLImageElement).src = placeholderImageUrl; }}
        />
        <div className={`absolute top-2 left-2 flex items-center px-2 py-1 rounded-full text-white text-xs font-bold shadow-lg ${availabilityInfo.bgColor}`}>
            {availabilityInfo.icon}
            <span className="ml-1.5">{villa.id}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-black dark:text-dark-ios-gray-800 mb-0.5 truncate">
            {displayTitle}
        </h3>
        
        <div className="flex items-center text-ios-gray-600 dark:text-dark-ios-gray-600 mb-1.5 text-xs">
          <LocationMarkerIcon className="w-3.5 h-3.5 mr-1 text-ios-gray-400 dark:text-dark-ios-gray-400" />
          <span className="truncate" title={`${villa.district || ''} ${villa.districtArea ? `(${villa.districtArea})` : ''}`}>
            {villa.district || 'Unknown Location'} {villa.districtArea && `(${villa.districtArea})`}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-ios-gray-700 dark:text-dark-ios-gray-700 mb-2.5">
            {villa.propertyType && (
                <div className="flex items-center truncate" title={`Property Type: ${villa.propertyType}`}>
                    <PropertyTypeIcon className="w-3.5 h-3.5 mr-1 text-ios-gray-500 dark:text-dark-ios-gray-500 flex-shrink-0"/> {villa.propertyType}
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-black dark:text-dark-ios-gray-800 mb-3 mt-auto"> 
          <div className="flex items-center">
            <BedIcon className="w-4 h-4 mr-1.5 text-ios-gray-500 dark:text-dark-ios-gray-500" />
            <span>{villa.bedrooms} Bed{villa.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <BathIcon className="w-4 h-4 mr-1.5 text-ios-gray-500 dark:text-dark-ios-gray-500" />
            <span>{villa.bathrooms} Bath{villa.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          {villa.landSizeM2 && (
             <div className="flex items-center" title={`Land Size: ${villa.landSizeM2} m²`}>
                <LandAreaIcon className="w-4 h-4 mr-1.5 text-ios-gray-500 dark:text-dark-ios-gray-500" />
                <span>{villa.landSizeM2} m² Land</span>
            </div>
          )}
          {villa.buildingSizeM2 && (
             <div className="flex items-center" title={`Building Size: ${villa.buildingSizeM2} m²`}>
                <BuildingSizeIcon className="w-4 h-4 mr-1.5 text-ios-gray-500 dark:text-dark-ios-gray-500" />
                <span>{villa.buildingSizeM2} m² Build</span>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-2.5 border-t border-ios-gray-200 dark:border-dark-ios-gray-300 flex justify-between items-center">
          <div className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 flex items-center">
            {isValidPrice ? `$${villa.price.toLocaleString()}` : 'Price N/A'}
          </div>
           {villa.webListingLink && (
            <a 
              href={villa.webListingLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()} 
              className="text-apple-blue dark:text-apple-blue-light hover:opacity-75 transition-opacity p-1 -mr-1"
              aria-label="View original listing"
            >
              <LinkIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VillaCard;
