import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';
import { fetchKeywordGap } from '../../services/keywordGap';
import { ResultsTable } from './ResultsTable';
import { KeywordGapFilters } from './Filters';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

interface Filters {
  intersections: boolean;
  ignoreSynonyms: boolean;
  intent: string;
  keyword: string;
  minKD?: number;
  maxKD?: number;
  minVolume?: number;
  maxVolume?: number;
}

export function KeywordGapResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { checkCredits, deductUserCredits } = useCredits();
  const [filters, setFilters] = useState<Filters>({
    intersections: false,
    ignoreSynonyms: false,
    intent: '',
    keyword: '',
    minKD: undefined,
    maxKD: undefined,
    minVolume: undefined,
    maxVolume: undefined
  });

  const currentParams = {
    target1: searchParams.get('target1') || '',
    target2: searchParams.get('target2') || '',
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

  const fetchData = async (page: number = 1, newFilters?: typeof filters) => {
    if (!currentParams.target1 || !currentParams.target2 || !currentParams.location || !currentParams.language) {
      return;
    }

    const hasCredits = await checkCredits(20);
    if (!hasCredits) return;

    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchKeywordGap(
        currentParams.target1,
        currentParams.target2,
        currentParams.location,
        currentParams.language,
        newFilters || filters,
        offset
      );

      setKeywords(data.keywords);
      setTotalCount(data.totalCount);
      setCurrentPage(page);

      const deducted = await deductUserCredits(20, 'Keyword Gap');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch keyword gap data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = [
      currentParams.target1,
      currentParams.target2,
      currentParams.location,
      currentParams.language
    ];

    if (params.every(param => param)) {
      fetchData(1);
    }
  }, [currentParams.target1, currentParams.target2, currentParams.location, currentParams.language]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    if (newFilters.intersections !== filters.intersections) {
      fetchData(1, newFilters);
    }
  };

  const handleFiltersApply = () => {
    fetchData(1);
  };

  const handleFiltersClear = () => {
    const newFilters = {
      ...filters,
      ignoreSynonyms: false,
      intent: '',
      keyword: '',
      minKD: undefined,
      maxKD: undefined,
      minVolume: undefined,
      maxVolume: undefined
    };
    setFilters(newFilters);
    fetchData(1, newFilters);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/keyword-gap" className="hover:text-gray-700">
          Competition Analysis
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Keyword Gap</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Keyword Gap Analysis
        </h1>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>Database: {locationName}</span>
            <span>Language: {languageName}</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-900">{currentParams.target1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-900">You: {currentParams.target2}</span>
            </div>
          </div>
        </div>
      </div>

      <KeywordGapFilters
        filters={filters}
        onChange={handleFiltersChange}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
      />

      {error ? (
        <ErrorState 
          title="No keyword gap data found"
          message="We couldn't find any keyword gap data. This could be because:"
          suggestions={[
            'The domains have no overlapping keywords',
            'The filters applied are too restrictive',
            'One or both domains have very few rankings'
          ]}
        />
      ) : (
        <ResultsTable 
          keywords={keywords}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={(page) => fetchData(page)}
          isLoading={isLoading}
          error={error}
          target1={currentParams.target1}
          target2={currentParams.target2}
        />
      )}
    </div>
  );
}
