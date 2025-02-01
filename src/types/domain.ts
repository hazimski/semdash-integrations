export interface MonthlySearch {
  date: string;
  search_volume: number;
}

export interface RankedKeyword {
  keyword: string;
  search_volume: number;
  relative_url: string;
  etv: number;
  cpc: number;
  keyword_difficulty: number;
  rank_absolute: number;
  rank_change: number;
  main_intent: string;
  last_updated_time: string;
  monthly_searches: MonthlySearch[];
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
            competition_level: string;
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
          };
        };
        keyword_properties: {
          keyword_difficulty: number;
        };
        last_updated_time: string;
      }>;
    }>;
  }>;
}
