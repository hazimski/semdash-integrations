import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { formatNumber } from '../../utils/format';
import type { DomainHistoryEntry } from '../../services/domainHistory';

interface DomainHistoryCardProps {
  entry: DomainHistoryEntry;
}

export function DomainHistoryCard({ entry }: DomainHistoryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const searchParams = new URLSearchParams({
      domain: entry.domain,
      location: entry.location_code,
      language: entry.language_code
    });
    navigate(`/overview/results?${searchParams.toString()}`);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-gray-900">{entry.domain}</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {formatDate(entry.created_at)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Domain Rank</p>
          <p className="text-lg font-semibold text-blue-600">
            {entry.metrics.domainRank}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Traffic</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatNumber(entry.metrics.organicTraffic)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Keywords</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatNumber(entry.metrics.keywords)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Backlinks</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatNumber(entry.metrics.backlinks)}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center">
          View Details
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
