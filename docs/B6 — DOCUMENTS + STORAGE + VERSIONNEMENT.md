# B6 — DOCUMENTS + STORAGE + VERSIONNEMENT

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B5 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- tables/documents existantes ;
- uploads Supabase Storage ;
- buckets existants ;
- composants upload/photo ;
- types document ;
- services/repositories ;
- logique de pièces jointes ;
- versionnement éventuel ;
- règles RLS/Storage ;
- liens documents ↔ Dossier/Bien ;
- anciens champs `documents[]` dans Dossier.

Réutilise ce qui existe.

Ne crée pas un deuxième système documentaire.

---

# 2. OBJECTIF B6

Finaliser uniquement :

1. métadonnées Documents ;
2. versionnement ;
3. Supabase Storage ;
4. provenance ;
5. statut de vérification ;
6. upload sécurisé ;
7. consultation sécurisée ;
8. intégration Dossier ;
9. offline-ready côté interface ;
10. RLS + tests.

Ne touche pas encore :

- Access Grants avancés ;
- Interventions complètes ;
- Communications ;
- Signalements ;
- Audit global.

---

# 3. TABLE `documents`

Créer ou compléter la structure existante.

Champs minimum :

```text id="r36ysf"
id
dossier_id
bien_id nullable
document_type
title
source_type
verification_status
current_version_id nullable
created_by
created_at
updated_at
archived_at nullable
```

`dossier_id` reste la relation principale pour les pièces liées à une démarche.

`bien_id` peut être utilisé uniquement si une pièce appartient réellement au Bien indépendamment d'un Dossier.

---

# 4. TYPES DE DOCUMENT

Ne pas hardcoder toutes les pièces dans les composants.

Prévoir des codes extensibles.

Exemples :

```text id="4dj85f"
attestation
recu
photo
plan
piece_identite
titre_foncier
acte
declaration
proces_verbal
autre
```

Les procédures B4 doivent pouvoir indiquer quels types de documents sont attendus.

---

# 5. PROVENANCE

Chaque document doit indiquer sa source.

Valeurs conceptuelles :

```text id="5omio7"
declaration
utilisateur
accompagnateur
acteur
service
source_officielle
```

Important :

`source_officielle` ne peut pas être attribuée arbitrairement par n'importe quel utilisateur.

---

# 6. STATUT DE VÉRIFICATION

Valeurs :

```text id="t5dwav"
declare
fourni
a_verifier
verifie
officiel
rejete
archive
```

Ne pas confondre :

- fichier ajouté ;
- document vérifié ;
- document officiel.

Un upload n'est jamais automatiquement `verifie` ou `officiel`.

---

# 7. TABLE `document_versions`

Créer ou compléter.

Relation :

```text id="c14s8g"
documents 1 → N document_versions
```

Champs minimum :

```text id="yvkujf"
id
document_id
storage_path
mime_type
size_bytes
checksum
version_number
uploaded_by
provided_by nullable
created_at
replaced_at nullable
```

Aucune nouvelle version ne doit écraser silencieusement l'ancienne.

---

# 8. VERSIONNEMENT

Lorsqu'un fichier est remplacé :

1. créer une nouvelle `document_version` ;
2. conserver l'ancienne ;
3. mettre à jour `current_version_id` ;
4. conserver auteur/date ;
5. ne pas supprimer l'historique.

Pour les documents sensibles, éviter les mises à jour destructives.

---

# 9. STORAGE

Audite les buckets existants avant création.

Réutilise-les s'ils sont corrects.

Sinon prévoir conceptuellement :

```text id="8hdztq"
documents-private
audio-private
avatars
public-assets
```

Les documents métier doivent être privés par défaut.

Ne mets jamais les documents sensibles dans un bucket public pour simplifier l'UI.

---

# 10. CHEMINS STORAGE

Utiliser une convention stable.

Exemple conceptuel :

```text id="4eviut"
dossiers/{dossier_id}/documents/{document_id}/{version_id}
```

ou une convention équivalente existante.

Ne pas dépendre du nom original du fichier comme identifiant principal.

---

# 11. ACCÈS AUX FICHIERS

Les fichiers privés doivent être accessibles uniquement via :

