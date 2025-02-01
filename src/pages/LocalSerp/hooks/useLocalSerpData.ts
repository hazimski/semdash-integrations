import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { saveLocalSerpResults, getLocalSerpResult } from '../../../services/localSerpHistory';
import type { LocalSerpResult } from '../types';

interface UseLocalSerpDataProps {
  onComplete: (results: LocalSerpResult[]) => void;
  onError: (error: string) => void;
}

export function useLocalSerpData({ onComplete, onError }: UseLocalSerpDataProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadFromHistory = useCallback(async (historyId: string) => {
    try {
      setIsLoading(true);
      const historyData = await getLocalSerpResult(historyId);
      if (!historyData) {
        throw new Error('History data not found');
      }
      onComplete(historyData.results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load historical data';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onComplete, onError]);

  const saveResults = useCallback(async (
    keyword: string,
    locationCode: number,
    languageCode: string,
    device: string,
    os: string,
    results: LocalSerpResult[]
  ) => {
    try {
      if (!results.length) {
        throw new Error('No results to save');
      }
      
      await saveLocalSerpResults(
        keyword,
        locationCode,
        languageCode,
        device,
        os,
        results
      );
    } catch (error) {
      console.error('Error saving Local SERP results:', error);
      // Don't show error to user since this is a background operation
      // but log it for debugging purposes
    }
  }, []);

  return {
    isLoading,
    loadFromHistory,
    saveResults
  };
}