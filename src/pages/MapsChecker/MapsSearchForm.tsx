import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { LocationSearchSelect } from '../../components/localSerp/LocationSearchSelect';
import { LanguageSelect } from '../../components/localSerp/LanguageSelect';
import { useLocalSerpLocations } from '../../hooks/useLocalSerpLocations';

interface MapsSearchFormProps {
  onSearch: (keyword: string, location: string, language: string) => void;
}

export function MapsSearchForm({ onSearch }: MapsSearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { 
    locations, 
    selectedLocation, 
    setSelectedLocation, 
    selectedLanguage, 
    setSelectedLanguage 
  } = useLocalSerpLocations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !selectedLocation) return;
    
    setIsLoading(true);
    onSearch(
      keyword.trim(), 
      selectedLocation.location_code.toString(),
      selectedLanguage.code
    );
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
          Search Term
        </label>
        <input
          type="text"
          id="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g., pizza, coffee shop, dentist"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <LocationSearchSelect
            value={selectedLocation?.location_code || 0}
            onChange={setSelectedLocation}
            locations={locations}
            placeholder="Search locations..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <LanguageSelect
            value={selectedLanguage.code}
            onChange={(code) => {
              const language = selectedLocation.languages.find(lang => lang.code === code);
              if (language) {
                setSelectedLanguage(language);
              }
            }}
            className="w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !keyword.trim() || !selectedLocation}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Searching...' : 'Search Maps'}
      </button>
    </form>
  );
}
