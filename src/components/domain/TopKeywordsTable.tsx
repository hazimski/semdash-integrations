import React from 'react';
import { formatNumber, formatCurrency } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface TopKeywordsTableProps {
  keywords: Array<{
    keyword_data: {
      keyword: string;
      search_intent_info: {
        main_intent: string;
      };
      keyword_info: {
        search_volume: number;
        cpc: number;
      };
    };
    ranked_serp_element: {
      serp_item: {
        rank_absolute: number;
      };
    };
  }>;
  totalCount: number;
  isLoading: boolean;
  currentParams?: {
    domain: string;
    location: string;
    language: string;
  } | null;
}

export function TopKeywordsTable({ keywords = [], totalCount = 0, isLoading, currentParams }: TopKeywordsTableProps) {
  const navigate = useNavigate();

  // Take only top 6 keywords for overview
  const displayKeywords = currentParams ? keywords.slice(0, 6) : keywords;

  const handleViewAll = () => {
    if (currentParams) {
      const searchParams = new URLSearchParams({
        domain: currentParams.domain,
        location: currentParams.location,
        language: currentParams.language
      });
      navigate(`/domain?${searchParams.toString()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Organic Keywords
          </h2>
          <span className="text-sm text-gray-500">
            Total: {formatNumber(totalCount)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Search Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPC $
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayKeywords.map((keyword, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.keyword_data.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {keyword.keyword_data.search_intent_info?.main_intent?.toLowerCase() || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.ranked_serp_element.serp_item.rank_absolute}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(keyword.keyword_data.keyword_info.search_volume)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(keyword.keyword_data.keyword_info.cpc)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentParams && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            View all keywords
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
