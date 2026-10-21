import { supabase } from "@/integrations/supabase/client";
import type { DossierStep, ProcedureDefinition, ProcedureStep } from "@/core/types/domain";

export interface DossierJourneyStep extends DossierStep { procedure_step: ProcedureStep | null; }

export interface ProcedureDefinitionWithSteps extends ProcedureDefinition {
  procedure_steps: ProcedureStep[];
}

export async function getPublishedProcedures(): Promise<ProcedureDefinitionWithSteps[]> {
  const { data, error } = await supabase
    .from("procedure_definitions")
    .select("*, procedure_steps(*)")
    .eq("status", "publiee")
    .order("dossier_type")
    .order("version", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => ({
    ...item,
    procedure_steps: [...item.procedure_steps].sort((a, b) => a.step_order - b.step_order),
  })) as ProcedureDefinitionWithSteps[];
}

export async function initializeDossierJourney(dossierId: string, procedureId?: string): Promise<string> {
  const { data, error } = await supabase.rpc("initialize_dossier_journey", {
    p_dossier_id: dossierId,
    p_procedure_id: procedureId ?? null,
  });
  if (error) throw error;
  return data;
}

export async function getDossierSteps(dossierId: string): Promise<DossierJourneyStep[]> {
  const { data, error } = await supabase
    .from("dossier_steps")
    .select("*, procedure_step:procedure_steps(*)")
    .eq("dossier_id", dossierId)
    .order("step_order");
  if (error) throw error;
  return (data ?? []) as DossierJourneyStep[];
}

export async function getDossierStepsByDossierIds(dossierIds: string[]): Promise<Record<string, DossierStep[]>> {
  if (dossierIds.length === 0) return {};

  const { data, error } = await supabase
    .from("dossier_steps")
    .select("*")
    .in("dossier_id", dossierIds)
    .order("dossier_id")
    .order("step_order");
  if (error) throw error;

  return (data ?? []).reduce<Record<string, DossierStep[]>>((acc, step) => {
    (acc[step.dossier_id] ??= []).push(step);
    return acc;
  }, {});
}

export async function transitionStep(stepId: string, status: string, blockedReason?: string): Promise<void> {
  const { error } = await supabase.rpc("transition_dossier_step", {
    p_step_id: stepId,
    p_target_status: status,
    p_blocked_reason: blockedReason ?? null,
  });
  if (error) throw error;
}

export const startStep = (stepId: string) => transitionStep(stepId, "en_cours");
export const completeStep = (stepId: string) => transitionStep(stepId, "terminee");
export const blockStep = (stepId: string, reason: string) => transitionStep(stepId, "bloquee", reason);
