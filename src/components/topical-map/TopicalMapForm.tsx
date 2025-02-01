import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface TopicalMapFormProps {
  onSubmit: (keyword: string) => void;
  isLoading?: boolean;
}

export function TopicalMapForm({ onSubmit, isLoading = false }: TopicalMapFormProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSubmit(keyword.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Generate Your Topical Map</h2>
          <p className="text-gray-600">
            Enter your main topic or keyword to discover related content opportunities
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              Main Topic or Keyword
            </label>
            <input
              type="text"
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., SEO Marketing"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Topical Map'}
          </button>
        </div>
      </div>
    </form>
  );
}