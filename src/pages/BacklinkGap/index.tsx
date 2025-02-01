import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BacklinkGapForm } from './BacklinkGapForm';
import { WistiaVideoSection } from '../../components/shared/VideoSection';

export function BacklinkGap() {
  const navigate = useNavigate();

  const handleSearch = (target1: string, target2: string, includeSubdomains: boolean) => {
    const searchParams = new URLSearchParams({
      target1,
      target2,
      includeSubdomains: includeSubdomains.toString()
    });
    navigate(`/backlink-gap/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Backlink Gap Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Compare backlink profiles between two domains
          </p>
        </div>

        <BacklinkGapForm onSearch={handleSearch} />
{/* Add the Wistia video section */}
        <WistiaVideoSection
          mediaId="kpfq6he60i" // Replace with the actual media ID of the Wistia video
        />
      </div>
    </div>
  );
}
