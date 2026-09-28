# C1 — Convergence corrective avant B12

**Date :** 28 septembre 2026  
**Périmètre :** corrections de convergence uniquement  
**Statut :** implémenté et certifié par la CI Quality #180

## Objectif

Fermer les écarts identifiés après l’audit global sans démarrer B12 et sans introduire de nouveau domaine métier.

## Corrections livrées

- les raccourcis de création utilisent des types de dossier canoniques ;
- la page de création honore le paramètre `?type=` et conserve un repli sûr ;
- l’onboarding utilise le type `protection` pour le raccourci foncier ;
- le commentaire du routeur reflète les protections réellement appliquées ;
- l’historique B11 est internationalisé en français et en anglais ;
- les événements d’audit manquants couvrent :
  - document ajouté, version ajoutée et document vérifié ;
  - acteur, compétence et habilitation vérifiés, suspendus ou révoqués ;
  - procédure publiée ou archivée ;
- tous les événements réutilisent `audit_events`, `record_audit_event` et `b11_audit` ;
- les helpers d’écriture d’audit restent inaccessibles aux clients authentifiés ;
- la documentation d’état distingue les blocs complets, partiels et non commencés.

## Frontière maintenue

C1 ne développe aucune fonctionnalité B12. La synchronisation hors ligne complète, les conflits, retries, dead-letter et reprises restent dans le prochain bloc.

## Validation attendue

- TypeScript, lint, tests unitaires et build ;
- reset Supabase sur base vide ;
- suite SQL/RLS complète ;
- tests C1 sur les événements et les privilèges ;
- PR verte avant toute fusion explicite.

## Résultat de certification

- `npm run check` : succès ;
- reset complet Supabase et application de toutes les migrations : succès ;
- 15 fichiers pgTAP, 323 assertions SQL/RLS : succès ;
- fusion non effectuée : validation explicite du propriétaire requise.
