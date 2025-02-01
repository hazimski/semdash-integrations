import { api } from './api';

interface PPAResponse {
  tasks: Array<{
    result: Array<{
      items: Array<{
        type: string;
        items?: Array<{
          type: string;
          title: string;
          seed_question: string | null;
          expanded_element: Array<{
            type: string;
            description: string;
            url: string;
            domain: string;
            title: string;
          }>;
        }>;
      }>;
    }>;
  }>;
}

interface PPAItem {
  title: string;
  seed_question: string | null;
  expanded_element: Array<{
    description: string;
    url: string;
    title: string;
    domain: string;
  }>;
}

export async function fetchPPAData(
  keyword: string,
  locationCode: string,
  languageCode: string
): Promise<PPAItem[]> {
  try {
    const payload = [{
      keyword,
      location_code: parseInt(locationCode),
      language_code: languageCode,
      device: "desktop",
      os: "windows",
      depth: 100,
      people_also_ask_click_depth: 4
    }];

    console.log('Fetching PPA data with payload:', payload);

    const response = await api.post<PPAResponse>(
      '/serp/google/organic/live/advanced',
      payload
    );

    console.log('PPA API Response:', response.data);

    if (!response.data?.tasks?.[0]?.result?.[0]?.items) {
      throw new Error('No data received from API');
    }

    // Find the people_also_ask section
    const ppaSection = response.data.tasks[0].result[0].items.find(
      item => item.type === 'people_also_ask'
    );

    if (!ppaSection?.items) {
      throw new Error('No PPA data found for this keyword');
    }

    // Transform and clean the data
    return ppaSection.items.map(item => ({
      title: item.title,
      seed_question: item.seed_question,
      expanded_element: item.expanded_element.map(element => ({
        description: element.description,
        url: element.url,
        title: element.title,
        domain: element.domain
      }))
    }));
  } catch (error) {
    console.error('PPA API Error:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to fetch PPA data: ${error.message}`);
    }
    
    throw new Error('Failed to fetch PPA data');
  }
}
