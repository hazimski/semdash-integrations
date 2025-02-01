import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DomainForm } from '../components/domain/DomainForm';
import { RecentlyAnalyzedTable } from '../components/domain/RecentlyAnalyzedTable';
import { getDomainHistory, DomainHistoryEntry } from '../services/domainHistory';

export function DomainSearch() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<DomainHistoryEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const { data, count } = await getDomainHistory(currentPage, itemsPerPage);
      setHistory(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error loading domain history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = (domain: string, location: string, language: string) => {
    const searchParams = new URLSearchParams({
      domain,
      location,
      language
    });
    navigate(`/overview/results?${searchParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-[80vh] flex flex-col px-4">
      <div className="w-full max-w-3xl mx-auto space-y-6 mb-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Domain Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enter a domain to analyze its SEO performance and backlink profile
          </p>
        </div>

        <DomainForm 
          onAnalyze={handleAnalyze} 
          isLoading={false}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recently Analyzed Domains
        </h2>
        <RecentlyAnalyzedTable
          data={history}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
