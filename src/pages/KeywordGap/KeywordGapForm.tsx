import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { locations } from '../../data/locations';

interface KeywordGapFormProps {
  onSearch: (target1: string, target2: string, location: string, language: string) => void;
}

export function KeywordGapForm({ onSearch }: KeywordGapFormProps) {
  const [target1, setTarget1] = useState('');
  const [target2, setTarget2] = useState('');
  const [location, setLocation] = useState('2840'); // US by default
  const [language, setLanguage] = useState('en');
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
    if (!target1.trim() || !target2.trim()) return;

    setIsLoading(true);
    onSearch(target1.trim(), target2.trim(), location, language);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="target2" className="block text-sm font-medium text-gray-700 mb-1">
            Your Domain
          </label>
          <div className="relative">
            <input
              type="text"
              id="target2"
              value={target2}
              onChange={(e) => setTarget2(e.target.value)}
              placeholder="e.g., example.com"
              className="w-full p-2 pl-4 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              You
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="target1" className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Domain
          </label>
          <div className="relative">
            <input
              type="text"
              id="target1"
              value={target1}
              onChange={(e) => setTarget1(e.target.value)}
              placeholder="e.g., competitor.com"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
        </div>
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

      <button
        type="submit"
        disabled={isLoading || !target1.trim() || !target2.trim()}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Keywords'}
      </button>
    </form>
  );
}
