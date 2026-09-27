import { supabase } from "@/integrations/supabase/client";
import { ActionContextSchema, type ActionContext } from "@/core/application";
import {
  type ApplicationRole,
  type AuthorizationScope,
  type CommonPermission,
} from "@/core/authorization";
import { createCorrelationId } from "@/core/observability";
import type { RepresentationSource } from "@/core/types/domain";
import type { Tables } from "@/integrations/supabase/types";

export type RoleAssignmentRow = Tables<"role_assignments">;
export type PermissionGrantRow = Tables<"permission_grants">;
export type PermissionDenyRow = Tables<"permission_denies">;
export type RepresentationMandateRow = Tables<"representation_mandates">;

export type AssignableRole = Extract<
  ApplicationRole,
  | "CASE_ADMIN"
  | "MANAGER"
  | "CONTRIBUTOR"
  | "PARTICIPANT"
  | "READER"
  | "COMPANION"
  | "WITNESS"
  | "PROFESSIONAL"
  | "MEDIATOR"
  | "ADMINISTRATIVE_ACTOR"
>;

/**
 * Server-authoritative permission check.
 * This result is suitable for UI gating only; sensitive commands must check again server-side.
 */
export async function hasEffectivePermission(
  permission: CommonPermission | string,
  scopeType: AuthorizationScope,
  scopeId?: string | null,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_effective_permission", {
    p_permission: permission,
    p_scope_type: scopeType,
    p_scope_id: scopeId ?? null,
  });
  if (error) throw error;
  return data === true;
}

export async function listOwnRoleAssignments(): Promise<RoleAssignmentRow[]> {
  const { data, error } = await supabase
    .from("role_assignments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listOwnPermissionGrants(): Promise<PermissionGrantRow[]> {
  const { data, error } = await supabase
    .from("permission_grants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listOwnPermissionDenies(): Promise<PermissionDenyRow[]> {
  const { data, error } = await supabase
    .from("permission_denies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listVisibleMandates(): Promise<RepresentationMandateRow[]> {
  const { data, error } = await supabase
    .from("representation_mandates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function assignRole(params: {
  userId: string;
  role: AssignableRole;
  scopeType: AuthorizationScope;
  scopeId?: string | null;
  validUntil?: string | null;
  correlationId?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("assign_application_role", {
    p_user_id: params.userId,
    p_role: params.role,
    p_scope_type: params.scopeType,
    p_scope_id: params.scopeId ?? null,
    p_valid_until: params.validUntil ?? null,
    p_correlation_id: params.correlationId ?? createCorrelationId(),
  });
  if (error) throw error;
  return data;
}

export async function revokeRole(
  roleAssignmentId: string,
  correlationId = createCorrelationId(),
): Promise<void> {
  const { error } = await supabase.rpc("revoke_application_role", {
    p_role_assignment_id: roleAssignmentId,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
}

export async function grantPermission(params: {
  userId: string;
  permission: CommonPermission | string;
  scopeType: AuthorizationScope;
  scopeId?: string | null;
  validUntil?: string | null;
  reasonCode?: string | null;
  correlationId?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("grant_explicit_permission", {
    p_user_id: params.userId,
    p_permission: params.permission,
    p_scope_type: params.scopeType,
    p_scope_id: params.scopeId ?? null,
    p_valid_until: params.validUntil ?? null,
    p_reason_code: params.reasonCode ?? null,
    p_correlation_id: params.correlationId ?? createCorrelationId(),
  });
  if (error) throw error;
  return data;
}

export async function denyPermission(params: {
  userId: string;
  permission: CommonPermission | string;
  scopeType: AuthorizationScope;
  scopeId?: string | null;
  validUntil?: string | null;
  reasonCode: string;
  correlationId?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("deny_explicit_permission", {
    p_user_id: params.userId,
    p_permission: params.permission,
    p_scope_type: params.scopeType,
    p_scope_id: params.scopeId ?? null,
    p_valid_until: params.validUntil ?? null,
    p_reason_code: params.reasonCode,
    p_correlation_id: params.correlationId ?? createCorrelationId(),
  });
  if (error) throw error;
  return data;
}

export async function revokePermission(
  recordType: "GRANT" | "DENY",
  recordId: string,
  correlationId = createCorrelationId(),
): Promise<void> {
  const { error } = await supabase.rpc("revoke_explicit_permission", {
    p_record_type: recordType,
    p_record_id: recordId,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
}

export async function createMandate(params: {
  representedPersonId: string;
  representativeUserId: string;
  scopeType: AuthorizationScope;
  scopeId?: string | null;
  permissions: Array<CommonPermission | string>;
  sourceType: RepresentationSource;
  sourceDocumentId?: string | null;
  validUntil?: string | null;
  correlationId?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_representation_mandate", {
    p_represented_person_id: params.representedPersonId,
    p_representative_user_id: params.representativeUserId,
    p_scope_type: params.scopeType,
    p_scope_id: params.scopeId ?? null,
    p_permissions: params.permissions,
    p_source_type: params.sourceType,
    p_source_document_id: params.sourceDocumentId ?? null,
    p_valid_until: params.validUntil ?? null,
    p_correlation_id: params.correlationId ?? createCorrelationId(),
  });
  if (error) throw error;
  return data;
}

export async function confirmMandate(
  mandateId: string,
  correlationId = createCorrelationId(),
): Promise<void> {
  const { error } = await supabase.rpc("confirm_representation_mandate", {
    p_mandate_id: mandateId,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
}

export async function verifyMandate(
  mandateId: string,
  formalized: boolean,
  correlationId = createCorrelationId(),
): Promise<void> {
  const { error } = await supabase.rpc("verify_representation_mandate", {
    p_mandate_id: mandateId,
    p_formalized: formalized,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
}

export async function revokeMandate(
  mandateId: string,
  correlationId = createCorrelationId(),
): Promise<void> {
  const { error } = await supabase.rpc("revoke_representation_mandate", {
    p_mandate_id: mandateId,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
}

export async function resolveActionContext(params: {
  actingRole?: string | null;
  representedPersonId?: string | null;
  mandateId?: string | null;
  scopeType?: AuthorizationScope | null;
  scopeId?: string | null;
  correlationId?: string;
}): Promise<ActionContext> {
  const { data, error } = await supabase.rpc("resolve_action_context", {
    p_acting_role: params.actingRole ?? null,
    p_represented_person_id: params.representedPersonId ?? null,
    p_mandate_id: params.mandateId ?? null,
    p_scope_type: params.scopeType ?? null,
    p_scope_id: params.scopeId ?? null,
    p_correlation_id: params.correlationId ?? createCorrelationId(),
  });
  if (error) throw error;
  return ActionContextSchema.parse(data);
}
