# Règles de sécurité et de protection — Heritis

**Statut :** référentiel permanent et obligatoire  
**Portée :** produit, application, données, personnes, biens, documents, services, intégrations, intelligence artificielle, automatisations, environnements et exploitation Heritis  
**Autorité :** complète `AGENTS.md`, `CONTRIBUTING.md`, `GOVERNANCE.md` et `ARCHITECTURE-RULES.md`. Les obligations légales et réglementaires applicables prévalent.  
**Principe directeur :** aucune fonctionnalité, commodité, urgence, automatisation ou intelligence artificielle ne peut affaiblir la confidentialité, l'intégrité, la disponibilité, la traçabilité ou les droits des personnes.

---

## 1. Objet et portée

Ce document définit les exigences de sécurité qui s'appliquent à toute conception, implémentation, modification, intégration, exploitation et évolution de Heritis.

Il couvre notamment :
- identité, authentification, sessions et récupération de compte ;
- visiteurs, personnes reconnues, utilisateurs, participants, représentants et professionnels ;
- autorisation, rôles, relations, délégations, invitations et révocations ;
- biens, dossiers, preuves, documents, volontés, échanges et historiques ;
- frontend, API, fonctions serveur, base de données, RLS et stockage ;
- appareils, navigateur, PWA, cache, stockage local et synchronisation ;
- intelligence artificielle, assistants, agents, modèles, outils et mémoire ;
- automatisations, notifications, tâches différées et opérations sensibles ;
- fournisseurs, dépendances, secrets, environnements, journaux et sauvegardes ;
- prévention, détection, réponse aux incidents et rétablissement.

Ces règles s'appliquent à tous les domaines métier et services transversaux, à tout intervenant humain et à tout système automatisé ou agent IA.

## 2. Hiérarchie, interprétation et preuve

Les règles de sécurité spécialisées précisent les obligations générales sans les affaiblir. En cas de contradiction, appliquer la protection la plus forte et suspendre l'action concernée jusqu'à arbitrage.

Trois états doivent être distingués :
1. **Présent et vérifié :** mécanisme observé dans le code/configuration et contrôlé par une preuve adaptée.
2. **Présent mais incomplet/non démontré :** mécanisme repéré, mais couverture, efficacité ou configuration réelle non vérifiée.
3. **Exigé / cible :** règle à respecter ; sa présence dans ce document ne prouve pas qu'elle est déjà implémentée.

Une politique RLS écrite n'est pas une preuve de protection complète. Un test unitaire simulé ne prouve pas le comportement réel de la base. Une CI verte ne prouve que les contrôles effectivement exécutés sur le commit concerné. Un écran masqué n'est pas un contrôle d'accès.

Toute affirmation de conformité doit préciser son périmètre, l'environnement, le commit, le scénario testé et les limites restantes.

## 3. Principes fondamentaux de sécurité

1. **Confidentialité par défaut :** toute ressource privée est inaccessible sans autorisation explicite.
2. **Refus par défaut :** toute action non prévue, non comprise ou non autorisée est refusée.
3. **Moindre privilège :** chaque acteur et service dispose du minimum de droits et pour la durée nécessaire.
4. **Vérification à chaque frontière :** le client, les paramètres, les fichiers, les documents, les messages et les sorties IA sont non fiables.
5. **Séparation des pouvoirs :** identité, qualité déclarée, rôle opérationnel, permission technique et décision officielle sont distincts.
6. **Défense en profondeur :** interface, serveur, base, stockage, réseau et opérations apportent des contrôles complémentaires.
7. **Minimisation :** collecter, consulter, transmettre, conserver et journaliser le minimum nécessaire.
8. **Traçabilité proportionnée :** les actions sensibles sont attribuables et auditables sans journaliser inutilement le contenu privé.
9. **Résilience :** les défaillances réseau, fournisseur, IA ou appareil ne doivent pas provoquer de divulgation ou de corruption.
10. **Réversibilité maîtrisée :** prévoir révocation, correction, récupération et réponse aux incidents.
11. **Sécurité testée :** les scénarios négatifs et tentatives d'abus font partie des critères d'acceptation.
12. **Contrôle humain :** les actions sensibles ne sont pas déléguées à une IA ou à une automatisation sans cadre explicite et validation requise.

## 4. Classification des informations et des ressources

Chaque catégorie de données et de ressources doit être classée en fonction de son impact en cas de divulgation, altération, indisponibilité ou perte.

| Classe | Exemples indicatifs | Exigence minimale |
|---|---|---|
| Publique | Présentation produit, contenus publics validés | Contrôle d'intégrité et publication autorisée |
| Interne | Documentation non publique, configuration non secrète | Accès limité aux contributeurs autorisés |
| Personnelle | Profil, coordonnées, activité utilisateur | Accès par finalité, minimisation et droits vérifiés |
| Confidentielle | Dossiers privés, pièces, relations, échanges | Autorisation par ressource, stockage privé, journalisation prudente |
| Hautement sensible | Volontés secrètes, secrets d'accès, pièces sensibles, données à risque élevé | Cloisonnement renforcé, accès exceptionnel, chiffrement et audit adaptés |

La classification doit tenir compte du contexte : une donnée ordinaire peut devenir sensible par association, agrégation ou inférence. Les métadonnées (noms de fichiers, chemins, participants, localisation, dates) peuvent elles-mêmes révéler des informations confidentielles.

Le propriétaire métier de la donnée définit sa finalité, sa sensibilité, les acteurs autorisés, la durée de conservation et les conditions de partage. Les détails de modélisation et de rétention sont complétés par `DATA-AND-DATABASE-RULES.md`.

## 5. Modèle d'identité et niveaux d'accès

