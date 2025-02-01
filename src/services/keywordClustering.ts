import { getUserSettings } from './settings';
import axios from 'axios';

export type ClusteringType = 'semantic' | 'modifier' | 'topic' | 'theme';

// Cache for storing recent clustering results
const clusteringCache = new Map<string, {
  timestamp: number;
  result: { clusters: Record<string, string[]> };
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PROMPTS = {
  semantic: 'Group these keywords based on their semantic meaning and search intent. Create clusters where keywords share similar meanings or purposes.',
  modifier: 'Group these keywords based on their modifiers (e.g., "best", "how to", "vs", "for", etc.). Each cluster should represent a specific modifier type.',
  topic: 'Group these keywords into distinct topical clusters. Each cluster should represent a specific subject matter or subtopic.',
  theme: 'Group these keywords into broad thematic categories. Each cluster should represent a high-level theme.'
};

function buildClusteringPrompt(keywords: string[], type: ClusteringType): string {
  return `${PROMPTS[type]}

Keywords to cluster:
${keywords.join('\n')}

Respond with a JSON object where each key is a descriptive cluster name and the value is an array of keywords that belong to that cluster. Example format:
{
  "clusters": {
    "Informational Queries": ["what is", "how to", "guide"],
    "Commercial Intent": ["best", "buy", "price"]
  }
}`;
}

function getCacheKey(keywords: string[], type: ClusteringType): string {
  return `${type}:${keywords.sort().join(',')}`;
}

function getFromCache(keywords: string[], type: ClusteringType) {
  const key = getCacheKey(keywords, type);
  const cached = clusteringCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  return null;
}

function setInCache(keywords: string[], type: ClusteringType, result: { clusters: Record<string, string[]> }) {
  const key = getCacheKey(keywords, type);
  clusteringCache.set(key, {
    timestamp: Date.now(),
    result
  });
}

// Keep track of in-flight requests
const pendingRequests = new Map<string, Promise<{ clusters: Record<string, string[]> }>>();

export async function clusterKeywords(
  keywords: string[],
  type: ClusteringType
): Promise<{ clusters: Record<string, string[]> }> {
  try {
    if (!keywords?.length) {
      throw new Error('No keywords provided');
    }

    // Check cache first
    const cached = getFromCache(keywords, type);
    if (cached) {
      return cached;
    }

    // Check for pending request
    const cacheKey = getCacheKey(keywords, type);
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    const settings = await getUserSettings();
    if (!settings?.openai_api_key) {
      throw new Error('OpenAI API key not found');
    }

    const requestPromise = (async () => {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
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
      }, {
        headers: {
          'Authorization': `Bearer ${settings.openai_api_key}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No clustering results received');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!parsedContent.clusters || typeof parsedContent.clusters !== 'object') {
        throw new Error('Invalid clustering results format');
      }

      // Validate clusters structure
      Object.entries(parsedContent.clusters).forEach(([name, keywords]) => {
        if (!Array.isArray(keywords)) {
          throw new Error(`Invalid cluster format for "${name}"`);
        }
      });

      // Cache the result
      setInCache(keywords, type, parsedContent);
      return parsedContent;
    })();

    // Store the pending request
    pendingRequests.set(cacheKey, requestPromise);

    // Clean up after request completes
    requestPromise.finally(() => {
      pendingRequests.delete(cacheKey);
    });

    return await requestPromise;
  } catch (error) {
    console.error('Error clustering keywords:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to cluster keywords: ${error.message}`);
    }
    throw new Error('Failed to cluster keywords');
  }
}