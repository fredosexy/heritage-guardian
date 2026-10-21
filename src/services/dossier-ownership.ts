/** UI guards complement, never replace, the existing owner-only cloud policies. */
export function canEditDossier(dossier: { user_id: string } | null, userId?: string): boolean {
  return Boolean(dossier && userId && dossier.user_id === userId);
}

export function assertDossierOwner(dossier: { user_id: string } | null, userId?: string): void {
  if (!canEditDossier(dossier, userId)) throw new Error("Only the dossier owner can modify this dossier");
}