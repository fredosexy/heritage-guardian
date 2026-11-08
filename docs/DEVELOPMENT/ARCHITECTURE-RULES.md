# Règles d’architecture technique — Heritis

**Statut :** référentiel architectural permanent  
**Portée :** application, services, données, intégrations, intelligence artificielle, opérations et évolutions de Heritis  
**Référence d’observation initiale :** branche documentaire `docs/heritis-development-governance-agents`, commit `5476aa1371edcb69b137d7d689a382279d4c28fd`, 8 novembre 2026  
**Autorité :** ce document complète `AGENTS.md`, `CONTRIBUTING.md` et `GOVERNANCE.md`. Il ne remplace pas les spécifications métier, les règles de sécurité, les règles de données ni les standards UI/UX.

---

## 1. Objet et portée

Ce document fixe les règles durables qui encadrent la conception, la construction, la modification, l'intégration, l'exploitation et l'évolution de l'architecture Heritis.

Il s'applique à :
- l'application web et son expérience mobile/PWA ;
- les domaines métier, leurs sous-domaines, parcours, pages et composants ;
- les services transversaux ;
- l'identité, les comptes, profils, relations, rôles et permissions ;
- les modèles de données, dépôts, caches, files locales et synchronisation ;
- les API, fonctions serveur, fonctions Edge et intégrations externes ;
- les documents, preuves, fichiers, notifications et journaux ;
- l'intelligence artificielle, les agents, assistants, moteurs de règles et automatisations ;
- les tests, migrations, configuration, observabilité, livraison et exploitation ;
- les futures applications clientes, interfaces professionnelles et canaux d'accès.

Ces règles concernent tout intervenant : développeur, architecte, contributeur, prestataire, agent IA, outil de génération de code ou mainteneur.

**Principe impératif :** toute évolution doit respecter les frontières, contrats, responsabilités et protections définis ici. Une modification locale ne peut pas contourner une règle architecturale au motif qu'elle est plus rapide ou qu'elle fonctionne dans un écran isolé.

## 2. Règle de vérité : architecture observée et architecture cible

Une documentation d'architecture doit distinguer trois états :

1. **Observé / existant :** confirmé par le code, les configurations, les migrations, les tests ou une preuve d'exécution consultés.
2. **Partiel / à consolider :** mécanisme présent, mais dont la couverture, la cohérence, la sécurité, la robustesse ou l'intégration ne sont pas démontrées complètement.
3. **Cible / exigé :** règle ou capacité architecturale à respecter lors des évolutions, sans prétendre qu'elle est déjà réalisée.

Aucune capacité ne doit être déclarée disponible parce qu'elle figure dans un document, une maquette, une branche non intégrée, un commentaire, un test isolé ou une intention de développement.

Toute cartographie technique datée doit préciser le commit ou la branche observés. Elle doit être réexaminée après une évolution structurante. Les règles permanentes de ce document restent applicables même si l'implémentation change.

## 3. Principes architecturaux non négociables

1. **Domaines métier d'abord :** l'architecture reflète les quatre domaines métier Heritis et leurs frontières.
2. **Responsabilités explicites :** chaque module possède un rôle identifiable et une interface compréhensible.
3. **Source de vérité unique :** une information métier partagée ne doit pas être dupliquée sans raison et stratégie de cohérence documentées.
4. **Séparation des préoccupations :** présentation, orchestration, logique métier, accès aux données et intégrations ne sont pas confondus.
5. **Sécurité par conception :** l'autorisation est vérifiée au niveau de confiance approprié, notamment côté serveur et base de données.
6. **Données traçables :** provenance, auteur, date, statut, version et historique sont conservés lorsque le contexte métier l'exige.
7. **Résilience :** réseau, services tiers, appareils, sessions et modèles IA peuvent être indisponibles.
8. **Évolutivité maîtrisée :** les contrats et schémas sont conçus pour évoluer sans rupture silencieuse.
9. **Accessibilité et compréhension :** l'architecture soutient une expérience claire, inclusive, responsive et utilisable avec des technologies d'assistance.
10. **Intelligence sous contrôle :** l'IA propose, explique et assiste ; elle ne s'attribue pas de pouvoir juridique, métier ou administratif.
11. **Mesure et preuve :** les décisions techniques et affirmations de qualité reposent sur des éléments vérifiables.
12. **Simplicité durable :** ne pas introduire une couche, un service, une abstraction ou une dépendance sans besoin réel et bénéfice explicite.

## 4. Cartographie de contexte et domaines métier

Heritis V1 est organisé autour de quatre domaines métier :

- **Patrimoine et gestion des biens :** identification, déclaration, inventaire, documentation et suivi des biens et des relations déclarées.
- **Héritage et succession :** organisation des personnes, biens, pièces, contributions et étapes d'une situation successorale.
- **Volontés secrètes et dernières volontés :** conservation confidentielle et transmission conditionnelle après vérifications.
- **Gestion des conflits et litiges :** constitution, documentation, suivi et orientation d'une situation conflictuelle.

Les services transversaux soutiennent ces domaines sans devenir des domaines métier supplémentaires : identité, profils, permissions, documents, traçabilité, notifications, assistant adaptatif et synchronisation.

### 4.1 Frontières métier

