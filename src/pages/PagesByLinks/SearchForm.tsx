import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchFormProps {
  onSearch: (domain: string, includeSubdomains: boolean, brokenPages: boolean, excludeQueryParams: boolean) => void;
  isLoading?: boolean;
  initialDomain?: string;
  initialIncludeSubdomains?: boolean;
  initialBrokenPages?: boolean;
  initialExcludeQueryParams?: boolean;
}

export function SearchForm({ 
  onSearch, 
  isLoading = false,
  initialDomain = '',
  initialIncludeSubdomains = true,
  initialBrokenPages = false,
  initialExcludeQueryParams = true
}: SearchFormProps) {
  const [domain, setDomain] = useState(initialDomain);
  const [includeSubdomains, setIncludeSubdomains] = useState(initialIncludeSubdomains);
  const [brokenPages, setBrokenPages] = useState(initialBrokenPages);
  const [excludeQueryParams, setExcludeQueryParams] = useState(initialExcludeQueryParams);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    onSearch(domain.trim(), includeSubdomains, brokenPages, excludeQueryParams);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-1">
          Domain
        </label>
        <input
          type="text"
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g., example.com"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Use flexbox to align all three toggle switches in a single row */}
      <div className="flex items-center space-x-6">
        {/* Include Subdomains Toggle */}
        <div className="flex items-center space-x-2">
          <div
            className={`${
              includeSubdomains ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                includeSubdomains ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
            <input
              type="checkbox"
              checked={includeSubdomains}
              onChange={() => setIncludeSubdomains(!includeSubdomains)}
              className="opacity-0 absolute inset-0"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm text-gray-300">Include Subdomains</span>
        </div>

        {/* Broken Pages Toggle */}
        <div className="flex items-center space-x-2">
          <div
            className={`${
              brokenPages ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                brokenPages ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
            <input
              type="checkbox"
              checked={brokenPages}
              onChange={() => setBrokenPages(!brokenPages)}
              className="opacity-0 absolute inset-0"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm text-gray-300">Broken Pages</span>
        </div>

        {/* Exclude Query Parameters Toggle */}
        <div className="flex items-center space-x-2">
          <div
            className={`${
              excludeQueryParams ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                excludeQueryParams ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
            <input
              type="checkbox"
              checked={excludeQueryParams}
              onChange={() => setExcludeQueryParams(!excludeQueryParams)}
              className="opacity-0 absolute inset-0"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm text-gray-300">Exclude Query Parameters</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !domain.trim()}
        className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Pages'}
      </button>
    </form>
  );
}
