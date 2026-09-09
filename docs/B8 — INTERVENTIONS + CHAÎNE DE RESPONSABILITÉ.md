# B8 — INTERVENTIONS + CHAÎNE DE RESPONSABILITÉ

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B7 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- anciennes interventions Agent ;
- validations d'étapes ;
- signatures ;
- historique Dossier ;
- `dossier_steps` ;
- `dossier_participants` ;
- `actors` ;
- Access Grants ;
- composants Timeline ;
- hooks/services associés ;
- logique de validation existante ;
- migrations/RLS.

Réutilise ce qui existe.

Ne crée pas un deuxième historique d'interventions.

---

# 2. OBJECTIF B8

Finaliser uniquement :

1. `dossier_interventions` ;
2. chaîne de responsabilité ;
3. relation Intervention ↔ Étape ;
4. rôle réel de l'intervenant ;
5. action réellement réalisée ;
6. intervention pour le compte d'une autre personne ;
7. validation/verification des interventions ;
8. progression éventuelle d'une étape ;
9. UI timeline ;
10. RLS + tests.

Ne touche pas encore :

- Communications complètes ;
- Signalements ;
- Audit global B11 ;
- Offline Sync complet.

---

# 3. TABLE `dossier_interventions`

Créer ou compléter.

Champs minimum :

```text
id
dossier_id
step_id
actor_id nullable
participant_id nullable
performed_by
on_behalf_of nullable
role
action_type
territorial_level
verification_status
comment nullable
performed_at
created_at
supersedes_intervention_id nullable
```

Une intervention appartient toujours à un Dossier.

Elle appartient normalement à une étape lorsque l'action concerne le parcours.

---

# 4. ACTIONS D'INTERVENTION

Utiliser un type contrôlé.

Minimum :

```text
declare
accompagne
constate
temoigne
signe
verifie
valide
enregistre
transmis
recu
corrige
```

Ne pas utiliser automatiquement :

```text
approuve
```

pour toute action.

Le libellé doit correspondre à ce qui a réellement été fait.

---

# 5. RÔLE DE L'INTERVENANT

Conserver le rôle utilisé au moment de l'intervention.

Exemples :

```text
titulaire
accompagnateur
temoin
professionnel
service
autorite
```

Ne déduis pas toute la responsabilité uniquement depuis `actor_type`.

---

# 6. `performed_by` VS `on_behalf_of`

Toujours distinguer :

```text
performed_by
```

= personne ayant effectué l'action dans l'application.

```text
on_behalf_of
```

= personne pour laquelle l'action est réalisée, si applicable.

Exemple :

```text
Titulaire : Jeanne
Action saisie par : Paul
Pour le compte de : Jeanne
Rôle de Paul : accompagnateur
```

Paul ne devient jamais titulaire.

---

# 7. NIVEAU TERRITORIAL

Chaque intervention conserve le niveau où elle a eu lieu :

```text
local
rural
arrondissement
departement
region
national
autre
```

Réutilise le type territorial existant.

Ne duplique pas un nouvel enum.

---

# 8. STATUT DE VÉRIFICATION

Valeurs :

```text
declare
a_verifier
verifie
conteste
invalide
```

Une intervention enregistrée n'est pas automatiquement vérifiée.

Un utilisateur ne peut pas transformer librement sa propre intervention en `verifie`.

---

# 9. RELATION AVEC ACCESS GRANTS

Avant intervention d'un acteur externe :

vérifier qu'il possède :

- relation légitime au Dossier ;
- ou Access Grant actif ;
- scope `intervenir`.

Un professionnel vérifié sans Grant ne peut pas intervenir sur un Dossier privé.

---

# 10. RELATION AVEC `dossier_steps`

Une intervention peut influencer une étape.

Exemple :

```text
Étape en cours
↓
intervention attendue
↓
intervention enregistrée
↓
conditions vérifiées
↓
étape éventuellement terminée
```

Ne fais jamais :

```text
intervention créée = étape terminée automatiquement
```

sauf si la règle de procédure l'autorise explicitement.

---

# 11. CONDITIONS DE FIN D'ÉTAPE

