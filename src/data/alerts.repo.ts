import { supabase } from "@/integrations/supabase/client";
import type { Alert, AlertSeverity, AlertType } from "@/core/types/domain";

export async function listAlerts(userId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listUnreadAlerts(userId: string, limit = 5): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .eq("read", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function markAlertRead(id: string): Promise<void> {
  const { error } = await supabase.from("alerts").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function createAlert(input: {
  user_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  action_label?: string | null;
  action_route?: string | null;
  related_dossier_id?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("alerts").insert(input);
  if (error) throw error;
}

export interface AlertUpsertInput {
  user_id: string;
  dedupe_key: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  action_label?: string | null;
  action_route?: string | null;
  related_dossier_id?: string | null;
}

/** Insère les alertes manquantes (ignore celles déjà présentes via dedupe_key). */
export async function upsertAlerts(rows: AlertUpsertInput[]): Promise<Alert[]> {
  if (rows.length === 0) return [];
  const { data, error } = await supabase
    .from("alerts")
    .upsert(rows, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true })
    .select();
  if (error) throw error;
  return data ?? [];
}

export async function markEmailSent(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("alerts")
    .update({ email_sent_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw error;
}
