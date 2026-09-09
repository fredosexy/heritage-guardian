# B4 — PROCEDURE DEFINITIONS + PARCOURS + ÉTAPES DOSSIER

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 Auth + Profiles + Usage Preferences est terminé.  
B2 Biens + Titulaires / Ayants droit est terminé.  
B3 Dossiers + Participants est terminé.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Avant toute modification, inspecte :

- anciens `PARCOURS` constants ;
- logique Stepper/Wizard ;
- types `parcours`, `etape`, `procedure` ;
- `/procedure` ;
- détail Dossier ;
- hooks/services liés au parcours ;
- éventuelles tables procedure/steps ;
- logique hardcodée selon acquisition/localisation ;
- RLS existante ;
- tests existants.

Compare avec B4.

Si une logique équivalente existe : migre/réutilise-la.

Ne crée pas un deuxième moteur de parcours.

---

# 2. OBJECTIF B4

Finaliser uniquement :

1. définitions de procédures versionnées ;
2. étapes de procédure ;
3. instance de parcours par Dossier ;
4. progression des étapes ;
5. prochaine étape ;
6. niveau territorial ;
7. moteur de parcours testable ;
8. RLS ;
9. UI minimale de parcours.

Ne touche pas encore :

- Acteurs professionnels complets ;
- habilitations ;
- Documents production ;
- Interventions ;
- Access Grants ;
- Communications ;
- Signalements.

---

# 3. TABLE `procedure_definitions`

Créer ou compléter.

Champs minimum :

```text
id
code
dossier_type
territory
version
status
source_reference nullable
valid_from nullable
valid_until nullable
verified_by nullable
verified_at nullable
created_at
updated_at
```

Statuts :

```text
draft
a_verifier
validee
publiee
archivee
```

Une procédure publiée doit être versionnée.

Ne jamais écraser silencieusement une ancienne version utilisée par des dossiers existants.

---

# 4. TABLE `procedure_steps`

Relation :

```text
procedure_definitions 1 → N procedure_steps
```

Champs minimum :

```text
id
procedure_id
step_order
code
title
short_description
territorial_level
required_competence nullable
is_optional
rules_json nullable
created_at
updated_at
```

Niveaux possibles :

```text
local
rural
arrondissement
departement
region
national
autre
```

Toutes les procédures ne doivent pas utiliser tous les niveaux.

---

# 5. `rules_json`

Utiliser uniquement pour des conditions simples et configurables.

Exemples :

```text
type de bien
mode d'acquisition
localisation
présence d'un élément
condition d'affichage
```

Ne mets pas tout le moteur métier dans un énorme JSON.

Les règles complexes doivent rester dans une couche métier testable.

---

# 6. TABLE `dossier_steps`

Chaque Dossier possède ses propres étapes.

Relation :

```text
dossiers 1 → N dossier_steps
```

Champs minimum :

```text
id
dossier_id
procedure_step_id nullable
step_order
title
short_description
territorial_level
status
started_at nullable
completed_at nullable
blocked_reason nullable
created_at
updated_at
```

Statuts :

```text
a_faire
en_cours
terminee
bloquee
a_verifier
```

---

# 7. PROCÉDURE APPLIQUÉE AU DOSSIER

Un Dossier doit pouvoir conserver la version de procédure utilisée.

Ajouter ou réutiliser une relation explicite, par exemple :

```text
dossiers.procedure_definition_id
```

ou une table dédiée si l'existant le justifie.

Important :

si une procédure passe de version 2 à version 3, un Dossier en cours ne doit pas changer silencieusement de parcours.

Toute migration vers une nouvelle version doit être explicite.

---

# 8. MOTEUR DE PARCOURS

Créer ou compléter une couche métier testable.

Entrées conceptuelles :

```text
Dossier
Bien
ProcedureDefinition
ProcedureSteps
contexte utilisateur pertinent
```

Sorties :

```text
étapes applicables
étape actuelle
prochaine étape
étapes bloquées
progression
```

Le moteur ne doit pas :

- rendre de React ;
- appeler directement Supabase ;
- modifier la base ;
- connaître le Design System.

---

