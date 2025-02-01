import { api } from './api';

interface HistoricalRankResponse {
  tasks: Array<{
    result: Array<{
      items: Array<{
        year: number;
        month: number;
        metrics: {
          organic: {
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
            etv: number;
            count: number;
          };
        };
      }>;
    }>;
  }>;
}

export async function fetchHistoricalRankOverview(
  target: string,
  locationCode: string,
  languageCode: string
) {
  try {
    const payload = [{
      target,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      ignore_synonyms: true,
      include_clickstream_data: false,
      correlate: true
    }];

    const response = await api.post<HistoricalRankResponse>(
      '/dataforseo_labs/google/historical_rank_overview/live',
      payload
    );

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      throw new Error('No data received from API');
    }

    // Transform the data to include proper date strings
    const transformedData = response.data.tasks[0].result[0].items.map(item => ({
      date: new Date(item.year, item.month - 1).toISOString(),
      metrics: item.metrics
    }));

    // Sort by date ascending
    return transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Historical Rank Overview API Error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch historical rank overview');
  }
}
