# Services transversaux — interventions dans Heritis V1

> Statut : première cartographie fonctionnelle issue des décisions de conception.  
> Périmètre : V1. Ce document décrit les interventions attendues des services communs ; il ne constitue ni une spécification technique ni une autorisation de développer toutes les capacités citées.

## 1. Rôle des services transversaux

Les services transversaux soutiennent les quatre domaines métier de Heritis. Ils fournissent des mécanismes communs sans devenir de nouveaux domaines métier et sans dupliquer les données propres aux dossiers, aux biens, aux volontés ou aux conflits.

Un service transversal intervient uniquement lorsqu'un parcours métier en a besoin. Les règles particulières d'un domaine — notamment la confidentialité des volontés, les permissions d'un dossier de succession et les accès aux pièces d'un conflit — restent prioritaires.

## 2. Catalogue des services et de leurs interventions

### 2.1 Identité, comptes et profils

- Permettre la création, l'accès et la gestion d'un compte utilisateur.
- Distinguer visiteur, personne reconnue et utilisateur disposant d'un compte, selon le parcours d'accès défini par Heritis.
- Associer les actions et contributions à leur auteur.
- Gérer les informations de profil utiles aux parcours, sans confondre identité déclarée et identité vérifiée.
- Permettre la récupération et la sécurisation du compte.
- Fournir une identité de référence aux dossiers et aux invitations, sans créer une identité métier différente dans chaque domaine.

**Limite :** le fait d'être identifié dans Heritis ne prouve ni une filiation, ni une qualité d'héritier, ni un droit de propriété, ni une qualité professionnelle.

### 2.2 Permissions, rôles et contrôle des accès

- Déterminer qui peut consulter, ajouter, modifier, confirmer, contester, partager ou administrer un élément.
- Appliquer des permissions adaptées au dossier, à la personne, au document et à l'action.
- Gérer les invitations, demandes d'accès, délégations limitées, changements de rôle et révocations.
- Prendre en compte la portée d'un accès, sa durée et ses éventuelles conditions.
- Empêcher qu'une délégation donne davantage de droits que ceux détenus par la personne qui délègue.
- Appliquer les règles de confidentialité renforcées aux volontés secrètes et aux dernières volontés.
- Faire respecter les contrôles d'accès côté serveur ; masquer un bouton dans l'interface ne constitue jamais une autorisation.

**Limite :** un rôle déclaré dans un dossier ne constitue pas une reconnaissance juridique d'un droit ou d'une qualité.

### 2.3 Documents, pièces justificatives et preuves

- Ajouter des documents et pièces à un bien, un dossier de succession, une volonté ou un dossier de conflit.
- Classer les pièces et conserver leur lien avec l'objet métier concerné.
- Enregistrer leur provenance, leur auteur ou déposant, leur date d'ajout et leur contexte.
- Distinguer document ajouté, document examiné et document vérifié ; la présence d'une pièce ne prouve pas à elle seule sa validité.
- Contrôler l'accès, le partage et le téléchargement selon les permissions et la confidentialité du dossier.
- Préserver les versions et les éléments nécessaires à la traçabilité lorsqu'une pièce est remplacée ou corrigée.

**Limite :** le service documentaire conserve et organise les pièces ; il ne certifie pas leur authenticité et ne décide pas de leur valeur juridique.

### 2.4 Journal, historique et traçabilité

- Enregistrer les actions importantes : création, ajout, modification, invitation, accès accordé ou retiré, confirmation, contestation, vérification, transmission et clôture.
- Associer chaque événement à un auteur ou acteur identifiable, une date et l'objet concerné.
- Conserver l'historique des décisions et changements de statut.
- Distinguer une déclaration initiale, une correction, une contestation et une vérification.
- Préserver les contributions et événements antérieurs lorsqu'un participant quitte un dossier ou lorsqu'un dossier est rouvert.
- Fournir un historique compréhensible et un récapitulatif téléchargeable lorsque le domaine le prévoit.

