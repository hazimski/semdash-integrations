import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface PageSearchFormProps {
  onSearch: (domain: string, includeSubdomains: boolean, brokenPages: boolean, excludeQueryParams: boolean) => void;
  isLoading?: boolean;
  initialDomain?: string;
  initialIncludeSubdomains?: boolean;
  initialBrokenPages?: boolean;
  initialExcludeQueryParams?: boolean;
}

export function PageSearchForm({ 
  onSearch, 
  isLoading = false,
  initialDomain = '',
  initialIncludeSubdomains = true,
  initialBrokenPages = false,
  initialExcludeQueryParams = true
}: PageSearchFormProps) {
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
    <div className="bg-[#1a1d24] rounded-lg p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Domain
        </label>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g., example.com"
          className="w-full p-2 bg-[#2a2e35] border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeSubdomains}
            onChange={(e) => setIncludeSubdomains(e.target.checked)}
            className="rounded border-gray-600 bg-[#2a2e35] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1a1d24]"
          />
          <span className="text-sm text-gray-300">Include Subdomains</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={brokenPages}
            onChange={(e) => setBrokenPages(e.target.checked)}
            className="rounded border-gray-600 bg-[#2a2e35] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1a1d24]"
          />
          <span className="text-sm text-gray-300">Broken Pages</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={excludeQueryParams}
            onChange={(e) => setExcludeQueryParams(e.target.checked)}
            className="rounded border-gray-600 bg-[#2a2e35] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1a1d24]"
          />
          <span className="text-sm text-gray-300">Exclude Query Parameters</span>
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !domain.trim()}
        className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Pages'}
      </button>
    </div>
  );
}