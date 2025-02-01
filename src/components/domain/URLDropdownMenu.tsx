import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface URLDropdownMenuProps {
  domain: string;
  locationCode: string;
  languageCode: string;
}

export function URLDropdownMenu({ domain, locationCode, languageCode }: URLDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTopPagesClick = () => {
    const searchParams = new URLSearchParams({
      domain,
      location: locationCode,
      language: languageCode
    });
    navigate(`/pages/results?${searchParams.toString()}`);
    setIsOpen(false);
  };

  const handleTopKeywordsClick = () => {
    const searchParams = new URLSearchParams({
      domain,
      location: locationCode,
      language: languageCode
    });
    navigate(`/ranked-keywords/results?${searchParams.toString()}`);
    setIsOpen(false);
  };

  const handleDomainOverviewClick = () => {
    const searchParams = new URLSearchParams({
      domain,
      location: locationCode,
      language: languageCode
    });
    navigate(`/overview/results?${searchParams.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <a 
          href={`https://${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#008A43] hover:text-[#006832]"
          onClick={(e) => e.stopPropagation()}
        >
          {domain}
        </a>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <button
              onClick={handleDomainOverviewClick}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              Domain Overview
            </button>
            <button
              onClick={handleTopPagesClick}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              Top Pages
            </button>
            <button
              onClick={handleTopKeywordsClick}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              Top Keywords
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
