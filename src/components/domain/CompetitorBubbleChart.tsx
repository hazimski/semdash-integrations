import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatNumber } from '../../utils/format';

interface CompetitorData {
  domain: string;
  keywords: number;
  traffic: number;
}

interface CompetitorBubbleChartProps {
  competitors: CompetitorData[];
}

// Define colors with 0.5 opacity
const COLORS = [
  'rgba(96, 165, 250, 0.5)',   // blue
  'rgba(52, 211, 153, 0.5)',   // green
  'rgba(249, 115, 22, 0.5)',   // orange
  'rgba(167, 139, 250, 0.5)',  // purple
  'rgba(251, 191, 36, 0.5)',   // yellow
  'rgba(236, 72, 153, 0.5)'    // pink
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold mb-2">{data.domain}</p>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Keywords: <span className="font-medium text-gray-900">{formatNumber(data.keywords)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Traffic: <span className="font-medium text-gray-900">{formatNumber(data.traffic)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function CompetitorBubbleChart({ competitors }: CompetitorBubbleChartProps) {
  const [hiddenDomains, setHiddenDomains] = useState<Set<string>>(new Set());

  const toggleDomain = (domain: string) => {
    const newHiddenDomains = new Set(hiddenDomains);
    if (hiddenDomains.has(domain)) {
      newHiddenDomains.delete(domain);
    } else {
      newHiddenDomains.add(domain);
    }
    setHiddenDomains(newHiddenDomains);
  };

  // Filter out hidden domains
  const visibleCompetitors = competitors.filter(
    competitor => !hiddenDomains.has(competitor.domain)
  );

  // Find max traffic for scaling
  const maxTraffic = Math.max(...visibleCompetitors.map(c => c.traffic));
  
  // Calculate relative sizes based on traffic
  const chartData = visibleCompetitors.map((competitor, index) => {
    // Calculate relative size (between 0 and 1)
    const relativeSize = competitor.traffic / maxTraffic;
    
    // Scale the size between 100 (minimum) and 2000 (maximum)
    const size = 100 + (relativeSize * 1900);
    
    return {
      ...competitor,
      z: size, // This will determine the bubble size
      fill: COLORS[competitors.findIndex(c => c.domain === competitor.domain) % COLORS.length]
    };
  });

  // Calculate chart dimensions
  const maxKeywords = Math.max(...visibleCompetitors.map(c => c.keywords), 1);
  const maxChartTraffic = Math.max(...visibleCompetitors.map(c => c.traffic), 1);

  return (
    <div className="h-[270px]">
      <div className="flex flex-wrap gap-3 mb-2">
        {competitors.map((competitor, index) => (
          <button
            key={competitor.domain}
            onClick={() => toggleDomain(competitor.domain)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              hiddenDomains.has(competitor.domain)
                ? 'bg-gray-100 text-gray-500 line-through'
                : 'text-gray-900'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {competitor.domain}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true}
            vertical={true}
            horizontalPoints={[0, maxChartTraffic * 0.25, maxChartTraffic * 0.5, maxChartTraffic * 0.75, maxChartTraffic]}
            verticalPoints={[
              0,
              maxKeywords * 0.166,
              maxKeywords * 0.333,
              maxKeywords * 0.5,
              maxKeywords * 0.666,
              maxKeywords * 0.833,
              maxKeywords
            ]}
          />
          <XAxis
            type="number"
            dataKey="keywords"
            name="Keywords"
            tickFormatter={formatNumber}
            domain={[0, maxKeywords * 1.1]}
            label={{ value: 'Organic Keywords', position: 'bottom', offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="traffic"
            name="Traffic"
            tickFormatter={formatNumber}
            domain={[0, maxChartTraffic * 1.1]}
            label={{ value: 'Organic Search Traffic', angle: -90, position: 'left', offset: 0 }}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[100, 2000]}
          />
          <Tooltip content={<CustomTooltip />} />
          {chartData.map((data) => (
            <Scatter
              key={data.domain}
              name={data.domain}
              data={[data]}
              fill={data.fill}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
