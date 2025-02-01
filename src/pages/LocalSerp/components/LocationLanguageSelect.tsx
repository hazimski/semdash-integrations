import React from 'react';
import { LocalSerpLocation, LocalSerpLanguage } from '../types';

interface LocationLanguageSelectProps {
  locations: LocalSerpLocation[];
  selectedLocation: LocalSerpLocation;
  selectedLanguage: LocalSerpLanguage;
  onLocationChange: (location: LocalSerpLocation) => void;
  onLanguageChange: (language: LocalSerpLanguage) => void;
}

export function LocationLanguageSelect({
  locations,
  selectedLocation,
  selectedLanguage,
  onLocationChange,
  onLanguageChange
}: LocationLanguageSelectProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <select
          value={selectedLocation.code}
          onChange={(e) => {
            const location = locations.find(loc => loc.code === parseInt(e.target.value));
            if (location) {
              onLocationChange(location);
            }
          }}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Language
        </label>
        <select
          value={selectedLanguage.code}
          onChange={(e) => {
            const language = selectedLocation.languages.find(lang => lang.code === e.target.value);
            if (language) {
              onLanguageChange(language);
            }
          }}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {selectedLocation.languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}