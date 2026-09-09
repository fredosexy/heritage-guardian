# B3 — DOSSIERS + PARTICIPANTS

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 Auth + Profiles + Usage Preferences est terminé.  
B2 Biens + Titulaires / Ayants droit est terminé.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Avant toute modification, inspecte :

- tables/migrations Dossier existantes ;
- types Dossier frontend/backend ;
- pages `/cas`, `/cas/nouveau`, détail dossier ;
- hooks/services/repositories Dossier ;
- participants/invitations existants ;
- relations User/Bien/Dossier ;
- RLS existante ;
- logique privée/publique déjà présente.

Compare l'existant avec B3.

Si une structure équivalente existe : adapte-la.

Ne crée pas une deuxième notion de Dossier.

---

# 2. OBJECTIF B3

Finaliser uniquement :

1. `dossiers` ;
2. relation Dossier → Bien ;
3. participants au Dossier ;
4. rôles dans un Dossier ;
5. visibilité ;
6. statuts ;
7. repositories/services ;
8. RLS ;
9. intégration frontend minimale.

Ne touche pas encore :

- moteur de Parcours ;
- Acteurs professionnels ;
- Documents ;
- Access Grants ;
- Communications ;
- Signalements.

---

# 3. TABLE `dossiers`

Créer ou compléter la table existante.

Champs minimum :

```text
id
bien_id
owner_id
type
visibility
status
completion_level
title
description nullable
created_at
updated_at
closed_at nullable
archived_at nullable
```

Relation :

```text
Bien 1 → N Dossiers
```

Types de Dossier :

```text
acquisition
achat
succession
heritage
protection
regularisation
partage
transmission
vente
autre
```

Ne mets pas encore dans `dossiers` :

- étapes détaillées ;
- documents ;
- interventions ;
- permissions temporaires ;
- messages.

---

# 4. VISIBILITÉ

Valeurs :

```text
prive
public
```

Important :

`public` ne signifie pas que toutes les données du Dossier deviennent publiques.

La visibilité publique doit ultérieurement exposer uniquement une projection explicitement autorisée.

Pour B3, garde le modèle prêt pour cette séparation.

---

# 5. STATUT DOSSIER

Utiliser des états précis :

```text
brouillon
actif
en_attente
bloque
a_verifier
a_completer
en_traitement
a_finaliser
clos
archive
```

Éviter de baser le domaine production sur :

```text
bonne / mauvaise
```

Si ces valeurs existent encore dans l'ancien code, conserver une compatibilité temporaire uniquement si nécessaire, sans les propager dans le nouveau modèle.

---

# 6. COMPLETION LEVEL

Prévoir un champ ou mécanisme cohérent pour représenter :

```text
debut
a_completer
a_verifier
partiellement_documente
bien_documente
parcours_avance
a_finaliser
```

Ce niveau est un indicateur applicatif.

Il ne constitue jamais une validation juridique.

---

# 7. TABLE `dossier_participants`

Créer ou compléter une relation dédiée.

Champs minimum :

```text
id
dossier_id
person_id
role
status
invited_by
created_at
accepted_at nullable
revoked_at nullable
```

Rôles :

```text
titulaire
ayant_droit
declarant
accompagnateur
temoin
professionnel
service
autorite
```

Statuts possibles :

```text
invite
actif
refuse
revoque
```

---

# 8. DISTINCTION DES RESPONSABILITÉS

Ne confonds jamais :

```text
User global
≠
Titulaire du Bien
≠
Participant du Dossier
≠
Propriétaire du Dossier
```

Exemple valide :

```text
Bien : Jeanne est titulaire

Dossier : créé par Paul

Paul : accompagnateur

Jeanne : titulaire + participante
```

Le code doit pouvoir représenter ce cas proprement.

---

# 9. CRÉATION D'UN DOSSIER

La création doit exiger au minimum :

- Bien concerné ;
- type de Dossier ;
- owner/responsable applicatif ;
- visibilité ;
- participants initiaux si disponibles.

Si le Dossier est créé pour une autre personne :

ne pas transformer automatiquement le créateur en titulaire.

---

# 10. OWNER DU DOSSIER

`owner_id` représente le responsable principal du Dossier dans l'application.

Ce champ ne signifie pas automatiquement :

- propriétaire juridique du Bien ;
- titulaire officiel.

La titularité du Bien reste dans B2.

---

# 11. PARTICIPANTS INITIAUX

Lors de la création :

si le Bien possède déjà des titulaires/ayants droit pertinents, le flow peut proposer de les associer au Dossier.

Ne duplique pas les personnes.

Créer seulement les relations `dossier_participants`.

---

# 12. REPOSITORY / SERVICE

Réutilise la couche existante.

Exposer conceptuellement :

```ts
createDossier(...)
getDossierById(...)
getDossiersForUser(...)
updateDossier(...)
archiveDossier(...)

addParticipant(...)
getParticipants(...)
updateParticipantStatus(...)
revokeParticipant(...)
```

Les composants ne parlent jamais directement à Supabase.

Flux :

```text
UI
↓
hook/application
↓
DossierRepository
↓
Supabase
```

---