Heritis doit distinguer explicitement :

- **Visiteur :** personne non authentifiée qui découvre la vision, les explications et les aperçus publics autorisés.
- **Personne reconnue :** personne ayant communiqué un élément d'identification initial, par exemple prénom ou nom. Cette reconnaissance produit un contexte de parcours, pas une preuve d'identité.
- **Utilisateur authentifié :** personne disposant d'une session valide liée à un compte.
- **Participant/invité :** utilisateur auquel un accès déterminé à une ressource a été accordé et accepté selon le processus applicable.
- **Représentant ou professionnel :** acteur disposant d'une qualité et d'un périmètre explicitement établis, lorsque cette capacité existe et a été vérifiée.

Un prénom, un nom, une adresse e-mail saisie, un numéro, un lien d'invitation ou un identifiant d'URL ne prouvent pas à eux seuls l'identité réelle, la propriété, la filiation, la qualité d'héritier, le mandat ou le consentement.

Les données d'un visiteur ne doivent pas être visibles par un autre visiteur simplement parce qu'ils partagent un appareil, un navigateur ou un parcours. Les données locales créées avant authentification doivent être isolées et rattachées au compte uniquement par une procédure contrôlée, avec vérification du propriétaire et traitement des collisions.

## 6. Authentification, sessions et comptes

- Utiliser le mécanisme d'authentification approuvé et les flux officiels du fournisseur.
- Vérifier l'identité côté serveur à partir d'un jeton valide ; ne jamais faire confiance à un identifiant utilisateur fourni dans le corps d'une requête.
- Vérifier expiration, renouvellement, révocation et changement de session.
- Réagir immédiatement à la déconnexion et aux événements de changement de compte.
- Ne pas conserver un état authentifié après une erreur de validation de session.
- Ne pas afficher de données d'un compte précédent pendant le chargement d'un nouveau compte.
- Les opérations différées doivent revérifier l'identité active avant exécution.
- Les parcours de récupération de compte doivent résister à l'énumération d'utilisateurs, aux abus et à la prise de contrôle.
- Les opérations à risque élevé peuvent exiger une réauthentification ou un facteur supplémentaire selon le niveau de risque.
- Les erreurs d'authentification ne doivent pas révéler si un compte ou une adresse existe.
- La déconnexion doit invalider l'état local pertinent et arrêter les opérations qui ne peuvent plus être autorisées.

Les sessions et jetons ne doivent jamais être placés dans les URL, journaux, messages d'erreur, données analytiques ou prompts IA. Le stockage navigateur doit être choisi en fonction du modèle de menace et des contraintes du fournisseur ; les secrets privilégiés ne sont jamais accessibles au code client.

## 7. Autorisation, rôles et permissions

### 7.1 Autorisation par ressource

Toute action doit être autorisée en fonction de l'acteur, de la ressource, de l'action, du contexte, de la portée et du moment de l'exécution.

L'autorisation doit être vérifiée côté serveur et, lorsque pertinent, au niveau de la base par RLS ou mécanisme équivalent. Les contrôles d'interface servent uniquement à guider l'utilisateur.

Ne jamais déduire l'autorisation :
- de la présence d'un bouton ou d'une route ;
- d'un identifiant de ressource fourni par le client ;
- d'un rôle stocké dans un état frontend non vérifié ;
- d'une ancienne autorisation ou d'une invitation non acceptée ;
- du fait qu'un utilisateur a déjà consulté la ressource ;
- d'une sortie IA ou d'une instruction contenue dans un document.

### 7.2 Séparation des qualités

Pour un bien, distinguer au minimum les qualités déclaratives et documentaires :
- propriétaire déclaré ;
- copropriétaire déclaré ;
- détenteur ou possesseur ;
- bénéficiaire d'un droit ;
- représentant.

Ces qualités ne sont pas automatiquement des rôles d'accès à Heritis. Un gestionnaire, opérateur, occupant ou contributeur ne devient pas propriétaire du fait de sa fonction. Une relation déclarée ou une pièce jointe ne constitue pas une validation juridique.

### 7.3 Matrice de droits

Chaque ressource et action sensible doit avoir une matrice de droits lisible : propriétaire logique, créateur, participant, représentant, professionnel, administrateur technique et accès public éventuel. Les droits de lecture, création, modification, partage, export, téléchargement, suppression, transfert et gestion des participants sont distincts.

Un rôle général ne doit pas donner automatiquement accès à toutes les ressources d'un utilisateur. Les permissions sont limitées par ressource, action et durée. Refuser par défaut tout cas non défini.

## 8. Invitations, délégations, partage et révocation

- Une invitation doit être imprévisible, limitée dans le temps, liée à une ressource et à un périmètre précis, et utilisable selon une politique d'acceptation explicite.
- Ne pas activer un accès participant avant l'acceptation et la vérification prévues.
- Les jetons d'invitation ne doivent pas révéler la ressource ni les données associées avant authentification et autorisation.
- Une délégation ne peut transmettre plus de droits que ceux que le délégant détient.
- Une délégation précise sa portée, ses actions, sa durée, ses conditions et son caractère révocable.
- La révocation doit prendre effet côté serveur et empêcher les opérations ultérieures, y compris les tâches différées.
- Les caches, sessions, liens signés et files locales doivent être invalidés ou réévalués après révocation.
- Les suspensions doivent définir leur portée : ressource, domaine, compte ou fonctionnalité ; elles ne doivent pas supprimer l'historique.
- Les demandes d'accès, refus, acceptations, suspensions, recours et réactivations doivent être traçables.
- Ne jamais transformer une invitation ou une délégation en transfert de propriété ou en mandat juridique implicite.

## 9. Frontend, routes et protection de l'interface

