# B2 ACCEPTED — Biens, titulaires et ayants droit

**Date :** 26 septembre 2026  
**Périmètre :** B2 uniquement  
**Décision :** implémentation terminée ; certification CI finale obligatoire avant fusion.

## Existant réutilisé

- Supabase Auth, profiles et préférences B1 ;
- architecture UI → repository → Supabase ;
- design system, AppLayout, routes et i18n ;
- aucune modification du modèle Dossier historique.

## Décision d’identité externe

Le blueprint demandait `bien_right_holders.person_id` sans fournir de modèle pour une personne non inscrite.

La décision validée est un registre minimal `persons` :

- aucun faux compte Auth ;
- lien facultatif vers `profiles` pour une personne inscrite ;
- identité déclarée distincte de l’accompagnateur ;
- visibilité limitée par RLS.

## Base de données

Migration :

- `20260925000100_b2_biens_right_holders.sql`.

Tables :

- `persons` ;
- `biens` ;
- `bien_right_holders`.

Le Bien est durable et distinct d’une procédure ou d’un Dossier.

Contextes explicites :

- propre bien ;
- proche accompagné ;
- bien familial.

La création atomique enregistre le créateur, le Bien, la personne concernée et la première relation déclarée.

## Responsabilités et sécurité

- le créateur n’est titulaire que dans le cas « propre bien » choisi explicitement ;
- l’accompagnateur ne remplace jamais la personne concernée ;
- une relation déclarée n’est pas présentée comme un droit juridique officiel ;
- statut vérifié impossible à attribuer par un utilisateur ordinaire ;
- doublons actifs empêchés ;
- archivage avec timestamp, sans suppression physique ;
- ajout et révocation de relations via RPC contrôlées ;
- RLS deny-by-default pour personnes, Biens et relations.

## Couche applicative

- types Supabase B2 ;
- types de domaine dérivés ;
- repository `biens.repo.ts` ;
- création, lecture, mise à jour, archivage ;
- consultation, ajout et révocation des titulaires déclarés ;
- aucun appel Supabase dans les composants.

## Interface minimale

Routes :

- `/biens` ;
- `/biens/new` ;
- `/biens/:id`.

L’interface permet :

- de choisir le contexte de création ;
- d’enregistrer le Bien et sa localisation ;
- d’identifier un titulaire externe ;
- d’afficher séparément créateur et titulaires ;
- de rappeler le caractère déclaratif des informations.

La navigation principale n’a pas été reconstruite. Un raccourci a été ajouté au Profil existant.

## Tests

Les tests pgTAP B2 couvrent :

- création atomique ;
- propre Bien ;
- proche accompagné ;
- distinction créateur/titulaire ;
- doublons ;
- auto-vérification interdite ;
- isolation d’un utilisateur étranger ;
- lecture légitime par un ayant droit inscrit ;
- impossibilité d’archiver par un simple titulaire.

## Frontière

Aucun Dossier B3, parcours, acteur, document, accès, message ou signalement n’a été créé ou modifié.

**B3 ne doit commencer qu’après fusion volontaire de la PR B2.**
