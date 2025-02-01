import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface InfoDropdownProps {
  tldData: Record<string, number>;
  referringIps: number;
}

export function InfoDropdown({ tldData, referringIps }: InfoDropdownProps) {
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
          className="absolute z-20 w-64 p-4 mt-2 bg-white rounded-lg shadow-lg -left-24 top-full"
        >
          <div className="space-y-2">
            {Object.entries(tldData).map(([tld, count]) => (
              <div key={tld} className="flex justify-between items-center">
                <span className="text-gray-700">.{tld}</span>
                <span className="text-blue-600 font-medium">{formatNumber(count)}</span>
              </div>
            ))}
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