**Limite :** le journal rend les actions traçables ; il ne transforme pas une déclaration ou une décision interne en preuve juridique.

### 2.5 Notifications et rappels

- Informer une personne d'une invitation, d'une demande d'accès ou d'un changement de permission qui la concerne.
- Signaler les changements importants d'un dossier auquel elle est autorisée à accéder.
- Informer l'auteur des étapes nécessitant une action ou une vérification avant une transmission conditionnelle.
- Suivre les étapes d'une demande auprès d'un professionnel dans le domaine des conflits.
- Signaler les erreurs de synchronisation ou les opérations qui nécessitent une reprise.
- Respecter les préférences de notification et ne jamais divulguer le contenu d'un élément confidentiel dans une notification non protégée.

**Limite :** une notification informe ; elle ne vaut ni validation, ni consentement, ni preuve de réception, sauf mécanisme explicite de confirmation enregistré.

### 2.6 Assistant adaptatif et aide à la compréhension

- Accueillir et guider la découverte de Heritis.
- Expliquer les domaines, les étapes, les termes et les actions disponibles dans un langage accessible.
- Aider à préparer une déclaration ou à compléter un dossier étape par étape.
- Signaler les informations manquantes et proposer la prochaine action utile.
- Orienter vers le bon domaine ou vers les services professionnels disponibles lorsque le parcours le prévoit.
- Adapter ses explications au contexte et aux droits d'accès de la personne.

**Limites :**
- L'assistant ne tranche pas un litige et ne reconnaît pas juridiquement une propriété, une filiation ou une qualité d'héritier.
- Il ne remplace ni un avocat, ni un notaire, ni une autorité compétente.
- Il ne déclenche jamais seul la transmission d'une volonté secrète ou d'une dernière volonté.
- Il ne révèle pas des informations auxquelles la personne n'a pas accès.

### 2.7 Synchronisation et fonctionnement en réseau faible ou hors connexion

- Permettre, lorsque le parcours le prévoit, de préparer localement une déclaration ou une modification sans connexion stable.
- Conserver les opérations en attente et leur état.
- Reprendre les envois lorsque la connexion redevient disponible.
- Signaler les échecs et permettre une reprise explicite et contrôlée.
- Détecter les modifications concurrentes et présenter les conflits nécessitant une décision autorisée.
- Éviter les doublons lors des reprises et préserver l'identité de l'auteur de chaque opération.
- Isoler les données locales selon le compte actif et protéger les données sensibles stockées sur l'appareil.

**Limites :**
- Une opération en attente localement n'est pas encore une opération enregistrée sur le serveur.
- Une volonté secrète ne peut être transmise hors ligne sur la seule base d'un déclencheur local.
- Les vérifications sensibles et les décisions nécessitant une autorité serveur doivent attendre une connexion et une validation adaptées.

## 3. Interventions par domaine métier

