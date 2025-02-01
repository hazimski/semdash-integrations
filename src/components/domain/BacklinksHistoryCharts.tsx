import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils/format';
import { Info } from 'lucide-react';

interface BacklinksHistoryData {
  date: string;
  referring_domains: number;
  backlinks: number;
}

interface BacklinksHistoryChartsProps {
  data: BacklinksHistoryData[] | null;
  isLoading: boolean;
}

export function BacklinksHistoryCharts({ data, isLoading }: BacklinksHistoryChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-[400px] bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Sort data chronologically and format dates
  const sortedData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      date: new Date(item.date).toISOString().split('T')[0] // Ensure consistent date format
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('default', { 
        month: 'long', 
        year: 'numeric' 
      });

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-2">{formattedDate}</p>
          <p className="text-sm text-gray-600">
            {payload[0].name === 'referring_domains' ? 'Referring Domains: ' : 'Backlinks: '}
            <span className="font-medium text-gray-900">
              {formatNumber(payload[0].value)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('default', { 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Referring Domains Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Referring Domains</h2>
          <Info className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <AreaChart data={sortedData}>
              <defs>
                <linearGradient id="referring_domains_gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis 
                dataKey="date"
                tickFormatter={formatXAxis}
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
              <Area
                type="monotone"
                dataKey="referring_domains"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#referring_domains_gradient)"
                dot={false}
                activeDot={{ r: 6, fill: '#22C55E' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Backlinks Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Backlinks</h2>
          <Info className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <AreaChart data={sortedData}>
              <defs>
                <linearGradient id="backlinks_gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis 
                dataKey="date"
                tickFormatter={formatXAxis}
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
              <Area
                type="monotone"
                dataKey="backlinks"
                stroke="#60A5FA"
                strokeWidth={2}
                fill="url(#backlinks_gradient)"
                dot={false}
                activeDot={{ r: 6, fill: '#60A5FA' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
