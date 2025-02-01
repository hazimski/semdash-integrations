import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';
import { fetchHistoricalRankOverview } from '../../services/performance';
import { OrganicKeywordsChart } from './OrganicKeywordsChart';
import { PerformanceChart } from './PerformanceChart';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

export function PerformanceResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const { checkCredits, deductUserCredits } = useCredits();

  const currentParams = {
    target: searchParams.get('target') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || ''
  };

  const locationName = locations.find(loc => 
    loc.code === currentParams.location
  )?.name || currentParams.location;

  const languageName = locations.find(loc => 
    loc.code === currentParams.location
  )?.languages.find(lang => 
    lang.code === currentParams.language
  )?.name || currentParams.language;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentParams.target || hasInitialLoad) {
        return;
      }

      const hasCredits = await checkCredits(30);
      if (!hasCredits) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchHistoricalRankOverview(
          currentParams.target,
          currentParams.location,
          currentParams.language
        );

        const deducted = await deductUserCredits(30, 'Performance Analysis');
        if (!deducted) {
          throw new Error('Failed to process credits');
        }

        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch performance data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
        setHasInitialLoad(true);
      }
    };

    fetchData();
  }, [currentParams.target, currentParams.location, currentParams.language, checkCredits, deductUserCredits, hasInitialLoad]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Performance Analysis: {currentParams.target}
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <span>Database: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      {error ? (
        <ErrorState 
          title="No performance data found"
          message="We couldn't find any performance data. This could be because:"
          suggestions={[
            'The domain is too new or has no ranking history',
            'There is no historical data available yet',
            'The domain name was mistyped or does not exist'
          ]}
        />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Organic Keywords Distribution
            </h2>
            <div className="h-[400px]">
              <OrganicKeywordsChart data={data} isLoading={isLoading} error={error} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Performance Metrics
            </h2>
            <div className="h-[400px]">
              <PerformanceChart data={data} isLoading={isLoading} error={error} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
