

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Villa, FilterCriteria } from '../types';
import VillaList from '../components/VillaList';
import FilterPanel from '../components/FilterPanel';
import Spinner from '../components/Spinner';
import { FilterIcon, RefreshIcon, PlusCircleIcon, SearchIcon, CheckCircleIcon } from '../components/Icons';
import VillaCardSkeleton from '../components/VillaCardSkeleton';
import ThemeToggle from '../components/ThemeToggle';

const ITEMS_PER_PAGE = 9;
const SLIDER_UPPER_BOUND = 1000000;

interface ListingsPageProps {
  allVillas: Villa[];
  onVillaSelect: (villa: Villa) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onAddVilla: () => void;
  successMessage: string | null;
}

const ListingsPage: React.FC<ListingsPageProps> = ({
  allVillas, onVillaSelect, isLoading, onRefresh, onAddVilla, successMessage
}) => {
  const [filteredVillas, setFilteredVillas] = useState<Villa[]>([]);
  const [displayedVillas, setDisplayedVillas] = useState<Villa[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialFilters: FilterCriteria = {
    priceMin: 0,
    priceMax: undefined,
    bedrooms: 0,
    location: "All", 
    contractType: "All",
    propertyType: "All",
    districtArea: "All",
    showSoldOut: false,
  };
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [uniqueContractTypes, setUniqueContractTypes] = useState<string[]>([]);
  const [uniquePropertyTypes, setUniquePropertyTypes] = useState<string[]>([]);
  const [uniqueDistrictAreas, setUniqueDistrictAreas] = useState<string[]>([]);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayedVillas.length < filteredVillas.length) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, displayedVillas.length, filteredVillas.length]);

  useEffect(() => {
    let currentCalculatedMinPrice = 0;
    let currentCalculatedMaxPrice = 5000000;
    
    if (allVillas.length > 0) {
      const validPrices = allVillas.map(v => v.price).filter(p => typeof p === 'number' && isFinite(p) && p > 0);
      if (validPrices.length > 0) {
          currentCalculatedMinPrice = Math.min(...validPrices);
          currentCalculatedMaxPrice = Math.max(...validPrices);
      }
      
      setUniqueLocations([...new Set(allVillas.map(v => v.district).filter(Boolean) as string[])].sort());
      setUniqueContractTypes([...new Set(allVillas.map(v => v.contractType).filter(Boolean) as string[])].sort());
      setUniquePropertyTypes([...new Set(allVillas.map(v => v.propertyType).filter(Boolean) as string[])].sort());
      setUniqueDistrictAreas([...new Set(allVillas.map(v => v.districtArea).filter(Boolean) as string[])].sort());
    }
    
    setMinPrice(currentCalculatedMinPrice);
    setMaxPrice(currentCalculatedMaxPrice);
    setFilters(prev => ({ 
      ...prev, 
      priceMin: prev.priceMin === initialFilters.priceMin ? currentCalculatedMinPrice : prev.priceMin,
      priceMax: prev.priceMax === undefined ? currentCalculatedMaxPrice : prev.priceMax 
    }));
  }, [allVillas]);

  const applyFilters = useCallback(() => {
    let villasToFilter = [...allVillas];

    if (searchQuery.trim()) {
      villasToFilter = villasToFilter.filter(villa =>
          (villa.id?.toLowerCase() || '').includes(searchQuery.trim().toLowerCase()) ||
          (villa.name?.toLowerCase() || '').includes(searchQuery.trim().toLowerCase())
      );
    }
    
    if (!filters.showSoldOut) {
        villasToFilter = villasToFilter.filter(v => v.availability?.toLowerCase() !== 'sold out');
    }

    if (typeof filters.priceMin === 'number') {
        villasToFilter = villasToFilter.filter(v => typeof v.price === 'number' && v.price >= filters.priceMin!);
    }

    if (typeof filters.priceMax === 'number' && filters.priceMax < maxPrice) {
        villasToFilter = villasToFilter.filter(v => typeof v.price === 'number' && v.price <= filters.priceMax!);
    } else if (typeof filters.priceMax === 'number' && filters.priceMax >= maxPrice) {
    }
    
    if (filters.bedrooms && filters.bedrooms > 0) {
        villasToFilter = villasToFilter.filter(v => v.bedrooms === filters.bedrooms);
    }
    if (filters.location && filters.location !== "All") {
        villasToFilter = villasToFilter.filter(v => v.district === filters.location);
    }
    if (filters.contractType && filters.contractType !== "All") {
        villasToFilter = villasToFilter.filter(v => v.contractType === filters.contractType);
    }
    if (filters.propertyType && filters.propertyType !== "All") {
        villasToFilter = villasToFilter.filter(v => v.propertyType === filters.propertyType);
    }
    if (filters.districtArea && filters.districtArea !== "All") {
        villasToFilter = villasToFilter.filter(v => v.districtArea === filters.districtArea);
    }

    setFilteredVillas(villasToFilter);
    setCurrentPage(1);
}, [allVillas, filters, searchQuery, maxPrice]);

  useEffect(() => { applyFilters(); }, [filters, allVillas, applyFilters]);

  useEffect(() => {
    setDisplayedVillas(filteredVillas.slice(0, currentPage * ITEMS_PER_PAGE));
  }, [currentPage, filteredVillas]);

  const handleFilterChange = (newFilters: Partial<FilterCriteria>) => {
    const tempFilters = { ...filters, ...newFilters };
    
    if (newFilters.priceMax !== undefined && newFilters.priceMax >= SLIDER_UPPER_BOUND) {
      tempFilters.priceMax = maxPrice; 
    }
    
    setFilters(tempFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      ...initialFilters,
      priceMin: minPrice,
      priceMax: maxPrice, 
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-ios-gray-100 dark:bg-dark-ios-gray-100 text-black dark:text-dark-ios-gray-800">
      <div className="px-4 md:px-6 lg:px-8 py-6">
        
        {successMessage && (
            <div 
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center w-full max-w-sm p-4 space-x-3 bg-white border border-ios-gray-200/80 dark:border-dark-ios-gray-300/80 rounded-xl shadow-lg dark:bg-dark-ios-gray-200 animate-fadeInOut"
                role="alert"
            >
                <div className="flex-shrink-0">
                    <CheckCircleIcon className="w-7 h-7 text-green-500 dark:text-green-400" />
                </div>
                <div className="text-sm font-medium text-black dark:text-dark-ios-gray-800">{successMessage}</div>
            </div>
        )}
         <style>{`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateY(-20px) translateX(-50%); }
            10%, 90% { opacity: 1; transform: translateY(0) translateX(-50%); }
          }
          .animate-fadeInOut {
            animation: fadeInOut 3s ease-in-out forwards;
          }
        `}</style>

        <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black dark:text-dark-ios-gray-800">All Properties ({filteredVillas.length})</h2>
            <div className="flex items-center gap-2">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  aria-label="Refresh villas"
                  className="p-2.5 bg-white dark:bg-dark-ios-gray-300 hover:bg-ios-gray-200 dark:hover:bg-dark-ios-gray-400 text-black dark:text-dark-ios-gray-700 rounded-ios-button shadow-ios-subtle dark:shadow-dark-ios-subtle focus:outline-none focus:ring-2 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50"
                >
                  <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onAddVilla} 
                  disabled={isLoading}
                  className="flex items-center justify-center px-4 py-2 bg-apple-blue dark:bg-apple-blue-dark hover:bg-apple-blue/90 dark:hover:bg-apple-blue-dark/90 text-white font-medium rounded-ios-button shadow-ios-subtle dark:shadow-dark-ios-subtle focus:outline-none focus:ring-2 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 text-sm"
                >
                  <PlusCircleIcon className="w-5 h-5 mr-1.5" />
                  Add Villa
                </button>
            </div>
        </div>
        <div className="lg:flex lg:gap-6">
          <aside className="lg:w-1/4 mb-6 lg:mb-0">
            <div className="p-4 bg-white dark:bg-dark-ios-gray-200 shadow-ios-card dark:shadow-dark-ios-card rounded-xl sticky top-20 border border-ios-gray-200/70 dark:border-dark-ios-gray-300/70">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-dark-ios-gray-800 flex items-center">
                <FilterIcon className="w-5 h-5 mr-2 text-apple-blue dark:text-apple-blue-light" /> Filters
              </h3>
              <FilterPanel
                filters={filters} 
                onFilterChange={handleFilterChange} 
                minPrice={minPrice}
                maxPrice={SLIDER_UPPER_BOUND} 
                uniqueLocations={uniqueLocations} 
                uniqueContractTypes={uniqueContractTypes}
                uniquePropertyTypes={uniquePropertyTypes} 
                uniqueDistrictAreas={uniqueDistrictAreas}
                onResetFilters={handleResetFilters}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </div>
          </aside>
          <main className="lg:w-3/4">
            {isLoading && displayedVillas.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => <VillaCardSkeleton key={index} />)}
              </div>
            ) : (
              <>
                <VillaList villas={displayedVillas} onVillaSelect={onVillaSelect} />
                {displayedVillas.length > 0 && displayedVillas.length < filteredVillas.length && (
                  <div ref={loadMoreRef} className="h-10 w-full" />
                )}
                {!isLoading && allVillas.length > 0 && displayedVillas.length === 0 && (
                   <div className="text-center py-10 text-ios-gray-500 dark:text-dark-ios-gray-500 text-base bg-white dark:bg-dark-ios-gray-200 border border-ios-gray-200 dark:border-dark-ios-gray-300 rounded-lg shadow-sm dark:shadow-dark-ios-subtle">
                     No villas match your current criteria.
                   </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
       <footer className="text-center py-6 mt-10 text-ios-gray-500 dark:text-dark-ios-gray-500 text-xs border-t border-ios-gray-200 dark:border-dark-ios-gray-300">
        Villa OS &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default ListingsPage;