import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LocalSerpResultsTable } from './LocalSerpResultsTable';
import { LocalSerpFilters } from './LocalSerpFilters';
import { useTaskPolling } from './hooks/useTaskPolling';
import { ErrorState } from '../../components/shared/ErrorState';
import { useLocalSerpParams } from './hooks/useLocalSerpParams';
import { useLocalSerpData } from './hooks/useLocalSerpData';
import { useTaskCreation } from './hooks/useTaskCreation';
import type { LocalSerpResult } from './types';

export function LocalSerpResults() {
  const [results, setResults] = useState<LocalSerpResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [maxResults, setMaxResults] = useState<number>(100);
  const [urlFilter, setUrlFilter] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const params = useLocalSerpParams();
  
  const { isLoading, loadFromHistory, saveResults } = useLocalSerpData({
    onComplete: setResults,
    onError: setError
  });

  const handleTasksComplete = useCallback(async (completedResults: LocalSerpResult[]) => {
    setResults(completedResults);
    setError(null);
    setIsProcessing(false); // Keep processing state for UI feedback
  }, [params.keywords, params.locationCode, params.languageCode, params.device, params.os, saveResults]);

  const handleTasksError = useCallback((error: Error) => {
    setError(error.message);
    toast.error(error.message);
    setIsProcessing(false);
  }, []);

  const { isCreating, createTasks } = useTaskCreation({
    onTasksCreated: setTaskIds,
    onError: setError
  });

  // Use the polling hook
  const { isPolling, completedTasks } = useTaskPolling({
    taskIds,
    onComplete: handleTasksComplete,
    onError: handleTasksError
  });

  // Initial data loading
  useEffect(() => {
    if (params.historyId) {
      loadFromHistory(params.historyId);
    } else if (params.keywords.length > 0 && taskIds.length === 0 && !isCreating) {
      setIsProcessing(true);
      createTasks(
        params.keywords,
        params.locationCode,
        params.languageCode,
        params.device,
        params.os
      );
    }
  }, [
    params.historyId,
    params.keywords,
    params.locationCode,
    params.languageCode,
    params.device,
    params.os,
    taskIds.length,
    isCreating,
    loadFromHistory,
    createTasks
  ]);

  const filteredResults = results.map(result => ({
    ...result,
    items: result.items
      .filter((item: any) => item.type === 'organic')
      .filter((item: any) => !urlFilter || item.url.toLowerCase().includes(urlFilter.toLowerCase()))
      .slice(0, maxResults)
  }));

  return (
    <div className="space-y-6">
      {isProcessing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300">
            Your request is being processed. You can safely leave this page - results will be saved in your history.
          </p>
        </div>
      )}

      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/local-serp" className="hover:text-gray-700">
          Research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Local SERP</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Local SERP Results
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Device: {params.device}</span>
          <span>OS: {params.os}</span>
          <span>Keywords: {params.keywords.length}</span>
          {isPolling && (
            <span className="text-blue-600">
              Processing... ({completedTasks.length}/{taskIds.length})
            </span>
          )}
        </div>
      </div>

      <LocalSerpFilters
        maxResults={maxResults}
        onMaxResultsChange={setMaxResults}
        urlFilter={urlFilter}
        onUrlFilterChange={setUrlFilter}
      />

      {error ? (
        <ErrorState 
          title="No SERP data found"
          message="We couldn't find any SERP data. This could be because:"
          suggestions={[
            'The keywords have no search results',
            'The location or device settings are restricting results',
            'There was an error processing your request'
          ]}
        />
      ) : (
        <LocalSerpResultsTable 
          results={filteredResults}
          isLoading={isLoading || isPolling || isCreating}
          domain={params.domain}
          competitors={params.competitors}
        />
      )}
    </div>
  );
}