# 9. INITIALISATION DU PARCOURS

Lorsqu'un Dossier reçoit une procédure :

1. charger la définition publiée/appropriée ;
2. calculer les étapes applicables ;
3. créer les `dossier_steps` ;
4. conserver leur ordre ;
5. définir la première étape active.

Ne recrée pas les étapes à chaque chargement de page.

Le parcours est une instance persistée.

---

# 10. PROGRESSION

Prévoir des transitions contrôlées :

```text
a_faire → en_cours
en_cours → terminee
en_cours → bloquee
bloquee → en_cours
terminee → a_verifier
a_verifier → terminee
```

Adapter seulement si le modèle existant justifie d'autres transitions.

Éviter les changements arbitraires de statut depuis le frontend.

---

# 11. PROCHAINE ÉTAPE

Créer un selector/service permettant de déterminer :

```text
currentStep
nextStep
completedSteps
blockedSteps
progressPercent
```

La Home et `/cas/:id` doivent réutiliser ce calcul.

Ne duplique pas la logique dans plusieurs composants.

---

# 12. NIVEAU TERRITORIAL

Chaque étape doit préciser son niveau.

Exemple conceptuel :

```text
Rural
↓
Arrondissement
↓
Département
↓
Région
```

Mais le système doit supporter :

- étape sautée ;
- étape optionnelle ;
- procédure sans certains niveaux ;
- autre niveau compétent.

Ne code pas une séquence territoriale fixe dans les composants.

---

# 13. LANGAGE UTILISATEUR

Les titres techniques peuvent être précis en backend.

L'UI doit pouvoir afficher une version simplifiée.

Exemple :

Technique :

```text
verification_documentaire_arrondissement
```

UI essentiel :

```text
Faites vérifier vos documents à cette étape.
```

Prévoir des champs ou un mapping propre pour les libellés utilisateurs.

Ne mélange pas les textes UI dans le moteur métier.

---

# 14. SOURCE ET VALIDATION

Une procédure peut être :

```text
draft
a_verifier
validee
publiee
archivee
```

Seule une procédure appropriée au contexte produit doit pouvoir être utilisée automatiquement.

Ne considère jamais un ancien `PARCOURS` hardcodé comme source officielle par défaut.

Si les anciennes règles existent encore, migre-les progressivement vers le nouveau système uniquement si elles sont validées pour production.

---

# 15. RLS — `procedure_definitions`

Lecture :

- procédures publiées accessibles selon le besoin produit ;
- drafts réservés aux rôles autorisés.

Création/modification/publication :

uniquement rôles administratifs/procedure editors autorisés.

Un utilisateur ordinaire ne peut pas publier une procédure.

---

# 16. RLS — `procedure_steps`

Même logique que la procédure parente.

Un utilisateur ordinaire ne peut pas modifier les étapes de référence.

---

# 17. RLS — `dossier_steps`

SELECT :

utilisateur autorisé à voir le Dossier.

UPDATE :

uniquement selon permissions métier.

Un utilisateur ne doit pas pouvoir marquer arbitrairement une étape comme `terminee` si cette transition nécessite plus tard une intervention ou validation spécifique.

Pour B4, protéger au minimum les transitions côté backend/service.

---

# 18. FRONTEND `/cas/:id`

Réutilise le détail Dossier existant.

Ajouter une section :

**Mon parcours**

Afficher :

```text
étape terminée
étape actuelle
prochaine étape
étape bloquée éventuelle
```

En mode essentiel :

```text
Tu es ici
↓
Voici ce qui est terminé
↓
Voici ce que tu dois faire maintenant
```

Une seule action principale.

---

# 19. TIMELINE MODE STANDARD / COMPLET

Afficher une timeline cohérente :

```text
✓ Étape 1
  Niveau rural

✓ Étape 2
  Arrondissement

● Étape 3
  En cours

○ Étape 4
  À faire
```

Ne mélange pas encore les futurs Acteurs/Interventions détaillés.

Ils viendront dans les blocs suivants.

---

# 20. PAGE `/procedure`

Réutilise la page existante.

Elle peut maintenant afficher les définitions de procédure publiées :

