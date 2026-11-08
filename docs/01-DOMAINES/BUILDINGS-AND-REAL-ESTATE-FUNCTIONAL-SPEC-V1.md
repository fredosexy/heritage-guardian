# Spécification fonctionnelle — Bâtiments et biens immobiliers (V1)

**Référentiel :** Heritis  
**Domaine métier :** Patrimoine et gestion des biens  
**Sous-domaine :** Bâtiments et biens immobiliers  
**Pays de lancement :** Cameroun  
**Statut :** spécification fonctionnelle de travail — à confronter aux règles métier et à valider avant développement  
**Périmètre :** conception fonctionnelle uniquement ; aucun changement applicatif ou schéma de données n'est autorisé par ce document.

---

## 1. Finalité et limites

Ce parcours permet à une personne autorisée de créer, décrire, documenter, localiser et suivre un bâtiment ou un ensemble immobilier, ainsi que les relations déclarées entre ce bien, les personnes, les terrains et les autres dossiers Heritis.

Heritis est un outil d'organisation et de traçabilité. Il ne constitue ni un service cadastral, ni une autorité foncière, ni un notaire, ni un tribunal, ni un expert immobilier. Une fiche, un document téléversé, une mesure, un rapprochement ou un statut interne ne certifie jamais un titre, une propriété, une superficie officielle, une conformité technique ou un droit juridiquement établi.

Les informations doivent toujours distinguer :
- ce qui est déclaré par une personne ;
- ce qui est observé ou mesuré et par quelle méthode ;
- les documents déposés et leur provenance ;
- les vérifications internes effectuées et leur portée ;
- les décisions ou références provenant d'une autorité ou d'un professionnel externe.

Aucune distribution automatique de droits, quote-part, succession ou valeur juridique n'est déduite des informations saisies.

## 2. Périmètre fonctionnel V1

Le parcours couvre :
- maisons et logements individuels ;
- immeubles résidentiels ;
- appartements et unités d'habitation lorsqu'ils sont gérés comme éléments distincts ;
- bâtiments commerciaux, professionnels, administratifs ou mixtes ;
- bâtiments agricoles ou de stockage lorsqu'ils sont inventoriés comme constructions ;
- dépendances et annexes : garage, hangar, magasin, atelier, entrepôt, clôture bâtie ou autre construction déclarée ;
- bâtiments en construction, inachevés, achevés, dégradés ou démolis, avec conservation de leur historique.

La catégorie « bâtiment » décrit une construction. Elle ne remplace pas la catégorie « terrain ». Un même terrain peut porter plusieurs bâtiments ; un bâtiment peut être composé de plusieurs unités ou locaux ; une unité peut être suivie séparément si le besoin et les droits d'accès le justifient.

Hors périmètre V1 tant qu'ils ne sont pas spécifiquement validés : expertise immobilière certifiée, estimation automatisée de marché, calcul juridique de propriété, titre foncier électronique officiel, gestion locative complète, comptabilité immobilière, plans architecturaux CAO, diagnostic structurel, permis de construire automatisé ou démarches administratives exécutées au nom de l'utilisateur.

## 3. Modèle métier et distinctions fondamentales

### 3.1 Objets distincts

Le modèle fonctionnel doit préserver les distinctions suivantes :
1. **Dossier Heritis** : espace de suivi, d'informations, de preuves, d'événements et de permissions.
2. **Bien immobilier / bâtiment** : construction physique décrite dans le dossier.
3. **Terrain support** : parcelle ou terrain auquel le bâtiment peut être rattaché.
4. **Unité ou local** : appartement, boutique, bureau, chambre indépendante ou autre partie suivie séparément.
5. **Personne ou organisation** : entité liée au bâtiment par un rôle déclaré ou documenté.
6. **Relation / intérêt déclaré** : nature de la relation, période, portée et source de déclaration.
7. **Document / preuve** : fichier ou référence, catégorie, auteur ou déposant, date et provenance.
8. **Événement** : construction, acquisition déclarée, rénovation, extension, changement d'usage, sinistre, démolition, correction ou autre fait daté.
9. **Vérification interne / référence externe** : résultat de contrôle Heritis et, séparément, décision ou référence d'une autorité compétente.

Ne pas créer une nouvelle catégorie technique de dossier uniquement pour représenter le bâtiment sans avoir préalablement vérifié l'architecture existante et la compatibilité des types, procédures, droits, synchronisation et données historiques.

