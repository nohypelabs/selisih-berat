export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: number
          resource: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          id?: number
          resource?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          id?: number
          resource?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      entries: {
        Row: {
          berat_aktual: number
          berat_resi: number
          catatan: string | null
          created_at: string | null
          created_by: string | null
          foto_url_1: string | null
          foto_url_2: string | null
          id: number
          nama: string
          no_resi: string
          notes: string | null
          selisih: number
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          berat_aktual: number
          berat_resi: number
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          foto_url_1?: string | null
          foto_url_2?: string | null
          id?: number
          nama: string
          no_resi: string
          notes?: string | null
          selisih: number
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          berat_aktual?: number
          berat_resi?: number
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          foto_url_1?: string | null
          foto_url_2?: string | null
          id?: number
          nama?: string
          no_resi?: string
          notes?: string | null
          selisih?: number
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      entries_backup_20250114: {
        Row: {
          berat_aktual: number | null
          berat_resi: number | null
          catatan: string | null
          created_at: string | null
          created_by: string | null
          foto_url_1: string | null
          foto_url_2: string | null
          id: number | null
          nama: string | null
          no_resi: string | null
          notes: string | null
          selisih: number | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          berat_aktual?: number | null
          berat_resi?: number | null
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          foto_url_1?: string | null
          foto_url_2?: string | null
          id?: number | null
          nama?: string | null
          no_resi?: string | null
          notes?: string | null
          selisih?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          berat_aktual?: number | null
          berat_resi?: number | null
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          foto_url_1?: string | null
          foto_url_2?: string | null
          id?: number | null
          nama?: string | null
          no_resi?: string | null
          notes?: string | null
          selisih?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          id: number
          key: string
          type: string | null
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: number
          key: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: number
          key?: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          avg_selisih: number | null
          created_at: string | null
          daily_earnings: number | null
          daily_entries: number | null
          days_with_entries: number | null
          id: number
          last_entry_date: string | null
          last_updated: string | null
          total_earnings: number | null
          total_entries: number | null
          username: string
        }
        Insert: {
          avg_selisih?: number | null
          created_at?: string | null
          daily_earnings?: number | null
          daily_entries?: number | null
          days_with_entries?: number | null
          id?: number
          last_entry_date?: string | null
          last_updated?: string | null
          total_earnings?: number | null
          total_entries?: number | null
          username: string
        }
        Update: {
          avg_selisih?: number | null
          created_at?: string | null
          daily_earnings?: number | null
          daily_entries?: number | null
          days_with_entries?: number | null
          id?: number
          last_entry_date?: string | null
          last_updated?: string | null
          total_earnings?: number | null
          total_entries?: number | null
          username?: string
        }
        Relationships: []
      }
      user_statistics_backup_20250114: {
        Row: {
          avg_selisih: number | null
          created_at: string | null
          daily_earnings: number | null
          daily_entries: number | null
          id: number | null
          last_entry_date: string | null
          last_updated: string | null
          total_earnings: number | null
          total_entries: number | null
          username: string | null
        }
        Insert: {
          avg_selisih?: number | null
          created_at?: string | null
          daily_earnings?: number | null
          daily_entries?: number | null
          id?: number | null
          last_entry_date?: string | null
          last_updated?: string | null
          total_earnings?: number | null
          total_entries?: number | null
          username?: string | null
        }
        Update: {
          avg_selisih?: number | null
          created_at?: string | null
          daily_earnings?: number | null
          daily_entries?: number | null
          id?: number | null
          last_entry_date?: string | null
          last_updated?: string | null
          total_earnings?: number | null
          total_entries?: number | null
          username?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: number
          is_active: boolean | null
          last_login: string | null
          password: string
          role: string
          security_answer: string | null
          security_question: string | null
          updated_at: string | null
          username: string
          avatar_url: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          is_active?: boolean | null
          last_login?: string | null
          password: string
          role?: string
          security_answer?: string | null
          security_question?: string | null
          updated_at?: string | null
          username: string
          avatar_url?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          is_active?: boolean | null
          last_login?: string | null
          password?: string
          role?: string
          security_answer?: string | null
          security_question?: string | null
          updated_at?: string | null
          username?: string
          avatar_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      daily_top_performers: {
        Row: {
          avg_selisih: number | null
          daily_berat: number | null
          daily_earnings: number | null
          daily_entries: number | null
          rank: number | null
          username: string | null
        }
        Relationships: []
      }
      stats_summary: {
        Row: {
          avg_weight: number | null
          first_entry: string | null
          latest_entry: string | null
          total_difference: number | null
          total_entries: number | null
          total_users: number | null
        }
        Relationships: []
      }
      total_top_performers: {
        Row: {
          avg_selisih: number | null
          first_entry: string | null
          last_entry: string | null
          rank: number | null
          total_berat: number | null
          total_earnings: number | null
          total_entries: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_earnings: {
        Args: { p_username: string }
        Returns: {
          bonus_earnings: number
          daily_bonus: number
          days_with_entries: number
          entries_earnings: number
          rate_per_entry: number
          total_earnings: number
          total_entries: number
          username: string
        }[]
      }
      get_daily_top_performers: {
        Args: { limit_count?: number }
        Returns: {
          avg_selisih: number
          daily_earnings: number
          daily_entries: number
          rank: number
          username: string
        }[]
      }
      get_total_top_performers: {
        Args: { limit_count?: number }
        Returns: {
          avg_selisih: number
          first_entry: string
          last_entry: string
          rank: number
          total_earnings: number
          total_entries: number
          username: string
        }[]
      }
      reset_daily_statistics: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_user_statistics: {
        Args: { p_username: string }
        Returns: undefined
      }
      update_user_statistics_earnings: { Args: never; Returns: undefined }
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
  public: {
    Enums: {},
  },
} as const
