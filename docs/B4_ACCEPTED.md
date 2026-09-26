# B4 ACCEPTED — Procédures, parcours et étapes Dossier

**Date :** 26 septembre 2026  
**Périmètre :** B4 uniquement  
**Décision :** implémentation et certification terminées ; fusion volontaire requise avant B5.

## 1. Existant réutilisé

- Dossiers, Biens et responsabilités B2/B3 ;
- détail `/dossiers/:id`, création Dossier et architecture UI → hook → repository → Supabase ;
- rôles administratifs et fonction `has_role` existants ;
- Design System, i18n et mécanisme de CI ;
- stepper d’onboarding conservé séparément, car il ne constitue pas un parcours métier.

## 2. Anciennes règles identifiées

Aucun ancien `PARCOURS`, `parcours_recommande`, table procédure ou moteur métier n’existait dans le code. Aucune règle hardcodée n’a donc été promue comme référence officielle.

## 3. Base de données

Migration :

- `20260926000200_b4_procedures_journeys.sql`.

Tables :

- `procedure_definitions` ;
- `procedure_steps` ;
- `dossier_steps`.

Relation ajoutée :

- `dossiers.procedure_definition_id`.

Une définition est identifiée par `code + version`. Un Dossier conserve explicitement la version choisie et ne migre jamais automatiquement lors de la publication d’une version supérieure.

## 4. RLS et responsabilités

- procédures publiées lisibles ;
- brouillons visibles uniquement par les administrateurs ;
- création et modification des références réservées aux administrateurs ;
- parcours Dossier lisible uniquement par les utilisateurs autorisés à voir le Dossier ;
- aucune mise à jour directe de `dossier_steps` par le frontend ;
- initialisation et transitions via RPC contrôlées ;
- matrice de transitions validée côté backend.

## 5. Moteur de parcours

Le moteur pur `journey-engine.ts` fournit :

- sélection de procédure publiée par type, territoire et version ;
- application des règles simples `bien_type` et `creation_context` ;
- ordre des étapes sans séquence territoriale figée ;
- étape actuelle et prochaine étape ;
- étapes terminées et bloquées ;
- progression en pourcentage ;
- validation des transitions.

Le moteur ne dépend ni de React ni de Supabase.

## 6. Initialisation persistée

`initialize_dossier_journey` :

1. verrouille et contrôle le Dossier ;
2. choisit une procédure publiée appropriée ;
3. fixe sa version dans le Dossier ;
4. filtre les étapes applicables ;
5. persiste les `dossier_steps` ;
6. démarre la première étape.

La création en ligne tente cette initialisation lorsque les données et une procédure publiée sont disponibles. L’absence de procédure publiée ne bloque pas la création du Dossier.

## 7. Interface

- section « Mon parcours » dans le détail Dossier ;
- timeline ordonnée avec niveau territorial et statut ;
- progression centralisée ;
- une seule action principale sur l’étape courante ;
- nouvelle page `/procedure` alimentée par les définitions publiées ;
- aucun tableau statique local de procédures.

## 8. Tests certifiés

La CI couvre :

- contrôle statique Phase 0 ;
- TypeScript ;
- lint ;
- tests unitaires ;
- build ;
- migrations sur base vide ;
- reset local complet ;
- pgTAP Phase 0, B1, B2, B3 et B4.

Scénarios B4 :

- sélection et version de procédure ;
- filtrage d’étape optionnelle ;
- ordre territorial ;
- progression et prochaine étape ;
- transition invalide refusée ;
- blocage avec motif ;
- isolation multi-utilisateur ;
- brouillon non exposé ;
- utilisateur ordinaire incapable de modifier les références ;
- version 1 conservée après publication de la version 2.

## 9. Éléments anciens restant à migrer

Aucun ancien moteur de parcours n’a été trouvé. Les statuts historiques de Dossier restent uniquement en compatibilité B3 et ne sont pas réutilisés par B4.

## 10. Frontière

Aucun acteur professionnel complet, habilitation, document production, intervention, access grant, communication ou signalement B5+ n’a été implémenté.
