import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

interface MetricFilter {
  min?: number;
  max?: number;
}

interface MetricFilters {
  clicks: MetricFilter;
  impressions: MetricFilter;
  ctr: MetricFilter;
  position: MetricFilter;
}

export function GoogleSearchConsolePerformance() {
  const { domain } = useParams<{ domain: string }>();
  const [dateRange, setDateRange] = useState('28');
  const [activeDimension, setActiveDimension] = useState<'query' | 'page' | 'country' | 'device' | 'searchAppearance'>('query');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPagesPage, setCurrentPagesPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [selectedQueries, setSelectedQueries] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metricFilters, setMetricFilters] = useState<MetricFilters>({
    clicks: {},
    impressions: {},
    ctr: {},
    position: {}
  });

  const filterData = (data: any[]) => {
    if (!data) return [];
    
    return data.filter(item => {
      const { clicks, impressions, ctr, position } = item;
      
      if (metricFilters.clicks.min !== undefined && clicks < metricFilters.clicks.min) return false;
      if (metricFilters.clicks.max !== undefined && clicks > metricFilters.clicks.max) return false;
      
      if (metricFilters.impressions.min !== undefined && impressions < metricFilters.impressions.min) return false;
      if (metricFilters.impressions.max !== undefined && impressions > metricFilters.impressions.max) return false;
      
      if (metricFilters.ctr.min !== undefined && ctr < metricFilters.ctr.min) return false;
      if (metricFilters.ctr.max !== undefined && ctr > metricFilters.ctr.max) return false;
      
      if (metricFilters.position.min !== undefined && position < metricFilters.position.min) return false;
      if (metricFilters.position.max !== undefined && position > metricFilters.position.max) return false;
      
      return true;
    });
  };

  const handleMetricFilterChange = (metric: keyof MetricFilters, type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setMetricFilters(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [type]: numValue
      }
    }));
  };

  const renderMetricFilters = () => (
    <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg shadow">
      {Object.entries({
        clicks: 'Clicks',
        impressions: 'Impressions',
        ctr: 'CTR',
        position: 'Position'
      }).map(([metric, label]) => (
        <div key={metric} className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={metricFilters[metric as keyof MetricFilters].min || ''}
              onChange={(e) => handleMetricFilterChange(metric as keyof MetricFilters, 'min', e.target.value)}
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={metricFilters[metric as keyof MetricFilters].max || ''}
              onChange={(e) => handleMetricFilterChange(metric as keyof MetricFilters, 'max', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );

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

  const isLoading = timeSeriesLoading;
  const totalItems = timeSeriesData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filterData(timeSeriesData?.slice(startIndex, endIndex) || []);

  const handleExport = () => {
    if (!currentData?.length) return;

    const csvContent = [
      // CSV Headers
      ['Key', 'Clicks', 'Impressions', 'CTR', 'Position'].join(','),
      // CSV Data rows
      ...currentData.map(row => [
        `"${row.key}"`,
        row.clicks,
        row.impressions,
        `${row.ctr.toFixed(2)}%`,
        row.position.toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `gsc-performance-${activeDimension}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDomainChange = (value: string) => {
    navigate(`/google-search-console/performance/${encodeURIComponent(value)}`);
  };

  const handleSelectAll = () => {
    if (currentData?.length) {
      if (selectedQueries.size === currentData.length) {
        setSelectedQueries(new Set());
      } else {
        setSelectedQueries(new Set(currentData.map(row => row.key)));
      }
    }
  };

  const handleSelectQuery = (key: string) => {
    const newSelected = new Set(selectedQueries);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedQueries(newSelected);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            {/* Domain options */}
          </select>
        </div>
        
        <div className="flex gap-2">
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
                    disabled={!currentData?.length}
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
                  onClick={() => setActiveDimension('query')}
                  className={`px-6 py-4 text-sm font-medium ${activeDimension === 'query' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                  Queries
                </button>
                <button
                  onClick={() => setActiveDimension('page')}
                  className={`px-6 py-4 text-sm font-medium ${activeDimension === 'page' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                  Pages
                </button>
                <button
                  onClick={() => setActiveDimension('country')}
                  className={`px-6 py-4 text-sm font-medium ${activeDimension === 'country' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                  Countries
                </button>
                <button
                  onClick={() => setActiveDimension('device')}
                  className={`px-6 py-4 text-sm font-medium ${activeDimension === 'device' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                  Devices
                </button>
                <button
                  onClick={() => setActiveDimension('searchAppearance')}
                  className={`px-6 py-4 text-sm font-medium ${activeDimension === 'searchAppearance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                  Search Appearance
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
                        setCurrentPage(1); // Reset to first page when changing items per page
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
                    <th className="pb-4 text-right">Clicks</th>
                    <th className="pb-4 text-right">Impressions</th>
                    <th className="pb-4 text-right">CTR</th>
                    <th className="pb-4 text-right">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item: any) => (
                    <tr key={item.key} className="border-t">
                      <td className="py-4 pr-4">
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
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
