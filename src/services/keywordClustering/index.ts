
import { supabase } from '../../config/supabase';
import { resultCache, pendingRequests, CACHE_TTL, getCacheKey } from './cache';
import { validateClusteringResult } from './validation';

export type ClusteringType = 'semantic' | 'modifier' | 'topic' | 'theme';

export async function clusterKeywords(
  keywords: string[],
  type: ClusteringType
): Promise<{ clusters: Record<string, string[]> }> {
  try {
    if (!keywords?.length) {
      throw new Error('No keywords provided');
    }

    const cacheKey = getCacheKey(keywords, type);

    // Check cache first
    const cached = resultCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }

    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const { data: result, error } = await supabase.functions.invoke('cluster-keywords', {
        body: { keywords, type }
      });

      if (error) throw error;
      
      validateClusteringResult(result);

      // Cache the result
      resultCache.set(cacheKey, {
        timestamp: Date.now(),
        result
      });

      return result;
    })();

    // Store the pending request
    pendingRequests.set(cacheKey, requestPromise);

    // Clean up after request completes
    requestPromise.finally(() => {
      pendingRequests.delete(cacheKey);
    });

    return requestPromise;
  } catch (error) {
    console.error('Error clustering keywords:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to cluster keywords');
  }
}
