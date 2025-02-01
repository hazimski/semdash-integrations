import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { postLocalSerpTasks, getLocalSerpResults } from '../../../services/localSerp';
import { useCredits } from '../../../hooks/useCredits';
import { sleep } from '../../../utils/async';
import { MAX_RETRIES, POLLING_INTERVAL } from '../constants';
import type { LocalSerpResult } from '../types';

export function useLocalSerpResults() {
  const [results, setResults] = useState<LocalSerpResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkCredits, deductUserCredits } = useCredits();

  const pollTasks = useCallback(async (taskIds: string[]) => {
    const completedResults: LocalSerpResult[] = [];
    let retries = 0;

    while (retries < MAX_RETRIES && completedResults.length < taskIds.length) {
      for (const taskId of taskIds) {
        if (completedResults.find(r => r.keyword === taskId)) continue;

        try {
          const result = await getLocalSerpResults(taskId);
          if (result) {
            completedResults.push(result);
          }
        } catch (error) {
          console.error(`Error polling task ${taskId}:`, error);
        }
      }

      if (completedResults.length < taskIds.length) {
        await sleep(POLLING_INTERVAL);
        retries++;
      }
    }

    return completedResults;
  }, []);

  const fetchResults = useCallback(async (
    keywords: string[],
    locationCode: number,
    languageCode: string,
    device: string,
    os: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const hasCredits = await checkCredits(keywords.length * 2);
      if (!hasCredits) return;

      const taskIds = await postLocalSerpTasks(
        keywords,
        locationCode,
        languageCode,
        device,
        os
      );

      const deducted = await deductUserCredits(keywords.length * 2, 'Local SERP Analysis');
      if (!deducted) {
        throw new Error('Failed to process credits');
      }

      const results = await pollTasks(taskIds);
      setResults(results);

      if (results.length === 0) {
        setError('No results found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch results';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [checkCredits, deductUserCredits, pollTasks]);

  return {
    results,
    isLoading,
    error,
    fetchResults
  };
}