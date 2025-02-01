export interface BacklinkData {
  id?: string;
  firebase_uid?: string;
  target: string;
  main_domain_rank: number;
  backlinks: number;
  referring_domains: number;
  broken_backlinks: number;
  referring_domains_nofollow: number;
  anchor: number;
  image: number;
  canonical: number;
  redirect: number;
  referring_links_tld: Record<string, number>;
  referring_ips: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse {
  tasks: Array<{
    result: Array<{
      items: Array<{
        url: string;
        main_domain_rank: number;
        backlinks: number;
        referring_domains: number;
        broken_backlinks: number;
        referring_domains_nofollow: number;
        referring_links_types: {
          anchor?: number;
          image?: number;
          canonical?: number;
          redirect?: number;
        };
        referring_links_tld: Record<string, number>;
        referring_ips: number;
      }>;
    }>;
  }>;
}
