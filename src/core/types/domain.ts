import type { Tables, TablesInsert, Enums } from "@/integrations/supabase/types";

export type Dossier = Tables<"dossiers">;
export type DossierInsert = TablesInsert<"dossiers">;
export type Proof = Tables<"proofs">;
export type DossierParticipant = Tables<"dossier_participants">;
export type Participant = DossierParticipant;
export type Alert = Tables<"alerts">;
export type Profile = Tables<"profiles">;
export type UsagePreferences = Tables<"usage_preferences">;
export type Bien = Tables<"biens">;
export type Person = Tables<"persons">;
export type BienRightHolder = Tables<"bien_right_holders">;

export type UsageContext = "rural" | "urbain";
export type AssistanceLevel = "autonome" | "assiste";
export type InterfaceLevel = "essentiel" | "standard" | "complet";
export type AudioPreference = "prefere" | "optionnel";
export type AccompanimentPreference = "seul" | "accompagne";

export type DossierType = Enums<"dossier_type">;
export type DossierStatus = Enums<"dossier_status">;
export type AlertType = Enums<"alert_type">;
export type AlertSeverity = Enums<"alert_severity">;
export type ProofType = Enums<"proof_type">;