- Un domaine possède ses règles métier et ses parcours ; il ne doit pas devenir propriétaire des données d'un autre domaine.
- Une donnée commune (personne, bien, document, événement, dossier de référence) est réutilisée par identifiant et contrat partagé, plutôt que recopiée dans chaque domaine.
- Un dossier de succession peut référencer un bien patrimonial ; il ne crée pas une deuxième identité indépendante de ce bien.
- Une volonté peut référencer un bien ou un document, sans transformer cette référence en transfert de propriété ou en décision officielle.
- Un dossier de conflit peut référencer les personnes, biens, pièces et événements concernés sans réécrire leur historique d'origine.
- Les relations déclarées, les preuves documentaires, les vérifications et les décisions officielles doivent rester des concepts distincts.

Les sous-domaines peuvent être représentés par des modules internes, mais ne doivent pas créer de nouveaux domaines métier sans décision produit formelle.

## 5. Architecture en couches et responsabilités

L'architecture doit préserver les responsabilités suivantes, quelle que soit la technologie retenue :

| Couche | Responsabilité | Ne doit pas |
|---|---|---|
| Présentation | Écrans, navigation, composants, états visuels et accessibilité | Porter les règles d'autorisation ou la logique métier de référence |
| Application / orchestration | Enchaîner les cas d'usage, valider les entrées, gérer les états de parcours | Accéder directement à des détails d'infrastructure dispersés |
| Domaine / métier | Règles, invariants, transitions, calculs et politiques métier | Dépendre de React, du navigateur ou d'un fournisseur externe |
| Services applicatifs | Coordonner les cas d'usage, règles partagées et opérations transversales | Devenir un dépôt de fonctions sans responsabilité cohérente |
| Accès aux données | Requêtes, persistance, mapping, transactions et contrats de lecture/écriture | Décider seuls des droits métier ou exposer des secrets |
| Infrastructure / intégrations | Authentification technique, stockage, réseau, fournisseurs, fonctions serveur | Fuir dans les composants d'interface |
| Sécurité / politiques | Autorisation, validation, limites, contrôle des accès et audit | Être réduite à des masquages d'interface |

Les dépendances doivent pointer vers des contrats stables. Les composants visuels appellent des cas d'usage ou hooks adaptés ; ils ne construisent pas eux-mêmes des requêtes sensibles ou des politiques d'accès.

Une évolution peut conserver une structure plus simple si elle respecte ces responsabilités. Il n'est pas obligatoire de créer artificiellement toutes les couches pour chaque fonctionnalité.

## 6. Organisation du code et modularité

### 6.1 Modules par fonctionnalité et domaine

Les fonctionnalités doivent être regroupées par responsabilité métier ou transversale. Un module comprend, selon ses besoins, ses pages, composants, hooks, services, types et tests.

Les points d'entrée publics d'un module (par exemple un fichier `index.ts`) définissent ce que les autres modules peuvent importer. Les imports profonds dans l'implémentation privée d'un autre module sont à éviter ; s'ils deviennent nécessaires, le contrat public doit être réévalué.

### 6.2 Règles de modularité

- Chaque module a un périmètre, un propriétaire fonctionnel et des dépendances identifiables.
- Les composants partagés ne contiennent pas de règles spécifiques à un domaine.
- Les services transversaux ne doivent pas absorber progressivement toutes les règles métier.
- Les types partagés ont un emplacement et une sémantique explicites.
- Les dépendances circulaires sont interdites.
- Les fonctions volumineuses et polyvalentes doivent être découpées par responsabilité, sans micro-abstraction inutile.
- Les conventions de nommage, d'export et de placement sont cohérentes dans tout le dépôt.
- Les fichiers générés sont identifiés et ne sont pas modifiés manuellement, sauf procédure officielle prévue.

### 6.3 Ajout d'un nouveau module

Avant création, préciser : besoin utilisateur, domaine concerné, propriétaire des données, cas d'usage, permissions, dépendances, contrats, états d'erreur, mode hors ligne éventuel, tests, observabilité et documentation. Réutiliser un module existant si son périmètre le permet sans le déformer.

## 7. Frontend, navigation et expérience applicative

Le dépôt observé utilise React, TypeScript, Vite, React Router, TanStack Query, des providers applicatifs, des fonctionnalités regroupées sous `src/features`, des composants UI partagés et des intégrations dédiées.

Ces technologies sont un constat de l'instantané observé, pas une obligation perpétuelle. Toute migration technologique doit être justifiée, planifiée et validée.

### 7.1 Navigation et routes

- Les routes sont déclarées dans une couche de routage centralisée ou dans une architecture équivalente documentée.
- Chaque route précise son niveau d'accès : public, visiteur, personne reconnue, utilisateur authentifié, participant autorisé ou rôle spécialisé.
- Les pages publiques de découverte ne donnent pas accès par simple navigation à des données ou actions privées.
- Les routes protégées ne constituent pas à elles seules une frontière de sécurité : le serveur et la base appliquent aussi les permissions.
- Les redirections, états de chargement, erreurs, routes inconnues et retours après authentification doivent être prévisibles.
- Les paramètres d'URL ne sont jamais considérés comme une preuve d'identité, d'autorisation ou de propriété.

### 7.2 État et données côté interface

- Distinguer état local d'interface, état de parcours, cache de données distantes et persistance locale.
- Les données distantes doivent avoir une politique explicite de chargement, fraîcheur, invalidation, reprise et erreur.
- Ne pas maintenir plusieurs copies concurrentes de la même donnée sans règle de synchronisation.
- Les mutations doivent gérer attente, succès confirmé, rejet, reprise et conflit.
- L'interface ne doit pas annoncer une opération comme enregistrée avant confirmation, sauf si elle indique clairement qu'il s'agit d'un enregistrement local en attente de synchronisation.
- Les composants restent réutilisables, testables et accessibles.

