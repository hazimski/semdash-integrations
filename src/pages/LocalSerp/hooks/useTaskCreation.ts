import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { processLocalSerpTasks } from '../../../services/localSerp';
import { useCredits } from '../../../hooks/useCredits';

interface UseTaskCreationProps {
  onTasksCreated: (taskIds: string[]) => void;
  onError: (error: string) => void;
}

export function useTaskCreation({ onTasksCreated, onError }: UseTaskCreationProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { checkCredits, deductUserCredits } = useCredits();

  const createTasks = useCallback(async (
    keywords: string[],
    locationCode: number,
    languageCode: string,
    device: string,
    os: string
  ) => {
    if (!keywords.length || isCreating) return;

    const hasCredits = await checkCredits(keywords.length * 2);
    if (!hasCredits) return;

    setIsCreating(true);

    try {
      const ids = await processLocalSerpTasks(
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

      onTasksCreated(ids);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create SERP tasks';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [checkCredits, deductUserCredits, isCreating, onTasksCreated, onError]);

  return {
    isCreating,
    createTasks
  };
}
