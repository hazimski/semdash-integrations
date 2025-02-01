import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface OrganicKeywordsChartProps {
  data: Array<{
    date: string;
    metrics: {
      organic: {
        pos_1?: number;
        pos_2_3?: number;
        pos_4_10?: number;
        pos_11_20?: number;
        pos_21_30?: number;
        pos_31_40?: number;
        pos_41_50?: number;
        pos_51_60?: number;
        pos_61_70?: number;
        pos_71_80?: number;
        pos_81_90?: number;
        pos_91_100?: number;
      } | null;
    } | null;
  }>;
  isLoading: boolean;
  error: string | null;
}

const positionGroups = [
  { key: 'top_3', label: 'Top 3', color: '#FDC13C' },
  { key: 'pos_4_10', label: 'Positions 4-10', color: '#016DC9' },
  { key: 'pos_11_20', label: 'Positions 11-20', color: '#008FF7' },
  { key: 'pos_21_50', label: 'Positions 21-50', color: '#2BB2FF' },
  { key: 'pos_51_100', label: 'Positions 51-100', color: '#8ECCFE' }
];

export function OrganicKeywordsChart({ data, isLoading, error }: OrganicKeywordsChartProps) {
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set(['top_3', 'pos_4_10']));

  const togglePosition = (position: string) => {
    const newSelected = new Set(selectedPositions);
    if (newSelected.has(position)) {
      newSelected.delete(position);
    } else {
      newSelected.add(position);
    }
    setSelectedPositions(newSelected);
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
      top_3: (organic.pos_1 || 0) + (organic.pos_2_3 || 0),
      pos_4_10: organic.pos_4_10 || 0,
      pos_11_20: organic.pos_11_20 || 0,
      pos_21_50: (organic.pos_21_30 || 0) + (organic.pos_31_40 || 0) + (organic.pos_41_50 || 0),
      pos_51_100: (organic.pos_51_60 || 0) + (organic.pos_61_70 || 0) + (organic.pos_71_80 || 0) + (organic.pos_81_90 || 0) + (organic.pos_91_100 || 0)
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
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
        {positionGroups.map(group => (
          <button
            key={group.key}
            onClick={() => togglePosition(group.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedPositions.has(group.key)
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={{
              backgroundColor: selectedPositions.has(group.key) ? group.color : undefined
            }}
          >
            {group.label}
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
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {positionGroups.map(group => (
              selectedPositions.has(group.key) && (
                <Line
                  key={group.key}
                  type="monotone"
                  dataKey={group.key}
                  name={group.label}
                  stroke={group.color}
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