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
      ai_conversations: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          action_label: string | null
          action_route: string | null
          created_at: string
          dedupe_key: string | null
          email_sent_at: string | null
          id: string
          message: string
          read: boolean
          related_dossier_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: Database["public"]["Enums"]["alert_type"]
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_route?: string | null
          created_at?: string
          dedupe_key?: string | null
          email_sent_at?: string | null
          id?: string
          message: string
          read?: boolean
          related_dossier_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: Database["public"]["Enums"]["alert_type"]
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_route?: string | null
          created_at?: string
          dedupe_key?: string | null
          email_sent_at?: string | null
          id?: string
          message?: string
          read?: boolean
          related_dossier_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          type?: Database["public"]["Enums"]["alert_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_related_dossier_id_fkey"
            columns: ["related_dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      dossiers: {
        Row: {
          archived_at: string | null
          bien_id: string
          client_operation_id: string | null
          closed_at: string | null
          completion_level: string
          completion_score: number
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          metadata: Json
          owner_id: string
          status: Database["public"]["Enums"]["dossier_status"]
          title: string
          type: Database["public"]["Enums"]["dossier_type"]
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["dossier_visibility"]
        }
        Insert: {
          archived_at?: string | null
          bien_id: string
          client_operation_id?: string | null
          closed_at?: string | null
          completion_level?: string
          completion_score?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          metadata?: Json
          owner_id: string
          status?: Database["public"]["Enums"]["dossier_status"]
          title: string
          type: Database["public"]["Enums"]["dossier_type"]
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["dossier_visibility"]
        }
        Update: {
          archived_at?: string | null
          bien_id?: string
          client_operation_id?: string | null
          closed_at?: string | null
          completion_level?: string
          completion_score?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          metadata?: Json
          owner_id?: string
          status?: Database["public"]["Enums"]["dossier_status"]
          title?: string
          type?: Database["public"]["Enums"]["dossier_type"]
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["dossier_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "dossiers_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_participants: {
        Row: {
          accepted_at: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          dossier_id: string
          id: string
          invited_at: string
          invited_by: string
          person_id: string
          revoked_at: string | null
          role: string
          share_percentage: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          dossier_id: string
          id?: string
          invited_at?: string
          invited_by: string
          person_id: string
          revoked_at?: string | null
          role?: string
          share_percentage?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          dossier_id?: string
          id?: string
          invited_at?: string
          invited_by?: string
          person_id?: string
          revoked_at?: string | null
          role?: string
          share_percentage?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_participants_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email_alerts: boolean
          full_name: string | null
          id: string
          language: string
          onboarding_answers: Json | null
          onboarding_completed: boolean
          phone: string | null
          status: string
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email_alerts?: boolean
          full_name?: string | null
          id: string
          language?: string
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          phone?: string | null
          status?: string
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email_alerts?: boolean
          full_name?: string | null
          id?: string
          language?: string
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          phone?: string | null
          status?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      persons: {
        Row: {
          created_at: string
          created_by: string
          display_name: string
          email: string | null
          id: string
          linked_profile_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          display_name: string
          email?: string | null
          id?: string
          linked_profile_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          display_name?: string
          email?: string | null
          id?: string
          linked_profile_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persons_linked_profile_id_fkey"
            columns: ["linked_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biens: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          creation_context: string
          description: string | null
          id: string
          latitude: number | null
          location_label: string
          longitude: number | null
          origin_declared: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          creation_context: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_label: string
          longitude?: number | null
          origin_declared?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          creation_context?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_label?: string
          longitude?: number | null
          origin_declared?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      bien_right_holders: {
        Row: {
          bien_id: string
          created_at: string
          declared_by: string
          id: string
          person_id: string
          revoked_at: string | null
          role: string
          status: string
          verified_at: string | null
        }
        Insert: {
          bien_id: string
          created_at?: string
          declared_by: string
          id?: string
          person_id: string
          revoked_at?: string | null
          role: string
          status?: string
          verified_at?: string | null
        }
        Update: {
          bien_id?: string
          created_at?: string
          declared_by?: string
          id?: string
          person_id?: string
          revoked_at?: string | null
          role?: string
          status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bien_right_holders_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bien_right_holders_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_preferences: {
        Row: {
          accompaniment_preference: string
          assistance_level: string
          audio_preference: string
          context_type: string
          created_at: string
          interface_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accompaniment_preference?: string
          assistance_level?: string
          audio_preference?: string
          context_type?: string
          created_at?: string
          interface_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accompaniment_preference?: string
          assistance_level?: string
          audio_preference?: string
          context_type?: string
          created_at?: string
          interface_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          created_at: string
          dossier_id: string
          id: string
          metadata: Json
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          title: string | null
          type: Database["public"]["Enums"]["proof_type"]
          uploaded_by: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          dossier_id: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          title?: string | null
          type: Database["public"]["Enums"]["proof_type"]
          uploaded_by: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          dossier_id?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          title?: string | null
          type?: Database["public"]["Enums"]["proof_type"]
          uploaded_by?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "proofs_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
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
      participants: {
        Row: {
          accepted_at: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          dossier_id: string | null
          id: string | null
          invited_at: string | null
          invited_by: string | null
          person_id: string | null
          revoked_at: string | null
          role: string | null
          share_percentage: number | null
          status: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_dossier_participant: {
        Args: { p_dossier_id: string; p_person_id: string; p_role: string }
        Returns: string
      }
      can_view_dossier: {
        Args: { _dossier_id: string; _user_id: string }
        Returns: boolean
      }
      create_dossier: {
        Args: {
          p_bien_id: string
          p_client_operation_id?: string | null
          p_description?: string | null
          p_include_bien_holders?: boolean
          p_title: string
          p_type: Database["public"]["Enums"]["dossier_type"]
          p_visibility?: Database["public"]["Enums"]["dossier_visibility"]
        }
        Returns: string
      }
      revoke_dossier_participant: {
        Args: { p_participant_id: string }
        Returns: undefined
      }
      add_declared_right_holder: {
        Args: {
          p_bien_id: string
          p_display_name: string
          p_email?: string | null
          p_phone?: string | null
          p_role: string
        }
        Returns: string
      }
      can_view_bien: {
        Args: { _bien_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_person: {
        Args: { _person_id: string; _user_id: string }
        Returns: boolean
      }
      create_bien_with_holder: {
        Args: {
          p_creation_context: string
          p_description?: string | null
          p_holder_email?: string | null
          p_holder_name?: string | null
          p_holder_phone?: string | null
          p_holder_role?: string
          p_latitude?: number | null
          p_location_label: string
          p_longitude?: number | null
          p_origin_declared?: string | null
          p_title: string
          p_type: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_dossier_participant: {
        Args: { _dossier_id: string; _user_id: string }
        Returns: boolean
      }
      revoke_declared_right_holder: {
        Args: { p_relation_id: string }
        Returns: undefined
      }
      owns_dossier: {
        Args: { _dossier_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "low" | "medium" | "high"
      alert_type: "urgent" | "info" | "suggestion"
      app_role: "admin" | "moderator" | "user"
      dossier_status: "secure" | "incomplete" | "risk" | "brouillon" | "actif" | "en_attente" | "bloque" | "a_verifier" | "a_completer" | "en_traitement" | "a_finaliser" | "clos" | "archive"
      dossier_type: "terrain" | "heritage" | "volonte" | "conflit" | "savoir" | "acquisition" | "achat" | "succession" | "protection" | "regularisation" | "partage" | "transmission" | "vente" | "autre"
      dossier_visibility: "private" | "family" | "public" | "prive"
      participant_role: "owner" | "heir" | "witness" | "expert" | "viewer"
      proof_type: "image" | "document" | "video" | "audio"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      alert_severity: ["low", "medium", "high"],
      alert_type: ["urgent", "info", "suggestion"],
      app_role: ["admin", "moderator", "user"],
      dossier_status: ["secure", "incomplete", "risk", "brouillon", "actif", "en_attente", "bloque", "a_verifier", "a_completer", "en_traitement", "a_finaliser", "clos", "archive"],
      dossier_type: ["terrain", "heritage", "volonte", "conflit", "savoir", "acquisition", "achat", "succession", "protection", "regularisation", "partage", "transmission", "vente", "autre"],
      dossier_visibility: ["private", "family", "public", "prive"],
      participant_role: ["owner", "heir", "witness", "expert", "viewer"],
      proof_type: ["image", "document", "video", "audio"],
    },
  },
} as const
