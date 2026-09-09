# B15 — PRODUCTION HARDENING + SÉCURITÉ + TESTS + PERFORMANCE

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B14 sont terminés.

Cette phase n'ajoute aucune nouvelle fonctionnalité métier.

Objectif : rendre l'application réellement exploitable en production.

---

# 1. AUDIT GLOBAL

Inspecte avant modification :

- architecture frontend ;
- Supabase ;
- migrations ;
- RLS ;
- Storage ;
- Edge Functions/RPC ;
- Auth ;
- offline/outbox ;
- PWA/service worker ;
- routes ;
- back-office ;
- tests ;
- erreurs TypeScript ;
- dépendances ;
- observabilité ;
- performance ;
- accessibilité.

Ne refactorise pas ce qui est déjà conforme.

---

# 2. BUILD PRODUCTION

Valider :

```text
production build
TypeScript
lint
imports
routes
lazy loading
environment variables
```

Corriger :

- erreurs ;
- warnings critiques ;
- imports morts ;
- code inaccessible ;
- dépendances inutilisées importantes.

Aucun `any` injustifié pour masquer une erreur.

---

# 3. SÉCURITÉ AUTH

Vérifier :

- restauration de session ;
- expiration ;
- logout ;
- changement de compte ;
- routes protégées ;
- session admin ;
- aucun secret côté client ;
- aucune autorisation basée uniquement sur l'UI.

Tester un accès direct aux routes protégées.

---

# 4. AUDIT RLS COMPLET

Tester toutes les tables sensibles.

Minimum :

```text
profiles
usage_preferences
biens
bien_right_holders
dossiers
dossier_participants
dossier_steps
actors
actor_competences
actor_credentials
documents
document_versions
access_requests
access_grants
dossier_interventions
conversations
messages
signalements
audit_events
notifications
```

Principe :

**DENY BY DEFAULT.**

Tester avec plusieurs utilisateurs réels de test.

---

# 5. TESTS D'ISOLATION

Scénarios obligatoires :

```text
Utilisateur A ne lit pas les biens de B.

A ne lit pas les dossiers privés de B.

Un accompagnateur ne dépasse pas ses scopes.

Un professionnel vérifié sans Grant ne voit pas un dossier privé.

Un Grant expiré ne fonctionne plus.

Un utilisateur ne peut pas se déclarer vérifié.

Un utilisateur ne peut pas modifier AuditEvent.

Un rôle admin insuffisant ne peut pas appeler une fonction privilégiée.
```

Tester aussi via appels directs backend, pas uniquement via UI.

---

# 6. STORAGE SECURITY

Vérifier :

- buckets privés ;
- signed URLs ;
- expiration ;
- policies ;
- isolation entre utilisateurs ;
- fichiers d'un autre dossier impossibles à lire ;
- listing global interdit ;
- audio privé ;
- credentials privés.

Aucun document sensible dans un bucket public.

---

# 7. INPUT VALIDATION

Vérifier toutes les entrées :

- textes ;
- IDs ;
- fichiers ;
- MIME ;
- tailles ;
- statuts ;
- rôles ;
- scopes ;
- dates ;
- coordonnées ;
- messages.

Validation frontend = UX.

Validation backend = sécurité et intégrité.

---

# 8. ACTIONS PRIVILÉGIÉES

Auditer toutes les opérations telles que :

```text
verify_actor
verify_competence
publish_procedure
grant_access
revoke_access
complete_protected_step
verify_document
suspend_actor
resolve_signalement
```

Elles doivent être contrôlées côté backend.

Aucun simple UPDATE frontend sur un champ protégé.

---

# 9. AUDIT TRAIL

Vérifier que les actions sensibles génèrent effectivement leur AuditEvent.

Tester notamment :

- titulaire ajouté/modifié ;
- accès accordé/révoqué ;
- document vérifié ;
- intervention protégée ;
- acteur vérifié ;
- procédure publiée ;
- signalement traité ;
- rôle admin attribué/révoqué.

Audit = append-only.

---

# 10. E2E — PREMIÈRE UTILISATION

Tester :

```text
nouvel utilisateur
→ onboarding
→ choix Rural essentiel
→ préférences sauvegardées
→ orientation
→ Home adaptée
```

Tester aussi :

```text
Rural autonome
Moderne
```

Même backend.

Seule la présentation varie.

---

