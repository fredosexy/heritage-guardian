# B5 — ACTEURS + COMPÉTENCES + HABILITATIONS

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B4 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- ancien domaine `agents` ;
- profils professionnels ;
- services ;
- annuaire `/procedure` ;
- compétences existantes ;
- rôles utilisateurs ;
- données Chefferie / Cadastre / Notaire / services ;
- relations avec `dossier_steps` ;
- tables/migrations correspondantes ;
- RLS ;
- composants `AgentCard`, `ServiceCard`, etc.

Réutilise ce qui existe.

Ne crée pas un second référentiel d'intervenants.

---

# 2. OBJECTIF B5

Finaliser uniquement :

1. référentiel `actors` ;
2. compétences ;
3. habilitations/credentials ;
4. niveaux territoriaux ;
5. vérification des acteurs ;
6. recherche d'acteurs adaptés à une étape ;
7. annuaire `/procedure` ;
8. RLS ;
9. services/repositories.

Ne touche pas encore :

- Documents production ;
- Access Grants ;
- Interventions métier complètes ;
- Communications ;
- Signalements.

---

# 3. TABLE `actors`

Créer ou compléter l'équivalent existant.

Champs minimum :

```text
id
profile_id nullable
actor_type
name
description nullable
location
territorial_level
verification_status
availability_status
created_at
updated_at
suspended_at nullable
```

Types conceptuels :

```text
professionnel
autorite_locale
service_administratif
organisation
autre
```

Ne transforme pas automatiquement tout utilisateur en `actor`.

Un `profile` représente l'identité applicative.

Un `actor` représente une capacité d'intervention métier.

---

# 4. NIVEAU TERRITORIAL

Réutiliser un type partagé unique :

```text
local
rural
arrondissement
departement
region
national
autre
```

Ne recrée pas plusieurs enums de zone/niveau.

La localisation et le niveau territorial sont deux notions différentes.

---

# 5. TABLE `actor_competences`

Relation :

```text
actors 1 → N actor_competences
```

Champs minimum :

```text
id
actor_id
competence_code
label
status
verified_by nullable
verified_at nullable
expires_at nullable
created_at
```

Exemples de compétences :

```text
geometre
notaire
chef_traditionnel
cadastre
conservation_fonciere
sous_prefecture
mindcaf
mediation
autre
```

Utiliser les codes existants s'ils sont déjà présents.

---

# 6. TABLE `actor_credentials`

Responsabilité :

représenter les éléments permettant de justifier une qualité, fonction ou habilitation.

Champs minimum :

```text
id
actor_id
credential_type
reference nullable
document_id nullable
status
issued_at nullable
expires_at nullable
verified_by nullable
verified_at nullable
created_at
```

Statuts :

```text
declare
verification_en_cours
verifie
expire
suspendu
revoque
```

Un utilisateur ne peut jamais se déclarer lui-même `verifie`.

---

# 7. STATUT DE VÉRIFICATION ACTEUR

Valeurs :

```text
non_verifie
verification_en_cours
verifie
suspendu
revoque
```

L'UI doit distinguer clairement :

```text
Compétence déclarée
Compétence vérifiée
Habilitation vérifiée
```

Ne pas afficher `agréé` sans preuve réellement validée.

---

# 8. RELATION AVEC LES PROCÉDURES

B4 possède :

```text
procedure_steps.required_competence
```

Utiliser cette information pour rechercher les acteurs pertinents.

Flux :

```text
Dossier
↓
Étape actuelle
↓
Compétence nécessaire
↓
Acteurs correspondants
↓
Classement territorial
```

Ne code pas dans l'UI :

```text
si Ngomedzap → afficher X
```

La sélection appartient aux services/selectors.

---

# 9. RECOMMANDATION D'ACTEURS

Créer une logique métier réutilisable prenant en compte :

1. compétence requise ;
2. niveau territorial ;
3. localisation ;
4. statut de vérification ;
5. disponibilité si pertinente.

Exemple conceptuel :

```ts
getActorsForStep(step, dossierContext)
```

Priorité générale :

```text
compétence compatible
→ acteur vérifié
→ niveau territorial pertinent
→ proximité
→ disponibilité
```

La proximité ne doit pas remplacer la compétence.

---

# 10. SOURCE UNIQUE

Le même référentiel `actors` doit alimenter :

- `/procedure` ;
- recommandations d'étape ;
- détail Dossier ;
- futures demandes d'intervention.

Interdit :

- liste Agents dans `/procedure` ;
- deuxième liste dans Assistant ;
- troisième liste dans Dossier.

Une seule source de vérité.

---

# 11. MIGRATION DE L'ANCIEN DOMAINE `agents`

Si `features/agents` existe :

ne le supprime pas brutalement.

Identifier :

- ce qui représente réellement un Acteur ;
- ce qui représente un User/Profile ;
- ce qui est UI réutilisable ;
- ce qui doit être renommé ou adapté.

Effectuer uniquement une migration progressive.

Si un renommage massif risque de casser le projet :

STOP et rapporte l'impact avant modification structurelle.

---

# 12. REPOSITORY / SERVICE

