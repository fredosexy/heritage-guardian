# Règles permanentes relatives aux données et aux bases de données — Heritis

**Statut :** référentiel permanent, obligatoire et applicable à toute évolution de données.  
**Portée :** données métier, personnes, biens, dossiers, preuves, documents, identité, relations, droits, base relationnelle, stockage, cache, mode hors ligne, synchronisation, API, intelligence artificielle, sauvegarde et exploitation.  
**Autorité :** complète `AGENTS.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `ARCHITECTURE-RULES.md` et `SECURITY-RULES.md`. En cas de contradiction, suspendre l'opération et appliquer la règle la plus protectrice jusqu'à arbitrage explicite.  
**Périmètre documentaire initial :** branche `docs/heritis-development-governance-agents`, état observé le 8 novembre 2026. Les constats ci-dessous décrivent uniquement les fichiers effectivement consultés ; ils ne constituent pas un audit exhaustif de la base distante.

---

## 1. Objet et objectifs

Ce référentiel fixe les règles de conception, de stockage, de circulation, de protection, de synchronisation, de conservation et de suppression des données de Heritis.

Il vise à garantir simultanément :
1. l'exactitude et la cohérence des informations ;
2. la protection des personnes, des biens, des documents et des volontés ;
3. la séparation des déclarations, des preuves, des vérifications et des conclusions ;
4. l'application des droits au niveau serveur et base de données ;
5. la continuité entre les usages en ligne et hors ligne ;
6. la traçabilité des modifications sensibles ;
7. la portabilité, la sauvegarde et la récupération ;
8. la sobriété des requêtes, des transferts, du stockage et des coûts ;
9. une expérience V1 sans abonnement ni paiement obligatoire pour les utilisateurs.

Une donnée présente dans une interface, un cache, un document ou une réponse IA n'est pas automatiquement exacte, autorisée, vérifiée ou juridiquement établie.

## 2. Hiérarchie des exigences et vocabulaire

Les exigences sont classées comme suit :
- **OBLIGATOIRE** : condition de conformité ; toute dérogation est interdite sauf procédure formelle et dans les limites prévues par la gouvernance.
- **RECOMMANDÉ** : choix par défaut ; toute alternative doit être justifiée.
- **CONDITIONNEL** : exigence applicable lorsque le contexte, le risque ou la technologie concernée l'impose.

Les termes « doit », « ne doit pas » et « interdit » expriment une obligation. « Peut » exprime une possibilité soumise aux contrôles applicables.

Distinguer systématiquement :
- **état observé** : mécanisme effectivement constaté dans le dépôt ;
- **exigence cible** : comportement à respecter lors de toute évolution ;
- **validation** : preuve obtenue par un test ou une inspection identifiable ;
- **hypothèse** : élément non vérifié, qui ne doit pas être présenté comme un fait.

## 3. Principes fondamentaux

Toute conception de données doit respecter les principes suivants :
- une source de vérité identifiable par donnée métier ;
- un propriétaire fonctionnel et une finalité définis ;
- la collecte minimale nécessaire ;
- la validation côté serveur et base de données ;
- le refus par défaut en cas d'autorisation absente ou incertaine ;
- l'intégrité référentielle et les contraintes explicites ;
- la séparation des données métier, des fichiers et de leurs métadonnées ;
- la traçabilité proportionnée au risque ;
- l'absence d'écrasement silencieux ;
- la réversibilité et la portabilité raisonnables ;
- la conservation limitée à une finalité et une durée justifiées ;
- la réduction des requêtes, des octets, des appels externes et des opérations répétées ;
- la sécurité, la confidentialité et la fiabilité avant l'optimisation du coût.

Aucune optimisation de performance ou de coût ne peut supprimer un contrôle d'accès, une validation, une preuve ou une trace nécessaire.

## 4. Gratuité utilisateur et sobriété économique V1

### 4.1 Engagement produit

La V1 de Heritis doit pouvoir être utilisée par ses utilisateurs sans abonnement obligatoire, frais d'accès obligatoires ni paiement imposé pour accéder aux fonctionnalités V1 validées. Une fonctionnalité essentielle ne doit pas être conçue de manière à exiger un service payant externe sans décision explicite, justification, solution de repli et validation de gouvernance.

La gratuité pour l'utilisateur ne signifie pas que l'hébergement, le stockage, la maintenance, la bande passante ou les services techniques n'ont aucun coût. Ces coûts d'exploitation doivent être identifiés, maîtrisés et transparents pour les responsables du produit ; ils ne doivent pas être transformés silencieusement en facturation obligatoire des utilisateurs.

### 4.2 Ordre de préférence technique

Avant d'adopter un service ou une architecture coûteuse, examiner dans cet ordre :
1. capacités natives déjà disponibles dans la plateforme ou la base ;
2. solution simple, maintenue et sans coût additionnel ;
3. bibliothèque open source légère, compatible et correctement maintenue ;
4. offre gratuite, uniquement après examen de ses quotas, conditions, confidentialité, rétention, export et pérennité ;
5. service payant ou architecture complexe uniquement si les options précédentes ne répondent pas au besoin, avec coût total, risques et approbation documentés.

Une offre gratuite limitée n'est pas assimilée à une garantie de gratuité durable. Documenter les plafonds, les dépassements, les limites de stockage, de bande passante, de fonctions, de durée et d'export.

### 4.3 Prévention des coûts inattendus

- Aucun dépassement facturable ne doit être activé sans contrôle, alerte et décision explicite lorsque la plateforme le permet.
- Définir des quotas et limites applicables aux appels, traitements, fichiers, tailles et fréquences.
- Prévoir un arrêt contrôlé ou un mode dégradé lorsqu'un budget, quota ou seuil est atteint.
- Ne pas rendre une fonction essentielle inaccessible ou destructrice lorsqu'un fournisseur gratuit devient indisponible.
- Ne pas multiplier les fournisseurs pour une fonction déjà couverte de manière sûre par la plateforme existante.
- Évaluer le coût total : appels, stockage, trafic sortant, sauvegardes, exécution, surveillance, support, migration et dépendance fournisseur.

## 5. Modèle métier et frontières des domaines

Les données de la V1 doivent refléter les quatre domaines métier actuellement validés. La vision générale cible six domaines, mais les deux domaines complémentaires ne sont pas encore spécifiés : ne pas créer de tables, relations, enums ou structures anticipant leurs besoins sans décision produit formelle. Les domaines V1 sont :
1. patrimoine et gestion des biens ;
2. héritage et succession ;
3. volontés secrètes et dernières volontés ;
4. gestion des conflits et litiges.

Les données communes (personnes, profils, relations, documents, consentements, accès, notifications et historiques) sont des services transversaux. Elles ne doivent pas être dupliquées dans chaque domaine sans nécessité.

Un dossier métier possède un type et une finalité explicites. Les relations inter-domaines doivent être représentées par des références explicites, contrôlées et autorisées ; elles ne doivent pas provoquer une fusion implicite de dossiers ni élargir les droits d'accès.

## 6. Personnes, profils, biens et statuts déclaratifs

### 6.1 Identité des personnes

Distinguer une personne, son compte utilisateur, ses profils, ses coordonnées et ses relations à un dossier. Dans le parcours d'accueil, la communication d'un prénom ou d'un nom (l'un ou l'autre suffit) peut faire passer la personne à l'état « reconnue » ; cet état est un repère de parcours, pas une authentification, une preuve d'identité ni une permission. Sans compte authentifié, l'accès reste limité à l'aperçu guidé. Un compte ne constitue pas à lui seul la preuve de l'identité civile ou d'un droit sur un bien.

Éviter les doublons de personnes ; toute fusion doit être contrôlée, traçable, réversible dans la mesure du possible et ne pas mélanger les comptes, identifiants ou preuves.

### 6.2 Rôles relatifs à un bien

Les relations suivantes doivent rester distinctes :
- propriétaire déclaré ;
- copropriétaire déclaré ;
- détenteur ou possesseur ;
- bénéficiaire d'un droit déclaré ;
- représentant ;
- gestionnaire ;
- occupant, locataire, acheteur, vendeur ;
- héritier potentiel ou ayant droit déclaré ;
- autre relation explicitement qualifiée.

Ne jamais déduire automatiquement une propriété juridiquement établie d'un rôle, d'une déclaration, d'une possession, d'un paiement, d'un compte ou d'un document isolé.

### 6.3 Niveau de preuve

Séparer au minimum :
- déclaration de la personne ;
- pièce ou document associé ;
- information à vérifier ;
- vérification effectuée, avec auteur, date, méthode et portée ;
- contestation ou divergence.

La vérification d'une pièce ne vaut pas automatiquement authentification de son contenu, validité juridique ou décision d'une autorité compétente. Conserver la provenance et les limites de chaque conclusion.

## 7. Classification et minimisation des données

Avant collecte, définir la finalité, la nécessité, la catégorie, les personnes concernées, la base de traitement applicable, les destinataires, la durée et les protections.

Classer les données selon leur sensibilité : publiques, internes, personnelles, confidentielles, sensibles ou hautement sensibles. Les volontés secrètes, dernières volontés, pièces d'identité, informations patrimoniales détaillées, données de litige et documents confidentiels exigent des protections renforcées.

Ne collecter que les champs nécessaires au parcours concerné. Ne pas stocker une donnée « au cas où ». Ne pas recopier dans les journaux, analytics, prompts IA, notifications ou caches des données déjà disponibles si cette duplication n'est pas nécessaire.

## 8. Modélisation relationnelle et source de vérité

Chaque entité doit disposer :
- d'un identifiant stable, non ambigu et non dérivé d'une donnée personnelle ;
- d'une définition métier ;
- d'un propriétaire fonctionnel ;
- de relations et cardinalités documentées ;
- de contraintes d'intégrité ;
- d'une politique d'accès ;
- d'un cycle de vie ;
- d'une stratégie de migration et de test.

Utiliser des clés étrangères et contraintes lorsque l'intégrité doit être garantie en base. Éviter de remplacer des relations structurées par des champs texte ou des objets JSON opaques.

JSON/JSONB peut être utilisé pour des métadonnées réellement variables ou des structures documentées ; il ne doit pas devenir le stockage par défaut des données relationnelles, des permissions, des relations métier ou des éléments qui nécessitent contraintes, index et requêtes fiables.

Ne pas dupliquer une valeur calculable ou une donnée de référence sans stratégie de synchronisation. Si une copie est nécessaire pour performance ou historique, préciser sa nature (snapshot, cache, projection), sa source, sa date et son mécanisme d'invalidation.

## 9. Nommage, types et qualité des schémas

- Employer des noms cohérents, explicites et stables.
- Utiliser les types adaptés : dates civiles pour les dates sans heure, timestamps avec fuseau pour les instants, numériques décimaux pour les mesures ou montants, booléens uniquement pour les faits réellement binaires.
- Définir unités, devise, fuseau, précision et conventions lorsque pertinents.
- Éviter les chaînes libres pour les états ou catégories qui nécessitent un vocabulaire contrôlé.
- Utiliser des CHECK, NOT NULL, UNIQUE, clés étrangères et autres contraintes adaptées.
- Distinguer champ inconnu, non renseigné, non applicable, refusé et faux.
- Valider les longueurs, formats, plages et valeurs sur le serveur et en base.
- Ne jamais faire confiance à la seule validation du frontend.

Les types générés et contrats applicatifs doivent rester cohérents avec les migrations réelles. Toute modification de schéma doit mettre à jour les types, dépôts, API, tests et documentation concernés.

## 10. PostgreSQL et Supabase : règles de base

PostgreSQL est la source d'intégrité relationnelle lorsque les données sont persistées dans Supabase. Les choix doivent être vérifiés avec la version et la configuration réellement utilisées.

Pour tout schéma exposé par l'API :
- activer RLS sur chaque table exposée ;
- définir des politiques explicites par opération (SELECT, INSERT, UPDATE, DELETE) ;
- appliquer le moindre privilège aux rôles et grants ;
- ne jamais considérer le rôle `authenticated` comme une autorisation suffisante ;
- lier les lignes à l'utilisateur, au dossier, à la relation ou au droit effectivement accordé ;
- tester propriétaire, participant accepté, invitation en attente, tiers non autorisé et utilisateur anonyme lorsque pertinent.

RLS filtre les lignes ; les GRANT et l'exposition Data API contrôlent l'accès aux objets. Les deux couches doivent être examinées. Une table inaccessible par manque de GRANT n'est pas un substitut à une politique RLS correcte.

Les vues doivent préserver les règles d'accès ; utiliser les mécanismes de sécurité adaptés à la version PostgreSQL, notamment `security_invoker` lorsque disponible et pertinent. Toute fonction privilégiée ou `SECURITY DEFINER` doit être exceptionnelle, auditée, avec `search_path` maîtrisé, vérification de l'identité et des droits dans son corps, exécution restreinte et tests dédiés. Ne jamais ajouter ce privilège pour masquer une erreur d'autorisation.

Pour UPDATE, examiner la politique SELECT requise par RLS et utiliser des contrôles cohérents dans USING et WITH CHECK. Les décisions d'autorisation ne doivent jamais reposer sur des métadonnées utilisateur modifiables ou une donnée contrôlée par le client.

## 11. Transactions, concurrence et intégrité

Toute opération multi-étapes qui doit rester atomique doit être exécutée dans une transaction ou un mécanisme équivalent correctement conçu.

Définir :
- les invariants à préserver ;
- les contraintes d'unicité ;
- les conditions de concurrence ;
- les règles d'ordre et de dépendance ;
- les comportements en cas d'échec partiel ;
- la stratégie de reprise.

Préférer les contraintes et opérations atomiques de la base aux vérifications applicatives séparées susceptibles de subir une course. Les opérations sensibles doivent être idempotentes lorsque possible. Une répétition de requête ne doit pas créer de doublon ni produire un effet inattendu.

## 12. Migrations et évolution des schémas

Toute évolution du schéma doit être portée par un fichier de migration versionné dans le dépôt, relu et testé localement sur une base jetable.

Règles impératives :
1. examiner les migrations existantes et leur ordre avant d'en ajouter une ;
2. ne jamais réécrire une migration déjà partagée/appliquée pour changer son historique ;
3. choisir un nom descriptif et l'ordre de migration selon les conventions du dépôt ;
4. vérifier les dépendances, contraintes, politiques, fonctions, triggers, index et données existantes ;
5. préférer une migration additive et compatible lorsque cela réduit le risque ;
6. prévoir une stratégie explicite pour les données historiques, doublons et valeurs invalides ;
7. ne pas supprimer ou renommer brutalement un champ utilisé par des clients encore actifs ;
8. tester l'installation depuis une base locale vierge et, si nécessaire, le chemin de mise à niveau depuis un état représentatif ;
9. vérifier que les migrations sont répétables selon le mécanisme du projet et qu'elles ne masquent pas les erreurs ;
10. mettre à jour types, dépôts, tests et documentation.

Ne jamais lancer de migration sur Supabase distant dans le cadre d'un audit ou d'une rédaction documentaire. Toute intervention distante exige une demande distincte et une autorisation explicite.

## 13. Indexation et performances SQL

Créer des index à partir des requêtes et contraintes réelles, pas par réflexe. Évaluer les colonnes de filtrage, jointure, tri, unicité et les index partiels lorsque pertinents.

Un index améliore certains accès mais augmente le stockage et le coût des écritures. Vérifier son utilité, sa sélectivité et son impact.

Éviter :
- les requêtes non filtrées sur de grandes tables ;
- les lectures répétées en boucle (N+1) ;
- les tris coûteux non soutenus par un index pertinent ;
- les colonnes calculées ou conversions empêchant l'usage attendu des index ;
- les index redondants ;
- les transactions inutilement longues.

Examiner les plans d'exécution sur des données représentatives lorsque le volume ou la latence le justifie.

## 14. Sobriété des requêtes, appels et transferts

La réduction des requêtes et du trafic est une exigence permanente.

- Sélectionner uniquement les colonnes et relations nécessaires ; éviter `select(*)` dans les parcours courants.
- Filtrer côté serveur et appliquer pagination/limites explicites.
- Grouper les lectures compatibles sans créer de réponses surdimensionnées.
- Éviter les appels redondants, les rechargements complets après chaque petite modification et les cascades de requêtes.
- Dédupliquer les appels concurrents et annuler les demandes devenues obsolètes.
- Débouncer les recherches et autosuggestions.
- Éviter le polling fréquent ; préférer événements, rafraîchissement ciblé ou consultation à la demande lorsque fiable.
- N'activer Realtime que pour un besoin démontré, avec filtres et cycle de vie des abonnements.
- Mettre en cache les données non sensibles ou dont les règles d'invalidation sont claires ; ne jamais utiliser un cache pour contourner l'autorisation.
- Charger à la demande les historiques, pièces, médias et détails volumineux.
- Ne pas retransmettre un contenu inchangé ; utiliser versions, empreintes ou marqueurs de synchronisation lorsque cela est pertinent.
- Définir timeout, limites de taille, nombre de tentatives et backoff.
- Mesurer le nombre d'appels, les octets transférés, la latence et les coûts associés.

Toute optimisation doit conserver les états d'erreur, les permissions, la cohérence et la capacité de reprise.

## 15. Stockage des fichiers et documents

Les fichiers binaires doivent être conservés dans un stockage objet adapté ; la base conserve les métadonnées, références, droits, empreintes et états nécessaires.

- Les buckets contenant des données privées doivent rester privés.
- Les politiques Storage doivent vérifier le dossier, l'utilisateur et la relation acceptée, pas seulement le préfixe d'un chemin.
- Les URL signées doivent être limitées dans le temps et générées après autorisation.
- Les chemins doivent être stables, non ambigus et ne pas révéler d'informations personnelles inutiles.
- Contrôler taille, type MIME déclaré et contenu lorsque le risque le justifie ; le MIME fourni par le client n'est pas une preuve.
- Préserver l'intégrité des fichiers au moyen d'empreintes lorsque nécessaire.
- Définir les limites de taille et les formats autorisés.
- Éviter les copies inutiles ; compresser ou redimensionner les médias lorsque cela ne dégrade pas la valeur probatoire.
- Ne pas modifier l'original d'une pièce destinée à servir de preuve ; conserver l'original et distinguer les dérivés.
- Documenter la rétention, suppression, export et récupération des objets.

Une ligne de métadonnées ne prouve pas à elle seule que le fichier est encore disponible ou intègre. Les deux doivent être contrôlés.

## 16. Mode hors ligne et stockage local

Le stockage local (IndexedDB, cache ou autre) est une copie opérationnelle, jamais une autorité supérieure à la base serveur.

- Isoler les données par compte et contexte ; empêcher la fuite entre sessions ou utilisateurs sur un appareil partagé.
- Minimiser les données locales, surtout les pièces secrètes et informations hautement sensibles.
- Définir expiration, purge, déconnexion, changement de compte et suppression locale.
- Ne pas supposer que le chiffrement du navigateur ou du système est garanti.
- Ne pas placer de secret serveur ou clé privilégiée dans le client.
- Définir clairement ce qui peut être créé, consulté ou modifié hors ligne.
- Signaler les données en attente, synchronisées, en erreur ou en conflit.
- Ne pas présenter une opération locale comme confirmée sur le serveur avant accusé de réception.

Les files locales doivent conserver les informations nécessaires à la reprise sans stocker des copies superflues ou des données sensibles non nécessaires.

## 17. Synchronisation, idempotence et conflits

Toute opération synchronisable doit avoir une identité stable et un comportement de reprise défini.

- Attribuer une clé ou identité d'opération stable lorsque nécessaire.
- Conserver l'ordre des opérations dépendantes.
- Dédupliquer les opérations identiques.
- Utiliser un mécanisme idempotent pour les créations et transferts susceptibles d'être rejoués.
- Conserver les erreurs utiles, le nombre de tentatives et l'état de reprise sans exposer de données sensibles dans les diagnostics.
- Appliquer un backoff et une limite de tentatives ; ne pas créer de boucle infinie.
- Vérifier à nouveau l'identité et l'autorisation au moment du rejeu, car elles peuvent avoir changé depuis la mise en file.
- Détecter les conflits à partir d'une version, d'un timestamp ou d'une stratégie métier explicite.
- Ne jamais écraser silencieusement une modification distante.
- Préserver les deux versions et demander arbitrage humain lorsque la fusion automatique n'est pas sûre.
- Distinguer conflit, erreur temporaire, accès révoqué, ressource supprimée et donnée invalide.

Une révocation de droit doit être prise en compte lors de la synchronisation ; une opération mise en file avant révocation ne conserve pas automatiquement son autorisation.

## 18. Suppression, rétention et cycle de vie

Chaque catégorie de données doit avoir une règle de conservation, d'archivage, d'export et de suppression, tenant compte de la finalité, des obligations légales et des besoins de preuve.

Distinguer :
- suppression logique et suppression physique ;
- retrait d'accès et suppression de la donnée ;
- suppression du fichier et suppression de sa référence ;
- données actives, archivées, sauvegardées et répliquées ;
- délai de rétention et délai d'effacement des sauvegardes.

La suppression en cascade ne doit être utilisée que si ses effets sont compris et acceptables. Pour les preuves, historiques et litiges, évaluer les obligations de conservation avant toute suppression.

Les suppressions sensibles doivent être autorisées, confirmées, auditées et, lorsque nécessaire, soumises à un délai ou une procédure de récupération. Aucun agent IA ne peut décider seul de supprimer définitivement une donnée sensible.

## 19. Sauvegardes, restauration et portabilité

Définir une stratégie de sauvegarde proportionnée à la criticité : fréquence, rétention, chiffrement, accès, séparation des environnements, restauration et vérification.

Une sauvegarde n'est utile que si sa restauration est testée. Documenter les objectifs de perte de données et de délai de reprise lorsque le service le justifie.

Prévoir des exports dans des formats exploitables, avec relations et métadonnées suffisantes. Ne pas rendre les données captives d'un fournisseur ou d'un format propriétaire sans justification et stratégie de sortie.

Tester la cohérence entre base, fichiers, métadonnées et références lors des exports et restaurations.

## 20. Journaux, audit et observabilité

Les journaux doivent permettre le diagnostic et l'audit sans devenir une copie parallèle des données métier.

- Ne jamais enregistrer mots de passe, jetons, clés, contenus de volontés secrètes, pièces complètes ou prompts sensibles par défaut.
- Préférer identifiants techniques, catégories d'événements, horodatages et résultats.
- Restreindre les accès, fixer une rétention et protéger l'intégrité des traces.
- Distinguer événements métier, traces techniques, métriques et audit de sécurité.
- Ne pas exposer les détails internes d'une ressource à un utilisateur non autorisé.
- Mesurer les volumes et coûts d'observabilité ; éviter la télémétrie bavarde et répétitive.

## 21. Données utilisées par l'intelligence artificielle

Les données transmises à un modèle ou à un service IA doivent être strictement limitées à la tâche, à l'utilisateur, au dossier et aux droits applicables.

- L'IA n'est jamais la source de vérité d'une donnée métier.
- Une réponse générée ne remplace pas une déclaration, une pièce, une vérification ou une décision humaine.
- Conserver la provenance des données utilisées et distinguer faits, hypothèses, synthèses et recommandations.
- Ne pas modifier la donnée source à partir d'une extraction ou interprétation IA sans validation adaptée.
- Ne pas envoyer de pièces secrètes, données sensibles ou documents complets à un fournisseur sans nécessité, base légitime, protection et validation explicites.
- Réduire le contexte, la taille des prompts, le nombre d'appels et les répétitions.
- Préférer des règles déterministes locales aux appels IA pour les validations, calculs, filtres et décisions simples.
- Définir quotas, limites, budgets, alertes, délais et mode de secours.
- L'IA ne peut pas élargir ses propres droits d'accès, décider de la conservation, ni déclencher seule une opération sensible.

Les données dérivées doivent être identifiées comme telles, datées et recalculables ou supprimables sans altérer les sources originales.

## 22. Confidentialité, consentement et partage

La collecte, le partage, l'accès et le traitement doivent respecter les obligations applicables et les choix valides des personnes.

- Ne pas confondre consentement, invitation, acceptation d'accès et preuve d'un droit juridique.
- Une invitation en attente ne vaut pas accès accepté.
- Le partage doit être limité aux ressources et actions explicitement autorisées.
- La révocation doit interrompre les accès futurs et être répercutée dans les caches, sessions, URL signées et opérations différées selon le risque.
- Les données d'une personne ne doivent pas être visibles simplement parce qu'elle apparaît dans le même dossier qu'un autre utilisateur.
- Les données des mineurs ou personnes vulnérables nécessitent une analyse spécifique et des garanties adaptées.

## 23. Tests obligatoires relatifs aux données

Les changements de données doivent être accompagnés de tests adaptés, exécutés localement ou dans un environnement jetable.

Selon le périmètre, vérifier :
- contraintes, types, valeurs nulles et limites ;
- intégrité des clés étrangères et unicité ;
- permissions SELECT/INSERT/UPDATE/DELETE ;
- isolation propriétaire, participant accepté, invitation en attente, tiers et anonyme ;
- impossibilité de réassigner un propriétaire ou d'élargir les droits ;
- accès aux vues, fonctions, RPC et Storage ;
- migrations depuis une base vierge et chemin de mise à niveau ;
- doublons, concurrence, répétition et idempotence ;
- conflits et reprise hors ligne ;
- déconnexion, changement de compte et purge du cache local ;
- sauvegarde, export et restauration lorsque concernés ;
- limites de taille, quotas, volume de requêtes et coût lorsque concernés.

Les tests doivent prouver les refus autant que les accès légitimes. Une suite verte ne couvre que les scénarios effectivement exécutés.

## 24. Observations du dépôt au 8 novembre 2026

Les éléments suivants ont été lus dans la branche documentaire `docs/heritis-development-governance-agents`. Ils sont des constats de code, pas une certification de conformité globale.

### 24.1 Modèle et migrations observés

- Le dépôt contient des migrations Supabase versionnées, notamment une migration de base en avril 2026, des évolutions de septembre/octobre 2026 et des migrations de novembre 2026 pour le type de dossier bâtiment et le modèle immobilier V1.
- La migration `20261108000200_building_real_estate_v1.sql` crée `building_properties`, `building_units`, `building_person_relations` et `building_events`.
- Le modèle immobilier distingue les relations déclarées, les statuts de déclaration, les unités et les événements.
- Des contraintes vérifient le type de dossier bâtiment, la cohérence du terrain parent et l'appartenance d'une unité au même bâtiment.
- Les tables immobilières activent RLS et disposent de tests SQL de régression dédiés.
- Une migration impose l'unicité du chemin de stockage des preuves après détection préalable des doublons historiques.
- Une migration de sécurité Storage vérifie l'appartenance au dossier et l'acceptation du participant pour la lecture des preuves partagées.

### 24.2 Mode hors ligne et synchronisation observés

- `src/data/offline/db.ts` utilise Dexie/IndexedDB avec drafts, queue, cache de dossiers et conflits persistés.
- Le schéma local est versionné jusqu'à la version 3.
- Les opérations de file incluent création, mise à jour, initialisation de parcours, transfert de preuve et suppression de dossier.
- `src/data/offline/sync.ts` contrôle la session et l'identité du propriétaire avant certaines opérations en ligne, conserve des erreurs et traite les conflits.
- `src/data/offline/replay-proof.ts` conserve l'identité de preuve et le chemin de stockage lors des reprises, vérifie le compte courant et le dossier, et confirme l'existence de l'enregistrement après transfert.
- Des tests Vitest couvrent la continuité IndexedDB, la conservation des erreurs, la fusion de changements hors ligne, l'ordre des opérations, les reprises de preuves et certains refus d'accès.

Ces constats ne prouvent pas que toutes les opérations sont sûres dans toutes les conditions, ni que chaque cache est correctement purgé lors de chaque changement de compte. Ces scénarios doivent rester des exigences de vérification.

### 24.3 Limites de l'observation

La présente rédaction n'a pas interrogé ni modifié le projet Supabase distant. Elle ne certifie pas :
- l'état réel des données de production ;
- la configuration effective de chaque bucket et de chaque table ;
- les volumes, performances ou coûts réels ;
- les politiques de rétention et de sauvegarde effectivement configurées ;
- la conformité juridique de chaque traitement ;
- l'exhaustivité de tous les tests de sécurité et de migration.

Toute affirmation plus précise nécessite une inspection et une preuve dédiées, autorisées et adaptées à l'environnement concerné.

## 25. Procédure de revue d'un changement de données

Avant toute modification :
1. identifier la donnée, sa finalité, sa sensibilité et sa source de vérité ;
2. rechercher les usages, relations, politiques, migrations, types, dépôts et tests existants ;
3. examiner les utilisateurs et profils concernés ainsi que les droits requis ;
4. définir les invariants et les effets de bord ;
5. comparer les options simples, natives, gratuites et maintenables ;
6. estimer les requêtes, transferts, stockage, appels externes et coûts ;
7. prévoir migration, compatibilité, reprise et retour arrière ou stratégie corrective ;
8. définir les tests positifs et négatifs ;
9. mettre à jour les documents et contrats impactés ;
10. relire les changements et vérifier les résultats sur le commit exact.

Après le changement, confirmer les fichiers modifiés, les migrations, les tests exécutés, les résultats, les limites et les risques résiduels. Ne pas déclarer conforme un contrôle non exécuté.

## 26. Interdictions

Il est interdit de :
- désactiver RLS pour résoudre rapidement un problème ;
- exposer une clé privilégiée au client ;
- considérer un rôle connecté comme preuve d'autorisation sur toutes les données ;
- utiliser une métadonnée utilisateur modifiable pour décider des droits ;
- stocker une information secrète dans une table, un bucket ou un cache public ;
- laisser une opération hors ligne s'exécuter après révocation sans revalidation ;
- écraser un conflit sans règle métier et trace ;
- multiplier les appels, copies et traitements sans besoin démontré ;
- utiliser une API ou un service payant sans évaluer ses quotas, ses coûts et ses solutions de repli ;
- rendre une fonction V1 essentielle dépendante d'un abonnement obligatoire sans décision formelle ;
- exécuter une migration distante ou manipuler des données de production sans autorisation explicite ;
- présenter une déclaration, une synthèse IA ou une pièce isolée comme une vérité juridique établie.

## 27. Checklist de conformité

Avant validation d'une évolution de données, confirmer :

- [ ] Finalité, propriétaire fonctionnel, source de vérité et sensibilité identifiés.
- [ ] Personnes, comptes, profils et rôles métier distingués.
- [ ] Déclarations, pièces, vérifications et contestations séparées.
- [ ] Modèle relationnel, types, contraintes et relations documentés.
- [ ] Validation serveur et intégrité base présentes.
- [ ] RLS, GRANT, Storage, vues, fonctions et RPC vérifiés.
- [ ] Aucun privilège excessif ni secret côté client.
- [ ] Migration versionnée, ordonnée et testée localement.
- [ ] Mode hors ligne, idempotence, conflits et révocation traités.
- [ ] Cache, purge, suppression, rétention et export définis.
- [ ] Requêtes, transferts, stockage et appels externes minimisés.
- [ ] Option native, simple, gratuite ou open source examinée en premier.
- [ ] Aucun coût inattendu ou abonnement obligatoire pour l'utilisateur V1.
- [ ] IA limitée, traçable et sans autorité sur les données sources.
- [ ] Tests positifs et négatifs exécutés et résultats consignés.
- [ ] Documentation et types applicatifs mis à jour.
- [ ] Limites et risques résiduels explicitement communiqués.

## 28. Documents de référence

- [AGENTS.md](../../AGENTS.md) — instructions obligatoires pour chaque intervenant.
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — méthode de contribution et de revue.
- [GOVERNANCE.md](GOVERNANCE.md) — responsabilités, décisions et autorisations.
- [ARCHITECTURE-RULES.md](ARCHITECTURE-RULES.md) — architecture, frontières et contrats.
- [SECURITY-RULES.md](SECURITY-RULES.md) — sécurité, accès, données sensibles et IA.
- [UI-UX-STANDARDS.md](UI-UX-STANDARDS.md) — confidentialité, performance, sobriété et expérience utilisateur.
- [Documentation Supabase](https://supabase.com/docs) — à consulter pour les comportements dépendants de la version et de la configuration.

---

**Règle finale :** les données de Heritis sont des informations confiées par des personnes et portant potentiellement sur leurs droits, leurs biens, leurs relations et leurs volontés. Leur simplicité de gestion, leur faible coût et leur disponibilité ne justifient jamais une perte de confidentialité, d'intégrité, de provenance ou de contrôle par les personnes autorisées.

---

## Référentiel permanent complémentaire

Les exigences de validation, de qualité du code, de tests, de sécurité, de performance, de maintenabilité et de modernisation sont définies dans [TESTING-REQUIREMENTS.md](TESTING-REQUIREMENTS.md). Elles s'appliquent à tout changement relevant de ce document.

---

## Exigences permanentes de tests et de qualité

Les règles de validation du comportement réel, de qualité du code de production, de sécurité, de maintenabilité, de scalabilité, de résilience, d'accessibilité et de modernisation progressive sont définies dans [TESTING-REQUIREMENTS.md](TESTING-REQUIREMENTS.md). Les techniques éprouvées et déjà maîtrisées doivent être privilégiées ; toute nouvelle technologie doit démontrer son bénéfice, sa maturité, sa sécurité et son coût total avant adoption.

## Référentiel permanent de l'intelligence et des automatisations

Les contextes transmis aux modèles, la mémoire, les données générées, les tâches automatiques et leurs traces doivent respecter [AI-AND-AUTOMATION-RULES.md](AI-AND-AUTOMATION-RULES.md), en complément des présentes règles de données.
