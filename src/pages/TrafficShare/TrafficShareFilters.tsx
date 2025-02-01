import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface TrafficShareFiltersProps {
  filters: {
    minTraffic?: number;
    maxTraffic?: number;
    urlContains?: string;
    minKeywords?: number;
    maxKeywords?: number;
  };
  onChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function TrafficShareFilters({ 
  filters, 
  onChange,
  onApply,
  onClear
}: TrafficShareFiltersProps) {
  const [urlContains, setUrlContains] = useState(filters.urlContains || '');
  const [minTraffic, setMinTraffic] = useState(filters.minTraffic?.toString() || '');
  const [maxTraffic, setMaxTraffic] = useState(filters.maxTraffic?.toString() || '');
  const [minKeywords, setMinKeywords] = useState(filters.minKeywords?.toString() || '');
  const [maxKeywords, setMaxKeywords] = useState(filters.maxKeywords?.toString() || '');

  const [showTrafficRange, setShowTrafficRange] = useState(false);
  const [showKeywordsRange, setShowKeywordsRange] = useState(false);
  const [showUrlPattern, setShowUrlPattern] = useState(false);

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];
    
    if (minTraffic || maxTraffic) {
      active.push(`Traffic: ${minTraffic || '0'}–${maxTraffic || '∞'}`);
    }
    
    if (minKeywords || maxKeywords) {
      active.push(`Keywords: ${minKeywords || '0'}–${maxKeywords || '∞'}`);
    }
    
    if (urlContains) {
      active.push(`URL: ${urlContains}`);
    }

    return active;
  };

  const handleFilterChange = () => {
    onChange({
      urlContains: urlContains || undefined,
      minTraffic: minTraffic ? parseInt(minTraffic) : undefined,
      maxTraffic: maxTraffic ? parseInt(maxTraffic) : undefined,
      minKeywords: minKeywords ? parseInt(minKeywords) : undefined,
      maxKeywords: maxKeywords ? parseInt(maxKeywords) : undefined
    });
  };

  const handleClear = () => {
    setUrlContains('');
    setMinTraffic('');
    setMaxTraffic('');
    setMinKeywords('');
    setMaxKeywords('');
    onClear();
  };

  const validateNumericInput = (value: string): boolean => {
    return value === '' || /^\d*$/.test(value);
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
                    case 'traffic':
                      setMinTraffic('');
                      setMaxTraffic('');
                      break;
                    case 'keywords':
                      setMinKeywords('');
                      setMaxKeywords('');
                      break;
                    case 'url':
                      setUrlContains('');
                      break;
                  }
                  handleFilterChange();
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
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
                    type="text"
                    value={minTraffic}
                    onChange={(e) => {
                      if (validateNumericInput(e.target.value)) {
                        setMinTraffic(e.target.value);
                      }
                    }}
                    placeholder="From"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={maxTraffic}
                    onChange={(e) => {
                      if (validateNumericInput(e.target.value)) {
                        setMaxTraffic(e.target.value);
                      }
                    }}
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

        {/* Keywords Range */}
        <div className="relative">
          <button
            onClick={() => setShowKeywordsRange(!showKeywordsRange)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Keywords Count</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showKeywordsRange && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={minKeywords}
                    onChange={(e) => {
                      if (validateNumericInput(e.target.value)) {
                        setMinKeywords(e.target.value);
                      }
                    }}
                    placeholder="From"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={maxKeywords}
                    onChange={(e) => {
                      if (validateNumericInput(e.target.value)) {
                        setMaxKeywords(e.target.value);
                      }
                    }}
                    placeholder="To"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    handleFilterChange();
                    setShowKeywordsRange(false);
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
                  value={urlContains}
                  onChange={(e) => setUrlContains(e.target.value)}
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
