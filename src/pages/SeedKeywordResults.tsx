import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SeedKeywordsTable } from '../components/seed/SeedKeywordsTable';
import { SeedKeywordFilters } from '../components/seed/SeedKeywordFilters';
import { KeywordResearchNavigation } from '../components/keywords/KeywordResearchNavigation';
import { fetchSeedKeywords } from '../services/seed';
import { toast } from 'react-hot-toast';
import { locations } from '../data/locations';
import { useCredits } from '../hooks/useCredits';


interface Filters {
  keyword?: string;
  intent?: string;
  minVolume?: number;
  maxVolume?: number;
  minCpc?: number;
  maxCpc?: number;
  minKd?: number;
  maxKd?: number;
}

export function SeedKeywordResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const [pendingFilters, setPendingFilters] = useState<Filters>({});
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

  const fetchData = async (page: number = 1, filtersToUse: Filters) => {
    if (!currentParams.keyword || !currentParams.location || !currentParams.language) {
      return;
    }
// First check if user has enough credits
    const hasCredits = await checkCredits(30);
    if (!hasCredits) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchSeedKeywords(
        currentParams.keyword,
        currentParams.location,
        currentParams.language,
        filtersToUse,
        offset
      );

      if (data.keywords.length === 0) {
        setError('No keywords found for the given search criteria');
      } else {
        setKeywords(data.keywords);
        setTotalCount(data.totalCount);
        setCurrentPage(page);
      }
        // Only deduct credits if the API call was successful
      const deducted = await deductUserCredits(30, 'Backlink Gap');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch keywords';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = [
      currentParams.keyword,
      currentParams.location,
      currentParams.language
    ];

    // Only fetch if all required parameters are present
    if (params.every(param => param)) {
      fetchData(1, filters);
    }
  }, [searchParams]);

  const handleFiltersChange = (newFilters: Filters) => {
    setPendingFilters(newFilters);
  };

  const handleFiltersApply = () => {
    setFilters(pendingFilters);
    fetchData(1, pendingFilters);
  };

  const handleFiltersClear = () => {
    const newFilters = {};
    setFilters(newFilters);
    setPendingFilters(newFilters);
    fetchData(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchData(page, filters);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/seed" className="hover:text-gray-700">
          Keyword research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>By seed</span>
      </nav>

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Longtail keywords for: {currentParams.keyword}
        </h1>
        <KeywordResearchNavigation 
          keyword={currentParams.keyword}
          location={currentParams.location}
          language={currentParams.language}
        />
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Database: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      <SeedKeywordFilters
        filters={pendingFilters}
        onChange={handleFiltersChange}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
      />

      <SeedKeywordsTable 
        keywords={keywords}
        totalCount={totalCount}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        error={error}
      />
    </div>
  );
}
