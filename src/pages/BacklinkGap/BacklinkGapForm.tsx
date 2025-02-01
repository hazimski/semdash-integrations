import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Switch } from '@headlessui/react';

interface BacklinkGapFormProps {
  onSearch: (target1: string, target2: string, includeSubdomains: boolean) => void;
}

export function BacklinkGapForm({ onSearch }: BacklinkGapFormProps) {
  const [target1, setTarget1] = useState('');
  const [target2, setTarget2] = useState('');
  const [includeSubdomains, setIncludeSubdomains] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target1.trim() || !target2.trim()) return;

    setIsLoading(true);
    onSearch(target1.trim(), target2.trim(), includeSubdomains);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="target2" className="block text-sm font-medium text-gray-700 mb-1">
            Your Domain
          </label>
          <div className="relative">
            <input
              type="text"
              id="target2"
              value={target2}
              onChange={(e) => setTarget2(e.target.value)}
              placeholder="e.g., example.com"
              className="w-full p-2 pl-4 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              You
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="target1" className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Domain
          </label>
          <div className="relative">
            <input
              type="text"
              id="target1"
              value={target1}
              onChange={(e) => setTarget1(e.target.value)}
              placeholder="e.g., competitor.com"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={includeSubdomains}
            onChange={setIncludeSubdomains}
            className={`${
              includeSubdomains ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                includeSubdomains ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-700">Include Subdomains</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !target1.trim() || !target2.trim()}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Backlinks'}
      </button>
    </form>
  );
}
