import React, { useState } from 'react';

type FilterType = 'all' | 'lost' | 'dofollow' | 'nofollow';

interface ReferringDomainsFiltersProps {
  filters: {
    type: FilterType;
    domain?: string;
  };
  onChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function ReferringDomainsFilters({ 
  filters, 
  onChange,
  onApply,
  onClear
}: ReferringDomainsFiltersProps) {
  const [domain, setDomain] = useState(filters.domain || '');

  const filterTypes = [
    { value: 'all', label: 'All' },
    { value: 'lost', label: 'Lost' },
    { value: 'dofollow', label: 'Do Follow' },
    { value: 'nofollow', label: 'No Follow' }
  ] as const;

  const handleFilterTypeChange = (type: FilterType) => {
    onChange({
      ...filters,
      type,
      domain: domain || undefined
    });
  };

  const handleDomainChange = (value: string) => {
    const newValue = value.trim();
    setDomain(value);
    onChange({
      ...filters,
      domain: newValue || undefined
    });
  };

  const handleClear = () => {
    setDomain('');
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Referring Domain
        </label>
        <input
          type="text"
          value={domain}
          onChange={(e) => handleDomainChange(e.target.value)}
          placeholder="e.g., blog"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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