Réutiliser l'architecture data existante.

Exposer conceptuellement :

```ts
getActorById(...)
searchActors(...)
getActorsByCompetence(...)
getActorsForStep(...)
getActorCompetences(...)
getActorCredentials(...)
```

Les composants ne doivent pas appeler Supabase directement.

---

# 13. UI `/procedure`

Réutiliser la page existante.

Organiser l'annuaire selon :

```text
Rural
Arrondissement
Département
Région
National / autre
```

Permettre selon le mode UI :

- recherche ;
- filtre compétence ;
- filtre territoire ;
- statut de vérification.

Chaque fiche affiche au minimum :

```text
Nom
Type
Compétence
Niveau territorial
Localisation
Statut de vérification
```

Ne montrer un contact que s'il existe réellement dans les données autorisées.

---

# 14. FICHE ACTEUR

Réutiliser `AgentCard` / `ServiceCard` si possible.

Éviter plusieurs composants presque identiques.

La fiche détaillée peut afficher :

- identité/service ;
- rôle ;
- compétences ;
- habilitations ;
- territoire ;
- disponibilité ;
- statut de vérification ;
- interventions futures lorsque B8 sera implémenté.

Aucune logique de sélection dans le composant.

---

# 15. MODE RURAL ESSENTIEL

Pour un utilisateur en mode essentiel :

ne pas afficher une liste technique de 20 professionnels.

Afficher :

```text
Voici qui peut vous aider maintenant.
```

Puis 1 à 3 acteurs pertinents maximum.

Chaque carte :

```text
Nom
Ce qu'il peut faire
Où il intervient
Statut vérifié ou à vérifier
```

Une action principale.

---

# 16. RLS — `actors`

Lecture :

les informations publiables de l'annuaire peuvent être consultables selon politique produit.

Les données privées/sensibles restent protégées.

Création :

selon rôle autorisé.

Modification :

acteur concerné uniquement sur champs autorisés, ou administration compétente.

Un acteur ne peut pas modifier lui-même :

```text
verification_status
verified_by
verified_at
```

---

# 17. RLS — `actor_competences`

L'acteur peut éventuellement déclarer une compétence.

Il ne peut pas la marquer `verifie`.

Validation :

uniquement rôle de vérification autorisé.

---

# 18. RLS — `actor_credentials`

Les documents/credentials sensibles doivent être protégés.

L'acteur peut soumettre un credential.

Seul le workflow autorisé peut le :

- vérifier ;
- suspendre ;
- révoquer.

---

# 19. AUDIT À PRÉPARER

Les changements suivants devront produire des événements d'audit lors de B11 :

```text
actor_created
competence_declared
competence_verified
credential_submitted
credential_verified
actor_suspended
actor_revoked
```

Ne crée pas un système d'audit parallèle si l'infrastructure existe déjà.

---

# 20. TYPES

Utiliser les types Supabase générés.

Éviter toute duplication de :

```text
ActorType
ActorVerificationStatus
TerritorialLevel
CompetenceCode
CredentialStatus
```

Utiliser un mapping métier uniquement si nécessaire.

---

# 21. INDEXES

Prévoir selon les requêtes réelles :

```text
actors.actor_type
actors.territorial_level
actors.verification_status

actor_competences.actor_id
actor_competences.competence_code
actor_competences.status

actor_credentials.actor_id
actor_credentials.status
```

---

# 22. CONTRAINTES

Garantir :

- FK ;
- statut valide ;
- compétence non dupliquée inutilement ;
- credential lié au bon acteur ;
- acteur vérifié uniquement via workflow autorisé ;
- suspension/révocation cohérente.

---

# 23. TESTS

Tester au minimum :

- recherche par compétence ;
- recherche par niveau territorial ;
- priorité d'acteurs pour une étape ;
- acteur non vérifié ;
- acteur vérifié ;
- credential expiré ;
- acteur suspendu exclu des recommandations si requis ;
- source unique utilisée par `/procedure`.

---

# 24. TESTS RLS

Tester avec plusieurs utilisateurs :

- utilisateur ordinaire peut lire uniquement les informations publiques autorisées ;
- acteur peut modifier ses champs autorisés ;
- acteur ne peut pas se marquer vérifié ;
- utilisateur ne peut pas modifier un autre acteur ;
- vérificateur autorisé peut valider selon son rôle ;
- credential privé non exposé publiquement.

---

# 25. VALIDATION B5

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- ancien domaine Agent correctement réutilisé/migré ;
- une seule source Acteurs ;
- `/procedure` utilise la base production ;
- recherche par compétence fonctionne ;
- classement territorial fonctionne ;
- statut de vérification visible ;
- aucune habilitation auto-déclarée comme vérifiée ;
- aucun appel Supabase dans les composants ;
- aucune donnée acteur hardcodée ;
- aucun domaine B6+ implémenté.

---

# 26. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. éléments `agents` migrés/adaptés ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. tables/relations ;
7. RLS ;
8. services/repositories ;
9. page `/procedure` adaptée ;
10. tests ;
11. éventuels écarts restants.

**Ne commence pas B6.**