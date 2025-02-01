import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchLocations, Location } from '../../services/locations';
import { useDebounce } from '../../hooks/useDebounce';

interface LocationSearchSelectProps {
  value: string | number;
  onChange: (location: Location) => void;
  locations: Location[];
  placeholder?: string;
}

export function LocationSearchSelect({ 
  value, 
  onChange, 
  locations,
  placeholder = "Search locations..."
}: LocationSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Get selected location
  const selectedLocation = locations.find(loc => loc.location_code === value);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults(locations);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchLocations(debouncedSearch);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch, locations]);

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

  const handleSelect = (location: Location) => {
    onChange(location);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : selectedLocation?.location_name || ''}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No locations found</div>
          ) : (
            <ul className="py-1">
              {searchResults.map((location) => (
                <li
                  key={location.location_code}
                  onClick={() => handleSelect(location)}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    location.location_code === value ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{location.location_name}</span>
                    <span className="text-xs text-gray-500">{location.location_type}</span>
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