Le frontend est une surface non fiable. Tout code exécuté dans le navigateur peut être inspecté, modifié ou rejoué.

- Protéger les routes pour l'expérience utilisateur, mais refaire l'autorisation sur le serveur.
- Ne pas inclure dans le bundle des clés privées, secrets ou données d'autres utilisateurs.
- Ne pas se fier aux variables d'environnement publiques pour cacher un secret.
- Échapper et assainir les contenus affichés selon leur contexte ; éviter l'injection HTML.
- Éviter les usages dangereux de HTML brut ; toute exception exige une sanitisation éprouvée.
- Protéger les formulaires contre les soumissions multiples et les requêtes forgées selon le modèle d'authentification.
- Les erreurs d'accès ne doivent pas laisser fuiter le contenu préchargé dans le DOM, le cache ou les états globaux.
- Les aperçus publics ne doivent exposer que des champs explicitement conçus pour être publics.
- Les données de profil ou de dossier ne doivent pas être placées dans les outils d'analyse ou télémétrie sans nécessité et base légitime.

## 10. API, fonctions serveur et validation des entrées

Toute requête externe est hostile par défaut, y compris une requête émise par l'application officielle.

Chaque endpoint doit :
- limiter les méthodes HTTP et traiter explicitement les OPTIONS/CORS ;
- authentifier l'acteur si l'action n'est pas publique ;
- valider l'autorisation pour chaque ressource concernée ;
- imposer un schéma strict et des limites de taille, profondeur, nombre et longueur ;
- rejeter les champs inconnus ou les valeurs incohérentes lorsqu'ils pourraient changer la sémantique ;
- normaliser les entrées sans modifier silencieusement leur sens ;
- limiter le débit et protéger contre les abus ;
- appliquer timeout, quotas et limites de concurrence ;
- renvoyer des erreurs stables sans détail interne ;
- éviter de journaliser les corps sensibles ;
- appliquer idempotence et protections contre les répétitions lorsque l'action peut avoir des effets ;
- documenter les contrats, permissions et tests négatifs.

Ne jamais construire une requête SQL par concaténation de données non fiables. Utiliser des paramètres et API sûres. Les messages d'erreur du fournisseur ne doivent pas être renvoyés tels quels au client.

## 11. Base de données, RLS, fonctions privilégiées et migrations

- Activer et vérifier RLS pour toute table exposée aux rôles API concernés.
- Écrire des politiques explicites pour SELECT, INSERT, UPDATE et DELETE selon les besoins réels.
- Vérifier séparément `USING` et `WITH CHECK` pour les mises à jour.
- Refuser l'accès par défaut en l'absence de politique appropriée.
- Tester utilisateur propriétaire, participant accepté, participant en attente, utilisateur tiers, visiteur, rôle privilégié et absence de session.
- Les fonctions `SECURITY DEFINER` doivent avoir un `search_path` fixe, des privilèges minimaux, des paramètres validés et un contrôle d'identité explicite.
- Révoquer les droits d'exécution inutiles à PUBLIC, anon et authenticated ; accorder uniquement aux rôles nécessaires.
- Ne jamais faire confiance à un `user_id` fourni par le client lorsqu'il peut être dérivé de `auth.uid()`.
- Les vues, fonctions RPC, triggers, politiques Storage et fonctions d'événements font partie de la surface de sécurité.
- Les migrations de sécurité doivent être additives et testées sur une base locale fraîche ainsi que sur une base ayant l'historique prévu.
- Ne jamais désactiver RLS, une politique ou un test pour débloquer une livraison sans analyse, décision et preuve d'équivalence de protection.
- Aucune migration ou modification du projet Supabase distant sans autorisation explicite.

Toute fonction administrative doit avoir un usage justifié, une portée bornée et une trace d'audit. La clé service-role ne doit jamais être utilisée dans le navigateur ni transmise à un utilisateur.

## 12. Stockage des fichiers, preuves et documents

Les buckets privés doivent rester privés. Les politiques Storage doivent contrôler l'acteur, le bucket, le chemin, la ressource liée et l'action.

- Le chemin d'un fichier n'est pas une preuve d'autorisation.
- Les chemins doivent être générés ou validés côté serveur et cloisonnés par ressource/utilisateur selon le modèle retenu.
- Vérifier taille, type MIME annoncé, extension et contenu réel lorsque possible.
- Se protéger contre fichiers exécutables, contenus polyglottes, archives dangereuses, fichiers trop volumineux et noms de fichiers malveillants.
- Ne jamais faire confiance au nom ou au type déclarés par le navigateur.
- Les fichiers confidentiels ne sont accessibles qu'après contrôle d'accès à la ressource et au document.
- Utiliser des URL signées courtes, limitées à l'opération et à la durée nécessaires.
- Les URL signées ne doivent pas être journalisées, partagées ou persistées inutilement.
- Contrôler les aperçus, miniatures, exports et téléchargements autant que le fichier source.
- Prévoir les fichiers orphelins, envois interrompus, remplacements et suppressions.
- Vérifier le droit de supprimer ou remplacer un fichier au moment de l'action.
- Préserver l'historique des versions lorsque requis.
- Une pièce téléversée n'est ni authentifiée, ni validée juridiquement, ni une preuve de propriété par sa seule présence.

Les fichiers hors ligne sont des données locales sensibles : limiter leur conservation, protéger l'appareil selon ses capacités, effacer les copies après révocation/déconnexion selon la politique et éviter les aperçus non protégés.

## 13. Sécurité des données locales, PWA et synchronisation

Le navigateur, IndexedDB, caches et service worker peuvent être accessibles à d'autres scripts ou à une personne ayant accès à l'appareil.

