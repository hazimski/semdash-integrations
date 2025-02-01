import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { fetchGoogleSearchConsolePerformance } from '../../services/googleSearchConsole';
import { formatNumber } from '../../utils/format';

interface MetricFilter {
  min?: number;
  max?: number;
}

interface MetricFilters {
  clicks?: MetricFilter;
  impressions?: MetricFilter;
  ctr?: MetricFilter;
  position?: MetricFilter;
}

export function GoogleSearchConsolePerformance() {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [activeDimension, setActiveDimension] = useState<'query' | 'page'>('query');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPagesPage, setCurrentPagesPage] = useState(1);
  const [selectedQueries, setSelectedQueries] = useState<Set<string>>(new Set());
  const itemsPerPage = 100;
  const [metricFilters, setMetricFilters] = useState<MetricFilters>({});
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  const filterData = (data: any[]) => {
    if (!data) return [];
    
    return data.filter(row => {
      if (metricFilters.clicks) {
        if (metricFilters.clicks.min !== undefined && row.clicks < metricFilters.clicks.min) return false;
        if (metricFilters.clicks.max !== undefined && row.clicks > metricFilters.clicks.max) return false;
      }
      if (metricFilters.impressions) {
        if (metricFilters.impressions.min !== undefined && row.impressions < metricFilters.impressions.min) return false;
        if (metricFilters.impressions.max !== undefined && row.impressions > metricFilters.impressions.max) return false;
      }
      if (metricFilters.ctr) {
        if (metricFilters.ctr.min !== undefined && row.ctr < metricFilters.ctr.min) return false;
        if (metricFilters.ctr.max !== undefined && row.ctr > metricFilters.ctr.max) return false;
      }
      if (metricFilters.position) {
        if (metricFilters.position.min !== undefined && row.position < metricFilters.position.min) return false;
        if (metricFilters.position.max !== undefined && row.position > metricFilters.position.max) return false;
      }
      return true;
    });
  };

  const handleMetricFilterChange = (metric: keyof MetricFilters, type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setMetricFilters(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [type]: numValue
      }
    }));
  };

  const renderMetricFilters = () => (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {['clicks', 'impressions', 'ctr', 'position'].map((metric) => (
        <div key={metric} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 capitalize">
            {metric}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={metricFilters[metric as keyof MetricFilters]?.min || ''}
              onChange={(e) => handleMetricFilterChange(metric as keyof MetricFilters, 'min', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={metricFilters[metric as keyof MetricFilters]?.max || ''}
              onChange={(e) => handleMetricFilterChange(metric as keyof MetricFilters, 'max', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filterData(timeSeriesData?.slice(startIndex, endIndex) || []);

  const handleExport = () => {
    if (!currentData?.length) return;

    const csvContent = [
      // CSV Headers
      ['Key', 'Clicks', 'Impressions', 'CTR', 'Position'].join(','),
      // CSV Data rows
      ...currentData.map(row => [
        `"${row.key}"`,
        row.clicks,
        row.impressions,
        `${row.ctr.toFixed(2)}%`,
        row.position.toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `gsc-performance-${activeDimension}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDomainChange = (value: string) => {
    navigate(`/google-search-console/performance/${encodeURIComponent(value)}`);
  };

  const handleSelectAll = () => {
    if (currentData?.length) {
      if (selectedQueries.size === currentData.length) {
        setSelectedQueries(new Set());
      } else {
        setSelectedQueries(new Set(currentData.map(row => row.key)));
      }
    }
  };

  const handleSelectQuery = (key: string) => {
    const newSelected = new Set(selectedQueries);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedQueries(newSelected);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Performance: {domain}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveDimension('query')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeDimension === 'query'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Queries
                </button>
                <button
                  onClick={() => setActiveDimension('page')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeDimension === 'page'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pages
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExport}
                  disabled={!currentData?.length}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>

            {renderMetricFilters()}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentData?.length > 0 && selectedQueries.size === currentData.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeDimension === 'query' ? 'Query' : 'Page'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData?.map((row, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectQuery(row.key)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedQueries.has(row.key)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectQuery(row.key);
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(row.clicks)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(row.impressions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.ctr.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}