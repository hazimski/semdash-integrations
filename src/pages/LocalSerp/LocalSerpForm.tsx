import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CompetitorInputs } from './components/CompetitorInputs';
import { DeviceSettings } from './components/DeviceSettings';
import { LocationSearchSelect } from '../../components/localSerp/LocationSearchSelect';
import { getLocations, Location } from '../../services/locations';
import { LanguageSelect } from '../../components/localSerp/LanguageSelect';
import { DEVICES, OS_OPTIONS, MAX_COMPETITORS, MAX_KEYWORDS } from './constants';

interface LocalSerpFormProps {
  onSearch: (
    domain: string,
    competitors: string[],
    keywords: string[],
    device: 'desktop' | 'mobile',
    os: string,
    locationCode: number,
    languageCode: string
  ) => void;
}

export function LocalSerpForm({ onSearch }: LocalSerpFormProps) {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [keywords, setKeywords] = useState('');
  const [device, setDevice] = useState<'desktop' | 'mobile'>(DEVICES.DESKTOP);
  const [os, setOs] = useState(OS_OPTIONS.DESKTOP.WINDOWS);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [languageCode, setLanguageCode] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const data = await getLocations();
    setLocations(data);
    
    // Set default to United States
    const us = data.find(loc => loc.location_code === 2840);
    if (us) {
      setSelectedLocation(us);
    }
  };

  const handleAddCompetitor = () => {
    if (competitors.length < MAX_COMPETITORS) {
      setCompetitors([...competitors, '']);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !keywords.trim() || !selectedLocation?.location_code) return;

    const keywordList = keywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k);

    if (keywordList.length === 0 || keywordList.length > MAX_KEYWORDS) return;

    const validCompetitors = competitors
      .map(c => c.trim())
      .filter(c => c);

    setIsLoading(true);
    onSearch(
      domain.trim(),
      validCompetitors,
      keywordList,
      device,
      os,
      selectedLocation.location_code,
      languageCode
    );
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      {/* Step 1: Domain and Competitors */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Step 1: Domain Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., example.com"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <CompetitorInputs
          competitors={competitors}
          onCompetitorChange={handleCompetitorChange}
          onAddCompetitor={handleAddCompetitor}
          onRemoveCompetitor={handleRemoveCompetitor}
        />
      </div>

      {/* Step 2: Keywords and Settings */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keywords (One per line, max {MAX_KEYWORDS})
          </label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={5}
            placeholder="Enter keywords, one per line"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <DeviceSettings
            device={device}
            os={os}
            onDeviceChange={setDevice}
            onOsChange={setOs}
          />

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <LocationSearchSelect
                value={selectedLocation?.location_code || ''}
                onChange={setSelectedLocation}
                locations={locations}
                placeholder={selectedLocation ? selectedLocation.name : "Search locations..."}
              />
            </div>
          </div>
      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <LanguageSelect
              value={languageCode}
              onChange={setLanguageCode}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || !domain.trim() || !keywords.trim() || !selectedLocation?.location_code}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze SERP'}
      </button>
    </form>
  );
}