- par type de Dossier ;
- territoire ;
- niveaux ;
- étapes.

Ne duplique pas les étapes dans une liste statique locale.

---

# 21. ORIENTATION / CRÉATION DOSSIER

Si le flow `/cas/nouveau` existe déjà :

après identification de l'intention et création du Dossier, associer la procédure appropriée uniquement si les données nécessaires sont disponibles.

Ne reconstruis pas le Wizard.

Ajoute seulement l'orchestration nécessaire.

---

# 22. APPLICATION LAYER

Si nécessaire, créer ou compléter :

```text
application/dossier-parcours/
```

Responsabilité :

orchestrer :

```text
Dossier
+
Bien
+
Procedure Definition
+
Dossier Steps
```

Ne place pas cette orchestration dans `features/dossiers/components`.

---

# 23. REPOSITORIES / SERVICES

Exposer conceptuellement :

```ts
getProcedureForDossier(...)
getProcedureDefinition(...)
getProcedureSteps(...)

initializeDossierJourney(...)
getDossierSteps(...)
startStep(...)
completeStep(...)
blockStep(...)
getJourneySummary(...)
```

Respecter les services/repositories existants si équivalents.

---

# 24. COMPATIBILITÉ AVEC ANCIEN `PARCOURS`

Si le projet possède :

```text
parcours.constants.ts
PARCOURS
parcours_recommande
```

ne le supprime pas brutalement.

Identifier :

- ce qui est encore utilisé ;
- ce qui est production-ready ;
- ce qui doit être migré ;
- ce qui doit être déprécié.

Si une suppression importante casse plusieurs features, STOP et rapporte-la avant modification.

---

# 25. PAS DE LOGIQUE UI DUPLIQUÉE

Ne calcule pas séparément :

```text
progressPercent
nextStep
currentStep
```

dans :

- Home ;
- DossierCard ;
- détail Dossier ;
- `/procedure`.

Créer une seule logique réutilisable.

---

# 26. TYPES

Utiliser :

- types Supabase générés pour persistence ;
- types métier dédiés seulement si nécessaires ;
- mapping explicite.

Ne duplique pas :

```text
ProcedureStatus
StepStatus
TerritorialLevel
```

dans plusieurs fichiers.

---

# 27. INDEXES

Prévoir selon requêtes réelles :

```text
procedure_definitions.dossier_type
procedure_definitions.status
procedure_definitions.territory

procedure_steps.procedure_id
procedure_steps.step_order

dossier_steps.dossier_id
dossier_steps.status
dossier_steps.step_order
```

---

# 28. CONTRAINTES

Garantir :

- ordre valide ;
- FK correctes ;
- version cohérente ;
- une étape appartient à la bonne procédure ;
- pas de duplication incohérente d'étape ;
- transition de statut contrôlée.

---

# 29. TESTS UNITAIRES

Tester au minimum :

- choix de procédure ;
- génération des étapes ;
- étapes optionnelles ;
- prochaine étape ;
- progression ;
- dossier bloqué ;
- version de procédure ;
- ordre territorial.

---

# 30. TESTS RLS / INTÉGRATION

Tester :

- utilisateur autorisé lit le parcours de son Dossier ;
- utilisateur non autorisé ne le lit pas ;
- utilisateur ordinaire ne modifie pas une procédure de référence ;
- procédure draft non exposée publiquement ;
- ancienne version reste intacte après publication d'une nouvelle version.

---

# 31. VALIDATION B4

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- procédure versionnée ;
- étapes persistées ;
- Dossier lié à sa version de procédure ;
- parcours initialisé ;
- prochaine étape correcte ;
- timeline `/cas/:id` fonctionnelle ;
- `/procedure` réutilise les données production ;
- aucun moteur dupliqué ;
- aucun appel Supabase dans les composants ;
- aucune règle métier critique dans JSX ;
- aucun domaine B5+ implémenté.

---

# 32. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. anciennes règles de parcours identifiées ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. tables/relations ;
7. RLS ;
8. moteur de parcours ;
9. pages adaptées ;
10. tests ;
11. éléments anciens encore à migrer.

**Ne commence pas B5.**