import { getUserSettings } from '../settings';
import axios from 'axios';
import { resultCache, pendingRequests, CACHE_TTL, getCacheKey } from './cache';
import { buildClusteringPrompt } from './prompts';
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
      const settings = await getUserSettings();
      if (!settings?.openai_api_key) {
        throw new Error('OpenAI API key not found');
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a keyword clustering assistant. Always respond with valid JSON containing a "clusters" object where each key is a descriptive cluster name and the value is an array of keywords.'
            },
            {
              role: 'user',
              content: buildClusteringPrompt(keywords, type)
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.openai_api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No clustering results received');
      }

      const result = JSON.parse(content);
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