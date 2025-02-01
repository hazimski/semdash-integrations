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

function createDefaultPage(index: number): TopicalMapPage {
  return {
    title: `Sample Page ${index + 1}`,
    intent: 'informational'
  };
}

function createDefaultCategory(index: number): TopicalMapCategory {
  return {
    name: `Additional Category ${index + 1}`,
    pages: Array(5).fill(null).map((_, i) => createDefaultPage(i))
  };
}

function normalizeTopicalMap(map: any): TopicalMap {
  if (!map || typeof map !== 'object') {
    map = { categories: [] };
  }

  if (!Array.isArray(map.categories)) {
    map.categories = [];
  }

  // Ensure exactly 10 categories
  if (map.categories.length < 10) {
    const missingCategories = 10 - map.categories.length;
    for (let i = 0; i < missingCategories; i++) {
      map.categories.push(createDefaultCategory(map.categories.length));
    }
  } else if (map.categories.length > 10) {
    map.categories = map.categories.slice(0, 10);
  }

  // Normalize each category
  map.categories = map.categories.map((category: any, index: number) => {
    if (!category || typeof category !== 'object') {
      return createDefaultCategory(index);
    }

    // Ensure category has a name
    if (!category.name || typeof category.name !== 'string') {
      category.name = `Category ${index + 1}`;
    }

    // Ensure category has pages array
    if (!Array.isArray(category.pages)) {
      category.pages = [];
    }

    // Ensure exactly 5 pages per category
    if (category.pages.length < 5) {
      const missingPages = 5 - category.pages.length;
      for (let i = 0; i < missingPages; i++) {
        category.pages.push(createDefaultPage(category.pages.length));
      }
    } else if (category.pages.length > 5) {
      category.pages = category.pages.slice(0, 5);
    }

    // Normalize each page
    category.pages = category.pages.map((page: any, pageIndex: number) => {
      if (!page || typeof page !== 'object') {
        return createDefaultPage(pageIndex);
      }

      // Ensure page has title and valid intent
      const validIntents = ['informational', 'commercial', 'transactional', 'navigational'];
      return {
        title: page.title || `Page ${pageIndex + 1}`,
        intent: validIntents.includes(page.intent) ? page.intent : 'informational'
      };
    });

    return category;
  });

  return map as TopicalMap;
}

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
          temperature: 0.7,
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

      let result: TopicalMap;
      try {
        const parsed = JSON.parse(content);
        result = normalizeTopicalMap(parsed);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        result = normalizeTopicalMap({});
      }

      // Cache the result
      resultCache.set(keyword, {
        timestamp: Date.now(),
        result
      });

      return result;
    } catch (error) {
      console.error('Error generating topical map:', error);
      if (error instanceof Error && error.message === 'OpenAI API key not found') {
        throw error;
      }
      throw new Error('Failed to generate topical map');
    } finally {
      pendingRequests.delete(keyword);
    }
  })();

  pendingRequests.set(keyword, requestPromise);
  return requestPromise;
}