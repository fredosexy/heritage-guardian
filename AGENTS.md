# AGENTS.md — Gouvernance de développement Heritis

> **Portée :** ce fichier s'applique à l'ensemble du dépôt et à toute intervention sur Heritis : développement, correction, refactorisation, documentation, tests, automatisation et assistance par IA.
>
> **Statut :** règles de référence du dépôt. Les documents spécialisés viendront les compléter. Une règle spécialisée peut préciser une règle générale, mais ne peut pas affaiblir les garde-fous fondamentaux définis ici.

## 1. Instruction obligatoire avant toute intervention

Avant de lire, créer, modifier, déplacer ou supprimer du code, tout agent IA, développeur ou contributeur doit :

1. Lire intégralement ce fichier.
2. Lire les fichiers `AGENTS.md` plus proches du répertoire concerné, s'ils existent.
3. Consulter les documents spécialisés pertinents déjà présents dans `docs/`.
4. Examiner l'état réel de la branche, les changements non intégrés, les Pull Requests dépendantes et les contrôles disponibles.
5. Comprendre le comportement existant, les utilisateurs concernés, les droits nécessaires et les effets secondaires possibles.
6. Définir un périmètre de modification limité et expliquer les incertitudes avant d'agir.

Si une instruction spécialisée référencée n'existe pas encore, ne pas prétendre l'avoir consultée : appliquer les règles de ce fichier, signaler le document manquant et ne pas inventer son contenu.

**Interdiction de commencer par une réécriture, une suppression ou une migration sans audit préalable de l'existant.**

## 2. Principes non négociables

- Préserver les fonctionnalités existantes qui sont correctes et utilisées.
- Préférer une évolution ciblée, réversible et testable à une refonte générale.
- Ne jamais supprimer, contourner ou affaiblir une protection pour faire passer un test ou simplifier une implémentation.
- Ne jamais remplacer un comportement réel par une maquette, une donnée fictive ou une action qui semble fonctionner sans produire le résultat annoncé.
- Ne jamais déclarer une fonctionnalité terminée, sécurisée ou validée sans preuve vérifiable.
- Ne jamais masquer une erreur, un état incomplet, une perte de données ou une limite connue.
- Ne pas dupliquer une fonctionnalité, un service, une règle métier ou une source de vérité sans raison documentée.
- Respecter les décisions validées par le propriétaire du projet. En cas de contradiction ou d'ambiguïté ayant un impact fonctionnel, sécuritaire, juridique, financier ou sur les données, suspendre l'action concernée et demander une décision.
- Ne pas élargir le périmètre d'une tâche sans justification et validation.
- Distinguer systématiquement ce qui existe, ce qui est en cours, ce qui est proposé et ce qui est reporté.

## 3. Gouvernance du travail et autorisations

### 3.1 Périmètre des interventions

- Le travail sur le projet s'effectue dans le dépôt GitHub, selon les branches et Pull Requests prévues.
- Ne pas modifier directement le projet ou le code Lovable. Lovable conserve son propre fonctionnement et sa synchronisation habituelle avec GitHub.
- Ne pas appliquer de migration, modifier des données, déployer une fonction ou changer la configuration du projet Supabase distant sans autorisation explicite préalable.
- Les tests de base de données et de migrations doivent utiliser un environnement local ou jetable isolé, jamais le projet Supabase actif.
- Ne pas accéder à des secrets, les afficher, les copier dans les journaux ou les inscrire dans le dépôt. Utiliser les mécanismes sécurisés prévus par l'environnement.

### 3.2 Branches et Pull Requests

- Ne pas travailler directement sur `main`.
- Créer une branche dédiée à un objectif cohérent, à partir de la base réellement à jour et appropriée.
- Avant de créer ou modifier une branche, vérifier les branches existantes, la base des PR liées et leurs dépendances.
- Ne pas fusionner aveuglément une branche ancienne ou divergente. Comparer les changements et porter uniquement les apports utiles.
- Garder une PR en brouillon tant que son périmètre, ses contrôles et sa revue ne sont pas prêts.
- Ne jamais fusionner, fermer ou réorienter une PR sans autorisation explicite du propriétaire du projet.
- Respecter l'ordre des dépendances entre PR. Ne pas fusionner une PR dépendante avant ses prérequis.
- Une CI verte ne remplace pas la revue fonctionnelle, la vérification des permissions ni les essais manuels nécessaires.
- Ne pas déclarer une PR prête si un contrôle requis est absent, en échec ou non exécuté. Décrire précisément les exceptions.

