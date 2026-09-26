# B6 ACCEPTED — Documents, stockage et versionnement

**Date :** 26 septembre 2026  
**Périmètre :** B6 uniquement  
**Décision :** implémentation terminée ; certification finale requise avant fusion.

## 1. Existant réutilisé

- table historique `proofs` conservée comme source documentaire unique ;
- bucket privé `dossier-proofs` ;
- URLs signées temporaires ;
- repository de preuves, page des fichiers et détail Dossier ;
- permissions Dossier B3, étapes B4 et rôles de vérification B5.

Aucun deuxième système documentaire n'a été créé.

## 2. Migration progressive

La migration `20260926000400_b6_documents_versions_storage.sql` complète `proofs` avec :

- lien facultatif au Bien ;
- type documentaire extensible ;
- provenance ;
- statut de vérification ;
- auteur de création ;
- version courante ;
- archivage et identifiant d'opération client.

Chaque ancienne preuve devient automatiquement un document avec une première version. Les anciens chemins Storage restent lisibles par leur propriétaire.

## 3. Versions

La table `document_versions` conserve :

- chemin privé ;
- MIME et taille ;
- checksum SHA-256 ;
- numéro de version ;
- utilisateur ayant uploadé ;
- personne ayant fourni ;
- dates de création et de remplacement.

Une nouvelle version est ajoutée sans écraser ni supprimer l'ancienne. Une contrainte garantit que la version courante appartient au bon document.

## 4. Storage et validation

- bucket privé limité à 15 Mo ;
- formats autorisés explicites ;
- chemin stable `dossiers/{dossier}/documents/{document}/{version}` ;
- upload réservé au propriétaire du Dossier ;
- lecture accordée uniquement aux utilisateurs autorisés sur le Dossier ;
- anciennes versions enregistrées non supprimables ;
- consultation via URL signée de dix minutes.

## 5. Statuts et provenance

Statuts : déclaré, fourni, à vérifier, vérifié, officiel, rejeté et archivé.

- un upload est seulement « fourni » ;
- la vérification passe par un workflow backend ;
- seul un administrateur peut rendre un document officiel ;
- le statut officiel exige une source officielle ;
- un utilisateur ordinaire ne peut pas modifier librement le statut ou la provenance.

## 6. Repository et services

Le repository expose la création, l'ajout de version, la lecture, les versions, l'archivage, l'URL signée et la couverture documentaire.

Le service pur fournit :

- validation MIME/taille ;
- checksum SHA-256 ;
- identifiants clients stables ;
- calcul requis/fourni/manquant/non vérifié.

Les composants n'appellent ni Supabase ni Storage directement.

## 7. Interface

Le détail Dossier comprend une section mobile :

- sélection du type ;
- prise de photo ;
- choix de fichier ;
- progression ;
- liste avec provenance et statut ;
- version courante ;
- consultation sécurisée ;
- remplacement par nouvelle version ;
- résumé des documents attendus pour l'étape actuelle.

## 8. Tests

La CI couvre :

- contrôle statique, TypeScript, lint, tests unitaires et build ;
- migration des anciennes preuves ;
- base vide et reset complet ;
- création et seconde version ;
- conservation de l'ancienne version ;
- checksum et distinction uploader/fournisseur ;
- refus d'auto-attribution officielle ;
- isolation multi-utilisateur ;
- bucket privé non listable ;
- upload d'un autre Dossier refusé ;
- workflow vérifié puis officiel réservé au rôle autorisé ;
- compatibilité des tests Phase 0 et B1 à B5.

## 9. Frontière

Aucun Access Grant B7, intervention complète, communication, signalement, audit global B11 ou moteur de synchronisation B12 n'a été implémenté.
