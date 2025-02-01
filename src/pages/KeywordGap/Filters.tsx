import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface KeywordGapFiltersProps {
  filters: {
    intersections: boolean;
    ignoreSynonyms: boolean;
    intent: string;
    keyword?: string;
    minKD?: number;
    maxKD?: number;
    minVolume?: number;
    maxVolume?: number;
  };
  onChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function KeywordGapFilters({ 
  filters, 
  onChange,
  onApply,
  onClear
}: KeywordGapFiltersProps) {
  const [keyword, setKeyword] = useState(filters.keyword || '');
  const [intent, setIntent] = useState(filters.intent || '');
  const [minVolume, setMinVolume] = useState(filters.minVolume?.toString() || '');
  const [maxVolume, setMaxVolume] = useState(filters.maxVolume?.toString() || '');
  const [minKD, setMinKD] = useState(filters.minKD?.toString() || '');
  const [maxKD, setMaxKD] = useState(filters.maxKD?.toString() || '');
  const [intersections, setIntersections] = useState(filters.intersections);
  const [ignoreSynonyms, setIgnoreSynonyms] = useState(filters.ignoreSynonyms);

  const [showVolumeRange, setShowVolumeRange] = useState(false);
  const [showKDRange, setShowKDRange] = useState(false);
  const [showIntent, setShowIntent] = useState(false);
  const [showKeyword, setShowKeyword] = useState(false);

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];
    
    if (minVolume || maxVolume) {
      active.push(`Vol: ${minVolume || '0'}–${maxVolume || '∞'}`);
    }
    
    if (minKD || maxKD) {
      active.push(`KD: ${minKD || '0'}–${maxKD || '∞'}%`);
    }
    
    if (intent) {
      active.push(`Intent: ${intent}`);
    }
    
    if (keyword) {
      active.push(`Keyword: ${keyword}`);
    }

    if (intersections) {
      active.push('Shared Keywords');
    }

    if (ignoreSynonyms) {
      active.push('Ignore Synonyms');
    }

    return active;
  };

  const handleFilterChange = (newFilters: any) => {
    onChange({
      ...filters,
      ...newFilters
    });
  };

  const handleClear = () => {
    setKeyword('');
    setIntent('');
    setMinVolume('');
    setMaxVolume('');
    setMinKD('');
    setMaxKD('');
    setIntersections(false);
    setIgnoreSynonyms(false);
    onClear();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
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
                  const [type] = filter.toLowerCase().split(':');
                  switch(type) {
                    case 'vol':
                      setMinVolume('');
                      setMaxVolume('');
                      handleFilterChange({ minVolume: undefined, maxVolume: undefined });
                      break;
                    case 'kd':
                      setMinKD('');
                      setMaxKD('');
                      handleFilterChange({ minKD: undefined, maxKD: undefined });
                      break;
                    case 'intent':
                      setIntent('');
                      handleFilterChange({ intent: undefined });
                      break;
                    case 'keyword':
                      setKeyword('');
                      handleFilterChange({ keyword: undefined });
                      break;
                    case 'shared':
                      setIntersections(false);
                      handleFilterChange({ intersections: false });
                      break;
                    case 'ignore':
                      setIgnoreSynonyms(false);
                      handleFilterChange({ ignoreSynonyms: false });
                      break;
                  }
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Type Selection */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            setIntersections(false);
            handleFilterChange({ intersections: false });
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            !intersections
              ? 'bg-[#4193f0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Missing
        </button>
        <button
          onClick={() => {
            setIntersections(true);
            handleFilterChange({ intersections: true });
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            intersections
              ? 'bg-[#4193f0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Shared
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
                    handleFilterChange({
                      minVolume: minVolume ? parseInt(minVolume) : undefined,
                      maxVolume: maxVolume ? parseInt(maxVolume) : undefined
                    });
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

        {/* KD Range */}
        <div className="relative">
          <button
            onClick={() => setShowKDRange(!showKDRange)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">KD %</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showKDRange && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={minKD}
                    onChange={(e) => setMinKD(e.target.value)}
                    placeholder="From"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    value={maxKD}
                    onChange={(e) => setMaxKD(e.target.value)}
                    placeholder="To"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    handleFilterChange({
                      minKD: minKD ? parseInt(minKD) : undefined,
                      maxKD: maxKD ? parseInt(maxKD) : undefined
                    });
                    setShowKDRange(false);
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
                        const newIntent = intent === intentType ? '' : intentType;
                        setIntent(newIntent);
                        handleFilterChange({ intent: newIntent || undefined });
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

        {/* Keyword Filter */}
        <div className="relative">
          <button
            onClick={() => setShowKeyword(!showKeyword)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Keyword Filter</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showKeyword && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Filter by keyword"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => {
                    handleFilterChange({ keyword: keyword || undefined });
                    setShowKeyword(false);
                  }}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Options */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={ignoreSynonyms}
            onChange={(e) => {
              setIgnoreSynonyms(e.target.checked);
              handleFilterChange({ ignoreSynonyms: e.target.checked });
            }}
            className="rounded border-gray-300 text-[#4193f0] focus:ring-[#4193f0]"
          />
          <span className="text-sm">Ignore Synonyms</span>
        </label>
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
