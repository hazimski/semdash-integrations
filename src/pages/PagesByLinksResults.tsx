import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageSearchForm } from '../components/backlinks/PageSearchForm';
import { PagesResultTable } from '../components/backlinks/PagesResultTable';
import { fetchDomainPages } from '../services/backlinks';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

export function PagesByLinksResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const currentParams = {
    domain: searchParams.get('domain') || '',
    includeSubdomains: searchParams.get('includeSubdomains') === 'true',
    brokenPages: searchParams.get('brokenPages') === 'true'
  };

  const handleSearch = async (
    domain: string,
    includeSubdomains: boolean,
    brokenPages: boolean,
    page: number = 1
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchDomainPages(domain, includeSubdomains, brokenPages, offset);
      setPages(data.pages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { domain, includeSubdomains, brokenPages } = currentParams;
    if (domain) {
      handleSearch(domain, includeSubdomains, brokenPages);
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const { domain, includeSubdomains, brokenPages } = currentParams;
    if (domain) {
      handleSearch(domain, includeSubdomains, brokenPages, page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/pages-by-links" className="hover:text-gray-700">
          Backlink research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Top pages By links</span>
      </nav>

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">
        Top Pages: {currentParams.domain}
      </h1>
      
      <PageSearchForm 
        onSearch={(domain, includeSubdomains, brokenPages) => 
          handleSearch(domain, includeSubdomains, brokenPages, 1)
        }
        isLoading={isLoading}
        initialDomain={currentParams.domain}
        initialIncludeSubdomains={currentParams.includeSubdomains}
        initialBrokenPages={currentParams.brokenPages}
      />
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <PagesResultTable 
        pages={pages}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