### 3.3 Actions sensibles

Une confirmation explicite est obligatoire avant toute action destructive, irréversible ou affectant un environnement partagé : suppression de données ou de ressources, migration distante, déploiement, changement de droits globaux, fusion, réécriture d'historique ou rotation de secrets.

## 4. Compréhension du produit Heritis

Heritis est une application patrimoniale évolutive. Elle ne doit pas être réduite à un simple registre de biens ou à une collection de formulaires.

Chaque évolution doit considérer, selon le périmètre concerné :

- les domaines métier, leurs sous-domaines et leurs relations ;
- les parcours, pages, sous-pages, étapes et états ;
- les services, fonctionnalités, activités, actions et interactions réellement disponibles ;
- les personnes, profils associés, relations, rôles et permissions ;
- les biens, dossiers, documents, événements, preuves et historiques ;
- les notifications, échanges, demandes, invitations et évolutions externes ;
- les usages connectés, hors ligne, en reprise de connexion et sur appareils mobiles ;
- les conséquences sur les autres domaines et sur les données déjà enregistrées.

Ne pas inventer la liste officielle des domaines, leurs règles ou leur périmètre. Se référer à la documentation produit existante et aux décisions validées. Si elle est incomplète, relever le manque avant de figer une architecture.

### 4.1 Parcours et niveaux d'accès

- Distinguer clairement visiteur, personne reconnue/identifiée et utilisateur disposant d'un compte authentifié.
- Dès qu'une personne communique un prénom ou un nom (l'un ou l'autre suffit), elle passe à l'état « personne reconnue » dans le parcours ; cette reconnaissance ne constitue jamais une authentification, une preuve d'identité ni une autorisation d'accès.
- Sans compte authentifié, la personne conserve uniquement un aperçu guidé ; la conversation complète exige un compte et une session valide.
- Le visiteur découvre la vision et les explications de Heritis et ne doit pas accéder à des fonctions de gestion qu'il ne peut pas encore utiliser légitimement.
- Un aperçu public ne doit exposer ni données privées, ni actions réservées, ni informations appartenant à d'autres utilisateurs.
- L'accès complet dépend d'une session valide, des permissions effectives et des règles métier applicables ; la simple présence d'un écran ou d'un bouton ne donne aucun droit.

### 4.2 Personnes, biens et qualités déclarées

- Ne jamais déduire automatiquement une propriété juridique, un droit, une identité vérifiée ou une qualité officielle à partir d'une simple déclaration, d'un lien entre dossiers ou d'une pièce téléversée.
- Distinguer les qualités déclarées, les informations documentées et les faits effectivement vérifiés par un processus compétent.
- Les rôles patrimoniaux peuvent notamment distinguer propriétaire déclaré, copropriétaire déclaré, détenteur/possesseur, bénéficiaire d'un droit et représentant. D'autres qualités opérationnelles peuvent exister si elles sont définies par le produit.
- Les rôles patrimoniaux et les relations entre personnes ne remplacent jamais les permissions techniques d'accès à Heritis.
- Conserver la provenance, l'auteur, la date, le statut et l'historique des informations lorsque le modèle le permet.
- Ne pas effacer silencieusement l'historique d'une relation terminée, d'un événement ou d'une déclaration corrigée.

## 5. Architecture et qualité du code

