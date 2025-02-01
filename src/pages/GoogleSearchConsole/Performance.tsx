import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { KeywordListActions } from '../../components/keywords/KeywordListActions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';

export function GoogleSearchConsolePerformance() {
  const [searchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState('last28days');
  const [activeDimension, setActiveDimension] = useState('query');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const { data: domains } = useQuery({
    queryKey: ['gsc-domains'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('google-search-console-sites', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const currentParams = {
    domain: searchParams.get('domain') || '',
    startDate: searchParams.get('startDate') || format(new Date(), 'yyyy-MM-dd'),
    endDate: searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd'),
    dimension: searchParams.get('dimension') || 'query'
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['gsc-performance', currentParams],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('google-search-console-performance', {
        body: {
          siteUrl: currentParams.domain,
          startDate: currentParams.startDate,
          endDate: currentParams.endDate,
          dimensions: [currentParams.dimension]
        },
        headers: {
          'x-user-id': user.id
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!currentParams.domain && !!user?.id
  });

  const totalPages = Math.ceil((data?.rows?.length || 0) / 100);
  const currentPage = parseInt(searchParams.get('page') || '1');
  const start = (currentPage - 1) * 100;
  const end = start + 100;
  const currentData = data?.rows?.slice(start, end) || [];

  const handleExport = () => {
    if (!data?.rows) return;

    const headers = ['Query', 'Clicks', 'Impressions', 'CTR', 'Position'];
    const csvData = data.rows.map(item => [
      item.keys[0],
      item.clicks,
      item.impressions,
      `${(item.ctr * 100).toFixed(2)}%`,
      item.position.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `gsc-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const handleDomainChange = (domain: string) => {
    // Handle domain change logic here
  };

  const handleSelectAll = () => {
    if (selectedRows.size === currentData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentData.map(item => item.keys[0])));
    }
  };

  const handleSelectQuery = (query: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(query)) {
      newSelected.delete(query);
    } else {
      newSelected.add(query);
    }
    setSelectedRows(newSelected);
  };

  const handlePageChange = (page: number) => {
    // Handle page change logic here
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search Console Performance</h1>
      
      {error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          {error instanceof Error ? error.message : 'Failed to load performance data'}
        </div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">
                Results ({data?.rows?.length || 0})
              </h2>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Query
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.keys[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.impressions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(row.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.position.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
