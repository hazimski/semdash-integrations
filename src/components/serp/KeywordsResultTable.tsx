import React, { useState, useEffect } from 'react';
import { TrendingUp, ChevronLeft, ChevronRight, Download, ListPlus } from 'lucide-react';
import { formatNumber, formatCurrency } from '../../utils/format';
import { getDifficultyColor } from '../../utils/difficulty';
import { KeywordTrendChart } from './KeywordTrendChart';
import { createKeywordList, addKeywordsToList, getKeywordLists, KeywordList } from '../../services/keywordLists';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { locations } from '../../data/locations';

interface Keyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  keywordDifficulty: number;
  monthlySearches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
  backlinks: number;
  referringDomains: number;
  domainRank: number;
  intent: string;
}

interface KeywordsResultTableProps {
  keywords: Keyword[];
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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [existingLists, setExistingLists] = useState<KeywordList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isSavingToExisting, setIsSavingToExisting] = useState(false);
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

  useEffect(() => {
    loadExistingLists();
  }, []);

  const loadExistingLists = async () => {
    try {
      const lists = await getKeywordLists();
      setExistingLists(lists);
    } catch (error) {
      console.error('Error loading keyword lists:', error);
    }
  };

  const handleSaveToList = async () => {
    try {
      let listId = selectedListId;

      if (!isSavingToExisting) {
        if (!newListName) {
          toast.error('Please enter a list name');
          return;
        }

        // Create new list
        const list = await createKeywordList(newListName, newListDescription);
        listId = list.id;
      } else if (!listId) {
        toast.error('Please select a list');
        return;
      }

      // Add selected keywords to list
      const selectedKeywordData = keywords
        .filter(k => selectedKeywords.has(k.keyword))
        .map(k => ({
          keyword: k.keyword,
          search_volume: k.searchVolume,
          cpc: k.cpc,
          competition: k.competition,
          keyword_difficulty: k.keywordDifficulty,
          intent: k.intent,
          source: 'By SERP',
          language: languageName,
          location: locationName
        }));

      await addKeywordsToList(listId, selectedKeywordData);

      toast.success('Keywords saved to list successfully');
      setShowSaveDialog(false);
      setNewListName('');
      setNewListDescription('');
      setSelectedListId('');
      setSelectedKeywords(new Set());
      setIsSavingToExisting(false);
    } catch (error) {
      console.error('Error saving keywords:', error);
      toast.error('Failed to save keywords to list');
    }
  };

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
      'Competition',
      'KD',
      'Backlinks',
      'Referring Domains',
      'Domain Rank',
      'Intent'
    ];

    const csvData = keywords.map(keyword => [
      keyword.keyword,
      keyword.searchVolume,
      keyword.cpc,
      keyword.competition,
      keyword.keywordDifficulty,
      keyword.backlinks,
      keyword.referringDomains,
      keyword.domainRank,
      keyword.intent
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'serp_keywords.csv');
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
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedKeywords.size} keywords selected
            </span>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <ListPlus className="w-4 h-4 mr-2" />
              Save to List
            </button>
          </div>
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
                Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPC
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competition
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                KD
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Backlinks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ref Domains
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
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
                    {Math.round(keyword.competition * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{Math.round(keyword.keywordDifficulty)}</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getDifficultyColor(keyword.keywordDifficulty) }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.backlinks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(keyword.referringDomains)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(keyword.domainRank)}
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
                    <button className="text-blue-600 hover:text-blue-800">
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {expandedKeyword === keyword.keyword && (
                  <tr>
                    <td colSpan={11} className="px-6 py-4 bg-gray-50">
                      <div className="h-[200px]">
                        <KeywordTrendChart data={keyword.monthlySearches} />
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

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Keywords to List</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsSavingToExisting(false)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                    !isSavingToExisting 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  New List
                </button>
                <button
                  onClick={() => setIsSavingToExisting(true)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                    isSavingToExisting 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Existing List
                </button>
              </div>

              {isSavingToExisting ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select List</label>
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a list...</option>
                    {existingLists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">List Name</label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter list name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter list description"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToList}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Keywords
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
