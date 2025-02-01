import { api } from './api';
import { sleep } from '../utils/async';
import { toast } from 'react-hot-toast';
import { saveLocalSerpResults } from './localSerpHistory';

interface LocalSerpTask {
  keyword: string;
  location_code: number;
  language_code: string;
  device: string;
  os: string;
  depth: number;
  calculate_rectangles: boolean;
  load_async_ai_overview: boolean;
}

interface TaskResult {
  result: any;
}

// Keep track of processing tasks globally
const processingTasks = new Map<string, {
  keyword: string;
  locationCode: number;
  languageCode: string;
  device: string;
  os: string;
  retries: number;
  lastChecked: number;
}>();

const MAX_RETRIES = 3;
const RETRY_DELAY = 60000; // 1 minute
const MAX_BATCH_SIZE = 5; // Process 5 tasks at a time
const CHECK_INTERVAL = 30000; // 30 seconds

// Start background task checker
let checkerInterval: NodeJS.Timeout | null = null;

function startTaskChecker() {
  if (checkerInterval) return;
  
  checkerInterval = setInterval(async () => {
    const now = Date.now();
    
    for (const [taskId, task] of processingTasks.entries()) {
      // Skip if checked recently
      if (now - task.lastChecked < RETRY_DELAY) continue;
      
      // Skip if max retries reached
      if (task.retries >= MAX_RETRIES) {
        processingTasks.delete(taskId);
        continue;
      }

      try {
        const response = await api.get(`/serp/google/organic/task_get/advanced/${taskId}`);
        task.lastChecked = now;
        
        if (!response.data?.tasks?.[0]) continue;
        
        const taskData = response.data.tasks[0];
        
        if (taskData.status_code === 20000 && taskData.result?.[0]) {
          // Save result
          await saveLocalSerpResults(
            task.keyword,
            task.locationCode,
            task.languageCode,
            task.device,
            task.os,
            [taskData.result[0]]
          );
          processingTasks.delete(taskId);
          toast.success(`Results saved for "${task.keyword}"`);
        } else if (
          taskData.status_message !== 'Task Handed.' && 
          taskData.status_message !== 'Task in Queue'
        ) {
          task.retries++;
        }
      } catch (error) {
        console.error(`Error checking task ${taskId}:`, error);
        task.retries++;
      }
    }

    // Stop checker if no tasks remaining
    if (processingTasks.size === 0) {
      stopTaskChecker();
    }
  }, CHECK_INTERVAL);
}

function stopTaskChecker() {
  if (checkerInterval) {
    clearInterval(checkerInterval);
    checkerInterval = null;
  }
}

export async function processLocalSerpTasks(
  keywords: string[],
  locationCode: number,
  languageCode: string,
  device: string,
  os: string
): Promise<string[]> {
  try {
    const tasks: LocalSerpTask[] = keywords.map(keyword => ({
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      device,
      os,
      depth: 100,
      calculate_rectangles: false,
      load_async_ai_overview: true
    }));

    // Split tasks into batches
    const batches = [];
    for (let i = 0; i < tasks.length; i += MAX_BATCH_SIZE) {
      batches.push(tasks.slice(i, i + MAX_BATCH_SIZE));
    }

    // Process batches sequentially
    const allTaskIds = [];
    for (const batch of batches) {
      const response = await api.post('/serp/google/organic/task_post', batch);
      
      if (!response.data?.tasks) {
        throw new Error('No tasks data received');
      }
      
      const taskIds = response.data.tasks.map((task: any) => task.id);
      allTaskIds.push(...taskIds);
      
      // Store task parameters for background processing
      taskIds.forEach((taskId: string, index: number) => {
        const task = batch[index];
        processingTasks.set(taskId, {
          keyword: task.keyword,
          locationCode,
          languageCode,
          device,
          os,
          retries: 0,
          lastChecked: Date.now()
        });
      });
      
      // Wait between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await sleep(1000);
      }
    }

    // Start background checker if not already running
    startTaskChecker();

    return allTaskIds;
  } catch (error) {
    console.error('Error processing Local SERP tasks:', error);
    throw error;
  }
}

export async function getLocalSerpResults(taskId: string): Promise<TaskResult> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await api.get(`/serp/google/organic/task_get/advanced/${taskId}`);
      
      if (!response.data?.tasks?.[0]) {
        throw new Error('No task data available');
      }

      const task = response.data.tasks[0];
      
      // Handle task status
      if (task.status_message === 'Task Handed.' || 
          task.status_message === 'Task in Queue') {
        toast.loading('Collecting Data...', { id: taskId });
        retries++;
        await sleep(RETRY_DELAY);
        continue;
      }

      // Check for task completion
      if (task.status_code === 20000 && task.result?.[0]) {
        toast.dismiss(taskId);
        // Result will be saved by background checker
        return task.result[0];
      }

      throw new Error(task.status_message || 'Task failed');
    } catch (error) {
      if (retries === MAX_RETRIES - 1) {
        toast.dismiss(taskId);
        throw error;
      }
      retries++;
      await sleep(RETRY_DELAY);
    }
  }

  throw new Error(`Task ${taskId} failed after ${MAX_RETRIES} retries`);
}

// Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopTaskChecker();
  });
}
