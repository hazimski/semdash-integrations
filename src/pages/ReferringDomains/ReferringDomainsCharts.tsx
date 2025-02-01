import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ReferringDomainsChartsProps {
  data: Array<{
    date: string;
    referring_main_domains: number;
    new_referring_domains: number;
    lost_referring_domains: number;
    backlinks: number;
    rank: number;
  }>;
  isLoading: boolean;
}

export function ReferringDomainsCharts({ data, isLoading }: ReferringDomainsChartsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showBacklinks, setShowBacklinks] = useState(false);
  const [showDomainRating, setShowDomainRating] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM yyyy');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-[300px] bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Transform data for the charts
  const transformedData = data.map(item => ({
    ...item,
    // Keep new_referring_domains positive
    new_referring_domains: Math.abs(item.new_referring_domains),
    // Make lost_referring_domains negative
    lost_referring_domains: -Math.abs(item.lost_referring_domains),
    date: new Date(item.date)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Referring Domains Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Referring Domains</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
          {isExpanded && (
            <div className="mt-4 flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showBacklinks}
                  onChange={(e) => setShowBacklinks(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Backlinks</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showDomainRating}
                  onChange={(e) => setShowDomainRating(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Domain Rating</span>
              </label>
            </div>
          )}
        </div>
        
        {isExpanded && (
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                />
                {(showBacklinks || showDomainRating) && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                  />
                )}
                <Tooltip
                  labelFormatter={(label: Date) => formatDate(label.toISOString())}
                  formatter={(value: number, name: string) => {
                    switch (name) {
                      case 'referring_main_domains':
                        return [`${value} domains`, 'Referring Domains'];
                      case 'backlinks':
                        return [`${value} links`, 'Backlinks'];
                      case 'rank':
                        return [value, 'Domain Rating'];
                      default:
                        return [value, name];
                    }
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="referring_main_domains"
                  name="Referring Domains"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  yAxisId="left"
                  dot={false}
                />
                {showBacklinks && (
                  <Line
                    type="monotone"
                    dataKey="backlinks"
                    name="Backlinks"
                    stroke="#34D399"
                    strokeWidth={2}
                    yAxisId="right"
                    dot={false}
                  />
                )}
                {showDomainRating && (
                  <Line
                    type="monotone"
                    dataKey="rank"
                    name="Domain Rating"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    yAxisId="right"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* New and Lost Domains Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">New and Lost Referring Domains</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(label: Date) => formatDate(label.toISOString())}
                  formatter={(value: number, name: string) => [
                    Math.abs(value),
                    name === 'new_referring_domains' ? 'New' : 'Lost'
                  ]}
                />
                <Legend 
                  payload={[
                    { value: 'New', type: 'rect', color: '#60A5FA' },
                    { value: 'Lost', type: 'rect', color: '#F87171' }
                  ]}
                />
                <Bar 
                  dataKey="new_referring_domains" 
                  name="New" 
                  fill="#60A5FA"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="lost_referring_domains" 
                  name="Lost" 
                  fill="#F87171"
                  radius={[0, 0, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
