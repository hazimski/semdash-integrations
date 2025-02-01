import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DomainForm } from '../components/domain/DomainForm';

export function TopPagesSearch() {
  const navigate = useNavigate();

  const handleAnalyze = (domain: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      domain,
      location,
      language
    });
    navigate(`/pages/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Top Pages Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Analyze the top performing pages of any domain
          </p>
        </div>

        <DomainForm 
          onAnalyze={handleAnalyze} 
          isLoading={false}
        />
      </div>
    </div>
  );
}
