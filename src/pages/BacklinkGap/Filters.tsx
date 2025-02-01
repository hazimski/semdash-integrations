import React, { useState } from 'react';

interface BacklinkGapFiltersProps {
  filters: {
    type: 'all' | 'new' | 'broken' | 'live' | 'lost' | 'dofollow' | 'nofollow';
    domainFrom?: string;
    domainTo?: string;
  };
  onChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function BacklinkGapFilters({ filters, onChange, onApply, onClear }: BacklinkGapFiltersProps) {
  const [domainFrom, setDomainFrom] = useState(filters.domainFrom || '');
  const [domainTo, setDomainTo] = useState(filters.domainTo || '');

  const filterTypes = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'broken', label: 'Broken' },
    { value: 'live', label: 'Live' },
    { value: 'lost', label: 'Lost' },
    { value: 'dofollow', label: 'Do Follow' },
    { value: 'nofollow', label: 'No Follow' }
  ] as const;

  const handleFilterTypeChange = (type: typeof filters.type) => {
    onChange({
      ...filters,
      type,
      domainFrom: domainFrom || undefined,
      domainTo: domainTo || undefined
    });
  };

  const handleDomainChange = (field: 'from' | 'to', value: string) => {
    const newValue = value.trim();
    if (field === 'from') {
      setDomainFrom(value);
      onChange({
        ...filters,
        domainFrom: newValue || undefined,
        domainTo: domainTo || undefined
      });
    } else {
      setDomainTo(value);
      onChange({
        ...filters,
        domainFrom: domainFrom || undefined,
        domainTo: newValue || undefined
      });
    }
  };

  const handleClear = () => {
    setDomainFrom('');
    setDomainTo('');
    onClear();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div className="flex flex-wrap gap-2">
        {filterTypes.map(type => (
          <button
            key={type.value}
            onClick={() => handleFilterTypeChange(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filters.type === type.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Domain From
          </label>
          <input
            type="text"
            value={domainFrom}
            onChange={(e) => handleDomainChange('from', e.target.value)}
            placeholder="e.g., example.com"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Domain To
          </label>
          <input
            type="text"
            value={domainTo}
            onChange={(e) => handleDomainChange('to', e.target.value)}
            placeholder="e.g., example.com"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
