import React from 'react';
import { formatNumber } from '../../utils/format';
import { CompetitorBubbleChart } from './CompetitorBubbleChart';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { URLDropdownMenu } from './URLDropdownMenu';

interface CompetitorData {
  domain: string;
  keywords: number;
  traffic: number;
}

interface CompetitorsTableProps {
  competitors: CompetitorData[];
  totalCount: number;
  isLoading: boolean;
  currentParams?: {
    domain: string;
    location: string;
    language: string;
  } | null;
}

export function CompetitorsTable({ competitors, totalCount, isLoading, currentParams }: CompetitorsTableProps) {
  const navigate = useNavigate();

  // Take only top 6 competitors for overview
  const displayCompetitors = currentParams ? competitors.slice(0, 6) : competitors;

  const handleViewAll = () => {
    if (currentParams) {
      const searchParams = new URLSearchParams({
        domain: currentParams.domain,
        location: currentParams.location,
        language: currentParams.language
      });
      navigate(`/competitors?${searchParams.toString()}`);
    }
  };

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

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Competitor Domains
            </h2>
            <span className="text-sm text-gray-500">
              Total: {formatNumber(totalCount)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keywords
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Traffic
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayCompetitors.map((competitor, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <URLDropdownMenu
                      domain={competitor.domain}
                      locationCode={currentParams?.location || ''}
                      languageCode={currentParams?.language || ''}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(competitor.keywords)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(competitor.traffic)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentParams && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleViewAll}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              View all competitors
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Competitive Positioning Map
          </h2>
        </div>
        <div className="p-6">
          <CompetitorBubbleChart competitors={displayCompetitors} />
        </div>
      </div>
    </div>
  );
}