import { api } from './api';

interface MonthlySearch {
  year: number;
  month: number;
  search_volume: number;
}

interface RelatedKeyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  keywordDifficulty: number;
  intent: string;
}

interface KeywordOverviewData {
  mainKeyword: {
    keyword: string;
    searchVolume: number;
    keywordDifficulty: number;
    monthlySearches: MonthlySearch[];
    referringDomains: number;
    backlinks: number;
    mainDomainRanking: number;
    intent: string;
  };
  relatedKeywords: RelatedKeyword[];
}

export async function fetchKeywordOverview(
  keyword: string,
  locationCode: string,
  languageCode: string
): Promise<KeywordOverviewData> {
  try {
    // First API call - Related Keywords
    const relatedPayload = [{
      keyword,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      depth: 2,
      include_seed_keyword: true,
      include_serp_info: true,
      ignore_synonyms: true,
      include_clickstream_data: false,
      replace_with_core_keyword: false,
      limit: 11,
      order_by: ["keyword_data.keyword_info.search_volume,desc"]
    }];

    console.log('Fetching related keywords with payload:', relatedPayload);

    const relatedResponse = await api.post(
      '/dataforseo_labs/google/related_keywords/live',
      relatedPayload
    );

    console.log('Related keywords API response:', relatedResponse.data);

    if (!relatedResponse.data?.tasks?.[0]?.result?.[0]) {
      throw new Error('No data received from related keywords API');
    }

    const result = relatedResponse.data.tasks[0].result[0];
    const seedData = result.seed_keyword_data;

    if (!seedData) {
      throw new Error('No seed keyword data available');
    }

    return {
      mainKeyword: {
        keyword: keyword,
        searchVolume: seedData.keyword_info.search_volume,
        keywordDifficulty: seedData.keyword_properties.keyword_difficulty,
        monthlySearches: seedData.keyword_info.monthly_searches,
        referringDomains: seedData.avg_backlinks_info?.referring_main_domains || 0,
        backlinks: seedData.avg_backlinks_info?.backlinks || 0,
        mainDomainRanking: seedData.avg_backlinks_info?.main_domain_rank || 0,
        intent: seedData.search_intent_info?.main_intent || 'Unknown'
      },
      relatedKeywords: result.items.map(item => ({
        keyword: item.keyword_data.keyword,
        searchVolume: item.keyword_data.keyword_info.search_volume,
        cpc: item.keyword_data.keyword_info.cpc,
        keywordDifficulty: item.keyword_data.keyword_properties.keyword_difficulty,
        intent: item.keyword_data.search_intent_info?.main_intent || 'Unknown'
      }))
    };
  } catch (error) {
    console.error('Keyword Overview API Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch keyword overview: ${error.message}`);
    }
    throw new Error('Failed to fetch keyword overview');
  }
}

export async function fetchKeywordSerps(
  keyword: string,
  locationCode: string,
  languageCode: string
) {
  try {
    const payload = [{
      keyword,
      location_code: parseInt(locationCode),
      language_code: languageCode
    }];

    console.log('Fetching SERP history with payload:', payload);

    const response = await api.post(
      '/dataforseo_labs/google/historical_serps/live',
      payload
    );

    console.log('SERP history API response:', response.data);

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      throw new Error('No SERP history data available');
    }

    // Sort items by date in ascending order
    const sortedItems = response.data.tasks[0].result[0].items.sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    return sortedItems.map(item => ({
      date: item.datetime,
      items: item.items,
      totalResults: item.se_results_count,
      itemsCount: item.items_count
    }));
  } catch (error) {
    console.error('SERP History API Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch SERP history: ${error.message}`);
    }
    throw new Error('Failed to fetch SERP history');
  }
}