# 11. E2E — GRAND-MÈRE ACCOMPAGNÉE

Scénario critique :

```text
Jeanne = titulaire

Paul = accompagnateur

Paul aide Jeanne à créer un Bien
↓
Jeanne reste titulaire
↓
Dossier créé
↓
Paul agit pour Jeanne
↓
performed_by = Paul
on_behalf_of = Jeanne
↓
documents ajoutés
↓
parcours continue
```

Tester que Paul ne peut jamais :

- devenir titulaire automatiquement ;
- modifier des droits non autorisés ;
- déléguer des droits qu'il ne possède pas.

---

# 12. E2E — PARCOURS TERRITORIAL

Tester :

```text
Bien
↓
Dossier
↓
procédure appliquée
↓
étape rurale
↓
intervention
↓
étape arrondissement
↓
étape département
↓
prochaine étape
```

Vérifier :

- ordre ;
- acteur ;
- compétence ;
- niveau territorial ;
- historique ;
- prochaine action.

---

# 13. E2E — DOCUMENTS

Tester :

```text
ajout photo
↓
version document
↓
provenance
↓
à vérifier
↓
vérification autorisée
```

Vérifier :

```text
uploadé par
fourni par
```

et que l'ancienne version reste disponible.

---

# 14. E2E — ACCÈS PRIVÉ

Tester :

```text
acteur demande accès
↓
titulaire voit demande
↓
accorde scopes limités
↓
acteur voit uniquement ce qui est autorisé
↓
expiration
↓
accès supprimé
```

Tester aussi révocation immédiate.

---

# 15. E2E — COMMUNICATION

Tester :

```text
conversation contextuelle
↓
message texte
↓
audio
↓
document joint
```

Vérifier que :

- le contexte reste visible ;
- un membre retiré perd accès ;
- aucun chat global libre n'est créé.

---

# 16. E2E — SIGNALEMENT

Tester :

```text
orientation
→ problème
→ signalement
→ intervention contestée
→ document ajouté
→ suivi
```

L'intervention originale doit rester intacte.

---

# 17. E2E — OFFLINE

Scénario critique :

```text
perte réseau
↓
ouvrir dossier cached
↓
ajouter document
↓
message vocal
↓
continuer saisie
↓
En attente d'envoi
↓
retour réseau
↓
sync
↓
confirmation
```

Aucune donnée perdue.

Aucun doublon.

---

# 18. E2E — CONFLIT

Tester :

```text
Utilisateur modifie donnée offline
↓
donnée distante change
↓
sync
↓
conflit détecté
```

Pour :

- document → versionnement ;
- message → append-only ;
- permission → résolution explicite ;
- titulaire → jamais merge automatique.

---

# 19. OFFLINE ROBUSTNESS

Tester :

- fermeture brutale app ;
- redémarrage ;
- batterie faible simulée ;
- upload interrompu ;
- navigation pendant sync ;
- plusieurs opérations dépendantes ;
- retry ;
- retour réseau instable.

L'Outbox doit survivre au redémarrage.

---

# 20. CHANGEMENT DE COMPTE

Tester obligatoirement :

```text
Utilisateur A
→ données offline
→ logout
→ Utilisateur B login
```

B ne doit voir aucune donnée privée locale de A.

---

# 21. PWA

Vérifier :

- manifest ;
- installation ;
- icons ;
- service worker ;
- update strategy ;
- offline shell ;
- version update ;
- cache invalidation ;
- comportement après déploiement d'une nouvelle version.

Ne laisse pas l'utilisateur bloqué sur une ancienne version critique.

---

# 22. PERFORMANCE RÉSEAU FAIBLE

Auditer les écrans critiques avec connexion lente.

Priorités :

- Home ;
- `/cas` ;
- détail Dossier ;
- création ;
- parcours ;
- documents ;
- messages.

Optimiser uniquement les problèmes mesurés.

---

# 23. QUERIES

Vérifier :

- N+1 ;
- requêtes inutiles ;
- données trop larges ;
- SELECT `*` inutile ;
- pagination ;
- filtres serveur ;
- index.

Ne charge pas un Dossier complet si l'écran n'a besoin que d'un résumé.

---

# 24. PAGINATION

Obligatoire lorsque pertinent :

- dossiers ;
- actors ;
- messages ;
- notifications ;
- audit ;
- signalements ;
- documents nombreux.

