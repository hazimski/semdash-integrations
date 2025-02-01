import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KeywordGapForm } from './KeywordGapForm';
import { WistiaVideoSection } from '../../components/shared/VideoSection';

export function KeywordGap() {
  const navigate = useNavigate();

  const handleSearch = (target1: string, target2: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      target1,
      target2,
      location,
      language
    });
    navigate(`/keyword-gap/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Keyword Gap Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Compare keyword rankings between two domains
          </p>
        </div>

        <KeywordGapForm onSearch={handleSearch} />
{/* Add the Wistia video section */}
        <WistiaVideoSection
          mediaId="0ti8yqe1ju" // Replace with the actual media ID of the Wistia video
        />
      </div>
    </div>
  );
}
