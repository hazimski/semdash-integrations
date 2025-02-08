
import React, { useState } from 'react';
import { History } from 'lucide-react';
import { DomainInput } from '../components/DomainInput';
import { ResultsTable } from '../components/ResultsTable';
import { BacklinkData } from '../types';
import { fetchBacklinkData } from '../services/api';
import { toast } from 'react-hot-toast';

export function BacklinkAnalysis() {
  const [results, setResults] = useState<BacklinkData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleAnalyze = async (domainList: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchBacklinkData(domainList);
      setResults(data);
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
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <DomainInput onAnalyze={handleAnalyze} />
        <ResultsTable 
          data={results}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
