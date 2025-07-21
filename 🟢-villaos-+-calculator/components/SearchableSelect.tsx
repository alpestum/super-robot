

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronUpDownIcon } from './Icons';
import Spinner from './Spinner';

interface SearchableSelectProps {
  id: string;
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  isLoading = false
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // When the value prop changes from outside, update the internal query
    if (value !== query) {
        setQuery(value || '');
    }
  }, [value]);

  const filteredOptions = useMemo(() => 
    options.filter(option => 
      option.toLowerCase().includes(query.toLowerCase())
    ), [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If the query doesn't match the current value, reset it
        if (query !== value) {
            setQuery(value || '');
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, query, value]);

  const handleSelect = (option: string) => {
    onChange(option);
    setQuery(option);
    setIsOpen(false);
  };
  
  const inputClass = "mt-0.5 block w-full pl-3 pr-10 py-2 bg-white dark:bg-dark-ios-gray-100 border border-ios-gray-300 dark:border-dark-ios-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:border-apple-blue dark:focus:border-apple-blue-light sm:text-sm text-black dark:text-dark-ios-gray-800 placeholder-ios-gray-400 dark:placeholder-dark-ios-gray-500";
  const labelClass = "block text-xs font-medium text-ios-gray-700 dark:text-dark-ios-gray-700";

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            if(e.target.value === '') onChange(''); // Clear selection if input is cleared
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isLoading ? 'Loading...' : placeholder}
          className={inputClass}
          disabled={isLoading}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
           {isLoading ? <Spinner size="small" text={null} /> : <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-dark-ios-gray-200 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className={`cursor-pointer select-none relative py-2 px-4 text-black dark:text-dark-ios-gray-800 hover:bg-apple-blue hover:text-white dark:hover:bg-apple-blue-dark ${value === option ? 'bg-apple-blue/10 dark:bg-apple-blue-dark/20' : ''}`}
              >
                {option}
              </li>
            ))
          ) : (
             <li className="cursor-default select-none relative py-2 px-4 text-ios-gray-700 dark:text-dark-ios-gray-700">
                {isLoading ? 'Loading options...' : 'No options found.'}
             </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;