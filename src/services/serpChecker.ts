import { api } from './api';

interface SerpItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  domain: string;
  title: string;
  description: string;
  url: string;
  etv: number;
  rank_info?: {
    page_rank?: number;
    main_domain_rank?: number;
  };
  backlinks_info?: {
    referring_domains?: number;
    referring_main_domains?: number;
    backlinks?: number;
    dofollow?: number;
  };
  rank_changes?: {
    previous_rank_absolute?: number;
    is_new?: boolean;
    is_up?: boolean;
    is_down?: boolean;
  };
}

interface SerpHistoryResponse {
  tasks: Array<{
    result: Array<{
      items: Array<{
        datetime: string;
        items: SerpItem[];
        se_results_count?: number;
        items_count?: number;
      }>;
    }>;
  }>;
}

export async function fetchHistoricalSerps(
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

    const response = await api.post<SerpHistoryResponse>(
      '/dataforseo_labs/google/historical_serps/live',
      payload
    );

    console.log('SERP history API response:', response.data);

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      console.error('No data in API response');
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

export async function getSerpAnalysisData(items: SerpItem[]) {
  try {
    console.log('Processing SERP items:', items);

    // Filter organic results and transform data
    const results = items
      .filter(item => item.type === 'organic' || item.type === 'featured_snippet')
      .map(item => ({
        type: item.type,
        rank_group: item.rank_group,
        rank_absolute: item.rank_absolute,
        domain: item.domain,
        title: item.title,
        description: item.description,
        url: item.url,
        etv: item.etv,
        rank_info: item.rank_info,
        backlinks_info: item.backlinks_info,
        rank_changes: item.rank_changes
      }));

    console.log('Processed SERP results:', results);
    return results;
  } catch (error) {
    console.error('Error processing SERP data:', error);
    throw new Error('Failed to process SERP data');
  }
}
