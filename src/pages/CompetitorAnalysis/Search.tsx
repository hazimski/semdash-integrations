import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DomainForm } from '../../components/domain/DomainForm';

export function CompetitorAnalysisSearch() {
  const navigate = useNavigate();

  const handleAnalyze = (domain: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      domain,
      location,
      language
    });
    navigate(`/competitor-analysis/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col px-4">
      <div className="w-full max-w-3xl mx-auto space-y-6 mb-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Competitor Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover and analyze your competitors' SEO performance and strategies
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
