import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DomainKeyword } from '../../types';

interface KeywordChartProps {
  keyword: DomainKeyword;
}

export function KeywordChart({ keyword }: KeywordChartProps) {
  const data = keyword.monthlySearches.map(search => ({
    date: `${search.year}-${String(search.month).padStart(2, '0')}`,
    volume: search.searchVolume
  }));

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [value, 'Search Volume']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="volume" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