- règles Storage ;
- contrôle backend ;
- signed URLs temporaires si nécessaire.

Ne stocke pas une URL publique permanente dans les composants.

---

# 12. UPLOAD

Le frontend peut :

- sélectionner fichier ;
- prendre photo ;
- enregistrer métadonnées ;
- afficher progression ;
- préparer retry.

Le backend/repository décide :

- destination ;
- droits ;
- création version ;
- métadonnées persistées.

Les composants ne doivent pas appeler directement Storage si l'architecture existante possède une couche service/repository.

---

# 13. VALIDATION FICHIER

Vérifier au minimum :

- type MIME ;
- taille ;
- extension si utile ;
- cohérence minimale.

Ne te fie pas uniquement au nom de fichier.

Prévoir une liste autorisée adaptée aux usages réels.

---

# 14. IMAGES

Pour les photos de documents :

- compression raisonnable côté client si déjà prévue ;
- conserver une lisibilité suffisante ;
- ne pas détruire le fichier original si l'architecture produit exige sa conservation ;
- éviter les images énormes sur réseau faible.

Prévoir une stratégie compatible offline.

---

# 15. CHECKSUM

Calculer/conserver un checksum si l'architecture le permet.

Objectifs :

- détection de doublon ;
- intégrité ;
- suivi de version.

Ne l'utilise pas comme preuve juridique.

---

# 16. OFFLINE-READY

B6 ne construit pas encore tout B12 Offline Sync.

Mais l'API documentaire doit déjà être compatible avec :

```text id="sn6dt7"
local pending file
→ queued upload
→ remote version
```

Prévoir des IDs client stables si l'architecture offline en a besoin.

Ne lie pas toute la logique à un upload immédiat obligatoire.

---

# 17. UI — DOSSIER

Réutilise le détail Dossier.

Ajouter/adapter une section :

**Documents et pièces**

Afficher :

- titre ;
- type ;
- provenance ;
- statut ;
- version actuelle ;
- date ;
- auteur/fournisseur si autorisé.

En mode essentiel :

```text id="zkujh8"
Vous avez ce document
Vous devez encore vérifier ceci
Ajouter une photo ou un document
```

Pas de tableau complexe.

---

# 18. UI — AJOUT DOCUMENT

Réutilise Sheet/Dialog/Drawer existant.

Flow simple :

1. choisir type de document ;
2. ajouter photo/fichier ;
3. indiquer qui fournit le document si nécessaire ;
4. confirmer.

Ne demande pas des métadonnées techniques inutiles à l'utilisateur rural.

---

# 19. LIEN AVEC LE PARCOURS

B4 peut indiquer des documents attendus par étape.

B6 doit permettre de déterminer :

```text id="4c6ddm"
document attendu
document fourni
document à vérifier
document manquant
```

Créer un selector/service partagé.

Ne calcule pas cette logique dans le JSX.

---

# 20. DOCUMENTS MANQUANTS

Le moteur de parcours doit pouvoir recevoir un résumé documentaire.

Exemple conceptuel :

```ts id="ff1dvv"
getDocumentCoverageForStep(stepId)
```

Sortie :

```text id="vz01fo"
required
provided
missing
unverified
```

---

# 21. FOURNI PAR / AJOUTÉ PAR

Distinguer :

```text id="945p8t"
uploaded_by
provided_by
```

Exemple :

Paul peut uploader une pièce fournie par Jeanne.

Le système doit conserver :

```text id="ar5p7i"
Ajouté par : Paul
Fourni par : Jeanne
```

C'est essentiel pour le mode accompagné.

---

# 22. RLS — `documents`

Politique :

**DENY BY DEFAULT**

SELECT :

utilisateur autorisé à voir le Dossier + scope documentaire approprié selon l'état actuel des permissions.

INSERT :

participant autorisé.

UPDATE :

restrictions selon champs.

Un utilisateur ordinaire ne doit pas pouvoir :

- modifier `verification_status` vers `verifie/officiel` librement ;
- changer arbitrairement la provenance ;
- déplacer le document vers un autre Dossier.

---

# 23. RLS — `document_versions`

SELECT :

