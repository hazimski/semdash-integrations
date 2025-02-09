import React, { useState } from 'react';
import { BacklinkData } from '../types';
import { ExternalLink, Download, ArrowUpDown, Trash2 } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { InfoDropdown } from './InfoDropdown';
import { formatNumber } from '../utils/format';
import { deleteBacklinkResult } from '../services/backlinks';
import { toast } from 'react-hot-toast';

interface ResultsTableProps {
  data: (BacklinkData & { id?: string })[];
  isLoading?: boolean;
  error?: string | null;
  onDelete?: (id: string) => void;
}

type SortField = 'main_domain_rank' | 'backlinks' | 'referring_domains' | 'broken_backlinks' | 'broken_pages' | 'referring_domains_nofollow';
type SortDirection = 'asc' | 'desc';

function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function ResultsTable({ data, isLoading, error, onDelete }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="text-gray-600">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField] ?? 0;
    const bValue = b[sortField] ?? 0;
    
    if (sortDirection === 'asc') {
      return aValue - bValue;
    }
    return bValue - aValue;
  });

  const exportToCsv = () => {
    const headers = [
      'Target',
      'AS',
      'Backlinks',
      'Domains',
      'Broken Backlinks',
      'Broken Pages',
      'No Follow',
      'Text',
      'Image',
      'Canonical',
      'Redirect',
      'Tags',
      'Info'
    ];

    const csvData = sortedData.map(item => [
      item.target,
      item.main_domain_rank,
      item.backlinks,
      item.referring_domains,
      item.broken_backlinks,
      item.broken_pages,
      item.referring_domains_nofollow,
      item.anchor,
      item.image,
      item.canonical,
      item.redirect,
      (item.tags || []).join(';'),
      Object.entries(item.referring_links_tld)
        .map(([key, value]) => `${key}:${value}`)
        .join(';')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'backlink_analysis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      await deleteBacklinkResult(id);
      toast.success('Result deleted successfully');
      onDelete?.(id);
    } catch (error) {
      toast.error('Failed to delete result');
      console.error('Delete error:', error);
    }
  };

  const renderSortableHeader = (field: SortField, label: string) => (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className="w-4 h-4" />
      </div>
    </th>
  );

  return (
    <div className="mt-8">
      <div className="mb-4 flex justify-end">
        <button
          onClick={exportToCsv}
          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              {renderSortableHeader('main_domain_rank', 'AS')}
              {renderSortableHeader('backlinks', 'Backlinks')}
              {renderSortableHeader('referring_domains', 'Domains')}
              {renderSortableHeader('broken_backlinks', 'Broken Backlinks')}
              {renderSortableHeader('broken_pages', 'Broken Pages')}
              {renderSortableHeader('referring_domains_nofollow', 'No Follow')}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Text
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Canonical
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Redirect
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={`${item.target}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">{item.target}</span>
                    <a
                      href={item.target}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Tooltip>
                    <span className="cursor-help">{formatNumber(item.main_domain_rank)}</span>
                  </Tooltip>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.backlinks)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.referring_domains)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.broken_backlinks)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.broken_pages)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-900">{formatNumber(item.referring_domains_nofollow)}</span>
                    <span className="text-gray-400 text-xs">
                      {calculatePercentage(item.referring_domains_nofollow ?? 0, item.referring_domains ?? 0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.anchor)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.image)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.canonical)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.redirect)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.tags?.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <InfoDropdown 
                    tldData={item.referring_links_tld}
                    referringIps={item.referring_ips}
                    attributesData={item.referring_links_attributes}
                    platformTypesData={item.referring_links_platform_types}
                    semanticLocationsData={item.referring_links_semantic_locations}
                    countriesData={item.referring_links_countries}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.id && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                      title="Delete result"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
