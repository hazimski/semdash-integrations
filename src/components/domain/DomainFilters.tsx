import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

interface DomainFiltersProps {
  filters: {
    intent: string;
    minPosition?: number;
    maxPosition?: number;
    minVolume?: number;
    maxVolume?: number;
    urlPattern?: string;
    minTraffic?: number;
    maxTraffic?: number;
    minCpc?: number;
    maxCpc?: number;
    ignoreSynonyms?: boolean;
    onlyFeaturedSnippets?: boolean;
  };
  onChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DomainFilters({ filters, onChange, onApply, onClear }: DomainFiltersProps) {
  const [intent, setIntent] = useState(filters.intent);
  const [minPosition, setMinPosition] = useState(filters.minPosition?.toString() || '');
  const [maxPosition, setMaxPosition] = useState(filters.maxPosition?.toString() || '');
  const [minVolume, setMinVolume] = useState(filters.minVolume?.toString() || '');
  const [maxVolume, setMaxVolume] = useState(filters.maxVolume?.toString() || '');
  const [urlPattern, setUrlPattern] = useState(filters.urlPattern || '');
  const [minTraffic, setMinTraffic] = useState(filters.minTraffic?.toString() || '');
  const [maxTraffic, setMaxTraffic] = useState(filters.maxTraffic?.toString() || '');
  const [minCpc, setMinCpc] = useState(filters.minCpc?.toString() || '');
  const [maxCpc, setMaxCpc] = useState(filters.maxCpc?.toString() || '');
  const [ignoreSynonyms, setIgnoreSynonyms] = useState(filters.ignoreSynonyms || false);
  const [onlyFeaturedSnippets, setOnlyFeaturedSnippets] = useState(filters.onlyFeaturedSnippets || false);

  const [showPositionRange, setShowPositionRange] = useState(false);
  const [showVolumeRange, setShowVolumeRange] = useState(false);
  const [showIntent, setShowIntent] = useState(false);
  const [showCpcRange, setShowCpcRange] = useState(false);
  const [showTrafficRange, setShowTrafficRange] = useState(false);
  const [showUrlPattern, setShowUrlPattern] = useState(false);

  // Active filters display
  const getActiveFilters = () => {
    const active = [];
    
    if (minVolume || maxVolume) {
      active.push(`Vol: ${minVolume || '0'}–${maxVolume || '∞'}`);
    }
    
    if (minPosition || maxPosition) {
      active.push(`KD: ${minPosition || '0'}–${maxPosition || '∞'}%`);
    }
    
    if (intent) {
      active.push(`Intent: ${intent}`);
    }
    
    if (minCpc || maxCpc) {
      active.push(`CPC: ${minCpc || '0'}–${maxCpc || '∞'} (USD)`);
    }

    if (minTraffic || maxTraffic) {
      active.push(`Traffic: ${minTraffic || '0'}–${maxTraffic || '∞'}`);
    }

    if (urlPattern) {
      active.push(`URL: ${urlPattern}`);
    }

    return active;
  };

  const handleFilterChange = () => {
    onChange({
      intent: intent || undefined,
      minPosition: minPosition ? parseInt(minPosition) : undefined,
      maxPosition: maxPosition ? parseInt(maxPosition) : undefined,
      minVolume: minVolume ? parseInt(minVolume) : undefined,
      maxVolume: maxVolume ? parseInt(maxVolume) : undefined,
      urlPattern: urlPattern || undefined,
      minTraffic: minTraffic ? parseInt(minTraffic) : undefined,
      maxTraffic: maxTraffic ? parseInt(maxTraffic) : undefined,
      minCpc: minCpc ? parseFloat(minCpc) : undefined,
      maxCpc: maxCpc ? parseFloat(maxCpc) : undefined,
      ignoreSynonyms,
      onlyFeaturedSnippets
    });
  };

  const handleClear = () => {
    setIntent('');
    setMinPosition('');
    setMaxPosition('');
    setMinVolume('');
    setMaxVolume('');
    setUrlPattern('');
    setMinTraffic('');
    setMaxTraffic('');
    setMinCpc('');
    setMaxCpc('');
    setIgnoreSynonyms(false);
    setOnlyFeaturedSnippets(false);
    onClear();
  };

  useEffect(() => {
    handleFilterChange();
  }, [
    intent,
    minPosition,
    maxPosition,
    minVolume,
    maxVolume,
    urlPattern,
    minTraffic,
    maxTraffic,
    minCpc,
    maxCpc,
    ignoreSynonyms,
    onlyFeaturedSnippets
  ]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Active Filters */}
      {getActiveFilters().length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {getActiveFilters().map((filter, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-sm"
            >
              <span>{filter}</span>
              <button
                onClick={() => {
                  // Clear the specific filter
                  const [type] = filter.toLowerCase().split(':');
                  switch(type) {
                    case 'vol':
                      setMinVolume('');
                      setMaxVolume('');
                      break;
                    case 'kd':
                      setMinPosition('');
                      setMaxPosition('');
                      break;
                    case 'intent':
                      setIntent('');
                      break;
                    case 'cpc':
                      setMinCpc('');
                      setMaxCpc('');
                      break;
                    case 'traffic':
                      setMinTraffic('');
                      setMaxTraffic('');
                      break;
                    case 'url':
                      setUrlPattern('');
                      break;
                  }
                  handleFilterChange();
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Position Range */}
        <div className="relative">
          <button
            onClick={() => setShowPositionRange(!showPositionRange)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Position</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showPositionRange && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={minPosition}
                    onChange={(e) => setMinPosition(e.target.value)}
                    placeholder="From"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    value={maxPosition}
                    onChange={(e) => setMaxPosition(e.target.value)}
                    placeholder="To"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    handleFilterChange();
                    setShowPositionRange(false);
                  }}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Volume Range */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeRange(!showVolumeRange)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Volume</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showVolumeRange && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={minVolume}
                    onChange={(e) => setMinVolume(e.target.value)}
                    placeholder="From"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    value={maxVolume}
                    onChange={(e) => setMaxVolume(e.target.value)}
                    placeholder="To"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    handleFilterChange();
                    setShowVolumeRange(false);
                  }}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Intent Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowIntent(!showIntent)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Intent</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showIntent && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-2">
                {['informational', 'commercial', 'navigational', 'transactional'].map((intentType) => (
                  <label key={intentType} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={intent === intentType}
                      onChange={() => {
                        setIntent(intent === intentType ? '' : intentType);
                        handleFilterChange();
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">{intentType}</span>
                  </label>
                ))}
                <button
                  onClick={() => setShowIntent(false)}
                  className="w-full py-2 mt-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CPC Range */}
        <div className="relative">
          <button
            onClick={() => setShowCpcRange(!showCpcRange)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">CPC (USD)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showCpcRange && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={minCpc}
                    onChange={(e) => setMinCpc(e.target.value)}
                    placeholder="From"
                    className="w-full p-2 border rounded"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={maxCpc}
                    onChange={(e) => setMaxCpc(e.target.value)}
                    placeholder="To"
                    className="w-full p-2 border rounded"
                    step="0.01"
                  />
                </div>
                <button
                  onClick={() => {
                    handleFilterChange();
                    setShowCpcRange(false);
                  }}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Traffic Range */}
        <div className="relative">
          <button
            onClick={() => setShowTrafficRange(!showTrafficRange)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Traffic Range</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showTrafficRange && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={minTraffic}
                    onChange={(e) => setMinTraffic(e.target.value)}
                    placeholder="From"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    value={maxTraffic}
                    onChange={(e) => setMaxTraffic(e.target.value)}
                    placeholder="To"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    handleFilterChange();
                    setShowTrafficRange(false);
                  }}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* URL Pattern */}
        <div className="relative">
          <button
            onClick={() => setShowUrlPattern(!showUrlPattern)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">URL Pattern</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showUrlPattern && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <input
                  type="text"
                  value={urlPattern}
                  onChange={(e) => setUrlPattern(e.target.value)}
                  placeholder="Filter by URL"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => {
                    handleFilterChange();
                    setShowUrlPattern(false);
                  }}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ignore Synonyms Switch */}
        <div className="flex items-center justify-between px-4 py-2 border rounded-lg">
          <Switch
            checked={ignoreSynonyms}
            onChange={(checked) => {
              setIgnoreSynonyms(checked);
              handleFilterChange();
            }}
            className={`${ignoreSynonyms ? 'bg-[#4193f0]' : 'bg-gray-200'} 
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span
              className={`${
                ignoreSynonyms ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm">Ignore Synonyms</span>
        </div>

        {/* Featured Snippets Switch */}
        <div className="flex items-center justify-between px-4 py-2 border rounded-lg">
          <Switch
            checked={onlyFeaturedSnippets}
            onChange={(checked) => {
              setOnlyFeaturedSnippets(checked);
              handleFilterChange();
            }}
            className={`${onlyFeaturedSnippets ? 'bg-[#4193f0]' : 'bg-gray-200'} 
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span
              className={`${
                onlyFeaturedSnippets ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm">Featured Snippets</span>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Clear Filters
        </button>
        <button
          onClick={onApply}
          className="px-4 py-2 bg-[#4193f0] text-white text-sm font-medium rounded-lg hover:bg-[#357ac9] focus:outline-none"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
