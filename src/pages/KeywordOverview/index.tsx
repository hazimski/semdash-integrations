import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KeywordOverviewForm } from './KeywordOverviewForm';
import { WistiaVideoSection } from '../../components/shared/VideoSection';


export function KeywordOverview() {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      keyword,
      location,
      language
    });
    navigate(`/keyword-overview/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Keyword Overview
          </h1>
          <p className="text-lg text-gray-600">
            Get comprehensive insights about any keyword
          </p>
        </div>

        <KeywordOverviewForm onSearch={handleSearch} />
  {/* Add the Wistia video section */}
        <WistiaVideoSection
          mediaId="wclmgr77zd" // Replace with the actual media ID of the Wistia video
        />
      </div>
    </div>
  );
}
