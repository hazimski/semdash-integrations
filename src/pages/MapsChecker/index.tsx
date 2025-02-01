import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapsSearchForm } from './MapsSearchForm';

export function MapsChecker() {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      keyword,
      location,
      language
    });
    navigate(`/maps-checker/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Google Maps SERP Checker
          </h1>
          <p className="text-lg text-gray-600">
            Analyze local business rankings and visibility in Google Maps search results
          </p>
        </div>

        <MapsSearchForm onSearch={handleSearch} />
      </div>
    </div>
  );
}