- Examiner les conventions, composants, hooks, services, dépôts de données, schémas et tests déjà utilisés avant d'introduire une nouvelle abstraction.
- Réutiliser les sources de vérité et mécanismes existants lorsqu'ils sont adaptés.
- Maintenir une séparation claire entre présentation, logique métier, accès aux données et autorisation.
- Éviter les règles métier critiques uniquement dans l'interface.
- Valider les entrées à chaque frontière de confiance : interface, API, fonctions serveur et base de données selon le cas.
- Gérer explicitement chargement, succès, absence de données, erreurs, refus d'accès, mode hors ligne et reprise.
- Préserver la compatibilité avec les données existantes et les versions déjà utilisées.
- Toute modification de contrat, de schéma ou de comportement partagé doit identifier ses consommateurs et ses impacts.
- Éviter les dépendances nouvelles si une solution existante, maintenue et adaptée est disponible.
- Ne pas ajouter de code mort, de faux placeholders présentés comme des fonctions réelles ou de contournements temporaires non documentés.

## 6. Données, intégrité et synchronisation

- Identifier la source de vérité de chaque donnée et éviter les copies divergentes.
- Respecter les contraintes, relations, clés, index, politiques et invariants du schéma existant.
- Les migrations doivent être aussi additives et compatibles que possible ; toute opération destructive doit être justifiée, isolée et explicitement autorisée.
- Tester l'ordre complet des migrations sur une base locale vierge et isolée.
- Vérifier les scénarios d'accès et de non-accès avec des identités distinctes, y compris l'absence de session.
- Ne jamais réparer ou réécrire silencieusement des enregistrements distants pour masquer une incohérence.
- Ne jamais perdre une opération en attente, un document local ou une modification non synchronisée.
- Une opération de synchronisation en échec doit rester identifiable et récupérable. Respecter l'ordre des opérations dépendantes ; ne pas lancer de boucle de réessai immédiate qui masque l'échec ou surcharge le service.
- Toute résolution de conflit doit tenir compte de la version distante la plus récente et éviter l'écrasement silencieux de modifications concurrentes.
- La suppression d'un fichier et celle de sa référence en base doivent rester cohérentes : ne pas supprimer la référence si la suppression du fichier a échoué.
- Pour les coordonnées GPS, conserver leur source, leur date et leur précision annoncée lorsque disponibles. Une position GPS indicative ne constitue ni un bornage, ni une limite foncière, ni une preuve de propriété.

## 7. Sécurité et permissions

- Le serveur, les fonctions backend et les politiques de base de données constituent les frontières d'autorisation ; masquer un bouton ou protéger une route côté interface ne suffit jamais.
- Vérifier l'identité authentifiée côté serveur et ne jamais faire confiance à un identifiant utilisateur fourni librement par le client.
- Vérifier la propriété ou la participation autorisée pour chaque lecture et mutation de données privées.
- Appliquer le principe du moindre privilège : accès minimal, explicite, révocable et limité au périmètre nécessaire.
- Distinguer invitation envoyée, invitation acceptée, accès actif, suspension, révocation et expiration.
- Tester les accès du propriétaire, des participants autorisés, des participants non acceptés et des tiers.
- Protéger les documents et fichiers privés par des politiques d'accès cohérentes avec les droits sur le dossier et la preuve correspondante.
- Valider les types, formats, tailles et contenus des entrées ; limiter les appels coûteux et traiter les erreurs sans exposer de secrets ni de détails internes.
- Ne pas introduire de privilège administrateur implicite ni de chemin de contournement des politiques.
- Documenter toute modification de permissions et fournir des tests négatifs démontrant les refus attendus.

## 8. Normes UI/UX Heritis

- Appliquer une expérience cohérente à l'ensemble de l'application, pas uniquement à la page en cours.
- Respecter la direction visuelle validée : **Heritage Premium**, avec vert forêt, ivoire et or patiné ; le mode clair et le mode sombre doivent être prévus.
- Privilégier une interface moderne, lisible, sobre et qualitative : hiérarchie nette, espaces maîtrisés, typographie lisible et composants cohérents.
- Les cartes qui présentent les grands domaines doivent avoir une taille suffisante pour leur rôle : généralement une ou deux cartes par écran sur les vues de découverte, puis trois à quatre lorsque la densité et la lisibilité le permettent.
- Une carte importante doit présenter un titre très visible et une description de longueur modérée, sans surcharge d'informations.
- Adapter chaque écran aux petits et grands formats, au tactile et aux usages mobiles.
- Prévoir les états vides, chargement, erreur, succès, désactivé, hors ligne et accès refusé.
- Garantir les libellés compréhensibles, les contrastes, la navigation clavier, les focus visibles et les attributs d'accessibilité appropriés.
- Ne pas utiliser la couleur seule pour transmettre un statut.
- Ne pas simuler une action : chaque bouton, lien et contrôle doit conduire à une action réellement disponible ou être clairement désactivé et expliqué.
- Ne pas modifier les parcours ou masquer des fonctions sans analyser les effets sur les utilisateurs et obtenir la validation requise.

