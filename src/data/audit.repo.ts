import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];

export async function getAuditEventsForDossier(dossierId: string, limit = 50) {
  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("dossier_id", dossierId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw error;
  return data ?? [];
}

export async function getAuditEventsForEntity(entityType: string, entityId: string, limit = 30) {
  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw error;
  return data ?? [];
}
