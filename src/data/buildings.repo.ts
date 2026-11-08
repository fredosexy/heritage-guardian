import { supabase } from "@/integrations/supabase/client";

export type BuildingKind = "immeuble" | "maison" | "commerce" | "bureau" | "autre";
export type SurfaceUnit = "m2" | "are" | "hectare";

export interface BuildingPropertyInput {
  property_kind: BuildingKind;
  locality?: string | null;
  address_description?: string | null;
  declared_surface?: number | null;
  surface_unit?: SurfaceUnit;
}

export function readBuildingPropertyInput(metadata: Record<string, unknown> | undefined): BuildingPropertyInput | null {
  const raw = metadata?.building;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const kinds: BuildingKind[] = ["immeuble", "maison", "commerce", "bureau", "autre"];
  const units: SurfaceUnit[] = ["m2", "are", "hectare"];
  if (typeof value.property_kind !== "string" || !kinds.includes(value.property_kind as BuildingKind)) return null;
  const surface = typeof value.declared_surface === "number" && Number.isFinite(value.declared_surface) && value.declared_surface >= 0
    ? value.declared_surface
    : null;
  return {
    property_kind: value.property_kind as BuildingKind,
    locality: typeof value.locality === "string" ? value.locality.trim() || null : null,
    address_description: typeof value.address_description === "string" ? value.address_description.trim() || null : null,
    declared_surface: surface,
    surface_unit: typeof value.surface_unit === "string" && units.includes(value.surface_unit as SurfaceUnit)
      ? value.surface_unit as SurfaceUnit
      : "m2",
  };
}

export async function createBuildingProperty(dossierId: string, input: BuildingPropertyInput): Promise<void> {
  const { error } = await supabase.from("building_properties").insert({
    dossier_id: dossierId,
    property_kind: input.property_kind,
    locality: input.locality ?? null,
    address_description: input.address_description ?? null,
    declared_surface: input.declared_surface ?? null,
    surface_unit: input.surface_unit ?? "m2",
  });
  if (error) throw error;
}