Créer une logique métier testable.

Conceptuellement :

```ts
canCompleteStep(step, interventions, documents, context)
```

Cette logique peut vérifier :

- intervention attendue ;
- compétence requise ;
- documents requis ;
- statut de vérification ;
- autres conditions B4.

Ne place pas cette logique dans React.

---

# 12. INTERVENTION PROFESSIONNELLE

Si une étape exige une compétence :

vérifier :

```text
acteur
+
compétence
+
habilitation si nécessaire
+
access grant
```

avant d'accepter l'intervention comme satisfaisant la condition.

---

# 13. INTERVENTION D'ACCOMPAGNATEUR

Un accompagnateur peut enregistrer :

```text
accompagne
declare
transmis
```

ou autres actions autorisées.

Il ne peut pas utiliser automatiquement :

```text
valide
verifie
```

si son rôle ne l'autorise pas.

---

# 14. INTERVENTION D'UN TÉMOIN

Le témoin doit voir uniquement :

- contexte nécessaire ;
- fait concerné ;
- action demandée.

Il peut enregistrer une intervention du type :

```text
temoigne
constate
```

selon le cas.

Pas d'accès global au Dossier.

---

# 15. INTERVENTION D'UN SERVICE / AUTORITÉ

L'UI doit identifier clairement :

```text
Service / Autorité
Niveau territorial
Étape concernée
Action réalisée
Statut
Date
```

Ne donne pas de statut officiel si le compte/service n'est pas vérifié conformément à B5.

---

# 16. CORRECTION D'UNE INTERVENTION

Ne jamais écraser silencieusement une intervention importante.

Pour corriger :

- créer une nouvelle intervention ;
- conserver l'ancienne ;
- renseigner `supersedes_intervention_id` si nécessaire.

L'historique doit rester reconstructible.

---

# 17. UI — DÉTAIL DOSSIER

Réutilise `/cas/:id`.

Ajouter/compléter :

## Personnes et services impliqués

et :

## Historique des interventions

Afficher par étape :

```text
✓ Niveau rural
  Jean N.
  Rôle : témoin
  Action : témoignage enregistré
  Statut : vérifié
  Date : ...

✓ Arrondissement
  Service X
  Action : document reçu
  Statut : à vérifier
```

---

# 18. UI — VUE SIMPLE

En mode Rural essentiel :

ne montre pas les champs techniques.

Afficher :

```text
Cette personne est intervenue.

Jean N.
Témoin

Il a confirmé cette étape.

✓ Terminé
```

Puis :

```text
Prochaine étape :
...
```

---

# 19. UI — VUE COMPLÈTE

En mode complet, permettre :

- filtre par étape ;
- filtre par acteur ;
- filtre par niveau ;
- statut de vérification ;
- date ;
- détails ;
- intervention remplacée/corrigée.

---

# 20. FICHE ACTEUR DANS LE DOSSIER

Lorsqu'un utilisateur ouvre un intervenant, afficher :

- identité ;
- rôle dans ce Dossier ;
- niveau territorial ;
- compétences ;
- statut de vérification ;
- interventions réalisées sur ce Dossier.

Ne montre pas ses autres dossiers privés.

---

# 21. CRÉATION D'INTERVENTION

Réutiliser Sheet/Dialog/Drawer existant.

Flow :

1. étape concernée ;
2. action réalisée ;
3. commentaire facultatif ;
4. document/preuve associé si déjà disponible ;
5. confirmation.

Les champs affichés dépendent du rôle.

Ne montre pas toutes les actions possibles à tous les utilisateurs.

---

# 22. APPLICATION LAYER

Créer/compléter si nécessaire :

```text
application/dossier-intervention/
```

Responsabilité :

orchestrer :

```text
Dossier
+
Step
+
Actor
+
Access
+
Competence
+
Intervention
```

Les composants UI ne font pas cette orchestration.

---

# 23. REPOSITORY / SERVICE

Exposer conceptuellement :

```ts
createIntervention(...)
getInterventionsForDossier(...)
getInterventionsForStep(...)
getInterventionsForActor(...)
canActorIntervene(...)
canCompleteStep(...)
correctIntervention(...)
```

