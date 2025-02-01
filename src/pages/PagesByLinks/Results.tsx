import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SearchForm } from './SearchForm';
import { ResultsTable } from './ResultsTable';
import { BacklinksNavigation } from '../../components/backlinks/BacklinksNavigation';
import { fetchPagesByLinks } from '../../services/pagesByLinks';
import { toast } from 'react-hot-toast';
import { ErrorState } from '../../components/shared/ErrorState';

export function PagesByLinksResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState({
    includeSubdomains: false,
    brokenPages: false,
    excludeQueryParams: false
  });

  const currentParams = {
    domain: searchParams.get('domain') || '',
    includeSubdomains: searchParams.get('includeSubdomains') === 'true',
    brokenPages: searchParams.get('brokenPages') === 'true',
    excludeQueryParams: searchParams.get('excludeQueryParams') !== 'false'
  };

  useEffect(() => {
    setCurrentFilters({
      includeSubdomains: currentParams.includeSubdomains,
      brokenPages: currentParams.brokenPages,
      excludeQueryParams: currentParams.excludeQueryParams
    });
  }, [currentParams.includeSubdomains, currentParams.brokenPages, currentParams.excludeQueryParams]);

  const handleSearch = async (
    domain: string,
    includeSubdomains: boolean,
    brokenPages: boolean,
    excludeQueryParams: boolean,
    page: number = 1
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchPagesByLinks(
        domain,
        includeSubdomains,
        brokenPages,
        excludeQueryParams,
        offset
      );
      setPages(data.pages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
      setCurrentFilters({
        includeSubdomains,
        brokenPages,
        excludeQueryParams
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { domain, includeSubdomains, brokenPages, excludeQueryParams } = currentParams;
    if (domain) {
      handleSearch(domain, includeSubdomains, brokenPages, excludeQueryParams);
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const { domain } = currentParams;
    if (domain) {
      handleSearch(
        domain,
        currentFilters.includeSubdomains,
        currentFilters.brokenPages,
        currentFilters.excludeQueryParams,
        page
      );
    }
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/pages-by-links" className="hover:text-gray-700">
          Backlink research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Top pages By links</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">
        Top Pages: {currentParams.domain}
      </h1>
      <BacklinksNavigation target={currentParams.domain} />
      
      <SearchForm 
        onSearch={(domain, includeSubdomains, brokenPages, excludeQueryParams) => 
          handleSearch(domain, includeSubdomains, brokenPages, excludeQueryParams, 1)
        }
        isLoading={isLoading}
        initialDomain={currentParams.domain}
        initialIncludeSubdomains={currentParams.includeSubdomains}
        initialBrokenPages={currentParams.brokenPages}
        initialExcludeQueryParams={currentParams.excludeQueryParams}
      />
      
      {error ? (
        <ErrorState 
          title="No pages found"
          message="We couldn't find any pages with backlinks. This could be because:"
          suggestions={[
            'The domain is too new or has very few backlinks',
            'The filters applied are too restrictive',
            'The domain name was mistyped or does not exist'
          ]}
        />
      ) : (
        <ResultsTable 
          pages={pages}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
