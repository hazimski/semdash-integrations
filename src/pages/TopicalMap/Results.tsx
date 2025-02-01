import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LoadingState } from '../../components/topical-map/LoadingState';
import { ResultsView } from '../../components/topical-map/ResultsView';
import { generateTopicalMap } from '../../services/topicalMap';
import type { TopicalMap } from '../../services/topicalMap';

export function TopicalMapResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<TopicalMap | null>(null);

  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const fetchMap = async () => {
      if (!keyword) {
        setError('Keyword is required');
        setIsLoading(false);
        return;
      }

      try {
        const result = await generateTopicalMap(keyword);
        setMap(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate topical map';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMap();
  }, [keyword]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !map) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Failed to generate topical map'}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <ResultsView keyword={keyword} map={map} />;
}