# Exigences permanentes de tests, de qualité et de validation — Heritis

**Statut :** référentiel permanent et obligatoire pour toute contribution, évolution, correction, livraison et maintenance de Heritis.  
**Portée :** code de production, architecture, fonctionnalités, interfaces, données, sécurité, performance, scalabilité, accessibilité, résilience, intelligence artificielle, dépendances et exploitation.  
**Référence d'observation initiale :** branche `docs/heritis-development-governance-agents`, état du dépôt inspecté le 8 novembre 2026. Les constats décrivent uniquement les éléments effectivement lus ; ils ne constituent ni une certification globale ni une preuve d'exécution des tests.

---

## 1. Objet

Ce document définit ce que Heritis doit vérifier avant de considérer un changement comme acceptable. Les tests ne sont pas une formalité destinée à rendre une pipeline verte : ils doivent démontrer, dans les limites de leur portée, que le produit fonctionne, protège les personnes et les données, reste compréhensible, maintenable, évolutif et exploitable.

La qualité attendue porte simultanément sur :
- la justesse des fonctionnalités et des parcours réels ;
- la qualité professionnelle du code de production ;
- la sécurité et le respect des droits ;
- l'intégrité et la cohérence des données ;
- la stabilité, la résilience et la durabilité ;
- la performance et la scalabilité ;
- l'accessibilité, la compréhension et l'utilisabilité ;
- la modernité technique et la compatibilité ;
- la maîtrise des coûts et la sobriété des ressources ;
- la capacité à diagnostiquer, corriger et faire évoluer le système.

Un test réussi prouve seulement le comportement qu'il couvre dans l'environnement où il a été exécuté. Il ne prouve pas l'absence de défauts non testés.

## 2. Hiérarchie et vocabulaire

- **OBLIGATOIRE** : exigence de conformité.
- **RECOMMANDÉ** : pratique par défaut ; toute alternative doit être motivée.
- **CONDITIONNEL** : applicable selon le risque, la fonctionnalité et l'environnement.

Distinguer :
- test défini ;
- test exécuté ;
- test réussi ;
- test échoué ;
- test ignoré ou non applicable ;
- contrôle bloqué par une dépendance ;
- contrôle non exécuté ;
- défaut connu et risque accepté.

Ne jamais présenter un test prévu, en attente, ignoré ou non exécuté comme réussi. Toute synthèse doit préciser le commit exact, l'environnement, les commandes/scénarios exécutés, les résultats et les limites.

## 3. Principes non négociables

1. Tester le comportement attendu, pas seulement l'implémentation interne.
2. Tester les refus, les erreurs et les limites autant que les cas nominaux.
3. Vérifier le code réellement livré, et non un état local différent.
4. Ne pas confondre compilation, tests unitaires, intégration et validation fonctionnelle.
5. Ne pas réduire la qualité à un pourcentage de couverture.
6. Prioriser les risques réels pour les personnes, les biens, les volontés, les données et la continuité.
7. Préserver les fonctionnalités existantes lors d'une évolution.
8. Éviter les tests fragiles qui vérifient les détails d'implémentation sans valeur métier.
9. Rechercher des preuves reproductibles et traçables.
10. N'introduire ni outil, ni framework, ni technologie uniquement parce qu'ils sont récents ou populaires.

## 4. Ordre de maturité technique : éprouvé avant nouveau

### 4.1 Principe de progression

Heritis doit d'abord exploiter correctement les techniques éprouvées, maintenues et adaptées à son architecture. Avant de remplacer une méthode existante ou d'introduire une nouvelle technologie, vérifier si le problème peut être résolu par :
- une meilleure compréhension de la cause ;
- une correction du code ou du modèle existant ;
- une configuration correcte ;
- l'utilisation plus complète d'un outil déjà présent ;
- une amélioration incrémentale et testable ;
- une bibliothèque ou une capacité native déjà maîtrisée.

La nouveauté n'est pas une preuve de qualité. Une technique mature, comprise, documentée et bien testée est préférable à une nouveauté qui augmente les risques, la complexité ou la dépendance.

