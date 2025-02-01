import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchBacklinkGap } from '../../services/backlinkGap';
import { BacklinkGapFilters } from './Filters';
import { ResultsTable } from './ResultsTable';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

interface Filters {
  type: 'all' | 'new' | 'broken' | 'live' | 'lost' | 'dofollow' | 'nofollow';
  domainFrom?: string;
  domainTo?: string;
}

export function BacklinkGapResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    type: 'all'
  });
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    type: 'all'
  });
  const { checkCredits, deductUserCredits } = useCredits();

  const currentParams = {
    target1: searchParams.get('target1') || '',
    target2: searchParams.get('target2') || '',
    includeSubdomains: searchParams.get('includeSubdomains') === 'true'
  };

  const fetchData = async (page: number = 1, filtersToUse: typeof filters) => {
    if (!currentParams.target1 || !currentParams.target2) {
      setError('Both target domains are required');
      return;
    }

    const hasCredits = await checkCredits(30);
    if (!hasCredits) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchBacklinkGap(
        currentParams.target1,
        currentParams.target2,
        currentParams.includeSubdomains,
        filtersToUse,
        offset
      );

      setBacklinks(data.backlinks);
      setTotalCount(data.totalCount);
      setCurrentPage(page);

      const deducted = await deductUserCredits(30, 'Backlink Gap');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch backlink gap data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = [
      currentParams.target1,
      currentParams.target2
    ];

    if (params.every(param => param)) {
      fetchData(1, filters);
    }
  }, [currentParams.target1, currentParams.target2, currentParams.includeSubdomains]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setPendingFilters(newFilters);
  };

  const handleFiltersApply = () => {
    setFilters(pendingFilters);
    fetchData(1, pendingFilters);
  };

  const handleFiltersClear = () => {
    const newFilters = {
      type: 'all' as const,
      domainFrom: undefined,
      domainTo: undefined
    };
    setFilters(newFilters);
    setPendingFilters(newFilters);
    fetchData(1, newFilters);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/backlink-gap" className="hover:text-gray-700">
          Backlink Gap
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Results</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Backlink Gap Analysis
        </h1>
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

      <BacklinkGapFilters
        filters={pendingFilters}
        onChange={handleFiltersChange}
        onApply={handleFiltersApply}
        onClear={handleFiltersClear}
      />

      {error ? (
        <ErrorState 
          title="No backlinks found"
          message="We couldn't find any backlink data. This could be because:"
          suggestions={[
            'The domains entered are too new or have very few backlinks',
            'The filters applied are too restrictive',
            'There are no backlinks between these domains'
          ]}
        />
      ) : (
        <ResultsTable 
          backlinks={backlinks}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={(page) => fetchData(page, filters)}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
