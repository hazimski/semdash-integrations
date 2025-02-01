import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, TrendingUp } from 'lucide-react';
import { formatNumber } from '../../utils/format';
import { getDifficultyColor } from '../../utils/difficulty';
import { KeywordOptionsMenu } from '../../components/keywords/KeywordOptionsMenu';
import { KeywordListActions } from '../../components/keywords/KeywordListActions';
import { saveAs } from 'file-saver';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation } from 'react-router-dom';
import { locations } from '../../data/locations';

interface KeywordsResultTableProps {
  keywords: Array<{
    keyword: string;
    keywordDifficulty: number;
    searchVolume: number;
    backlinks: number;
    referringDomains: number;
    rank: number;
    lastUpdatedTime?: string;
    monthlySearches?: Array<{
      year: number;
      month: number;
      search_volume: number;
    }>;
  }>;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error: string | null;
  locationCode: string;
  languageCode: string;
  itemsPerPage?: number;
}

export function KeywordsResultTable({ 
  keywords = [],
  totalCount = 0,
  currentPage,
  onPageChange,
  isLoading,
  error,
  locationCode,
  languageCode,
  itemsPerPage = 100
}: KeywordsResultTableProps) {
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const locationName = locations.find(loc => 
    loc.code === locationCode
  )?.name || locationCode;

  const languageName = locations.find(loc => 
    loc.code === locationCode
  )?.languages.find(lang => 
    lang.code === languageCode
  )?.name || languageCode;

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
      'Difficulty',
      'Search Volume',
      'Backlinks',
      'Referring Domains',
      'Rank'
    ];

    const csvData = keywords.map(keyword => [
      keyword.keyword,
      keyword.keywordDifficulty,
      keyword.searchVolume,
      keyword.backlinks,
      keyword.referringDomains,
      keyword.rank
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'ai_keyword_research.csv');
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
      {selectedKeywords.size > 0 && (
        <KeywordListActions
          selectedKeywords={selectedKeywords}
          onClearSelection={() => setSelectedKeywords(new Set())}
          locationName={locationName}
          languageName={languageName}
          keywords={keywords}
        />
      )}

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Results ({formatNumber(totalCount)})
          </h2>
          <button
            onClick={handleExport}
            disabled={keywords.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

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
                Difficulty
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Search Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Backlinks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referring Domains
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword, index) => (
              <React.Fragment key={index}>
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedKeyword(expandedKeyword === keyword.keyword ? null : keyword.keyword)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedKeywords.has(keyword.keyword)}
                      onChange={() => handleKeywordSelect(keyword.keyword)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <KeywordOptionsMenu 
                      keyword={keyword.keyword}
                      locationCode={locationCode}
                      languageCode={languageCode}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span>{Math.round(keyword.keywordDifficulty)}</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getDifficultyColor(keyword.keywordDifficulty) }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.searchVolume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.backlinks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.referringDomains)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.rank)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {keyword.lastUpdatedTime ? new Date(keyword.lastUpdatedTime).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button className="text-blue-600 hover:text-blue-800">
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {expandedKeyword === keyword.keyword && keyword.monthlySearches && (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 bg-gray-50">
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={keyword.monthlySearches}>
                            <XAxis 
                              dataKey="date"
                              tickFormatter={(date) => {
                                const d = new Date(date);
                                return `${d.getMonth() + 1}/${d.getFullYear()}`;
                              }}
                            />
                            <YAxis tickFormatter={formatNumber} />
                            <Tooltip 
                              formatter={(value: number) => [formatNumber(value), 'Search Volume']}
                              labelFormatter={(label) => {
                                const d = new Date(label);
                                return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="search_volume" 
                              stroke="#2563eb" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = idx + 1;
                } else if (currentPage <= 3) {
                  pageNumber = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + idx;
                } else {
                  pageNumber = currentPage - 2 + idx;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}