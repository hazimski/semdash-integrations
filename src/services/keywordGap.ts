import { api } from './api';

interface KeywordGapFilters {
  intersections: boolean;
  ignoreSynonyms: boolean;
  intent: string;
  keyword?: string;
  minKD?: number;
  maxKD?: number;
  minVolume?: number;
  maxVolume?: number;
}

interface KeywordGapResponse {
  tasks: Array<{
    result: Array<{
      total_count: number;
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
        first_domain_serp_element: {
          rank_absolute: number;
          etv: number;
          url: string;
        } | null;
        second_domain_serp_element: {
          rank_absolute: number;
          etv: number;
          url: string;
        } | null;
      }>;
    }>;
  }>;
}

interface KeywordGapResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  keywordDifficulty: number;
  intent: string;
  firstDomainRank: number | null;
  firstDomainTraffic: number;
  firstDomainUrl: string | null;
  secondDomainRank: number | null;
  secondDomainTraffic: number;
  secondDomainUrl: string | null;
}

export async function fetchKeywordGap(
  target1: string,
  target2: string,
  locationCode: string,
  languageCode: string,
  filters?: KeywordGapFilters,
  offset: number = 0
): Promise<{ keywords: KeywordGapResult[]; totalCount: number }> {
  try {
    // Clean domain names
    const cleanTarget1 = target1.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanTarget2 = target2.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    const payload = [{
      target1: cleanTarget1,
      target2: cleanTarget2,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      include_serp_info: true,
      include_clickstream_data: false,
      intersections: filters?.intersections ?? false,
      ignore_synonyms: true,
      item_types: ["organic", "featured_snippet"],
      limit: 100,
      offset: offset,
      order_by: ["first_domain_serp_element.etv,desc"]
    }];

    // Add filters if provided
    if (filters) {
      const filterArray = [];

      if (filters.keyword) {
        filterArray.push(["keyword_data.keyword", "like", `%${filters.keyword}%`]);
      }

      if (filters.intent) {
        if (filterArray.length > 0) filterArray.push("and");
        filterArray.push(["keyword_data.search_intent_info.main_intent", "=", filters.intent]);
      }

      if (filters.minVolume !== undefined || filters.maxVolume !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        if (filters.minVolume !== undefined && filters.maxVolume !== undefined) {
          filterArray.push(
            ["keyword_data.keyword_info.search_volume", ">=", filters.minVolume],
            "and",
            ["keyword_data.keyword_info.search_volume", "<=", filters.maxVolume]
          );
        } else if (filters.minVolume !== undefined) {
          filterArray.push(["keyword_data.keyword_info.search_volume", ">=", filters.minVolume]);
        } else if (filters.maxVolume !== undefined) {
          filterArray.push(["keyword_data.keyword_info.search_volume", "<=", filters.maxVolume]);
        }
      }

      if (filters.minKD !== undefined || filters.maxKD !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        if (filters.minKD !== undefined && filters.maxKD !== undefined) {
          filterArray.push(
            ["keyword_data.keyword_properties.keyword_difficulty", ">=", filters.minKD],
            "and",
            ["keyword_data.keyword_properties.keyword_difficulty", "<=", filters.maxKD]
          );
        } else if (filters.minKD !== undefined) {
          filterArray.push(["keyword_data.keyword_properties.keyword_difficulty", ">=", filters.minKD]);
        } else if (filters.maxKD !== undefined) {
          filterArray.push(["keyword_data.keyword_properties.keyword_difficulty", "<=", filters.maxKD]);
        }
      }

      if (filterArray.length > 0) {
        payload[0].filters = filterArray;
      }
    }

    console.log('Keyword gap API payload:', JSON.stringify(payload, null, 2));

    const response = await api.post<KeywordGapResponse>(
      '/dataforseo_labs/google/domain_intersection/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    return {
      keywords: result.items.map(item => ({
        keyword: item.keyword_data.keyword,
        searchVolume: item.keyword_data.keyword_info.search_volume,
        cpc: item.keyword_data.keyword_info.cpc,
        keywordDifficulty: item.keyword_data.keyword_properties.keyword_difficulty,
        intent: item.keyword_data.search_intent_info.main_intent,
        firstDomainRank: item.first_domain_serp_element?.rank_absolute || null,
        firstDomainTraffic: item.first_domain_serp_element?.etv || 0,
        firstDomainUrl: item.first_domain_serp_element?.url || null,
        secondDomainRank: item.second_domain_serp_element?.rank_absolute || null,
        secondDomainTraffic: item.second_domain_serp_element?.etv || 0,
        secondDomainUrl: item.second_domain_serp_element?.url || null
      })),
      totalCount: result.total_count || 0
    };
  } catch (error) {
    console.error('Keyword Gap API Error:', error);
    
    // Improved error handling
    let errorMessage = 'Failed to fetch keyword gap data';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || error.response.data?.error || error.message;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}
