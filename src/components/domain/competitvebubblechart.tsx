import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from 'recharts';
import { Info } from 'lucide-react';
import { formatNumber } from '../../utils/format';

interface CompetitorData {
  domain: string;
  keywords: number;
  traffic: number;
}

interface CompetitivePositioningMapProps {
  data: CompetitorData[];
  maxCompetitors?: number;
}

// Define a wider range of colors with proper opacity
const COMPETITOR_COLORS = [
  'rgba(96, 165, 250, 0.7)',   // blue
  'rgba(52, 211, 153, 0.7)',   // green
  'rgba(249, 115, 22, 0.7)',   // orange
  'rgba(167, 139, 250, 0.7)',  // purple
  'rgba(251, 191, 36, 0.7)',   // yellow
  'rgba(236, 72, 153, 0.7)',   // pink
  'rgba(14, 165, 233, 0.7)',   // sky blue
  'rgba(168, 85, 247, 0.7)',   // violet
  'rgba(34, 197, 94, 0.7)',    // emerald
  'rgba(239, 68, 68, 0.7)',    // red
];

export function CompetitivePositioningMap({ data, maxCompetitors = 6 }: CompetitivePositioningMapProps) {
  const [visibleCompetitors, setVisibleCompetitors] = useState<Set<string>>(
    new Set(data.slice(0, maxCompetitors).map(c => c.domain))
  );
  const [showTooltip, setShowTooltip] = useState(false);

  const topCompetitors = data.slice(0, maxCompetitors);

  const processedData = topCompetitors.map((competitor, index) => ({
    domain: competitor.domain,
    x: competitor.keywords,
    y: competitor.traffic,
    z: Math.sqrt(competitor.traffic), // Use square root for more reasonable bubble sizes
    color: COMPETITOR_COLORS[index % COMPETITOR_COLORS.length]
  }));

  const filteredData = processedData.filter(item => visibleCompetitors.has(item.domain));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]?.payload) {
      return null;
    }

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{data.domain}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Keywords: <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(data.x)}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Traffic: <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(data.y)}</span>
          </p>
        </div>
      </div>
    );
  };

  const renderLegend = () => (
    <div className="flex flex-wrap gap-4 justify-center mb-4">
      {processedData.map((item) => (
        <button
          key={item.domain}
          onClick={() => {
            const newVisible = new Set(visibleCompetitors);
            if (newVisible.has(item.domain)) {
              newVisible.delete(item.domain);
            } else {
              newVisible.add(item.domain);
            }
            setVisibleCompetitors(newVisible);
          }}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
            visibleCompetitors.has(item.domain)
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
          }`}
        >
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm font-medium">{item.domain}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {renderLegend()}
      
      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              type="number"
              dataKey="x"
              name="Keywords"
              tickFormatter={formatNumber}
              label={{ 
                value: 'Number of Keywords', 
                position: 'bottom',
                offset: 20
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Traffic"
              tickFormatter={formatNumber}
              label={{ 
                value: 'Organic Traffic', 
                angle: -90,
                position: 'left',
                offset: 40
              }}
            />
            <ZAxis
              type="number"
              dataKey="z"
              range={[400, 4000]}
              name="Size"
            />
            <Tooltip content={<CustomTooltip />} />
            {filteredData.map((entry) => (
              <Scatter
                key={entry.domain}
                name={entry.domain}
                data={[entry]}
                fill={entry.color}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
