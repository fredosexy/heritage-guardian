import { supabase } from "@/integrations/supabase/client";
import type { DossierStep, ProcedureDefinition, ProcedureStep } from "@/core/types/domain";

export interface ProcedureDefinitionWithSteps extends ProcedureDefinition { procedure_steps: ProcedureStep[]; }

export async function getPublishedProcedures(): Promise<ProcedureDefinitionWithSteps[]> {
  const { data, error } = await supabase.from("procedure_definitions").select("*, procedure_steps(*)").eq("status", "publiee").order("dossier_type").order("version", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => ({ ...item, procedure_steps: [...item.procedure_steps].sort((a, b) => a.step_order - b.step_order) })) as ProcedureDefinitionWithSteps[];
}

export async function getProcedureDefinition(id: string): Promise<ProcedureDefinitionWithSteps | null> {
  const { data, error } = await supabase.from("procedure_definitions").select("*, procedure_steps(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, procedure_steps: [...data.procedure_steps].sort((a, b) => a.step_order - b.step_order) } as ProcedureDefinitionWithSteps) : null;
}

export async function initializeDossierJourney(dossierId: string, procedureId?: string): Promise<string> {
  const { data, error } = await supabase.rpc("initialize_dossier_journey", { p_dossier_id: dossierId, p_procedure_id: procedureId ?? null });
  if (error) throw error;
  return data;
}

export async function getDossierSteps(dossierId: string): Promise<DossierStep[]> {
  const { data, error } = await supabase.from("dossier_steps").select("*").eq("dossier_id", dossierId).order("step_order");
  if (error) throw error;
  return data ?? [];
}

export async function transitionStep(stepId: string, status: string, blockedReason?: string): Promise<void> {
  const { error } = await supabase.rpc("transition_dossier_step", { p_step_id: stepId, p_target_status: status, p_blocked_reason: blockedReason ?? null });
  if (error) throw error;
}

export const startStep = (stepId: string) => transitionStep(stepId, "en_cours");
export const completeStep = (stepId: string) => transitionStep(stepId, "terminee");
export const blockStep = (stepId: string, reason: string) => transitionStep(stepId, "bloquee", reason);