---

# 25. BUNDLE

Analyser le bundle.

Corriger uniquement les gros problèmes :

- imports lourds ;
- duplication ;
- librairies inutiles ;
- chargement global de fonctionnalités rarement utilisées.

Utiliser lazy-loading/code splitting selon l'architecture existante.

---

# 26. MÉDIAS

Optimiser :

- images ;
- photos documents ;
- audio.

Ne télécharge pas automatiquement tous les fichiers.

Utiliser previews/thumbnails si déjà supportés proprement.

---

# 27. UX LOADING

Chaque écran async doit avoir un état :

```text
loading
empty
error
success
offline
```

Éviter les écrans blancs.

---

# 28. ERROR HANDLING

Créer/réutiliser une stratégie cohérente.

Ne montrer jamais à l'utilisateur :

```text
PostgREST...
SQLSTATE...
Stack trace...
```

Afficher des messages simples.

Les détails techniques vont dans l'observabilité.

---

# 29. ERROR BOUNDARIES

Ajouter/compléter les Error Boundaries là où nécessaire.

Une erreur d'un panneau ne doit pas forcément faire tomber toute l'application.

---

# 30. ACCESSIBILITÉ

Auditer :

- labels ;
- focus ;
- clavier ;
- lecteurs écran ;
- contrastes ;
- targets tactiles ;
- formulaires ;
- erreurs ;
- dialogues ;
- aria lorsque nécessaire.

Respecter le Design System existant.

---

# 31. MODE RURAL ESSENTIEL

Valider chaque écran critique.

Règles :

- une action dominante ;
- phrases courtes ;
- peu de choix ;
- audio accessible ;
- navigation évidente ;
- pas de jargon.

Si un écran est trop dense :

adapter la présentation sans créer une deuxième logique métier.

---

# 32. AUDIO

Tester :

- lecture ;
- enregistrement ;
- permission micro ;
- erreur micro ;
- offline ;
- reprise ;
- upload ;
- lecture après sync.

La transcription ne doit jamais bloquer le flow.

---

# 33. OBSERVABILITÉ

Réutiliser l'infrastructure existante.

Capturer :

- crash frontend ;
- erreurs backend ;
- sync failures ;
- upload failures ;
- erreurs Auth ;
- erreurs de fonctions privilégiées ;
- performances critiques.

Ne pas envoyer inutilement de données sensibles aux logs.

---

# 34. LOGGING

Interdit en production :

- tokens ;
- secrets ;
- contenu intégral document ;
- contenu vocal ;
- données patrimoniales complètes ;
- données personnelles inutiles.

Nettoyer les `console.log` de debug.

---

# 35. RATE LIMIT / ANTI-ABUS

Vérifier les opérations exposées aux abus :

- login ;
- invitations ;
- Access Requests ;
- messages ;
- uploads ;
- Signalements ;
- fonctions admin.

Appliquer les protections adaptées côté backend.

Ne crée pas une logique client comme seule protection.

---

# 36. DUPLICATIONS

Scanner :

- types ;
- services ;
- repositories ;
- enums ;
- components équivalents ;
- hooks ;
- sources de vérité.

Supprimer uniquement les duplications clairement sûres à éliminer.

Ne lance pas une refonte globale.

---

# 37. DÉPENDANCES CIRCULAIRES

Auditer particulièrement :

```text
Dossiers ↔ Parcours
Dossiers ↔ Acteurs
Documents ↔ Parcours
Access ↔ Documents
Interventions ↔ Parcours
Signalements ↔ Interventions
Notifications ↔ Events
```

Corriger les cycles réels.

Utiliser `application/` pour l'orchestration cross-feature.

---

# 38. TYPESCRIPT

Vérifier :

- types générés Supabase ;
- narrowing ;
- null handling ;
- DTO/mapping ;
- absence d'`any` non justifié ;
- erreurs masquées.

Ne duplique pas les types persistence dans plusieurs features.

---

# 39. MIGRATIONS

Auditer toutes les migrations B1-B14.

Vérifier :

- ordre ;
- répétabilité ;
- FK ;
- contraintes ;
- index ;
- RLS ;
- fonctions ;
- rollback/recovery documenté si nécessaire.

Ne modifie pas une ancienne migration déjà appliquée en production.

Créer une migration corrective.

---

# 40. DATA INTEGRITY

