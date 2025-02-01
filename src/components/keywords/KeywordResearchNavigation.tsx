import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface KeywordResearchNavigationProps {
  keyword: string;
  location: string;
  language: string;
}

export function KeywordResearchNavigation({ keyword, location, language }: KeywordResearchNavigationProps) {
  const currentPath = useLocation().pathname.split('/')[1];

  const links = [
    { path: 'seed', label: 'Longtail Keywords' },
    { path: 'serp', label: 'People Also Search' },
    { path: 'ppa', label: 'People Also Ask' }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {links.map(link => {
          const isActive = currentPath === link.path;
          const searchParams = new URLSearchParams({
            keyword,
            location,
            language
          });

          return (
            <Link
              key={link.path}
              to={`/${link.path}/results?${searchParams.toString()}`}
              className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
