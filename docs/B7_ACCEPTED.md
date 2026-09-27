# B7 ACCEPTED — Demandes, autorisations et scopes d'accès

**Date :** 27 septembre 2026  
**Périmètre :** B7 uniquement  
**Décision :** implémentation terminée ; fusion volontaire requise avant B8.

## 1. Existant réutilisé

- propriété et participants Dossier B3 ;
- acteurs et vérification B5 ;
- documents versionnés et Storage privé B6 ;
- Auth, RLS, Design System, i18n et architecture repository.

Aucun ancien `DemandeAdhesion`, workflow de permission ou système de Grant n'existait. Aucun workflow parallèle n'a été conservé.

## 2. Modèle

Migration `20260926000500_b7_access_requests_grants.sql` :

- `access_requests` et `access_request_scopes` ;
- `access_grants` et `access_grant_scopes` ;
- `access_grant_documents` pour les pièces explicitement sélectionnées.

Une demande et une autorisation restent deux objets distincts. Les scopes accordés peuvent être plus limités que ceux demandés.

## 3. Scopes

Scopes contrôlés :

- voir le résumé ;
- voir des documents sélectionnés ;
- ajouter un document ;
- accompagner ;
- intervenir ;
- commenter.

Aucun rôle professionnel ou statut vérifié ne donne automatiquement accès à un Dossier privé.

## 4. Enforcement backend

Helpers centralisés :

- `has_active_grant` ;
- `has_scope` ;
- `can_access_document` ;
- projection minimale `get_granted_dossier_summary`.

Les Grants expirés ou révoqués cessent immédiatement d'être utilisables. Les documents non sélectionnés restent masqués. Le scope d'ajout documentaire est vérifié dans le workflow B6 et dans Storage.

## 5. Workflows

RPC contrôlées pour :

- demander un accès ;
- accepter ou refuser une demande ;
- réduire les scopes ;
- sélectionner les documents visibles ;
- annuler une demande ;
- révoquer une autorisation.

Le bénéficiaire ne peut ni augmenter ses scopes, ni prolonger sa durée, ni retirer une révocation.

## 6. Interface

La section « Accès et interventions » du Dossier propose :

- formulaire demandeur en langage simple ;
- demandes en attente ;
- portée demandée ;
- sélection explicite des documents ;
- acceptation ou refus ;
- accès actifs ;
- révocation.

Participants et Grants restent séparés.

## 7. Tests

La CI couvre :

- TypeScript, lint, tests unitaires et build ;
- migrations et reset Supabase ;
- professionnel vérifié sans Grant refusé ;
- scope résumé limité à une projection minimale ;
- réduction des scopes ;
- document sélectionné sans exposition des autres ;
- scope d'ajout appliqué côté backend ;
- expiration ;
- révocation immédiate ;
- impossibilité d'auto-augmenter les scopes ;
- compatibilité Phase 0 et B1 à B6.

## 8. Frontière

Aucune intervention métier complète B8, communication, signalement ou infrastructure d'audit globale n'a été implémentée.
