import { Database } from '@supabase/supabase-js';

export interface Tables {
  users: {
    Row: {
      id: string;
      email: string;
      credits: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id: string;
      email: string;
      credits?: number;
    };
    Update: {
      email?: string;
      credits?: number;
    };
  };
  credits_history: {
    Row: {
      id: string;
      user_id: string;
      amount: number;
      action: string;
      created_at: string;
    };
    Insert: {
      user_id: string;
      amount: number;
      action: string;
    };
    Update: never;
  };
  backlink_results: {
    Row: {
      id: string;
      user_id: string;
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
      created_at: string;
      updated_at: string;
    };
    Insert: {
      user_id: string;
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
    };
    Update: {
      target?: string;
      main_domain_rank?: number;
      backlinks?: number;
      referring_domains?: number;
      broken_backlinks?: number;
      referring_domains_nofollow?: number;
      anchor?: number;
      image?: number;
      canonical?: number;
      redirect?: number;
      referring_links_tld?: Record<string, number>;
      referring_ips?: number;
    };
  };
}
