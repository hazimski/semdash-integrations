import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchForm } from './SearchForm';

export function SerpChecker() {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      keyword,
      location,
      language
    });
    navigate(`/serp-checker/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            SERP Checker
          </h1>
          <p className="text-lg text-gray-600">
            Track historical SERP positions for any keyword
          </p>
        </div>

        <SearchForm onSearch={handleSearch} />
      </div>
    </div>
  );
}
