import React, { useState } from 'react';
import { HelpCircle, Search, ExternalLink, ChevronLeft, ChevronRight, Settings, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatNumber } from '../../utils/format';

interface ColumnVisibility {
  position: boolean;
  content: boolean;
  pageRank: boolean;
  domainRank: boolean;
  refDomains: boolean;
  backlinks: boolean;
  etv: boolean;
  dofollow: boolean;
  change: boolean;
}

interface HistoricalTableProps {
  data: Array<{
    date: string;
    items: Array<{
      type: string;
      rank_group: number;
      rank_absolute: number;
      domain: string;
      url: string;
      title: string;
      description: string;
      etv: number;
      rank_info: {
        page_rank: number;
        main_domain_rank: number;
      };
      backlinks_info: {
        referring_domains: number;
        referring_main_domains: number;
        backlinks: number;
        dofollow: boolean;
      };
      rank_changes?: {
        previous_rank_absolute: number;
      };
    }>;
  }>;
  isLoading: boolean;
  error: string | null;
  onAIAnalysis?: (data: any) => void;
}

export function HistoricalTable({ data, isLoading, error, onAIAnalysis }: HistoricalTableProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [maxResults, setMaxResults] = useState(100);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showColumnSettings, setShowColumnSettings] = useState(false); 
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    position: true,
    content: true,
    pageRank: true,
    domainRank: true,
    refDomains: true,
    backlinks: true,
    etv: true,
    dofollow: true,
    change: true
  });

  const filterResults = (items: any[]) => {
    let filtered = items
      .filter(r => r.type === 'organic' || r.type === 'featured_snippet')
      .slice(0, maxResults);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.domain.toLowerCase().includes(term));
    }
    return filtered;
  };

  const handleExport = () => {
    const csvData = data.flatMap(monthData => {
      const date = new Date(monthData.date);
      const formattedDate = date.toLocaleDateString('default', {
        month: 'long',
        year: 'numeric'
      });
      
      return filterResults(monthData.items).map(item => ({
        date: formattedDate,
        position: item.rank_group,
        title: item.title,
        description: item.description,
        domain: item.domain,
        url: item.url,
        pageRank: item.rank_info?.page_rank,
        domainRank: item.rank_info?.main_domain_rank,
        refDomains: item.backlinks_info?.referring_domains,
        backlinks: item.backlinks_info?.backlinks,
        dofollow: item.backlinks_info?.dofollow,
        change: item.rank_changes?.previous_rank_absolute,
        etv: item.etv,
        type: item.type
      }));
    });

    const headers = [
      'Date',
      'Position',
      'Title',
      'Description',
      'Domain',
      'URL',
      'Page Rank',
      'Domain Rank',
      'Ref. Domains',
      'Backlinks',
      'Dofollow',
      'Change',
      'ETV',
      'Type'
    ];

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historical_serp_results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyzeMonth = (monthData: any) => {
    const currentParams = new URLSearchParams(location.search);
    
    // Store the month data in sessionStorage instead of URL
    const storageKey = `serp-analysis-${Date.now()}`;
    sessionStorage.setItem(storageKey, JSON.stringify(monthData));
    
    // Only pass essential data in URL
    navigate(`/serp-checker/analysis?date=${monthData.date}&key=${storageKey}&keyword=${currentParams.get('keyword') || ''}&location=${currentParams.get('location') || ''}&language=${currentParams.get('language') || ''}`);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('serp-tables-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      const newPosition = scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
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
    <div className="space-y-4 max-w-[100rem] mx-auto">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex space-x-2">
            {[100, 50, 30, 20, 10].map(num => (
              <button
                key={num}
                onClick={() => setMaxResults(num)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  maxResults === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Top {num}
              </button>
            ))}
          </div>

          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by domain"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-0">
          <div className="flex items-center space-x-4">
            <button
              className="inline-flex items-center text-[#006dca] dark:text-[#006dca] text-sm hover:underline focus:outline-none"
            >
              <HelpCircle className="h-4 w-4 mr-1 text-[#006dca]" />
              Start Tour
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                // Get latest month's data
                const latestData = data[data.length - 1];
                if (latestData && onAIAnalysis) {
                  onAIAnalysis(latestData);
                }
              }}
              className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-[#008FF7] hover:bg-[#016DC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5FA5F9] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Analysis
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#6c6e79] bg-[#8a8e9b1a] hover:bg-[#DFE0E6] hover:text-[#191B23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden border border-gray-200 rounded-lg">
        <div className="sticky left-0 right-0 bg-white z-20 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Historical SERP Results</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Columns
              </button>
              
              {showColumnSettings && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {Object.entries({
                      position: 'Position',
                      content: 'Content',
                      pageRank: 'Page Rank',
                      domainRank: 'Domain Rank',
                      refDomains: 'Ref. Domains',
                      backlinks: 'Backlinks',
                      dofollow: 'Dofollow',
                      change: 'Change',
                      etv: 'ETV'
                    }).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={columnVisibility[key as keyof ColumnVisibility]}
                          onChange={(e) => setColumnVisibility(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => handleScroll('left')}
            className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => handleScroll('right')}
            className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div 
          id="serp-tables-container" 
          className="flex overflow-x-auto space-x-6 pb-4 px-12 bg-gray-50"
        >
          {[...data].reverse().map((monthData, monthIndex) => {
            const date = new Date(monthData.date);
            const filteredItems = filterResults(monthData.items);
            
            return (
              <div 
                key={monthIndex} 
                className="bg-white rounded-lg shadow-sm flex-none w-[1200px] my-4"
              >
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">
                    {date.toLocaleDateString('default', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>

                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columnVisibility.position && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                          </th>
                        )}
                        {columnVisibility.content && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-96">
                          Content
                          </th>
                        )}
                        {columnVisibility.pageRank && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Page Rank
                          </th>
                        )}
                        {columnVisibility.domainRank && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain Rank
                          </th>
                        )}
                        {columnVisibility.refDomains && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ref. Domains
                          </th>
                        )}
                        {columnVisibility.backlinks && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Backlinks
                          </th>
                        )}
                        {columnVisibility.dofollow && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dofollow
                          </th>
                        )}
                        {columnVisibility.change && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                          </th>
                        )}
                        {columnVisibility.etv && (
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ETV
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {columnVisibility.position && (
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-900">{item.rank_group}</span>
                              {item.type === 'featured_snippet' && (
                                <div className="group relative">
                                  <img 
                                    src="https://famyayvemq6ogs8n.public.blob.vercel-storage.com/featured_snippet_icon-mzhOooMjje1kia5sJfhrVW52F11yG1.svg"
                                    alt="Featured Snippet"
                                    className="w-4 h-4"
                                  />
    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-normal w-64 pointer-events-none z-50">
                                    Featured Snippets appear at the top of the SERPs and provide a direct answer to the user's query, giving content increased visibility.
                                  </div>
                                </div>
                              )}
                            </div>
                            </td>
                          )}
                          {columnVisibility.content && (
                            <td className="px-4 py-2 text-sm max-w-sm">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {item.title || 'No title'}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {item.description || '-'}
                              </div>
                              <a 
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 truncate block"
                              >
                                {item.url || '-'}
                              </a>
                            </div>
                            </td>
                          )}
                          {columnVisibility.pageRank && (
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.rank_info?.page_rank || '-'}
                            </td>
                          )}
                          {columnVisibility.domainRank && (
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.rank_info?.main_domain_rank ? formatNumber(item.rank_info.main_domain_rank) : '-'}
                            </td>
                          )}
                          {columnVisibility.refDomains && (
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.backlinks_info?.referring_domains ? formatNumber(item.backlinks_info.referring_domains) : '-'}
                            </td>
                          )}
                          {columnVisibility.backlinks && (
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.backlinks_info?.backlinks ? formatNumber(item.backlinks_info.backlinks) : '-'}
                            </td>
                          )}
                          {columnVisibility.dofollow && (
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {item.backlinks_info?.backlinks ? (
                                <div>
                                  {formatNumber(item.backlinks_info.dofollow || 0)}
                                  <span className="text-gray-500 ml-1">
                                    ({Math.round((item.backlinks_info.dofollow || 0) / item.backlinks_info.backlinks * 100)}%)
                                  </span>
                                </div>
                              ) : '-'}
                            </td>
                          )}
                          {columnVisibility.change && (
                            <td className="px-4 py-2 whitespace-nowrap">
                              {item.rank_changes ? (
                                <div className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                  !item.rank_changes.previous_rank_absolute ? 'bg-blue-100 text-blue-800' :
                                  item.rank_absolute < item.rank_changes.previous_rank_absolute
                                    ? 'bg-green-100 text-green-800'
                                    : item.rank_absolute > item.rank_changes.previous_rank_absolute
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {!item.rank_changes.previous_rank_absolute ? 'New' :
                                   item.rank_absolute === item.rank_changes.previous_rank_absolute ? '0' :
                                    `${item.rank_absolute < item.rank_changes.previous_rank_absolute ? '+' : ''}${
                                      Math.abs(item.rank_changes.previous_rank_absolute - item.rank_absolute)
                                    }`}
                                </div>
                              ) : (
                                <span className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 text-gray-800">
                                  -
                                </span>
                              )}
                            </td>
                          )}
                          {columnVisibility.etv && (
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.etv ? formatNumber(item.etv) : '-'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}