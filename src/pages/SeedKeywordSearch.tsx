import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SeedKeywordForm } from '../components/seed/SeedKeywordForm';
import { WistiaVideoSection } from '../components/shared/VideoSection';


export function SeedKeywordSearch() {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      keyword,
      location,
      language
    });
    navigate(`/seed/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Seed Keyword Research
          </h1>
          <p className="text-lg text-gray-600">
            Discover longtail keywords and their metrics
          </p>
        </div>

        <SeedKeywordForm onSearch={handleSearch} />
{/* Add the Wistia video section */}
        <WistiaVideoSection
          mediaId="fnmuga691g" // Replace with the actual media ID of the Wistia video
        />
      </div>
    </div>
  );
}