### 4.2 Conditions d'adoption d'une nouvelle technique

Une nouvelle technologie, bibliothèque, architecture, méthode de test ou plateforme ne peut être adoptée qu'après :
1. description du problème que l'existant ne résout pas suffisamment ;
2. comparaison d'au moins une solution éprouvée et de l'alternative nouvelle ;
3. examen de la maturité, de la maintenance, de la sécurité et de la compatibilité ;
4. évaluation de la courbe d'apprentissage et de la compréhension par l'équipe ;
5. évaluation du coût de migration, d'exploitation, de test et de sortie ;
6. vérification des licences, quotas, confidentialité et dépendances ;
7. prototype limité lorsque le risque le justifie ;
8. tests comparatifs et critères de succès définis à l'avance ;
9. décision documentée selon la gouvernance applicable ;
10. plan de retour arrière ou de coexistence pendant la migration.

Aucune migration globale ne doit être engagée sur la seule base d'une préférence technologique.

### 4.3 Modernisation progressive

Moderniser signifie améliorer mesurablement la sécurité, la qualité, l'expérience, la performance ou la maintenabilité. La modernisation doit être incrémentale, compatible, documentée et réversible autant que possible. Ne pas remplacer une technologie stable sans bénéfice concret.

## 5. Périmètre des tests

Chaque changement doit être évalué selon les couches pertinentes :
- analyse statique, formatage et conventions ;
- compilation et vérification des types ;
- tests unitaires ;
- tests de composants et d'interface ;
- tests d'intégration entre modules et services ;
- tests de contrat API ;
- tests base de données, migrations, RLS et Storage ;
- tests de parcours de bout en bout ;
- tests de sécurité ;
- tests d'accessibilité et d'ergonomie ;
- tests de performance et de charge ;
- tests de résilience, reprise et mode hors ligne ;
- tests de compatibilité et de non-régression ;
- tests de build et de packaging de production.

La sélection dépend du risque et des changements. Les contrôles de sécurité et de données ne peuvent pas être omis au motif qu'un changement est principalement visuel si celui-ci touche les routes, les informations affichées, les téléchargements, les permissions ou les flux de données.

## 6. Qualité du code de production

Le code livré doit être professionnel, lisible, cohérent, testable, maintenable et adapté à la responsabilité du module.

Exigences :
- responsabilités explicites et séparation des préoccupations ;
- fonctions et composants de taille raisonnable ;
- noms qui décrivent le métier et l'intention ;
- types précis et contrats explicites ;
- gestion des erreurs, états limites et cas asynchrones ;
- absence de code mort, duplication injustifiée et logique contradictoire ;
- absence de secrets, données de test ou diagnostics sensibles ;
- validation des entrées aux frontières de confiance ;
- dépendances maîtrisées et imports cohérents ;
- documentation des décisions et comportements non évidents ;
- pas de contournement par `any`, assertions forcées, désactivation de règles ou exceptions globales sans justification.

La correction doit être faite à la source du problème. Ne pas masquer une erreur de type, un échec de test ou une vulnérabilité avec une suppression de contrôle, un mock excessif ou un test rendu moins strict.

## 7. Compréhensibilité et maintenabilité

Un autre développeur ou agent autorisé doit pouvoir comprendre le rôle du code, ses entrées, ses sorties, ses effets de bord et ses limites.

- Favoriser des abstractions justifiées plutôt que des couches inutiles.
- Éviter les architectures prématurément génériques.
- Documenter les invariants métier, les contrats et les décisions non évidentes.
- Garder les noms, types, tests et documentation alignés.
- Préférer une logique simple et explicite à une astuce compacte difficile à relire.
- Éviter les commentaires qui répètent le code ; expliquer le pourquoi et les contraintes.
- Maintenir les guides à proximité des changements concernés.
- Traiter la complexité cyclomatique, les dépendances croisées et les effets de bord comme des signaux de revue.

La compréhensibilité est un critère de qualité mesurable en revue : si un changement critique ne peut pas être expliqué clairement, il n'est pas prêt à être livré.

