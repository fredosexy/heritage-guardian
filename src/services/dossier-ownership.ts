/** UI guards complement, never replace, the existing owner-only cloud policies. */
export type DossierOwnerTarget = { user_id?: string | null } | null | undefined;

export function canEditDossier(dossier: DossierOwnerTarget, userId?: string | null): boolean {
  if (!dossier || !userId) return false;
  return String(dossier.user_id ?? "") === String(userId);
}

export function assertDossierOwner(dossier: DossierOwnerTarget, userId?: string | null): void {
  if (!canEditDossier(dossier, userId)) {
    throw new Error("Only the dossier owner can modify this dossier");
  }
}

export function requireOwnerSession(
  user: { id?: string | null } | null | undefined,
  dossier: DossierOwnerTarget,
): string {
  if (!user?.id) throw new Error("Session required");
  assertDossierOwner(dossier, user.id);
  return user.id;
}