### 3.2 Relations entre terrains, bâtiments et unités

- Un terrain peut être lié à zéro, un ou plusieurs bâtiments.
- **En V1, un bâtiment peut être rattaché à un seul terrain** connu, ou rester sans rattachement lorsque l'information est inconnue.
- Le rattachement d'un même bâtiment à plusieurs terrains, y compris la gestion d'un lien principal et de liens secondaires, est reporté à une version future. Ne pas simuler cette capacité par des doublons ou des liens non maîtrisés.
- Un bâtiment peut contenir plusieurs unités ou locaux.
- **Dès la V1, chaque unité pertinente peut être suivie séparément** (appartement, boutique, bureau ou autre local), tout en restant explicitement rattachée à son bâtiment parent.
- Le suivi séparé d'une unité permet de lui associer ses propres informations utiles : désignation, usage, caractéristiques, surfaces de même nature, occupation, personnes et relations déclarées, documents, événements et historique.
- Les informations communes au bâtiment ne doivent pas être dupliquées inutilement dans chaque unité ; le lien parent/enfant doit permettre de distinguer ce qui relève du bâtiment entier de ce qui relève d'une unité.
- Une unité peut être reliée à son bâtiment parent sans devenir automatiquement un bien juridiquement indépendant ni recevoir automatiquement un statut de propriété distinct.
- Les liens sont explicites, datés si nécessaire, modifiables avec historique et accompagnés de leur source.
- Une référence interne Heritis n'est jamais présentée comme une référence cadastrale ou un titre officiel.
- La suppression ou la fusion d'une fiche ne doit pas effacer les preuves, événements ou relations historiques ; toute opération doit être traçable et soumise aux permissions.

## 4. Parcours utilisateur

### Étape 1 — Démarrer une fiche

L'utilisateur connecté disposant du droit de création choisit « Bâtiment ou bien immobilier ». Le choix doit être distinct du parcours Terrain et clairement expliqué.

Champs minimaux :
- nom ou désignation du bien ;
- type de construction ;
- commune/localité ou indication de localisation, si connue.

La désignation peut être provisoire. Le système ne doit pas inventer une adresse ou un identifiant lorsque l'information manque.

### Étape 2 — Identifier et caractériser

Choisir une catégorie :
- maison / logement individuel ;
- immeuble résidentiel ;
- appartement / unité ;
- bâtiment commercial ou professionnel ;
- bâtiment à usage mixte ;
- bâtiment agricole ou de stockage ;
- dépendance / annexe ;
- autre construction (préciser).

Renseigner si connu :
- usage principal et usages secondaires ;
- statut physique : projet, en construction, inachevé, achevé, occupé, vacant, dégradé, sinistré, en rénovation, démoli ;
- nombre de niveaux au-dessus du sol et niveaux en sous-sol, sans imposer une valeur si inconnue ;
- nombre d'unités ou de locaux, si pertinent ;
- matériaux principaux, structure et couverture, sous forme de déclarations descriptives ;
- année ou période de construction, avec possibilité « inconnue » et indication de la source ;
- description libre et caractéristiques utiles.

Les listes de choix doivent rester compréhensibles et permettre « autre » et « inconnu ». Ne pas transformer une absence de réponse en valeur négative.

### Étape 3 — Localiser

Permettre :
- saisie d'une adresse ou description locale ;
- pays, région, département, commune/arrondissement, quartier/localité selon la granularité réellement disponible ;
- coordonnées GPS obtenues par action explicite ou saisies manuellement ;
- affichage sur carte avec fournisseur configurable, sous réserve de connexion ;
- rattachement facultatif à une fiche Terrain existante ;
- ajout ultérieur d'une référence cadastrale ou administrative comme donnée déclarée, avec type, organisme émetteur, date et pièce justificative.

Les coordonnées du bâtiment représentent un point de localisation ou un repère choisi. Elles ne sont pas un bornage foncier. Un contour de bâtiment, s'il est ajouté dans une évolution, doit être explicitement nommé « emprise indicative du bâtiment » et ne pas être confondu avec le contour cadastral du terrain.

La recherche d'adresse / géocodage doit être un service distinct du fournisseur de tuiles cartographiques. Toute transmission de requête à un fournisseur externe doit être expliquée. Ne jamais transmettre automatiquement des données privées du dossier ou des coordonnées exactes sans action ou consentement approprié.

