import React from 'react';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

interface LocalSerpResultsTableProps {
  results: Array<{
    keyword: string;
    check_url: string;
    datetime: string;
    items: Array<{
      rank_absolute: number;
      url: string;
      datetime: string;
    }>;
  }>;
  isLoading: boolean;
  domain: string;
  competitors: string[];
}

export function LocalSerpResultsTable({
  results,
  isLoading,
  domain,
  competitors
}: LocalSerpResultsTableProps) {
  if (!results?.length) {
    return null;
  }

  const allDomains = [domain, ...competitors].filter(Boolean);

  const highlightCell = (url: string) => {
    try {
      const urlDomain = new URL(url).hostname.replace('www.', '');
      if (domain && urlDomain === domain.replace('www.', '')) {
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200';
      }
      if (competitors.some(comp => comp && urlDomain === comp.replace('www.', ''))) {
        return 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-200';
      }
    } catch (e) {
      console.error('Invalid URL:', url);
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-4 min-w-full p-4">
        {results.map((result, columnIndex) => (
          <div 
            key={columnIndex}
            className="flex-none w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            {/* Column Header with Keyword and Search Icon */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {result.keyword}
                  </h3>
                  <a
                    href={result.check_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                    title="View in Google"
                  >
                    <Search className="w-4 h-4" />
                  </a>
                </div>
                {/* Sub-headers */}
                <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div>URL</div>
                  <div>{format(new Date(result.datetime), 'MMM d, yyyy')}</div>
                </div>
              </div>
            </div>

            {/* Column Content */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {result.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className={`px-4 py-3 ${highlightCell(item.url)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
                      >
                        {item.url}
                      </a>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                      {item.rank_absolute}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}