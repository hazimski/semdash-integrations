import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber } from '../../utils/format';

interface PageSummaryData {
  broken_backlinks?: number;
  broken_pages?: number;
  referring_domains?: number;
  referring_domains_nofollow?: number;
  referring_main_domains?: number;
  referring_main_domains_nofollow?: number;
  referring_ips?: number;
  referring_subnets?: number;
  referring_pages?: number;
  referring_pages_nofollow?: number;
  referring_links_tld?: Record<string, number>;
  referring_links_types?: {
    anchor?: number;
    alternate?: number;
    canonical?: number;
    image?: number;
  };
  referring_links_attributes?: {
    nofollow?: number;
    noopener?: number;
    noreferrer?: number;
    external?: number;
  };
  referring_links_platform_types?: Record<string, number>;
  referring_links_semantic_locations?: Record<string, number>;
  referring_links_countries?: Record<string, number>;
}

interface PageSummaryDropdownProps {
  data?: PageSummaryData | null;
}

export function PageSummaryDropdown({ data }: PageSummaryDropdownProps) {
  // Return null if no data is provided
  if (!data) return null;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTop5Entries = (obj?: Record<string, number>) => {
    if (!obj) return [];
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="p-4 space-y-4">
            {/* Basic Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Backlinks</h4>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-600">
                    Broken: {formatNumber(data.broken_backlinks || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pages: {formatNumber(data.referring_pages || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    NoFollow: {formatNumber(data.referring_pages_nofollow || 0)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Referring Domains</h4>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-600">
                    Total: {formatNumber(data.referring_domains || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    NoFollow: {formatNumber(data.referring_domains_nofollow || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Main: {formatNumber(data.referring_main_domains || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Infrastructure */}
            <div>
              <h4 className="text-sm font-medium text-gray-700">Infrastructure</h4>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <p className="text-sm text-gray-600">
                  IPs: {formatNumber(data.referring_ips || 0)}
                </p>
                <p className="text-sm text-gray-600">
                  Subnets: {formatNumber(data.referring_subnets || 0)}
                </p>
              </div>
            </div>

            {/* Link Types and Link Attributes on the same row */}
            <div className="grid grid-cols-2 gap-4">
              {data.referring_links_types && Object.keys(data.referring_links_types).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Link Types</h4>
                  <div className="mt-1 space-y-1">
                    {Object.entries(data.referring_links_types).map(([type, count]) => (
                      <p key={type} className="text-sm text-gray-600 capitalize">
                        {type}: {formatNumber(count || 0)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {data.referring_links_attributes && Object.keys(data.referring_links_attributes).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Link Attributes</h4>
                  <div className="mt-1 space-y-1">
                    {Object.entries(data.referring_links_attributes).map(([attr, count]) => (
                      <p key={attr} className="text-sm text-gray-600 capitalize">
                        {attr}: {formatNumber(count || 0)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top 5 TLDs and Top 5 Countries on the same row */}
            <div className="grid grid-cols-2 gap-4">
              {data.referring_links_tld && Object.keys(data.referring_links_tld).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Top 5 TLDs</h4>
                  <div className="mt-1 space-y-1">
                    {getTop5Entries(data.referring_links_tld).map(([tld, count]) => (
                      <p key={tld} className="text-sm text-gray-600">
                        .{tld}: {formatNumber(count)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {data.referring_links_countries && Object.keys(data.referring_links_countries).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Top 5 Countries</h4>
                  <div className="mt-1 space-y-1">
                    {getTop5Entries(data.referring_links_countries).map(([country, count]) => (
                      <p key={country} className="text-sm text-gray-600">
                        {country || 'Unknown'}: {formatNumber(count)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
