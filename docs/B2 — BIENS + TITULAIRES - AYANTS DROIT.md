# B2 — BIENS + TITULAIRES / AYANTS DROIT

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

Le projet existe déjà. B1 Auth + Profiles + Usage Preferences est terminé.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Avant toute modification, inspecte :

- tables/migrations existantes liées aux biens, propriétés, terrains, parcelles ou owners ;
- types frontend correspondants ;
- services/repositories ;
- stores/hooks ;
- pages ou composants affichant déjà un bien ;
- modèles Dossier actuels contenant éventuellement des informations de propriété ;
- relations utilisateur/propriétaire existantes ;
- RLS existante.

Compare avec B2.

Si une structure équivalente existe : réutilise-la.

Ne crée pas une deuxième notion de Bien ou de propriétaire.

---

# 2. OBJECTIF B2

Finaliser uniquement :

1. domaine `Bien` ;
2. titulaires / ayants droit déclarés ;
3. relations entre personnes et biens ;
4. repositories/services ;
5. RLS ;
6. intégration frontend minimale production.

Ne touche pas encore :

- Dossiers ;
- Parcours ;
- Acteurs ;
- Documents ;
- Accès ;
- Communications ;
- Signalements.

---

# 3. TABLE `biens`

Créer ou compléter la table existante.

Champs minimum :

```text
id
created_by
type
title
description nullable
location_label
latitude nullable
longitude nullable
origin_declared nullable
status
created_at
updated_at
archived_at nullable
```

Types de bien extensibles, par exemple :

```text
terrain
parcelle
maison
propriete_familiale
autre
```

Ne mets pas dans `biens` :

- procédure ;
- historique Dossier ;
- documents ;
- permissions temporaires ;
- interventions.

Un Bien est l'entité patrimoniale durable.

---

# 4. TITULAIRES / AYANTS DROIT

Créer ou compléter une relation dédiée, par exemple :

`bien_right_holders`

Champs minimum :

```text
id
bien_id
person_id
role
status
declared_by
created_at
verified_at nullable
revoked_at nullable
```

Rôles :

```text
titulaire
co_titulaire
ayant_droit
representant_autorise
autre
```

Important :

une relation déclarée dans l'application n'est pas automatiquement une reconnaissance juridique officielle.

Prévoir un statut distinct, par exemple :

```text
declare
a_verifier
verifie
revoque
```

Ne pas afficher `propriétaire officiel` uniquement parce qu'un utilisateur a créé le Bien.

---

# 5. CRÉATION D'UN BIEN

La création doit enregistrer :

- créateur ;
- type ;
- titre ;
- localisation ;
- origine déclarée éventuelle ;
- premier titulaire/ayant droit lorsque fourni.

Le créateur n'est pas automatiquement titulaire sauf si l'utilisateur l'indique explicitement dans le flow produit.

Cas à supporter :

```text
Je crée mon propre bien
Je crée le bien d'un proche que j'accompagne
Je renseigne un bien familial
```

Ces trois cas doivent rester distincts.

---

# 6. ACCOMPAGNEMENT

Si l'utilisateur crée un Bien pour une autre personne :

enregistrer clairement :

```text
créé_par = utilisateur connecté
titulaire = personne concernée
```

Ne jamais remplacer silencieusement le titulaire par l'accompagnateur.

La vraie gestion des permissions d'accompagnement viendra dans une phase ultérieure.

B2 doit seulement préserver correctement les responsabilités.

---

# 7. PERSONNE / PROFIL

Réutilise `profiles` créé ou consolidé en B1.

Ne crée pas une deuxième table `users` frontend/backend si `auth.users + profiles` couvre déjà l'identité.

Si un ayant droit n'a pas encore de compte applicatif, ne contourne pas le modèle en créant un faux utilisateur Auth.

Utilise la structure existante prévue pour les personnes externes si elle existe.

Sinon STOP et signale ce besoin architectural avant de créer un nouveau modèle d'identité externe.

---

# 8. REPOSITORY / SERVICE

Réutilise la couche data existante.

Exposer conceptuellement :

```ts
createBien(...)
getBienById(...)
getBiensForUser(...)
updateBien(...)
archiveBien(...)

addRightHolder(...)
getRightHolders(...)
updateRightHolderStatus(...)
revokeRightHolder(...)
```

