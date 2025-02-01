import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferringDomainsForm } from './ReferringDomainsForm';

export function ReferringDomains() {
  const navigate = useNavigate();

  const handleSearch = (target: string, includeSubdomains: boolean) => {
    const searchParams = new URLSearchParams({
      target,
      includeSubdomains: includeSubdomains.toString()
    });
    navigate(`/referring-domains/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Referring Domains Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Analyze referring domains for any website
          </p>
        </div>

        <ReferringDomainsForm onSearch={handleSearch} />
      </div>
    </div>
  );
}
