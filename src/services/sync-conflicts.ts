/** Champs d'un dossier modifiables hors ligne. */
export const EDITABLE_FIELDS = ["title", "description", "location_name"] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];
export type DossierChanges = Partial<Record<EditableField, string | null>>;

/**
 * Il y a conflit si le dossier a changé sur le serveur depuis que
 * l'utilisateur a commencé sa modification ET qu'un même champ diffère.
 */
export function detectConflictFields(
  baseUpdatedAt: string,
  remote: { updated_at: string } & Partial<Record<EditableField, string | null>>,
  mine: DossierChanges,
): EditableField[] {
  if (remote.updated_at === baseUpdatedAt) return [];
  return (Object.keys(mine) as EditableField[]).filter(
    (f) => (remote[f] ?? null) !== (mine[f] ?? null)
  );
}

/** Fusionne selon le choix de l'utilisateur, champ par champ. */
export function mergeResolution(
  mine: DossierChanges,
  theirs: DossierChanges,
  choice: Partial<Record<EditableField, "mine" | "theirs">>,
): DossierChanges {
  const out: DossierChanges = {};
  for (const f of Object.keys(mine) as EditableField[]) {
    out[f] = choice[f] === "theirs" ? theirs[f] ?? null : mine[f] ?? null;
  }
  return out;
}