Tester les invariants :

```text
Bien → titulaire valide

Dossier → Bien valide

Step → bon Dossier

Intervention → bonne Step

Document → bon Dossier

Grant → bon Dossier

Signalement → références cohérentes
```

Aucune relation orpheline.

---

# 41. ENVIRONNEMENTS

Vérifier séparation :

```text
development
staging
production
```

Les variables doivent être correctes.

Aucune clé production dans le repo.

---

# 42. SEED / DONNÉES TEST

Aucune donnée fake ne doit apparaître en production.

Séparer clairement :

- seed dev ;
- fixtures test ;
- production.

---

# 43. BACK-OFFICE SECURITY

Tester :

- accès direct à route admin ;
- API admin ;
- rôle insuffisant ;
- rôle révoqué ;
- session expirée ;
- modification directe d'un acteur ;
- publication procédure sans permission.

---

# 44. RECOVERY

Documenter et vérifier les mécanismes de récupération pour :

- upload échoué ;
- Outbox bloquée ;
- sync conflit ;
- session expirée ;
- erreur migration ;
- notification push invalide ;
- service temporairement indisponible.

---

# 45. HEALTH CHECKS

Si l'architecture le permet, disposer de checks simples pour :

- backend accessible ;
- auth ;
- Storage ;
- DB ;
- sync.

Ne pas exposer d'informations sensibles publiquement.

---

# 46. TESTS AUTOMATISÉS

Le pipeline doit exécuter au minimum :

```text
typecheck
unit
integration
RLS
build
E2E critiques
```

Réutilise l'outil de test existant.

Ne change pas de framework de test sans nécessité.

---

# 47. E2E MINIMUM OBLIGATOIRES

Avant production, ces scénarios doivent être verts :

1. onboarding ;
2. Rural essentiel ;
3. création Bien ;
4. création Dossier ;
5. grand-mère accompagnée ;
6. parcours territorial ;
7. document ;
8. accès privé limité ;
9. intervention ;
10. communication ;
11. signalement ;
12. audit ;
13. offline ;
14. resynchronisation ;
15. changement de compte ;
16. back-office.

---

# 48. PERFORMANCE BUDGET

Définir des seuils raisonnables selon l'existant pour :

- initial load ;
- navigation ;
- requêtes critiques ;
- images ;
- cache.

Ne poursuis pas des scores artificiels au détriment du produit.

---

# 49. DESIGN SYSTEM

Ne modifie pas :

- palette ;
- typography ;
- spacing ;
- tokens ;
- composants shadcn globaux ;

sauf bug réel.

B15 est un hardening, pas une redesign phase.

---

# 50. AUCUNE NOUVELLE FEATURE

Interdit pendant B15 :

- nouveau domaine ;
- nouveau moteur ;
- nouvelle page métier sans nécessité corrective ;
- nouvelles fonctions produit non demandées.

Si un manque métier est découvert :

rapporte-le.

Ne l'implémente pas automatiquement.

---

# 51. VALIDATION FINALE B15

Avant de terminer, vérifier :

```text
Build            ✓
TypeScript       ✓
Auth             ✓
RLS              ✓
Storage          ✓
Permissions      ✓
Parcours         ✓
Documents        ✓
Access           ✓
Interventions    ✓
Messages         ✓
Signalements     ✓
Audit            ✓
Offline          ✓
Notifications    ✓
Back-office      ✓
PWA              ✓
Accessibility    ✓
Performance      ✓
Observability    ✓
E2E              ✓
```

Aucune validation ne doit être déclarée réussie sans test réel.

---

# 52. LIVRABLE B15

Rapporte uniquement :

## Critiques corrigés
Liste courte.

## Sécurité
Tests RLS/Auth/Storage réellement exécutés.

## Tests
Résultats Unit / Integration / E2E.

## Offline
Scénarios validés et problèmes restants.

## Performance
Problèmes mesurés et corrections appliquées.

## Accessibilité
Corrections réalisées.

## Production blockers
Liste exacte.

## Fichiers modifiés
Liste.

## Migrations correctives
Liste.

## État final

Utiliser uniquement :

```text
READY FOR STAGING
```

ou :

```text
NOT READY — BLOCKERS REMAIN
```

Ne déclare jamais `READY FOR PRODUCTION` directement à B15.

**Ne commence aucune autre phase automatiquement.**