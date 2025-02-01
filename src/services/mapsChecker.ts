import { api } from './api';

interface MapsSearchResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  check_url: string;
  title: string;
  contact_url: string | null;
  contributor_url: string | null;
  rating: {
    value: number;
    votes_count: number;
  } | null;
  snippet: string;
  address: string;
  place_id: string;
  phone: string | null;
  main_image: string | null;
  category: string;
  latitude: number;
  longitude: number;
  is_claimed: boolean;
}

export async function fetchMapsResults(
  keyword: string,
  locationCode: string,
  languageCode: string
): Promise<MapsSearchResult[]> {
  try {
    const payload = [{
      keyword,
      "location_code": parseInt(locationCode),
      "language_code": languageCode,
      "device": "desktop",
      "os": "windows",
      depth: 100
    }];

    const response = await api.post('/serp/google/maps/live/advanced', payload);

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      throw new Error('No data received from API');
    }
    
    const result = response.data.tasks[0].result[0];
    const checkUrl = result.check_url || '';

    return response.data.tasks[0].result[0].items
      .filter(item => item.type === 'maps_search')
      .map(item => ({
        type: item.type,
        rank_group: item.rank_group,
        rank_absolute: item.rank_absolute,
        check_url: checkUrl,
        title: item.title,
        contact_url: item.contact_url,
        contributor_url: item.contributor_url,
        rating: item.rating,
        snippet: item.snippet,
        address: item.address,
        place_id: item.place_id,
        phone: item.phone,
        main_image: item.main_image,
        category: item.category,
        latitude: item.latitude,
        longitude: item.longitude,
        is_claimed: item.is_claimed
      }));
  } catch (error) {
    console.error('Maps Search API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch maps results');
  }
}
