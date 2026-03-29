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
      tag_images: {
        Row: {
          category: string
          created_at: string
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
          customizable_colors?: Json
          id?: string
          image_url?: string
          is_brand?: boolean
          is_premium?: boolean
          name?: string
          tier?: number
        }
        Relationships: []
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
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          crew_id: string | null
          display_name: string
          id: string
          is_banned: boolean
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
      check_restricted_zone: {
        Args: { p_lat: number; p_lng: number }
        Returns: {
          zone_category: string
          zone_name: string
        }[]
      }
      find_zone_for_point: {
        Args: { p_lat: number; p_lng: number }
        Returns: string
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