## 8. Tests unitaires

Les tests unitaires vérifient une fonction, règle métier ou unité isolée avec des dépendances maîtrisées.

Ils doivent couvrir :
- valeurs normales et cas limites ;
- entrées invalides et données manquantes ;
- erreurs et exceptions ;
- règles métier et transitions d'état ;
- limites numériques, dates, fuseaux et formats ;
- idempotence et répétition lorsque pertinentes ;
- décisions d'autorisation lorsque la logique est isolée ;
- invariants et cas de régression.

Un test unitaire ne doit pas simuler à l'excès le système au point de ne vérifier que le mock. Les assertions doivent examiner le résultat observable et les effets attendus.

## 9. Tests d'interface et de composants

Tester les interfaces avec des interactions utilisateur réalistes :
- rendu initial, chargement et données vides ;
- navigation, recherche, filtres et pagination ;
- formulaires, validations et messages d'erreur ;
- confirmation et annulation ;
- états hors ligne, synchronisation, conflit et reprise ;
- restrictions visiteur, utilisateur reconnu et utilisateur inscrit ;
- permissions et données réellement visibles ;
- affichage mobile, tablette et grand écran ;
- clavier, focus, lecteur d'écran et zoom ;
- absence de boutons sans action et de liens incorrects.

Ne pas tester seulement l'existence d'un élément : vérifier qu'il conduit à l'action, à l'état ou à la navigation attendus.

## 10. Tests d'intégration et contrats

Vérifier les interactions réelles entre les composants, dépôts, API, fonctions Edge, stockage, base et services externes.

- Contrats d'entrée/sortie documentés et validés.
- Formats, codes d'erreur et comportements de timeout testés.
- Authentification et identité propagées correctement.
- Autorisations réévaluées à chaque frontière de confiance.
- Échecs partiels et reprise testés.
- Compatibilité des versions client/serveur examinée.
- Les mocks restent limités aux dépendances qu'il est légitime d'isoler.

Un test d'intégration simulé ne doit pas être présenté comme une validation de l'environnement réel.

## 11. Base de données, migrations et droits

Les changements SQL/Supabase doivent être testés sur une base locale jetable, jamais sur une base distante de production dans le cadre des contrôles ordinaires.

Vérifier selon le périmètre :
- migrations depuis un état vierge ;
- mise à niveau depuis un état représentatif ;
- ordre et dépendances des migrations ;
- contraintes, clés étrangères, index et triggers ;
- RLS et grants pour chaque opération ;
- vues, fonctions, RPC et fonctions privilégiées ;
- Storage et accès aux fichiers ;
- propriétaire, participant accepté, invitation en attente, tiers et utilisateur anonyme ;
- concurrence, transactions, unicité et idempotence ;
- suppression, rétention et cohérence des références.

Les tests doivent démontrer les refus. Le fait qu'une requête retourne zéro ligne n'est pas toujours équivalent à un refus d'écriture ou à une politique complète ; examiner le comportement exact.

## 12. Sécurité : tests négatifs et adversariaux

Tester les menaces pertinentes pour le changement :
- accès horizontal à une ressource appartenant à un autre utilisateur ;
- accès vertical et élévation de privilèges ;
- contournement des routes, APIs, RPC et Storage ;
- session expirée, révoquée ou changée ;
- invitations non acceptées et accès suspendus ;
- manipulation des identifiants, rôles, métadonnées et paramètres ;
- injection SQL, XSS, CSRF et validation des entrées selon les surfaces ;
- abus de quotas, répétition et déni de service ;
- fuite dans logs, erreurs, cache, exports ou réponses IA ;
- injection de prompt directe et indirecte ;
- utilisation abusive d'outils par l'IA ;
- dépendances vulnérables et secrets accidentellement publiés.

Les scénarios doivent inclure les utilisateurs autorisés, non autorisés, anonymes, participants en attente et accès révoqués lorsque pertinents.

## 13. Tests de fonctionnalités et parcours métier complets

