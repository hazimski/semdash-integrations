import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { HistoricalTable } from './HistoricalTable';
import { fetchHistoricalSerps } from '../../services/serpChecker';
import { AIAnalysis } from './AIAnalysis';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

export function SerpCheckerResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serpData, setSerpData] = useState<any[]>([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [latestMonthData, setLatestMonthData] = useState<any>(null);
  const { checkCredits, deductUserCredits } = useCredits();

  const currentParams = {
    keyword: searchParams.get('keyword') || '',
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

  const fetchData = useCallback(async () => {
    if (!currentParams.keyword || !currentParams.location || !currentParams.language) {
      return;
    }

    const hasCredits = await checkCredits(10);
    if (!hasCredits) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchHistoricalSerps(
        currentParams.keyword,
        currentParams.location,
        currentParams.language
      );
      setSerpData(data);

      // Store the latest month's data for AI analysis
      if (data && data.length > 0) {
        setLatestMonthData(data[data.length - 1]);
      }

      const deducted = await deductUserCredits(10, 'SERP Checker');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SERP history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setHasInitialLoad(true);
    }
  }, [currentParams.keyword, currentParams.location, currentParams.language, checkCredits, deductUserCredits]);

  useEffect(() => {
    if (!hasInitialLoad) {
      fetchData();
    }
  }, [fetchData, hasInitialLoad]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/serp-checker" className="hover:text-gray-700">
          SERP Checker
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Results</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Historical SERP: {currentParams.keyword}
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Database: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
       
      </div>

      {error ? (
        <ErrorState 
          title="No SERP history found"
          message="We couldn't find any SERP history data. This could be because:"
          suggestions={[
            'The keyword has no historical SERP data yet',
            'The keyword has very low search volume',
            'The keyword was mistyped or does not exist'
          ]}
        />
      ) : (
        <HistoricalTable 
          data={serpData}
          isLoading={isLoading}
          error={error}
          onAIAnalysis={(data) => {
            setLatestMonthData(data);
            setShowAIAnalysis(true);
          }}
        />
      )}
      
      <AIAnalysis
        isOpen={showAIAnalysis}
        onClose={() => setShowAIAnalysis(false)}
        data={latestMonthData}
      />
    </div>
  );
}
