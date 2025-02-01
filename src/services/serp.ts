import { api } from './api';

interface SerpKeywordResponse {
  tasks: Array<{
    result: Array<{
      seed_keyword_data?: {
        keyword_info: {
          search_volume: number;
          competition: number;
          cpc: number;
          monthly_searches: Array<{
            year: number;
            month: number;
            search_volume: number;
          }>;
        };
        keyword_properties: {
          keyword_difficulty: number;
        };
        search_intent_info: {
          main_intent: string;
        };
        avg_backlinks_info: {
          backlinks: number;
          referring_main_domains: number;
          main_domain_rank: number;
        };
      };
      items: Array<{
        keyword_data: {
          keyword: string;
          keyword_info: {
            search_volume: number;
            competition: number;
            cpc: number;
            monthly_searches: Array<{
              year: number;
              month: number;
              search_volume: number;
            }>;
          };
          keyword_properties: {
            keyword_difficulty: number;
          };
          search_intent_info: {
            main_intent: string;
          };
          avg_backlinks_info?: {
            backlinks: number;
            referring_main_domains: number;
            main_domain_rank: number;
          };
        };
      }>;
      total_count: number;
    }>;
  }>;
}

export async function fetchRelatedKeywords(
  keyword: string,
  locationCode: string,
  languageCode: string,
  depth: number,
  offset: number = 0
): Promise<{
  keywords: any[];
  totalCount: number;
}> {
  try {
    const payload = [{
      keyword,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      depth,
      include_seed_keyword: true,
      include_serp_info: true,
      ignore_synonyms: false,
      include_clickstream_data: false,
      replace_with_core_keyword: false,
      limit: 100,
      offset: offset
    }];

    const response = await api.post<SerpKeywordResponse>(
      '/dataforseo_labs/google/related_keywords/live',
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
        keyword: keyword,
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

    // Add related keywords
    if (result.items) {
      keywords.push(...result.items.map(item => ({
        keyword: item.keyword_data.keyword,
        searchVolume: item.keyword_data.keyword_info.search_volume,
        cpc: item.keyword_data.keyword_info.cpc,
        competition: (item.keyword_data.keyword_info.competition || 0) * 100,
        keywordDifficulty: item.keyword_data.keyword_properties.keyword_difficulty,
        monthlySearches: item.keyword_data.keyword_info.monthly_searches,
        backlinks: item.keyword_data.avg_backlinks_info?.backlinks || 0,
        referringDomains: item.keyword_data.avg_backlinks_info?.referring_main_domains || 0,
        domainRank: item.keyword_data.avg_backlinks_info?.main_domain_rank || 0,
        intent: item.keyword_data.search_intent_info?.main_intent || 'Unknown'
      })));
    }
    
    return {
      keywords,
      totalCount: result.total_count || 0
    };
  } catch (error) {
    console.error('SERP API Error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch related keywords');
  }
}