## 9. Intelligence artificielle et automatisation

- L'IA est une assistance à l'utilisateur, pas une autorité qui décide à sa place.
- Distinguer explicitement : règle déterministe, suggestion automatisée, réponse générée par IA, donnée déclarée et résultat vérifié.
- Ne jamais présenter une règle locale déterministe comme une expertise IA.
- Ne jamais présenter une suggestion comme une décision juridique, une expertise professionnelle, une certification, une mesure officielle ou une preuve.
- Les recommandations doivent être contextualisées, explicables, proportionnées et reliées à des données réellement accessibles à l'utilisateur.
- Une IA ne doit accéder qu'au contexte nécessaire et autorisé. Ne jamais lui transmettre des données privées d'un autre utilisateur ou dossier sans permission effective.
- Valider les entrées, borner les tailles, contrôler les sorties structurées et gérer les erreurs, délais et limites de débit.
- Les sorties de l'IA doivent être traitées comme des données non fiables : valider avant affichage, stockage ou exécution.
- Ne jamais exécuter automatiquement une action sensible, destructive, financière, juridique ou modifiant des droits sans consentement explicite et contrôle adapté.
- Permettre à l'utilisateur de comprendre pourquoi une suggestion apparaît, de l'ignorer et, lorsque pertinent, de la corriger.
- Prévoir les cas où l'IA est indisponible : les fonctions essentielles ne doivent pas dépendre d'une réponse générative si une solution déterministe ou manuelle est attendue.

## 10. Documents, preuves et traçabilité

- Distinguer fichier téléversé, document déclaré, pièce associée, preuve examinée et preuve vérifiée.
- Ne jamais attribuer un statut de vérification sans processus, acteur habilité, date et résultat traçables.
- Conserver les liens entre une pièce, le dossier, la section et, lorsque prévu, la personne ou la relation concernée.
- Préserver l'historique des ajouts, remplacements, retraits et décisions.
- Ne jamais transformer une pièce jointe en preuve de propriété ou d'authenticité par simple présence dans le dossier.
- Les erreurs d'envoi, de stockage ou de synchronisation doivent rester visibles et récupérables.

## 11. Tests et critères de validation

Avant de déclarer une intervention terminée :

1. Exécuter les tests ciblés du périmètre modifié.
2. Exécuter les contrôles de types, lint et build définis par le dépôt.
3. Exécuter les tests de base de données et migrations sur un environnement local isolé lorsque le schéma ou les politiques changent.
4. Ajouter ou adapter les tests de non-régression.
5. Tester les refus d'accès et les cas limites, pas seulement le scénario heureux.
6. Vérifier les états d'erreur, l'absence de données et les transitions hors ligne/en ligne lorsque concernés.
7. Effectuer les essais manuels responsive, clair/sombre, tactile et accessibilité lorsque l'interface change et que l'environnement le permet.
8. Lire les résultats réels des commandes et workflows ; conserver les échecs et avertissements dans le compte rendu.

Un test préparé mais non exécuté n'est pas un test réussi. Un workflow absent, non déclenché ou sans résultat est **non vérifié**, et non réussi.

## 12. Documentation obligatoire

