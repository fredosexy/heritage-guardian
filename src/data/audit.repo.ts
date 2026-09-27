import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
export type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];
export async function getAuditEventsForDossier(dossierId:string,limit=50){const{data,error}=await supabase.from("audit_events").select("*").eq("scope_type","CASE").eq("scope_id",dossierId).order("occurred_at",{ascending:false}).order("id",{ascending:false}).limit(Math.min(Math.max(limit,1),100));if(error)throw error;return data??[];}
export async function getAuditEventsForEntity(targetType:string,targetId:string,limit=30){const{data,error}=await supabase.from("audit_events").select("*").eq("target_type",targetType).eq("target_id",targetId).order("occurred_at",{ascending:false}).limit(Math.min(Math.max(limit,1),100));if(error)throw error;return data??[];}
