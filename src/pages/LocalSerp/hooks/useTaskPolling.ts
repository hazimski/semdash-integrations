import { useState, useEffect } from 'react';
import { getLocalSerpResults } from '../../../services/localSerp';
import { sleep } from '../../../utils/async';

interface UseTaskPollingProps {
  taskIds: string[];
  onComplete: (results: any[]) => void;
  onError: (error: Error) => void;
}

export function useTaskPolling({ taskIds, onComplete, onError }: UseTaskPollingProps) {
  const [isPolling, setIsPolling] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!taskIds.length || isPolling) return;

    const pollTasks = async () => {
      setIsPolling(true);
      const results: any[] = [];
      const errors: Error[] = [];

      for (const taskId of taskIds) {
        if (completedTasks[taskId]) {
          results.push(completedTasks[taskId]);
          continue;
        }

        try {
          const result = await getLocalSerpResults(taskId);
          results.push(result);
          setCompletedTasks(prev => ({ ...prev, [taskId]: result }));
        } catch (error) {
          console.error(`Error polling task ${taskId}:`, error);
          errors.push(error instanceof Error ? error : new Error('Unknown error'));
        }

        // Small delay between polling each task
        if (taskIds.indexOf(taskId) < taskIds.length - 1) {
          await sleep(500);
        }
      }

      if (errors.length === taskIds.length) {
        onError(new Error('All tasks failed'));
      } else if (results.length === taskIds.length) {
        onComplete(results);
      }

      setIsPolling(false);
    };

    pollTasks();
  }, [taskIds, isPolling, completedTasks, onComplete, onError]);

  return {
    isPolling,
    completedTasks: Object.values(completedTasks)
  };
}