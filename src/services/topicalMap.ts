import { getUserSettings } from './settings';
import axios from 'axios';

// Cache for storing recent results
const resultCache = new Map<string, {
  timestamp: number;
  result: TopicalMap;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const SYSTEM_PROMPT = `You are an SEO expert. Generate a topical map as a JSON object with categories and pages.
Each category should have pages with titles and intents.

Required JSON structure:
{
  "categories": [
    {
      "name": "Category Name",
      "pages": [
        {
          "title": "Page Title",
          "intent": "informational" | "commercial" | "transactional" | "navigational"
        }
      ]
    }
  ]
}`;

export const createUserPrompt = (keyword: string): string => `Create a topical map for "${keyword}".

Each page must have:
   - A clear, specific title
   - One of these intents: informational, commercial, transactional, navigational

Return ONLY the JSON object.`;

export interface TopicalMapPage {
  title: string;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

export interface TopicalMapCategory {
  name: string;
  pages: TopicalMapPage[];
}

export interface TopicalMap {
  categories: TopicalMapCategory[];
}

// Keep track of in-flight requests
const pendingRequests = new Map<string, Promise<TopicalMap>>();

export async function generateTopicalMap(keyword: string): Promise<TopicalMap> {
  // Check cache first
  const cached = resultCache.get(keyword);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  // Check for pending request
  if (pendingRequests.has(keyword)) {
    return pendingRequests.get(keyword)!;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const settings = await getUserSettings();
      if (!settings?.openai_api_key) {
        throw new Error('API_KEY_REQUIRED');
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: createUserPrompt(keyword)
            }
          ],
          temperature: 0.5,
          max_tokens: 2500
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
        throw new Error('No content received from OpenAI');
      }

      const result = JSON.parse(content);
      validateTopicalMap(result);

      // Cache the result
      resultCache.set(keyword, {
        timestamp: Date.now(),
        result
      });

      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'API_KEY_REQUIRED') {
        throw error;
      }
      console.error('Error generating topical map:', error);
      throw new Error('Failed to generate topical map');
    } finally {
      // Clean up pending request
      pendingRequests.delete(keyword);
    }
  })();

  // Store the pending request
  pendingRequests.set(keyword, requestPromise);

  return requestPromise;
}

function validateTopicalMap(map: any): asserts map is TopicalMap {
  if (!map.categories || !Array.isArray(map.categories)) {
    throw new Error('Invalid map structure: missing categories array');
  }

  map.categories.forEach((category: any, index: number) => {
    if (!category.name || typeof category.name !== 'string') {
      throw new Error(`Invalid category name at index ${index}`);
    }

    if (!category.pages || !Array.isArray(category.pages)) {
      category.pages = []; // Initialize empty pages array if missing
      return;
    }

    category.pages.forEach((page: any, pageIndex: number) => {
      if (!page.title || typeof page.title !== 'string') {
        throw new Error(`Invalid page title in category "${category.name}" at index ${pageIndex}`);
      }

      if (!['informational', 'commercial', 'transactional', 'navigational'].includes(page.intent)) {
        // Default to informational if intent is invalid
        page.intent = 'informational';
      }
    });
  });
}
