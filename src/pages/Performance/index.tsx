import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PerformanceForm } from './PerformanceForm';

export function Performance() {
  const navigate = useNavigate();

  const handleAnalyze = (target: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      target,
      location,
      language
    });
    navigate(`/performance/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Performance Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Track your domain's historical ranking performance
          </p>
        </div>

        <PerformanceForm onAnalyze={handleAnalyze} />
      </div>
    </div>
  );
}
