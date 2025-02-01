import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { locations } from '../../data/locations';
import { cleanDomain } from '../../utils/url';

interface DomainFormProps {
  onAnalyze: (domain: string, location: string, language: string) => void;
  isLoading: boolean;
  initialDomain?: string;
  initialLocation?: string;
  initialLanguage?: string;
}

export function DomainForm({ 
  onAnalyze, 
  isLoading, 
  initialDomain = '', 
  initialLocation = '2840', 
  initialLanguage = 'en' 
}: DomainFormProps) {
  const [domain, setDomain] = useState(initialDomain);
  const [location, setLocation] = useState(initialLocation);
  const [language, setLanguage] = useState(initialLanguage);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      const cleanedDomain = cleanDomain(domain);
      if (!cleanedDomain) {
        setError('Please enter a valid domain');
        return;
      }
      onAnalyze(cleanedDomain, location, language);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid domain format');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
          Domain
        </label>
        <div className="space-y-1">
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setError(null);
            }}
            placeholder="e.g., example.com"
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
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
        disabled={isLoading || !domain.trim()}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Domain'}
      </button>
    </form>
  );
}