hérite de l'accès au document parent.

INSERT :

utilisateur autorisé à ajouter une version.

UPDATE/DELETE :

très restreints.

Préférer append-only pour les versions.

---

# 24. STORAGE POLICIES

Tester :

- upload autorisé uniquement sur Dossier accessible ;
- lecture uniquement pour utilisateurs autorisés ;
- chemin d'un autre Dossier inaccessible ;
- utilisateur ne peut pas lister tout le bucket ;
- URL signée expire correctement si utilisée.

---

# 25. VÉRIFICATION DOCUMENTAIRE

La transition :

```text id="hm41wt"
a_verifier → verifie
```

doit être réservée aux rôles/flows autorisés.

La transition :

```text id="c3a80u"
verifie → officiel
```

doit être encore plus stricte et dépendre d'une provenance/autorité appropriée.

Ne mets pas cette décision dans le frontend.

---

# 26. REPOSITORY / SERVICE

Réutilise l'existant.

Exposer conceptuellement :

```ts id="wb932r"
createDocument(...)
addDocumentVersion(...)
getDocument(...)
getDocumentsForDossier(...)
getCurrentVersion(...)
getDocumentVersions(...)
archiveDocument(...)
getDocumentCoverageForStep(...)
```

Le service Storage doit être encapsulé.

---

# 27. TYPES

Utilise les types Supabase générés.

Évite de dupliquer :

```text id="rj501n"
DocumentType
DocumentSourceType
DocumentVerificationStatus
```

dans plusieurs endroits.

Si un type métier frontend existe, mappe-le explicitement.

---

# 28. INDEXES

Prévoir selon requêtes réelles :

```text id="7cupv6"
documents.dossier_id
documents.bien_id
documents.document_type
documents.verification_status

document_versions.document_id
document_versions.version_number
```

---

# 29. CONTRAINTES

Garantir :

- FK ;
- version_number cohérent ;
- current_version_id appartient au bon document ;
- document non attaché à un Dossier inaccessible ;
- statut valide ;
- pas de version orpheline.

---

# 30. TESTS UNITAIRES

Tester :

- création document ;
- ajout version ;
- changement current version ;
- provenance ;
- couverture documentaire d'une étape ;
- document manquant ;
- document à vérifier ;
- distinction uploaded_by / provided_by.

---

# 31. TESTS RLS / STORAGE

Tester avec plusieurs utilisateurs :

- utilisateur A accède à ses documents ;
- utilisateur B ne les voit pas ;
- accompagnateur sans droit suffisant ne voit pas tout ;
- utilisateur non autorisé ne télécharge pas le fichier ;
- utilisateur ne peut pas se marquer document officiel ;
- ancienne version reste accessible selon autorisation ;
- bucket privé reste non listable publiquement.

---

# 32. COMPATIBILITÉ ANCIENNE

Si l'ancien Dossier contient :

```text id="in5vnf"
documents: []
```

ou documents mock/local :

ne supprime pas brutalement.

Identifier et migrer uniquement les données/structures nécessaires.

Si une migration destructive importante est requise :

STOP et rapporte l'impact.

---

# 33. UI / UX

Respecte le Design System.

Mobile-first.

En mode Rural essentiel :

- bouton caméra visible ;
- bouton fichier simple ;
- état clair ;
- vocabulaire non technique.

Exemple :

```text id="ehcszc"
Photo ajoutée
En attente d'envoi
```

ou :

```text id="hkfb4g"
Document reçu
À vérifier
```

---

# 34. VALIDATION B6

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- buckets/policies corrects ;
- upload fonctionne ;
- lecture sécurisée ;
- versionnement fonctionne ;
- aucune ancienne version écrasée ;
- provenance conservée ;
- `uploaded_by` et `provided_by` distincts ;
- documents liés au parcours ;
- aucun document hardcodé production ;
- aucun appel Storage/Supabase direct dans les composants ;
- aucun domaine B7+ implémenté.

---

# 35. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. système documentaire précédent adapté ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. buckets/policies ;
7. repositories/services ;
8. UI adaptée ;
9. tests exécutés ;
10. éventuels écarts restants.

**Ne commence pas B7.**