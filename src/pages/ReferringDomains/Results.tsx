import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchReferringDomains, fetchReferringDomainsHistory } from '../../services/referringDomains';
import { ReferringDomainsFilters } from './ReferringDomainsFilters';
import { ReferringDomainsTable } from './ReferringDomainsTable';
import { BacklinksNavigation } from '../../components/backlinks/BacklinksNavigation';
import { ReferringDomainsCharts } from './ReferringDomainsCharts';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

type FilterType = 'all' | 'lost' | 'dofollow' | 'nofollow';

interface Filters {
  type: FilterType;
  domain?: string;
}

interface SortConfig {
  field: 'rank' | 'backlinks' | 'broken_backlinks' | 'referring_pages' | 'broken_pages' | 'backlinks_spam_score' | 'first_seen';
  direction: 'asc' | 'desc';
}

export function ReferringDomainsResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    type: 'all'
  });
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    type: 'all'
  });
  const [sort, setSort] = useState<SortConfig>({
    field: 'rank',
    direction: 'desc'
  });
  const { checkCredits, deductUserCredits } = useCredits();

  const currentParams = {
    target: searchParams.get('target') || '',
    includeSubdomains: searchParams.get('includeSubdomains') === 'true'
  };

  const fetchData = async (page: number = 1, filtersToUse: Filters) => {
    if (!currentParams.target) {
      setError('Target domain is required');
      return;
    }

    const hasCredits = await checkCredits(50);
    if (!hasCredits) return;

    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchReferringDomains(
        currentParams.target,
        currentParams.includeSubdomains,
        filtersToUse,
        sort,
        offset
      );

      const deducted = await deductUserCredits(50, 'Referring Domains');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }

      setDomains(data.domains);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch referring domains data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    if (!currentParams.target) return;

    setIsLoadingHistory(true);
    try {
      const data = await fetchReferringDomainsHistory(currentParams.target);
      setHistoryData(data);
    } catch (err) {
      toast.error('Failed to load history data');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (currentParams.target) {
      fetchData(1, filters);
      fetchHistoryData();
    }
  }, [currentParams.target, currentParams.includeSubdomains]);

  const handleFiltersChange = (newFilters: Filters) => {
    setPendingFilters(newFilters);
  };

  const handleFiltersApply = () => {
    setFilters(pendingFilters);
    fetchData(1, pendingFilters);
  };

  const handleFiltersClear = () => {
    const newFilters: Filters = {
      type: 'all',
      domain: undefined
    };
    setFilters(newFilters);
    setPendingFilters(newFilters);
    fetchData(1, newFilters);
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
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/referring-domains" className="hover:text-gray-700">
          Backlink Research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Referring domains</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Referring domains: {currentParams.target}
        </h1>
        <BacklinksNavigation target={currentParams.target} />
      </div>

      <ReferringDomainsCharts 
        data={historyData}
        isLoading={isLoadingHistory}
      />

      <ReferringDomainsFilters
        filters={pendingFilters}
        onChange={handleFiltersChange}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
      />

      {error ? (
        <ErrorState 
          title="No referring domains found"
          message="We couldn't find any referring domains. This could be because:"
          suggestions={[
            'The domain is too new or has no backlinks yet',
            'The filters applied are too restrictive',
            'The domain name was mistyped or does not exist'
          ]}
        />
      ) : (
        <ReferringDomainsTable 
          domains={domains}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={(page) => fetchData(page, filters)}
          isLoading={isLoading}
          error={error}
          currentTarget={currentParams.target}
          sort={sort}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
