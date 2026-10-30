/** UI guards complement, never replace, the existing owner-only cloud policies. */
export type DossierOwnerTarget = { user_id?: string | null } | null | undefined;

export function normalizeUserId(userId?: string | null): string {
  return String(userId ?? "").trim();
}

export function requireUserId(userId?: string | null, context = "user"): string {
  const normalized = normalizeUserId(userId);
  if (!normalized) {
    throw new Error(`${context} required`);
  }
  return normalized;
}

export function requireDossierId(dossierId?: string | null): string {
  const normalized = String(dossierId ?? "").trim();
  if (!normalized) {
    throw new Error("Dossier id required");
  }
  return normalized;
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
  const sessionUserId = requireUserId(user?.id, "Session");
  assertDossierOwner(dossier, sessionUserId);
  return sessionUserId;
}