Les parcours d'entrée doivent tester séparément : visiteur sans compte (présentation et aperçu guidé uniquement), personne reconnue après saisie d'un prénom ou d'un nom (sans privilège supplémentaire), utilisateur authentifié (conversation complète sous réserve des permissions), et identité vérifiée lorsque le domaine l'exige. Vérifier qu'aucun de ces états ne donne implicitement accès aux données ou actions d'un autre état.


Chaque fonctionnalité doit être testée selon son parcours réel, pas uniquement par un test technique isolé.

Pour chaque parcours :
1. état initial et préconditions ;
2. rôle et niveau d'identification ;
3. actions utilisateur ;
4. données créées ou modifiées ;
5. autorisations à chaque étape ;
6. retours visuels et messages ;
7. états d'erreur et annulation ;
8. conséquences sur les autres modules ;
9. continuité hors ligne et synchronisation si applicable ;
10. résultat final vérifiable.

La validation doit couvrir les sous-domaines, les actions et les interactions réellement annoncés dans l'interface. Une page présente ne prouve pas que le parcours est opérationnel.

## 14. Non-régression et compatibilité

Avant une modification, identifier les fonctionnalités et contrats qui pourraient être affectés.

Vérifier :
- les parcours existants ;
- les API et schémas utilisés par les autres modules ;
- les droits et règles métier ;
- les comportements visiteurs et utilisateurs authentifiés ;
- les données historiques et migrations ;
- les tailles d'écran et appareils supportés ;
- les navigateurs et capacités réellement ciblés ;
- les scénarios hors ligne et de reprise.

Toute régression connue doit être documentée, évaluée et corrigée ou explicitement bloquée avant livraison selon sa gravité.

## 15. Performance, scalabilité et maîtrise des ressources

La performance doit être mesurée sur des scénarios représentatifs, pas seulement ressentie.

Évaluer :
- temps de chargement initial et navigation ;
- rendu et interactions ;
- taille des bundles et ressources ;
- nombre de requêtes, appels API et requêtes SQL ;
- taille des réponses et octets transférés ;
- latence, temps de traitement et consommation mémoire ;
- comportement avec volume croissant de personnes, dossiers, relations, événements et documents ;
- pagination, index et plans SQL lorsque nécessaires ;
- contention, concurrence et limites des services ;
- consommation CPU, mémoire, stockage et bande passante.

Éviter N+1, chargements globaux, polling excessif, requêtes redondantes et payloads trop larges. Préférer les capacités déjà maîtrisées (pagination, filtres serveur, index, cache sûr, batching, lazy loading) avant d'introduire un système de cache ou d'infrastructure supplémentaire.

Les seuils de performance doivent être définis par parcours critique et mesurés sur un environnement documenté. Ne pas inventer de seuil universel sans mesure ni justification.

## 16. Résilience, durabilité et continuité

Tester les comportements en cas de :
- réseau lent, intermittent ou absent ;
- timeout, erreur serveur ou indisponibilité fournisseur ;
- session expirée ou révocation d'accès ;
- reprise après fermeture ou redémarrage ;
- opérations rejouées ou reçues plusieurs fois ;
- synchronisation concurrente ;
- conflit de données ;
- stockage saturé ou fichier invalide ;
- quota atteint ;
- restauration d'une sauvegarde lorsque le périmètre le justifie.

Vérifier qu'aucune donnée confirmée n'est perdue, qu'aucun conflit n'est écrasé silencieusement et que l'utilisateur comprend l'état réel de son opération.

## 17. Accessibilité et compréhension utilisateur

La validation UX doit examiner la compréhension et l'accomplissement de la tâche, pas uniquement l'apparence.

- Contraste, tailles de texte et hiérarchie.
- Navigation clavier, focus visible et ordre logique.
- Labels, instructions et erreurs compréhensibles.
- Compatibilité lecteurs d'écran.
- Cibles tactiles et adaptation aux petits écrans.
- États de chargement, attente, succès, échec et indisponibilité.
- Vocabulaire cohérent et absence d'ambiguïté sur les droits ou les preuves.
- Pas de confirmation trompeuse d'une opération non enregistrée.

