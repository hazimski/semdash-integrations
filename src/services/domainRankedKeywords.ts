import { api } from './api';
import axios from 'axios';

interface RankedKeywordResponse {
  tasks: Array<{
    result: Array<{
      items: Array<{
        keyword_data: {
          keyword: string;
          keyword_info: {
            search_volume: number;
            cpc: number;
          };
          keyword_properties: {
            keyword_difficulty: number;
          };
          search_intent_info: {
            main_intent: string;
          };
        };
        ranked_serp_element: {
          serp_item: {
            url: string;
            etv: number;
            rank_absolute: number;
            rank_changes: {
              previous_rank_absolute: number | null;
            };
            type: string;
          };
        };
      }>;
    }>;
  }>;
}

export async function fetchDomainRankedKeywordsPreview(
  domain: string,
  locationCode: string,
  languageCode: string
) {
  try {
    // Clean domain name
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    const payload = [{
      target: cleanDomain,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      historical_serp_mode: "live",
      ignore_synonyms: true,
      include_clickstream_data: false,
      item_types: ["organic", "featured_snippet"],
      load_rank_absolute: true,
      limit: 5,
      order_by: ["ranked_serp_element.serp_item.etv,desc"]
    }];

    console.log('Fetching domain ranked keywords with payload:', JSON.stringify(payload, null, 2));

    const response = await api.post<RankedKeywordResponse>(
      '/dataforseo_labs/google/ranked_keywords/live',
      payload
    );

    console.log('Domain ranked keywords API response:', JSON.stringify(response.data, null, 2));

    // Check if we have valid data
    if (!response.data?.tasks?.[0]?.result?.[0]) {
      console.log('No data in API response');
      return [];
    }

    const result = response.data.tasks[0].result[0];
    
    // If no items, return empty array instead of throwing error
    if (!result.items || result.items.length === 0) {
      console.log('No ranked keywords found for domain');
      return [];
    }

    return result.items.map(item => ({
      keyword: item.keyword_data.keyword,
      searchVolume: item.keyword_data.keyword_info.search_volume,
      etv: item.ranked_serp_element.serp_item.etv,
      cpc: item.keyword_data.keyword_info.cpc,
      keywordDifficulty: item.keyword_data.keyword_properties.keyword_difficulty,
      intent: item.keyword_data.search_intent_info.main_intent,
      rankAbsolute: item.ranked_serp_element.serp_item.rank_absolute,
      previousRankAbsolute: item.ranked_serp_element.serp_item.rank_changes?.previous_rank_absolute || null,
      url: item.ranked_serp_element.serp_item.url,
      isFeaturedSnippet: item.ranked_serp_element.serp_item.type === 'featured_snippet'
    }));
  } catch (error) {
    console.error('Domain Ranked Keywords API Error:', error);
    
    // Improved error handling with specific error messages
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const message = error.response.data?.tasks?.[0]?.status_message || 
                       error.response.data?.message || 
                       'Failed to fetch ranked keywords';
        throw new Error(message);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your internet connection.');
      }
    }

    // For other types of errors
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch ranked keywords');
  }
}