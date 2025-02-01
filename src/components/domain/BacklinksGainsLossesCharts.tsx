import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { formatNumber } from '../../utils/format';
import { Info } from 'lucide-react';

interface BacklinksHistoryData {
  date: string;
  new_referring_domains: number;
  lost_referring_domains: number;
  new_backlinks: number;
  lost_backlinks: number;
}

interface BacklinksGainsLossesChartsProps {
  data: BacklinksHistoryData[] | null;
  isLoading: boolean;
}

export function BacklinksGainsLossesCharts({ data, isLoading }: BacklinksGainsLossesChartsProps) {
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

  // Sort data chronologically and transform data
  const transformedData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: item.date,
      // Keep new values positive
      new_referring_domains: item.new_referring_domains,
      new_backlinks: item.new_backlinks,
      // Make lost values negative
      lost_referring_domains: -item.lost_referring_domains,
      lost_backlinks: -item.lost_backlinks
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
          {payload.map((entry: any) => {
            const isLost = entry.dataKey.startsWith('lost_');
            const value = Math.abs(entry.value);
            const label = entry.dataKey.startsWith('new_') ? 'New' : 'Lost';
            const type = entry.dataKey.includes('referring_domains') ? 'Referring Domains' : 'Backlinks';
            
            return (
              <p key={entry.dataKey} className="text-sm text-gray-600">
                {`${label} ${type}: `}
                <span className="font-medium" style={{ color: entry.color }}>
                  {formatNumber(value)}
                </span>
              </p>
            );
          })}
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

  const formatYAxis = (value: number) => {
    return formatNumber(Math.abs(value));
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Referring Domains Gains/Losses Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">New and Lost Referring Domains</h2>
          <Info className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <BarChart data={transformedData} stackOffset="sign">
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
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#E5E7EB" />
              <Bar 
                dataKey="new_referring_domains" 
                name="New"
                fill="#60A5FA"
                stackId="stack"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="lost_referring_domains" 
                name="Lost"
                fill="#F97316"
                stackId="stack"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Backlinks Gains/Losses Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">New and Lost Backlinks</h2>
          <Info className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <BarChart data={transformedData} stackOffset="sign">
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
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#E5E7EB" />
              <Bar 
                dataKey="new_backlinks" 
                name="New"
                fill="#60A5FA"
                stackId="stack"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="lost_backlinks" 
                name="Lost"
                fill="#F97316"
                stackId="stack"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
