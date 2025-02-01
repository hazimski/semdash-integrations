import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';

interface PerformanceData {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

type Dimension = 'query' | 'page' | 'country' | 'device' | 'searchAppearance';

export function GoogleSearchConsolePerformance() {
  const { domain } = useParams<{ domain: string }>();
  const [dateRange, setDateRange] = useState('28');
  const [activeDimension, setActiveDimension] = useState<Dimension>('query');
  const { user } = useAuth();

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
    queryKey: ['gsc-performance-dimension', domain, dateRange, activeDimension],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('google-search-console-performance', {
        body: { 
          siteUrl: decodeURIComponent(domain || ''),
          days: parseInt(dateRange),
          dimension: activeDimension
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
                {timeSeriesData?.reduce((sum: number, item: PerformanceData) => sum + item.clicks, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Impressions</h3>
              <p className="text-3xl font-bold">
                {timeSeriesData?.reduce((sum: number, item: PerformanceData) => sum + item.impressions, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Average CTR</h3>
              <p className="text-3xl font-bold">
                {(timeSeriesData?.reduce((sum: number, item: PerformanceData) => sum + item.ctr, 0) / (timeSeriesData?.length || 1)).toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Average Position</h3>
              <p className="text-3xl font-bold">
                {(timeSeriesData?.reduce((sum: number, item: PerformanceData) => sum + item.position, 0) / (timeSeriesData?.length || 1)).toFixed(1)}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="key" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#3b82f6" name="Clicks" />
                  <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#7c3aed" name="Impressions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
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
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-4">{activeDimension === 'query' ? 'Query' : activeDimension === 'page' ? 'Page' : activeDimension === 'country' ? 'Country' : activeDimension === 'device' ? 'Device' : 'Search Appearance'}</th>
                    <th className="pb-4 text-right">Clicks</th>
                    <th className="pb-4 text-right">Impressions</th>
                    <th className="pb-4 text-right">CTR</th>
                    <th className="pb-4 text-right">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {dimensionData?.map((item: PerformanceData) => (
                    <tr key={item.key} className="border-t">
                      <td className="py-4">{item.key}</td>
                      <td className="py-4 text-right">{item.clicks.toLocaleString()}</td>
                      <td className="py-4 text-right">{item.impressions.toLocaleString()}</td>
                      <td className="py-4 text-right">{item.ctr.toFixed(2)}%</td>
                      <td className="py-4 text-right">{item.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}