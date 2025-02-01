import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface KeywordOptionsMenuProps {
  keyword: string;
  locationCode: string;
  languageCode: string;
}

export function KeywordOptionsMenu({ keyword, locationCode, languageCode }: KeywordOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (route: string) => {
    const searchParams = new URLSearchParams({
      keyword,
      location: locationCode,
      language: languageCode,
      autoAnalyze: 'true'
    });

    // Add depth=2 for SERP route
    if (route === '/serp') {
      searchParams.append('depth', '2');
    }

    navigate(`${route}/results?${searchParams.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div 
        className="flex items-center space-x-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span className="text-gray-900 line-clamp-2 max-w-[300px]">{keyword}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            <button
              onClick={() => handleOptionClick('/keyword-overview')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Keyword Overview
            </button>
            <button
              onClick={() => handleOptionClick('/seed')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Longtail Keywords
            </button>
            <button
              onClick={() => handleOptionClick('/serp')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              People Also Search
            </button>
            <button
              onClick={() => handleOptionClick('/ppa')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              People Also Ask
            </button>
          </div>
        </div>
      )}
    </div>
  );
}