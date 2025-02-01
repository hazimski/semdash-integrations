import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { History } from 'lucide-react';
import { DomainInput } from '../components/DomainInput';
import { ResultsTable } from '../components/ResultsTable';
import { BacklinkData } from '../types';
import { fetchBacklinkData } from '../services/api';
import { saveBacklinkResults, getBacklinkHistory } from '../services/backlinks';
import { toast } from 'react-hot-toast';

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
      const historicalData = await getBacklinkHistory(user.uid);
      setHistory(historicalData);
    } catch (error) {
      toast.error('Failed to load history');
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
      
      if (user) {
        await saveBacklinkResults(user.uid, data);
        toast.success('Results saved successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'An error occurred');
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
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <History className="h-4 w-4 mr-2" />
          {showHistory ? 'New Analysis' : 'History'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {showHistory ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Analysis History</h3>
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