### Étape 4 — Décrire les surfaces et dimensions

Conserver séparément les notions suivantes :
- superficie du terrain support, provenant de la fiche Terrain ou d'une source déclarée ;
- emprise au sol du bâtiment ;
- surface construite totale ;
- surface habitable, si connue ;
- surface utile ou commerciale, si pertinente ;
- surface des annexes, si elle est suivie séparément.

Pour chaque mesure :
- valeur et unité (m² en unité de référence, avec conversions d'affichage) ;
- nature exacte de la surface ;
- méthode : déclarée, document, mesure manuelle, calcul indicatif, relevé professionnel ou autre ;
- date de mesure ou de déclaration ;
- auteur / source ;
- précision ou marge d'incertitude, si connue.

Ne jamais additionner des surfaces de nature différente. Ne pas déduire une surface habitable à partir de l'emprise au sol ou d'un nombre de niveaux. Les calculs automatiques sont indicatifs, explicitement nommés et ne remplacent pas un relevé professionnel. Aucune surface ne doit être qualifiée d'officielle sans référence externe vérifiable et correctement attribuée.

### Étape 5 — Décrire l'état, l'occupation et les équipements

Informations déclaratives facultatives :
- état général : très bon, bon, moyen, dégradé, dangereux déclaré, en travaux, inconnu ;
- éléments observés : toiture, murs, fondations apparentes, ouvertures, installations, finitions ;
- présence déclarée d'eau, électricité, assainissement, accès routier et autres équipements ;
- situation d'occupation : occupé par le déclarant, membres de la famille, locataire, tiers, vacant, usage mixte, inconnue ;
- dates de début et de fin d'occupation si elles sont utiles et connues ;
- commentaire et pièces associées.

Ne pas produire de diagnostic de sécurité, d'habitabilité ou de conformité technique sur la seule base d'une déclaration ou de photos. Les situations dangereuses doivent être présentées comme des signalements à faire évaluer par un professionnel compétent.

### Étape 6 — Associer les personnes et organisations

Une fiche peut être liée à plusieurs personnes ou organisations. Chaque relation est indépendante et peut contenir :
- personne / organisation liée ;
- rôle déclaré : propriétaire déclaré, copropriétaire déclaré, détenteur / possesseur, bénéficiaire d'un droit déclaré, représentant, gestionnaire, occupant, locataire, mandataire ou autre rôle documenté ;
- description libre de la portée du rôle ;
- période de validité déclarée ;
- source de l'information et personne ayant effectué la déclaration ;
- documents associés ;
- niveau de vérification interne et historique des corrections.

Les rôles d'occupation, de gestion ou de location ne doivent pas être assimilés à un droit de propriété. Les rôles déclarés ne sont pas des statuts juridiques automatiquement confirmés. Ne pas calculer ni attribuer automatiquement des quotes-parts.

L'accès à la fiche, la capacité de modifier les données et la relation déclarée au bien sont trois notions distinctes. Les permissions doivent être gérées selon le modèle transversal des profils et accès Heritis, et non déduites du seul rôle métier.

### Étape 7 — Ajouter les documents et preuves

Catégories proposées :
- acte ou titre présenté ;
- document administratif ou référence officielle ;
- plan, croquis ou relevé ;
- permis, autorisation ou dossier de travaux ;
- contrat de vente, location, occupation ou gestion ;
- facture, reçu ou preuve de travaux ;
- photographie / vidéo datée ;
- rapport technique ou expertise professionnelle ;
- document d'assurance ou de sinistre ;
- autre document.

Pour chaque pièce, conserver lorsque disponible :
- catégorie, intitulé et description ;
- fichier ou référence externe ;
- déposant et date de dépôt ;
- date portée par le document ;
- émetteur déclaré ;
- provenance et lien avec le bâtiment, une unité, une personne ou un événement ;
- statut de contrôle interne et observations ;
- historique de remplacement, correction ou retrait.

Un fichier lisible ou marqué « vérifié » par un contrôle interne n'est pas une authentification juridique de son contenu. Ne pas afficher « titre valide » ou « propriété certifiée » sur la base d'un dépôt ou d'un contrôle automatique.

### Étape 8 — Historique et événements

Permettre d'enregistrer des événements datés :
- construction / début et fin déclarés ;
- acquisition ou transmission déclarée ;
- extension, rénovation, transformation ou changement d'usage ;
- création ou division d'unités ;
- occupation ou libération ;
- sinistre, dégradation ou démolition ;
- expertise ou intervention professionnelle ;
- correction d'une information antérieure.

Chaque événement conserve son auteur, sa date, sa description, sa source et ses pièces. Une correction ne doit pas écraser silencieusement la valeur précédente.

### Étape 9 — Vérifier et enregistrer

Avant l'enregistrement, afficher un récapitulatif lisible avec :
- informations complètes ;
- informations facultatives manquantes ;
- incohérences détectables (par exemple surface habitable supérieure à une surface construite déclarée, sans bloquer automatiquement si la source justifie le cas) ;
- pièces jointes ;
- relations et permissions ;
- localisation et niveau de précision.

L'utilisateur peut enregistrer un brouillon incomplet. Les champs obligatoires sont limités au minimum nécessaire pour identifier la fiche. L'état incomplet ne doit pas empêcher de conserver une information utile.

Après sauvegarde, proposer des actions cohérentes : consulter la fiche, compléter les informations, ajouter une pièce, relier un terrain, associer une personne ou enregistrer un événement.

## 5. Présentation de la fiche et actions

La fiche détaillée doit hiérarchiser l'information et éviter une page surchargée. Composition recommandée :
1. En-tête : nom du bien, type, localité et état de complétude.
2. Résumé : usage, statut physique, rattachement au terrain, point de localisation.
3. Sections consultables : description, localisation et surfaces, personnes et relations, occupation, documents, historique.
4. Actions visibles selon permissions : modifier, ajouter une preuve, associer une personne, relier un terrain, enregistrer un événement.
5. Historique et provenance accessibles sans masquer les informations importantes.

Les actions doivent être réelles, avec états de chargement, succès, erreur, annulation et confirmation lorsque nécessaire. Ne pas afficher de bouton décoratif ou d'action non implémentée.

## 6. Données, intégrité et compatibilité

Avant toute évolution du schéma, réaliser une analyse du modèle réel :
- table et type des dossiers ;
- métadonnées existantes et versions ;
- participants, preuves, événements, procédures et permissions ;
- RLS et fonctions serveur ;
- création en ligne, brouillons locaux, file hors ligne et synchronisation ;
- import/export, sauvegarde et historique.

Le premier modèle conceptuel peut être représenté dans les métadonnées versionnées existantes uniquement si l'audit démontre que cette solution est suffisamment sûre, validable, interrogeable et compatible avec les données existantes. Ne pas présumer que JSONB convient à toutes les relations ou requêtes. Les entités nécessitant intégrité référentielle, recherche, partage ou politiques RLS dédiées pourront exiger des tables normalisées et des migrations après audit.

Exigences impératives :
- ne pas modifier les types historiques de dossiers par simple commodité ;
- ne pas casser les fiches Terrain ni leurs métadonnées versionnées ;
- ne pas dupliquer les personnes, terrains ou documents déjà enregistrés ;
- préserver les identifiants, relations et historiques ;
- valider les entrées côté client et côté serveur ;
- contrôler taille, type réel et accès des fichiers ;
- appliquer le moindre privilège et vérifier les droits dans les politiques serveur ;
- préserver les brouillons invités et les mécanismes de rattachement à la création de compte ;
- préserver les modifications hors ligne et détecter les conflits de synchronisation sans écrasement silencieux.

Aucune décision de migration ou de stockage définitif n'est prise par cette spécification.

## 7. Confidentialité, permissions et traçabilité

- Les informations immobilières peuvent être sensibles ; le niveau de visibilité par défaut doit être privé.
- Les documents et coordonnées ne sont visibles que par les personnes autorisées.
- Les rôles métier ne confèrent pas automatiquement des permissions applicatives.
- Les actions de consultation, ajout, modification, suppression logique, partage et révocation doivent respecter les règles transversales.
- Toute modification significative conserve auteur, date, ancienne valeur lorsque nécessaire, nouvelle valeur et motif de correction.
- Les partages et invitations sont explicites, limités dans leur portée et révocables selon les règles de profils.
- Ne pas exposer les coordonnées précises ou documents dans les aperçus visiteurs.

## 8. Mode hors connexion et synchronisation

Le parcours doit permettre, selon les capacités réelles du socle :
- création et modification d'un brouillon local ;
- conservation des champs, relations et métadonnées saisies ;
- indication claire de l'état local, en attente, synchronisé ou en conflit ;
- reprise après fermeture ou perte de connexion ;
- détection des modifications concurrentes ;
- résolution explicite des conflits et conservation de l'historique.

La carte et les services de géocodage peuvent nécessiter une connexion. L'indisponibilité du fond cartographique ne doit pas bloquer la saisie textuelle ou la sauvegarde locale des données.

## 9. Accessibilité et règles UI/UX

- Mobile-first, responsive téléphone, tablette et ordinateur.
- Cartes de domaine généreuses et peu nombreuses ; dans le formulaire, préférer des sections claires et progressives plutôt que des cartes répétées.
- Une action principale clairement identifiable par étape.
- Titres explicites, descriptions concises, vocabulaire non technique.
- Champs groupés par sens métier, unités visibles, exemples et aide contextuelle.
- États vides, erreurs, progression et sauvegarde compréhensibles.
- Cibles tactiles d'au moins 48 dp lorsque possible.
- Navigation clavier, focus visible, libellés accessibles, annonces des erreurs et compatibilité lecteurs d'écran.
- Contraste WCAG AA minimum ; thème clair et sombre.
- Ne pas coder l'état uniquement par la couleur.
- Préserver les saisies lors des erreurs et des changements d'étape.

## 10. Contrôles et critères d'acceptation

Le parcours ne sera considéré comme implémenté qu'après vérification de tous les points applicables :

### Fonctionnels
- créer les différents types de bâtiments ;
- sauvegarder un brouillon incomplet ;
- modifier et consulter chaque section ;
- rattacher un terrain sans fusionner les deux fiches ;
- gérer plusieurs bâtiments sur un terrain ;
- gérer plusieurs unités dans un bâtiment ;
- associer plusieurs personnes avec rôles distincts ;
- joindre et consulter les preuves ;
- enregistrer et corriger les événements ;
- conserver les mesures avec leur nature, unité, source et date ;
- afficher les actions uniquement selon les permissions.

### Données et sécurité
- tests des validations et des relations ;
- tests d'accès propriétaire, participant autorisé et tiers non autorisé ;
- tests RLS et fonctions serveur concernés ;
- tests de fichiers et permissions ;
- tests de non-régression Terrain et des données historiques ;
- tests de création, reprise et résolution des conflits hors ligne.

### Qualité et expérience
- tests unitaires et intégration ;
- lint et build ;
- parcours mobile et grand écran ;
- vérification clavier et lecteur d'écran ;
- contraste clair/sombre et zoom ;
- essais réels Android/iOS avant toute affirmation de compatibilité complète.

Aucun critère ne doit être marqué réussi sans preuve de test correspondante.

## 11. Découpage de réalisation recommandé

1. **Lot A — Modèle et audit technique :** vérifier les entités, métadonnées, permissions, RLS, synchronisation et données existantes ; proposer un modèle cible sans migration prématurée.
2. **Lot B — Création et identification :** formulaire progressif, catégories de bâtiments, descriptions et sauvegarde sûre.
3. **Lot C — Localisation et surfaces :** adresse, GPS, rattachement au terrain, mesures différenciées et provenance.
4. **Lot D — Personnes, unités et occupation :** relations multiples, unités, accès et occupation.
5. **Lot E — Documents et historique :** pièces, événements, corrections et traçabilité.
6. **Lot F — Fiche détaillée et qualité :** consultation, actions, accessibilité, mode hors connexion, sécurité et non-régression.

Chaque lot doit être audité, testé et documenté sur GitHub avant le suivant. Ne pas modifier Lovable. Ne pas fusionner une PR sans validation explicite.

## 12. Questions à trancher avant le développement

Les points suivants doivent être confirmés à la revue métier et technique :
- quelles références administratives camerounaises doivent être prévues comme champs facultatifs, après vérification des sources et pratiques applicables ?
- quel niveau de détail est réellement utile pour les matériaux, équipements et états sans transformer Heritis en outil de diagnostic technique ?
- quelles catégories de documents et de relations doivent être obligatoires ou facultatives selon le type de bâtiment ?

Ces questions ne bloquent pas la spécification du parcours de base, mais doivent être résolues avant de figer le schéma de données et les validations métier.

---

**Règle de prudence :** toute information immobilière reste une déclaration, une observation, une pièce déposée ou une référence externe selon sa provenance. Heritis ne transforme pas ces éléments en certification juridique ou technique.
