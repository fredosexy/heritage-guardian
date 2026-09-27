import { supabase } from "@/integrations/supabase/client";
import type { AuthorizationScope, CommonPermission } from "@/core/authorization";
import type { Tables } from "@/integrations/supabase/types";

export type RoleAssignmentRow = Tables<"role_assignments">;
export type PermissionGrantRow = Tables<"permission_grants">;
export type PermissionDenyRow = Tables<"permission_denies">;
export type RepresentationMandateRow = Tables<"representation_mandates">;

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
