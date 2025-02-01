import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { Search, Download, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { KeywordListActions } from '../../components/keywords/KeywordListActions';
import { formatNumber } from '../../utils/format';

export function GoogleSearchConsolePerformance() {
  const { domain } = useParams<{ domain: string }>();
  const [dateRange, setDateRange] = useState('28');
  const [activeDimension, setActiveDimension] = useState<'query' | 'page' | 'country' | 'device' | 'searchAppearance'>('query');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPagesPage, setCurrentPagesPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedQueries, setSelectedQueries] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const totalItems = dimensionData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getCurrentPage = () => {
    return activeDimension === 'page' ? currentPagesPage : currentPage;
  };

  const startIndex = (getCurrentPage() - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = dimensionData?.slice(startIndex, endIndex) || [];

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
    toast.success('CSV file exported successfully');
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

  const handlePageChange = (newPage: number) => {
    if (activeDimension === 'page') {
      setCurrentPagesPage(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-1">
            {date.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-600">
            Search Volume: <span className="font-medium text-gray-900">{formatNumber(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
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
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip content={<CustomTooltip />} />
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
  );
}
