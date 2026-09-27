# 15 — AUTORISATION GLOBALE / RBAC + ABAC + SCOPES

**Statut : CANONICAL — V1.0**

## 1. Mission

Définir un système d’autorisation cohérent pour tous les domaines, combinant rôles, permissions explicites, scope, attributs, mandats, missions, confidentialité et restrictions de conflit.

## 2. Principe

```text
Authentication
≠
Authorization
```

```text
Role
≠
PatrimonialStatus
≠
Permission
```

## 3. Sources de décision

```text
EffectivePermission =
  RoleGrant
+ ExplicitGrant
+ ValidRepresentationMandate
+ ValidMissionScope
+ ContextGrant
- ExplicitDeny
- ConflictRestriction
- ConfidentialityRestriction
- ExpiredOrRevokedAccess
```

Priorité :
1. System security prohibition
2. Explicit deny
3. Conflict-of-interest restriction
4. Confidentiality restriction
5. Scope restriction
6. Explicit grant
7. Role grant

`DENY > ALLOW`.

## 4. Modèles

```text
RoleAssignment
PermissionGrant
PermissionDeny
RepresentationMandate
MissionScope
ConflictOfInterest
ResourceConfidentiality
ActionContext
```

## 5. RoleAssignment

```text
RoleAssignment {
  user_id
  role
  scope_type
  scope_id
  valid_from
  valid_until
  status
}
```

## 6. Rôles applicatifs principaux

`TITULAIRE`, `CASE_ADMIN`, `MANAGER`, `CONTRIBUTOR`, `PARTICIPANT`, `READER`, `REPRESENTATIVE`, `COMPANION`, `PROFESSIONAL`, `MEDIATOR`, `WITNESS`, `ADMINISTRATIVE_ACTOR`.

Héritier, copropriétaire, occupant, bénéficiaire sont des statuts/relations métier, pas des rôles applicatifs universels.

## 7. Permissions élémentaires communes

`VIEW`, `CONTRIBUTE`, `UPLOAD_DOCUMENT`, `EDIT`, `MANAGE_DOCUMENTS`, `MANAGE_PARTICIPANTS`, `MANAGE_PROCEDURES`, `MANAGE_CONFLICT`, `GRANT_ACCESS`, `REVOKE_ACCESS`, `ARCHIVE`, `REMOVE_FROM_CASE`, `REMOVE_LINK`, `SOFT_DELETE`, `RESTORE`, `EXPORT`, `ADMIN_CASE`.

Chaque domaine ajoute ses permissions spécifiques.

## 8. Scopes

`GLOBAL`, `FAMILY`, `ASSET`, `CASE`, `INHERITANCE`, `TRANSMISSION`, `CONFLICT`, `PROCEDURE`, `MISSION`, `DOCUMENT`, `ALERT`, `ECONOMIC_ACTIVITY`.

Un grant au scope Case n’accorde pas forcément accès à un Secret Document lié.

## 9. Représentation

```text
Companion
≠
Representative
```

Un mandat définit :
- représenté ;
- représentant ;
- scope ;
- permissions ;
- validité ;
- source ;
- statut.

Les actions sensibles revalident le mandat au moment de la commande.

## 10. MissionScope

Un professionnel n’accède qu’aux ressources nécessaires à sa mission.

```text
ProfessionalProfile
¬⇒
CaseAccess
```

## 11. Conflits de rôles

`NO_CONFLICT`, `POTENTIAL_CONFLICT`, `RESTRICTED_COMBINATION`, `INCOMPATIBLE`.

Exemples :
- médiateur + partie : incompatible ;
- médiateur + représentant : incompatible ;
- professionnel vérifiant son propre travail : interdit si indépendance exigée ;
- manager + beneficiary : audit renforcé ;
- représentant ayant un intérêt propre : revue/conflit potentiel.

## 12. acting_role

Lorsqu’un utilisateur possède plusieurs rôles, une action sensible précise le rôle actif.

