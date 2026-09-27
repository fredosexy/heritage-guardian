# B8 ACCEPTED — Interventions et chaîne de responsabilité

**Date :** 27 septembre 2026  
**Périmètre :** B8 uniquement  
**Décision :** implémentation à certifier avant fusion volontaire.

## 1. Existant réutilisé

- dossiers et participants B3 ;
- étapes persistantes et procédures B4 ;
- acteurs, compétences et habilitations B5 ;
- documents B6 ;
- Access Grants et scope `intervenir` B7 ;
- page dossier, timeline de parcours, Design System et i18n.

Aucun ancien modèle canonique d’intervention, signature ou historique équivalent n’existait.

## 2. Modèle

La migration `20260927000100_b8_interventions.sql` ajoute `dossier_interventions`.

Chaque ligne conserve le dossier, l’étape, l’acteur ou participant, l’utilisateur ayant saisi l’action, la personne représentée, le rôle utilisé, l’action réelle, le niveau territorial, le statut, la date et l’éventuelle intervention remplacée.

## 3. Responsabilité

`performed_by` et `on_behalf_of` restent distincts. Un accompagnateur ne devient jamais titulaire. Le rôle est figé au moment de l’intervention.

Une correction crée une nouvelle ligne avec `supersedes_intervention_id`. L’ancienne intervention n’est ni modifiée ni supprimée.

## 4. Autorisation

Le backend vérifie :

- relation active au dossier ou Grant B7 actif avec scope `intervenir` ;
- cohérence du dossier, de l’étape, de l’acteur et du participant ;
- compatibilité rôle/action ;
- acteur vérifié, compétence vérifiée et habilitation valide pour les actions sensibles ;
- interdiction de l’auto-vérification ;
- expiration et révocation des Grants.

Les écritures directes sont interdites. Les workflows passent par des RPC `SECURITY DEFINER` contrôlées.

## 5. Étapes

`can_complete_dossier_step` évalue les interventions vérifiées et les règles de procédure. Créer une intervention ne termine jamais automatiquement une étape.

La fin d’étape passe exclusivement par `complete_dossier_step_from_interventions`. Le bouton historique de terminaison directe a été supprimé.

## 6. Application

- `src/services/intervention-engine.ts` : règles pures et testables ;
- `src/data/interventions.repo.ts` : accès aux workflows backend ;
- `src/features/interventions/` : timeline et saisie contextuelle ;
- intégration dans `/cas/:id` sans appel Supabase dans React.

## 7. Interface

La page dossier affiche :

- l’étape concernée ;
- l’action réellement réalisée ;
- le rôle ;
- le niveau territorial ;
- le statut de vérification ;
- la date et le commentaire ;
- le lien de correction lorsqu’il existe.

Les actions proposées dépendent du rôle. La fin d’étape explique lorsque les conditions sont insuffisantes.

## 8. Tests

Couverture prévue :

- règles unitaires par rôle ;
- intervention professionnelle avec et sans Grant ;
- compétence et habilitation ;
- action sensible à vérifier ;
- auto-vérification refusée ;
- isolation multi-utilisateur ;
- correction non destructive ;
- Grant expiré ;
- transition d’étape conditionnelle ;
- interdiction des mutations directes.

## 9. Frontière

B8 n’ajoute ni communications B9, ni signalements B10, ni journal d’audit global B11, ni synchronisation offline complète B12.
