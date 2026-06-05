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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_types: {
        Row: {
          code: string
          created_at: string
          id: string
          label: string
          sort_order: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          logo_url: string | null
          name: string | null
          tax_id: string | null
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          logo_url?: string | null
          name?: string | null
          tax_id?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          logo_url?: string | null
          name?: string | null
          tax_id?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          body: string | null
          created_at: string
          id: string
          lead_id: string
          occurred_at: string
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          lead_id: string
          occurred_at?: string
          title?: string | null
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          occurred_at?: string
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          category: string
          created_at: string
          discovery: Json
          email: string | null
          id: string
          name: string
          next_action_at: string | null
          next_action_note: string | null
          notes: string | null
          owner_name: string | null
          phone: string | null
          rating: number | null
          status: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          created_at?: string
          discovery?: Json
          email?: string | null
          id?: string
          name: string
          next_action_at?: string | null
          next_action_note?: string | null
          notes?: string | null
          owner_name?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          discovery?: Json
          email?: string | null
          id?: string
          name?: string
          next_action_at?: string | null
          next_action_note?: string | null
          notes?: string | null
          owner_name?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      machine_products: {
        Row: {
          created_at: string
          id: string
          machine_id: string
          price: number
          product_name: string
          slot_code: string
          stock: number
          stock_capacity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          machine_id: string
          price?: number
          product_name: string
          slot_code: string
          stock?: number
          stock_capacity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          machine_id?: string
          price?: number
          product_name?: string
          slot_code?: string
          stock?: number
          stock_capacity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      machine_sales: {
        Row: {
          created_at: string
          id: string
          machine_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sold_at: string
          total: number
          unit_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          machine_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sold_at?: string
          total?: number
          unit_price?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          machine_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sold_at?: string
          total?: number
          unit_price?: number
          user_id?: string
        }
        Relationships: []
      }
      machine_services: {
        Row: {
          body: string | null
          created_at: string
          id: string
          machine_id: string
          occurred_at: string
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          machine_id: string
          occurred_at?: string
          title?: string | null
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          machine_id?: string
          occurred_at?: string
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      machines: {
        Row: {
          code: string
          created_at: string
          id: string
          installed_at: string | null
          last_service_at: string | null
          lead_id: string | null
          location_label: string | null
          model: string | null
          name: string
          notes: string | null
          slots_total: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          installed_at?: string | null
          last_service_at?: string | null
          lead_id?: string | null
          location_label?: string | null
          model?: string | null
          name: string
          notes?: string | null
          slots_total?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          installed_at?: string | null
          last_service_at?: string | null
          lead_id?: string | null
          location_label?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          slots_total?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_catalog: {
        Row: {
          created_at: string
          default_price: number
          id: string
          name: string
          notes: string | null
          sku: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_price?: number
          id?: string
          name: string
          notes?: string | null
          sku?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_price?: number
          id?: string
          name?: string
          notes?: string | null
          sku?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          language: string
          notify_email: boolean
          notify_in_app: boolean
          table_density: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          language?: string
          notify_email?: boolean
          notify_in_app?: boolean
          table_density?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          language?: string
          notify_email?: boolean
          notify_in_app?: boolean
          table_density?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lead_belongs_to_user: {
        Args: { _lead_id: string; _user_id: string }
        Returns: boolean
      }
      machine_belongs_to_user: {
        Args: { _machine_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operador" | "viewer"
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
    Enums: {
      app_role: ["admin", "operador", "viewer"],
    },
  },
} as const
