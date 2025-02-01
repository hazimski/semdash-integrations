import React from 'react';

interface LocalSerpFiltersProps {
  maxResults: number;
  onMaxResultsChange: (value: number) => void;
  urlFilter: string;
  onUrlFilterChange: (value: string) => void;
}

export function LocalSerpFilters({
  maxResults,
  onMaxResultsChange,
  urlFilter,
  onUrlFilterChange
}: LocalSerpFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Results to Show
          </label>
          <div className="flex space-x-2">
            {[100, 50, 20, 10, 3].map(num => (
              <button
                key={num}
                onClick={() => onMaxResultsChange(num)}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  maxResults === num
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Top {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by URL
          </label>
          <input
            type="text"
            value={urlFilter}
            onChange={(e) => onUrlFilterChange(e.target.value)}
            placeholder="Enter URL to filter results"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}