# B1 ACCEPTED — Identité, profil et préférences d’usage

**Date :** 24 septembre 2026  
**Périmètre :** B1 uniquement  
**Décision :** implémentation B1 terminée et certifiée par le workflow Quality.

## Existant réutilisé

- Supabase Auth et son stockage de session ;
- source unique `AuthProvider` / `useAuth()` ;
- table `profiles` et création backend via `handle_new_user()` ;
- repository et hook profil ;
- onboarding patrimonial existant ;
- page Profil, design system et traductions ;
- transfert des données locales après connexion.

## Base de données

Migration :

- `20260924000400_b1_usage_preferences.sql`.

Ajouts :

- statut contrôlé du profil ;
- table 1–1 `usage_preferences` ;
- valeurs contrôlées pour contexte, assistance, interface, audio et accompagnement ;
- préférences neutres pour les comptes existants ;
- création automatique des préférences pour chaque nouveau compte ;
- trigger `updated_at`.

Le contexte rural ne déclenche jamais automatiquement le mode assisté.

## Sécurité et RLS

- deny by default ;
- lecture des préférences limitée au propriétaire ;
- insertion et modification limitées au propriétaire ;
- aucune lecture croisée ;
- statut du profil non modifiable par un utilisateur ordinaire ;
- révocation des autres sessions disponible depuis le profil ;
- récupération du compte par lien Supabase sécurisé.

## Frontend

- repository `usage-preferences.repo.ts` ;
- hook `useUsagePreferences()` ;
- aucun appel Supabase ajouté dans les composants de préférences ;
- modes Rural essentiel, Rural autonome et Moderne ;
- réglages unitaires persistés immédiatement ;
- onboarding progressif sans formulation stigmatisante ;
- parcours patrimonial existant conservé après les questions d’usage ;
- textes français et anglais.

Les préférences modifient uniquement l’expérience. Elles n’accordent aucun droit métier.

## Tests

Workflow Quality validé :

- `npm ci` ;
- contrôle statique Phase 0 ;
- TypeScript ;
- ESLint ;
- tests unitaires ;
- build production ;
- démarrage Supabase local ;
- reset complet des migrations ;
- tests pgTAP Phase 0 et B1.

Le test B1 couvre deux utilisateurs, la création automatique, les valeurs par défaut, la mise à jour propriétaire, l’isolation croisée, les policies et la protection du statut.

## Frontière

Aucun modèle Bien, titulaire, ayant droit, dossier B2/B3, acteur, document ou communication n’a été ajouté.

**B2 ne doit commencer qu’après fusion volontaire de la PR B1.**
