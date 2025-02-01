import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatNumber, formatCurrency } from '../../utils/format';
import { KeywordOptionsMenu } from '../keywords/KeywordOptionsMenu';
import { getDifficultyColor } from '../../utils/difficulty';

// Separate interfaces into their own section for better organization
interface RankedKeyword {
  keyword: string;
  searchVolume: number;
  etv: number;
  cpc: number;
  rankAbsolute: number;
  previousRankAbsolute: number | null;
  intent: string;
  url: string;
  isFeaturedSnippet: boolean;
  keywordDifficulty: number;
}

interface RankedKeywordsPreviewTableProps {
  keywords: RankedKeyword[];
  domain: string;
  locationCode: string;
  languageCode: string;
  isLoading: boolean;
  error: string | null;
}

// Separate component for the loading state
function LoadingState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component for the error state
function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">{message}</p>
      </div>
    </div>
  );
}

// Separate component for the empty state
function EmptyState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Ranked Keywords Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            We couldn't find any ranked keywords for this domain yet.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component
export function RankedKeywordsPreviewTable({
  keywords = [],
  domain,
  locationCode,
  languageCode,
  isLoading,
  error
}: RankedKeywordsPreviewTableProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    const searchParams = new URLSearchParams({
      domain,
      location: locationCode,
      language: languageCode
    });
    navigate(`/ranked-keywords/results?${searchParams.toString()}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!keywords || keywords.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ranked Keywords
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Intent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Traffic
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                KD%
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPC
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Change
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                URL
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {keywords.map((keyword, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <KeywordOptionsMenu 
                    keyword={keyword.keyword}
                    locationCode={locationCode}
                    languageCode={languageCode}
                  />
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatNumber(keyword.searchVolume)}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg capitalize ${
                    keyword.intent === 'informational' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    keyword.intent === 'commercial' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    keyword.intent === 'navigational' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    keyword.intent === 'transactional' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {keyword.intent}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatNumber(keyword.etv)}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 dark:text-gray-100">{Math.round(keyword.keywordDifficulty)}</span>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getDifficultyColor(keyword.keywordDifficulty) }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(keyword.cpc)}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 dark:text-gray-100">{keyword.rankAbsolute}</span>
                    {keyword.isFeaturedSnippet && (
                      <img 
                        src="https://app.semdash.com/dist/img/svgexport-58.svg"
                        alt="Featured Snippet"
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  {keyword.previousRankAbsolute ? (
                    <div className={`px-3 py-1 text-sm font-medium rounded-lg ${
                      keyword.rankAbsolute < keyword.previousRankAbsolute
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : keyword.rankAbsolute > keyword.previousRankAbsolute
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-[#f7ebca] text-[#8a6e01] dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {keyword.rankAbsolute === keyword.previousRankAbsolute ? '0' :
                        `${keyword.rankAbsolute < keyword.previousRankAbsolute ? '+' : ''}${
                          Math.abs(keyword.previousRankAbsolute - keyword.rankAbsolute)
                        }`
                      }
                    </div>
                  ) : (
                    <span className="px-3 py-1 text-sm font-medium rounded-lg bg-[#f7ebca] text-[#8a6e01] dark:bg-yellow-900 dark:text-yellow-200">
                      -
                    </span>
                  )}
                </td>
                <td className="px-6 py-2">
                  <a 
                    href={keyword.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#008A43] hover:text-[#006832] dark:text-green-400 dark:hover:text-green-300 line-clamp-2 max-w-[300px]"
                  >
                    {keyword.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleViewAll}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all keywords
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}