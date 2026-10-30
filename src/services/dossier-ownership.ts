/** UI guards complement, never replace, the existing owner-only cloud policies. */
export type DossierOwnerTarget = { user_id?: string | null } | null | undefined;

export function normalizeUserId(userId?: string | null): string {
  return String(userId ?? "").trim();
}

export function canEditDossier(dossier: DossierOwnerTarget, userId?: string | null): boolean {
  const dossierOwner = normalizeUserId(dossier?.user_id);
  const sessionUserId = normalizeUserId(userId);
  if (!dossierOwner || !sessionUserId) return false;
  return dossierOwner === sessionUserId;
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
  const sessionUserId = normalizeUserId(user?.id);
  if (!sessionUserId) throw new Error("Session required");
  assertDossierOwner(dossier, sessionUserId);
  return sessionUserId;
}
