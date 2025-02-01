import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KeywordSearchForm } from '../components/serp/KeywordSearchForm';
import { WistiaVideoSection } from '../components/shared/VideoSection';

export function SerpKeywordSearch() {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, location: string, language: string, depth: number) => {
    const searchParams = new URLSearchParams({
      keyword,
      location,
      language,
      depth: '3'
    });
    navigate(`/serp/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Keyword Research by SERP
          </h1>
          <p className="text-lg text-gray-600">
            Discover related keywords and their metrics based on search results
          </p>
        </div>

        <KeywordSearchForm onSearch={handleSearch} />
{/* Add the Wistia video section */}
        <WistiaVideoSection
          mediaId="89x0t4cg8b" // Replace with the actual media ID of the Wistia video
        />
      </div>
    </div>
  );
}
