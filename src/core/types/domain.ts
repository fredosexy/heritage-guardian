import type { Tables, TablesInsert, Enums } from "@/integrations/supabase/types";

export type Dossier = Tables<"dossiers">;
export type DossierInsert = TablesInsert<"dossiers">;
export type Proof = Tables<"proofs">;
export type Participant = Tables<"participants">;
export type Alert = Tables<"alerts">;
export type Profile = Tables<"profiles">;

export type DossierType = Enums<"dossier_type">;
export type DossierStatus = Enums<"dossier_status">;
export type AlertType = Enums<"alert_type">;
export type AlertSeverity = Enums<"alert_severity">;
export type ProofType = Enums<"proof_type">;
