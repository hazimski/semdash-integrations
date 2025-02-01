import React, { useRef } from 'react';
import { Phone, Globe, MapPin, Star, Award, Download, Search } from 'lucide-react';
import { saveAs } from 'file-saver';

interface MapsResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  check_url: string;
  title: string;
  contact_url: string | null;
  contributor_url: string | null;
  rating: {
    value: number;
    votes_count: number;
  } | null;
  snippet: string;
  address: string;
  place_id: string;
  phone: string | null;
  main_image: string | null;
  category: string;
  latitude: number;
  longitude: number;
  is_claimed: boolean;
  contributor_url: string | null;
}

interface MapsResultsViewProps {
  results: MapsResult[];
  isLoading: boolean;
  keyword: string; 
}

export function MapsResultsView({ results, isLoading, keyword }: MapsResultsViewProps) {
  const handleExport = () => {
    if (!results.length) return;

    const headers = [
      'Rank',
      'Business Name',
      'Category',
      'Rating',
      'Reviews',
      'Phone',
      'Address',
      'Is Claimed',
      'Website'
    ];

    const csvData = results.map(result => [
      result.rank_absolute,
      result.title,
      result.category || '',
      result.rating?.value || '',
      result.rating?.votes_count || '',
      result.phone || '',
      result.address,
      result.is_claimed ? 'Yes' : 'No',
      result.contact_url || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        row.map(cell =>
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `maps-results-${keyword.toLowerCase().replace(/\s+/g, '-')}.csv`);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Results for: {keyword}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => results[0] && window.open(results[0].check_url, '_blank')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Search className="h-4 w-4 mr-2" />
            Search URL
          </button>
          <button
            onClick={handleExport}
            disabled={results.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(result => (
          <div
            key={result.place_id} 
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl"
            onClick={() => result.contact_url && window.open(result.contact_url, '_blank')}
          >
            {result.main_image && (
              <div className="relative">
                <img
                  src={result.main_image}
                  alt={result.title}
                  className="w-full h-48 object-cover"
                />
                {result.is_claimed && (
                  <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Claimed
                  </span>
                )}
              </div>
            )}
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    <span className="flex items-center">
                      {result.title}
                      {result.contact_url && (
                        <Globe className="w-4 h-4 ml-2 text-blue-600" />
                      )}
                    </span>
                  </h3>
                </div>
              </div>

              {result.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1 text-gray-900">{result.rating.value}</span>
                  </div>
                  <span className="text-gray-500">({result.rating.votes_count} reviews)</span>
                </div>
              )}

              <div className="space-y-2 text-sm">
                {result.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${result.phone}`} className="text-blue-600 hover:text-blue-800">
                      {result.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  {result.contributor_url ? (
                    <a
                      href={result.contributor_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {result.address}
                    </a>
                  ) : (
                    <span className="text-gray-600">{result.address}</span>
                  )}
                </div>
              </div>

              {result.category && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                   Maps Rank: #{result.rank_absolute}
                  </span>
                  
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