- Ne stocker localement que les données nécessaires au fonctionnement hors ligne.
- Classer les données avant de les mettre en cache ; exclure les contenus hautement sensibles si la protection locale n'est pas suffisante.
- Séparer les données par compte et ressource ; ne jamais réutiliser un cache d'un utilisateur après changement de session.
- Éviter de mettre en cache les réponses authentifiées ou privées dans un cache public/service worker.
- Définir durée, invalidation, quota, effacement et politique de restauration.
- Une opération en attente ne vaut pas autorisation durable.
- Revalider session, droits et existence de la ressource lors de la synchronisation.
- Rejeter ou mettre en quarantaine les opérations créées sous une autre identité.
- Empêcher les doubles exécutions, rejouements et altérations de file.
- Conserver les conflits et données locales non synchronisées jusqu'à une résolution contrôlée.
- Ne pas écraser automatiquement les changements sensibles.
- Signaler clairement à l'utilisateur la différence entre sauvegarde locale et confirmation serveur.
- Les opérations de suppression, transfert, partage et révocation doivent avoir une politique hors ligne explicite ; en cas d'incertitude, exiger une connexion.

La déconnexion, le changement de compte, la révocation d'accès et la fermeture de session doivent déclencher une stratégie d'invalidation des données locales adaptée au risque.

## 14. Protection des quatre domaines métier

Les protections doivent être appliquées de façon cohérente dans chaque domaine.

### 14.1 Patrimoine et gestion des biens
- Cloisonner les dossiers, biens, pièces, coordonnées, historiques et relations.
- Distinguer propriétaire déclaré, copropriétaire, détenteur/possesseur, bénéficiaire et représentant.
- Ne jamais convertir une déclaration ou suggestion IA en propriété certifiée.
- Restreindre l'exposition des coordonnées géographiques et informations d'occupation.
- Encadrer les partages et contributions à plusieurs personnes.

### 14.2 Héritage et succession
- Restreindre les dossiers aux personnes autorisées et vérifier les rôles/relations déclarés.
- Ne pas exposer la liste des personnes concernées à un participant non autorisé.
- Protéger les pièces d'état civil, informations familiales et documents de succession.
- Ne pas déduire automatiquement la qualité d'héritier ou la répartition des droits.
- Toute transmission d'information ou validation de rôle doit suivre un processus formel.

### 14.3 Volontés secrètes et dernières volontés
- Appliquer le niveau de confidentialité le plus élevé.
- Cloisonner le contenu, les métadonnées, les destinataires, les conditions de transmission et les journaux.
- Ne pas transmettre le contenu à un fournisseur IA sans nécessité, autorisation, analyse contractuelle et protection adaptées.
- Ne pas révéler l'existence ou le contenu à un destinataire simplement parce qu'il est mentionné dans le document.
- Ne pas déclencher une ouverture/transmission sur une prédiction, une absence, une date seule ou une réponse IA.
- Exiger des vérifications indépendantes, une autorisation explicite et une traçabilité renforcée.
- Prévoir révocation, contestation, suspension et procédure d'incident.

### 14.4 Gestion des conflits et litiges
- Cloisonner les dossiers entre parties et intervenants.
- Éviter qu'une partie puisse consulter les brouillons, notes privées ou pièces non partagées d'une autre.
- Distinguer faits, allégations, documents, hypothèses et décisions.
- Protéger les échanges et versions contradictoires.
- Ne pas modifier, fusionner ou supprimer silencieusement des éléments susceptibles de constituer des preuves.
- Les exports et partages doivent être contrôlés, limités et traçables.

## 15. Sécurité de l'intelligence artificielle Heritis

L'intelligence est une surface de confiance réduite : elle reçoit potentiellement des informations privées et produit des sorties probabilistes. Elle ne doit jamais être considérée comme un composant d'autorisation.

### 15.1 Modèle de menace IA

Protéger contre :
- injection directe dans les messages utilisateur ;
- injection indirecte dans documents, images OCR, pièces, pages web, métadonnées, commentaires et résultats de recherche ;
- extraction de prompts système, secrets, données d'autres utilisateurs ou contexte interne ;
- confusion de rôles et usurpation de messages système ;
- fuite de données par prompts, logs, traces, outils ou sorties ;
- appels d'outils non autorisés, arguments falsifiés et escalade d'autonomie ;
- hallucinations présentées comme faits, sources ou preuves ;
- abus de quotas, déni de service, coûts incontrôlés et appels en boucle ;
- dépendance à un fournisseur indisponible ou compromis ;
- empoisonnement de mémoire, de contexte, de documents ou de feedback ;
- usage d'un contenu IA comme autorité ou validation officielle.

### 15.2 Séparation des autorités

- Le modèle ne décide jamais de ses propres permissions.
- Le modèle ne choisit pas librement les données auxquelles il accède.
- Le modèle ne valide pas l'identité, la qualité juridique, le consentement ou le droit d'accès.
- Le modèle ne modifie pas les règles de sécurité, prompts de confiance, schémas d'outils ou quotas.
- Les décisions d'autorisation sont exécutées par le code déterministe et la base de données.
- Le contexte transmis est préparé par un composant de confiance, après vérification des droits.
- Une sortie IA est une proposition non fiable tant qu'elle n'a pas été contrôlée et, lorsque nécessaire, validée par une personne autorisée.

### 15.3 Minimisation et isolation du contexte

Avant chaque appel IA :
1. identifier l'utilisateur et vérifier sa session ;
2. identifier la finalité et la capacité sollicitée ;
3. vérifier l'accès à chaque ressource ;
4. sélectionner uniquement les champs nécessaires ;
5. retirer secrets, jetons, données non pertinentes et identifiants inutiles ;
6. appliquer la classification et les règles de traitement du fournisseur ;
7. limiter taille, nombre de messages, pièces et contexte ;
8. enregistrer une trace technique minimale sans reproduire le contenu sensible.

