import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RankedKeywordsForm } from './RankedKeywordsForm';
import { WistiaVideoSection } from '../../components/shared/VideoSection';

export function RankedKeywords() {
  const navigate = useNavigate();

  const handleSearch = (domain: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      domain,
      location,
      language
    });
    navigate(`/ranked-keywords/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Ranked Keywords Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Discover all ranking keywords for any domain
          </p>
        </div>

        <RankedKeywordsForm onSearch={handleSearch} />
{/* Add the Wistia video section */}
        <WistiaVideoSection
          mediaId="jnb09gm3lj" // Replace with the actual media ID of the Wistia video
        />
      </div>
    </div>
  );
}
