import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { toast } from 'react-hot-toast';

export function GoogleSearchConsolePerformance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const { data: domains, isLoading: isLoadingDomains } = useQuery({
    queryKey: ['gsc-domains'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('google-search-console-sites', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) {
        toast.error('Failed to fetch domains');
        throw error;
      }
      return data?.siteEntry || [];
    },
    enabled: !!user?.id
  });

  const currentDomain = searchParams.get('domain') || domains?.[0]?.siteUrl;
  const startDate = searchParams.get('startDate') || format(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const endDate = searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd');
  const dimension = searchParams.get('dimension') || 'query';

  const { data, isLoading, error } = useQuery({
    queryKey: ['gsc-performance', { domain: currentDomain, startDate, endDate, dimension }],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!currentDomain) throw new Error('No domain selected');

      const { data, error } = await supabase.functions.invoke('google-search-console-performance', {
        body: {
          siteUrl: currentDomain,
          startDate,
          endDate,
          dimensions: [dimension]
        },
        headers: {
          'x-user-id': user.id
        }
      });

      if (error) {
        toast.error('Failed to fetch performance data');
        throw error;
      }
      return data;
    },
    enabled: !!currentDomain && !!user?.id
  });

  const handleDomainChange = (domain: string) => {
    setSearchParams(prev => {
      prev.set('domain', domain);
      return prev;
    });
  };

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

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Search Console Performance</h1>
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          {error instanceof Error ? error.message : 'Failed to load performance data'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search Console Performance</h1>
      
      {isLoadingDomains ? (
        <div>Loading domains...</div>
      ) : domains?.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
          No domains found. Please add a domain to Google Search Console.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <select 
                value={currentDomain || ''} 
                onChange={(e) => handleDomainChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {domains?.map((domain: any) => (
                  <option key={domain.siteUrl} value={domain.siteUrl}>
                    {domain.siteUrl}
                  </option>
                ))}
              </select>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : data?.rows?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data?.rows?.map((row: any, index: number) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}