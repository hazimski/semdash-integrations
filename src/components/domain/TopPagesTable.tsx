import React from 'react';
import { formatNumber } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface TopPagesTableProps {
  pages: Array<{
    page_address: string;
    keywords: number;
    traffic: number;
  }>;
  totalCount: number;
  isLoading: boolean;
  currentParams?: {
    domain: string;
    location: string;
    language: string;
  } | null;
}

export function TopPagesTable({ pages = [], totalCount = 0, isLoading, currentParams }: TopPagesTableProps) {
  const navigate = useNavigate();

  // Take only top 5 pages for overview
  const displayPages = currentParams ? pages.slice(0, 5) : pages;

  const handleViewAll = () => {
    if (currentParams) {
      const searchParams = new URLSearchParams({
        domain: currentParams.domain,
        location: currentParams.location,
        language: currentParams.language
      });
      navigate(`/pages?${searchParams.toString()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Pages
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
                URL
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
            {displayPages.map((page, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="truncate max-w-md">
                    <a 
                      href={page.page_address} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {page.page_address}
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(page.keywords)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(page.traffic)}
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
            View all pages
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
