import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils/format';

interface PositionDistributionChartProps {
  metrics: {
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
}

export function PositionDistributionChart({ metrics }: PositionDistributionChartProps) {
  if (!metrics) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No position distribution data available
      </div>
    );
  }

  const data = [
    { name: '1', value: metrics.pos_1 || 0 },
    { name: '2-3', value: metrics.pos_2_3 || 0 },
    { name: '4-10', value: metrics.pos_4_10 || 0 },
    { name: '11-20', value: metrics.pos_11_20 || 0 },
    { name: '21-30', value: metrics.pos_21_30 || 0 },
    { name: '31-40', value: metrics.pos_31_40 || 0 },
    { name: '41-50', value: metrics.pos_41_50 || 0 },
    { name: '51-60', value: metrics.pos_51_60 || 0 },
    { name: '61-70', value: metrics.pos_61_70 || 0 },
    { name: '71-80', value: metrics.pos_71_80 || 0 },
    { name: '81-90', value: metrics.pos_81_90 || 0 },
    { name: '91-100', value: metrics.pos_91_100 || 0 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-1">Position: {label}</p>
          <p className="text-sm text-gray-600">
            Keywords: <span className="font-medium text-gray-900">{formatNumber(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="name"
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
            <Bar 
              dataKey="value" 
              fill="#60A5FA"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
