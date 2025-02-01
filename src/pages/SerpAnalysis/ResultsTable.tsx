import React from 'react';
import { formatNumber } from '../../utils/format';
import { AlertCircle } from 'lucide-react';

interface SerpResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  title: string;
  description: string;
  url: string;
  domain: string;
  etv: number;
  rank_info?: {
    page_rank?: number;
    main_domain_rank?: number;
  };
  backlinks_info?: {
    referring_domains?: number;
    referring_main_domains?: number;
    backlinks?: number;
    dofollow?: number;
  };
  rank_changes?: {
    previous_rank_absolute?: number;
    is_new?: boolean;
    is_up?: boolean;
    is_down?: boolean;
  };
}

interface ResultsTableProps {
  data: SerpResult[];
  isLoading: boolean;
  error: string | null;
}

export function ResultsTable({ data = [], isLoading, error }: ResultsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <p>No SERP results found</p>
        </div>
      </div>
    );
  }

  const organicResults = data.filter(item => 
    item.type === 'organic' || item.type === 'featured_snippet'
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referring Domains
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Backlinks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dofollow
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ETV
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organicResults.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">{item.rank_group}</span>
                    {item.type === 'featured_snippet' && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.description || '-'}
                    </div>
                    <div className="text-sm text-blue-600 hover:text-blue-800">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.domain || '-'}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.rank_info?.page_rank || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.rank_info?.main_domain_rank || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.backlinks_info?.referring_domains ? 
                    formatNumber(item.backlinks_info.referring_domains) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.backlinks_info?.backlinks ? 
                    formatNumber(item.backlinks_info.backlinks) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.backlinks_info?.dofollow ? 
                    formatNumber(item.backlinks_info.dofollow) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.etv ? formatNumber(item.etv) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.rank_changes ? (
                    <div className="flex items-center space-x-1">
                      {item.rank_changes.is_new && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          New
                        </span>
                      )}
                      {item.rank_changes.is_up && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          ↑ {Math.abs(item.rank_absolute - (item.rank_changes.previous_rank_absolute || 0))}
                        </span>
                      )}
                      {item.rank_changes.is_down && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          ↓ {Math.abs(item.rank_absolute - (item.rank_changes.previous_rank_absolute || 0))}
                        </span>
                      )}
                      {!item.rank_changes.is_new && !item.rank_changes.is_up && !item.rank_changes.is_down && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          -
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      -
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