Prendre WCAG 2.2 AA comme référence cible, en documentant les écarts et limites réellement vérifiés.

## 18. Tests de l'intelligence artificielle

Les tests IA doivent vérifier le système complet : données transmises, règles d'accès, prompts, outils, modèle, réponses, validation et traces.

Tester :
- exactitude et pertinence sur des cas représentatifs ;
- hallucinations et réponses incertaines ;
- distinction faits, hypothèses et recommandations ;
- injection de prompt directe et dans documents ;
- fuite de contexte entre utilisateurs et dossiers ;
- refus d'accès et contrôle serveur indépendant du modèle ;
- outils autorisés, schémas, arguments et validation serveur ;
- actions sensibles nécessitant approbation ;
- limites de taille, quotas, coût, timeout et rate limit ;
- indisponibilité du fournisseur et mode de repli ;
- non-répétition d'appels et absence d'envoi inutile de données ;
- absence de modification autonome des données sources.

Les résultats probabilistes doivent être évalués par jeux de cas versionnés et critères explicites ; une réponse plausible n'est pas une preuve de vérité.

## 19. Dépendances, chaîne logicielle et modernité

Vérifier régulièrement :
- versions réellement installées et lockfile ;
- vulnérabilités connues et avis de sécurité ;
- maintenance, activité et provenance des dépendances ;
- licences et compatibilité ;
- dépendances transitives et scripts d'installation ;
- compatibilité avec les versions runtime et navigateur ciblées ;
- dépréciations et migrations nécessaires.

Mettre à jour de façon contrôlée, groupée lorsque pertinent, avec tests de non-régression. Ne pas appliquer aveuglément les dernières versions ni laisser des composants obsolètes sans plan. La modernité attendue signifie sécurité, support, standards actuels et compatibilité démontrée, pas nouveauté systématique.

## 20. Qualité statique, types et conventions

Les contrôles statiques doivent être utiles et réellement exécutés :
- ESLint et règles adaptées ;
- TypeScript et vérification des types ;
- formatage cohérent si configuré ;
- détection des imports inutilisés, erreurs et code mort ;
- règles React Hooks et dépendances ;
- validation des contrats et schémas.

Ne pas désactiver une règle globalement pour faire passer le pipeline. Les exceptions doivent être locales, motivées et suivies.

Les règles de typage doivent progresser vers une sécurité réelle : éviter les `any` injustifiés, réduire les assertions non vérifiées et renforcer progressivement les options strictes sans migration massive non testée.

## 21. Build et validation de production

Le build de production doit être exécuté et contrôlé sur le commit candidat.

Vérifier :
- compilation et résolution des dépendances ;
- variables de configuration attendues, sans secrets dans les artefacts ;
- routes et ressources générées ;
- taille et chargement des bundles ;
- erreurs et avertissements significatifs ;
- PWA/service worker si concernés ;
- comportement du mode production, pas seulement du serveur de développement.

Un build réussi ne remplace pas les tests fonctionnels, de sécurité, d'accessibilité ou de performance.

## 22. Tests end-to-end et environnements

Les parcours critiques doivent disposer de tests bout en bout lorsque l'environnement et les outils du dépôt le permettent.

Un E2E doit :
- démarrer sur un environnement isolé et reproductible ;
- utiliser des comptes et données de test dédiés ;
- vérifier les actions et résultats observables ;
- nettoyer les ressources créées ;
- éviter toute donnée de production ;
- ne pas dépendre d'un service payant sans autorisation ;
- conserver les diagnostics nécessaires sans divulguer de données sensibles.

Si aucun outil E2E n'est présent ou configuré, le signaler comme lacune et proposer une adoption justifiée, sans prétendre que les tests existent. Les essais manuels restent utiles mais doivent être consignés avec étapes, environnement, résultat et preuve.

## 23. Tests de charge et limites

Les tests de charge sont proportionnés au risque, à la maturité et au volume attendu. Ils doivent être exécutés dans un environnement contrôlé, jamais contre la production sans autorisation explicite.