Le modèle ne doit jamais recevoir un dossier complet par défaut. Les contextes entre utilisateurs, dossiers, domaines et volontés confidentielles doivent être isolés. Un identifiant fourni par le modèle ou le client doit être revalidé avant toute lecture.

### 15.4 Instructions et injection de prompt

- Les messages utilisateur, documents, fichiers, contenus OCR, pages web et résultats d'outils sont des données non fiables.
- Les instructions de ces contenus ne peuvent pas remplacer les règles système ou de sécurité.
- Délimiter et étiqueter les contenus externes comme données à analyser, non comme instructions à suivre.
- Ne pas placer de secret dans les prompts système.
- Ne pas compter sur un prompt pour empêcher l'accès à une ressource ; appliquer le contrôle dans le code avant lecture.
- Ne pas laisser une pièce jointe ordonner à l'agent d'envoyer, supprimer, partager ou révéler des données.
- Tester les injections directes et indirectes, y compris dans les noms de fichiers, métadonnées, images et contenus multilingues.
- Les réponses générées doivent être validées selon leur schéma et leur usage avant affichage ou exécution.

### 15.5 Outils et appels de fonctions

Chaque outil IA doit être enregistré dans une liste blanche avec :
- objectif précis et responsable ;
- schéma strict, validation serveur et limites ;
- permissions indépendantes du modèle ;
- ressources accessibles et portée autorisée ;
- niveau de risque et niveau d'autonomie ;
- idempotence, timeout, quota et stratégie d'erreur ;
- audit et tests de sécurité.

Les noms d'outils, paramètres, identifiants et résultats produits par le modèle sont non fiables. Revalider tous les arguments côté serveur. Ne jamais exécuter du code arbitraire, SQL libre, URL arbitraire, shell, navigation ou opération de stockage sur la seule instruction d'un modèle.

### 15.6 Niveaux d'autonomie IA

- **A — informer :** expliquer, traduire, résumer ; ne modifie aucune donnée.
- **B — proposer :** suggérer une action ou un brouillon ; aucune mutation.
- **C — préparer :** préparer une opération en attente de validation.
- **D — exécuter une action faible et réversible :** uniquement si l'action et le périmètre sont explicitement approuvés, techniquement bornés et audités.
- **E — action sensible, irréversible, financière, juridique, confidentielle ou affectant les droits :** aucune exécution autonome ; validation humaine explicite et contrôles renforcés obligatoires.

Un agent ne peut pas s'élever lui-même de niveau. L'approbation doit être spécifique à l'action, à la ressource et au contexte ; une approbation générale ne vaut pas consentement à toutes les opérations futures.

### 15.7 IA et actions interdites sans validation humaine

L'IA ne peut pas seule :
- créer, fusionner, supprimer ou transférer un droit ou une relation juridique ;
- certifier propriété, identité, filiation, héritage, authenticité ou valeur d'une preuve ;
- ouvrir ou transmettre une volonté secrète ;
- partager, exporter ou révéler des documents confidentiels ;
- inviter, accepter, exclure ou révoquer un participant ;
- modifier des permissions, rôles, paramètres de sécurité ou règles de rétention ;
- supprimer définitivement un dossier, une preuve ou un historique ;
- envoyer une communication engageante au nom d'une personne ;
- effectuer une transaction ou une opération financière ;
- décider d'une issue de litige ou d'une responsabilité ;
- déployer, fusionner du code, modifier un environnement ou lancer une migration distante.

### 15.8 Fournisseurs IA et confidentialité

Avant tout fournisseur/modèle :
- examiner conditions contractuelles, sous-traitants, localisation, conservation, entraînement, suppression, chiffrement et incident ;
- vérifier les options de non-rétention et les engagements applicables ;
- déterminer si les catégories de données envisagées peuvent lui être transmises ;
- prévoir une alternative ou un mode dégradé ;
- éviter l'envoi de données hautement sensibles si les garanties ne sont pas suffisantes ;
- documenter modèle, version, configuration et finalité lorsque le risque le justifie.

Un changement de modèle ou de fournisseur constitue une modification de sécurité à évaluer et tester, pas une simple mise à jour cosmétique.

### 15.9 Évaluation et surveillance IA

Tester les refus, fuites, accès croisés, injections, hallucinations, sorties malformées, appels d'outils, quotas, contenus contradictoires et langues prises en charge.

Mesurer selon le risque : exactitude, pertinence, taux de refus correct, fuite de données, latence, disponibilité, coût, citations, taux de correction humaine et incidents. Prévoir désactivation rapide, quotas, timeout, reprise bornée et réponse déterministe de secours.

Ne jamais journaliser le prompt complet ou la réponse complète par défaut. La conservation d'une conversation IA doit être définie par finalité, consentement/attente utilisateur, classification, durée et droits d'accès.

## 16. Mémoire, personnalisation et profilage

La mémoire de l'assistant n'est pas une source de vérité métier et ne doit pas être un moyen de contourner les permissions.

- Séparer mémoire conversationnelle, profil utilisateur, données métier et historique d'audit.
- N'enregistrer que les éléments utiles, permis et proportionnés.
- Expliquer les finalités et permettre les mécanismes de consultation, correction, désactivation et suppression prévus par le produit et la loi.
- Ne pas inférer ou enregistrer des catégories sensibles sans base légitime et contrôle approprié.
- Ne pas réutiliser le contexte d'un dossier pour personnaliser un autre domaine sans nécessité et autorisation.
- Ne pas partager les souvenirs d'une personne avec un participant ou un représentant par défaut.
- Toute mémoire récupérée est soumise aux mêmes contrôles d'accès que sa source.
- Empêcher l'empoisonnement de mémoire par documents ou instructions malveillants.
- Distinguer faits confirmés, déclarations, préférences, hypothèses et informations périmées.

