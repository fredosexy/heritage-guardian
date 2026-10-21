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
export type ProcedureDefinition = Tables<"procedure_definitions">;
export type ProcedureStep = Tables<"procedure_steps">;
export type DossierStep = Tables<"dossier_steps">;
export type TerritorialLevel = "local" | "rural" | "arrondissement" | "departement" | "region" | "national" | "autre";
export type JourneyStepStatus = "a_faire" | "en_cours" | "terminee" | "bloquee" | "a_verifier";
