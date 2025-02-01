import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatNumber } from '../../utils/format';

interface PerformanceChartProps {
  data: Array<{
    date: string;
    metrics: {
      organic: {
        etv?: number;
        count?: number;
      } | null;
    } | null;
  }>;
  isLoading: boolean;
  error: string | null;
}

const metrics = [
  { key: 'Traffic', color: '#2BB2FF' },
  { key: 'Keywords', color: '#FF8C42' }
];

export function PerformanceChart({ data, isLoading, error }: PerformanceChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(['Traffic', 'Keywords']));

  const toggleMetric = (metric: string) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(metric)) {
      newSelected.delete(metric);
    } else {
      newSelected.add(metric);
    }
    setSelectedMetrics(newSelected);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  const chartData = data.map(item => {
    const formattedDate = format(parseISO(item.date), 'MMM yyyy');
    const organic = item.metrics?.organic || {};
    return {
      date: formattedDate,
      Traffic: organic.etv || 0,
      Keywords: organic.count || 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4">
        {metrics.map(metric => (
          <button
            key={metric.key}
            onClick={() => toggleMetric(metric.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedMetrics.has(metric.key)
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={{
              backgroundColor: selectedMetrics.has(metric.key) ? metric.color : undefined
            }}
          >
            {metric.key}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map(metric => (
              selectedMetrics.has(metric.key) && (
                <Line
                  key={metric.key}
                  yAxisId={metric.key === 'Traffic' ? 'left' : 'right'}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}