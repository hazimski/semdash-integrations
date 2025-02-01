import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchForm } from './SearchForm';

export function PagesByLinks() {
  const navigate = useNavigate();

  const handleSearch = (domain: string, includeSubdomains: boolean, brokenPages: boolean, excludeQueryParams: boolean) => {
    const searchParams = new URLSearchParams({
      domain,
      includeSubdomains: includeSubdomains.toString(),
      brokenPages: brokenPages.toString(),
      excludeQueryParams: excludeQueryParams.toString()
    });
    navigate(`/pages-by-links/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Pages By Links Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Analyze pages and their backlink profiles
          </p>
        </div>

        <SearchForm onSearch={handleSearch} />
      </div>
    </div>
  );
}