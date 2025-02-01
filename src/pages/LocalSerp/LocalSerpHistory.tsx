import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { HistoryTable } from '../../components/localSerp/HistoryTable';
import { getLocalSerpHistory } from '../../services/localSerpHistory';
import { toast } from 'react-hot-toast';

export function LocalSerpHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
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
      const { data, count } = await getLocalSerpHistory(currentPage, itemsPerPage);
      setHistory(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error loading Local SERP history:', error);
      toast.error('Failed to load search history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    navigate('/local-serp');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-[80vh] flex flex-col px-4">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Local SERP History
          </h1>
          <button
            onClick={handleNewSearch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Search className="w-4 h-4 mr-2" />
            New Search
          </button>
        </div>

        <HistoryTable
          history={history}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}