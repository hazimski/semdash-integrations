import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { PositionDistributionChart } from './PositionDistributionChart';

interface TopPagesFullTableProps {
  pages: Array<{
    page_address: string;
    keywords: number;
    traffic: number;
    metrics?: {
      pos_1?: number;
      pos_2_3?: number;
      pos_4_10?: number;
      pos_11_20?: number;
      pos_21_30?: number;
      pos_31_40?: number;
      pos_41_50?: number;
      pos_51_60?: number;
      pos_61_70?: number;
      pos_71_80?: number;
      pos_81_90?: number;
      pos_91_100?: number;
    };
  }>;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  currentParams: {
    location: string;
    language: string;
  };
  selectedRows?: Set<string>;
  onSelectedRowsChange?: (selected: Set<string>) => void;
  selectedTotals?: {
    traffic: number;
    keywords: number;
  };
  itemsPerPage?: number;
}

export function TopPagesFullTable({
  pages = [],
  totalCount = 0,
  currentPage,
  onPageChange,
  isLoading,
  currentParams,
  selectedRows,
  onSelectedRowsChange,
  selectedTotals,
  itemsPerPage = 100
}: TopPagesFullTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const navigate = useNavigate();

  const hasMetrics = (page: typeof pages[0]) => {
    return page.metrics && Object.keys(page.metrics).length > 0;
  };

  const handleExport = () => {
    if (!pages.length) return;

    const headers = [
      'URL',
      'Keywords',
      'Traffic'
    ];

    const csvData = pages.map(page => [
      page.page_address,
      page.keywords,
      page.traffic
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'top_pages.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewKeywords = (url: string) => {
    // Parse the URL to get base domain and path
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const baseDomain = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname + urlObj.search;

    // Create search params with base domain
    const searchParams = new URLSearchParams({
      domain: baseDomain,
      location: currentParams.location,
      language: currentParams.language
    });

    // Add URL filter if path exists
    if (path) {
      searchParams.append('urlFilter', path);
    }

    navigate(`/ranked-keywords/results?${searchParams.toString()}`);
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
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Pages ({formatNumber(totalCount)})
            </h2>
            {selectedTotals && selectedRows && selectedRows.size > 0 && (
              <span className="text-sm text-gray-600">
                Selected: {formatNumber(selectedTotals.traffic)} Traffic, {formatNumber(selectedTotals.keywords)} Keywords
              </span>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={pages.length === 0}
            className="inline-flex items-center px-4 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#6c6e79] bg-[#8a8e9b1a] hover:bg-[#DFE0E6] hover:text-[#191B23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  checked={selectedRows && pages.length > 0 && selectedRows.size === pages.length}
                  onChange={(e) => {
                    if (onSelectedRowsChange) {
                      if (e.target.checked) {
                        onSelectedRowsChange(new Set(pages.map(p => p.page_address)));
                      } else {
                        onSelectedRowsChange(new Set());
                      }
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keywords
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Traffic
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page, index) => (
              <React.Fragment key={index}>
                <tr 
                  className={`hover:bg-gray-50 ${hasMetrics(page) ? 'cursor-pointer' : ''}`}
                  onClick={() => hasMetrics(page) ? setExpandedRow(expandedRow === page.page_address ? null : page.page_address) : null}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows?.has(page.page_address)}
                      onChange={(e) => {
                        if (onSelectedRowsChange && selectedRows) {
                          const newSelected = new Set(selectedRows);
                          if (e.target.checked) {
                            newSelected.add(page.page_address);
                          } else {
                            newSelected.delete(page.page_address);
                          }
                          onSelectedRowsChange(newSelected);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {hasMetrics(page) && (
                        expandedRow === page.page_address ? 
                          <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                      <a 
                        href={page.page_address}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {page.page_address}
                        <ExternalLink className="w-4 h-4 inline ml-1" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(page.keywords)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(page.traffic)}
                  </td>
                </tr>
                {expandedRow === page.page_address && hasMetrics(page) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <div className="h-[200px]">
                          <PositionDistributionChart metrics={page.metrics} />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleViewKeywords(page.page_address)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            More Details
                          </button>
                        </div>
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
