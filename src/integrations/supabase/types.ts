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
      signalements:{Row:{actor_concerned_id:string|null;bien_id:string|null;closed_at:string|null;created_at:string;created_by:string;creator_role:string;description:string;dossier_id:string|null;expected_resolution:string|null;id:string;intervention_id:string|null;occurred_at:string|null;on_behalf_of:string|null;status:string;step_id:string|null;signalement_type:string;updated_at:string};Insert:{actor_concerned_id?:string|null;bien_id?:string|null;closed_at?:string|null;created_at?:string;created_by:string;creator_role:string;description:string;dossier_id?:string|null;expected_resolution?:string|null;id?:string;intervention_id?:string|null;occurred_at?:string|null;on_behalf_of?:string|null;status?:string;step_id?:string|null;signalement_type:string;updated_at?:string};Update:{actor_concerned_id?:string|null;bien_id?:string|null;closed_at?:string|null;created_at?:string;created_by?:string;creator_role?:string;description?:string;dossier_id?:string|null;expected_resolution?:string|null;id?:string;intervention_id?:string|null;occurred_at?:string|null;on_behalf_of?:string|null;status?:string;step_id?:string|null;signalement_type?:string;updated_at?:string};Relationships:[]}
      signalement_events:{Row:{actor_id:string|null;created_at:string;created_by:string;details:string|null;event_type:string;id:string;signalement_id:string};Insert:{actor_id?:string|null;created_at?:string;created_by:string;details?:string|null;event_type:string;id?:string;signalement_id:string};Update:{actor_id?:string|null;created_at?:string;created_by?:string;details?:string|null;event_type?:string;id?:string;signalement_id?:string};Relationships:[]}
      signalement_documents:{Row:{attached_by:string;created_at:string;document_id:string;signalement_id:string};Insert:{attached_by:string;created_at?:string;document_id:string;signalement_id:string};Update:{attached_by?:string;created_at?:string;document_id?:string;signalement_id?:string};Relationships:[]}
      signalement_witnesses:{Row:{actor_id:string|null;added_by:string;created_at:string;id:string;participant_id:string|null;signalement_id:string};Insert:{actor_id?:string|null;added_by:string;created_at?:string;id?:string;participant_id?:string|null;signalement_id:string};Update:{actor_id?:string|null;added_by?:string;created_at?:string;id?:string;participant_id?:string|null;signalement_id?:string};Relationships:[]}
      conversations:{Row:{access_request_id:string|null;closed_at:string|null;conversation_type:string;created_at:string;created_by:string;dossier_id:string;id:string;intervention_id:string|null;signalement_id:string|null;status:string;step_id:string|null};Insert:{access_request_id?:string|null;closed_at?:string|null;conversation_type:string;created_at?:string;created_by:string;dossier_id:string;id?:string;intervention_id?:string|null;signalement_id?:string|null;status?:string;step_id?:string|null};Update:{access_request_id?:string|null;closed_at?:string|null;conversation_type?:string;created_at?:string;created_by?:string;dossier_id?:string;id?:string;intervention_id?:string|null;signalement_id?:string|null;status?:string;step_id?:string|null};Relationships:[]}
      conversation_members:{Row:{conversation_id:string;id:string;joined_at:string;left_at:string|null;member_actor_id:string|null;member_user_id:string;role:string;status:string};Insert:{conversation_id:string;id?:string;joined_at?:string;left_at?:string|null;member_actor_id?:string|null;member_user_id:string;role:string;status?:string};Update:{conversation_id?:string;id?:string;joined_at?:string;left_at?:string|null;member_actor_id?:string|null;member_user_id?:string;role?:string;status?:string};Relationships:[]}
      messages:{Row:{attachment_document_id:string|null;audio_path:string|null;client_message_id:string;conversation_id:string;created_at:string;deleted_at:string|null;edited_at:string|null;id:string;message_type:string;reply_to_message_id:string|null;sender_actor_id:string|null;sender_user_id:string;server_received_at:string;text_content:string|null};Insert:{attachment_document_id?:string|null;audio_path?:string|null;client_message_id:string;conversation_id:string;created_at?:string;deleted_at?:string|null;edited_at?:string|null;id?:string;message_type:string;reply_to_message_id?:string|null;sender_actor_id?:string|null;sender_user_id:string;server_received_at?:string;text_content?:string|null};Update:{attachment_document_id?:string|null;audio_path?:string|null;client_message_id?:string;conversation_id?:string;created_at?:string;deleted_at?:string|null;edited_at?:string|null;id?:string;message_type?:string;reply_to_message_id?:string|null;sender_actor_id?:string|null;sender_user_id?:string;server_received_at?:string;text_content?:string|null};Relationships:[]}
      dossier_interventions: {
        Row: { actor_id:string|null; action_type:string; comment:string|null; created_at:string; dossier_id:string; id:string; on_behalf_of:string|null; participant_id:string|null; performed_at:string; performed_by:string; role:string; step_id:string|null; supersedes_intervention_id:string|null; territorial_level:string; verification_status:string; verified_at:string|null; verified_by:string|null }
        Insert: { actor_id?:string|null; action_type:string; comment?:string|null; created_at?:string; dossier_id:string; id?:string; on_behalf_of?:string|null; participant_id?:string|null; performed_at?:string; performed_by:string; role:string; step_id?:string|null; supersedes_intervention_id?:string|null; territorial_level:string; verification_status?:string; verified_at?:string|null; verified_by?:string|null }
        Update: { actor_id?:string|null; action_type?:string; comment?:string|null; created_at?:string; dossier_id?:string; id?:string; on_behalf_of?:string|null; participant_id?:string|null; performed_at?:string; performed_by?:string; role?:string; step_id?:string|null; supersedes_intervention_id?:string|null; territorial_level?:string; verification_status?:string; verified_at?:string|null; verified_by?:string|null }
        Relationships: []
      }
      access_requests: {
        Row: { created_at:string; dossier_id:string; expires_at:string|null; id:string; message:string|null; purpose:string; requested_by:string; requester_actor_id:string|null; resolved_at:string|null; resolved_by:string|null; status:string }
        Insert: { created_at?:string; dossier_id:string; expires_at?:string|null; id?:string; message?:string|null; purpose:string; requested_by:string; requester_actor_id?:string|null; resolved_at?:string|null; resolved_by?:string|null; status?:string }
        Update: { created_at?:string; dossier_id?:string; expires_at?:string|null; id?:string; message?:string|null; purpose?:string; requested_by?:string; requester_actor_id?:string|null; resolved_at?:string|null; resolved_by?:string|null; status?:string }
        Relationships: []
      }
      access_request_scopes: {
        Row:{request_id:string;scope:string}; Insert:{request_id:string;scope:string}; Update:{request_id?:string;scope?:string}; Relationships:[{foreignKeyName:"access_request_scopes_request_id_fkey";columns:["request_id"];isOneToOne:false;referencedRelation:"access_requests";referencedColumns:["id"]}]
      }
      access_grants: {
        Row:{created_from_request_id:string|null; dossier_id:string; expires_at:string|null; granted_at:string; granted_by:string; grantee_actor_id:string|null; grantee_user_id:string|null; id:string; purpose:string; revoked_at:string|null}
        Insert:{created_from_request_id?:string|null; dossier_id:string; expires_at?:string|null; granted_at?:string; granted_by:string; grantee_actor_id?:string|null; grantee_user_id?:string|null; id?:string; purpose:string; revoked_at?:string|null}
        Update:{created_from_request_id?:string|null; dossier_id?:string; expires_at?:string|null; granted_at?:string; granted_by?:string; grantee_actor_id?:string|null; grantee_user_id?:string|null; id?:string; purpose?:string; revoked_at?:string|null}
        Relationships:[]
      }
      access_grant_scopes:{Row:{grant_id:string;scope:string};Insert:{grant_id:string;scope:string};Update:{grant_id?:string;scope?:string};Relationships:[{foreignKeyName:"access_grant_scopes_grant_id_fkey";columns:["grant_id"];isOneToOne:false;referencedRelation:"access_grants";referencedColumns:["id"]}]}
      access_grant_documents:{Row:{document_id:string;grant_id:string};Insert:{document_id:string;grant_id:string};Update:{document_id?:string;grant_id?:string};Relationships:[{foreignKeyName:"access_grant_documents_grant_id_fkey";columns:["grant_id"];isOneToOne:false;referencedRelation:"access_grants";referencedColumns:["id"]}]}
      actor_competences: {
        Row: { actor_id: string; competence_code: string; created_at: string; expires_at: string | null; id: string; label: string; status: string; verified_at: string | null; verified_by: string | null }
        Insert: { actor_id: string; competence_code: string; created_at?: string; expires_at?: string | null; id?: string; label: string; status?: string; verified_at?: string | null; verified_by?: string | null }
        Update: { actor_id?: string; competence_code?: string; created_at?: string; expires_at?: string | null; id?: string; label?: string; status?: string; verified_at?: string | null; verified_by?: string | null }
        Relationships: [{ foreignKeyName: "actor_competences_actor_id_fkey"; columns: ["actor_id"]; isOneToOne: false; referencedRelation: "actors"; referencedColumns: ["id"] }]
      }
      actor_credentials: {
        Row: { actor_id: string; created_at: string; credential_type: string; document_id: string | null; expires_at: string | null; id: string; issued_at: string | null; reference: string | null; status: string; verified_at: string | null; verified_by: string | null }
        Insert: { actor_id: string; created_at?: string; credential_type: string; document_id?: string | null; expires_at?: string | null; id?: string; issued_at?: string | null; reference?: string | null; status?: string; verified_at?: string | null; verified_by?: string | null }
        Update: { actor_id?: string; created_at?: string; credential_type?: string; document_id?: string | null; expires_at?: string | null; id?: string; issued_at?: string | null; reference?: string | null; status?: string; verified_at?: string | null; verified_by?: string | null }
        Relationships: [{ foreignKeyName: "actor_credentials_actor_id_fkey"; columns: ["actor_id"]; isOneToOne: false; referencedRelation: "actors"; referencedColumns: ["id"] }]
      }
      actors: {
        Row: { actor_type: string; availability_status: string; created_at: string; description: string | null; id: string; is_published: boolean; location: string; name: string; profile_id: string | null; suspended_at: string | null; territorial_level: string; updated_at: string; verification_status: string; verified_at: string | null; verified_by: string | null }
        Insert: { actor_type: string; availability_status?: string; created_at?: string; description?: string | null; id?: string; is_published?: boolean; location: string; name: string; profile_id?: string | null; suspended_at?: string | null; territorial_level: string; updated_at?: string; verification_status?: string; verified_at?: string | null; verified_by?: string | null }
        Update: { actor_type?: string; availability_status?: string; created_at?: string; description?: string | null; id?: string; is_published?: boolean; location?: string; name?: string; profile_id?: string | null; suspended_at?: string | null; territorial_level?: string; updated_at?: string; verification_status?: string; verified_at?: string | null; verified_by?: string | null }
        Relationships: []
      }
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
          procedure_definition_id: string | null
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
          procedure_definition_id?: string | null
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
          procedure_definition_id?: string | null
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
          {
            foreignKeyName: "dossiers_procedure_definition_id_fkey"
            columns: ["procedure_definition_id"]
            isOneToOne: false
            referencedRelation: "procedure_definitions"
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
      procedure_definitions: {
        Row: {
          code: string
          created_at: string
          dossier_type: Database["public"]["Enums"]["dossier_type"]
          id: string
          source_reference: string | null
          status: string
          territory: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          verified_at: string | null
          verified_by: string | null
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          dossier_type: Database["public"]["Enums"]["dossier_type"]
          id?: string
          source_reference?: string | null
          status?: string
          territory: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version: number
        }
        Update: {
          code?: string
          created_at?: string
          dossier_type?: Database["public"]["Enums"]["dossier_type"]
          id?: string
          source_reference?: string | null
          status?: string
          territory?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version?: number
        }
        Relationships: []
      }
      procedure_steps: {
        Row: {
          code: string
          created_at: string
          id: string
          is_optional: boolean
          procedure_id: string
          required_competence: string | null
          required_document_types: string[]
          rules_json: Json | null
          short_description: string
          step_order: number
          territorial_level: string
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_optional?: boolean
          procedure_id: string
          required_competence?: string | null
          required_document_types?: string[]
          rules_json?: Json | null
          short_description: string
          step_order: number
          territorial_level: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_optional?: boolean
          procedure_id?: string
          required_competence?: string | null
          required_document_types?: string[]
          rules_json?: Json | null
          short_description?: string
          step_order?: number
          territorial_level?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_steps_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedure_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_steps: {
        Row: {
          blocked_reason: string | null
          completed_at: string | null
          created_at: string
          dossier_id: string
          id: string
          procedure_step_id: string | null
          short_description: string
          started_at: string | null
          status: string
          step_order: number
          territorial_level: string
          title: string
          updated_at: string
        }
        Insert: {
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          dossier_id: string
          id?: string
          procedure_step_id?: string | null
          short_description: string
          started_at?: string | null
          status?: string
          step_order: number
          territorial_level: string
          title: string
          updated_at?: string
        }
        Update: {
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          dossier_id?: string
          id?: string
          procedure_step_id?: string | null
          short_description?: string
          started_at?: string | null
          status?: string
          step_order?: number
          territorial_level?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossier_steps_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_steps_procedure_step_id_fkey"
            columns: ["procedure_step_id"]
            isOneToOne: false
            referencedRelation: "procedure_steps"
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
          birth_date: string | null
          created_at: string
          created_by: string
          death_date: string | null
          death_status: string
          display_name: string
          email: string | null
          id: string
          identity_status: string
          linked_profile_id: string | null
          merged_at: string | null
          merged_by: string | null
          merged_into_person_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          created_by: string
          death_date?: string | null
          death_status?: string
          display_name: string
          email?: string | null
          id?: string
          identity_status?: string
          linked_profile_id?: string | null
          merged_at?: string | null
          merged_by?: string | null
          merged_into_person_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          created_by?: string
          death_date?: string | null
          death_status?: string
          display_name?: string
          email?: string | null
          id?: string
          identity_status?: string
          linked_profile_id?: string | null
          merged_at?: string | null
          merged_by?: string | null
          merged_into_person_id?: string | null
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
          {
            foreignKeyName: "persons_merged_into_person_id_fkey"
            columns: ["merged_into_person_id"]
            isOneToOne: false
            referencedRelation: "persons"
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
      document_versions: {
        Row: { checksum: string; created_at: string; document_id: string; id: string; mime_type: string; provided_by: string | null; replaced_at: string | null; size_bytes: number; storage_path: string; uploaded_by: string; version_number: number }
        Insert: { checksum: string; created_at?: string; document_id: string; id?: string; mime_type: string; provided_by?: string | null; replaced_at?: string | null; size_bytes: number; storage_path: string; uploaded_by: string; version_number: number }
        Update: { checksum?: string; created_at?: string; document_id?: string; id?: string; mime_type?: string; provided_by?: string | null; replaced_at?: string | null; size_bytes?: number; storage_path?: string; uploaded_by?: string; version_number?: number }
        Relationships: [{ foreignKeyName: "document_versions_document_id_fkey"; columns: ["document_id"]; isOneToOne: false; referencedRelation: "proofs"; referencedColumns: ["id"] }]
      }
      proofs: {
        Row: {
          archived_at: string | null
          bien_id: string | null
          client_operation_id: string | null
          created_at: string
          created_by: string
          current_version_id: string | null
          document_type: string
          dossier_id: string
          id: string
          metadata: Json
          mime_type: string | null
          size_bytes: number | null
          source_type: string
          storage_path: string
          title: string | null
          type: Database["public"]["Enums"]["proof_type"]
          uploaded_by: string
          updated_at: string
          verification_status: string
          verified: boolean
        }
        Insert: {
          archived_at?: string | null
          bien_id?: string | null
          client_operation_id?: string | null
          created_at?: string
          created_by: string
          current_version_id?: string | null
          document_type: string
          dossier_id: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          size_bytes?: number | null
          source_type?: string
          storage_path: string
          title?: string | null
          type: Database["public"]["Enums"]["proof_type"]
          uploaded_by: string
          updated_at?: string
          verification_status: string
          verified?: boolean
        }
        Update: {
          archived_at?: string | null
          bien_id?: string | null
          client_operation_id?: string | null
          created_at?: string
          created_by?: string
          current_version_id?: string | null
          document_type?: string
          dossier_id?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          size_bytes?: number | null
          source_type?: string
          storage_path?: string
          title?: string | null
          type?: Database["public"]["Enums"]["proof_type"]
          uploaded_by?: string
          updated_at?: string
          verification_status?: string
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
      ai_rate_limits:{Row:{request_count:number;user_id:string;window_start:string};Insert:{request_count?:number;user_id:string;window_start:string};Update:{request_count?:number;user_id?:string;window_start?:string};Relationships:[]}
      person_aliases:{Row:{alias_name:string;alias_type:string;created_at:string;created_by:string;id:string;person_id:string;revoked_at:string|null;source_document_id:string|null;source_type:string};Insert:{alias_name:string;alias_type?:string;created_at?:string;created_by:string;id?:string;person_id:string;revoked_at?:string|null;source_document_id?:string|null;source_type?:string};Update:{alias_name?:string;alias_type?:string;created_at?:string;created_by?:string;id?:string;person_id?:string;revoked_at?:string|null;source_document_id?:string|null;source_type?:string};Relationships:[]}
      family_relations:{Row:{created_at:string;created_by:string;current_revision:number;from_person_id:string;id:string;relation_type:string;revoked_at:string|null;status:string;to_person_id:string;updated_at:string};Insert:{created_at?:string;created_by:string;current_revision?:number;from_person_id:string;id?:string;relation_type:string;revoked_at?:string|null;status?:string;to_person_id:string;updated_at?:string};Update:{created_at?:string;created_by?:string;current_revision?:number;from_person_id?:string;id?:string;relation_type?:string;revoked_at?:string|null;status?:string;to_person_id?:string;updated_at?:string};Relationships:[]}
      family_relation_revisions:{Row:{created_at:string;created_by:string;id:string;note:string|null;relation_id:string;relation_type:string;source_document_id:string|null;source_type:string;status:string;supersedes_revision_id:string|null;version_number:number};Insert:{created_at?:string;created_by:string;id?:string;note?:string|null;relation_id:string;relation_type:string;source_document_id?:string|null;source_type:string;status:string;supersedes_revision_id?:string|null;version_number:number};Update:{created_at?:string;created_by?:string;id?:string;note?:string|null;relation_id?:string;relation_type?:string;source_document_id?:string|null;source_type?:string;status?:string;supersedes_revision_id?:string|null;version_number?:number};Relationships:[]}
      role_assignments:{Row:{assigned_by:string|null;created_at:string;id:string;revoked_at:string|null;role:string;scope_id:string|null;scope_type:string;status:string;user_id:string;valid_from:string;valid_until:string|null};Insert:{assigned_by?:string|null;created_at?:string;id?:string;revoked_at?:string|null;role:string;scope_id?:string|null;scope_type:string;status?:string;user_id:string;valid_from?:string;valid_until?:string|null};Update:{assigned_by?:string|null;created_at?:string;id?:string;revoked_at?:string|null;role?:string;scope_id?:string|null;scope_type?:string;status?:string;user_id?:string;valid_from?:string;valid_until?:string|null};Relationships:[]}
      permission_grants:{Row:{created_at:string;granted_by:string|null;id:string;permission:string;reason_code:string|null;revoked_at:string|null;scope_id:string|null;scope_type:string;status:string;user_id:string;valid_from:string;valid_until:string|null};Insert:{created_at?:string;granted_by?:string|null;id?:string;permission:string;reason_code?:string|null;revoked_at?:string|null;scope_id?:string|null;scope_type:string;status?:string;user_id:string;valid_from?:string;valid_until?:string|null};Update:{created_at?:string;granted_by?:string|null;id?:string;permission?:string;reason_code?:string|null;revoked_at?:string|null;scope_id?:string|null;scope_type?:string;status?:string;user_id?:string;valid_from?:string;valid_until?:string|null};Relationships:[]}
      permission_denies:{Row:{created_at:string;denied_by:string|null;id:string;permission:string;reason_code:string;revoked_at:string|null;scope_id:string|null;scope_type:string;status:string;user_id:string;valid_from:string;valid_until:string|null};Insert:{created_at?:string;denied_by?:string|null;id?:string;permission:string;reason_code:string;revoked_at?:string|null;scope_id?:string|null;scope_type:string;status?:string;user_id:string;valid_from?:string;valid_until?:string|null};Update:{created_at?:string;denied_by?:string|null;id?:string;permission?:string;reason_code?:string;revoked_at?:string|null;scope_id?:string|null;scope_type?:string;status?:string;user_id?:string;valid_from?:string;valid_until?:string|null};Relationships:[]}
      representation_mandates:{Row:{confirmed_by_represented_at:string|null;created_at:string;created_by:string;id:string;permissions:string[];representative_person_id:string|null;representative_user_id:string;represented_person_id:string;revoked_at:string|null;revoked_by:string|null;scope_id:string|null;scope_type:string;source_document_id:string|null;source_type:string;status:string;valid_from:string;valid_until:string|null;verified_at:string|null;verified_by:string|null};Insert:{confirmed_by_represented_at?:string|null;created_at?:string;created_by:string;id?:string;permissions:string[];representative_person_id?:string|null;representative_user_id:string;represented_person_id:string;revoked_at?:string|null;revoked_by?:string|null;scope_id?:string|null;scope_type:string;source_document_id?:string|null;source_type:string;status?:string;valid_from?:string;valid_until?:string|null;verified_at?:string|null;verified_by?:string|null};Update:{confirmed_by_represented_at?:string|null;created_at?:string;created_by?:string;id?:string;permissions?:string[];representative_person_id?:string|null;representative_user_id?:string;represented_person_id?:string;revoked_at?:string|null;revoked_by?:string|null;scope_id?:string|null;scope_type?:string;source_document_id?:string|null;source_type?:string;status?:string;valid_from?:string;valid_until?:string|null;verified_at?:string|null;verified_by?:string|null};Relationships:[]}
      command_idempotency_records:{Row:{command_name:string;command_version:number;completed_at:string|null;correlation_id:string;created_at:string;expires_at:string|null;id:string;idempotency_key:string;principal_key:string;request_hash:string;result_payload:Json|null;status:string;target_ref:Json|null};Insert:{command_name:string;command_version?:number;completed_at?:string|null;correlation_id:string;created_at?:string;expires_at?:string|null;id?:string;idempotency_key:string;principal_key:string;request_hash:string;result_payload?:Json|null;status?:string;target_ref?:Json|null};Update:{command_name?:string;command_version?:number;completed_at?:string|null;correlation_id?:string;created_at?:string;expires_at?:string|null;id?:string;idempotency_key?:string;principal_key?:string;request_hash?:string;result_payload?:Json|null;status?:string;target_ref?:Json|null};Relationships:[]}
      event_contracts:{Row:{allowed_consumers:string[];confidentiality:string;contract_id:string;created_at:string;event_category:string;event_name:string;event_version:number;id:string;ordering_policy:string;payload_schema:Json;producer_domain:string;status:string};Insert:{allowed_consumers?:string[];confidentiality?:string;contract_id:string;created_at?:string;event_category:string;event_name:string;event_version:number;id?:string;ordering_policy?:string;payload_schema?:Json;producer_domain:string;status?:string};Update:{allowed_consumers?:string[];confidentiality?:string;contract_id?:string;created_at?:string;event_category?:string;event_name?:string;event_version?:number;id?:string;ordering_policy?:string;payload_schema?:Json;producer_domain?:string;status?:string};Relationships:[]}
      integration_outbox:{Row:{acting_role:string|null;actor_person_id:string|null;actor_user_id:string|null;aggregate_sequence:number|null;aggregate_version:number|null;attempts:number;available_at:string;causation_id:string|null;confidentiality:string;correlation_id:string;envelope:Json;event_category:string;event_id:string;event_name:string;event_origin:string;event_version:number;id:string;last_error_at:string|null;last_error_code:string|null;mandate_id:string|null;occurred_at:string;published_at:string|null;recorded_at:string;represented_person_id:string|null;source_domain:string;source_entity_id:string|null;source_entity_type:string;status:string};Insert:{acting_role?:string|null;actor_person_id?:string|null;actor_user_id?:string|null;aggregate_sequence?:number|null;aggregate_version?:number|null;attempts?:number;available_at?:string;causation_id?:string|null;confidentiality?:string;correlation_id:string;envelope:Json;event_category:string;event_id:string;event_name:string;event_origin?:string;event_version:number;id?:string;last_error_at?:string|null;last_error_code?:string|null;mandate_id?:string|null;occurred_at:string;published_at?:string|null;recorded_at?:string;represented_person_id?:string|null;source_domain:string;source_entity_id?:string|null;source_entity_type:string;status?:string};Update:{acting_role?:string|null;actor_person_id?:string|null;actor_user_id?:string|null;aggregate_sequence?:number|null;aggregate_version?:number|null;attempts?:number;available_at?:string;causation_id?:string|null;confidentiality?:string;correlation_id?:string;envelope?:Json;event_category?:string;event_id?:string;event_name?:string;event_origin?:string;event_version?:number;id?:string;last_error_at?:string|null;last_error_code?:string|null;mandate_id?:string|null;occurred_at?:string;published_at?:string|null;recorded_at?:string;represented_person_id?:string|null;source_domain?:string;source_entity_id?:string|null;source_entity_type?:string;status?:string};Relationships:[]}
      integration_inbox:{Row:{attempts:number;consumer_name:string;envelope:Json;event_id:string;event_name:string;event_version:number;last_error_at:string|null;last_error_code:string|null;processed_at:string|null;received_at:string;status:string};Insert:{attempts?:number;consumer_name:string;envelope:Json;event_id:string;event_name:string;event_version:number;last_error_at?:string|null;last_error_code?:string|null;processed_at?:string|null;received_at?:string;status?:string};Update:{attempts?:number;consumer_name?:string;envelope?:Json;event_id?:string;event_name?:string;event_version?:number;last_error_at?:string|null;last_error_code?:string|null;processed_at?:string|null;received_at?:string;status?:string};Relationships:[]}
      audit_events:{Row:{acting_role:string|null;action:string;actor_person_id:string|null;actor_user_id:string|null;causation_id:string|null;command_id:string|null;correlation_id:string;created_at:string;event_type:string;id:string;mandate_id:string|null;occurred_at:string;permission:string|null;reason_code:string|null;represented_person_id:string|null;result:string;safe_context:Json;scope_id:string|null;scope_type:string|null;target_domain:string;target_id:string|null;target_type:string|null};Insert:{acting_role?:string|null;action:string;actor_person_id?:string|null;actor_user_id?:string|null;causation_id?:string|null;command_id?:string|null;correlation_id:string;created_at?:string;event_type?:string;id?:string;mandate_id?:string|null;occurred_at?:string;permission?:string|null;reason_code?:string|null;represented_person_id?:string|null;result:string;safe_context?:Json;scope_id?:string|null;scope_type?:string|null;target_domain:string;target_id?:string|null;target_type?:string|null};Update:{acting_role?:string|null;action?:string;actor_person_id?:string|null;actor_user_id?:string|null;causation_id?:string|null;command_id?:string|null;correlation_id?:string;created_at?:string;event_type?:string;id?:string;mandate_id?:string|null;occurred_at?:string;permission?:string|null;reason_code?:string|null;represented_person_id?:string|null;result?:string;safe_context?:Json;scope_id?:string|null;scope_type?:string|null;target_domain?:string;target_id?:string|null;target_type?:string|null};Relationships:[]}
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
      current_user_person_id:{Args:Record<PropertyKey,never>;Returns:string|null}
      resolve_person_id:{Args:{p_person_id:string};Returns:string|null}
      update_person_record:{Args:{p_birth_date:string|null;p_correlation_id:string;p_death_date:string|null;p_death_status:string;p_display_name:string;p_email:string|null;p_identity_status:string;p_person_id:string;p_phone:string|null};Returns:undefined}
      merge_person_records:{Args:{p_correlation_id:string;p_source_person_id:string;p_target_person_id:string};Returns:string}
      create_family_relation:{Args:{p_correlation_id:string;p_from_person_id:string;p_note:string|null;p_relation_type:string;p_source_document_id:string|null;p_source_type:string;p_to_person_id:string};Returns:string}
      revise_family_relation:{Args:{p_correlation_id:string;p_note:string|null;p_relation_id:string;p_relation_type:string;p_source_document_id:string|null;p_source_type:string;p_status:string};Returns:number}
      assign_application_role:{Args:{p_correlation_id:string;p_role:string;p_scope_id:string|null;p_scope_type:string;p_user_id:string;p_valid_until:string|null};Returns:string}
      revoke_application_role:{Args:{p_correlation_id:string;p_role_assignment_id:string};Returns:undefined}
      grant_explicit_permission:{Args:{p_correlation_id:string;p_permission:string;p_reason_code:string|null;p_scope_id:string|null;p_scope_type:string;p_user_id:string;p_valid_until:string|null};Returns:string}
      deny_explicit_permission:{Args:{p_correlation_id:string;p_permission:string;p_reason_code:string;p_scope_id:string|null;p_scope_type:string;p_user_id:string;p_valid_until:string|null};Returns:string}
      revoke_explicit_permission:{Args:{p_correlation_id:string;p_record_id:string;p_record_type:string};Returns:undefined}
      create_representation_mandate:{Args:{p_correlation_id:string;p_permissions:string[];p_representative_user_id:string;p_represented_person_id:string;p_scope_id:string|null;p_scope_type:string;p_source_document_id:string|null;p_source_type:string;p_valid_until:string|null};Returns:string}
      confirm_representation_mandate:{Args:{p_correlation_id:string;p_mandate_id:string};Returns:undefined}
      verify_representation_mandate:{Args:{p_correlation_id:string;p_formalized:boolean;p_mandate_id:string};Returns:undefined}
      revoke_representation_mandate:{Args:{p_correlation_id:string;p_mandate_id:string};Returns:undefined}
      resolve_action_context:{Args:{p_acting_role:string|null;p_correlation_id:string;p_mandate_id:string|null;p_represented_person_id:string|null;p_scope_id:string|null;p_scope_type:string|null};Returns:Json}
      consume_ai_quota:{Args:{max_requests?:number};Returns:boolean}
      authorization_scope_matches:{Args:{p_rule_scope_id:string|null;p_rule_scope_type:string;p_target_scope_id:string|null;p_target_scope_type:string};Returns:boolean}
      role_allows_permission:{Args:{p_permission:string;p_role:string};Returns:boolean}
      has_effective_permission_for:{Args:{p_permission:string;p_scope_id:string|null;p_scope_type:string;p_user_id:string};Returns:boolean}
      has_effective_permission:{Args:{p_permission:string;p_scope_id?:string|null;p_scope_type:string};Returns:boolean}
      record_audit_event:{Args:{p_action:string;p_actor_person_id?:string|null;p_acting_role?:string|null;p_causation_id?:string|null;p_command_id?:string|null;p_correlation_id:string;p_event_type:string;p_mandate_id?:string|null;p_permission?:string|null;p_reason_code?:string|null;p_represented_person_id?:string|null;p_result:string;p_safe_context?:Json;p_scope_id?:string|null;p_scope_type?:string|null;p_target_domain:string;p_target_id?:string|null;p_target_type?:string|null};Returns:string}
      enqueue_domain_event:{Args:{p_actor_person_id:string|null;p_acting_role:string|null;p_aggregate_sequence:number|null;p_aggregate_version:number|null;p_causation_id:string|null;p_confidentiality:string;p_correlation_id:string;p_event_category:string;p_event_id:string;p_event_name:string;p_event_origin:string;p_event_version:number;p_mandate_id:string|null;p_occurred_at:string;p_payload:Json;p_represented_person_id:string|null;p_source_domain:string;p_source_entity_id:string|null;p_source_entity_type:string};Returns:string}
      claim_outbox_batch:{Args:{p_limit?:number};Returns:Database["public"]["Tables"]["integration_outbox"]["Row"][]}
      complete_outbox_event:{Args:{p_error_code?:string|null;p_event_id:string;p_retry_after_seconds?:number;p_success:boolean};Returns:undefined}
      register_inbox_event:{Args:{p_consumer_name:string;p_envelope:Json;p_event_id:string;p_event_name:string;p_event_version:number};Returns:boolean}
      complete_inbox_event:{Args:{p_consumer_name:string;p_error_code?:string|null;p_event_id:string;p_retryable?:boolean;p_success:boolean};Returns:undefined}
      claim_command_idempotency:{Args:{p_command_name:string;p_command_version:number;p_correlation_id:string;p_idempotency_key:string;p_request_hash:string};Returns:{is_new:boolean;record_id:string;result_payload:Json|null;result_status:string}[]}
      complete_command_idempotency:{Args:{p_record_id:string;p_result_payload?:Json|null;p_status:string;p_target_ref?:Json|null};Returns:undefined}
      create_signalement:{Args:{p_bien_id:string|null;p_dossier_id:string;p_step_id:string|null;p_intervention_id:string|null;p_actor_id:string|null;p_type:string;p_description:string;p_expected:string|null;p_occurred_at:string|null;p_on_behalf_of:string|null;p_role:string};Returns:string}
      attach_signalement_document:{Args:{p_signalement_id:string;p_document_id:string};Returns:undefined}
      add_signalement_witness:{Args:{p_signalement_id:string;p_participant_id:string|null;p_actor_id:string|null};Returns:undefined}
      transition_signalement:{Args:{p_signalement_id:string;p_status:string;p_details?:string|null};Returns:undefined}
      create_signalement_conversation:{Args:{p_signalement_id:string;p_member_user_ids?:string[]};Returns:string}
      can_access_signalement:{Args:{sid:string;uid:string};Returns:boolean}
      create_contextual_conversation:{Args:{p_type:string;p_dossier_id:string;p_step_id?:string|null;p_access_request_id?:string|null;p_intervention_id?:string|null;p_member_user_ids?:string[]};Returns:string}
      send_contextual_message:{Args:{p_conversation_id:string;p_message_type:string;p_client_message_id:string;p_text?:string|null;p_audio_path?:string|null;p_document_id?:string|null;p_reply_to?:string|null;p_actor_id?:string|null};Returns:string}
      remove_conversation_member:{Args:{p_conversation_id:string;p_member_user_id:string};Returns:undefined}
      close_conversation:{Args:{p_conversation_id:string};Returns:undefined}
      can_access_conversation:{Args:{cid:string;uid:string};Returns:boolean}
      can_create_intervention:{Args:{p_dossier_id:string;p_step_id:string|null;p_actor_id:string|null;p_participant_id:string|null;p_role:string;p_action:string};Returns:boolean}
      create_dossier_intervention:{Args:{p_dossier_id:string;p_step_id:string|null;p_actor_id:string|null;p_participant_id:string|null;p_on_behalf_of:string|null;p_role:string;p_action_type:string;p_territorial_level:string;p_comment?:string|null};Returns:string}
      correct_dossier_intervention:{Args:{p_previous_id:string;p_action_type:string;p_comment:string};Returns:string}
      verify_dossier_intervention:{Args:{p_intervention_id:string;p_status:string};Returns:undefined}
      can_complete_dossier_step:{Args:{p_step_id:string};Returns:boolean}
      complete_dossier_step_from_interventions:{Args:{p_step_id:string};Returns:undefined}
      request_dossier_access:{Args:{p_actor_id:string|null;p_dossier_id:string;p_expires_at?:string|null;p_message:string;p_purpose:string;p_scopes:string[]};Returns:string}
      resolve_access_request:{Args:{p_decision:string;p_document_ids?:string[];p_expires_at?:string|null;p_request_id:string;p_scopes?:string[]};Returns:string|null}
      cancel_access_request:{Args:{p_request_id:string};Returns:undefined}
      revoke_access_grant:{Args:{p_grant_id:string};Returns:undefined}
      has_active_grant:{Args:{_dossier_id:string;_user_id:string};Returns:boolean}
      has_scope:{Args:{_dossier_id:string;_scope:string;_user_id:string};Returns:boolean}
      can_access_document:{Args:{_document_id:string;_user_id:string};Returns:boolean}
      get_granted_dossier_summary:{Args:{p_dossier_id:string};Returns:{id:string;location_label:string;status:Database["public"]["Enums"]["dossier_status"];title:string;type:Database["public"]["Enums"]["dossier_type"]}[]}
      archive_document: { Args: { p_document_id: string }; Returns: undefined }
      rename_document: { Args: { p_document_id: string; p_title: string }; Returns: undefined }
      register_document_version: {
        Args: { p_bien_id?: string | null; p_checksum: string; p_client_operation_id?: string | null; p_document_id: string; p_document_type: string; p_dossier_id: string; p_mime_type: string; p_provided_by?: string | null; p_size_bytes: number; p_source_type: string; p_storage_path: string; p_title: string; p_version_id: string }
        Returns: string
      }
      transition_document_status: { Args: { p_document_id: string; p_source_type?: string | null; p_status: string }; Returns: undefined }
      can_verify_actor: { Args: { _user_id: string }; Returns: boolean }
      verify_actor: { Args: { p_actor_id: string; p_status: string }; Returns: undefined }
      verify_actor_competence: { Args: { p_competence_id: string; p_status: string }; Returns: undefined }
      verify_actor_credential: { Args: { p_credential_id: string; p_status: string }; Returns: undefined }
      initialize_dossier_journey: {
        Args: { p_dossier_id: string; p_procedure_id?: string | null }
        Returns: string
      }
      procedure_step_applies: {
        Args: { _bien: Database["public"]["Tables"]["biens"]["Row"]; _rules: Json | null }
        Returns: boolean
      }
      transition_dossier_step: {
        Args: { p_blocked_reason?: string | null; p_step_id: string; p_target_status: string }
        Returns: undefined
      }
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
