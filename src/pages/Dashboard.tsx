import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, History } from 'lucide-react';
import { DomainInput } from '../components/DomainInput';
import { ResultsTable } from '../components/ResultsTable';
import { useState, useEffect } from 'react';
import { BacklinkData } from '../types';
import { fetchBacklinkData } from '../services/api';
import { saveBacklinkResults, getBacklinkHistory } from '../services/backlinks';
import { toast } from 'react-hot-toast';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out.');
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Backlink Analysis Tool</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <History className="h-4 w-4 mr-2" />
                {showHistory ? 'New Analysis' : 'History'}
              </button>
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
      </main>
    </div>
  );
}
