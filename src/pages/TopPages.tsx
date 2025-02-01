import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DomainForm } from '../components/domain/DomainForm';
import { TopPagesFullTable } from '../components/domain/TopPagesFullTable';
import { fetchTopPages } from '../services/domain';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

export function TopPages() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const currentParams = {
    domain: searchParams.get('domain') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || ''
  };

  const handleAnalyze = async (domain: string, location: string, language: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * itemsPerPage;
      const data = await fetchTopPages(domain, location, language, itemsPerPage, offset);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Top Pages</h1>
      
      <DomainForm 
        onAnalyze={(domain, location, language) => handleAnalyze(domain, location, language, 1)}
        isLoading={isLoading}
        initialDomain={searchParams.get('domain') || ''}
        initialLocation={searchParams.get('location') || '2840'}
        initialLanguage={searchParams.get('language') || 'en'}
      />
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

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
      />
    </div>
  );
}