## 17. Automatisations, tâches différées et notifications

Chaque automatisation doit être authentifiée, autorisée, bornée, idempotente et traçable.

- Définir déclencheur, acteur, ressource, action, conditions, fréquence et limites.
- Revalider les droits au moment de l'exécution, pas seulement lors de la programmation.
- Ne pas exécuter une tâche si le compte est suspendu, le droit révoqué ou la ressource devenue inaccessible.
- Prévenir les boucles, répétitions, doublons et escalades.
- Exiger approbation pour les actions sensibles.
- Permettre arrêt, suspension et révocation.
- Les notifications ne doivent pas exposer le contenu confidentiel sur écran verrouillé, e-mail ou canal tiers ; utiliser un message neutre et une consultation authentifiée.
- Les liens d'action doivent être temporaires, non devinables et recontrôlés côté serveur.
- Les tâches échouées doivent être visibles et récupérables sans réexécuter aveuglément une action déjà effectuée.

## 18. CORS, réseau, navigateur et transport

- Utiliser HTTPS pour tous les échanges sensibles.
- Définir les origines CORS autorisées selon les environnements et besoins ; éviter les origines universelles pour les fonctions authentifiées si non indispensables.
- Ne pas considérer CORS comme un mécanisme d'authentification ou d'autorisation.
- Définir les en-têtes autorisés strictement et contrôler les méthodes.
- Appliquer des en-têtes de sécurité adaptés au déploiement (CSP, frame restrictions, MIME sniffing, referrer policy et permissions policy selon compatibilité).
- Protéger contre CSRF selon le mode de stockage des sessions et les mécanismes d'authentification.
- Éviter les redirections ouvertes, URL de retour arbitraires et chargements de ressources non fiables.
- Limiter les téléchargements, réponses et flux ; interrompre les opérations longues lorsque le client se déconnecte si possible.
- Ne pas placer de données sensibles dans query strings, fragments ou paramètres d'URL.

## 19. Secrets, clés et configuration

- Aucun secret, clé privée, jeton, mot de passe, clé de service ou fichier d'environnement réel dans Git.
- Les clés publiques explicitement conçues pour le client ne sont pas des secrets ; leur exposition ne dispense jamais de RLS et de contrôles serveur.
- Les secrets privilégiés restent dans les secrets d'environnement serveur.
- Ne jamais exposer une clé service-role au frontend, aux logs, prompts ou rapports.
- Utiliser des mécanismes de secret manager et des permissions minimales.
- Prévoir rotation, révocation, séparation des environnements et réponse à l'exposition.
- Ne pas copier un secret dans une issue, une PR, une conversation ou un fichier de test.
- Les valeurs d'exemple sont fictives et clairement signalées.
- Une exposition suspectée déclenche une procédure de rotation/révocation sans republier la valeur.

## 20. Dépendances et chaîne d'approvisionnement logicielle

- Examiner la provenance, la licence, la maintenance, les vulnérabilités et les scripts d'installation des dépendances.
- Limiter les permissions des GitHub Actions, workflows et applications connectées.
- Épingler les versions et utiliser le lockfile ; examiner les mises à jour majeures.
- Ne pas exécuter un script téléchargé ou généré sans inspection adaptée.
- Contrôler les actions CI externes et limiter leurs tokens.
- Protéger les branches et exiger une revue adaptée aux changements sensibles.
- Scanner les secrets et dépendances selon les capacités disponibles.
- Produire et conserver les éléments de provenance/build lorsque le risque le justifie.
- Les agents IA et outils de génération ne peuvent pas ajouter silencieusement une dépendance ou un workflow privilégié.

## 21. Journalisation, audit et surveillance

Les journaux doivent permettre d'établir qui a fait quoi, sur quelle ressource, quand, avec quel résultat et sous quelle autorisation, pour les opérations qui l'exigent.

Les événements pertinents incluent notamment :
- connexion, déconnexion, récupération et changement de session ;
- création, acceptation, modification et révocation d'un accès ;
- consultation, partage, téléchargement, export et suppression sensibles ;
- modification de rôles, relations et permissions ;
- actions administratives et opérations privilégiées ;
- conflits, synchronisations rejetées et reprises ;
- appels d'outils IA et actions préparées/exécutées ;
- ouverture, suspension ou transmission de contenus confidentiels ;
- changements de configuration, migrations et déploiements ;
- incidents, alertes et mesures correctives.

Ne pas journaliser par défaut :
- mots de passe, jetons, clés ou secrets ;
- contenu intégral de volontés, pièces ou conversations privées ;
- corps de requêtes sensibles ;
- prompts complets ou contexte IA complet ;
- URL signées ou liens d'accès temporaires.

Les journaux doivent avoir accès restreint, intégrité protégée, rétention définie, horodatage fiable et mécanismes de recherche/audit. L'accès aux journaux ne doit pas devenir un accès indirect à tous les contenus privés.

## 22. Sauvegardes, restauration et continuité

- Définir les ressources sauvegardées, fréquence, rétention, chiffrement et responsabilités.
- Séparer les droits d'administration des sauvegardes et des environnements actifs.
- Protéger les copies de sauvegarde au même niveau que les données sources.
- Tester régulièrement la restauration dans un environnement isolé.
- Définir les objectifs de reprise (RTO/RPO) selon la criticité et les capacités réellement disponibles.
- Prévoir les données locales non synchronisées, fichiers objets, secrets, journaux et configurations.
- Contrôler les accès après restauration et révoquer les sessions/jetons devenus non sûrs.
- Ne pas affirmer qu'une sauvegarde est exploitable sans test de restauration.

