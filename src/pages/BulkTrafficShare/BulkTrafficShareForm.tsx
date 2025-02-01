import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { locations } from '../../data/locations';

interface BulkTrafficShareFormProps {
  onSearch: (keywords: string[], location: string, language: string, includeSubdomains: boolean) => void;
}

export function BulkTrafficShareForm({ onSearch }: BulkTrafficShareFormProps) {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('2840'); // US by default
  const [language, setLanguage] = useState('en');
  const [includeSubdomains, setIncludeSubdomains] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const selectedLocation = locations.find(loc => loc.code === location);
  const availableLanguages = selectedLocation?.languages || [];

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    const newLocationData = locations.find(loc => loc.code === newLocation);
    if (newLocationData && !newLocationData.languages.some(lang => lang.code === language)) {
      setLanguage(newLocationData.languages[0].code);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    const keywordList = keywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k);

    if (keywordList.length === 0) return;

    setIsLoading(true);
    onSearch(keywordList, location, language, includeSubdomains);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
          Keywords (one per line)
        </label>
        <textarea
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Enter keywords, one per line"
          rows={5}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location"
            value={location}
            onChange={handleLocationChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {locations.map(loc => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={includeSubdomains}
            onChange={setIncludeSubdomains}
            className={`${
              includeSubdomains ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                includeSubdomains ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-700">Include Subdomains</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !keywords.trim()}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Traffic Share'}
      </button>
    </form>
  );
}
