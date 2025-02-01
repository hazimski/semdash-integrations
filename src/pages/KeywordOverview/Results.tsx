import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';
import { fetchKeywordOverview, fetchKeywordSerps } from '../../services/keywordOverview';
import { VolumeCard } from './VolumeCard';
import { DifficultyCard } from './DifficultyCard';
import { RelatedKeywordsCard } from './RelatedKeywordsCard';
import { HistoricalTable } from '../../pages/SerpChecker/HistoricalTable';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

export function KeywordOverviewResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [serpData, setSerpData] = useState<any[]>([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
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

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('serp-tables-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      const newPosition = scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const fetchData = useCallback(async () => {
    if (!currentParams.keyword) {
      return;
    }

    const hasCredits = await checkCredits(15);
    if (!hasCredits) return;

    setIsLoading(true);
    setError(null);

    try {
      const [overviewResult, serpResult] = await Promise.all([
        fetchKeywordOverview(
          currentParams.keyword,
          currentParams.location,
          currentParams.language
        ),
        fetchKeywordSerps(
          currentParams.keyword,
          currentParams.location,
          currentParams.language
        )
      ]);

      setOverviewData(overviewResult);
      setSerpData(serpResult);

      const deducted = await deductUserCredits(15, 'Keyword Overview');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch keyword data';
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
    <div className="min-h-screen">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Keyword Overview: {currentParams.keyword}
          </h1>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>Database: {locationName}</span>
            <span>Language: {languageName}</span>
          </div>
        </div>

        {error ? (
          <ErrorState 
            title="No keyword data found"
            message="We couldn't find any data for this keyword. This could be because:"
            suggestions={[
              'The keyword has very low or no search volume',
              'The keyword is too new or not yet tracked',
              'The keyword was mistyped or does not exist'
            ]}
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-[400px]">
                <VolumeCard 
                  volume={overviewData?.mainKeyword.searchVolume}
                  monthlySearches={overviewData?.mainKeyword.monthlySearches}
                  intent={overviewData?.mainKeyword.intent}
                />
              </div>
              <div className="h-[400px]">
                <DifficultyCard 
                  difficulty={overviewData?.mainKeyword.keywordDifficulty}
                  referringDomains={overviewData?.mainKeyword.referringDomains}
                  backlinks={overviewData?.mainKeyword.backlinks}
                  mainDomainRanking={overviewData?.mainKeyword.mainDomainRanking}
                />
              </div>
              <div className="h-[400px]">
                <RelatedKeywordsCard keywords={overviewData?.relatedKeywords} />
              </div>
            </div>

            <div className="mt-8 bg-gray-50 py-8">
              <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    SERP History
                  </h2>

                  <button
                    onClick={() => handleScroll('left')}
                    className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-gray-100"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => handleScroll('right')}
                    className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-gray-100"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div 
                    id="serp-tables-container"
                    className="overflow-x-auto hide-scrollbar"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    <HistoricalTable 
                      data={serpData}
                      isLoading={false}
                      error={null}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