## 23. Vulnérabilités et réponse aux incidents

Toute suspicion de fuite, accès indu, compromission, perte ou altération doit être signalée rapidement et traitée sans dissimulation.

Processus minimal :
1. détecter et consigner les faits observés ;
2. qualifier la portée, les ressources et les personnes potentiellement affectées ;
3. contenir l'incident sans détruire les preuves ;
4. révoquer les sessions, clés, liens ou permissions compromis selon le besoin ;
5. préserver les journaux et éléments techniques ;
6. évaluer les obligations de notification et délais légaux ;
7. corriger la cause racine et les effets ;
8. vérifier l'efficacité de la correction ;
9. communiquer de manière exacte et proportionnée ;
10. enregistrer les enseignements et mesures préventives.

Ne pas tenter de masquer un incident par la suppression de logs, la réécriture d'historique ou la modification non tracée des données. Les vulnérabilités critiques doivent entraîner une suspension des opérations à risque et une priorisation immédiate.

## 24. Tests de sécurité obligatoires

Toute évolution pertinente doit inclure des tests négatifs et des preuves couvrant le périmètre.

### 24.1 Identité et autorisation
- non authentifié ;
- session expirée ou révoquée ;
- compte A tentant d'accéder aux ressources de B ;
- propriétaire, participant accepté, invitation en attente, participant révoqué ;
- changement de rôle pendant une session ;
- accès direct par URL/ID ;
- droits de lecture, écriture, suppression, partage et export séparés.

### 24.2 Base, API et stockage
- RLS sur chaque opération pertinente ;
- appels RPC directs et fonctions privilégiées ;
- paramètres invalides, champs supplémentaires et charges excessives ;
- fichiers falsifiés, chemins traversants, MIME trompeur et taille excessive ;
- URL signée expirée ou utilisée hors périmètre ;
- abus de débit et requêtes concurrentes ;
- migrations fraîches et mises à niveau.

### 24.3 Hors ligne et appareils
- changement de compte sur le même appareil ;
- session expirée avant synchronisation ;
- révocation pendant qu'une opération est en attente ;
- rejeu et duplication d'opération ;
- conflits et données locales non synchronisées ;
- cache résiduel après déconnexion ;
- perte réseau pendant upload ou mutation.

### 24.4 Intelligence et automatisations
- injection directe et indirecte de prompt ;
- demande d'exfiltration de données ou de secrets ;
- tentative d'accès à un dossier tiers ;
- appel d'outil absent de la liste blanche ;
- paramètres falsifiés ou identifiant non autorisé ;
- tentative de modifier permissions ou règles ;
- action sensible sans approbation ;
- sortie hallucinée, JSON invalide ou contenu malveillant ;
- quota atteint, boucle, coût excessif et indisponibilité fournisseur ;
- données privées présentes dans les logs, prompts ou réponses.

Les tests simulés doivent être complétés par des tests d'intégration adaptés. Un test non exécuté est non vérifié. Les résultats doivent être associés au commit testé.

## 25. État de sécurité observé dans le dépôt

Cette section est une photographie de la branche documentaire observée au commit `df9055b973398c8e3cf6759b33a03d59a22c87e0` (8 novembre 2026). Elle ne certifie ni l'environnement distant ni l'exhaustivité des contrôles.

### 25.1 Mécanismes repérés

- Client Supabase initialisé avec une clé publishable côté client et stockage de session configuré.
- Provider d'authentification qui s'abonne aux événements d'authentification et vérifie la session initiale.
- Configuration `verify_jwt = true` pour les fonctions `ai-chat` et `ai-context`.
- Module partagé `supabase/functions/_shared/ai-security.ts` qui vérifie un bearer token avec `auth.getUser`, utilise un client utilisateur pour les données et consomme une limite serveur via RPC.
- Limites observées : 12 appels/minute pour `ai-chat`, 30 pour `ai-context`.
- RPC `consume_ai_request` protégée pour le rôle service, avec verrou consultatif et registre d'événements.
- Limitation de taille des corps et validation de messages dans les fonctions IA.
- Requête de contexte dossier exécutée avec le client utilisateur, soumise aux politiques de la base.
- Migrations qui définissent des protections RLS/Storage et tests SQL ciblés.
- Tests Vitest pour l'autorisation IA, les handlers et les limites de requête.

### 25.2 Limites et points à auditer

La présence de ces mécanismes ne prouve pas que :
- toutes les tables, vues, fonctions RPC et opérations Storage sont correctement protégées ;
- toutes les politiques RLS couvrent les quatre opérations CRUD et les cas multi-participants ;
- toutes les fonctions serveur vérifient les permissions à la ressource ;
- les origines CORS sont restreintes selon chaque environnement ;
- les données locales sensibles sont protégées contre l'accès partagé à l'appareil ;
- les flux de fichiers couvrent toutes les menaces de contenu ;
- les données hautement sensibles sont exclues des prompts et journaux ;
- les engagements du fournisseur IA conviennent à toutes les catégories de données ;
- tous les parcours de révocation, délégation, export et suppression sont complets ;
- les contrôles du projet Supabase distant correspondent aux migrations GitHub.

### 25.3 Observations spécifiques IA

Le code observé montre que `ai-chat` reçoit un historique de messages limité et construit un prompt système côté serveur ; la fonction `ai-context` lit certains champs du dossier via un client utilisateur soumis aux règles de base, puis transmet un contexte limité à la passerelle IA. La fonction de contexte borne la taille de la requête et le nombre de suggestions retournées.

