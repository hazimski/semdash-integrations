import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchLocalSerpLocations, LocalSerpLocation } from '../../services/localSerpLocations';
import { useDebounce } from '../../hooks/useDebounce';

interface LocationSelectProps {
  value: number | null;
  onChange: (location: LocalSerpLocation) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSelect({
  value,
  onChange,
  placeholder = "Search locations...",
  className = ""
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<LocalSerpLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocalSerpLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Load initial data and selected location
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load initial locations (states and major cities)
        const initialLocations = await searchLocalSerpLocations('');
        setLocations(initialLocations);

        // If we have a value, load the selected location
        if (value) {
          const location = await getLocalSerpLocationByCode(value);
          if (location) {
            setSelectedLocation(location);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [value]);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      try {
        const results = await searchLocalSerpLocations(debouncedSearch);
        setLocations(results);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: LocalSerpLocation) => {
    setSelectedLocation(location);
    onChange(location);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : selectedLocation?.name || ''}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading...
            </div>
          ) : locations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No locations found
            </div>
          ) : (
            <ul className="py-1">
              {locations.map((location) => (
                <li
                  key={location.code}
                  onClick={() => handleSelect(location)}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    location.code === value ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{location.name}</span>
                    <span className="text-xs text-gray-500">{location.type}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
