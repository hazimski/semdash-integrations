import axios from 'axios';
import { getBasicAuth } from '../utils/auth';

// Create base API instance
export const api = axios.create({
  baseURL: 'https://api.dataforseo.com/v3',
  headers: {
    'Authorization': getBasicAuth(),
    'Content-Type': 'application/json'
  }
});

// Re-export types and interfaces
export interface BacklinkData {
  target: string;
  main_domain_rank: number;
  backlinks: number;
  referring_domains: number;
  broken_backlinks: number;
  broken_pages: number;
  referring_domains_nofollow: number;
  anchor: number;
  image: number;
  canonical: number;
  redirect: number;
  referring_links_tld: Record<string, number>;
  referring_ips: number;
  referring_links_attributes: Record<string, any>;
  referring_links_platform_types: Record<string, any>;
  referring_links_semantic_locations: Record<string, any>;
  referring_links_countries: Record<string, any>;
}

export interface DomainApiResponse {
  tasks: Array<{
    result: Array<{
      items: Array<{
        keyword_data: {
          keyword: string;
          keyword_info: {
            search_volume: number;
            monthly_searches: Array<{
              year: number;
              month: number;
              search_volume: number;
            }>;
            cpc: number;
          };
          search_intent_info: {
            main_intent: string;
          };
        };
        ranked_serp_element: {
          serp_item: {
            relative_url: string;
            etv: number;
            rank_absolute: number;
            rank_changes: {
              previous_rank_absolute: number;
            };
            type?: string;
          };
        };
        last_updated_time: string;
      }>;
      total_count?: number;
      metrics?: {
        organic?: {
          pos_1: number;
          pos_2_3: number;
          pos_4_10: number;
          pos_11_20: number;
          pos_21_30: number;
          pos_31_40: number;
          pos_41_50: number;
          pos_51_60: number;
          pos_61_70: number;
          pos_71_80: number;
          pos_81_90: number;
          pos_91_100: number;
        };
      };
    }>;
  }>;
}

// API functions
export async function fetchBacklinkData(domains: string[]): Promise<BacklinkData[]> {
  try {
    const payload = [{
      targets: domains,
      include_subdomains: true
    }];

    const response = await api.post('/backlinks/bulk_pages_summary/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      throw new Error('No data received from API');
    }

    return response.data.tasks[0].result[0].items.map(item => ({
      target: item.url,
      main_domain_rank: item.main_domain_rank || 0,
      backlinks: item.backlinks || 0,
      referring_domains: item.referring_domains || 0,
      broken_backlinks: item.broken_backlinks || 0,
      broken_pages: item.broken_pages || 0,
      referring_domains_nofollow: item.referring_domains_nofollow || 0,
      anchor: item.referring_links_types?.anchor || 0,
      image: item.referring_links_types?.image || 0,
      canonical: item.referring_links_types?.canonical || 0,
      redirect: item.referring_links_types?.redirect || 0,
      referring_links_tld: item.referring_links_tld || {},
      referring_ips: item.referring_ips || 0,
      referring_links_attributes: item.referring_links_attributes || {},
      referring_links_platform_types: item.referring_links_platform_types || {},
      referring_links_semantic_locations: item.referring_links_semantic_locations || {},
      referring_links_countries: item.referring_links_countries || {}
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch backlink data');
    }
    throw error;
  }
}

interface DomainFilters {
  intent?: string;
  minPosition?: number;
  maxPosition?: number;
  minVolume?: number;
  maxVolume?: number;
  urlPattern?: string;
  minTraffic?: number;
  maxTraffic?: number;
  minCpc?: number;
  maxCpc?: number;
  ignoreSynonyms?: boolean;
  onlyFeaturedSnippets?: boolean;
}

export async function fetchDomainKeywords(
  domain: string,
  locationCode: string,
  languageCode: string,
  filters?: DomainFilters,
  offset: number = 0
): Promise<{ keywords: any[], metrics: any, total_count: number }> {
  if (!domain) {
    throw new Error('Domain is required');
  }

  try {
    const payload = [{
      target: domain,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      historical_serp_mode: "live",
      ignore_synonyms: filters?.ignoreSynonyms ?? false,
      include_clickstream_data: false,
      load_rank_absolute: true,
      limit: 100,
      offset: offset
    }];

    // Only add filters that are explicitly set
    if (filters) {
      const filterArray = [];

      if (filters.intent) {
        filterArray.push(["keyword_data.search_intent_info.main_intent", "=", filters.intent]);
      }

      if (filters.urlPattern) {
        filterArray.push(["ranked_serp_element.serp_item.relative_url", "like", `%${filters.urlPattern}%`]);
      }

      if (filters.onlyFeaturedSnippets) {
        filterArray.push(["ranked_serp_element.serp_item.type", "=", "featured_snippet"]);
      }

      if (filters.minPosition) {
        filterArray.push(["ranked_serp_element.serp_item.rank_absolute", ">=", filters.minPosition]);
      }

      if (filters.maxPosition) {
        filterArray.push(["ranked_serp_element.serp_item.rank_absolute", "<=", filters.maxPosition]);
      }

      if (filters.minVolume) {
        filterArray.push(["keyword_data.keyword_info.search_volume", ">=", filters.minVolume]);
      }

      if (filters.maxVolume) {
        filterArray.push(["keyword_data.keyword_info.search_volume", "<=", filters.maxVolume]);
      }

      if (filters.minTraffic) {
        filterArray.push(["ranked_serp_element.serp_item.etv", ">=", filters.minTraffic]);
      }

      if (filters.maxTraffic) {
        filterArray.push(["ranked_serp_element.serp_item.etv", "<=", filters.maxTraffic]);
      }

      if (filters.minCpc) {
        filterArray.push(["keyword_data.keyword_info.cpc", ">=", filters.minCpc]);
      }

      if (filters.maxCpc) {
        filterArray.push(["keyword_data.keyword_info.cpc", "<=", filters.maxCpc]);
      }

      // Only add filters to payload if there are actual filters
      if (filterArray.length > 0) {
        payload[0].filters = filterArray;
      }
    }

    const response = await api.post<DomainApiResponse>('/dataforseo_labs/google/ranked_keywords/live', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      return { keywords: [], metrics: null, total_count: 0 };
    }

    const result = response.data.tasks[0].result[0];
    const items = result.items || [];

    const keywords = items.map(item => ({
      keyword: item.keyword_data.keyword,
      searchVolume: item.keyword_data.keyword_info.search_volume,
      etv: item.ranked_serp_element.serp_item.etv,
      cpc: item.keyword_data.keyword_info.cpc,
      rankAbsolute: item.ranked_serp_element.serp_item.rank_absolute,
      previousRankAbsolute: item.ranked_serp_element.serp_item.rank_changes?.previous_rank_absolute,
      intent: item.keyword_data.search_intent_info.main_intent,
      lastUpdatedTime: item.last_updated_time,
      relativeUrl: item.ranked_serp_element.serp_item.relative_url,
      isFeaturedSnippet: item.ranked_serp_element.serp_item.type === "featured_snippet",
      monthlySearches: item.keyword_data.keyword_info.monthly_searches
    }));

    return {
      keywords,
      metrics: result.metrics?.organic || null,
      total_count: result.total_count || 0
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch domain keywords');
    }
    throw error;
  }
}
