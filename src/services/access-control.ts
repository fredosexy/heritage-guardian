export const ACCESS_SCOPES = ["voir_resume","voir_documents_selectionnes","ajouter_document","accompagner","intervenir","commenter"] as const;
export type AccessScope = typeof ACCESS_SCOPES[number];
export interface GrantLike { expires_at: string | null; revoked_at: string | null; access_grant_scopes: { scope: string }[]; }
export function grantState(grant: Pick<GrantLike,"expires_at"|"revoked_at">, now=Date.now()) {
  if (grant.revoked_at) return "revoque" as const;
  if (grant.expires_at && new Date(grant.expires_at).getTime()<=now) return "expire" as const;
  return "actif" as const;
}
export function hasScope(grant: GrantLike, scope: AccessScope, now=Date.now()) {
  return grantState(grant,now)==="actif" && grant.access_grant_scopes.some((item)=>item.scope===scope);
}
export function grantedSubset(requested: AccessScope[], granted: AccessScope[]) {
  return granted.length>0 && granted.every((scope)=>requested.includes(scope));
}