# 13. FRONTEND `/cas`

Réutilise la page existante.

Ne la reconstruis pas.

Elle doit lire les Dossiers depuis la source production.

Afficher au minimum :

- titre ;
- type ;
- Bien concerné ;
- statut ;
- visibilité ;
- niveau de complétude ;
- prochaine information simple si déjà disponible.

Aucun mock résiduel.

---

# 14. FRONTEND DÉTAIL DOSSIER

Réutilise la route dynamique existante.

Ne crée pas une deuxième convention `/cas/[id]` ou `/cas/:id`.

Afficher pour B3 uniquement :

- informations Dossier ;
- Bien concerné ;
- responsable ;
- titulaires/ayants droit pertinents ;
- participants ;
- visibilité ;
- statut ;
- niveau de complétude.

Les sections Parcours/Documents/Interventions seront branchées plus tard.

---

# 15. PARTICIPANTS — UI

Prévoir une section simple :

**Personnes concernées**

Chaque entrée affiche :

```text
Nom
Rôle dans le dossier
Statut
```

Exemples :

```text
Jeanne M.
Titulaire
Actif

Paul M.
Accompagnateur
Actif
```

Ne mélange pas encore cette liste avec le futur annuaire Acteurs.

---

# 16. INVITATION

Pour B3, préparer uniquement le mécanisme de participation.

Si un système d'invitation existe déjà, réutilise-le.

Sinon, implémente seulement la relation nécessaire pour associer un utilisateur existant au Dossier.

Ne construis pas encore :

- invitation par SMS complexe ;
- accès invité externe ;
- access scopes avancés.

Cela viendra plus tard.

---

# 17. RLS — `dossiers`

Politique :

**DENY BY DEFAULT**

SELECT autorisé si :

- `owner_id = auth.uid()`
- ou utilisateur est participant actif autorisé ;
- ou une future règle publique explicite s'applique.

INSERT :

utilisateur authentifié selon règles métier.

UPDATE :

owner ou rôle explicitement autorisé.

ARCHIVE :

utilisateur autorisé uniquement.

DELETE physique :

éviter.

---

# 18. RLS — `dossier_participants`

SELECT :

utilisateur autorisé à voir le Dossier.

INSERT :

owner ou rôle autorisé.

UPDATE :

restrictions strictes.

Un participant ne doit pas pouvoir :

- augmenter son propre rôle ;
- devenir titulaire ;
- se donner des permissions supplémentaires.

REVOKE :

uniquement utilisateur autorisé.

---

# 19. RÔLES PROTÉGÉS

Les rôles sensibles comme :

```text
titulaire
autorite
professionnel
service
```

ne doivent pas pouvoir être attribués librement côté frontend sans règle métier appropriée.

Pour B3, au minimum protéger ces transitions côté backend.

---

# 20. CONTRAINTES

Ajouter :

- FK correctes ;
- enum/checks si cohérent avec la stack ;
- unicité raisonnable ;
- timestamps ;
- index.

Éviter plusieurs relations actives identiques pour :

```text
dossier_id + person_id + role
```

si cela n'a pas de sens métier.

---

# 21. INDEXES

Prévoir selon les requêtes réelles :

```text
dossiers.bien_id
dossiers.owner_id
dossiers.status
dossier_participants.dossier_id
dossier_participants.person_id
dossier_participants.status
```

---

# 22. TYPES

Utiliser les types Supabase générés.

Si des types métier frontend existent déjà, garder un mapping explicite.

Ne duplique pas :

```text
DossierType
DossierStatus
ParticipantRole
```

dans plusieurs endroits.

---

# 23. COMPATIBILITÉ AVEC L'EXISTANT

Si l'ancien `Dossier` contient déjà :

- documents ;
- parcours ;
- signatures ;
- agents ;

ne supprime pas brutalement ces champs ou structures.

Fais uniquement la migration/refactor nécessaire pour B3.

Si une suppression structurelle importante est nécessaire, STOP et rapporte-la avant de l'exécuter.

---

# 24. UI / UX

Conserver le Design System.

Mobile-first.

En mode essentiel, afficher surtout :

```text
Mon dossier
Qui est concerné
Où j'en suis
```

Pas de tableau complexe.

En mode complet, autoriser plus de détails.

---

# 25. VALIDATION B3

Vérifier :

- build ;
- TypeScript ;
- migrations ;
- création Dossier lié à un Bien ;
- consultation `/cas` ;
- détail Dossier ;
- ajout participant ;
- révocation participant ;
- distinction owner/titulaire/accompagnateur ;
- RLS avec au moins deux utilisateurs ;
- utilisateur non autorisé ne voit pas le Dossier ;
- participant ne peut pas augmenter son rôle ;
- aucun mock Dossier ;
- aucun appel Supabase dans les composants ;
- aucun domaine B4+ modifié.

---

# 26. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. fichiers créés ;
3. fichiers modifiés ;
4. migrations ;
5. tables/colonnes adaptées ;
6. RLS ;
7. repositories/services ;
8. routes/pages adaptées ;
9. tests exécutés ;
10. écarts éventuels.

**Ne commence pas B4.**