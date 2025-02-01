import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-10 w-64 p-4 mt-2 bg-white rounded-lg shadow-lg -left-24 top-full"
        >
          <h3 className="text-lg font-semibold mb-3">Domain Rank Scale</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">New domains</span>
              <span className="font-medium">25-35</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Large Domains</span>
              <span className="font-medium">200-300</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Huge domains</span>
              <span className="font-medium">500+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
