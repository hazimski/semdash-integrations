import { api } from './api';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'react-hot-toast';

export async function generateKeywords(prompt: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-ai-keywords', {
      body: { prompt }
    });

    if (error) {
      console.error('Error generating keywords:', error);
      throw error;
    }

    if (!data?.keywords) {
      throw new Error('No keywords generated');
    }

    return data.keywords;
  } catch (error) {
    console.error('Error generating keywords:', error);
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
