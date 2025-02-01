import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchBotoxBacklinks } from '../../services/botox';
import { BotoxFilters } from './BotoxFilters';
import { BotoxResultsTable } from './BotoxResultsTable';
import { BacklinksNavigation } from '../../components/backlinks/BacklinksNavigation';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

interface Filters {
  type: 'all' | 'new' | 'broken' | 'live' | 'lost' | 'dofollow' | 'nofollow';
  itemType?: string;
  minKeywordsTop10?: number;
  maxKeywordsTop10?: number;
  urlFrom?: string;
  urlTo?: string;
}

interface SortConfig {
  field: 'domain_from_rank' | 'first_seen' | 'last_seen';
  direction: 'asc' | 'desc';
}

export function BotoxResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    itemType: undefined,
    minKeywordsTop10: undefined,
    maxKeywordsTop10: undefined,
    urlFrom: undefined,
    urlTo: undefined
  });
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    type: 'all',
    itemType: undefined,
    minKeywordsTop10: undefined,
    maxKeywordsTop10: undefined,
    urlFrom: undefined,
    urlTo: undefined
  });
  const [mode, setMode] = useState<'as_is' | 'one_per_domain' | 'one_per_anchor'>('as_is');
  const [sort, setSort] = useState<SortConfig>({
    field: 'domain_from_rank',
    direction: 'desc'
  });
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const { checkCredits, deductUserCredits } = useCredits();

  const currentParams = {
    target: searchParams.get('target') || '',
    includeSubdomains: searchParams.get('includeSubdomains') === 'true',
    initialFilter: searchParams.get('initialFilter')
  };

  const fetchData = async (page: number = 1, filtersToUse: typeof filters) => {
    if (!currentParams.target) {
      setError('Target domain is required');
      return;
    }

    const hasCredits = await checkCredits(30);
    if (!hasCredits) return;

    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchBotoxBacklinks(
        currentParams.target,
        currentParams.includeSubdomains,
        mode,
        filtersToUse,
        sort,
        offset
      );

      setBacklinks(data.backlinks);
      setTotalCount(data.totalCount);
      setCurrentPage(page);

      const deducted = await deductUserCredits(30, 'Backlink Analysis');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch backlink data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentParams.initialFilter && !hasInitialLoad) {
      try {
        const initialFilter = JSON.parse(currentParams.initialFilter);
        setFilters(initialFilter);
        setPendingFilters(initialFilter);
        setHasInitialLoad(true);
        fetchData(1, initialFilter);
      } catch (e) {
        console.error('Failed to parse initial filter:', e);
      }
    } else if (currentParams.target && !hasInitialLoad) {
      fetchData(1, filters);
      setHasInitialLoad(true);
    }
  }, [currentParams.initialFilter, currentParams.target, hasInitialLoad]);

  useEffect(() => {
    if (hasInitialLoad) {
      fetchData(1, filters);
    }
  }, [mode]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    // Ensure all filter values are properly set
    const updatedFilters = {
      ...newFilters,
      itemType: newFilters.itemType || undefined,
      minKeywordsTop10: newFilters.minKeywordsTop10 || undefined,
      maxKeywordsTop10: newFilters.maxKeywordsTop10 || undefined,
      urlFrom: newFilters.urlFrom || undefined,
      urlTo: newFilters.urlTo || undefined
    };
    console.log('New filters:', updatedFilters); // Debug log
    setPendingFilters(newFilters);
  };

  const handleFiltersApply = () => {
    console.log('Applying filters:', pendingFilters); // Debug log
    setFilters(pendingFilters);
    fetchData(1, pendingFilters);
  };

  const handleFiltersClear = () => {
    const newFilters = {
      type: 'all' as const,
      itemType: undefined,
      minKeywordsTop10: undefined,
      maxKeywordsTop10: undefined,
      urlFrom: undefined,
      urlTo: undefined
    };
    setFilters(newFilters);
    setPendingFilters(newFilters);
    fetchData(1, newFilters);
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
  };

  const handleSort = (field: SortConfig['field']) => {
    const newSort: SortConfig = {
      field,
      direction: sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc'
    };
    setSort(newSort);
    fetchData(currentPage, filters);
  };

  return (
    <div className="container mx-auto px-4 space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/botox" className="hover:text-gray-700">
          Backlink Research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Backlinks</span>
      </nav>

      <div className="space-y-4 overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-900">
          Backlinks: {currentParams.target}
        </h1>
        <BacklinksNavigation target={currentParams.target} />
      </div>

      <BotoxFilters
        filters={pendingFilters}
        mode={mode}
        onChange={handleFiltersChange}
        onModeChange={handleModeChange}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
      />

      {error ? (
        <ErrorState 
          title="No backlinks found"
          message="We couldn't find any backlink data. This could be because:"
          suggestions={[
            'The domain is too new or has very few backlinks',
            'The filters applied are too restrictive',
            'The domain name was mistyped or does not exist'
          ]}
        />
      ) : (
        <BotoxResultsTable 
          backlinks={backlinks}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={(page) => fetchData(page, filters)}
          isLoading={isLoading}
          error={error}
          sort={sort}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
