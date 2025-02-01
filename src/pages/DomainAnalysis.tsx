import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DomainForm } from '../components/domain/DomainForm';
import { DomainFilters } from '../components/domain/DomainFilters';
import { KeywordsTable } from '../components/domain/KeywordsTable';
import { PositionDistributionChart } from '../components/domain/PositionDistributionChart';
import { fetchDomainKeywords } from '../services/api';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

export function DomainAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    intent: '' as string,
    minPosition: undefined,
    maxPosition: undefined,
    minVolume: undefined,
    maxVolume: undefined,
    urlPattern: undefined,
    minTraffic: undefined,
    maxTraffic: undefined,
    minCpc: undefined,
    maxCpc: undefined,
    ignoreSynonyms: true,
    onlyFeaturedSnippets: false
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [metrics, setMetrics] = useState<any>(null);

  const handleAnalyze = async (domain: string, location: string, language: string, page: number = 1) => {
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDomainKeywords(domain, location, language);
      setKeywords(data.keywords);
      setMetrics(data.metrics?.organic || null);
      setTotalCount(data.total_count || 0);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch domain keywords';
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
    const autoAnalyze = searchParams.get('autoAnalyze');

    // If all parameters are present and autoAnalyze is true, trigger analysis
    if (domain && location && language && autoAnalyze === 'true') {
      handleAnalyze(domain, location, language);
      
      // Remove autoAnalyze from URL to prevent re-analysis on refresh
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('autoAnalyze');
      navigate(`/domain?${newSearchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = async (filters: any) => {
    const domain = searchParams.get('domain');
    const location = searchParams.get('location');
    const language = searchParams.get('language');

    if (!domain || !location || !language) return;

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const data = await fetchDomainKeywords(domain, location, language, filters);
      setKeywords(data.keywords);
      setMetrics(data.metrics?.organic || null);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply filters';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = async () => {
    const domain = searchParams.get('domain');
    const location = searchParams.get('location');
    const language = searchParams.get('language');

    if (!domain || !location || !language) return;

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setFilters({
      intent: '',
      minPosition: undefined,
      maxPosition: undefined,
      minVolume: undefined,
      maxVolume: undefined,
      urlPattern: undefined,
      minTraffic: undefined,
      maxTraffic: undefined,
      minCpc: undefined,
      maxCpc: undefined,
      ignoreSynonyms: true,
      onlyFeaturedSnippets: false
    });

    try {
      const data = await fetchDomainKeywords(domain, location, language);
      setKeywords(data.keywords);
      setMetrics(data.metrics?.organic || null);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear filters';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    const domain = searchParams.get('domain');
    const location = searchParams.get('location');
    const language = searchParams.get('language');

    if (!domain || !location || !language) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDomainKeywords(domain, location, language, undefined, (page - 1) * 100);
      setKeywords(data.keywords);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch page';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Domain Keyword Analysis</h1>
      
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

      {searchParams.get('domain') && (
        <DomainFilters 
          filters={filters}
          onChange={handleFiltersChange}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {metrics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Organic Position Distribution</h2>
          <div className="h-[400px]">
            <PositionDistributionChart metrics={metrics} />
          </div>
        </div>
      )}

      <KeywordsTable 
        keywords={keywords}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}