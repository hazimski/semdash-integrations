import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalSerpForm } from './LocalSerpForm';
import { LocalSerpHistory } from './LocalSerpHistory';
import { History, Search } from 'lucide-react';

export function LocalSerp() {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = (
    domain: string, 
    competitors: string[], 
    keywords: string[], 
    device: 'desktop' | 'mobile',
    os: string,
    locationCode: number,
    languageCode: string
  ) => {
    const searchParams = new URLSearchParams({
      domain,
      competitors: JSON.stringify(competitors),
      keywords: JSON.stringify(keywords),
      device,
      os,
      locationCode: locationCode.toString(),
      languageCode
    });
    navigate(`/local-serp/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col px-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {showHistory ? 'Search History' : 'Local SERP Analysis'}
          </h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {showHistory ? (
              <>
                <Search className="w-4 h-4 mr-2" />
                New Search
              </>
            ) : (
              <>
                <History className="w-4 h-4 mr-2" />
                View History
              </>
            )}
          </button>
        </div>

        {showHistory ? (
          <LocalSerpHistory />
        ) : (
          <>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analyze local search results for multiple keywords across different devices and locations
            </p>
            <LocalSerpForm onSearch={handleSearch} />
          </>
        )}
      </div>
    </div>
  );
}