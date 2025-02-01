import { api } from './api';

interface RankedKeywordsFilter {
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

export async function fetchRankedKeywords(
  domain: string,
  locationCode: string,
  languageCode: string,
  filters?: RankedKeywordsFilter,
  sortField?: string,
  sortDirection?: 'asc' | 'desc',
  offset: number = 0
) {
  try {
    // Parse the URL to get domain and path
    const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
    const baseDomain = url.hostname.replace(/^www\./, '');
    const fullPath = url.pathname.replace(/\/$/, '');

    const payload = [{
      target: baseDomain,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      historical_serp_mode: "live",
      ignore_synonyms: filters?.ignoreSynonyms ?? true,
      include_clickstream_data: false,
      item_types: ["organic", "featured_snippet"],
      load_rank_absolute: true,
      limit: 100,
      offset: offset
    }];

    // Add sorting if provided
    if (sortField && sortDirection) {
      let sortKey = sortField;
      if (sortField === 'searchVolume') sortKey = 'keyword_data.keyword_info.search_volume';
      else if (sortField === 'cpc') sortKey = 'keyword_data.keyword_info.cpc';
      else if (sortField === 'etv') sortKey = 'ranked_serp_element.serp_item.etv';
      else if (sortField === 'rankAbsolute') sortKey = 'ranked_serp_element.serp_item.rank_absolute';
      else if (sortField === 'keywordDifficulty') sortKey = 'keyword_data.keyword_properties.keyword_difficulty';
      else if (sortField === 'lastUpdatedTime') sortKey = 'last_updated_time';
      
      payload[0].order_by = [`${sortKey},${sortDirection}`];
    }

    // Add filters if provided
    if (filters || fullPath) {
      const filterArray = [];
      
      // Add URL pattern filter if provided
      if (filters?.urlPattern) {
        filterArray.push(["ranked_serp_element.serp_item.url", "like", `%${filters.urlPattern}%`]);
      }

      // Always add URL path filter if a specific path was provided
      if (fullPath) {
        filterArray.push(["ranked_serp_element.serp_item.relative_url", "=", fullPath]);
      }

      if (filters?.intent) {
        if (filterArray.length > 0) filterArray.push("and");
        filterArray.push(["keyword_data.search_intent_info.main_intent", "=", filters.intent]);
      }

      if (filters?.onlyFeaturedSnippets) {
        if (filterArray.length > 0) filterArray.push("and");
        filterArray.push(["ranked_serp_element.serp_item.type", "=", "featured_snippet"]);
      }

      // Position range filter
      if (filters?.minPosition !== undefined || filters?.maxPosition !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        if (filters.minPosition !== undefined && filters.maxPosition !== undefined) {
          filterArray.push(
            ["ranked_serp_element.serp_item.rank_absolute", ">=", filters.minPosition],
            "and",
            ["ranked_serp_element.serp_item.rank_absolute", "<=", filters.maxPosition]
          );
        } else if (filters.minPosition !== undefined) {
          filterArray.push(["ranked_serp_element.serp_item.rank_absolute", ">=", filters.minPosition]);
        } else if (filters.maxPosition !== undefined) {
          filterArray.push(["ranked_serp_element.serp_item.rank_absolute", "<=", filters.maxPosition]);
        }
      }

      // Volume range filter
      if (filters?.minVolume !== undefined || filters?.maxVolume !== undefined) {
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

      // Traffic range filter
      if (filters?.minTraffic !== undefined || filters?.maxTraffic !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        if (filters.minTraffic !== undefined && filters.maxTraffic !== undefined) {
          filterArray.push(
            ["ranked_serp_element.serp_item.etv", ">=", filters.minTraffic],
            "and",
            ["ranked_serp_element.serp_item.etv", "<=", filters.maxTraffic]
          );
        } else if (filters.minTraffic !== undefined) {
          filterArray.push(["ranked_serp_element.serp_item.etv", ">=", filters.minTraffic]);
        } else if (filters.maxTraffic !== undefined) {
          filterArray.push(["ranked_serp_element.serp_item.etv", "<=", filters.maxTraffic]);
        }
      }

      // CPC range filter
      if (filters?.minCpc !== undefined || filters?.maxCpc !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        if (filters.minCpc !== undefined && filters.maxCpc !== undefined) {
          filterArray.push(
            ["keyword_data.keyword_info.cpc", ">=", filters.minCpc],
            "and",
            ["keyword_data.keyword_info.cpc", "<=", filters.maxCpc]
          );
        } else if (filters.minCpc !== undefined) {
          filterArray.push(["keyword_data.keyword_info.cpc", ">=", filters.minCpc]);
        } else if (filters.maxCpc !== undefined) {
          filterArray.push(["keyword_data.keyword_info.cpc", "<=", filters.maxCpc]);
        }
      }

      if (filterArray.length > 0) {
        payload[0].filters = filterArray;
      }
    }

    console.log('Ranked Keywords API Payload:', JSON.stringify(payload, null, 2));

    const response = await api.post(
      '/dataforseo_labs/google/ranked_keywords/live',
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
        etv: item.ranked_serp_element.serp_item.etv,
        cpc: item.keyword_data.keyword_info.cpc,
        rankAbsolute: item.ranked_serp_element.serp_item.rank_absolute,
        previousRankAbsolute: item.ranked_serp_element.serp_item.rank_changes?.previous_rank_absolute || null,
        intent: item.keyword_data.search_intent_info.main_intent,
        lastUpdatedTime: item.keyword_data.keyword_info.last_updated_time,
        url: item.ranked_serp_element.serp_item.url,
        isFeaturedSnippet: item.ranked_serp_element.serp_item.type === 'featured_snippet',
        keywordDifficulty: item.keyword_data.keyword_properties.keyword_difficulty,
        monthlySearches: item.keyword_data.keyword_info.monthly_searches || []
      })),
      metrics: result.metrics,
      totalCount: result.total_count || 0
    };
  } catch (error) {
    console.error('Ranked Keywords API Error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch ranked keywords');
  }
}
