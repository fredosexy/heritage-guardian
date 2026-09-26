# B5 ACCEPTED — Acteurs, compétences et habilitations

**Date :** 26 septembre 2026  
**Périmètre :** B5 uniquement  
**Décision :** implémentation terminée et certification verte ; fusion volontaire requise avant B6.

## 1. Existant réutilisé

- profils et rôles B0–B3 ;
- niveau territorial déjà introduit par B4 ;
- `procedure_steps.required_competence` ;
- page `/procedure`, détail Dossier, design system, i18n et architecture repository ;
- aucune liste métier en dur.

## 2. Audit de l'ancien domaine Agents

Aucune table `agents`, feature `agents`, `AgentCard`, `ServiceCard` ou donnée professionnelle historique n'existait. Aucun renommage massif ni second référentiel n'a donc été créé.

## 3. Modèle B5

Migration `20260926000300_b5_actors_competences_credentials.sql` :

- `actors` : capacité d'intervention distincte du profil applicatif ;
- `actor_competences` : compétences déclarées ou vérifiées ;
- `actor_credentials` : justificatifs privés d'habilitation ;
- contraintes de statuts, unicité, expiration, suspension et clés étrangères ;
- indexes adaptés aux recherches par compétence, territoire et vérification.

## 4. Sécurité et vérification

- aucune auto-vérification ;
- acteur propriétaire limité à ses champs descriptifs et déclarations ;
- validation, suspension et révocation réservées aux administrateurs/modérateurs autorisés ;
- acteurs non publiés invisibles aux autres utilisateurs ;
- credentials invisibles au public, même validés ;
- workflows de vérification via RPC contrôlées.

## 5. Recommandation

Le moteur pur classe selon :

1. compétence utilisable ;
2. compétence et acteur vérifiés ;
3. niveau territorial ;
4. localisation ;
5. disponibilité.

Les acteurs suspendus, révoqués ou indisponibles sont exclus. Le mode essentiel limite le résultat à trois acteurs.

## 6. Interfaces

- `/procedure` conserve les guides B4 et ajoute l'annuaire unique ;
- recherche par nom/lieu ;
- filtres compétence et territoire ;
- statut acteur et statut de compétence distingués ;
- détail Dossier alimenté par le même repository pour l'étape courante ;
- aucun contact inventé ou exposé.

## 7. Tests certifiés

La CI valide :

- npm ci, contrôle statique, TypeScript, lint, tests unitaires et build ;
- reset complet d'une base vide et toutes les migrations ;
- pgTAP Phase 0 et B1 à B5 ;
- recherche/classement, compétence expirée, suspension, disponibilité et limite essentielle ;
- création acteur, déclaration compétence, soumission credential ;
- refus d'auto-vérification et d'accès croisé ;
- validation par rôle autorisé ;
- lecture publique limitée et confidentialité des credentials.

## 8. Frontière

Aucun document B6, access grant, intervention métier, communication, signalement ou système d'audit B11 n'a été implémenté.
