import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { DomainForm } from '../components/domain/DomainForm';
import { TopPagesFullTable } from '../components/domain/TopPagesFullTable';
import { fetchTopPages } from '../services/domain';
import { toast } from 'react-hot-toast';
import { ErrorState } from '../components/shared/ErrorState';

interface URLFilter {
  type: 'include' | 'exclude';
  pattern: string;
}

export function TopPagesResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [urlFilter, setUrlFilter] = useState<URLFilter | null>(null);

  const currentParams = {
    domain: searchParams.get('domain') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || ''
  };

  const handleAnalyze = async (domain: string, location: string, language: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const filters = urlFilter ? [
        ["page_address", urlFilter.type === 'include' ? "like" : "not_like", `%${urlFilter.pattern}%`]
      ] : undefined;

      const data = await fetchTopPages(
        domain, 
        location, 
        language, 
        100, 
        offset,
        filters
      );
      
      setPages(data.pages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
      setSelectedRows(new Set());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const domain = searchParams.get('domain');
    const location = searchParams.get('location');
    const language = searchParams.get('language');

    if (domain && location && language) {
      handleAnalyze(domain, location, language);
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const domain = searchParams.get('domain');
    const location = searchParams.get('location');
    const language = searchParams.get('language');

    if (domain && location && language) {
      handleAnalyze(domain, location, language, page);
    }
  };

  const handleUrlFilterChange = (type: 'include' | 'exclude', pattern: string) => {
    if (pattern.trim()) {
      setUrlFilter({ type, pattern: pattern.trim() });
    } else {
      setUrlFilter(null);
    }
  };

  const handleApplyFilter = () => {
    const { domain, location, language } = currentParams;
    if (domain && location && language) {
      handleAnalyze(domain, location, language, 1);
    }
  };

  // Calculate totals for selected rows
  const selectedTotals = {
    traffic: Array.from(selectedRows).reduce((sum, pageUrl) => {
      const page = pages.find(p => p.page_address === pageUrl);
      return sum + (page?.traffic || 0);
    }, 0),
    keywords: Array.from(selectedRows).reduce((sum, pageUrl) => {
      const page = pages.find(p => p.page_address === pageUrl);
      return sum + (page?.keywords || 0);
    }, 0)
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/pages" className="hover:text-gray-700">
          Top Pages
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Results</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">
        Top Pages: {currentParams.domain}
      </h1>
      
      <DomainForm 
        onAnalyze={(domain, location, language) => handleAnalyze(domain, location, language, 1)}
        isLoading={isLoading}
        initialDomain={currentParams.domain}
        initialLocation={currentParams.location}
        initialLanguage={currentParams.language}
      />

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center space-x-4">
          <select
            value={urlFilter?.type || 'include'}
            onChange={(e) => handleUrlFilterChange(e.target.value as 'include' | 'exclude', urlFilter?.pattern || '')}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="include">Include</option>
            <option value="exclude">Exclude</option>
          </select>
          <input
            type="text"
            value={urlFilter?.pattern || ''}
            onChange={(e) => handleUrlFilterChange(urlFilter?.type || 'include', e.target.value)}
            placeholder="Enter URL pattern..."
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filter
          </button>
        </div>
      </div>
      
      {error ? (
        <ErrorState 
          title="No pages found"
          message="We couldn't find any pages. This could be because:"
          suggestions={[
            'The domain is too new',
            'The filters applied are too restrictive',
            'The domain name was mistyped or does not exist'
          ]}
        />
      ) : (
        <TopPagesFullTable 
          pages={pages}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          currentParams={{
            location: currentParams.location,
            language: currentParams.language
          }}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          selectedTotals={selectedTotals}
        />
      )}
    </div>
  );
}
