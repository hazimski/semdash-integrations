import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';
import { fetchRankedKeywords } from '../../services/rankedKeywords';
import { RankedKeywordsTable } from './RankedKeywordsTable';
import { DomainFilters } from '../../components/domain/DomainFilters';
import { OrganicPositionDistribution } from '../../components/domain/OrganicPositionDistribution';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

interface Filters {
  intent?: string;
  minPosition?: number;
  maxPosition?: number;
  minVolume?: number;
  maxVolume?: number;
  urlPattern?: string;
  minTraffic?: number;
  maxTraffic?: number;
  minCpc?: number;
  maxCpc?: number;
  ignoreSynonyms?: boolean;
  onlyFeaturedSnippets?: boolean;
}

export function RankedKeywordsResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState({ field: 'etv', direction: 'desc' as 'asc' | 'desc' });
  const { checkCredits, deductUserCredits } = useCredits();
  const [filters, setFilters] = useState<Filters>({
    ignoreSynonyms: true,
    onlyFeaturedSnippets: false,
    urlPattern: searchParams.get('urlFilter') || undefined
  });

  const currentParams = {
    domain: searchParams.get('domain') || '',
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

  const fetchData = async (page: number = 1, filtersToUse: Filters, newSort?: typeof sort) => {
    if (!currentParams.domain) {
      setError('Domain is required');
      return;
    }

    const hasCredits = await checkCredits(20);
    if (!hasCredits) return;

    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const result = await fetchRankedKeywords(
        currentParams.domain,
        currentParams.location,
        currentParams.language,
        filtersToUse,
        newSort?.field || sort.field,
        newSort?.direction || sort.direction,
        offset
      );

      const deducted = await deductUserCredits(20, 'Ranked Keywords');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }

      setKeywords(result.keywords);
      setMetrics(result.metrics?.organic || null);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ranked keywords';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentParams.domain) {
      // If there's a URL filter in the search params, update filters
      const urlFilter = searchParams.get('urlFilter');
      if (urlFilter) {
        setFilters(prev => ({
          ...prev,
          urlPattern: urlFilter
        }));
      }
      
      fetchData(1, filters);
    }
  }, [currentParams.domain, currentParams.location, currentParams.language]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchData(1, filters);
  };

  const handleClearFilters = () => {
    const newFilters = {
      ignoreSynonyms: true,
      onlyFeaturedSnippets: false
    };
    setFilters(newFilters);
    fetchData(1, newFilters);
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    const newSort = { field, direction };
    setSort(newSort);
    fetchData(1, filters, newSort);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/ranked-keywords" className="hover:text-gray-700">
          Keyword Analysis
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Ranked Keywords</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Ranked Keywords for: {currentParams.domain}
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Database: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      <DomainFilters
        filters={filters}
        onChange={handleFiltersChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <OrganicPositionDistribution 
        metrics={metrics}
        isLoading={isLoading}
      />

      {error ? (
        <ErrorState 
          title="No ranked keywords found"
          message="We couldn't find any ranked keywords. This could be because:"
          suggestions={[
            'The domain has no organic rankings yet',
            'The filters applied are too restrictive',
            'The domain name was mistyped or does not exist'
          ]}
        />
      ) : (
        <RankedKeywordsTable 
          keywords={keywords}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={(page) => fetchData(page, filters)}
          onSort={handleSort}
          currentSort={sort}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
