import React, { useState } from 'react';

interface BulkTrafficShareFiltersProps {
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

export function BulkTrafficShareFilters({ 
  filters, 
  onChange,
  onApply,
  onClear
}: BulkTrafficShareFiltersProps) {
  const [urlContains, setUrlContains] = useState(filters.urlContains || '');
  const [minTraffic, setMinTraffic] = useState(filters.minTraffic?.toString() || '');
  const [maxTraffic, setMaxTraffic] = useState(filters.maxTraffic?.toString() || '');
  const [minKeywords, setMinKeywords] = useState(filters.minKeywords?.toString() || '');
  const [maxKeywords, setMaxKeywords] = useState(filters.maxKeywords?.toString() || '');

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

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Contains
          </label>
          <input
            type="text"
            value={urlContains}
            onChange={(e) => {
              setUrlContains(e.target.value);
              handleFilterChange();
            }}
            placeholder="Filter by domain"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Traffic Range
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minTraffic}
              onChange={(e) => {
                setMinTraffic(e.target.value);
                handleFilterChange();
              }}
              placeholder="Min"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span>-</span>
            <input
              type="number"
              value={maxTraffic}
              onChange={(e) => {
                setMaxTraffic(e.target.value);
                handleFilterChange();
              }}
              placeholder="Max"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keywords Count
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minKeywords}
              onChange={(e) => {
                setMinKeywords(e.target.value);
                handleFilterChange();
              }}
              placeholder="Min"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span>-</span>
            <input
              type="number"
              value={maxKeywords}
              onChange={(e) => {
                setMaxKeywords(e.target.value);
                handleFilterChange();
              }}
              placeholder="Max"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
