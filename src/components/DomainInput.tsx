import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface DomainInputProps {
  onAnalyze: (domains: string[]) => void;
}

export function DomainInput({ onAnalyze }: DomainInputProps) {
  const [domains, setDomains] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const validateDomains = (domainList: string[]): boolean => {
    if (domainList.length === 0) {
      setError('Please enter at least one domain');
      return false;
    }

    if (domainList.length > 100) {
      setError('Maximum 100 domains allowed');
      return false;
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/;
    const invalidDomains = domainList.filter(domain => !domainRegex.test(domain));

    if (invalidDomains.length > 0) {
      setError(`Invalid domain format: ${invalidDomains.join(', ')}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDomains(value);
    const domainCount = value.split('\n').filter(d => d.trim()).length;
    setCount(domainCount);
    setError('');
  };

  const handleClear = () => {
    setDomains('');
    setCount(0);
    setError('');
  };

  const handleSubmit = () => {
    const domainList = domains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d);

    if (validateDomains(domainList)) {
      onAnalyze(domainList);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          className={`w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter up to 100 domains/subdomains, one per line"
          value={domains}
          onChange={handleInput}
        />
        <div className="absolute top-2 right-2 text-sm text-gray-500">
          {count}/100
        </div>
        {domains && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-12 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={handleSubmit}
          disabled={count === 0 || count > 100 || !!error}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Compare
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
