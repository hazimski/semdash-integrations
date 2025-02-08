
export interface DomainKeyword {
  keyword: string;
  searchVolume: number;
  etv: number;
  cpc: number | null;
  rankAbsolute: number;
  previousRankAbsolute: number | null;
  intent: string;
  lastUpdatedTime: string;
  relativeUrl: string;
  isFeaturedSnippet: boolean;
  monthlySearches: Array<{
    year: number;
    month: number;
    searchVolume: number;
  }>;
}

export interface BacklinkData {
  target: string;
  main_domain_rank: number;
  backlinks: number;
  referring_domains: number;
  broken_backlinks: number;
  broken_pages: number;
  referring_domains_nofollow: number;
  anchor: number;
  image: number;
  canonical: number;
  redirect: number;
  referring_links_tld: Record<string, number>;
  referring_ips: number;
  tags?: string[];
  referring_links_attributes?: Record<string, number>;
  referring_links_platform_types?: Record<string, number>;
  referring_links_semantic_locations?: Record<string, number>;
  referring_links_countries?: Record<string, number>;
}

export interface DomainApiResponse {
  tasks: Array<{
    result: Array<{
      total_count: number;
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
            is_featured_snippet: boolean;
          };
        };
        last_updated_time: string;
      }>;
    }>;
  }>;
}

