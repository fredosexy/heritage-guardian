# B3 ACCEPTED — Dossiers et participants

**Date :** 26 septembre 2026  
**Périmètre :** B3 uniquement  
**Décision :** implémentation et CI terminées ; fusion volontaire requise avant B4.

## 1. Existant réutilisé

- table `dossiers`, routes `/dossiers`, `/create` et `/dossiers/:id` ;
- repositories, hooks, mode hors-ligne idempotent et design system existants ;
- modèle durable `biens` et registre `persons` de B2 ;
- anciennes données Dossier migrées sans suppression brutale ;
- table historique `participants` migrée vers le modèle canonique B3, avec vue de compatibilité temporaire.

## 2. Fichiers créés

- `supabase/migrations/20260926000050_b3_dossier_enums.sql` ;
- `supabase/migrations/20260926000100_b3_dossiers_participants.sql` ;
- `supabase/tests/database/b3_dossiers_participants.test.sql` ;
- `docs/B3_ACCEPTED.md`.

## 3. Base de données

`dossiers` reçoit :

- `bien_id` obligatoire ;
- `owner_id` responsable applicatif ;
- `completion_level` ;
- `closed_at` et `archived_at`.

Les valeurs B3 de type, statut et visibilité sont ajoutées. Les anciennes valeurs restent temporairement lisibles pour migration mais ne sont plus produites par les nouveaux parcours.

`dossier_participants` devient la relation canonique avec :

- `person_id` ;
- rôle Dossier distinct ;
- statut `invite / actif / refuse / revoque` ;
- `invited_by`, `accepted_at`, `revoked_at` ;
- unicité des relations actives.

## 4. Responsabilités

Le modèle distingue explicitement :

- utilisateur global ;
- titulaire ou ayant droit du Bien ;
- propriétaire applicatif du Dossier ;
- participant au Dossier.

Créer un Dossier pour Jeanne par Paul ne transforme jamais Paul en titulaire.

## 5. RLS et opérations contrôlées

- deny-by-default ;
- lecture par owner ou participant actif lié à un profil ;
- création atomique par `create_dossier` ;
- ajout protégé par `add_dossier_participant` ;
- révocation douce par `revoke_dossier_participant` ;
- rôles sensibles impossibles à s’auto-attribuer ;
- aucun DELETE physique autorisé sur `dossiers` ;
- visibilité `public` sans exposition automatique du contenu complet.

## 6. Couche applicative

Repositories exposés :

- `createDossier` ;
- `getDossierById` ;
- `getDossiersForUser` ;
- `updateDossier` ;
- `archiveDossier` ;
- `addParticipant` ;
- `getParticipants` ;
- `revokeParticipant`.

Les composants ne parlent pas directement à Supabase.

## 7. Interface

- création exigeant un Bien ;
- liste issue de la source production ;
- affichage du Bien, statut, visibilité et complétude ;
- détail avec responsable métier, Bien et personnes concernées ;
- archivage au lieu de suppression ;
- routes Dossier protégées par authentification ;
- synchronisation hors-ligne via RPC idempotente.

## 8. Tests certifiés

GitHub Actions **Quality #37** :

- `npm ci` ;
- contrôle statique Phase 0 ;
- TypeScript ;
- lint ;
- tests unitaires ;
- build ;
- `supabase start` ;
- `supabase db reset --local` ;
- tests pgTAP Phase 0, B1, B2 et B3.

Scénarios B3 : liaison Bien, distinction owner/titulaire, proposition des titulaires, isolation multi-utilisateur, participant actif, rôle protégé, révocation, archivage et absence de suppression physique.

## 9. Écarts assumés

- Les anciennes valeurs enum sont conservées uniquement pour compatibilité de données.
- `participants` subsiste comme vue de compatibilité, pas comme deuxième table métier.
- L’acceptation interactive d’une invitation existante est préparée par le statut mais n’est pas étendue aux invitations externes complexes.
- Aucun domaine B4+ n’a été implémenté.
