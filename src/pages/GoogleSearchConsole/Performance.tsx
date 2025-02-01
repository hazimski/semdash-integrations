import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Download, HelpCircle, ListPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { KeywordListActions } from '../../components/keywords/KeywordListActions';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';

const ITEMS_PER_PAGE = 100;

export function GoogleSearchConsolePerformance() {
  const { domain } = useParams<{ domain: string }>();
  const [dateRange, setDateRange] = useState('28');
  const [activeDimension, setActiveDimension] = useState<'query' | 'page' | 'country' | 'device' | 'searchAppearance'>('query');
  const [queryPage, setQueryPage] = useState(1);
  const [pagesPage, setPagesPage] = useState(1);
  const [selectedQueries, setSelectedQueries] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Default location and language parameters
  const currentParams = {
    location: '2840', // US
    language: 'en'  // English
  };

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

  const getCurrentPage = () => {
    return activeDimension === 'page' ? pagesPage : queryPage;
  };

  const { data: dimensionData, isLoading: dimensionLoading } = useQuery({
    queryKey: ['gsc-performance-dimension', domain, dateRange, activeDimension, getCurrentPage()],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('google-search-console-performance', {
        body: { 
          siteUrl: decodeURIComponent(domain || ''),
          days: parseInt(dateRange),
          dimension: activeDimension,
          limit: ITEMS_PER_PAGE,
          offset: (getCurrentPage() - 1) * ITEMS_PER_PAGE
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

  const isLoading = timeSeriesLoading || dimensionLoading;
  const currentData = dimensionData?.data || [];
  const totalItems = dimensionData?.totalRows || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (activeDimension === 'page') {
      setPagesPage(newPage);
    } else {
      setQueryPage(newPage);
    }
  };

  const handleExport = () => {
    if (!dimensionData?.data?.length) return;

    const dataToExport = selectedQueries.size > 0 
      ? dimensionData.data.filter(item => selectedQueries.has(item.key))
      : dimensionData.data;

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
    toast.success('CSV file exported successfully');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Performance: {decodeURIComponent(domain || '')}</h1>
        
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

          <div className="bg-white rounded-lg shadow">
            {selectedQueries.size > 0 && (
              <KeywordListActions
                selectedKeywords={selectedQueries}
                onClearSelection={() => setSelectedQueries(new Set())}
                locationName={currentParams.location}
                languageName={currentParams.language}
                keywords={dimensionData?.data?.filter(item => selectedQueries.has(item.key)).map(item => ({
                  keyword: item.key,
                  searchVolume: item.impressions,
                  cpc: '-',
                  keywordDifficulty: '-',
                  intent: 'informational',
                  source: 'GSC'
                }))}
              />
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
                <div className="text-sm text-gray-600">
                  {(getCurrentPage() - 1) * ITEMS_PER_PAGE + 1}-{Math.min(getCurrentPage() * ITEMS_PER_PAGE, totalItems)} of {totalItems}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleExport}
                    disabled={!dimensionData?.data?.length}
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
                        checked={selectedQueries.size === dimensionData?.data?.length}
                        onChange={() => {
                          if (selectedQueries.size === dimensionData?.data?.length) {
                            setSelectedQueries(new Set());
                          } else {
                            setSelectedQueries(new Set(dimensionData?.data?.map(item => item.key) || []));
                          }
                        }}
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
                          onChange={() => {
                            const newSelected = new Set(selectedQueries);
                            if (newSelected.has(item.key)) {
                              newSelected.delete(item.key);
                            } else {
                              newSelected.add(item.key);
                            }
                            setSelectedQueries(newSelected);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4">{item.key}</td>
                      <td className="py-4 text-right">{item.clicks.toLocaleString()}</td>
                      <td className="py-4 text-right">{item.impressions.toLocaleString()}</td>
                      <td className="py-4 text-right">{(item.ctr * 100).toFixed(2)}%</td>
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
