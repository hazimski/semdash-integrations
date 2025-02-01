export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          credits: number
          created_at: string
          updated_at: string
          team_id: string | null
          role: 'owner' | 'admin' | 'member' | null
        }
        Insert: {
          id: string
          email: string
          credits?: number
          team_id?: string | null
          role?: 'owner' | 'admin' | 'member' | null
        }
        Update: {
          email?: string
          credits?: number
          team_id?: string | null
          role?: 'owner' | 'admin' | 'member' | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          owner_id: string
        }
        Insert: {
          name: string
          owner_id: string
        }
        Update: {
          name?: string
        }
      }
      team_invites: {
        Row: {
          id: string
          team_id: string
          email: string
          role: 'admin' | 'member'
          token: string
          expires_at: string
          created_at: string
          invited_by: string
        }
        Insert: {
          team_id: string
          email: string
          role: 'admin' | 'member'
          token?: string
          expires_at?: string
          invited_by: string
        }
        Update: never
      }
      credits_history: {
        Row: {
          id: string
          user_id: string
          amount: number
          action: string
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          action: string
        }
        Update: never
      }
      backlink_results: {
        Row: {
          id: string
          user_id: string
          target: string
          main_domain_rank: number
          backlinks: number
          referring_domains: number
          broken_backlinks: number
          referring_domains_nofollow: number
          anchor: number
          image: number
          canonical: number
          redirect: number
          referring_links_tld: Json
          referring_ips: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          target: string
          main_domain_rank: number
          backlinks: number
          referring_domains: number
          broken_backlinks: number
          referring_domains_nofollow: number
          anchor: number
          image: number
          canonical: number
          redirect: number
          referring_links_tld: Json
          referring_ips: number
        }
        Update: {
          target?: string
          main_domain_rank?: number
          backlinks?: number
          referring_domains?: number
          broken_backlinks?: number
          referring_domains_nofollow?: number
          anchor?: number
          image?: number
          canonical?: number
          redirect?: number
          referring_links_tld?: Json
          referring_ips?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_credits: number
          p_action: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
