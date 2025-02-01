import { api } from './api';

interface SingleTrafficShareFilter {
  minTraffic?: number;
  maxTraffic?: number;
  urlContains?: string;
  minKeywords?: number;
  maxKeywords?: number;
}

interface SingleTrafficShareResponse {
  tasks: Array<{
    result: Array<{
      total_count: number;
      items: Array<{
        domain: string;
        avg_position: number;
        median_position: number;
        rating: number;
        etv: number;
        keywords_count: number;
        visibility: number;
        relevant_serp_items: number;
        keywords_positions: Record<string, number[]>;
      }>;
    }>;
  }>;
}

export async function fetchSingleTrafficShare(
  keyword: string,
  locationCode: string,
  languageCode: string,
  includeSubdomains: boolean,
  filters?: SingleTrafficShareFilter,
  offset: number = 0
) {
  try {
    const payload = [{
      keywords: [keyword],
      location_code: parseInt(locationCode),
      language_code: languageCode,
      include_subdomains: includeSubdomains,
      item_types: ["organic", "featured_snippet"],
      limit: 100,
      offset: offset,
      order_by: ["etv,desc"]
    }];

    // Add filters if provided
    if (filters) {
      const filterArray = [];

      if (filters.urlContains) {
        filterArray.push(["domain", "like", `%${filters.urlContains}%`]);
      }

      if (filters.minTraffic !== undefined || filters.maxTraffic !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        if (filters.minTraffic !== undefined) {
          filterArray.push(["etv", ">=", filters.minTraffic]);
        }
        if (filters.maxTraffic !== undefined) {
          if (filters.minTraffic !== undefined) filterArray.push("and");
          filterArray.push(["etv", "<=", filters.maxTraffic]);
        }
      }

      if (filters.minKeywords !== undefined || filters.maxKeywords !== undefined) {
        if (filterArray.length > 0) filterArray.push("and");
        if (filters.minKeywords !== undefined) {
          filterArray.push(["keywords_count", ">=", filters.minKeywords]);
        }
        if (filters.maxKeywords !== undefined) {
          if (filters.minKeywords !== undefined) filterArray.push("and");
          filterArray.push(["keywords_count", "<=", filters.maxKeywords]);
        }
      }

      if (filterArray.length > 0) {
        payload[0].filters = filterArray;
      }
    }

    const response = await api.post<SingleTrafficShareResponse>(
      '/dataforseo_labs/google/serp_competitors/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    return {
      items: result.items,
      totalCount: result.total_count
    };
  } catch (error) {
    console.error('Single Traffic Share API Error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch traffic share data');
  }
}