Évaluer progressivement :
- charge nominale ;
- croissance de volume ;
- concurrence ;
- pics temporaires ;
- limites de quota ;
- dégradation et récupération.

Ne pas générer de charge coûteuse ou destructrice. Définir une limite d'arrêt et un budget avant toute campagne.

## 24. Coût des tests et sobriété CI

La qualité doit être obtenue avec une utilisation responsable des ressources.

- Éviter de lancer plusieurs fois le même contrôle sans raison.
- Réutiliser les résultats seulement lorsque le commit, les dépendances et l'environnement sont strictement identiques.
- Exécuter les contrôles ciblés pendant le développement, puis la suite requise avant livraison.
- Paralléliser uniquement si cela réduit le temps sans dépasser les ressources ou créer des conflits.
- Préférer les environnements locaux/jetables et les outils déjà présents.
- Limiter les données, artefacts, logs et rétentions inutiles.
- Surveiller les minutes CI, volumes de stockage, appels API et coûts d'exécution.
- Définir des quotas et des mécanismes d'arrêt pour les tests externes ou IA.
- Ne jamais diminuer les tests de sécurité essentiels pour économiser quelques secondes ou appels.

La V1 doit rester gratuite pour l'utilisateur. Les tests ne doivent pas introduire une dépendance payante obligatoire pour utiliser les fonctionnalités V1.

## 25. Gestion des défauts et gravité

Chaque défaut doit être qualifié selon son impact, son exploitabilité, les personnes affectées, l'exposition des données, la possibilité de contournement et la réversibilité.

- **Bloquant** : compromission, perte/corruption grave, accès indu à des données sensibles, action juridique/irréversible incorrecte, parcours central inutilisable.
- **Critique** : défaut de sécurité ou d'intégrité important, régression majeure, indisponibilité d'une fonction essentielle.
- **Majeur** : parcours important dégradé, erreur fonctionnelle significative, performance ou accessibilité empêchant un usage normal.
- **Modéré** : défaut limité avec contournement raisonnable.
- **Mineur** : défaut cosmétique ou amélioration sans impact notable sur l'usage.

Les niveaux doivent être appliqués avec jugement et documentés. Les défauts bloquants et critiques non résolus empêchent la livraison. Une dérogation ne peut pas rendre acceptable une violation de sécurité fondamentale.

## 26. Seuils de livraison et critères d'acceptation

Un changement est livrable uniquement si :
- les exigences fonctionnelles sont reliées à des scénarios vérifiables ;
- le code est relu et compréhensible ;
- les tests pertinents sont exécutés sur le commit candidat ;
- les contrôles de sécurité et de données pertinents sont concluants ;
- aucune régression bloquante ou critique n'est ouverte ;
- le build de production est valide ;
- les impacts performance, coûts et scalabilité sont évalués ;
- les documents et contrats sont à jour ;
- les risques résiduels et contrôles non exécutés sont explicités ;
- les autorisations humaines requises sont obtenues.

Une pipeline verte est une condition utile, jamais une autorisation automatique de fusion ou de déploiement.

## 27. Preuves et compte rendu de validation

Toute revue finale doit consigner :
1. commit SHA testé ;
2. environnement et versions principales ;
3. commandes et scénarios réellement exécutés ;
4. résultats détaillés : réussi, échoué, ignoré, bloqué, non exécuté ;
5. tests manuels et étapes de reproduction ;
6. défauts connus et gravité ;
7. contrôles de sécurité, données et permissions ;
8. mesures de performance ou limites si pertinentes ;
9. fichiers et migrations impactés ;
10. risques résiduels et recommandation.

Les captures, logs et artefacts doivent être utiles, limités et expurgés de secrets et données personnelles.

## 28. Constats du dépôt au 8 novembre 2026

Les éléments suivants ont été inspectés sur la branche documentaire `docs/heritis-development-governance-agents`. Ils décrivent des outils et tests présents dans le dépôt ; leur présence ne prouve pas qu'ils ont été exécutés avec succès sur le commit actuel.

### 28.1 Outillage observé

