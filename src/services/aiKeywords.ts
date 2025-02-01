import { api } from './api';
import axios from 'axios';
import { getUserSettings } from './settings';
import { toast } from 'react-hot-toast';

export async function generateKeywords(prompt: string): Promise<string> {
  try {
    const settings = await getUserSettings();
    if (!settings?.openai_api_key) {
      toast.error('OpenAI API key required');
      throw new Error('API_KEY_REQUIRED');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a keyword research assistant. Generate a list of keywords based on the user\'s prompt. Return only the keywords, one per line, with no additional text, stop words, brackets, dashes or special characters.'
          },
          {
            role: 'user',
            content: `${prompt}. Output should be a list of high search volume keywords and nothing else. nothing in brackets, - or any special characters.`
          }
        ],
        temperature: 0.5,
        max_tokens: 3000
      },
      {
        headers: {
          'Authorization': `Bearer ${settings.openai_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating keywords:', error);
    if (error instanceof Error && error.message === 'API_KEY_REQUIRED') {
      throw error;
    }
    throw new Error('Failed to generate keywords');
  }
}

export async function fetchKeywordVolumes(
  keywords: string[],
  locationCode: string,
  languageCode: string,
  offset: number = 0
) {
  try {
    const payload = [{
      keywords,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      include_serp_info: true,
      include_clickstream_data: false
    }];

    const response = await api.post(
      '/dataforseo_labs/google/historical_search_volume/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    return {
      keywords: result.items.map((item: any) => ({
        keyword: item.keyword,
        keywordDifficulty: item.keyword_properties?.keyword_difficulty || 0,
        searchVolume: item.keyword_info?.search_volume || 0,
        lastUpdatedTime: item.keyword_info?.last_updated_time || null,
        backlinks: item.avg_backlinks_info?.backlinks || 0,
        referringDomains: item.avg_backlinks_info?.referring_main_domains || 0,
        rank: item.avg_backlinks_info?.main_domain_rank || 0,
        monthlySearches: item.keyword_info?.monthly_searches?.map((search: any) => ({
          date: new Date(search.year, search.month - 1).toISOString(),
          search_volume: search.search_volume
        })) || []
      })),
      totalCount: result.items.length
    };
  } catch (error) {
    console.error('Keyword Volumes API Error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
     }
    throw new Error('Failed to fetch keyword volumes');
  }
}
