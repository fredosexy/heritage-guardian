# B7 — ACCESS REQUESTS + ACCESS GRANTS + SCOPES

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B6 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- anciennes demandes d'adhésion ;
- permissions Dossier existantes ;
- rôles participants ;
- logique privé/public ;
- Auth/RLS ;
- services/hooks ;
- modals de demande d'accès/intervention ;
- accès Documents ;
- éventuelles tables invitation/permissions.

Réutilise et migre ce qui existe.

Ne crée pas un deuxième système d'autorisation.

---

# 2. OBJECTIF B7

Finaliser uniquement :

1. demandes d'accès ;
2. autorisations accordées ;
3. scopes ;
4. durée/expiration ;
5. révocation ;
6. règles backend ;
7. UI propriétaire/intervenant ;
8. RLS ;
9. tests de portée.

Ne touche pas encore :

- interventions métier complètes ;
- communications ;
- signalements ;
- audit global.

---

# 3. PRINCIPE

Un accès privé doit répondre à :

```text
Qui demande ?
Pour quel dossier ?
Pourquoi ?
Que veut-il voir ou faire ?
Pendant combien de temps ?
Qui autorise ?
```

Aucun accès total implicite.

---

# 4. TABLE `access_requests`

Créer ou compléter.

Champs minimum :

```text
id
dossier_id
requester_actor_id nullable
requested_by
purpose
message nullable
status
created_at
resolved_at nullable
resolved_by nullable
expires_at nullable
```

Statuts :

```text
en_attente
acceptee
refusee
annulee
expiree
```

---

# 5. TABLE `access_request_scopes`

Relation :

```text
access_requests 1 → N access_request_scopes
```

Scopes minimum :

```text
voir_resume
voir_documents_selectionnes
ajouter_document
accompagner
intervenir
commenter
```

Ne mets pas les scopes sous forme d'une chaîne libre.

Utilise un type contrôlé.

---

# 6. TABLE `access_grants`

Créer l'autorisation réellement active.

Champs :

```text
id
dossier_id
grantee_actor_id nullable
grantee_user_id nullable
granted_by
purpose
granted_at
expires_at nullable
revoked_at nullable
created_from_request_id nullable
```

Ne fusionne pas Request et Grant.

Une demande acceptée produit un Grant.

---

# 7. TABLE `access_grant_scopes`

Relation :

```text
access_grants 1 → N access_grant_scopes
```

Le Grant ne doit contenir que les scopes réellement accordés.

Ils peuvent être plus limités que ceux demandés.

---

# 8. DURÉE

Supporter :

- sans expiration explicite si le produit l'autorise ;
- expiration à une date ;
- révocation manuelle.

Un accès expiré ou révoqué doit devenir inutilisable immédiatement côté backend.

---

# 9. RÈGLE DE PORTÉE

Exemple :

Un géomètre peut recevoir :

```text
voir_resume
voir_documents_selectionnes
intervenir
```

sans recevoir :

```text
modifier_titulaire
voir_tous_documents
gerer_participants
```

Aucun rôle professionnel ne donne automatiquement accès total au Dossier.

---

# 10. DOCUMENTS SÉLECTIONNÉS

Pour le scope :

```text
voir_documents_selectionnes
```

prévoir une relation explicite si nécessaire, par exemple :

```text
access_grant_documents
grant_id
document_id
```

Ne donne pas accès à tous les documents par défaut.

---

# 11. MODE ACCOMPAGNÉ

Un accompagnateur doit recevoir une autorisation explicite.

Scopes possibles :

```text
voir_resume
ajouter_document
accompagner
commenter
```

Ne lui donne pas automatiquement :

- droits de titulaire ;
- accès à tous les documents ;
- capacité de déléguer ;
- capacité de valider une étape officielle.

---

# 12. DEMANDE D'INTERVENTION

Une demande d'intervention peut réutiliser `access_requests` si le modèle reste clair.

Exemple :

```text
purpose = intervention_step
```

avec scopes adaptés.

Ne crée pas une deuxième table quasi-identique sauf besoin métier réel.

---

# 13. UI PROPRIÉTAIRE / TITULAIRE AUTORISÉ

Dans le Dossier, section :

**Accès et interventions**

Afficher :

- demandes en attente ;
- accès actifs ;
- expiration ;
- scopes ;
- bouton Révoquer.

Lors d'une demande :

montrer clairement :

```text
X demande accès pour :
- voir le résumé
- consulter 2 documents
- intervenir à l'étape Y
```

Actions :

```text
Accepter
Modifier l'accès
Refuser
```

---

# 14. UI DEMANDEUR

Afficher seulement :

```text
Pourquoi vous demandez l'accès
Ce que vous demandez
Statut
Date
```

Après acceptation :

```text
Accès autorisé
Portée : ...
Expiration : ...
```

---

# 15. MODE RURAL ESSENTIEL

Ne montre pas une liste technique de scopes.

Traduire en langage simple :

```text
Cette personne veut :
- voir le résumé
- voir ces papiers
- vous aider sur cette étape
```

Une action principale à la fois.

---

# 16. RLS — `access_requests`

**DENY BY DEFAULT**

SELECT :

- demandeur ;
- personnes autorisées à traiter la demande sur le Dossier.

INSERT :

utilisateur/acteur autorisé à demander.

UPDATE :