- `package.json` expose `build`, `lint`, `test` et `test:watch`.
- Le dépôt utilise Vite, React, TypeScript, ESLint et Vitest.
- `vitest.config.ts` configure l'environnement jsdom et les tests `src/**/*.{test,spec}.{ts,tsx}`.
- La configuration TypeScript racine observée laisse plusieurs contrôles permissifs (`noImplicitAny: false`, `strictNullChecks: false`, variables et paramètres inutilisés non bloquants dans ce fichier). La stricte application effective dépend aussi des configurations référencées ; elle doit être examinée avant toute conclusion globale.
- Aucun fichier de configuration Playwright, Cypress ou équivalent n'a été identifié dans l'arbre de dépôt inspecté. Cela ne prouve pas l'absence de toute validation manuelle ou externe, mais les E2E automatisés ne doivent pas être supposés présents.

### 28.2 Tests existants observés

Des tests Vitest sont présents pour :
- dépôts et services de dossiers, preuves, propriété et réclamations ;
- composants et parcours de pages ;
- authentification et navigation ;
- synchronisation et continuité IndexedDB ;
- conflits et reprise hors ligne ;
- handlers et sécurité des fonctions IA ;
- logique de parcours et données publiques.

Des tests SQL pgTAP existent notamment pour les droits IA, les parcours de dossier, les relations immobilières et l'accès aux preuves. Un script d'intégration Edge existe pour tester des fonctions locales avec des utilisateurs isolés, des accès et des limites de requêtes.

### 28.3 Limites observées

L'inspection documentaire et de quelques tests ne permet pas de conclure :
- que tous les parcours métier sont couverts ;
- que tous les tests sont actuellement verts ;
- que l'ensemble du code est strictement typé ;
- que des E2E automatisés complets sont configurés ;
- que les performances ont été mesurées à grande échelle ;
- que la charge, la reprise après sinistre et la restauration ont été testées ;
- que tous les navigateurs/appareils ciblés sont couverts ;
- que les seuils d'accessibilité sont atteints ;
- que les dépendances ne présentent aucune vulnérabilité ;
- que les quotas et coûts d'exploitation réels sont connus.

Ces points doivent être vérifiés par des contrôles dédiés avant toute déclaration de conformité.

## 29. Procédure de test d'un changement

### Avant le changement
1. comprendre le besoin et le comportement actuel ;
2. identifier les parcours, données, droits et modules touchés ;
3. consulter les tests existants et les incidents connus ;
4. choisir les contrôles selon les risques ;
5. définir les résultats attendus et les critères d'acceptation ;
6. choisir d'abord les outils et techniques déjà maîtrisés ;
7. estimer les ressources, quotas et coûts de test.

### Pendant le changement
1. ajouter ou adapter les tests avec le code ;
2. exécuter rapidement les contrôles ciblés ;
3. corriger la cause racine des défauts ;
4. éviter les mocks qui masquent les intégrations réelles ;
5. maintenir la documentation et les types ;
6. ne pas contourner un test qui révèle une régression.

### Avant livraison
1. vérifier le diff complet ;
2. exécuter les contrôles requis sur le commit exact ;
3. vérifier les migrations sur une base locale jetable ;
4. exécuter les tests fonctionnels, sécurité et non-régression pertinents ;
5. contrôler le build de production ;
6. vérifier l'état réel de chaque workflow ;
7. documenter les contrôles non exécutés et risques restants ;
8. attendre les validations humaines requises.

## 30. Interdictions

Il est interdit de :
- déclarer un test réussi sans résultat vérifiable ;
- transformer un test échoué en test ignoré sans justification ;
- supprimer ou affaiblir un test uniquement pour faire passer CI ;
- utiliser uniquement des mocks pour prétendre valider un système réel ;
- ignorer les tests négatifs et les refus d'accès ;
- valider un changement sensible avec le seul build ;
- adopter une technologie nouvelle sans comparaison et preuve de bénéfice ;
- moderniser par remplacement systématique d'outils stables ;
- lancer des tests de charge coûteux sans limite ni autorisation ;
- tester sur des données réelles ou Supabase distant sans autorisation distincte ;
- exposer secrets, données personnelles ou documents sensibles dans les artefacts ;
- accepter une faille critique au motif que le reste de la pipeline est vert ;
- présenter la couverture comme un indicateur suffisant de qualité.

