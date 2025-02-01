import React, { useState } from 'react';
import { KeywordOptionsMenu } from '../../components/keywords/KeywordOptionsMenu';
import { KeywordListActions } from '../../components/keywords/KeywordListActions';
import { TableHeader } from '../../components/keywords/TableHeader';
import { TablePagination } from '../../components/keywords/TablePagination';
import { formatNumber, formatCurrency } from '../../utils/format';
import { getDifficultyColor } from '../../utils/difficulty';
import { KeywordTrendChart } from '../../components/domain/KeywordTrendChart';
import { useLocation } from 'react-router-dom';
import { locations } from '../../data/locations';

interface RankedKeyword {
  keyword: string;
  searchVolume: number;
  etv: number;
  cpc: number;
  rankAbsolute: number;
  previousRankAbsolute: number | null;
  intent: string;
  lastUpdatedTime: string;
  url: string;
  isFeaturedSnippet: boolean;
  keywordDifficulty: number;
  monthlySearches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
}

interface RankedKeywordsTableProps {
  keywords: RankedKeyword[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  currentSort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  isLoading: boolean;
  error: string | null;
  itemsPerPage?: number;
}

export function RankedKeywordsTable({ 
  keywords = [],
  totalCount = 0,
  currentPage,
  onPageChange,
  onSort,
  currentSort,
  isLoading,
  error,
  itemsPerPage = 100
}: RankedKeywordsTableProps) {
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const currentLocationCode = searchParams.get('location') || '';
  const currentLanguageCode = searchParams.get('language') || '';

  const locationName = locations.find(loc => 
    loc.code === currentLocationCode
  )?.name || currentLocationCode;

  const languageName = locations.find(loc => 
    loc.code === currentLocationCode
  )?.languages.find(lang => 
    lang.code === currentLanguageCode
  )?.name || currentLanguageCode;

  const handleKeywordSelect = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleExport = () => {
    if (!keywords.length) return;

    const headers = [
      'Keyword',
      'Volume',
      'Intent',
      'Traffic',
      'KD%',
      'CPC',
      'Position',
      'Change',
      'URL',
      'Last Updated'
    ];

    const csvData = keywords.map(keyword => [
      keyword.keyword,
      keyword.searchVolume,
      keyword.intent,
      keyword.etv,
      Math.round(keyword.keywordDifficulty),
      keyword.cpc,
      keyword.rankAbsolute,
      keyword.previousRankAbsolute ? 
        (keyword.rankAbsolute - keyword.previousRankAbsolute) : '',
      keyword.url,
      new Date(keyword.lastUpdatedTime).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ranked_keywords.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <KeywordListActions
        selectedKeywords={selectedKeywords}
        onClearSelection={() => setSelectedKeywords(new Set())}
        locationName={locationName}
        languageName={languageName}
        keywords={keywords}
      />

      <TableHeader 
        totalCount={totalCount}
        onExport={handleExport}
        disabled={keywords.length === 0}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedKeywords.size === keywords.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedKeywords(new Set(keywords.map(k => k.keyword)));
                    } else {
                      setSelectedKeywords(new Set());
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Traffic
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                KD%
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPC
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword, index) => (
              <React.Fragment key={index}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedKeywords.has(keyword.keyword)}
                      onChange={() => handleKeywordSelect(keyword.keyword)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <KeywordOptionsMenu 
                      keyword={keyword.keyword}
                      locationCode={currentLocationCode}
                      languageCode={currentLanguageCode}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.searchVolume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg capitalize ${
                      keyword.intent === 'informational' ? 'bg-blue-100 text-blue-800' :
                      keyword.intent === 'commercial' ? 'bg-purple-100 text-purple-800' :
                      keyword.intent === 'navigational' ? 'bg-green-100 text-green-800' :
                      keyword.intent === 'transactional' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {keyword.intent}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.etv)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{Math.round(keyword.keywordDifficulty)}</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getDifficultyColor(keyword.keywordDifficulty) }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(keyword.cpc)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{keyword.rankAbsolute}</span>
                      {keyword.isFeaturedSnippet && (
                        <img 
                          src="https://app.semdash.com/dist/img/svgexport-58.svg"
                          alt="Featured Snippet"
                          className="w-4 h-4"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {keyword.previousRankAbsolute ? (
                      <div className={`px-3 py-1 text-sm font-medium rounded-lg ${
                        keyword.rankAbsolute < keyword.previousRankAbsolute
                          ? 'bg-green-100 text-green-800'
                          : keyword.rankAbsolute > keyword.previousRankAbsolute
                          ? 'bg-red-100 text-red-800'
                          : 'bg-[#f7ebca] text-[#8a6e01]'
                      }`}>
                        {keyword.rankAbsolute === keyword.previousRankAbsolute ? '0' :
                          `${keyword.rankAbsolute < keyword.previousRankAbsolute ? '+' : ''}${
                            Math.abs(keyword.previousRankAbsolute - keyword.rankAbsolute)
                          }`
                        }
                      </div>
                    ) : (
                      <span className="px-3 py-1 text-sm font-medium rounded-lg bg-[#f7ebca] text-[#8a6e01]">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={keyword.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#008A43] hover:text-[#006832] line-clamp-2 max-w-[300px]"
                    >
                      {keyword.url}
                    </a>
                  </td>
                </tr>
                {expandedKeyword === keyword.keyword && (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 bg-gray-50">
                      <div className="h-[200px]">
                        <KeywordTrendChart keyword={keyword} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}