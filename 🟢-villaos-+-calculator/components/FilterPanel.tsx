



import React from 'react';
import { FilterCriteria } from '../types';
import PriceRangeSlider from './PriceRangeSlider';
import ToggleSwitch from './ToggleSwitch';
import { SearchIcon } from './Icons';

interface FilterPanelProps {
  filters: FilterCriteria;
  onFilterChange: (newFilters: Partial<FilterCriteria>) => void;
  minPrice: number;
  maxPrice: number;
  uniqueLocations: string[]; // Districts
  uniqueContractTypes: string[];
  uniquePropertyTypes: string[];
  uniqueDistrictAreas: string[];
  onResetFilters: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, onFilterChange, minPrice, maxPrice, 
  uniqueLocations, uniqueContractTypes, uniquePropertyTypes, uniqueDistrictAreas, 
  onResetFilters, searchQuery, onSearchQueryChange
}) => {

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['bedrooms'].includes(name);
    onFilterChange({ [name]: isNumericField ? parseInt(value, 10) : value });
  };
  
  const handleToggleChange = (name: string, checked: boolean) => {
    onFilterChange({ [name]: checked });
  };

  const selectClassName = "w-full bg-white dark:bg-dark-ios-gray-300 border border-ios-gray-300 dark:border-dark-ios-gray-400 text-black dark:text-dark-ios-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:border-apple-blue dark:focus:border-apple-blue-light transition duration-150 text-sm";
  const labelClassName = "block text-xs font-medium text-ios-gray-700 dark:text-dark-ios-gray-700 mb-1";
  const sliderMax = maxPrice > 0 ? maxPrice : 5000000;


  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="refCodeSearch" className={labelClassName}>Search by Ref Code</label>
        <div className="relative">
            <input
                id="refCodeSearch"
                type="text"
                placeholder="e.g., KES123"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full bg-white dark:bg-dark-ios-gray-300 border border-ios-gray-300 dark:border-dark-ios-gray-400 text-black dark:text-dark-ios-gray-800 rounded-md shadow-sm py-2 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:border-apple-blue dark:focus:border-apple-blue-light transition duration-150 text-sm placeholder-ios-gray-400 dark:placeholder-dark-ios-gray-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ios-gray-400 dark:text-dark-ios-gray-500" />
        </div>
      </div>
      
      <div>
        <label htmlFor="priceMin" className={labelClassName}>Price Range (USD)</label>
        <PriceRangeSlider
            min={minPrice}
            max={sliderMax}
            minValue={filters.priceMin ?? minPrice}
            maxValue={Math.min(filters.priceMax ?? sliderMax, sliderMax)}
            onMinChange={(val) => onFilterChange({ priceMin: val })}
            onMaxChange={(val) => onFilterChange({ priceMax: val })}
            step={maxPrice > 500000 ? 10000 : 1000}
        />
      </div>

      <div>
        <label htmlFor="bedrooms" className={labelClassName}>Bedrooms</label>
        <select
          id="bedrooms"
          name="bedrooms"
          value={filters.bedrooms ?? 0}
          onChange={handleSelectChange}
          className={selectClassName}
        >
          <option value={0}>Any</option>
          {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Bed{n !== 1 ? 's' : ''}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="location" className={labelClassName}>District</label>
        <select
          id="location"
          name="location"
          value={filters.location ?? "All"}
          onChange={handleSelectChange}
          className={selectClassName}
        >
          <option value="All">All Districts</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>
      
      <div>
        <label htmlFor="districtArea" className={labelClassName}>District Area</label>
        <select
          id="districtArea"
          name="districtArea"
          value={filters.districtArea ?? "All"}
          onChange={handleSelectChange}
          className={selectClassName}
        >
          <option value="All">All Areas</option>
          {uniqueDistrictAreas.map(area => <option key={area} value={area}>{area}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="contractType" className={labelClassName}>Contract Type</label>
        <select
          id="contractType"
          name="contractType"
          value={filters.contractType ?? "All"}
          onChange={handleSelectChange}
          className={selectClassName}
        >
          <option value="All">All Contract Types</option>
          {uniqueContractTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="propertyType" className={labelClassName}>Property Type</label>
        <select
          id="propertyType"
          name="propertyType"
          value={filters.propertyType ?? "All"}
          onChange={handleSelectChange}
          className={selectClassName}
        >
          <option value="All">All Property Types</option>
          {uniquePropertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      
      <ToggleSwitch
        id="showSoldOut"
        name="showSoldOut"
        label="Include Sold Out"
        checked={filters.showSoldOut}
        onChange={(name, checked) => handleToggleChange(name, checked)}
        className="pt-1"
      />
      
      <button
        onClick={onResetFilters}
        className="w-full mt-3 py-2 px-4 bg-ios-gray-200 dark:bg-dark-ios-gray-300 hover:bg-ios-gray-300 dark:hover:bg-dark-ios-gray-400 text-black dark:text-dark-ios-gray-800 font-medium rounded-ios-button shadow-ios-subtle dark:shadow-dark-ios-subtle focus:outline-none focus:ring-2 focus:ring-apple-blue/80 dark:focus:ring-apple-blue-light/80 focus:ring-opacity-75 transition duration-150 ease-in-out text-sm"
      >
        Reset All Filters
      </button>
    </div>
  );
};

export default FilterPanel;