import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BacklinksNavigationProps {
  target: string;
}

export function BacklinksNavigation({ target }: BacklinksNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1]; // Get the first part of the path

  const links = [
    { path: 'botox', label: 'Backlinks' },
    { path: 'referring-domains', label: 'Referring Domains' },
    { path: 'pages-by-links', label: 'Pages by Links' }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {links.map(link => {
          const isActive = currentPath === link.path;
          const searchParams = new URLSearchParams();
          
          // Add appropriate parameters based on the route
          if (link.path === 'botox') {
            searchParams.set('target', target);
            searchParams.set('includeSubdomains', 'true');
          } else if (link.path === 'referring-domains') {
            searchParams.set('target', target);
            searchParams.set('includeSubdomains', 'true');
          } else if (link.path === 'pages-by-links') {
            searchParams.set('domain', target);
            searchParams.set('includeSubdomains', 'true');
            searchParams.set('excludeQueryParams', 'true');
          }

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
