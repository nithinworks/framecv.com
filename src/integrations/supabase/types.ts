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
      feature_flags: {
        Row: {
          created_at: string
          daily_limit: number
          daily_used_count: number
          github_deploy_status: boolean
          id: string
          last_reset_date: string
          process_resume_status: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number
          daily_used_count?: number
          github_deploy_status?: boolean
          id?: string
          last_reset_date?: string
          process_resume_status?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_limit?: number
          daily_used_count?: number
          github_deploy_status?: boolean
          id?: string
          last_reset_date?: string
          process_resume_status?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_stats: {
        Row: {
          created_at: string
          downloads: number
          github_deployments: number
          id: string
          portfolios_via_manual: number
          portfolios_via_resume: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          downloads?: number
          github_deployments?: number
          id?: string
          portfolios_via_manual?: number
          portfolios_via_resume?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          downloads?: number
          github_deployments?: number
          id?: string
          portfolios_via_manual?: number
          portfolios_via_resume?: number
          updated_at?: string
        }
        Relationships: []
      }
      resume_extractions: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          portfolio_data: Json
          processing_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          portfolio_data: Json
          processing_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          portfolio_data?: Json
          processing_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_submissions: {
        Row: {
          action_type: string
          created_at: string
          email: string
          id: string
          name: string
          portfolio_link: string | null
          portfolio_name: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          email: string
          id?: string
          name: string
          portfolio_link?: string | null
          portfolio_name?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          portfolio_link?: string | null
          portfolio_name?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_to_waitlist: {
        Args: { user_name: string; user_email: string }
        Returns: boolean
      }
      check_and_increment_daily_usage: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_daily_usage_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          daily_limit: number
          daily_used_count: number
          remaining_count: number
        }[]
      }
      get_portfolio_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          portfolios_via_resume: number
          portfolios_via_manual: number
          github_deployments: number
          downloads: number
          last_updated: string
        }[]
      }
      get_waitlist_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      increment_portfolio_stat: {
        Args: { stat_type: string }
        Returns: boolean
      }
      update_feature_flag: {
        Args: { flag_name: string; flag_value: boolean }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
