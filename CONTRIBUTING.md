# CONTRIBUTING.md — Contribuer au projet Heritis

Ce document décrit la méthode de contribution applicable aux développeurs, contributeurs et équipes intervenant sur Heritis.

Il complète le référentiel racine [AGENTS.md](AGENTS.md), qui reste la source centrale des instructions applicables, ainsi que [GOVERNANCE.md](docs/DEVELOPMENT/GOVERNANCE.md), qui définit les responsabilités, les décisions, les autorisations et les mécanismes de contrôle. En cas de contradiction, suspendre l'action concernée et demander une clarification ; ne pas choisir silencieusement la règle la moins contraignante.

## 1. Avant de commencer

Toute contribution doit commencer par une phase de compréhension :

1. Lire intégralement [AGENTS.md](AGENTS.md) et [GOVERNANCE.md](docs/DEVELOPMENT/GOVERNANCE.md).
2. Lire les instructions locales du répertoire concerné, si elles existent.
3. Lire les documents produit et techniques pertinents, en vérifiant leur statut et leur date.
4. Examiner la branche de base, les commits récents, les PR ouvertes et les dépendances.
5. Reproduire ou comprendre le comportement actuel avant de proposer une correction.
6. Définir le périmètre, les risques, les tests, les autorisations et la documentation à mettre à jour.

Ne pas commencer une implémentation sur la base d'une supposition, d'une ancienne capture d'écran ou d'une description qui n'a pas été confrontée à l'état réel du dépôt.

## 2. Choisir et cadrer une contribution

Chaque contribution doit répondre à un objectif identifiable : correction, amélioration, évolution fonctionnelle, sécurité, performance, documentation ou tests.

Avant le développement, préciser dans la description de la tâche ou de la PR :

- le problème ou le besoin observé ;
- le comportement actuel et le comportement attendu ;
- les profils, parcours et domaines concernés ;
- les données, permissions, services et dépendances touchés ;
- les éléments explicitement hors périmètre ;
- les critères d'acceptation vérifiables ;
- les tests et la documentation nécessaires.

Une contribution doit rester aussi limitée que possible. Si l'audit révèle un problème indépendant ou un périmètre beaucoup plus large, le documenter et proposer une tâche ou une PR séparée plutôt que d'élargir silencieusement le changement.

## 3. Environnement et installation

Le dépôt utilise Bun et son lockfile pour une installation reproductible.

    git clone <repository-url>
    cd <repository-directory>
    bun install --frozen-lockfile
    bun run dev

Ne pas remplacer le gestionnaire de paquets ni régénérer le lockfile sans nécessité démontrée et justification dans la PR.

Avant de lancer les commandes, vérifier les scripts réellement disponibles dans package.json et les versions d'outils attendues par le dépôt. Les commandes ci-dessous correspondent aux commandes documentées par le README ; si elles ont évolué, signaler l'écart et suivre la configuration actuelle vérifiée.

## 4. Branches et commits

- Ne pas développer directement sur main.
- Créer une branche descriptive, dédiée à un objectif cohérent.
- Partir de la branche de base réellement appropriée et à jour.
- Respecter les dépendances entre PR ; indiquer clairement lorsqu'une branche dépend d'une autre PR non fusionnée.
- Ne pas réécrire l'historique partagé ni forcer une mise à jour de branche sans autorisation.
- Préférer des commits petits et explicites, avec des messages décrivant l'intention.
- Ne pas inclure de fichiers générés, secrets, données personnelles, exports ou modifications sans rapport avec la tâche.

Exemples de préfixes de branches : fix/, feat/, docs/, test/, refactor/, security/.

Exemples de messages : fix(sync): preserve queued proof uploads ; docs(governance): define contributor workflow.

## 5. Règles d'implémentation

- Respecter les conventions et abstractions déjà présentes après les avoir examinées.
- Ne pas dupliquer les règles métier, les composants ou les sources de vérité.
- Ne pas contourner les contrôles d'accès dans l'interface, les API, les fonctions backend ou la base.
- Ne pas introduire de données fictives ou de boutons sans action réelle dans une fonctionnalité présentée comme opérationnelle.
- Préserver la compatibilité avec les données et parcours existants.
- Traiter explicitement les états de chargement, erreur, absence de données, refus d'accès et fonctionnement hors ligne lorsque concernés.
- Ajouter des tests de non-régression pour les corrections et les comportements métier modifiés.
- Ne pas réduire la sécurité ou désactiver un test pour obtenir une CI verte.

Les règles spécialisées de sécurité, données, architecture, UI/UX et IA sont définies dans les documents référencés par AGENTS.md. Lire notamment [GOVERNANCE.md](docs/DEVELOPMENT/GOVERNANCE.md) et [ARCHITECTURE-RULES.md](docs/DEVELOPMENT/ARCHITECTURE-RULES.md) avant toute évolution structurante. Toute contribution d'interface doit respecter [UI-UX-STANDARDS.md](docs/DEVELOPMENT/UI-UX-STANDARDS.md), ainsi que [DESIGN_SYSTEM_UI_UX.md](docs/DESIGN_SYSTEM_UI_UX.md) et [UX-PRINCIPLES.md](docs/UX-PRINCIPLES.md). Toute contribution touchant l'identité, les permissions, les données privées, les fichiers, les fonctions serveur, l'IA ou les automatisations doit également respecter [SECURITY-RULES.md](docs/DEVELOPMENT/SECURITY-RULES.md).

## 6. Données, sécurité et environnements