| Service transversal | Patrimoine et gestion des biens | Héritage et succession | Volontés secrètes et dernières volontés | Gestion des conflits et litiges |
| --- | --- | --- | --- | --- |
| Identité, comptes et profils | Identifier le déclarant et les personnes associées au bien ; distinguer les rôles déclarés. | Identifier l'initiateur, les personnes concernées et les participants du dossier. | Identifier l'auteur, les destinataires et les personnes chargées des vérifications prévues. | Identifier le déclarant, les parties concernées et les professionnels sollicités. |
| Permissions et accès | Contrôler la consultation et la contribution aux informations et pièces du bien. | Gérer les accès différenciés, invitations, délégations, demandes d'accès et révocations. | Réserver l'accès au contenu aux personnes expressément autorisées ; appliquer les conditions de confidentialité. | Contrôler l'accès au dossier, aux pièces et aux échanges avec les professionnels. |
| Documents et preuves | Classer les pièces relatives au bien et à ses déclarations ou droits associés. | Rassembler les pièces du dossier de succession et les éléments soumis à confirmation ou contestation. | Conserver de manière confidentielle les volontés et les pièces associées, avec contrôle renforcé. | Rassembler les pièces du conflit et les partager de manière sélective avec un professionnel autorisé. |
| Journal et traçabilité | Tracer déclarations, associations de personnes, ajouts de pièces et vérifications. | Tracer invitations, contributions, confirmations, contestations et changements de permissions. | Tracer versions, changements de destinataires ou conditions, vérifications et transmissions. | Tracer signalement, constitution, orientation, demandes professionnelles, suivi et clôture. |
| Notifications | Informer des demandes ou changements qui concernent les personnes autorisées. | Informer des invitations, demandes d'accès et évolutions du dossier. | Informer des actions de vérification ou de transmission sans exposer le contenu confidentiel. | Informer du suivi du dossier, des réponses professionnelles et des rendez-vous. |
| Assistant adaptatif | Aider à décrire et documenter un bien sans conclure à la propriété juridique. | Aider à constituer le dossier et expliquer les étapes sans décider de la qualité d'héritier ni calculer un partage juridique. | Aider à organiser les volontés et expliquer les conditions ; ne jamais décider seul de leur transmission. | Aider à décrire le différend et présenter des voies d'orientation sans arbitrer le litige. |
| Synchronisation et hors connexion | Préparer les informations et pièces lorsque cela est techniquement pris en charge ; synchroniser et signaler les échecs. | Préparer les informations du dossier et les contributions autorisées ; reprendre les opérations en attente. | Permettre la préparation sécurisée lorsque cela est autorisé ; soumettre les vérifications et transmissions à un contrôle connecté. | Préparer le signalement et les pièces ; synchroniser avant toute orientation ou communication externe. |

## 4. Règles communes à respecter

1. **Une seule source de vérité métier :** un bien, une personne, un document ou un dossier ne doit pas être dupliqué simplement parce qu'il est utilisé dans plusieurs domaines.
2. **Permissions avant affichage :** tout accès doit être autorisé par les règles applicables côté serveur.
3. **Déclaration distincte de vérification :** une information saisie, une pièce déposée ou un rôle déclaré ne constitue pas automatiquement un fait vérifié ou un droit reconnu.
4. **Confidentialité proportionnée :** les volontés secrètes et les dernières volontés bénéficient de protections renforcées ; les notifications et l'assistant ne doivent pas contourner ces protections.
5. **Traçabilité des opérations sensibles :** les accès, partages, vérifications, transmissions et révocations importants doivent être attribuables et historisés.
6. **Tolérance aux réseaux instables :** les opérations locales, en attente, synchronisées ou en échec doivent être clairement distinguées.
7. **V1 limitée :** les services communs soutiennent les parcours validés ; ils ne justifient pas l'ajout d'un réseau social, d'une messagerie générale, d'une place de marché ou d'une automatisation juridique.

## 5. Hors périmètre explicite de cette cartographie

Cette cartographie ne valide pas :
- une identité numérique nationale ou une vérification biométrique ;
- une certification automatique des documents ;
- une décision juridique automatisée ou un arbitrage par l'assistant ;
- une messagerie sociale générale entre tous les utilisateurs ;
- la transmission automatique d'une volonté sans vérification requise ;
- une synchronisation garantie de toutes les fonctions sensibles hors connexion ;
- un modèle technique, un schéma de base de données ou des migrations.

Ces sujets nécessiteraient des décisions séparées avant toute conception technique.

## 6. Suite documentaire

Cette première cartographie sert de référence commune pour rédiger ou mettre à jour les documents détaillés sur :
- l'identité et les permissions ;
- la confidentialité et les documents ;
- le journal et la traçabilité ;
- l'assistant et les parcours ;
- la synchronisation et le fonctionnement hors connexion.

Les documents détaillés devront reprendre les décisions métier déjà validées et signaler clairement toute règle qui reste à arbitrer.
