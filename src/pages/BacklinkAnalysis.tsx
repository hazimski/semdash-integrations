
import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { DomainInput } from '../components/DomainInput';
import { ResultsTable } from '../components/ResultsTable';
import { BacklinkData } from '../types';
import { fetchBacklinkData } from '../services/api';
import { saveBacklinkResults, getBacklinkHistory } from '../services/backlinks';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export function BacklinkAnalysis() {
  const { user } = useAuth();
  const [results, setResults] = useState<BacklinkData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<BacklinkData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (showHistory && user) {
      loadHistory();
    }
  }, [showHistory, user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const historicalData = await getBacklinkHistory(user.id);
      setHistory(historicalData);
    } catch (error) {
      toast.error('Failed to load history');
      console.error('History loading error:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalyze = async (domainList: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchBacklinkData(domainList);
      setResults(data);
      
      // Save results to history if user is authenticated
      if (user) {
        await saveBacklinkResults(user.id, data);
        toast.success('Results saved to history');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Backlink Analysis</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <History className="h-4 w-4 mr-2" />
          {showHistory ? 'New Analysis' : 'History'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {showHistory ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
            {loadingHistory ? (
              <div className="text-center py-4">Loading history...</div>
            ) : (
              <ResultsTable 
                data={history}
                isLoading={false}
                error={null}
              />
            )}
          </div>
        ) : (
          <>
            <DomainInput onAnalyze={handleAnalyze} />
            <ResultsTable 
              data={results}
              isLoading={isLoading}
              error={error}
            />
          </>
        )}
      </div>
    </div>
  );
}
