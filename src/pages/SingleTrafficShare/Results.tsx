import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';
import { fetchSingleTrafficShare } from '../../services/singleTrafficShareService';
import { SingleTrafficShareFilters } from './SingleTrafficShareFilters';
import { SingleTrafficShareTable } from './SingleTrafficShareTable';
import { useCredits } from '../../hooks/useCredits';

interface Filters {
  minTraffic?: number;
  maxTraffic?: number;
  urlContains?: string;
  minKeywords?: number;
  maxKeywords?: number;
}

export function SingleTrafficShareResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const [pendingFilters, setPendingFilters] = useState<Filters>({});
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const { checkCredits, deductUserCredits } = useCredits();

  const currentParams = {
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || '',
    includeSubdomains: searchParams.get('includeSubdomains') === 'true'
  };

  const locationName = locations.find(loc => 
    loc.code === currentParams.location
  )?.name || currentParams.location;

  const languageName = locations.find(loc => 
    loc.code === currentParams.location
  )?.languages.find(lang => 
    lang.code === currentParams.language
  )?.name || currentParams.language;

  const fetchData = async (page: number = 1, filtersToUse: Filters) => {
    if (!currentParams.keyword) {
      setError('Keyword is required');
      setIsLoading(false);
      return;
    }

    // First check if user has enough credits
    const hasCredits = await checkCredits(30);
    if (!hasCredits) {
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const offset = (page - 1) * 100;
      const result = await fetchSingleTrafficShare(
        currentParams.keyword,
        currentParams.location,
        currentParams.language,
        currentParams.includeSubdomains,
        filtersToUse,
        offset
      );

      // Only deduct credits if the API call was successful
      const deducted = await deductUserCredits(30, 'Traffic Share');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }

      setData(result.items);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch traffic share data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    if (!hasInitialLoad && currentParams.keyword) {
      setHasInitialLoad(true);
      fetchData(1, filters);
    }
  }, [currentParams.keyword, hasInitialLoad]);

  const handleFiltersChange = (newFilters: Filters) => {
    setPendingFilters(newFilters);
  };

  const handleFiltersApply = () => {
    setFilters(pendingFilters);
    setIsLoading(true);
    fetchData(1, pendingFilters);
  };

  const handleFiltersClear = () => {
    const newFilters = {};
    setFilters(newFilters);
    setPendingFilters(newFilters);
    setIsLoading(true);
    fetchData(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    fetchData(page, filters);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/single-traffic-share" className="hover:text-gray-700">
          Competition Analysis
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Single Traffic Share</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Domain Traffic Share for: {currentParams.keyword}
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Database: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      <SingleTrafficShareFilters
        filters={pendingFilters}
        onChange={handleFiltersChange}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
      />

      <SingleTrafficShareTable 
        data={data}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
