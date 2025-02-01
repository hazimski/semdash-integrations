import { getUserSettings } from './settings';
import axios from 'axios';

// Cache for storing recent results
const resultCache = new Map<string, {
  timestamp: number;
  result: TopicalMap;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const SYSTEM_PROMPT = `You are an SEO expert. Generate a topical map as a JSON object with EXACTLY:
- 10 categories (no more, no less)
- 5 pages per category (no more, no less)
- Each page must have a title and intent

CRITICAL REQUIREMENTS:
- Return EXACTLY 10 categories
- Each category MUST have EXACTLY 5 pages
- Do not include any explanatory text
- Return only the JSON object
- Ensure the JSON structure is complete and valid
- Do not truncate the response

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

STRICT REQUIREMENTS:
1. EXACTLY 10 categories (no more, no less)
2. EXACTLY 5 pages per category (no more, no less)
3. Each page must have:
   - A clear, specific title
   - One of these intents: informational, commercial, transactional, navigational

Return ONLY the JSON object with EXACTLY the required number of categories and pages.`;

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
        throw new Error('OpenAI API key not found');
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

  if (map.categories.length !== 10) {
    throw new Error('Invalid map structure: must have exactly 10 categories');
  }

  map.categories.forEach((category: any, index: number) => {
    if (!category.name || typeof category.name !== 'string') {
      throw new Error(`Invalid category name at index ${index}`);
    }

    if (!category.pages || !Array.isArray(category.pages) || category.pages.length !== 5) {
      throw new Error(`Category "${category.name}" must have exactly 5 pages`);
    }

    category.pages.forEach((page: any, pageIndex: number) => {
      if (!page.title || typeof page.title !== 'string') {
        throw new Error(`Invalid page title in category "${category.name}" at index ${pageIndex}`);
      }

      if (!['informational', 'commercial', 'transactional', 'navigational'].includes(page.intent)) {
        throw new Error(`Invalid intent for page "${page.title}" in category "${category.name}"`);
      }
    });
  });
}