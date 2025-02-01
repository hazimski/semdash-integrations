import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SeedKeywordFiltersProps {
  filters: {
    includeKeywords?: { value: string; operator: 'and' | 'or' }[];
    excludeKeywords?: { value: string; operator: 'and' | 'or' }[];
    intent?: string;
    minVolume?: number;
    maxVolume?: number;
    minCpc?: number;
    maxCpc?: number;
    minKd?: number;
    maxKd?: number;
  };
  onChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function SeedKeywordFilters({ 
  filters, 
  onChange,
  onApply,
  onClear
}: SeedKeywordFiltersProps) {
  const [includeKeywords, setIncludeKeywords] = useState<{ value: string; operator: 'and' | 'or' }[]>(
    filters.includeKeywords || [{ value: '', operator: 'and' }]
  );
  const [excludeKeywords, setExcludeKeywords] = useState<{ value: string; operator: 'and' | 'or' }[]>(
    filters.excludeKeywords || [{ value: '', operator: 'and' }]
  );
  const [intent, setIntent] = useState(filters.intent || '');
  const [minVolume, setMinVolume] = useState(filters.minVolume?.toString() || '');
  const [maxVolume, setMaxVolume] = useState(filters.maxVolume?.toString() || '');
  const [minCpc, setMinCpc] = useState(filters.minCpc?.toString() || '');
  const [maxCpc, setMaxCpc] = useState(filters.maxCpc?.toString() || '');
  const [minKd, setMinKd] = useState(filters.minKd?.toString() || '');
  const [maxKd, setMaxKd] = useState(filters.maxKd?.toString() || '');
  const [showVolume, setShowVolume] = useState(false);
  const [showCpc, setShowCpc] = useState(false);
  const [showKd, setShowKd] = useState(false);
  const [showIntent, setShowIntent] = useState(false);
  const [showIncludeKeywords, setShowIncludeKeywords] = useState(false);
  const [showExcludeKeywords, setShowExcludeKeywords] = useState(false);

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    
    // Each include keyword counts as 1
    count += includeKeywords.filter(k => k.value.trim()).length;
    
    // Each exclude keyword counts as 1
    count += excludeKeywords.filter(k => k.value.trim()).length;
    
    // Intent counts as 1
    if (intent) count += 1;
    
    // Volume range counts as 2 (min and max)
    if (minVolume) count += 1;
    if (maxVolume) count += 1;
    
    // CPC range counts as 2 (min and max)
    if (minCpc) count += 1;
    if (maxCpc) count += 1;
    
    // KD range counts as 2 (min and max)
    if (minKd) count += 1;
    if (maxKd) count += 1;
    
    return count;
  };

  const MAX_FILTERS = 8;

  // Update local state when props change
  useEffect(() => {
    setIncludeKeywords(filters.includeKeywords || [{ value: '', operator: 'and' }]);
    setExcludeKeywords(filters.excludeKeywords || [{ value: '', operator: 'and' }]);
    setIntent(filters.intent || '');
    setMinVolume(filters.minVolume?.toString() || '');
    setMaxVolume(filters.maxVolume?.toString() || '');
    setMinCpc(filters.minCpc?.toString() || '');
    setMaxCpc(filters.maxCpc?.toString() || '');
    setMinKd(filters.minKd?.toString() || '');
    setMaxKd(filters.maxKd?.toString() || '');
  }, [filters]);

  const getActiveFilters = () => {
    const active = [];
    
    const activeIncludeKeywords = includeKeywords.filter(k => k.value.trim());
    if (activeIncludeKeywords.length > 0) {
      active.push(`Include: ${activeIncludeKeywords.map(k => k.value).join(` ${activeIncludeKeywords[0].operator} `)}`);
    }
    
    const activeExcludeKeywords = excludeKeywords.filter(k => k.value.trim());
    if (activeExcludeKeywords.length > 0) {
      active.push(`Exclude: ${activeExcludeKeywords.map(k => k.value).join(` ${activeExcludeKeywords[0].operator} `)}`);
    }
    
    if (intent) {
      active.push(`Intent: ${intent}`);
    }
    
    if (minVolume || maxVolume) {
      active.push(`Volume: ${minVolume || '0'} - ${maxVolume || 'Max'}`);
    }
    
    if (minCpc || maxCpc) {
      active.push(`CPC: $${minCpc || '0'} - $${maxCpc || 'Max'}`);
    }
    
    if (minKd || maxKd) {
      active.push(`KD: ${minKd || '0'} - ${maxKd || 'Max'}`);
    }
    
    return active;
  };

  const handleFilterChange = () => {
    onChange({
      includeKeywords: includeKeywords.filter(k => k.value.trim()).length > 0 ? includeKeywords : undefined,
      excludeKeywords: excludeKeywords.filter(k => k.value.trim()).length > 0 ? excludeKeywords : undefined,
      intent: intent || undefined,
      minVolume: minVolume.trim() ? parseInt(minVolume) : undefined,
      maxVolume: maxVolume.trim() ? parseInt(maxVolume) : undefined,
      minCpc: minCpc.trim() ? parseFloat(minCpc) : undefined,
      maxCpc: maxCpc.trim() ? parseFloat(maxCpc) : undefined,
      minKd: minKd.trim() ? parseInt(minKd) : undefined,
      maxKd: maxKd.trim() ? parseInt(maxKd) : undefined
    });
  };

  const handleClear = () => {
    setIncludeKeywords([{ value: '', operator: 'and' }]);
    setExcludeKeywords([{ value: '', operator: 'and' }]);
    setIntent('');
    setMinVolume('');
    setMaxVolume('');
    setMinCpc('');
    setMaxCpc('');
    setMinKd('');
    setMaxKd('');
    onClear();
  };

  const validateNumericInput = (value: string): boolean => {
    return value === '' || /^[0-9]*$/.test(value);
  };

  const validateDecimalInput = (value: string): boolean => {
    return value === '' || /^(\d*\.?\d{0,2}|\.\d{0,2})$/.test(value);
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
                    case 'include':
                      setIncludeKeywords([{ value: '', operator: 'and' }]);
                      onChange({
                        ...filters,
                        includeKeywords: undefined
                      });
                      break;
                    case 'exclude':
                      setExcludeKeywords([{ value: '', operator: 'and' }]);
                      onChange({
                        ...filters,
                        excludeKeywords: undefined
                      });
                      break;
                    case 'intent':
                      setIntent('');
                      onChange({
                        ...filters,
                        intent: undefined
                      });
                      break;
                    case 'volume':
                      setMinVolume('');
                      setMaxVolume('');
                      onChange({
                        ...filters,
                        minVolume: undefined,
                        maxVolume: undefined
                      });
                      break;
                    case 'cpc':
                      setMinCpc('');
                      setMaxCpc('');
                      onChange({
                        ...filters,
                        minCpc: undefined,
                        maxCpc: undefined
                      });
                      break;
                    case 'kd':
                      setMinKd('');
                      setMaxKd('');
                      onChange({
                        ...filters,
                        minKd: undefined,
                        maxKd: undefined
                      });
                      break;
                  }
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {/* Include Keywords Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowIncludeKeywords(!showIncludeKeywords)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Include Keywords</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showIncludeKeywords && (
            <div className="absolute z-10 w-96 mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                {includeKeywords.map((kw, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={kw.value}
                      onChange={(e) => {
                        if (getActiveFilterCount() >= MAX_FILTERS && !kw.value.trim()) {
                          toast.error('Maximum 8 filters allowed');
                          return;
                        }
                        const newKeywords = [...includeKeywords];
                        newKeywords[index].value = e.target.value;
                        setIncludeKeywords(newKeywords);
                        handleFilterChange();
                      }}
                      placeholder="Enter keyword"
                      className="flex-1 p-2 border rounded"
                    />
                    {index > 0 && (
                      <select
                        value={kw.operator}
                        onChange={(e) => {
                          const newKeywords = [...includeKeywords];
                          newKeywords[index].operator = e.target.value as 'and' | 'or';
                          setIncludeKeywords(newKeywords);
                          handleFilterChange();
                        }}
                        className="w-20 p-2 border rounded"
                      >
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newKeywords = includeKeywords.filter((_, i) => i !== index);
                        setIncludeKeywords(newKeywords.length ? newKeywords : [{ value: '', operator: 'and' }]);
                        handleFilterChange();
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {includeKeywords.length < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    setIncludeKeywords([...includeKeywords, { value: '', operator: 'and' }]);
                  }}
                  className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Another Keyword
                </button>
              )}
                <button
                  onClick={() => setShowIncludeKeywords(false)}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Exclude Keywords Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExcludeKeywords(!showExcludeKeywords)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Exclude Keywords</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showExcludeKeywords && (
            <div className="absolute z-10 w-96 mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                {excludeKeywords.map((kw, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={kw.value}
                      onChange={(e) => {
                        if (getActiveFilterCount() >= MAX_FILTERS && !kw.value.trim()) {
                          toast.error('Maximum 8 filters allowed');
                          return;
                        }
                        const newKeywords = [...excludeKeywords];
                        newKeywords[index].value = e.target.value;
                        setExcludeKeywords(newKeywords);
                        handleFilterChange();
                      }}
                      placeholder="Enter keyword to exclude"
                      className="flex-1 p-2 border rounded"
                    />
                    {index > 0 && (
                      <select
                        value={kw.operator}
                        onChange={(e) => {
                          const newKeywords = [...excludeKeywords];
                          newKeywords[index].operator = e.target.value as 'and' | 'or';
                          setExcludeKeywords(newKeywords);
                          handleFilterChange();
                        }}
                        className="w-20 p-2 border rounded"
                      >
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newKeywords = excludeKeywords.filter((_, i) => i !== index);
                        setExcludeKeywords(newKeywords.length ? newKeywords : [{ value: '', operator: 'and' }]);
                        handleFilterChange();
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setExcludeKeywords([...excludeKeywords, { value: '', operator: 'and' }]);
                  }}
                  className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Another Keyword
                </button>
                <button
                  onClick={() => setShowExcludeKeywords(false)}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Intent Dropdown */}


        {/* Volume Range */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVolume(!showVolume)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Volume</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showVolume && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={minVolume}
                    onChange={(e) => {
                      if (getActiveFilterCount() >= MAX_FILTERS && !minVolume) {
                        toast.error('Maximum 8 filters allowed');
                        return;
                      }
                      const value = e.target.value;
                      if (!validateNumericInput(value)) return;
                      setMinVolume(value);
                    }}
                    onBlur={handleFilterChange}
                    placeholder="Min"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={maxVolume}
                    onChange={(e) => {
                      if (getActiveFilterCount() >= MAX_FILTERS && !maxVolume) {
                        toast.error('Maximum 8 filters allowed');
                        return;
                      }
                      const value = e.target.value;
                      if (!validateNumericInput(value)) return;
                      setMaxVolume(value);
                    }}
                    onBlur={handleFilterChange}
                    placeholder="Max"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => setShowVolume(false)}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
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
            type="button"
            onClick={() => setShowCpc(!showCpc)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">CPC (USD)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showCpc && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={minCpc}
                    onChange={(e) => {
                      if (getActiveFilterCount() >= MAX_FILTERS && !minCpc) {
                        toast.error('Maximum 8 filters allowed');
                        return;
                      }
                      const value = e.target.value;
                      if (!validateDecimalInput(value)) return;
                      setMinCpc(value);
                    }}
                    onBlur={handleFilterChange}
                    placeholder="Min"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={maxCpc}
                    onChange={(e) => {
                      if (getActiveFilterCount() >= MAX_FILTERS && !maxCpc) {
                        toast.error('Maximum 8 filters allowed');
                        return;
                      }
                      const value = e.target.value;
                      if (!validateDecimalInput(value)) return;
                      setMaxCpc(value);
                    }}
                    onBlur={handleFilterChange}
                    placeholder="Max"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => setShowCpc(false)}
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
            type="button"
            onClick={() => setShowKd(!showKd)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">KD%</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showKd && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={minKd}
                    onChange={(e) => {
                      if (getActiveFilterCount() >= MAX_FILTERS && !minKd) {
                        toast.error('Maximum 8 filters allowed');
                        return;
                      }
                      const value = e.target.value;
                      if (!validateNumericInput(value)) return;
                      setMinKd(value);
                    }}
                    onBlur={handleFilterChange}
                    placeholder="Min"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={maxKd}
                    onChange={(e) => {
                      if (getActiveFilterCount() >= MAX_FILTERS && !maxKd) {
                        toast.error('Maximum 8 filters allowed');
                        return;
                      }
                      const value = e.target.value;
                      if (!validateNumericInput(value)) return;
                      setMaxKd(value);
                    }}
                    onBlur={handleFilterChange}
                    placeholder="Max"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => setShowKd(false)}
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
