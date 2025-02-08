
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface InfoDropdownProps {
  tldData: Record<string, number>;
  referringIps: number;
  attributesData?: Record<string, number>;
  platformTypesData?: Record<string, number>;
  semanticLocationsData?: Record<string, number>;
  countriesData?: Record<string, number>;
}

export function InfoDropdown({ 
  tldData, 
  referringIps,
  attributesData,
  platformTypesData,
  semanticLocationsData,
  countriesData
}: InfoDropdownProps) {
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

  function formatNumber(num: number): string {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  function getTop6Entries(data: Record<string, number> | undefined): [string, number][] {
    if (!data) return [];
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-blue-600 hover:text-blue-800"
      >
        <span className="mr-1">more</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-20 w-80 p-4 mt-2 bg-white rounded-lg shadow-lg -left-24 top-full overflow-y-auto max-h-96"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Top TLDs</h4>
              {getTop6Entries(tldData).map(([tld, count]) => (
                <div key={tld} className="flex justify-between items-center">
                  <span className="text-gray-700">.{tld}</span>
                  <span className="text-blue-600 font-medium">{formatNumber(count)}</span>
                </div>
              ))}
            </div>

            {attributesData && (
              <div>
                <h4 className="font-medium mb-2">Link Attributes</h4>
                {getTop6Entries(attributesData).map(([attr, count]) => (
                  <div key={attr} className="flex justify-between items-center">
                    <span className="text-gray-700">{attr}</span>
                    <span className="text-blue-600 font-medium">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            )}

            {platformTypesData && (
              <div>
                <h4 className="font-medium mb-2">Platform Types</h4>
                {getTop6Entries(platformTypesData).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-700">{type || 'Unknown'}</span>
                    <span className="text-blue-600 font-medium">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            )}

            {semanticLocationsData && (
              <div>
                <h4 className="font-medium mb-2">Semantic Locations</h4>
                {getTop6Entries(semanticLocationsData).map(([loc, count]) => (
                  <div key={loc} className="flex justify-between items-center">
                    <span className="text-gray-700">{loc || 'Unknown'}</span>
                    <span className="text-blue-600 font-medium">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            )}

            {countriesData && (
              <div>
                <h4 className="font-medium mb-2">Countries</h4>
                {getTop6Entries(countriesData).map(([country, count]) => (
                  <div key={country} className="flex justify-between items-center">
                    <span className="text-gray-700">{country || 'Unknown'}</span>
                    <span className="text-blue-600 font-medium">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Referring IPs</span>
                <span className="text-blue-600 font-medium">{formatNumber(referringIps)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