```text
ActionContext.acting_role
```

## 13. Confidentialité

Le resource owner domain définit son niveau de confidentialité.

```text
VIEW_CONTAINER
¬⇒
VIEW_LINKED_SECRET_RESOURCE
```

Exemples :
- `ADMIN_CASE ¬⇒ VIEW_SECRET_WILL`
- `VIEW_ALERT ¬⇒ VIEW_SOURCE_RESOURCE`
- `VIEW_ACTIVITY ¬⇒ VIEW_FINANCIAL_DETAILS`

## 14. AuthorizationDecision

```text
AuthorizationDecision {
  allowed
  permission
  scope
  principal
  basis[]
  restrictions[]
  reason_code
  decision_version
  evaluated_at
}
```

Ne pas exposer au client des détails sensibles inutiles sur la raison d’un deny.

## 15. PolicyEvaluator

Entrées :
- principal ;
- action ;
- target ;
- ActionContext ;
- current grants/denies ;
- mandate ;
- mission ;
- conflict restrictions ;
- confidentiality.

Sortie : décision déterministe et auditable.

## 16. Cache

Les décisions peuvent être cachées uniquement brièvement pour performance.

Les événements de rôle/grant/deny/mandat/scope invalident les caches.

Une action sensible effectue une revalidation autoritative.

## 17. RLS Supabase

Politique par défaut :
```text
DENY BY DEFAULT
```

La RLS protège les lignes même si le frontend masque déjà l’action.

## 18. RLS et services

Les opérations complexes peuvent passer par RPC/Edge Function sécurisée si :
- plusieurs checks sont requis ;
- une transaction métier doit rester atomique ;
- la logique ne doit pas être exposée au client.

Le service_role n’est jamais envoyé au frontend.

## 19. RLS patterns

Lecture :
```text
authenticated principal
AND active relation/grant
AND scope matches
AND no deny
AND confidentiality permits
```

Écriture :
```text
authenticated
AND explicit mutation permission
AND target domain invariants
```

## 20. Offline

Une permission obtenue offline n’est pas durable. À la reconnexion :
- revalider principal ;
- revalider grant/mandat/scope ;
- rejeter proprement l’opération si accès révoqué.

## 21. Révocation

Les révocations doivent prendre effet pour toute nouvelle action sensible immédiatement côté serveur, même si un événement d’invalidation de cache est en retard.

## 22. Administration

Séparer :
`platform_admin`, `support_agent`, `actor_verifier`, `procedure_editor`, `moderation_reviewer`, `security_operator`.

Éviter `admin=true` universel.

## 23. Suppression

Permissions distinctes :
`DELETE_OWN_CONTENT`, `DELETE_DRAFT`, `ARCHIVE`, `REMOVE_FROM_CASE`, `REMOVE_LINK`, `SOFT_DELETE`, `RESTORE`, `PURGE`.

Priorité :
```text
remove relation
→ archive
→ soft delete
→ purge exceptional
```

## 24. Audit

Toute action sensible conserve :
`actor_user_id`, `actor_person_id`, `acting_role`, `represented_person_id`, `mandate_id`, scope, permission, target, result, timestamp.

## 25. Tests RLS / policies

- owner allowed ;
- unrelated user denied ;
- explicit deny overrides role ;
- expired grant denied ;
- revoked mandate denied ;
- secret document denied despite case admin ;
- professional outside MissionScope denied ;
- mediator conflict denied ;
- financial permission isolated ;
- offline queued action rejected after revoke ;
- support role cannot mutate patrimonial state sans permission dédiée.

## 26. Invariants

1. Aucune autorisation critique uniquement dans React.
2. `DENY > ALLOW`.
3. Une permission n’est jamais transitive par simple lien.
4. Un mandat expiré ne permet aucune nouvelle action.
5. Une mission terminée retire les accès temporaires.
6. Les statuts patrimoniaux ne deviennent pas des permissions.
7. Les caches n’outrepassent jamais la source autoritative.