## 31. Checklist finale

- [ ] Le comportement métier et les critères d'acceptation sont définis.
- [ ] Les parcours et sous-domaines affectés sont identifiés.
- [ ] Le code de production est lisible, typé, professionnel et maintenable.
- [ ] Les techniques éprouvées ont été privilégiées ; toute nouveauté est justifiée.
- [ ] Les tests unitaires, composants et intégration pertinents sont exécutés.
- [ ] Les tests DB, migrations, RLS, Storage et permissions pertinents sont exécutés.
- [ ] Les scénarios négatifs, sécurité et abus sont couverts.
- [ ] Les parcours utilisateur et la non-régression sont vérifiés.
- [ ] La performance, la scalabilité et les volumes sont évalués selon le risque.
- [ ] La résilience, l'offline et les reprises sont vérifiés si concernés.
- [ ] L'accessibilité et la compréhension sont évaluées.
- [ ] Le build de production est réussi sur le commit candidat.
- [ ] Les dépendances, standards et dépréciations sont examinés.
- [ ] Les ressources, appels, minutes CI et coûts sont maîtrisés.
- [ ] Les contrôles non exécutés, défauts et risques résiduels sont déclarés.
- [ ] Les documents et preuves sont mis à jour.
- [ ] Les autorisations humaines de livraison sont obtenues.

## 31 bis. Exigences de validation PWA

Toute évolution du manifeste, du service worker, des caches, de l'installation ou du mode hors ligne doit être vérifiée selon [PWA-OPERATIONS.md](PWA-OPERATIONS.md).

- [ ] Le manifeste est valide et les icônes déclarées existent avec les dimensions attendues.
- [ ] L'installation et la détection du mode autonome sont testées selon les capacités Android/iOS.
- [ ] Les réponses privées et les URL signées ne sont pas placées dans un cache runtime générique.
- [ ] Les données IndexedDB sont cloisonnées par identité de lecteur et les anciennes entrées non attribuées sont traitées.
- [ ] Le changement de compte ne révèle aucune donnée locale du compte précédent.
- [ ] Le service worker gère l'état prêt hors ligne, les erreurs et les mises à jour sans perte de saisie.
- [ ] La perte et le retour du réseau sont testés avec les files d'opérations et les conflits existants.
- [ ] Les essais réels sur Android et iOS sont documentés séparément des tests CI.

## 32. Référentiels complémentaires

- [AGENTS.md](../../AGENTS.md) — instructions applicables à chaque agent et intervenant.
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — contribution, tests et revue.
- [GOVERNANCE.md](GOVERNANCE.md) — décisions, responsabilités et autorisations.
- [ARCHITECTURE-RULES.md](ARCHITECTURE-RULES.md) — architecture et contrats.
- [SECURITY-RULES.md](SECURITY-RULES.md) — sécurité, droits et menaces.
- [UI-UX-STANDARDS.md](UI-UX-STANDARDS.md) — expérience, accessibilité et performance.
- [DATA-AND-DATABASE-RULES.md](DATA-AND-DATABASE-RULES.md) — données, migrations, stockage, synchronisation et coûts.

---

**Règle finale :** Heritis ne doit pas simplement réussir à compiler ou afficher des écrans. Il doit être démontrablement fiable dans ses parcours réels, protéger les personnes et leurs données, rester compréhensible et maintenable, évoluer sans fragiliser l'existant, et adopter les techniques nouvelles uniquement lorsqu'elles apportent une amélioration prouvée et durable.

## Référentiel permanent de l'intelligence et des automatisations

Les tests des prompts, modèles, agents, outils, sorties structurées et automatisations sont soumis à [AI-AND-AUTOMATION-RULES.md](AI-AND-AUTOMATION-RULES.md), en complément du présent référentiel de tests.
