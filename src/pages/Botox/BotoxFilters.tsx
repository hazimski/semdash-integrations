import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface BotoxFiltersProps {
  filters: {
    type: 'all' | 'new' | 'broken' | 'live' | 'lost' | 'dofollow' | 'nofollow';
    pageTitles?: { value: string; operator: 'and' | 'or' }[];
    urlFromPatterns?: { value: string; operator: 'and' | 'or' }[];
    urlToPatterns?: { value: string; operator: 'and' | 'or' }[];
    urlPattern?: string;
    urlType?: 'from' | 'to';
    itemType?: string;
    minKeywordsTop10?: number;
    maxKeywordsTop10?: number;
  };
  mode: 'as_is' | 'one_per_domain' | 'one_per_anchor';
  onChange: (filters: any) => void;
  onModeChange: (mode: 'as_is' | 'one_per_domain' | 'one_per_anchor') => void;
  onApply: () => void;
  onClear: () => void;
}

export function BotoxFilters({ 
  filters, 
  mode,
  onChange,
  onModeChange,
  onApply,
  onClear
}: BotoxFiltersProps) {
  const [showPageTitles, setShowPageTitles] = useState(false);
  const [showUrlFrom, setShowUrlFrom] = useState(false);
  const [showUrlTo, setShowUrlTo] = useState(false);
  const [showUrlPattern, setShowUrlPattern] = useState(false);
  const [showItemType, setShowItemType] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const MAX_INPUTS = 4;

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];
    
    if (filters.type !== 'all') {
      active.push(`Type: ${filters.type}`);
    }
    
    if (filters.pageTitles?.length) {
      const titles = filters.pageTitles.filter(t => t.value.trim());
      if (titles.length) {
        active.push(`Page Titles: ${titles.map(t => t.value).join(` ${titles[0].operator} `)}`);
      }
    }

    if (filters.urlFromPatterns?.length) {
      const patterns = filters.urlFromPatterns.filter(p => p.value.trim());
      if (patterns.length) {
        active.push(`URL From: ${patterns.map(p => p.value).join(` ${patterns[0].operator} `)}`);
      }
    }

    if (filters.urlToPatterns?.length) {
      const patterns = filters.urlToPatterns.filter(p => p.value.trim());
      if (patterns.length) {
        active.push(`URL To: ${patterns.map(p => p.value).join(` ${patterns[0].operator} `)}`);
      }
    }

    if (filters.itemType) {
      active.push(`Item Type: ${filters.itemType}`);
    }

    if (mode !== 'as_is') {
      active.push(`Mode: ${mode.replace(/_/g, ' ')}`);
    }

    return active;
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
                  // Clear the specific filter
                  const [type] = filter.toLowerCase().split(':');
                  const newFilters = { ...filters };
                  switch(type) {
                    case 'page':
                      newFilters.pageTitles = undefined;
                      break;
                    case 'url from':
                      newFilters.urlFromPatterns = undefined;
                      break;
                    case 'url to':
                      newFilters.urlToPatterns = undefined;
                      break;
                    case 'type':
                      newFilters.type = 'all';
                      break;
                    case 'item':
                      newFilters.itemType = undefined;
                      break;
                  }
                  onChange(newFilters);
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Type Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'new', 'broken', 'live', 'lost', 'dofollow', 'nofollow'].map(type => (
          <button
            key={type}
            onClick={() => onChange({ ...filters, type })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filters.type === type
                ? 'bg-[#4193f0] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Page Titles */}
        <div className="relative">
          <button
            onClick={() => setShowPageTitles(!showPageTitles)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Ref. page title</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showPageTitles && (
            <div className="absolute z-10 w-96 mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(filters.pageTitles || [{ value: '', operator: 'and' }]).map((title, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={title.value}
                        onChange={(e) => {
                          const newTitles = [...(filters.pageTitles || [])];
                          newTitles[index] = { ...title, value: e.target.value };
                          onChange({
                            ...filters,
                            pageTitles: newTitles
                          });
                        }}
                        placeholder="Enter page title"
                        className="flex-1 p-2 border rounded"
                      />
                      {index > 0 && (
                        <select
                          value={title.operator}
                          onChange={(e) => {
                            const newTitles = [...(filters.pageTitles || [])];
                            newTitles[index] = { ...title, operator: e.target.value as 'and' | 'or' };
                            onChange({
                              ...filters,
                              pageTitles: newTitles
                            });
                          }}
                          className="w-20 p-2 border rounded"
                        >
                          <option value="and">AND</option>
                          <option value="or">OR</option>
                        </select>
                      )}
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newTitles = filters.pageTitles?.filter((_, i) => i !== index);
                            onChange({
                              ...filters,
                              pageTitles: newTitles
                            });
                          }}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {(filters.pageTitles || []).length < MAX_INPUTS && (
                  <button
                    onClick={() => {
                      const newTitles = [...(filters.pageTitles || []), { value: '', operator: 'and' }];
                      onChange({
                        ...filters,
                        pageTitles: newTitles
                      });
                    }}
                    className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another Title
                  </button>
                )}
                <button
                  onClick={() => setShowPageTitles(false)}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* URL From */}
        <div className="relative">
          <button
            onClick={() => setShowUrlFrom(!showUrlFrom)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">URL From</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showUrlFrom && (
            <div className="absolute z-10 w-96 mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(filters.urlFromPatterns || [{ value: '', operator: 'and' }]).map((pattern, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={pattern.value}
                        onChange={(e) => {
                          const newPatterns = [...(filters.urlFromPatterns || [])];
                          newPatterns[index] = { ...pattern, value: e.target.value };
                          onChange({
                            ...filters,
                            urlFromPatterns: newPatterns
                          });
                        }}
                        placeholder="Enter URL pattern"
                        className="flex-1 p-2 border rounded"
                      />
                      {index > 0 && (
                        <select
                          value={pattern.operator}
                          onChange={(e) => {
                            const newPatterns = [...(filters.urlFromPatterns || [])];
                            newPatterns[index] = { ...pattern, operator: e.target.value as 'and' | 'or' };
                            onChange({
                              ...filters,
                              urlFromPatterns: newPatterns
                            });
                          }}
                          className="w-20 p-2 border rounded"
                        >
                          <option value="and">AND</option>
                          <option value="or">OR</option>
                        </select>
                      )}
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newPatterns = filters.urlFromPatterns?.filter((_, i) => i !== index);
                            onChange({
                              ...filters,
                              urlFromPatterns: newPatterns
                            });
                          }}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {(filters.urlFromPatterns || []).length < MAX_INPUTS && (
                  <button
                    onClick={() => {
                      const newPatterns = [...(filters.urlFromPatterns || []), { value: '', operator: 'and' }];
                      onChange({
                        ...filters,
                        urlFromPatterns: newPatterns
                      });
                    }}
                    className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another URL
                  </button>
                )}
                <button
                  onClick={() => setShowUrlFrom(false)}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* URL To */}
        <div className="relative">
          <button
            onClick={() => setShowUrlTo(!showUrlTo)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">URL To</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showUrlTo && (
            <div className="absolute z-10 w-96 mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(filters.urlToPatterns || [{ value: '', operator: 'and' }]).map((pattern, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={pattern.value}
                        onChange={(e) => {
                          const newPatterns = [...(filters.urlToPatterns || [])];
                          newPatterns[index] = { ...pattern, value: e.target.value };
                          onChange({
                            ...filters,
                            urlToPatterns: newPatterns
                          });
                        }}
                        placeholder="Enter URL pattern"
                        className="flex-1 p-2 border rounded"
                      />
                      {index > 0 && (
                        <select
                          value={pattern.operator}
                          onChange={(e) => {
                            const newPatterns = [...(filters.urlToPatterns || [])];
                            newPatterns[index] = { ...pattern, operator: e.target.value as 'and' | 'or' };
                            onChange({
                              ...filters,
                              urlToPatterns: newPatterns
                            });
                          }}
                          className="w-20 p-2 border rounded"
                        >
                          <option value="and">AND</option>
                          <option value="or">OR</option>
                        </select>
                      )}
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newPatterns = filters.urlToPatterns?.filter((_, i) => i !== index);
                            onChange({
                              ...filters,
                              urlToPatterns: newPatterns
                            });
                          }}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {(filters.urlToPatterns || []).length < MAX_INPUTS && (
                  <button
                    onClick={() => {
                      const newPatterns = [...(filters.urlToPatterns || []), { value: '', operator: 'and' }];
                      onChange({
                        ...filters,
                        urlToPatterns: newPatterns
                      });
                    }}
                    className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another URL
                  </button>
                )}
                <button
                  onClick={() => setShowUrlTo(false)}
                  className="w-full py-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Item Type */}
        <div className="relative">
          <button
            onClick={() => setShowItemType(!showItemType)}
            className="w-full px-4 py-2 text-left border rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between"
          >
            <span className="text-sm">Item Type</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showItemType && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border p-4">
              <div className="space-y-2">
                <select
                  value={filters.itemType || ''}
                  onChange={(e) => onChange({ ...filters, itemType: e.target.value || undefined })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Types</option>
                  <option value="anchor">Anchor</option>
                  <option value="image">Image</option>
                  <option value="meta">Meta</option>
                  <option value="canonical">Canonical</option>
                  <option value="alternate">Alternate</option>
                  <option value="redirect">Redirect</option>
                </select>
                <button
                  onClick={() => setShowItemType(false)}
                  className="w-full py-2 mt-2 text-white rounded-lg bg-[#4193f0] hover:bg-[#357ac9]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Mode:</span>
        {['as_is', 'one_per_domain', 'one_per_anchor'].map((modeType) => (
          <button
            key={modeType}
            onClick={() => onModeChange(modeType as typeof mode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              mode === modeType
                ? 'bg-[#4193f0] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {modeType.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onClear}
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
