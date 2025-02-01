import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, ListPlus } from 'lucide-react';
import { formatNumber, formatCurrency } from '../../utils/format';
import { getDifficultyColor } from '../../utils/difficulty';
import { KeywordTrendChart } from './KeywordTrendChart';
import { KeywordListActions } from '../keywords/KeywordListActions';
import { useLocation } from 'react-router-dom';
import { locations } from '../../data/locations';
import { saveAs } from 'file-saver';

interface KeywordsResultTableProps {
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    cpc: number;
    keywordDifficulty: number;
    intent: string;
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
  itemsPerPage?: number;
}

export function KeywordsResultTable({
  keywords = [],
  totalCount = 0,
  currentPage,
  onPageChange,
  isLoading,
  error,
  itemsPerPage = 100
}: KeywordsResultTableProps) {
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

  const handleSelectAll = () => {
    if (selectedKeywords.size === keywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(keywords.map(k => k.keyword)));
    }
  };

  const handleExport = () => {
    if (!keywords.length) return;

    const selectedData = keywords.filter(k => selectedKeywords.has(k.keyword));
    const dataToExport = selectedData.length ? selectedData : keywords;

    const headers = [
      'Keyword',
      'Search Volume',
      'CPC',
      'Keyword Difficulty',
      'Intent',
      'Backlinks',
      'Referring Domains',
      'Rank',
      'Last Updated'
    ];

    const csvData = [
      headers.join(','),
      ...dataToExport.map(k => [
        k.keyword,
        k.searchVolume,
        k.cpc,
        k.keywordDifficulty,
        k.intent,
        k.backlinks,
        k.referringDomains,
        k.rank,
        k.lastUpdatedTime || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'keyword_data.csv');
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

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-red-600">{error}</p>
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
          keywords={keywords.filter(k => selectedKeywords.has(k.keyword))}
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
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Search Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPC
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword Difficulty
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
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
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword) => (
              <React.Fragment key={keyword.keyword}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedKeywords.has(keyword.keyword)}
                      onChange={() => handleKeywordSelect(keyword.keyword)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.keyword}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.searchVolume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(keyword.cpc)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(keyword.keywordDifficulty)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.intent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.backlinks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.referringDomains}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.lastUpdatedTime}
                  </td>
                </tr>
                {expandedKeyword === keyword.keyword && (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 bg-gray-50">
                      <div className="h-[200px]">
                        <KeywordTrendChart data={keyword.monthlySearches || []} />
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
