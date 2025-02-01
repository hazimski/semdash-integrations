import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PPASearchForm } from './PPASearchForm';

export function PPA() {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      keyword,
      location,
      language
    });
    navigate(`/ppa/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            People Also Ask Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Discover related questions and their answers for any keyword
          </p>
        </div>

        <PPASearchForm onSearch={handleSearch} />
      </div>
    </div>
  );
}
