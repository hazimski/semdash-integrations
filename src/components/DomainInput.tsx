
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DomainInputProps {
  onAnalyze: (domains: string[], tags?: string[]) => void;
}

export function DomainInput({ onAnalyze }: DomainInputProps) {
  const [domains, setDomains] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const validateDomains = (domainList: string[]): boolean => {
    if (domainList.length === 0) {
      setError('Please enter at least one domain');
      return false;
    }

    if (domainList.length > 1000) {
      setError('Maximum 1000 URLs allowed');
      return false;
    }

    const uniqueDomains = new Set(
      domainList.map(url => {
        try {
          const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
          return domain.replace(/^www\./, '');
        } catch {
          return url.split('/')[0].replace(/^www\./, '');
        }
      })
    );

    if (uniqueDomains.size > 100) {
      setError('URLs cannot belong to more than 100 different domains');
      return false;
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.\/]+\.[a-zA-Z]{2,}$/;
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

  const handleTagsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  const handleClear = () => {
    setDomains('');
    setTags('');
    setCount(0);
    setError('');
  };

  const handleSubmit = () => {
    const domainList = domains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d);

    if (validateDomains(domainList)) {
      const tagsList = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
      onAnalyze(domainList, tagsList);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          className={`w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter up to 1000 URLs (max 100 different domains), one per line"
          value={domains}
          onChange={handleInput}
        />
        <div className="absolute top-2 right-2 text-sm text-gray-500">
          {count}/1000
        </div>
      </div>

      <div>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add tags (comma-separated)"
          value={tags}
          onChange={handleTagsInput}
        />
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
          disabled={count === 0 || count > 1000 || !!error}
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