Ces éléments ne suffisent pas à démontrer une protection complète contre l'injection indirecte, une politique de rétention fournisseur, une isolation de mémoire multi-domaines, une gestion générale d'outils autonomes ou une validation humaine intégrée à chaque action sensible. Ces capacités restent des exigences à vérifier et à construire avant toute mise en service correspondante.

## 26. Gestion des exceptions et interdictions

Une exception de sécurité doit être documentée, justifiée, limitée dans le temps et dans son périmètre, approuvée par l'autorité compétente, accompagnée de mesures compensatoires et réexaminée. Elle ne peut pas neutraliser une obligation légale, autoriser l'accès indu aux données d'autrui ou permettre une action IA sensible sans contrôle humain.

Il est interdit de :
- désactiver RLS ou une validation pour faire fonctionner une interface ;
- exposer des clés privilégiées ou données d'un autre compte ;
- utiliser un rôle métier comme substitut à une permission ;
- considérer une déclaration ou une sortie IA comme preuve juridique ;
- envoyer des volontés secrètes ou documents sensibles à un modèle sans garanties validées ;
- laisser un modèle décider des données accessibles ou appeler librement des outils ;
- exécuter une action sensible sans autorisation explicite ;
- contourner une révocation par un cache, une tâche différée ou une synchronisation ;
- masquer un incident ou supprimer les traces nécessaires à l'enquête ;
- déclarer un système sécurisé sans tests et preuves sur le périmètre réel.

## 27. Processus de revue sécurité avant livraison

Avant toute PR affectant identité, données, documents, permissions, stockage, IA, automatisations ou environnements :

1. lire `AGENTS.md`, `GOVERNANCE.md`, `ARCHITECTURE-RULES.md` et ce document ;
2. identifier les ressources, acteurs, flux et frontières de confiance ;
3. établir les menaces et abus plausibles ;
4. définir la politique d'accès et les refus attendus ;
5. vérifier les validations frontend, serveur, base et stockage ;
6. examiner les données transmises aux fournisseurs, à l'IA et aux journaux ;
7. vérifier les opérations différées, hors ligne et après révocation ;
8. ajouter les tests positifs, négatifs et adversariaux ;
9. examiner les migrations, secrets, dépendances et changements de configuration ;
10. relire le diff et vérifier les preuves sur le commit final ;
11. documenter les risques résiduels et les contrôles non exécutés ;
12. obtenir les autorisations nécessaires avant fusion, déploiement ou modification d'un environnement distant.

## 28. Checklist de sécurité

- [ ] Les données et ressources sont classifiées.
- [ ] Les acteurs et niveaux d'identité sont distingués.
- [ ] L'authentification est vérifiée côté serveur.
- [ ] L'autorisation est appliquée par ressource et action.
- [ ] Les cas tiers, refusés, révoqués et non authentifiés sont testés.
- [ ] RLS et Storage sont vérifiés pour le périmètre concerné.
- [ ] Les fonctions privilégiées ont des droits minimaux.
- [ ] Les entrées et fichiers sont validés et bornés.
- [ ] Les secrets sont absents du client et du dépôt.
- [ ] Les caches et files locales respectent l'isolation des comptes.
- [ ] La synchronisation revalide les permissions.
- [ ] Les journaux n'exposent pas de contenu sensible.
- [ ] Les données transmises à l'IA sont nécessaires et autorisées.
- [ ] Les injections de prompt directes et indirectes sont testées.
- [ ] Les outils IA sont en liste blanche, validés et bornés.
- [ ] Les actions sensibles IA exigent une validation humaine.
- [ ] Les fournisseurs et conditions de rétention sont évalués.
- [ ] Les quotas, délais, coûts et modes dégradés sont définis.
- [ ] Les sauvegardes et restaurations sont contrôlées.
- [ ] Les incidents et exceptions disposent d'une procédure.
- [ ] Les preuves correspondent au commit et à l'environnement testés.
- [ ] Les limites et risques résiduels sont communiqués.

## 29. Références et articulation documentaire

Lire ce document avec :
- `/AGENTS.md` — instructions centrales et garde-fous ;
- `/CONTRIBUTING.md` — contribution et revue ;
- `GOVERNANCE.md` — responsabilités, autorisations, arbitrages et exceptions ;
- `ARCHITECTURE-RULES.md` — couches, frontières, contrats, IA et résilience ;
- `DATA-AND-DATABASE-RULES.md` — classification, schémas, RLS, rétention et migrations ;
- `AI-AND-AUTOMATION-RULES.md` — gouvernance détaillée des modèles, agents, outils et automatisations ;\n- `UI-UX-STANDARDS.md` — exigences d'interface pour les profils, permissions, données privées, états d'accès et interactions sensibles ;
- `TESTING-REQUIREMENTS.md` — tests et preuves ;
- procédures d'incident, de sauvegarde, de déploiement et de gestion des secrets.

Les documents annoncés mais non encore publiés restent à produire. Leur absence ne suspend aucune règle de sécurité déjà définie ici.

---

**Règle finale :** Heritis ne doit jamais exposer une information, accorder un droit, altérer une preuve ou exécuter une action parce qu'un écran, un utilisateur, une automatisation ou une intelligence le demande. Chaque accès et chaque action doivent être légitimes, limités, vérifiables et traçables.

---

## Référentiel permanent complémentaire

Les règles de modélisation, de qualité, de protection, de synchronisation, de conservation et de sobriété des données sont définies dans [DATA-AND-DATABASE-RULES.md](DATA-AND-DATABASE-RULES.md). Ce référentiel doit être consulté pour toute évolution touchant aux données ou à leur stockage.