### 7.3 Responsivité et accessibilité

L'architecture UI doit permettre une adaptation aux petits écrans, tablettes et grands écrans, une navigation clavier, des libellés accessibles, un contraste suffisant, des états de focus, une gestion de mouvement réduit et des messages d'erreur compréhensibles. Les règles visuelles détaillées appartiennent au document UI/UX spécialisé.

## 8. Backend, API et contrats

Toute communication entre frontend, fonctions serveur, base de données ou fournisseur externe doit utiliser un contrat explicite.

Un contrat documente au minimum :
- finalité et propriétaire ;
- méthode et point d'entrée ;
- identité et autorisation exigées ;
- schéma des entrées et sorties ;
- limites de taille, pagination, fréquence et durée ;
- erreurs attendues et codes associés ;
- idempotence et comportement de reprise ;
- règles de confidentialité et classification des données ;
- compatibilité et versionnement ;
- tests et journalisation.

### 8.1 Validation et confiance

- Toute entrée externe est non fiable, même si elle provient de l'interface officielle.
- Les données sont validées côté serveur avec des schémas et contraintes adaptés.
- Les valeurs inconnues, champs supplémentaires, types inattendus et charges excessives sont traités explicitement.
- Les erreurs ne révèlent pas de secrets, jetons, données d'autres utilisateurs ou détails internes exploitables.
- Les opérations sensibles sont autorisées au moment de l'action, pas seulement au moment de l'affichage de l'écran.
- Les fonctions serveur vérifient l'identité et les droits dans le contexte réel de la ressource.
- Les secrets et privilèges élevés restent dans l'environnement serveur et ne sont jamais intégrés au bundle client.

### 8.2 Évolution des contrats

Toute modification d'API ou de fonction doit examiner ses consommateurs, les versions déployées, les clients hors ligne, les opérations en attente et les éventuels clients plus anciens. Une rupture doit être versionnée ou précédée d'une stratégie de transition et de retrait.

## 9. Données, persistance et propriété des informations