- Ne jamais commiter de secrets, clés privées, jetons, mots de passe, fichiers d'environnement réels ou données personnelles identifiantes.
- Utiliser des données synthétiques pour les tests et exemples.
- Ne pas effectuer de migration, modification de données, déploiement ou changement de configuration sur le projet Supabase distant sans autorisation explicite.
- Exécuter les tests de migrations sur une base locale ou jetable isolée.
- Tester les permissions positives et négatives avec des profils distincts.
- Ne jamais considérer une protection d'interface comme une autorisation serveur.
- Ne pas présenter une déclaration, un lien entre personnes et biens, un document téléversé ou une coordonnée GPS comme une preuve juridique ou une vérification officielle.
- Signaler immédiatement toute exposition accidentelle de secret ou de donnée sensible ; ne pas reproduire la valeur dans la PR ou les journaux.

## 7. Interface et expérience utilisateur

Toute contribution d'interface doit respecter le référentiel obligatoire [UI-UX-STANDARDS.md](docs/DEVELOPMENT/UI-UX-STANDARDS.md), la direction validée Heritage Premium : vert forêt, ivoire et or patiné, avec prise en compte du mode clair et du mode sombre. Les règles « moins, mais mieux », charge mentale minimale, mobile-first, offline-first, découverte sans compte obligatoire, actions réelles et performance s'appliquent à toutes les pages et tous les domaines.

Vérifier, selon le périmètre :

- lisibilité et hiérarchie des contenus ;
- cohérence des composants et des parcours ;
- adaptation mobile, tablette et grand écran ;
- interactions tactiles et clavier ;
- contraste, focus et libellés accessibles ;
- états vides, chargement, erreur, succès et accès refusé ;
- absence de fausses actions ou d'éléments purement décoratifs présentés comme fonctionnels.

Ne pas appliquer une refonte globale lorsqu'une évolution ciblée suffit. Toute modification importante d'un parcours doit expliquer ses conséquences sur les autres écrans et profils.

## 8. Tests et vérifications

Exécuter au minimum les contrôles pertinents parmi ceux documentés par le dépôt :

    bun run test
    bun run lint
    bun run build

Pour une contribution touchant les migrations, le schéma, les politiques ou les fonctions backend, exécuter également les tests locaux de base de données et d'intégration prévus par les workflows du dépôt.

Pour une contribution d'interface, vérifier les vues et états concernés sur les formats et thèmes applicables. Pour une contribution de sécurité, vérifier explicitement les refus d'accès attendus.

Dans la PR, indiquer pour chaque contrôle : commande ou workflow, résultat exact, commit testé et éventuelle limite. Un contrôle non exécuté, absent ou dont le résultat n'est pas disponible doit être indiqué comme non vérifié.

Ne jamais affirmer qu'un test manuel a été effectué si ce n'est pas le cas.

## 9. Documentation et traçabilité

Mettre à jour dans la même branche ou PR les documents affectés par la contribution :

- parcours, règles métier et critères d'acceptation ;
- architecture, contrats et dépendances ;
- données, migrations et permissions ;
- limites, risques et procédures opérationnelles ;
- tests et résultats observés.

Décrire séparément ce qui est implémenté, partiel, planifié, reporté ou non vérifié. Une spécification validée n'est pas la preuve que la fonctionnalité est déjà disponible.

Après validation d'un domaine ou sous-domaine, sa documentation GitHub doit être mise à jour et vérifiée avant de commencer le domaine suivant.

## 10. Ouvrir une Pull Request

Une PR doit :

- avoir un titre précis et un périmètre compréhensible ;
- expliquer le besoin, l'approche et les impacts ;
- lister les changements notables ;
- préciser les domaines, parcours, profils et permissions concernés ;
- référencer les tâches ou PR dépendantes ;
- indiquer les tests exécutés et leurs résultats exacts ;
- décrire les tests manuels réalisés et ceux qui restent à faire ;
- signaler les risques, limites et décisions attendues ;
- identifier la documentation mise à jour.

Utiliser une PR en brouillon tant que le travail ou les vérifications ne sont pas prêts pour revue. Ne pas déclarer la PR prête uniquement parce que le code compile.

Une PR dépendante d'une autre doit cibler la branche de dépendance appropriée jusqu'à ce que l'ordre d'intégration permette son rattachement à la branche principale. Ne pas masquer cette dépendance.

## 11. Revue et intégration

Les contributeurs doivent répondre aux commentaires de revue avec les changements nécessaires ou une explication factuelle.

Avant intégration, vérifier :

- que le diff correspond au périmètre annoncé ;
- qu'aucun secret ou fichier non souhaité n'est inclus ;
- que les contrôles requis ont été exécutés sur le dernier commit ;
- que les dépendances sont satisfaites ;
- que les permissions et scénarios négatifs sont couverts lorsque concernés ;
- que la documentation correspond au comportement réellement livré ;
- que les conflits et changements intervenus sur la branche de base ont été examinés.

La fusion reste soumise aux autorisations du propriétaire du projet et aux règles de gouvernance de AGENTS.md. Une approbation technique ou une CI verte ne constitue pas, à elle seule, une autorisation de fusion.

## 12. Déclaration de fin de contribution

Le compte rendu final doit être factuel et contenir :

1. l'objectif réalisé ;
2. les fichiers et comportements modifiés ;
3. les tests exécutés et leurs résultats ;
4. les vérifications manuelles réellement effectuées ;
5. les éléments non vérifiés ;
6. les limites et risques restants ;
7. la documentation mise à jour ;
8. les dépendances ou décisions encore nécessaires.

La contribution est considérée prête à être examinée lorsque son périmètre est clair, son état est reproductible, ses contrôles sont rapportés honnêtement et ses limites sont explicites.

---

**Principe de contribution Heritis :** comprendre avant de modifier, préserver avant de remplacer, vérifier avant d'affirmer et documenter avant de passer à la suite.
