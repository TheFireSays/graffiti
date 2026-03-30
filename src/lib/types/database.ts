export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          actor_id: string
          created_at: string
          crew_id: string | null
          event_type: string
          id: string
          location: unknown
          metadata: Json
          tag_id: string | null
          zone_id: string | null
        }
        Insert: {
          actor_id: string
          created_at?: string
          crew_id?: string | null
          event_type: string
          id?: string
          location?: unknown
          metadata?: Json
          tag_id?: string | null
          zone_id?: string | null
        }
        Update: {
          actor_id?: string
          created_at?: string
          crew_id?: string | null
          event_type?: string
          id?: string
          location?: unknown
          metadata?: Json
          tag_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_direct_invites: {
        Row: {
          created_at: string
          crew_id: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crew_id: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crew_id?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_direct_invites_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_direct_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_direct_invites_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_join_requests: {
        Row: {
          created_at: string
          crew_id: string
          id: string
          message: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crew_id: string
          id?: string
          message?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crew_id?: string
          id?: string
          message?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_join_requests_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          crew_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          crew_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          crew_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          abbreviation: string
          color: string
          created_at: string
          founder_id: string
          id: string
          inactivity_warned_at: string | null
          last_tagged_at: string | null
          member_count: number
          name: string
          total_xp: number
          zones_controlled: number
        }
        Insert: {
          abbreviation: string
          color?: string
          created_at?: string
          founder_id: string
          id?: string
          inactivity_warned_at?: string | null
          last_tagged_at?: string | null
          member_count?: number
          name: string
          total_xp?: number
          zones_controlled?: number
        }
        Update: {
          abbreviation?: string
          color?: string
          created_at?: string
          founder_id?: string
          id?: string
          inactivity_warned_at?: string | null
          last_tagged_at?: string | null
          member_count?: number
          name?: string
          total_xp?: number
          zones_controlled?: number
        }
        Relationships: [
          {
            foreignKeyName: "crews_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_constants: {
        Row: {
          description: string | null
          key: string
          value: number
        }
        Insert: {
          description?: string | null
          key: string
          value: number
        }
        Update: {
          description?: string | null
          key?: string
          value?: number
        }
        Relationships: []
      }
      invites: {
        Row: {
          code: string
          created_at: string
          created_by: string
          crew_id: string
          expires_at: string | null
          id: string
          max_uses: number
          use_count: number
        }
        Insert: {
          code?: string
          created_at?: string
          created_by: string
          crew_id: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          use_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          crew_id?: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          body: string
          created_at: string
          event_type: string
          id: string
          is_read: boolean
          metadata: Json
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          event_type: string
          id?: string
          is_read?: boolean
          metadata?: Json
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          event_type?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      restricted_zones: {
        Row: {
          boundary: unknown
          category: string
          created_at: string
          id: string
          name: string
          source: string
        }
        Insert: {
          boundary: unknown
          category: string
          created_at?: string
          id?: string
          name: string
          source?: string
        }
        Update: {
          boundary?: unknown
          category?: string
          created_at?: string
          id?: string
          name?: string
          source?: string
        }
        Relationships: []
      }
      season_leaderboard: {
        Row: {
          crew_id: string
          rank: number | null
          season_id: string
          tags_gone_over: number
          tags_placed: number
          total_xp: number
          zones_held: number
        }
        Insert: {
          crew_id: string
          rank?: number | null
          season_id: string
          tags_gone_over?: number
          tags_placed?: number
          total_xp?: number
          zones_held?: number
        }
        Update: {
          crew_id?: string
          rank?: number | null
          season_id?: string
          tags_gone_over?: number
          tags_placed?: number
          total_xp?: number
          zones_held?: number
        }
        Relationships: [
          {
            foreignKeyName: "season_leaderboard_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_leaderboard_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          config: Json
          created_at: string
          ends_at: string
          id: string
          name: string
          starts_at: string
          status: string
        }
        Insert: {
          config?: Json
          created_at?: string
          ends_at: string
          id?: string
          name: string
          starts_at: string
          status?: string
        }
        Update: {
          config?: Json
          created_at?: string
          ends_at?: string
          id?: string
          name?: string
          starts_at?: string
          status?: string
        }
        Relationships: []
      }
      suspicious_activity: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          reason: string
          reviewed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          reason: string
          reviewed?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string
          reviewed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suspicious_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_images: {
        Row: {
          category: string
          created_at: string
          crew_id: string | null
          customizable_colors: Json
          id: string
          image_url: string
          is_brand: boolean
          is_premium: boolean
          name: string
          tier: number
        }
        Insert: {
          category: string
          created_at?: string
          crew_id?: string | null
          customizable_colors?: Json
          id?: string
          image_url: string
          is_brand?: boolean
          is_premium?: boolean
          name: string
          tier?: number
        }
        Update: {
          category?: string
          created_at?: string
          crew_id?: string | null
          customizable_colors?: Json
          id?: string
          image_url?: string
          is_brand?: boolean
          is_premium?: boolean
          name?: string
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "tag_images_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          compass_heading: number
          created_at: string
          crew_id: string | null
          custom_colors: Json
          gone_over_by: string | null
          id: string
          location: unknown
          status: string
          tag_image_id: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          compass_heading: number
          created_at?: string
          crew_id?: string | null
          custom_colors?: Json
          gone_over_by?: string | null
          id?: string
          location: unknown
          status?: string
          tag_image_id: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          compass_heading?: number
          created_at?: string
          crew_id?: string | null
          custom_colors?: Json
          gone_over_by?: string | null
          id?: string
          location?: unknown
          status?: string
          tag_image_id?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_gone_over_by_fkey"
            columns: ["gone_over_by"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_tag_image_id_fkey"
            columns: ["tag_image_id"]
            isOneToOne: false
            referencedRelation: "tag_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tag_image_grants: {
        Row: {
          crew_id: string
          granted_at: string
          tag_image_id: string
          user_id: string
        }
        Insert: {
          crew_id: string
          granted_at?: string
          tag_image_id: string
          user_id: string
        }
        Update: {
          crew_id?: string
          granted_at?: string
          tag_image_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tag_image_grants_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tag_image_grants_tag_image_id_fkey"
            columns: ["tag_image_id"]
            isOneToOne: false
            referencedRelation: "tag_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tag_image_grants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          crew_id: string | null
          display_name: string
          id: string
          is_banned: boolean
          last_tagged_at: string | null
          level: number
          spray_cans: number
          username: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          crew_id?: string | null
          display_name?: string
          id: string
          is_banned?: boolean
          last_tagged_at?: string | null
          level?: number
          spray_cans?: number
          username: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          crew_id?: string | null
          display_name?: string
          id?: string
          is_banned?: boolean
          last_tagged_at?: string | null
          level?: number
          spray_cans?: number
          username?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_crew_id"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          boundary: unknown
          controlling_crew_id: string | null
          created_at: string
          id: string
          last_flipped_at: string | null
          name: string
          tag_counts: Json
        }
        Insert: {
          boundary: unknown
          controlling_crew_id?: string | null
          created_at?: string
          id?: string
          last_flipped_at?: string | null
          name: string
          tag_counts?: Json
        }
        Update: {
          boundary?: unknown
          controlling_crew_id?: string | null
          created_at?: string
          id?: string
          last_flipped_at?: string | null
          name?: string
          tag_counts?: Json
        }
        Relationships: [
          {
            foreignKeyName: "zones_controlling_crew_id_fkey"
            columns: ["controlling_crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: { Args: { p_xp: number }; Returns: number }
      cancel_join_request: { Args: { p_request_id: string }; Returns: Json }
      check_restricted_zone: {
        Args: { p_lat: number; p_lng: number }
        Returns: {
          zone_category: string
          zone_name: string
        }[]
      }
      create_crew: {
        Args: { p_abbreviation: string; p_color: string; p_name: string }
        Returns: Json
      }
      decay_expired_tags: { Args: never; Returns: Json }
      delete_account: { Args: never; Returns: Json }
      find_zone_for_point: {
        Args: { p_lat: number; p_lng: number }
        Returns: string
      }
      flag_suspicious_activity: {
        Args: { p_metadata?: Json; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      get_active_season: { Args: never; Returns: Json }
      get_constant: { Args: { p_key: string }; Returns: number }
      get_og_eligible_members: {
        Args: { p_crew_id: string }
        Returns: string[]
      }
      get_season_leaderboard: {
        Args: { p_season_id: string }
        Returns: {
          crew_abbreviation: string
          crew_color: string
          crew_id: string
          crew_name: string
          rank: number
          tags_gone_over: number
          tags_placed: number
          total_xp: number
          zones_held: number
        }[]
      }
      get_tags_for_map: {
        Args: never
        Returns: {
          compass_heading: number
          created_at: string
          crew_abbreviation: string
          crew_color: string
          crew_id: string
          id: string
          lat: number
          lng: number
          status: string
          tag_category: string
          tag_image_name: string
          user_id: string
          username: string
        }[]
      }
      get_unread_notification_count: { Args: never; Returns: number }
      get_zones_for_map: {
        Args: never
        Returns: {
          boundary_geojson: string
          controlling_crew_id: string
          crew_abbreviation: string
          crew_color: string
          id: string
          name: string
          tag_counts: Json
        }[]
      }
      join_crew: { Args: { p_invite_code: string }; Returns: Json }
      leave_crew: { Args: never; Returns: Json }
      mark_notifications_read: {
        Args: { p_notification_ids: string[] }
        Returns: Json
      }
      place_tag_scored:
        | {
            Args: {
              p_compass_heading: number
              p_custom_colors: Json
              p_go_over_tag_id?: string
              p_lat: number
              p_lng: number
              p_tag_image_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_compass_heading: number
              p_custom_colors: Json
              p_go_over_tag_id?: string
              p_lat: number
              p_lng: number
              p_tag_image_id: string
              p_user_id: string
            }
            Returns: Json
          }
      process_crew_inactivity: { Args: never; Returns: undefined }
      register_push_token: {
        Args: { p_platform: string; p_token: string }
        Returns: Json
      }
      report_tag: {
        Args: { p_details?: string; p_reason: string; p_tag_id: string }
        Returns: Json
      }
      request_join_crew: {
        Args: { p_crew_id: string; p_message?: string }
        Returns: Json
      }
      respond_direct_invite: {
        Args: { p_accepted: boolean; p_invite_id: string }
        Returns: Json
      }
      review_join_request: {
        Args: { p_approved: boolean; p_request_id: string }
        Returns: Json
      }
      review_report: {
        Args: { p_action: string; p_report_id: string }
        Returns: Json
      }
      send_direct_invite: { Args: { p_target_username: string }; Returns: Json }
      unregister_push_token: { Args: { p_token: string }; Returns: Json }
      update_profile: {
        Args: {
          p_avatar_url?: string
          p_display_name?: string
          p_username?: string
        }
        Returns: Json
      }
      update_season_stats: {
        Args: {
          p_crew_id: string
          p_go_over_delta?: number
          p_tags_delta?: number
          p_xp_delta?: number
          p_zones_delta?: number
        }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

