import React from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Download, ArrowDown, ArrowUp } from 'lucide-react';
import { saveAs } from 'file-saver';
import { formatNumber } from '../../utils/format';

interface BacklinkData {
  domainFromRank: number;
  pageFromTitle: string;
  pageFromKeywordsCountTop10: number;
  urlFrom: string;
  pageFromExternalLinks: number;
  pageFromInternalLinks: number;
  anchor: string;
  urlTo: string;
  firstSeen: string;
  lastSeen: string;
  isNew: boolean;
  isLost: boolean;
  isBroken: boolean;
  dofollow: boolean;
}

interface SortConfig {
  field: 'domain_from_rank' | 'first_seen' | 'last_seen';
  direction: 'asc' | 'desc';
}

interface BotoxResultsTableProps {
  backlinks: BacklinkData[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error: string | null;
  itemsPerPage?: number;
  sort: SortConfig;
  onSort: (field: SortConfig['field']) => void;
}

export function BotoxResultsTable({ 
  backlinks = [],
  totalCount = 0,
  currentPage,
  onPageChange,
  isLoading,
  error,
  itemsPerPage = 100,
  sort,
  onSort
}: BotoxResultsTableProps) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleExport = () => {
    if (!backlinks.length) return;

    const headers = [
      'Page AS',
      'Page Title',
      'Source URL',
      'External Links',
      'Internal Links',
      'Anchor',
      'Target URL',
      'First Seen',
      'Last Seen',
      'Status'
    ];

    const csvData = backlinks.map(backlink => [
      backlink.domainFromRank,
      backlink.pageFromTitle,
      backlink.urlFrom,
      backlink.pageFromExternalLinks,
      backlink.pageFromInternalLinks,
      backlink.anchor,
      backlink.urlTo,
      new Date(backlink.firstSeen).toLocaleDateString(),
      new Date(backlink.lastSeen).toLocaleDateString(),
      [
        backlink.isNew ? 'New' : '',
        backlink.isLost ? 'Lost' : '',
        backlink.isBroken ? 'Broken' : '',
        !backlink.dofollow ? 'NoFollow' : ''
      ].filter(Boolean).join(', ') || 'Active'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => 
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'backlinks_analysis.csv');
  };

  const SortIcon = ({ field }: { field: SortConfig['field'] }) => {
    if (sort.field !== field) {
      return null;
    }
    return sort.direction === 'desc' ? 
      <ArrowDown className="w-4 h-4 ml-1" /> : 
      <ArrowUp className="w-4 h-4 ml-1" />;
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Backlinks ({formatNumber(totalCount)})
          </h2>
          <button
            onClick={handleExport}
            disabled={backlinks.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('domain_from_rank')}
              >
                <div className="flex items-center">
                  Page AS
                  <SortIcon field="domain_from_rank" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source Page Title And URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keywords (Top 10)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ext. Links
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Int. Links
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anchor and Target URL
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('first_seen')}
              >
                <div className="flex items-center">
                  First Seen
                  <SortIcon field="first_seen" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('last_seen')}
              >
                <div className="flex items-center">
                  Last Seen
                  <SortIcon field="last_seen" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {backlinks.map((backlink, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {backlink.domainFromRank}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2 max-w-md">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 hover:line-clamp-none relative group">
                      {backlink.pageFromTitle || 'No title'}
                      <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-gray-900 text-white p-2 rounded text-xs max-w-md whitespace-normal mt-1">
                        {backlink.pageFromTitle || 'No title'}
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2 hover:line-clamp-none relative group">
                      <a 
                        href={backlink.urlFrom}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1"
                      >
                        <span>{backlink.urlFrom}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-gray-900 text-white p-2 rounded text-xs max-w-md whitespace-normal mt-1">
                        {backlink.urlFrom}
                      </div>
                    </div>
                    {(backlink.isNew || backlink.isLost || backlink.isBroken || backlink.dofollow === false) && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {backlink.isNew && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">
                            New
                          </span>
                        )}
                        {backlink.isLost && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ background: '#ED8B88', color: '#ef3535' }}>
                            Lost
                          </span>
                        )}
                        {backlink.isBroken && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded">
                            Broken
                          </span>
                        )}
                        {backlink.dofollow === false && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-400 text-amber-900 rounded">
                            No Follow
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(backlink.pageFromKeywordsCountTop10)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(backlink.pageFromExternalLinks)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(backlink.pageFromInternalLinks)}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2 max-w-md">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 hover:line-clamp-none relative group">
                      {backlink.type === 'image' ? (
                        <a 
                          href={backlink.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Image
                        </a>
                      ) : (
                        <span>
                          {backlink.anchor || 'No anchor text'}
                          <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-gray-900 text-white p-2 rounded text-xs max-w-md whitespace-normal mt-1">
                            {backlink.anchor || 'No anchor text'}
                          </div>
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2 hover:line-clamp-none relative group">
                      <a 
                        href={backlink.urlTo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1"
                      >
                        <span>{backlink.urlTo}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-gray-900 text-white p-2 rounded text-xs max-w-md whitespace-normal mt-1">
                        {backlink.urlTo}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(backlink.firstSeen).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(backlink.lastSeen).toLocaleDateString()}
                </td>
              </tr>
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
