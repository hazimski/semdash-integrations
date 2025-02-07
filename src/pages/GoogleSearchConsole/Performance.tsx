import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, ChevronRight, Download, Unlink, ArrowDown, ArrowUp } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

type SortField = 'clicks' | 'impressions' | 'ctr' | 'position';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function GoogleSearchConsolePerformance() {
  const { domain } = useParams<{ domain: string }>();
  const [dateRange, setDateRange] = useState('28');
  const [activeDimension, setActiveDimension] = useState<'query' | 'page' | 'country' | 'device' | 'searchAppearance'>('query');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPagesPage, setCurrentPagesPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [selectedQueries, setSelectedQueries] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<{dimension: string, expression: string} | null>(null);
  const [sort, setSort] = useState<SortConfig>({ field: 'clicks', direction: 'desc' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for available domains
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

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['gsc-performance-time', domain, dateRange],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('google-search-console-performance', {
        body: { 
          siteUrl: decodeURIComponent(domain || ''),
          days: parseInt(dateRange),
          dimension: 'date'
        },
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!domain
  });

  const { data: dimensionData, isLoading: dimensionLoading } = useQuery({
    queryKey: ['gsc-performance-dimension', domain, dateRange, activeDimension, activeFilter],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const payload: any = { 
        siteUrl: decodeURIComponent(domain || ''),
        days: parseInt(dateRange),
        dimension: activeDimension
      };

      // Add filter if exists
      if (activeFilter) {
        payload.dimensionFilterGroups = [{
          filters: [{
            dimension: activeFilter.dimension,
            expression: activeFilter.expression
          }]
        }];
      }
      
      const { data, error } = await supabase.functions.invoke('google-search-console-performance', {
        body: payload,
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!domain
  });

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expiry: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Invalidate the domains query to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['gsc-domains'] });
      
      toast.success('Successfully disconnected from Google Search Console');
      navigate('/google-search-console');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect from Google Search Console');
    }
  };

  const handleSort = (field: SortField) => {
    setSort(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortData = (data: any[]) => {
    return [...data].sort((a, b) => {
      const multiplier = sort.direction === 'asc' ? 1 : -1;
      return multiplier * (a[sort.field] - b[sort.field]);
    });
  };

  const isLoading = timeSeriesLoading || dimensionLoading;
  const totalItems = dimensionData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getCurrentPage = () => {
    return activeDimension === 'page' ? currentPagesPage : currentPage;
  };

  const startIndex = (getCurrentPage() - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleExport = () => {
    if (!dimensionData?.length) return;

    const dataToExport = selectedQueries.size > 0 
      ? dimensionData.filter(item => selectedQueries.has(item.key))
      : dimensionData;

    const headers = [
      activeDimension === 'query' ? 'Query' : activeDimension === 'page' ? 'Page' : activeDimension === 'country' ? 'Country' : activeDimension === 'device' ? 'Device' : 'Search Appearance',
      'Clicks',
      'Impressions',
      'CTR',
      'Position'
    ];

    const csvData = [
      headers.join(','),
      ...dataToExport.map(item => [
        item.key,
        item.clicks,
        item.impressions,
        item.ctr,
        item.position.toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `gsc_${activeDimension}_${domain}_${dateRange}days.csv`);
  };

  const handleDomainChange = (newDomain: string) => {
    navigate(`/google-search-console/performance/${encodeURIComponent(newDomain)}`);
  };

  const handleSelectAll = () => {
    if (dimensionData) {
      if (selectedQueries.size === dimensionData.length) {
        setSelectedQueries(new Set());
      } else {
        setSelectedQueries(new Set(dimensionData.map(item => item.key)));
      }
    }
  };

  const handleSelectQuery = (key: string) => {
    const newSelectedQueries = new Set(selectedQueries);
    if (selectedQueries.has(key)) {
      newSelectedQueries.delete(key);
    } else {
      newSelectedQueries.add(key);
    }
    setSelectedQueries(newSelectedQueries);
  };

  const handleRowClick = (key: string) => {
    if (activeDimension === 'query') {
      setActiveFilter({ dimension: 'query', expression: key });
      setActiveDimension('page');
    } else if (activeDimension === 'page') {
      setActiveFilter({ dimension: 'page', expression: key });
      setActiveDimension('query');
    }
    // Reset pagination when switching dimensions
    setCurrentPage(1);
    setCurrentPagesPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (activeDimension === 'page') {
      setCurrentPagesPage(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const sortedData = dimensionData ? sortData(dimensionData) : [];
  const currentData = sortedData.slice(startIndex, endIndex) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Performance</h1>
          <select 
            value={domain} 
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {domains?.map((site: any) => (
              <option key={site.siteUrl} value={site.siteUrl}>
                {site.siteUrl}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Unlink className="w-4 h-4 mr-2" />
            Disconnect Google
          </button>
          <button
            onClick={() => setDateRange('7')}
            className={`px-4 py-2 rounded-lg ${dateRange === '7' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setDateRange('28')}
            className={`px-4 py-2 rounded-lg ${dateRange === '28' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Last 28 days
          </button>
          <button
            onClick={() => setDateRange('90')}
            className={`px-4 py-2 rounded-lg ${dateRange === '90' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Last 3 months
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Clicks</h3>
              <p className="text-3xl font-bold">
                {timeSeriesData?.reduce((sum: number, item: any) => sum + item.clicks, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Impressions</h3>
              <p className="text-3xl font-bold">
                {timeSeriesData?.reduce((sum: number, item: any) => sum + item.impressions, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Average CTR</h3>
              <p className="text-3xl font-bold">
                {(timeSeriesData?.reduce((sum: number, item: any) => sum + item.ctr, 0) / (timeSeriesData?.length || 1)).toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Average Position</h3>
              <p className="text-3xl font-bold">
                {(timeSeriesData?.reduce((sum: number, item: any) => sum + item.position, 0) / (timeSeriesData?.length || 1)).toFixed(1)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('default', { 
                          month: 'short',
                          day: 'numeric'
                        });
                      }}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="clicks"
                      stroke="#2563eb"
                      name="Clicks"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="impressions"
                      stroke="#10b981"
                      name="Impressions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            {selectedQueries.size > 0 && (
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleExport}
                    disabled={!dimensionData?.length}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>
            )}

            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => {
                    setActiveDimension('query');
                    setActiveFilter(null);
                  }}
                  className={`px-6 py-4 text-sm font-medium ${activeDimension === 'query' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                  Queries
                </button>
                <button
                  onClick={() => {
                    setActiveDimension('page');
                    setActiveFilter(null);
                  }}
                  className={`px-6 py-4 text-sm font-medium ${activeDimension === 'page' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                  Pages
                </button>
              </nav>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {[5, 10, 25, 50, 100, 250, 500].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleExport}
                    disabled={!dimensionData?.length}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>

              {activeFilter && (
                <div className="mb-4 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    Filtered by {activeFilter.dimension}: {activeFilter.expression}
                  </span>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="text-blue-700 hover:text-blue-900 text-sm font-medium"
                  >
                    Clear filter
                  </button>
                </div>
              )}

              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-4 pr-4">
                      <input
                        type="checkbox"
                        checked={selectedQueries.size === dimensionData?.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="pb-4">{activeDimension === 'query' ? 'Query' : activeDimension === 'page' ? 'Page' : activeDimension === 'country' ? 'Country' : activeDimension === 'device' ? 'Device' : 'Search Appearance'}</th>
                    <th 
                      className="pb-4 text-right cursor-pointer hover:text-blue-600"
                      onClick={() => handleSort('clicks')}
                    >
                      <div className="flex items-center justify-end">
                        Clicks
                        {sort.field === 'clicks' && (
                          sort.direction === 'desc' ? <ArrowDown className="w-4 h-4 ml-1" /> : <ArrowUp className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="pb-4 text-right cursor-pointer hover:text-blue-600"
                      onClick={() => handleSort('impressions')}
                    >
                      <div className="flex items-center justify-end">
                        Impressions
                        {sort.field === 'impressions' && (
                          sort.direction === 'desc' ? <ArrowDown className="w-4 h-4 ml-1" /> : <ArrowUp className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="pb-4 text-right cursor-pointer hover:text-blue-600"
                      onClick={() => handleSort('ctr')}
                    >
                      <div className="flex items-center justify-end">
                        CTR
                        {sort.field === 'ctr' && (
                          sort.direction === 'desc' ? <ArrowDown className="w-4 h-4 ml-1" /> : <ArrowUp className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="pb-4 text-right cursor-pointer hover:text-blue-600"
                      onClick={() => handleSort('position')}
                    >
                      <div className="flex items-center justify-end">
                        Position
                        {sort.field === 'position' && (
                          sort.direction === 'desc' ? <ArrowDown className="w-4 h-4 ml-1" /> : <ArrowUp className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item: any) => (
                    <tr 
                      key={item.key} 
                      className="border-t cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleRowClick(item.key)}
                    >
                      <td className="py-4 pr-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedQueries.has(item.key)}
                          onChange={() => handleSelectQuery(item.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4">{item.key}</td>
                      <td className="py-4 text-right">{item.clicks.toLocaleString()}</td>
                      <td className="py-4 text-right">{item.impressions.toLocaleString()}</td>
                      <td className="py-4 text-right">{(item.ctr).toFixed(2)}%</td>
                      <td className="py-4 text-right">{item.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Page {getCurrentPage()} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(getCurrentPage() - 1)}
                    disabled={getCurrentPage() === 1}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(getCurrentPage() + 1)}
                    disabled={getCurrentPage() === totalPages}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
