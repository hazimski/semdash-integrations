import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { locations } from '../../data/locations';

interface PerformanceFormProps {
  onAnalyze: (target: string, location: string, language: string) => void;
}

export function PerformanceForm({ onAnalyze }: PerformanceFormProps) {
  const [target, setTarget] = useState('');
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
    if (!target.trim()) return;

    setIsLoading(true);
    onAnalyze(target.trim(), location, language);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
          Domain URL
        </label>
        <input
          type="text"
          id="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g., example.com"
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

      <button
        type="submit"
        disabled={isLoading || !target.trim()}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Performance'}
      </button>
    </form>
  );
}