Les composants ne doivent pas appeler Supabase directement.

Flux :

```text
UI
↓
hook/application
↓
BienRepository
↓
Supabase
```

---

# 9. FRONTEND

Réutilise les écrans existants.

Ne crée pas encore une nouvelle section complète de navigation.

Ajouter uniquement les capacités nécessaires pour :

- créer un Bien ;
- afficher ses informations essentielles ;
- afficher ses titulaires/ayants droit ;
- distinguer clairement `créé par` et `titulaire`.

Si `/cas/nouveau` possède déjà un flow de création, ne le reconstruis pas.

Prépare simplement B2 pour qu'il puisse être utilisé plus tard par le flow Dossier.

---

# 10. AFFICHAGE DES RESPONSABILITÉS

Dans les vues concernées, afficher explicitement lorsque nécessaire :

```text
Titulaire : Jeanne M.
Créé avec l'aide de : Paul M.
```

ou :

```text
Bien familial
Ayants droit déclarés : 3
```

Éviter les formulations juridiques définitives si les informations sont seulement déclarées.

---

# 11. RLS — `biens`

Politique :

**DENY BY DEFAULT**

SELECT autorisé uniquement si l'utilisateur possède une relation légitime avec le Bien selon les règles actuelles.

INSERT :
utilisateur authentifié.

UPDATE :
créateur ou personne autorisée selon la politique définie.

ARCHIVE :
utilisateur autorisé uniquement.

Éviter le DELETE physique pour les Biens lorsque la traçabilité est nécessaire.

---

# 12. RLS — `bien_right_holders`

SELECT :
uniquement utilisateurs autorisés à voir le Bien concerné.

INSERT :
uniquement utilisateur autorisé à déclarer une relation.

UPDATE :
restriction stricte des champs modifiables.

Un utilisateur ne peut pas se déclarer `verifie` lui-même.

Un ayant droit ne doit pas pouvoir supprimer silencieusement un autre ayant droit.

Tout changement sensible doit être compatible avec l'Audit prévu ultérieurement.

---

# 13. CONTRAINTES

Ajouter les contraintes nécessaires :

- FK correctes ;
- timestamps ;
- rôles valides ;
- statuts valides ;
- relations non dupliquées ;
- index utiles.

Éviter deux relations actives identiques pour :

```text
bien_id + person_id + role
```

si le modèle produit ne l'autorise pas.

---

# 14. INDEXES

Prévoir au minimum selon les requêtes réelles :

```text
biens.created_by
bien_right_holders.bien_id
bien_right_holders.person_id
bien_right_holders.status
```

Ne crée pas d'index inutiles.

---

# 15. TYPES

Utilise les types Supabase générés.

Évite de maintenir un deuxième modèle backend manuel incompatible.

Les types métier frontend peuvent exister si nécessaire, mais doivent être explicitement mappés aux types persistence.

Aucun `any` injustifié.

---

# 16. UI / UX

Respecte le Design System existant.

Mobile-first.

En mode essentiel, montrer seulement :

```text
Voici le bien
Qui est concerné
Où il se trouve
```

Puis une seule action principale.

En mode complet, permettre davantage de détails.

Ne change pas encore toute la Home ou la navigation.

---

# 17. VALIDATION

Avant de terminer, vérifier :

- migrations valides ;
- build réussi ;
- TypeScript sans erreur ;
- création d'un Bien ;
- lecture d'un Bien autorisé ;
- impossibilité de lire un Bien non autorisé ;
- ajout d'un titulaire ;
- distinction créateur / titulaire ;
- accompagnateur non transformé en titulaire ;
- relation dupliquée empêchée ou gérée ;
- RLS testée avec au moins deux utilisateurs ;
- aucun appel Supabase ajouté dans les composants ;
- aucune table Dossier créée/modifiée ;
- aucun domaine B3+ touché.

---

# 18. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. fichiers créés ;
3. fichiers modifiés ;
4. migrations ;
5. tables/colonnes réellement ajoutées ou adaptées ;
6. RLS ;
7. services/repositories ;
8. tests exécutés ;
9. éventuels écarts ou décisions bloquantes.

**Ne commence pas B3.**