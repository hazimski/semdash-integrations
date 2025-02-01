import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, ListPlus, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatNumber, formatCurrency } from '../../utils/format';
import { getDifficultyColor } from '../../utils/difficulty';
import { KeywordOptionsMenu } from '../../components/keywords/KeywordOptionsMenu';
import { KeywordListActions } from '../../components/keywords/KeywordListActions';
import { useLocation } from 'react-router-dom';
import { locations } from '../../data/locations';
import { saveAs } from 'file-saver';
import { createKeywordList, addKeywordsToList, getKeywordLists, KeywordList } from '../../services/keywordLists';

interface ResultsTableProps {
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    cpc: number;
    keywordDifficulty: number;
    intent: string;
    firstDomainRank: number | null;
    firstDomainTraffic: number;
    firstDomainUrl: string | null;
    secondDomainRank: number | null;
    secondDomainTraffic: number;
    secondDomainUrl: string | null;
  }>;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error: string | null;
  target1: string;
  target2: string;
  itemsPerPage?: number;
}

interface UrlPopoverProps {
  url: string | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

function UrlPopover({ url, position, onClose }: UrlPopoverProps) {
  const popoverRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!url || !position) return null;

  return (
    <div 
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 space-y-3"
      style={{
        top: position.y + 30,
        left: position.x,
        maxWidth: '400px'
      }}
    >
      <p className="text-sm text-gray-600 break-all">{url}</p>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            toast.success('URL copied to clipboard');
          }}
          className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          <Copy className="w-4 h-4 mr-1" />
          Copy URL
        </button>
        <button
          onClick={() => window.open(url, '_blank')}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open URL
        </button>
      </div>
    </div>
  );
}

export function ResultsTable({ 
  keywords = [],
  totalCount = 0,
  currentPage,
  onPageChange,
  isLoading,
  error,
  target1,
  target2,
  itemsPerPage = 100
}: ResultsTableProps) {
  const [popoverState, setPopoverState] = useState<{
    url: string | null;
    position: { x: number; y: number } | null;
  }>({
    url: null,
    position: null
  });
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
      'CPC',
      'KD',
      'Intent',
      `${target2} Position`,
      `${target2} Traffic`,
      `${target2} URL`,
      `${target1} Position`,
      `${target1} Traffic`,
      `${target1} URL`
    ];

    const csvData = keywords.map(keyword => [
      keyword.keyword,
      keyword.searchVolume,
      keyword.cpc,
      keyword.keywordDifficulty,
      keyword.intent,
      keyword.secondDomainRank || '',
      keyword.secondDomainTraffic,
      keyword.secondDomainUrl || '',
      keyword.firstDomainRank || '',
      keyword.firstDomainTraffic,
      keyword.firstDomainUrl || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => 
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'keyword_gap_analysis.csv');
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
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <KeywordListActions
            selectedKeywords={selectedKeywords}
            onClearSelection={() => setSelectedKeywords(new Set())}
            locationName={locationName}
            languageName={languageName}
            keywords={keywords.filter(k => selectedKeywords.has(k.keyword)).map(k => ({
              keyword: k.keyword,
              searchVolume: k.searchVolume,
              cpc: k.cpc,
              keywordDifficulty: k.keywordDifficulty,
              intent: k.intent,
              source: 'Keyword Gap'
            }))}
          />
        </div>
      )}

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            All Results ({formatNumber(totalCount)})
          </h2>
          <button
            onClick={handleExport}
            disabled={keywords.length === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
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
                Intent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{target2}</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{target1}</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Search Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                KD%
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPC
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Traffic</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Traffic</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedKeywords.has(keyword.keyword)}
                    onChange={() => handleKeywordSelect(keyword.keyword)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <KeywordOptionsMenu 
                    keyword={keyword.keyword}
                    locationCode={currentLocationCode}
                    languageCode={currentLanguageCode}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs font-medium rounded-lg capitalize" style={{
                    backgroundColor: keyword.intent === 'informational' ? '#EBF5FF' :
                                   keyword.intent === 'commercial' ? '#F3E8FF' :
                                   keyword.intent === 'navigational' ? '#DCFCE7' :
                                   keyword.intent === 'transactional' ? '#FEF3C7' : '#F3F4F6',
                    color: keyword.intent === 'informational' ? '#1E40AF' :
                           keyword.intent === 'commercial' ? '#6B21A8' :
                           keyword.intent === 'navigational' ? '#166534' :
                           keyword.intent === 'transactional' ? '#92400E' : '#374151'
                  }}>
                    {keyword.intent}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      if (keyword.secondDomainUrl) {
                        setPopoverState({
                          url: keyword.secondDomainUrl,
                          position: { x: e.clientX, y: e.clientY }
                        });
                      }
                    }}
                  >
                    {keyword.secondDomainRank || '-'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      if (keyword.firstDomainUrl) {
                        setPopoverState({
                          url: keyword.firstDomainUrl,
                          position: { x: e.clientX, y: e.clientY }
                        });
                      }
                    }}
                  >
                    {keyword.firstDomainRank || '-'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(keyword.searchVolume)}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(keyword.secondDomainTraffic)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(keyword.firstDomainTraffic)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <KeywordListActions
        selectedKeywords={selectedKeywords}
        onClearSelection={() => setSelectedKeywords(new Set())}
        locationName={locationName}
        languageName={languageName}
        keywords={keywords}
      />

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

      <UrlPopover 
        url={popoverState.url}
        position={popoverState.position}
        onClose={() => setPopoverState({ url: null, position: null })}
      />
    </div>
  );
}
