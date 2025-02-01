import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';

interface PerformanceData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
}

export function GoogleSearchConsolePerformance() {
  const { domain } = useParams<{ domain: string }>();
  const [dateRange, setDateRange] = useState('28');
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['gsc-performance', domain, dateRange],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('google-search-console-performance', {
        body: { 
          siteUrl: decodeURIComponent(domain || ''),
          days: parseInt(dateRange)
        },
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) throw error;
      return data as PerformanceData[];
    },
    enabled: !!user?.id && !!domain
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Performance: {decodeURIComponent(domain || '')}</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('1')}
            className={`px-4 py-2 rounded-lg ${dateRange === '1' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            24 hours
          </button>
          <button
            onClick={() => setDateRange('7')}
            className={`px-4 py-2 rounded-lg ${dateRange === '7' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            7 days
          </button>
          <button
            onClick={() => setDateRange('28')}
            className={`px-4 py-2 rounded-lg ${dateRange === '28' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            28 days
          </button>
          <button
            onClick={() => setDateRange('90')}
            className={`px-4 py-2 rounded-lg ${dateRange === '90' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            3 months
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load performance data. Please try again.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Clicks</h3>
            <p className="text-3xl font-bold">
              {data?.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Impressions</h3>
            <p className="text-3xl font-bold">
              {data?.reduce((sum, item) => sum + item.impressions, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Average CTR</h3>
            <p className="text-3xl font-bold">
              {(data?.reduce((sum, item) => sum + item.ctr, 0) / (data?.length || 1)).toFixed(2)}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Average Position</h3>
            <p className="text-3xl font-bold">
              {(data?.reduce((sum, item) => sum + item.position, 0) / (data?.length || 1)).toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
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
      )}
    </div>
  );
}