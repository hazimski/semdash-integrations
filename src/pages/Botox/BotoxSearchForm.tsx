import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Switch } from '@headlessui/react';

interface BotoxSearchFormProps {
  onSearch: (target: string, includeSubdomains: boolean) => void;
}

export function BotoxSearchForm({ onSearch }: BotoxSearchFormProps) {
  const [target, setTarget] = useState('');
  const [includeSubdomains, setIncludeSubdomains] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;

    setIsLoading(true);
    onSearch(target.trim(), includeSubdomains);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
          Domain URL
        </label>
        <input
          type="text"
          id="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Domain should be without https. Page should be with https"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
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
        disabled={isLoading || !target.trim()}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Backlinks'}
      </button>
    </form>
  );
}
