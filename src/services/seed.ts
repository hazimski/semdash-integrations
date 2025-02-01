import { api } from './api';

interface SeedKeywordFilter {
  includeKeywords?: { value: string; operator: 'and' | 'or' }[];
  excludeKeywords?: { value: string; operator: 'and' | 'or' }[];
  intent?: string;
  minVolume?: number;
  maxVolume?: number;
  minCpc?: number;
  maxCpc?: number;
  minKd?: number;
  maxKd?: number;
}

export async function fetchSeedKeywords(
  keyword: string,
  locationCode: string,
  languageCode: string,
  filters?: SeedKeywordFilter,
  offset: number = 0
) {
  try {
    const payload = [{
      keyword,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      include_seed_keyword: true,
      include_serp_info: true,
      ignore_synonyms: true,
      include_clickstream_data: false,
      exact_match: false,
      limit: 100,
      offset: offset
    }];

    // Add filters if provided
    if (filters) {
      const filterArray = [];

      // Process include keywords
      if (filters.includeKeywords?.length) {
        const includeFilters = filters.includeKeywords.filter(k => k.value.trim());

        if (includeFilters.length === 1) {
          filterArray.push(["keyword", "like", `%${includeFilters[0].value}%`]);
        } else if (includeFilters.length > 1) {
          const groupedIncludes = includeFilters.map(k => ["keyword", "like", `%${k.value}%`]);
          
          // Use the operator from the filters
          const nestedIncludes = groupedIncludes.reduce((acc, curr, idx) => {
            if (idx === 0) return curr;
            return [acc, includeFilters[idx].operator.toLowerCase(), curr];
          });

          filterArray.push(nestedIncludes);
        }
      }

      // Process exclude keywords
      if (filters.excludeKeywords?.length) {
        const excludeFilters = filters.excludeKeywords.filter(k => k.value.trim());

        if (excludeFilters.length === 1) {
          filterArray.push(["keyword", "not_like", `%${excludeFilters[0].value}%`]);
        } else if (excludeFilters.length > 1) {
          const groupedExcludes = excludeFilters.map(k => ["keyword", "not_like", `%${k.value}%`]);
          
          // Use the operator from the filters
          const nestedExcludes = groupedExcludes.reduce((acc, curr, idx) => {
            if (idx === 0) return curr;
            return [acc, excludeFilters[idx].operator.toLowerCase(), curr];
          });

          filterArray.push(nestedExcludes);
        }
      }

      // Add volume filter
      if (filters.minVolume !== undefined || filters.maxVolume !== undefined) {
        const volumeFilters = [];

        if (filters.minVolume !== undefined) {
          volumeFilters.push(["keyword_info.search_volume", ">=", filters.minVolume]);
        }

        if (filters.maxVolume !== undefined) {
          volumeFilters.push(["keyword_info.search_volume", "<=", filters.maxVolume]);
        }

        if (volumeFilters.length > 1) {
          filterArray.push([volumeFilters[0], "and", volumeFilters[1]]);
        } else if (volumeFilters.length === 1) {
          filterArray.push(volumeFilters[0]);
        }
      }

      // Add CPC filter
      if (filters.minCpc !== undefined || filters.maxCpc !== undefined) {
        const cpcFilters = [];

        if (filters.minCpc !== undefined) {
          cpcFilters.push(["keyword_info.cpc", ">=", filters.minCpc]);
        }

        if (filters.maxCpc !== undefined) {
          cpcFilters.push(["keyword_info.cpc", "<=", filters.maxCpc]);
        }

        if (cpcFilters.length > 1) {
          filterArray.push([cpcFilters[0], "and", cpcFilters[1]]);
        } else if (cpcFilters.length === 1) {
          filterArray.push(cpcFilters[0]);
        }
      }

      // Add Keyword Difficulty filter
      if (filters.minKd !== undefined || filters.maxKd !== undefined) {
        const kdFilters = [];

        if (filters.minKd !== undefined) {
          kdFilters.push(["keyword_properties.keyword_difficulty", ">=", filters.minKd]);
        }

        if (filters.maxKd !== undefined) {
          kdFilters.push(["keyword_properties.keyword_difficulty", "<=", filters.maxKd]);
        }

        if (kdFilters.length > 1) {
          filterArray.push([kdFilters[0], "and", kdFilters[1]]);
        } else if (kdFilters.length === 1) {
          filterArray.push(kdFilters[0]);
        }
      }

      // Add intent filter
      if (filters.intent) {
        filterArray.push(["search_intent_info.main_intent", "=", filters.intent]);
      }

      // Finalize the filter array
      if (filterArray.length > 1) {
        payload[0].filters = filterArray.reduce((acc, curr) => [acc, "and", curr]);
      } else if (filterArray.length === 1) {
        payload[0].filters = filterArray[0];
      }
    }

    console.log('API Payload:', JSON.stringify(payload, null, 2));

    const response = await api.post(
      '/dataforseo_labs/google/keyword_suggestions/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from API');
    }

    const result = response.data.tasks[0].result[0];
    const keywords = [];

    // Add seed keyword if available
    if (result.seed_keyword_data) {
      keywords.push({
        keyword: result.seed_keyword,
        searchVolume: result.seed_keyword_data.keyword_info.search_volume,
        cpc: result.seed_keyword_data.keyword_info.cpc,
        competition: (result.seed_keyword_data.keyword_info.competition || 0) * 100,
        keywordDifficulty: result.seed_keyword_data.keyword_properties.keyword_difficulty,
        monthlySearches: result.seed_keyword_data.keyword_info.monthly_searches,
        backlinks: result.seed_keyword_data.avg_backlinks_info?.backlinks || 0,
        referringDomains: result.seed_keyword_data.avg_backlinks_info?.referring_main_domains || 0,
        domainRank: result.seed_keyword_data.avg_backlinks_info?.main_domain_rank || 0,
        intent: result.seed_keyword_data.search_intent_info?.main_intent || 'Unknown'
      });
    }

    // Add suggested keywords
    if (result.items) {
      keywords.push(...result.items.map(item => ({
        keyword: item.keyword,
        searchVolume: item.keyword_info.search_volume,
        cpc: item.keyword_info.cpc,
        competition: (item.keyword_info.competition || 0) * 100,
        keywordDifficulty: item.keyword_properties.keyword_difficulty,
        monthlySearches: item.keyword_info.monthly_searches,
        backlinks: item.avg_backlinks_info?.backlinks || 0,
        referringDomains: item.avg_backlinks_info?.referring_main_domains || 0,
        domainRank: item.avg_backlinks_info?.main_domain_rank || 0,
        intent: item.search_intent_info?.main_intent || 'Unknown'
      })));
    }

    return {
      keywords,
      totalCount: result.total_count || 0
    };
  } catch (error) {
    console.error('Seed Keywords API Error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch seed keywords');
  }
}