Réutilise les repositories existants.

---

# 24. RLS — `dossier_interventions`

**DENY BY DEFAULT**

SELECT :

utilisateur autorisé à voir le Dossier et l'intervention.

INSERT :

uniquement si :

- utilisateur authentifié ;
- relation/Grant valide ;
- scope approprié ;
- rôle compatible avec l'action.

UPDATE :

très restreint.

Éviter la modification destructive.

DELETE :

interdit ou réservé à des cas administratifs exceptionnels.

---

# 25. PROTECTION DES ACTIONS SENSIBLES

Les actions suivantes doivent être particulièrement protégées :

```text
verifie
valide
enregistre
```

Le backend doit vérifier :

- type d'acteur ;
- compétence ;
- statut de vérification ;
- habilitation si nécessaire ;
- étape concernée.

Le frontend seul ne décide jamais.

---

# 26. TRANSITIONS D'ÉTAPE

Les transitions de `dossier_steps` provoquées par une intervention doivent passer par une logique backend/service contrôlée.

Éviter :

```text
update dossier_steps
set status = 'terminee'
```

directement depuis un composant.

---

# 27. INDEXES

Prévoir selon les requêtes réelles :

```text
dossier_interventions.dossier_id
dossier_interventions.step_id
dossier_interventions.actor_id
dossier_interventions.performed_by
dossier_interventions.action_type
dossier_interventions.verification_status
dossier_interventions.performed_at
```

---

# 28. CONTRAINTES

Garantir :

- Dossier valide ;
- Step appartenant au Dossier ;
- Actor/Participant cohérent ;
- niveau territorial valide ;
- action valide ;
- correction liée à une intervention existante ;
- pas d'auto-vérification non autorisée.

---

# 29. TESTS UNITAIRES

Tester au minimum :

- intervention titulaire ;
- intervention accompagnateur ;
- intervention témoin ;
- intervention professionnel ;
- vérification compétence ;
- Grant manquant ;
- Grant expiré ;
- intervention corrigée ;
- calcul de fin d'étape ;
- rôle non autorisé.

---

# 30. TESTS RLS / INTÉGRATION

Scénarios minimum :

1. utilisateur non autorisé ne voit pas les interventions ;
2. accompagnateur sans scope `intervenir` ne crée rien ;
3. acteur avec scope approprié peut intervenir ;
4. acteur non habilité ne peut pas effectuer une action protégée ;
5. utilisateur ne peut pas se vérifier lui-même ;
6. intervention ancienne reste après correction ;
7. étape ne se termine pas sans conditions requises ;
8. autre acteur ne peut pas modifier l'intervention d'un tiers.

---

# 31. COMPATIBILITÉ AVEC L'EXISTANT

Si l'ancien code possède :

```text
acceptedAgent
agentIntervention
signatures[]
history[]
```

ne supprime rien brutalement.

Identifier ce qui correspond à :

- participant ;
- actor ;
- intervention ;
- document ;
- futur audit.

Migrer uniquement ce qui est nécessaire pour B8.

Si la migration est destructive ou massive :

STOP et rapporte l'impact.

---

# 32. UI / UX

Respecte le Design System existant.

Mobile-first.

Toujours privilégier :

```text
Qui ?
A fait quoi ?
À quelle étape ?
Quand ?
Quel est le statut ?
```

Évite de montrer du jargon technique à l'utilisateur essentiel.

---

# 33. VALIDATION B8

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- intervention créée ;
- responsabilités conservées ;
- `performed_by` et `on_behalf_of` distincts ;
- rôle conservé ;
- niveau territorial conservé ;
- compétence/habilitation vérifiée pour actions protégées ;
- Access Grant respecté ;
- timeline Dossier fonctionnelle ;
- correction sans destruction historique ;
- transitions d'étape contrôlées ;
- aucun appel Supabase dans composants ;
- aucun domaine B9+ implémenté.

---

# 34. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. ancien historique/interventions adaptés ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. RLS ;
7. services/application layer ;
8. UI adaptée ;
9. tests exécutés ;
10. écarts éventuels.

**Ne commence pas B9.**