- demandeur peut annuler sa demande tant qu'elle est en attente ;
- personne autorisée peut accepter/refuser ;
- pas de modification arbitraire après résolution.

---

# 17. RLS — `access_grants`

SELECT :

- grantee ;
- grantor ;
- utilisateurs autorisés sur le Dossier.

INSERT :

uniquement via workflow backend autorisé.

UPDATE :

restriction forte.

Le grantee ne peut jamais :

- augmenter ses scopes ;
- prolonger sa durée ;
- retirer sa révocation.

---

# 18. ENFORCEMENT BACKEND

Les scopes doivent être appliqués côté backend/RLS.

Exemples :

```text
voir_resume
→ accès projection Dossier minimale

voir_documents_selectionnes
→ accès uniquement documents associés au grant

ajouter_document
→ INSERT document autorisé

intervenir
→ future création intervention autorisée
```

Ne vérifie pas les scopes uniquement en React.

---

# 19. HELPER BACKEND / FUNCTIONS

Si la RLS devient trop complexe, créer des fonctions SQL sécurisées et testées pour :

```text
has_active_grant(...)
has_scope(...)
can_access_document(...)
```

Réutilise les helpers existants s'ils existent.

Ne duplique pas la logique de permission dans plusieurs policies.

---

# 20. SERVICE / REPOSITORY

Exposer conceptuellement :

```ts
requestAccess(...)
getAccessRequestsForDossier(...)
resolveAccessRequest(...)

getActiveGrants(...)
grantAccess(...)
revokeAccess(...)
hasScope(...)
```

Les composants ne parlent jamais directement à Supabase.

---

# 21. LIEN AVEC PARTICIPANTS

Ne mélange pas :

```text
dossier_participants
```

et :

```text
access_grants
```

Un Participant décrit une relation métier au Dossier.

Un Grant décrit une permission d'accès précise.

Une même personne peut être les deux.

---

# 22. LIEN AVEC ACTEURS

Un Acteur peut demander un accès.

Le fait d'être :

```text
professionnel vérifié
```

ne suffit pas à voir un Dossier privé.

Il faut encore :

```text
relation appropriée
ou
access_grant valide
```

---

# 23. EXPIRATION

Prévoir un helper/service pour distinguer :

```text
actif
expiré
révoqué
```

Un grant expiré ne doit pas être pris en compte par les policies.

---

# 24. RÉVOCATION

La révocation doit :

- renseigner `revoked_at` ;
- arrêter immédiatement l'accès ;
- conserver l'historique ;
- ne pas supprimer le Grant.

---

# 25. INDEXES

Prévoir selon requêtes réelles :

```text
access_requests.dossier_id
access_requests.requested_by
access_requests.status

access_grants.dossier_id
access_grants.grantee_user_id
access_grants.grantee_actor_id
access_grants.expires_at
access_grants.revoked_at

access_grant_scopes.grant_id
access_grant_scopes.scope
```

---

# 26. CONTRAINTES

Garantir :

- FK ;
- scopes valides ;
- demande résolue une seule fois ;
- grant lié au bon Dossier ;
- pas de grant actif incohérent ;
- `resolved_by` cohérent ;
- expiration valide.

---

# 27. TESTS UNITAIRES

Tester :

- création demande ;
- acceptation ;
- refus ;
- grant généré ;
- scope réduit ;
- expiration ;
- révocation ;
- document sélectionné ;
- accompagnateur limité.

---

# 28. TESTS RLS

Scénarios minimum :

1. utilisateur sans grant ne voit pas Dossier privé ;
2. grant `voir_resume` ne donne pas accès aux documents ;
3. grant documents sélectionnés n'expose pas les autres ;
4. grant expiré refuse l'accès ;
5. grant révoqué refuse l'accès ;
6. grantee ne peut pas ajouter lui-même un scope ;
7. professionnel vérifié sans grant ne voit pas le Dossier ;
8. owner peut traiter une demande autorisée.

---

# 29. MIGRATION ANCIENNE `DemandeAdhesion`

Si l'ancien modèle existe :

```text
DemandeAdhesion
```

le migrer vers :

```text
AccessRequest
```

sans casser les usages existants.

Identifier :

- données à migrer ;
- UI à adapter ;
- hooks à remplacer ;
- anciens types à déprécier.

Ne conserve pas deux workflows actifs.

---

# 30. UI / UX

Respecte le Design System.

Mobile-first.

Toujours expliquer :

```text
Qui demande ?
Pourquoi ?
Que pourra-t-il voir ?
Que pourra-t-il faire ?
Jusqu'à quand ?
```

Éviter les termes techniques comme `scope` dans l'UI utilisateur.

---

# 31. VALIDATION B7

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- demande d'accès fonctionne ;
- acceptation/refus fonctionne ;
- scopes persistés ;
- grants appliqués par RLS ;
- expiration fonctionne ;
- révocation fonctionne ;
- documents sélectionnés protégés ;
- ancien système d'adhésion migré ou clairement déprécié ;
- aucun appel Supabase dans composants ;
- aucun domaine B8+ implémenté.

---

# 32. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. ancien système d'adhésion migré ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. tables/scopes ;
7. RLS/helpers ;
8. repositories/services ;
9. UI adaptée ;
10. tests ;
11. éventuels écarts.

**Ne commence pas B8.**