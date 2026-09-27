import { supabase } from "@/integrations/supabase/client";
import type { AccessScope } from "@/services/access-control";

export async function requestAccess(input:{dossierId:string;actorId?:string|null;purpose:string;message?:string;scopes:AccessScope[];expiresAt?:string|null}) {
 const {data,error}=await supabase.rpc("request_dossier_access",{p_dossier_id:input.dossierId,p_actor_id:input.actorId??null,p_purpose:input.purpose,p_message:input.message??"",p_scopes:input.scopes,p_expires_at:input.expiresAt??null});
 if(error) throw error; return data;
}
export async function getAccessRequestsForDossier(dossierId:string){
 const {data,error}=await supabase.from("access_requests").select("*, access_request_scopes(*)").eq("dossier_id",dossierId).order("created_at",{ascending:false});
 if(error) throw error; return data??[];
}
export async function resolveAccessRequest(requestId:string,decision:"acceptee"|"refusee",scopes:AccessScope[]=[],documentIds:string[]=[],expiresAt?:string|null){
 const {data,error}=await supabase.rpc("resolve_access_request",{p_request_id:requestId,p_decision:decision,p_scopes:scopes,p_document_ids:documentIds,p_expires_at:expiresAt??null});
 if(error) throw error; return data;
}
export async function getActiveGrants(dossierId:string){
 const {data,error}=await supabase.from("access_grants").select("*, access_grant_scopes(*), access_grant_documents(*)").eq("dossier_id",dossierId).is("revoked_at",null).order("granted_at",{ascending:false});
 if(error) throw error; return data??[];
}
export async function revokeAccess(grantId:string){const {error}=await supabase.rpc("revoke_access_grant",{p_grant_id:grantId});if(error)throw error;}
