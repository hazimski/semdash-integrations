export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          changed_at: string | null
          id: number
          new_value: Json | null
          old_value: Json | null
          operation: string | null
          table_name: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: number
          new_value?: Json | null
          old_value?: Json | null
          operation?: string | null
          table_name?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: number
          new_value?: Json | null
          old_value?: Json | null
          operation?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      backlink_results: {
        Row: {
          anchor: number
          backlinks: number
          broken_backlinks: number
          canonical: number
          created_at: string
          id: string
          image: number
          main_domain_rank: number
          redirect: number
          referring_domains: number
          referring_domains_nofollow: number
          referring_ips: number
          referring_links_tld: Json
          target: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anchor: number
          backlinks: number
          broken_backlinks: number
          canonical: number
          created_at?: string
          id?: string
          image: number
          main_domain_rank: number
          redirect: number
          referring_domains: number
          referring_domains_nofollow: number
          referring_ips: number
          referring_links_tld: Json
          target: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anchor?: number
          backlinks?: number
          broken_backlinks?: number
          canonical?: number
          created_at?: string
          id?: string
          image?: number
          main_domain_rank?: number
          redirect?: number
          referring_domains?: number
          referring_domains_nofollow?: number
          referring_ips?: number
          referring_links_tld?: Json
          target?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlink_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credits_history: {
        Row: {
          action: string
          amount: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_history: {
        Row: {
          created_at: string
          data: Json
          domain: string
          id: string
          language_code: string
          location_code: string
          metrics: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          domain: string
          id?: string
          language_code: string
          location_code: string
          metrics: Json
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          domain?: string
          id?: string
          language_code?: string
          location_code?: string
          metrics?: Json
          user_id?: string
        }
        Relationships: []
      }
      domain_overviews: {
        Row: {
          created_at: string
          data: Json
          domain: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          domain: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          domain?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      keyword_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      list_keywords: {
        Row: {
          competition: number | null
          cpc: number | null
          created_at: string
          id: string
          intent: string | null
          keyword: string
          keyword_difficulty: number | null
          language: string
          list_id: string
          location: string
          search_volume: number | null
          source: string
        }
        Insert: {
          competition?: number | null
          cpc?: number | null
          created_at?: string
          id?: string
          intent?: string | null
          keyword: string
          keyword_difficulty?: number | null
          language: string
          list_id: string
          location: string
          search_volume?: number | null
          source: string
        }
        Update: {
          competition?: number | null
          cpc?: number | null
          created_at?: string
          id?: string
          intent?: string | null
          keyword?: string
          keyword_difficulty?: number | null
          language?: string
          list_id?: string
          location?: string
          search_volume?: number | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_keywords_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "keyword_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      local_serp_history: {
        Row: {
          created_at: string | null
          device: string
          id: string
          keyword: string
          language_code: string
          location_code: number
          os: string
          results: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device: string
          id?: string
          keyword: string
          language_code: string
          location_code: number
          os: string
          results?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device?: string
          id?: string
          keyword?: string
          language_code?: string
          location_code?: number
          os?: string
          results?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      local_serp_locations: {
        Row: {
          country_iso_code: string | null
          created_at: string | null
          id: string
          location_code: number
          location_code_parent: number | null
          location_name: string
          location_type: string
          updated_at: string | null
        }
        Insert: {
          country_iso_code?: string | null
          created_at?: string | null
          id?: string
          location_code: number
          location_code_parent?: number | null
          location_name: string
          location_type: string
          updated_at?: string | null
        }
        Update: {
          country_iso_code?: string | null
          created_at?: string | null
          id?: string
          location_code?: number
          location_code_parent?: number | null
          location_name?: string
          location_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_notes: {
        Row: {
          created_at: string
          date: string
          id: string
          note: string
          target: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          note: string
          target: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          note?: string
          target?: string
          user_id?: string
        }
        Relationships: []
      }
      rank_tracking_keywords: {
        Row: {
          created_at: string
          id: string
          keyword: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_tracking_keywords_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rank_tracking_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_tracking_projects: {
        Row: {
          competitors: Json | null
          created_at: string
          device: string
          domain: string
          id: string
          language_code: string
          location_code: number
          name: string | null
          os: string
          schedule: string
          updated_at: string
          user_id: string
        }
        Insert: {
          competitors?: Json | null
          created_at?: string
          device: string
          domain: string
          id?: string
          language_code: string
          location_code: number
          name?: string | null
          os: string
          schedule: string
          updated_at?: string
          user_id: string
        }
        Update: {
          competitors?: Json | null
          created_at?: string
          device?: string
          domain?: string
          id?: string
          language_code?: string
          location_code?: number
          name?: string | null
          os?: string
          schedule?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rank_tracking_results: {
        Row: {
          created_at: string
          domain: string
          id: string
          keyword: string
          rank_absolute: number
          task_id: string
          url: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          keyword: string
          rank_absolute: number
          task_id: string
          url: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          keyword?: string
          rank_absolute?: number
          task_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_tracking_results_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "rank_tracking_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_tracking_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          external_task_id: string
          id: string
          keyword: string
          project_id: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          external_task_id: string
          id?: string
          keyword: string
          project_id: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          external_task_id?: string
          id?: string
          keyword?: string
          project_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rank_tracking_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rank_tracking_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_domain_history: {
        Row: {
          created_at: string
          domain_history_id: string
          expires_at: string
          id: string
          share_token: string
        }
        Insert: {
          created_at?: string
          domain_history_id: string
          expires_at: string
          id?: string
          share_token: string
        }
        Update: {
          created_at?: string
          domain_history_id?: string
          expires_at?: string
          id?: string
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_domain_history_domain_history_id_fkey"
            columns: ["domain_history_id"]
            isOneToOne: false
            referencedRelation: "domain_history"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string
          email: string
          email_data: Json | null
          expires_at: string
          id: string
          invited_by: string
          role: string
          status: string | null
          team_id: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          email_data?: Json | null
          expires_at?: string
          id?: string
          invited_by: string
          role: string
          status?: string | null
          team_id: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          email_data?: Json | null
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string | null
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          custom_domain: string | null
          openai_api_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          openai_api_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          openai_api_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          credits: number
          email: string
          id: string
          plan: string | null
          role: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_updated_at: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number
          email: string
          id: string
          plan?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_updated_at?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          email?: string
          id?: string
          plan?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_updated_at?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_team_invite: {
        Args: {
          p_token: string
        }
        Returns: boolean
      }
      cleanup_expired_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_backlink_results: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_local_serp_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rank_tracking_results: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_domain_share_link: {
        Args: {
          p_domain_history_id: string
          p_expires_in?: unknown
        }
        Returns: string
      }
      create_team: {
        Args: {
          p_name: string
          p_owner_id: string
        }
        Returns: string
      }
      create_team_invite: {
        Args: {
          p_team_id: string
          p_email: string
          p_role: string
        }
        Returns: Json
      }
      deduct_credits: {
        Args: {
          p_user_id: string
          p_credits: number
          p_action: string
        }
        Returns: boolean
      }
      delete_team_invite: {
        Args: {
          p_invite_id: string
        }
        Returns: undefined
      }
      get_domain_history_by_url: {
        Args: {
          p_url: string
        }
        Returns: {
          id: string
          domain: string
          location_code: string
          language_code: string
          metrics: Json
          data: Json
          created_at: string
        }[]
      }
      get_local_serp_history: {
        Args: {
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          domain: string
          competitors: Json
          keywords: Json
          device: string
          os: string
          location_code: number
          language_code: string
          results: Json
          created_at: string
        }[]
      }
      get_or_create_user_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_public_domain_history: {
        Args: {
          p_domain: string
        }
        Returns: {
          id: string
          domain: string
          location_code: string
          language_code: string
          metrics: Json
          data: Json
          created_at: string
        }[]
      }
      get_share_url: {
        Args: {
          p_share_token: string
          p_user_id: string
        }
        Returns: string
      }
      get_shared_domain_history: {
        Args: {
          p_share_token: string
        }
        Returns: {
          domain: string
          location_code: string
          language_code: string
          metrics: Json
          data: Json
          created_at: string
        }[]
      }
      get_user_domain_history: {
        Args: {
          p_limit?: number
        }
        Returns: {
          id: string
          domain: string
          location_code: string
          language_code: string
          metrics: Json
          data: Json
          created_at: string
        }[]
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_invite_active: {
        Args: {
          expires_at: string
        }
        Returns: boolean
      }
      save_domain_history:
        | {
            Args: {
              p_domain: string
              p_location_code: string
              p_language_code: string
              p_metrics: Json
            }
            Returns: string
          }
        | {
            Args: {
              p_domain: string
              p_location_code: string
              p_language_code: string
              p_metrics: Json
              p_data?: Json
            }
            Returns: string
          }
      save_domain_overview: {
        Args: {
          p_domain: string
          p_data: Json
        }
        Returns: string
      }
      save_local_serp_history: {
        Args: {
          p_domain: string
          p_competitors: Json
          p_keywords: Json
          p_device: string
          p_os: string
          p_location_code: number
          p_language_code: string
          p_results: Json
        }
        Returns: string
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      update_custom_domain: {
        Args: {
          p_domain: string
        }
        Returns: Json
      }
      upsert_local_serp_history:
        | {
            Args: {
              p_keyword: string
              p_location_code: number
              p_language_code: string
              p_device: string
              p_os: string
              p_results: Json
            }
            Returns: string
          }
        | {
            Args: {
              p_user_id: string
              p_keyword: string
              p_location_code: number
              p_language_code: string
              p_device: string
              p_os: string
              p_results: Json
            }
            Returns: string
          }
      validate_custom_domain: {
        Args: {
          p_domain: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never