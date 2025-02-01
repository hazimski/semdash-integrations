import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils/format';

interface KeywordTrendChartProps {
  monthlySearches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
}

export function KeywordTrendChart({ monthlySearches }: KeywordTrendChartProps) {
  if (!monthlySearches || monthlySearches.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }

  // Sort data chronologically and format for chart
  const chartData = [...monthlySearches]
    .sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1);
      const dateB = new Date(b.year, b.month - 1);
      return dateA.getTime() - dateB.getTime();
    })
    .map(item => ({
      date: new Date(item.year, item.month - 1),
      search_volume: item.search_volume
    }));

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
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          tickFormatter={(date: Date) => date.toLocaleDateString('default', { 
            month: 'short',
            year: '2-digit'
          })}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="search_volume"
          stroke="#60A5FA"
          strokeWidth={2}
          dot={{ r: 3, fill: '#60A5FA' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