Les règles détaillées de modélisation, sécurité SQL et gouvernance des données sont définies dans `DATA-AND-DATABASE-RULES.md). Les exigences suivantes s'appliquent à l'architecture globale :

- Chaque entité possède une identité stable et un périmètre de responsabilité.
- Les relations entre personnes, biens, dossiers et documents sont explicites.
- Les rôles déclarés, les droits opérationnels et les décisions officielles ne sont jamais fusionnés dans un champ ambigu.
- La provenance, l'auteur, la date, le statut de vérification et les corrections sont conservés lorsque nécessaires.
- Les suppressions, archivages, anonymisations et rétentions suivent des politiques métier et légales documentées.
- Les données dérivées, caches et index ne deviennent jamais une source de vérité indépendante.
- Les changements de schéma sont migrés, testés et réversibles ou accompagnés d'une stratégie de récupération.
- Les types générés et contrats de base doivent rester cohérents avec les migrations réelles.

Le dépôt observé contient des migrations Supabase sous `supabase/migrations`, des tests SQL sous `supabase/tests/database`, des types Supabase sous `src/integrations/supabase/types.ts` et un schéma Drizzle actuellement déclaré auto-généré et intentionnellement vide. Cette situation doit être traitée explicitement : ne pas supposer que Drizzle constitue aujourd'hui la source du schéma relationnel. Toute évolution du système de modélisation doit choisir et documenter une source de vérité unique.

## 10. Authentification, identité et autorisation

L'architecture distingue au minimum :
- visiteur sans compte ;
- personne reconnue par une première information déclarée ;
- utilisateur authentifié ;
- participant ou invité à une ressource ;
- professionnel ou intervenant disposant d'un rôle spécifique, lorsque cette capacité est mise en place.

L'identité de compte, l'identité déclarée, l'identité vérifiée et les qualités métier sont distinctes. L'authentification prouve le contrôle d'un compte ou d'une session, pas la propriété d'un bien, une filiation, une qualité d'héritier ou un mandat.

L'autorisation suit le principe du moindre privilège, le refus par défaut et la vérification au niveau de la ressource. Elle tient compte de l'acteur, de l'action, de la ressource, du contexte, de la portée, de la durée et du statut de l'accès.

Les permissions effectives sont imposées côté serveur et base de données. Les contrôles frontend servent à l'expérience utilisateur, jamais de substitut aux contrôles de confiance. Les délégations ne peuvent pas transmettre davantage de droits que ceux que le délégant détient.

Les changements de compte, de session, de participant, de propriétaire déclaré, de rôle ou de permission doivent être réévalués avant toute action différée ou synchronisée.

## 11. Synchronisation, mode hors connexion et cohérence distribuée

Le dépôt observé contient une persistance locale Dexie/IndexedDB, des brouillons, une file d'opérations, des caches, des conflits persistés et des mécanismes de reprise. Il existe aussi des hooks de synchronisation et un centre de synchronisation. Ces éléments ne prouvent pas que tous les parcours métier sont déjà compatibles hors ligne.

### 11.1 Principes obligatoires

- Définir pour chaque donnée si elle est disponible hors ligne, modifiable hors ligne, uniquement consultable ou strictement en ligne.
- Distinguer brouillon local, opération en attente, opération envoyée, opération confirmée, rejetée et conflit.
- Toute opération différée conserve son contexte utilisateur, son identifiant de ressource, son type, sa date, son nombre de tentatives et les informations utiles à la reprise.
- Réévaluer l'identité et l'autorisation au moment de la synchronisation ; une autorisation passée ne garantit pas une autorisation présente.
- Rendre les opérations rejouables idempotentes lorsque possible ; sinon, prévenir les doubles effets par une clé d'idempotence ou un mécanisme équivalent.
- Définir une politique de retry, backoff, abandon contrôlé et reprise manuelle.
- Détecter et présenter les conflits sans écraser silencieusement les données distantes.
- Préserver les modifications locales non synchronisées lors des erreurs, fermetures et redémarrages, selon les règles de conservation.
- Ne pas considérer une donnée locale comme sauvegardée sur le serveur.
- Éviter de mettre en cache des contenus sensibles sans chiffrement, durée et politique d'effacement appropriés.

### 11.2 Résolution des conflits

La stratégie dépend du type de donnée et du risque. Les fusions automatiques ne sont permises que pour des champs dont la sémantique le permet et dont les règles sont testées. Les preuves, volontés confidentielles, décisions, droits, rôles et historiques sensibles ne sont jamais fusionnés arbitrairement. L'utilisateur autorisé doit pouvoir comprendre les versions en présence et les conséquences de son choix.

### 11.3 Tests hors ligne

Tester les interruptions réseau, la reconnexion, les sessions expirées, les changements de compte, les opérations dupliquées, les conflits concurrents, les fichiers volumineux, les quotas locaux, les redémarrages et les erreurs partielles. Le statut en ligne du navigateur n'est pas une preuve que le serveur est joignable.

## 12. Fichiers, documents et stockage objet

Les fichiers suivent un cycle de vie explicite : sélection, validation, préparation, envoi, confirmation, association à une ressource, consultation, remplacement, révocation d'accès et éventuelle suppression/expiration.

- Valider taille, type déclaré, contenu réel lorsque possible, nom et chemin.
- Générer ou normaliser les chemins côté serveur ; ne pas faire confiance à un chemin fourni par le client.
- Associer chaque objet à son propriétaire logique et à ses règles d'accès.
- Utiliser des URL temporaires et limitées pour les ressources privées.
- Contrôler les téléchargements, aperçus et suppressions côté serveur.
- Préserver l'intégrité et la traçabilité des versions et remplacements.
- Prévoir reprise d'envoi, idempotence et nettoyage des objets orphelins.
- Ne jamais exposer un bucket privé par une URL permanente ou une règle publique non justifiée.
- Ne pas confondre dépôt d'un document, contrôle technique du fichier et validation de son contenu ou de sa valeur juridique.

## 13. Intelligence Heritis : architecture, responsabilités et garde-fous

L'intelligence est une capacité transversale de Heritis, intégrée aux parcours et domaines lorsqu'elle apporte une aide réelle. Elle ne constitue ni une autorité juridique ni un substitut aux personnes, professionnels, règles métier ou contrôles de sécurité.

Le dépôt observé comprend notamment :
- un module d'interface assistant dans `src/features/assistant` ;
- un service client `src/services/assistant.service.ts` ;
- des fonctions Edge `ai-chat` et `ai-context` ;
- un module partagé de sécurité IA `supabase/functions/_shared/ai-security.ts` ;
- une validation de charge et une limitation de débit côté serveur ;
- un moteur de parcours déterministe `src/services/journey-engine.ts` ;
- des services de suggestions, d'attention et d'aide contextuelle.

Cette observation prouve l'existence de points d'intégration IA et de mécanismes d'assistance ; elle ne prouve pas l'existence d'un agent autonome global, d'une mémoire fiable multi-domaines, d'une orchestration complète ou de toutes les capacités adaptatives visées par le produit.

### 13.1 Architecture fonctionnelle de l'intelligence

L'architecture cible distingue les responsabilités suivantes, qui peuvent être réalisées par un ou plusieurs modules :

1. **Interface conversationnelle et adaptative :** accueille, explique, guide, présente des choix, recueille les intentions et rend les résultats compréhensibles.
2. **Orchestrateur :** identifie le cas d'usage, sélectionne une capacité autorisée, contrôle les étapes et coordonne les outils.
3. **Contexte contrôlé :** fournit uniquement les informations nécessaires, autorisées, à jour et adaptées à la finalité.
4. **Moteur de règles déterministes :** applique les règles métier, transitions, permissions, seuils et validations explicites.
5. **Capacités spécialisées :** recherche, résumé, extraction, classification, aide documentaire, suggestions, explication, détection d'incohérences ou préparation d'une action.
6. **Adaptateurs de modèles et fournisseurs :** isolent les fournisseurs, modèles, versions, paramètres et formats de sortie.
7. **Passerelle d'outils :** expose des actions explicitement autorisées, typées, bornées et journalisées.
8. **Contrôles et évaluation :** vérifient sécurité, qualité, pertinence, coût, latence, dérives et résultats.
9. **Validation humaine :** recueille l'approbation explicite lorsqu'une action ou une conclusion a des conséquences sensibles.

Ne pas implémenter artificiellement tous ces composants en services distincts si le besoin ne le justifie pas. En revanche, leurs responsabilités et frontières de confiance doivent rester séparées.

### 13.2 Règles de fonctionnement de l'intelligence

- L'intelligence adapte ses explications et propositions au contexte, au parcours, au niveau de compréhension et aux permissions de la personne.
- Elle ne déduit pas une identité, une filiation, une propriété, une capacité juridique, un consentement ou une intention irrévocable à partir d'indices insuffisants.
- Elle distingue les faits issus des données, les déclarations d'une personne, les documents fournis, les inférences, les hypothèses et les suggestions.
- Elle signale l'incertitude, les informations manquantes et les limites de son analyse.
- Elle ne transforme pas une suggestion en décision ou mutation de données sans autorisation explicite.
- Elle ne contourne jamais les règles du domaine, les permissions ou les restrictions de confidentialité.
- Elle ne doit pas inventer des sources, pièces, événements, références, citations ou confirmations.
- Elle ne doit pas présenter une réponse générée comme une validation officielle ou un avis professionnel certifié.
- Elle ne peut pas modifier ses propres politiques, ses droits, ses outils autorisés ou ses limites.
- Une panne IA ne doit pas rendre impossible une fonction métier essentielle qui peut fonctionner sans IA.

### 13.3 Intelligence et quatre domaines métier

**Patrimoine et gestion des biens**
- Aider à décrire et classer un bien, préparer une liste de pièces, résumer un dossier, signaler des champs manquants et proposer des prochaines étapes.
- Ne jamais certifier un titre, une limite foncière, une superficie officielle, une propriété ou l'authenticité d'une pièce.
- Les mesures géographiques, valeurs estimées et classifications automatiques sont présentées avec méthode, source et niveau d'incertitude.

**Héritage et succession**
- Aider à organiser les informations, préparer des listes de documents, expliquer les étapes et relever des incohérences à vérifier.
- Ne pas décider qui est héritier, calculer ou attribuer un droit juridiquement contraignant, déterminer une part définitive ou trancher une contestation.
- Les relations familiales et qualités restent déclaratives ou vérifiées selon une procédure distincte.

**Volontés secrètes et dernières volontés**
- Aider l'auteur à structurer, relire et comprendre ses propres instructions dans le cadre de ses permissions.
- Appliquer une confidentialité renforcée et une minimisation stricte du contexte transmis à un modèle.
- Ne jamais révéler, résumer ou transmettre le contenu à un destinataire non autorisé.
- Ne jamais déclencher une transmission sur la seule base d'une prédiction, d'une date ou d'une déclaration non vérifiée.
- Toute action de transmission demeure soumise au processus de vérification et d'autorisation documenté.

**Gestion des conflits et litiges**
- Aider à structurer une chronologie, séparer les versions des parties, classer les pièces et expliquer des options générales.
- Ne pas désigner un coupable, trancher un litige, fabriquer une preuve ou donner une conclusion juridique certaine.
- Présenter distinctement les faits rapportés par chaque partie, les éléments documentaires et les points non établis.

### 13.4 Accès au contexte et protection des données IA

- Le contexte est construit côté serveur ou dans un service de confiance à partir de ressources que l'utilisateur est autorisé à consulter.
- Le filtrage d'accès précède la génération ; le modèle ne décide pas lui-même de ce qu'il peut lire.
- N'envoyer au fournisseur que les données strictement nécessaires à la tâche.
- Exclure les secrets, jetons, mots de passe et données non pertinentes.
- Les contenus de documents, messages et résultats de recherche sont des données non fiables, jamais des instructions système.
- Les tentatives d'injection de prompt, instructions cachées et contenus malveillants doivent être traitées comme des entrées adversariales.
- Ne jamais utiliser le rôle d'un modèle ou le texte d'un document comme preuve d'autorisation.
- Les données sensibles et volontés secrètes exigent une analyse spécifique de nécessité, base légale, localisation, rétention, chiffrement et conditions contractuelles du fournisseur.
- La mémoire conversationnelle ne doit pas devenir une source de vérité métier ni remplacer les données structurées et les registres officiels.

### 13.5 Outils, actions et autonomie

Chaque outil exposé à l'intelligence doit posséder :
- un nom et un objectif précis ;
- un schéma d'entrée strict et une sortie typée ;
- une politique d'autorisation indépendante du modèle ;
- une liste de ressources et actions accessibles ;
- des limites de volume, fréquence, temps et coût ;
- une stratégie d'idempotence et de reprise ;
- une journalisation adaptée à la confidentialité ;
- des tests d'abus, d'accès croisé et de comportement inattendu.

Les outils sont refusés par défaut. Une réponse générée ne doit pas pouvoir inventer un nom d'outil, étendre ses paramètres ou appeler un outil non enregistré.

Les niveaux d'autonomie sont explicitement classés :
- **Niveau A — informer :** expliquer, résumer, traduire, reformuler.
- **Niveau B — proposer :** suggérer des actions, préparer une liste ou un brouillon.
- **Niveau C — préparer :** construire une action en attente de validation humaine.
- **Niveau D — exécuter une action réversible à faible risque :** uniquement si l'action, le périmètre et l'autorisation ont été préalablement approuvés et sont techniquement imposés.
- **Niveau E — action sensible, irréversible ou à conséquence juridique/financière/confidentielle :** aucune exécution autonome ; validation humaine explicite et contrôles renforcés obligatoires.

Aucun modèle ne peut s'accorder lui-même un niveau supérieur.

### 13.6 Évaluation, surveillance et défaillance

Les capacités IA doivent être évaluées sur des cas représentatifs, cas limites, langues supportées, données manquantes, contenus contradictoires, injections de prompt, demandes interdites, accès inter-utilisateurs et erreurs fournisseur.

Mesurer, selon la capacité : exactitude vérifiable, taux d'hallucination observé, pertinence, taux de refus correct, fuite de données, latence, disponibilité, coût, qualité des citations et taux de validation/correction humaine.

Prévoir :
- délais maximum et annulation ;
- quotas et limitation de débit ;
- reprise bornée ;
- réponse de secours déterministe ;
- état explicite « intelligence indisponible » ;
- version du modèle et de la consigne pour les opérations importantes ;
- retour utilisateur et signalement ;
- désactivation rapide d'une capacité défectueuse ;
- réévaluation après changement de modèle, fournisseur, prompt, outil ou contexte.

Une sortie IA non validée ne doit pas être enregistrée comme fait établi. Une sortie acceptée par l'utilisateur doit rester identifiable comme contenu assisté ou validé, avec sa provenance lorsque le risque le justifie.

## 14. Automatisations et moteurs de règles

Les automatisations répétitives doivent être distinguées de l'IA générative. Les règles déterministes gouvernent les transitions, échéances, permissions et conditions métier ; l'IA peut aider à les expliquer ou préparer leur configuration.

Toute automatisation doit préciser déclencheur, conditions, acteur, périmètre, action, conséquences, fréquence, idempotence, erreurs, annulation, journal et propriétaire.

Les actions sensibles nécessitent une approbation appropriée. Une boucle, une répétition infinie, une exécution sur événement dupliqué ou un déclenchement ambigu doivent être empêchés par conception.

Un moteur de parcours doit expliciter les états autorisés, transitions, conditions d'entrée et de sortie, actions bloquantes et règles de reprise. Les transitions critiques ne doivent pas être déterminées uniquement par un modèle probabiliste.

## 15. Services externes, fournisseurs et dépendances

- Toute dépendance doit répondre à un besoin documenté et être approuvée selon le niveau de risque.
- Évaluer maintenance, licence, sécurité, vulnérabilités, politique de confidentialité, disponibilité, coût, verrouillage fournisseur et alternatives.
- Isoler les SDK fournisseurs derrière des adaptateurs lorsque leur présence diffuse dans le code créerait un couplage excessif.
- Épingler et mettre à jour les versions selon une politique contrôlée ; examiner les changements majeurs.
- Définir timeout, retry, circuit breaker ou mécanisme équivalent selon la criticité.
- Ne pas faire dépendre un parcours essentiel d'un service tiers sans mode dégradé adapté.
- Documenter la localisation des données, sous-traitants et conditions de traitement.
- Les outils de génération de code ne peuvent pas imposer silencieusement une dépendance, un fournisseur ou une architecture.

Le dépôt observé inclut Supabase, un fournisseur de passerelle IA, Vite PWA, React Query, Dexie et plusieurs bibliothèques UI. Cette liste décrit les dépendances observées et ne constitue pas une obligation de conserver chaque fournisseur ou bibliothèque.

## 16. Sécurité architecturale et frontières de confiance

La sécurité est transversale et doit être intégrée à chaque couche :
- client considéré comme modifiable et non fiable ;
- serveur et base de données comme lieux d'application des politiques d'accès ;
- secrets réservés aux environnements de confiance ;
- séparation stricte des privilèges utilisateur et administrateur ;
- validation et normalisation des entrées ;
- protections contre injection, CSRF/XSS selon les surfaces, abus d'API, élévation de privilèges et accès inter-comptes ;
- limitation de débit et prévention des abus ;
- gestion sécurisée des sessions, jetons et révocations ;
- chiffrement en transit et au repos selon les capacités et obligations ;
- journalisation sans fuite de contenu sensible ;
- sauvegarde, restauration et réponse aux incidents.

Les détails d'implémentation et contrôles obligatoires relèvent de `SECURITY-RULES.md`. Aucune règle d'architecture ne peut diminuer un contrôle de sécurité.

## 17. Performance, capacité et évolutivité

Chaque fonctionnalité doit considérer :
- temps de chargement initial et navigation ;
- volume de données et pagination ;
- requêtes N+1 et chargements répétés ;
- indexation et coûts des requêtes ;
- poids du bundle et chargement différé ;
- mémoire, batterie et réseau mobile ;
- limites de stockage local ;
- taille des fichiers et opérations longues ;
- latence des services IA et fournisseurs ;
- concurrence, verrouillage et cohérence des écritures ;
- croissance des utilisateurs, dossiers, documents et journaux.

Les optimisations doivent s'appuyer sur des mesures ou un risque démontré. Les caches doivent avoir une durée, une clé de partitionnement, une règle d'invalidation et une stratégie de confidentialité. Ne jamais sacrifier la sécurité ou l'intégrité pour un gain de performance non démontré.

## 18. Résilience, erreurs et observabilité

Chaque frontière réseau, stockage ou fournisseur doit définir les erreurs possibles, le comportement utilisateur, la stratégie de reprise et les informations de diagnostic.

- Les erreurs sont classées (validation, authentification, autorisation, conflit, indisponibilité, limite, erreur interne).
- Les messages utilisateurs sont utiles sans révéler les détails internes.
- Les journaux techniques utilisent des identifiants de corrélation et évitent les données personnelles non nécessaires.
- Les actions critiques produisent des traces auditables protégées contre l'altération non autorisée.
- Les métriques et alertes couvrent disponibilité, erreurs, latence, files en attente, échecs de synchronisation et consommation IA.
- Les données d'observabilité ont leur propre politique d'accès et de rétention.
- Les erreurs ne doivent pas être silencieusement avalées lorsqu'elles compromettent la cohérence ou la sécurité.
- Les mécanismes de secours doivent être documentés et testés.

## 19. Configuration, environnements et secrets

Les environnements local, test, intégration, préproduction et production doivent être distingués. Les paramètres propres à un environnement sont externalisés et validés au démarrage.

- Aucun secret réel dans le dépôt, les bundles clients, les logs ou les fixtures.
- Les fichiers d'exemple ne contiennent que des valeurs fictives.
- Les variables publiques client sont explicitement identifiées comme publiques.
- Les clés privilégiées restent exclusivement côté serveur.
- Les environnements de test utilisent des projets, bases et données isolés.
- Les migrations et essais destructifs se déroulent localement ou dans un environnement explicitement autorisé.
- Aucun agent ou contributeur ne modifie un environnement distant sans autorisation explicite et procédure approuvée.
- Les opérations de restauration, rotation et révocation des secrets sont documentées.

## 20. Migrations, compatibilité et cycle de vie

Toute migration de données ou de contrat suit un processus explicite :
1. inventorier les consommateurs et dépendances ;
2. définir l'état initial et l'état cible ;
3. prévoir les données existantes et les clients en retard ;
4. écrire une migration reproductible et contrôlée ;
5. tester sur une base locale fraîche et sur un scénario de mise à niveau ;
6. prévoir validation, sauvegarde et récupération ;
7. déployer selon un ordre compatible ;
8. vérifier les résultats et documenter la preuve ;
9. retirer l'ancien contrat seulement après confirmation de l'absence de consommateurs.

Privilégier les évolutions compatibles (ajout, double lecture/écriture transitoire, migration progressive) plutôt que les ruptures directes. Une migration ne doit jamais effacer une information historique sans autorisation métier, légale et technique explicite.

## 21. Tests architecturaux et critères d'acceptation

Les règles détaillées sont dans `TESTING-REQUIREMENTS.md`. Toute évolution architecturale doit néanmoins fournir les preuves adaptées :

- tests unitaires des règles et transformations ;
- tests de contrats entre modules ;
- tests d'intégration des dépôts et services ;
- tests de routes et parcours ;
- tests d'autorisation et d'accès croisé ;
- tests SQL/RLS et migrations locales ;
- tests de synchronisation et conflits ;
- tests des fonctions Edge et fournisseurs simulés ;
- tests IA : cas adversariaux, confidentialité, qualité et limites d'outils ;
- tests de performance lorsque le risque l'exige ;
- tests de non-régression des fonctionnalités existantes.

Les tests doivent vérifier le comportement et les invariants, pas seulement l'existence d'un composant ou la couverture de lignes. Un test simulé ne prouve pas à lui seul le comportement réel d'un fournisseur. Les tests locaux ne prouvent pas que la configuration distante est identique.

## 22. Documentation et décisions d'architecture

Toute décision structurante est enregistrée dans un ADR (Architecture Decision Record) ou un registre équivalent :
- contexte et problème ;
- exigences et contraintes ;
- options examinées ;
- décision et justification ;
- conséquences positives et négatives ;
- risques et mesures ;
- état (proposé, accepté, remplacé, rejeté) ;
- auteur, date et liens vers PR/tests/documents.

La documentation doit refléter le code réel et indiquer les écarts. Les diagrammes de contexte, composants, flux de données, séquences sensibles et déploiement sont mis à jour lorsqu'ils deviennent inexacts.

Une décision acceptée ne remplace pas les règles de gouvernance. Toute exception est traitée selon `GOVERNANCE.md`.

## 23. Processus obligatoire pour toute évolution architecturale

Avant de modifier :
1. lire `AGENTS.md`, `CONTRIBUTING.md`, `GOVERNANCE.md` et les règles spécialisées pertinentes ;
2. vérifier branche, commit, état de la PR et changements récents ;
3. cartographier les modules, contrats, données et consommateurs concernés ;
4. établir l'état réel et les tests existants ;
5. préciser le besoin, les risques, les alternatives et les conséquences ;
6. obtenir les validations requises selon la matrice de gouvernance.

Pendant la modification :
- travailler sur une branche dédiée ;
- limiter le périmètre et éviter les refactorisations opportunistes ;
- préserver les contrats ou documenter leur évolution ;
- ajouter les tests et la documentation au même lot ;
- ne jamais contourner une règle par une implémentation temporaire non tracée.

Avant de proposer la livraison :
- vérifier le diff complet ;
- exécuter les contrôles pertinents ;
- relire les migrations, droits et flux de données ;
- confirmer les dépendances et impacts ;
- vérifier les parcours utilisateur et états d'erreur ;
- documenter ce qui a été testé, ce qui ne l'a pas été et les risques résiduels.

Une PR n'est pas une autorisation de fusion. Les décisions de fusion, déploiement ou intervention sur un service distant suivent les autorisations définies dans `GOVERNANCE.md`.

## 24. Interdictions architecturales

Il est interdit de :
- placer les règles métier centrales uniquement dans les composants d'interface ;
- utiliser une donnée issue du client comme preuve d'autorisation ;
- dupliquer les identités métier ou créer des sources de vérité concurrentes ;
- mélanger rôle, relation déclarée, permission et statut de vérification ;
- permettre à l'IA de contourner une règle métier, une permission ou une validation humaine ;
- exposer des secrets ou des privilèges élevés au frontend ;
- fusionner silencieusement des modifications concurrentes sensibles ;
- exécuter des opérations irréversibles par une automatisation non autorisée ;
- faire dépendre une fonction essentielle d'un fournisseur sans stratégie de dégradation ;
- déclarer une fonctionnalité opérationnelle sur la seule base d'une spécification ;
- modifier une architecture distante, un environnement Supabase ou un projet Lovable sans autorisation explicite ;
- supprimer une protection ou un test pour faire passer une livraison sans décision documentée.

## 25. Checklist de conformité architecturale

Une évolution est prête pour revue lorsque les réponses sont documentées :

- [ ] Le domaine et le propriétaire fonctionnel sont identifiés.
- [ ] Les responsabilités des couches et modules restent claires.
- [ ] Les contrats et consommateurs impactés sont identifiés.
- [ ] La source de vérité des données est claire.
- [ ] Les identités, relations, rôles et permissions restent distincts.
- [ ] Les contrôles serveur et base de données sont prévus.
- [ ] Les erreurs, reprises et états hors ligne sont définis.
- [ ] Les dépendances externes et fournisseurs sont justifiés.
- [ ] Les impacts IA et automatisation sont évalués, le cas échéant.
- [ ] Les données transmises à l'IA sont minimisées et autorisées.
- [ ] Les actions sensibles exigent les validations adéquates.
- [ ] Les migrations et compatibilités sont planifiées.
- [ ] Les tests couvrent les invariants et les scénarios à risque.
- [ ] Les mesures d'observabilité et de diagnostic sont suffisantes.
- [ ] La documentation et les ADR sont à jour.
- [ ] Le diff et les preuves de contrôle ont été examinés.
- [ ] Aucune action distante ou fusion non autorisée n'est engagée.

## 26. État architectural initial observé

Cette section constitue une photographie datée et non une garantie de pérennité. Elle sert de point de départ à l'application des règles et doit être actualisée lors d'un audit architectural.

### 26.1 Technologies et points d'entrée observés

- Application React 18 et TypeScript, construite avec Vite.
- Navigation avec React Router.
- Providers incluant TanStack Query, thème, notifications, internationalisation et authentification.
- Fonctionnalités regroupées sous `src/features`.
- Composants UI partagés sous `src/components/ui`.
- Types métier partagés sous `src/core/types`.
- Services applicatifs sous `src/services`.
- Dépôts de données sous `src/data`.
- Intégration Supabase sous `src/integrations/supabase`.
- Fonctions serveur sous `supabase/functions`.
- Migrations SQL sous `supabase/migrations` et tests de base sous `supabase/tests/database`.
- Persistance locale Dexie/IndexedDB et mécanismes de synchronisation.
- Tests Vitest et Testing Library ; workflows GitHub Actions de qualité, migrations locales et intégration Edge.
- PWA configurée dans Vite avec stratégie de cache à examiner selon la sensibilité des ressources.

### 26.2 Frontières de code observées

Les fonctionnalités observées comprennent notamment identité, accueil, dossiers, alertes, assistant, fichiers, profil, shell et synchronisation. Les dépôts couvrent notamment dossiers, bâtiments, preuves, participants, alertes, profils et procédures.

Les services observés incluent moteur de parcours, aide contextuelle, assistant, suggestions, scoring, attention, synchronisation et résolution de conflits. Ces regroupements doivent être évalués au fil des évolutions pour éviter les responsabilités croisées.

### 26.3 Limites de l'observation

Cette photographie ne constitue pas un audit exhaustif de chaque fichier, route, migration, politique RLS, fournisseur ou comportement en production. Elle ne certifie pas :
- que chaque domaine métier est entièrement implémenté ;
- que chaque route est correctement protégée ;
- que toutes les données sont synchronisées ou disponibles hors ligne ;
- que toutes les opérations sont idempotentes ;
- que tous les flux IA sont complets, sûrs ou évalués ;
- que les stratégies de cache conviennent à toutes les données ;
- que les environnements distants correspondent aux fichiers du dépôt ;
- que les workflows CI ont réussi sur chaque commit.

Toute affirmation de conformité exige une vérification dédiée et des preuves adaptées.

## 27. Références et articulation documentaire

Ce document doit être lu avec :
- `/AGENTS.md` — instructions générales obligatoires pour agents et contributeurs ;
- `/CONTRIBUTING.md` — processus de contribution et revue ;
- `/docs/DEVELOPMENT/GOVERNANCE.md` — autorité, décisions, risques, responsabilités et dérogations ;
- `SECURITY-RULES.md` — règles de sécurité détaillées ;\n- `UI-UX-STANDARDS.md` — règles permanentes de conception des interfaces, actions, mobile-first, offline-first, performance et accessibilité ;
- `DATA-AND-DATABASE-RULES.md` — données, schémas, migrations et accès ;
- `TESTING-REQUIREMENTS.md` — stratégie et seuils de preuve ;
- `AI-AND-AUTOMATION-RULES.md` — exigences spécialisées relatives à l'intelligence et aux automatisations ;
- spécifications des quatre domaines métier et services transversaux ;
- décisions d'architecture (ADR) et documents de déploiement pertinents.

Les références spécialisées annoncées mais non encore publiées sont des documents à produire, et non des politiques déjà disponibles. Jusqu'à leur publication, les principes applicables de `AGENTS.md`, `GOVERNANCE.md`, des règles de sécurité existantes et des spécifications métier restent obligatoires.

---

**Règle finale :** l'architecture Heritis doit rester compréhensible, modulaire, sécurisée, traçable, résiliente et évolutive. L'intelligence doit s'y intégrer comme une capacité assistive contrôlée, jamais comme une autorité parallèle. Toute évolution doit préserver la cohérence entre les quatre domaines métier, les personnes, les biens, les droits déclarés, les documents, les décisions et les actions réellement autorisées.