- Toute évolution métier, technique, de sécurité, de données, d'interface ou de parcours doit mettre à jour la documentation concernée dans la même branche ou PR.
- La documentation doit décrire le comportement réellement livré, les conditions d'accès, les limites, les dépendances et les tests effectués.
- Distinguer les éléments implémentés, partiellement implémentés, planifiés, reportés et non vérifiés.
- Ne pas documenter une proposition comme une fonctionnalité disponible.
- Après validation d'un domaine ou sous-domaine, mettre à jour et vérifier sa documentation GitHub avant de commencer le domaine suivant.
- Maintenir les instructions techniques proches du code concerné sans dupliquer ni contredire le référentiel central.

## 13. Compte rendu obligatoire de chaque intervention

Chaque PR ou livraison doit indiquer clairement :

- l'objectif et le périmètre ;
- l'état initial réellement observé ;
- les fichiers et comportements modifiés ;
- les dépendances et impacts analysés ;
- les règles de sécurité et permissions concernées ;
- les tests exécutés avec leurs résultats exacts ;
- les essais manuels effectués et ceux qui restent à faire ;
- les limites, risques, décisions attendues et travaux reportés ;
- la documentation mise à jour ;
- la confirmation qu'aucun environnement externe non autorisé n'a été modifié.

Ne jamais écrire « tout est OK » si un contrôle requis reste en échec ou non vérifié.

## 14. Documents de référence spécialisés

Les documents suivants constituent le référentiel spécialisé du dépôt. Ils sont maintenus et complétés progressivement ; un document annoncé mais non encore publié doit être signalé comme manquant, sans prétendre l'avoir consulté.

- `docs/DEVELOPMENT/GOVERNANCE.md` — responsabilités, décisions, autorisations et dérogations.
- `docs/DEVELOPMENT/ARCHITECTURE-RULES.md` — architecture et conventions techniques.
- `docs/DEVELOPMENT/SECURITY-RULES.md` — authentification, autorisations, RLS, fichiers et secrets.
- `docs/DEVELOPMENT/UI-UX-STANDARDS.md` — identité visuelle, composants, responsive et accessibilité.
- `docs/DEVELOPMENT/DATA-AND-DATABASE-RULES.md` — modèles, intégrité, migrations et synchronisation.
- `docs/DEVELOPMENT/TESTING-REQUIREMENTS.md` — stratégie, couverture et critères de validation.
- `docs/DEVELOPMENT/AI-AND-AUTOMATION-RULES.md` — IA, suggestions, automatisations et garde-fous.

Les consignes propres à un outil (par exemple les instructions GitHub Copilot ou celles d'un agent donné) devront pointer vers ce fichier et reprendre ses règles essentielles sans créer une seconde source de vérité contradictoire.

## 15. Règle finale

**En cas de doute, ne pas deviner et ne pas agir silencieusement.** Examiner les faits, préserver l'existant, exposer les conséquences possibles et demander la décision nécessaire. La qualité, la sécurité, l'intégrité des données et la confiance des utilisateurs priment sur la vitesse d'exécution.

---

## Référentiel permanent complémentaire

Les règles de modélisation, de qualité, de protection, de synchronisation, de conservation et de sobriété des données sont définies dans [DATA-AND-DATABASE-RULES.md](docs/DEVELOPMENT/DATA-AND-DATABASE-RULES.md). Ce référentiel doit être consulté pour toute évolution touchant aux données ou à leur stockage.

---

## Exigences permanentes de tests et de qualité

Les règles de validation du comportement réel, de qualité du code de production, de sécurité, de maintenabilité, de scalabilité, de résilience, d'accessibilité et de modernisation progressive sont définies dans [TESTING-REQUIREMENTS.md](docs/DEVELOPMENT/TESTING-REQUIREMENTS.md). Les techniques éprouvées et déjà maîtrisées doivent être privilégiées ; toute nouvelle technologie doit démontrer son bénéfice, sa maturité, sa sécurité et son coût total avant adoption.

## Référentiel permanent de l'intelligence et des automatisations

Consulter obligatoirement [AI-AND-AUTOMATION-RULES.md](docs/DEVELOPMENT/AI-AND-AUTOMATION-RULES.md) avant toute conception ou modification d'une capacité IA, d'un agent, d'une mémoire, d'un outil ou d'une automatisation.
