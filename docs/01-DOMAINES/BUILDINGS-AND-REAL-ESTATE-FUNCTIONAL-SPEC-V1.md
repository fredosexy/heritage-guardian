# Spécification fonctionnelle — Bâtiments et biens immobiliers (V1)

**Référentiel :** Heritis  
**Domaine métier :** Patrimoine et gestion des biens  
**Sous-domaine :** Bâtiments et biens immobiliers  
**Pays de lancement :** Cameroun  
**Statut :** spécification fonctionnelle de travail — à confronter aux règles métier et à valider avant développement  
**Périmètre :** conception fonctionnelle uniquement ; aucun changement applicatif ou schéma de données n'est autorisé par ce document.

---

## 1. Finalité et limites

Ce parcours permet à une personne autorisée de déclarer un bâtiment ou un bien immobilier, de le sécuriser par la conservation des informations et preuves disponibles, de le documenter et d'en organiser la gestion patrimoniale. Il permet aussi d'identifier les personnes et ayants droit déclarés, de préparer la transmission du bien et de documenter les désaccords ou différends qui le concernent (voisinage, occupation, vente, achat ou location).

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
- maisons, logements individuels et immeubles ;
- appartements, boutiques, bureaux et autres unités lorsqu'ils sont gérés séparément ;
- bâtiments commerciaux, professionnels, administratifs, agricoles ou mixtes ;
- dépendances et autres constructions déclarées.

La catégorie « bâtiment » décrit le bien immobilier déclaré et ne remplace pas la catégorie « terrain ». En V1, un bâtiment peut être rattaché à un seul terrain connu ou rester sans rattachement. Le suivi séparé des unités pertinentes est conservé, sans présumer de leur indépendance juridique.

La V1 se concentre sur la déclaration du bien, son identification, la conservation des preuves, les relations entre personnes et bien, la gestion des occupations, ventes et locations, la préparation de la transmission et le suivi documentaire des différends.

Sont reportés aux versions futures : description technique détaillée des matériaux, structures, fondations, toitures et équipements ; diagnostic de sécurité ou d'habitabilité ; expertise technique ; plans architecturaux détaillés ; estimation automatisée de marché ; gestion locative complète et comptabilité immobilière ; exécution de démarches administratives au nom de l'utilisateur.

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

### 3.3 Références administratives et foncières — contexte camerounais

La fiche doit pouvoir conserver des références administratives utiles sans imposer un format unique ni conclure à la validité juridique du bien. Les références sont facultatives, peuvent être absentes ou inconnues et doivent toujours être rattachées à l'objet concerné (terrain support, bâtiment, unité, personne ou procédure).

Types de références à prévoir en V1, sous forme d'une liste extensible :
- **Titre foncier** : numéro ou référence telle qu'elle apparaît sur la pièce ; conservation foncière / service émetteur indiqué ; ressort territorial ; date portée par le document ; personne ou entité mentionnée sur la pièce, si nécessaire et autorisé.
- **Certificat de propriété** : référence portée sur le certificat, date d'émission, conservation foncière ou service émetteur indiqué et titre foncier auquel il se rapporte lorsqu'il est mentionné.
- **CPDFC-AR** : intitulé complet « Certificat de Possession des Droits Fonciers Coutumiers Administrativement Reconnus » ; référence portée sur la pièce ; commission ou autorité/service indiqué ; date ; procédure d'immatriculation directe concernée lorsqu'elle est connue. Ce document doit rester distingué du titre foncier et être décrit selon sa portée propre.
- **Dossier ou procédure d'immatriculation** : numéro de réquisition ou de suivi lorsqu'il figure sur une pièce, référence de demande, récépissé de dépôt, service destinataire, dates de dépôt et de suivi, et état de procédure tel que déclaré ou documenté.
- **Autre référence cadastrale, domaniale ou administrative** : libellé exact figurant sur la pièce, sans imposer une nomenclature ou une structure de numéro non vérifiée.
- **Référence d'urbanisme ou de construction** : permis, autorisation, certificat d'urbanisme, visa ou autre acte présenté, avec son intitulé exact, son organisme émetteur et sa date. Ne pas supposer qu'un tel document établit la propriété foncière.

Pour chaque référence, conserver au minimum, lorsque disponible :
- type de référence et libellé original ;
- numéro / identifiant exactement retranscrit, sans normalisation destructive ;
- organisme et service émetteurs tels qu'indiqués sur la pièce ;
- ressort territorial ou lieu concerné ;
- date d'émission, de dépôt ou de validité, en distinguant ces notions ;
- objet auquel la référence se rapporte et lien éventuel avec une autre référence ;
- document justificatif, provenance, déposant et date de dépôt ;
- statut de traitement Heritis : déclaré, pièce déposée, contrôle de cohérence interne effectué, vérification externe documentée ou information contestée ;
- observations, historique de correction et date de dernière mise à jour.

Les statuts Heritis décrivent uniquement le traitement de l'information dans l'application. Une vérification externe ne peut être indiquée que si sa source, son auteur, sa date et sa portée sont consignés ; elle ne doit pas être simulée par une simple lecture automatique du document.

**Règles de prudence :**
- Une référence foncière qui concerne le terrain support doit être rattachée à la fiche Terrain correspondante ; elle ne devient pas automatiquement une référence propre au bâtiment ou à chaque unité.
- Un document présenté, une copie, un récépissé ou un numéro saisi ne prouve pas à lui seul l'authenticité, l'actualité, l'absence d'opposition ou la titularité d'un droit.
- Ne pas inventer de format de numéro, de préfixe, de registre, de volume ou de folio obligatoire. Conserver la transcription fidèle et permettre les champs inconnus.
- Ne pas rendre obligatoire un titre foncier ou un certificat pour créer une fiche immobilière ; permettre de documenter les situations sans référence disponible.
- Toute vérification de situation juridique ou de concordance officielle relève du service public compétent ou d'un professionnel habilité, hors certification Heritis.

Sources institutionnelles consultées pour cadrer les libellés (à recontrôler avant toute évolution réglementaire) :
- [MINDCAF — Foire aux questions](https://mindcaf.gov.cm/fr/faq/) : procédure d'immatriculation, récépissé, livre foncier et duplicatum du titre foncier.
- [MINDCAF — Documents publics](https://mindcaf.gov.cm/fr/docs/) : ressources et documents administratifs publiés par le ministère.
- [MINDCAF — Pièces constitutives des dossiers de visas](https://www.mindcaf.gov.cm/media/filer_public/ee/69/ee690694-4776-4a2a-8a0a-4c695c6dcd93/fiche_des_pieces_constitutives_des_dossiers_de_visas.pdf) : mention du certificat de propriété, du certificat d'urbanisme et du plan de masse dans le dossier concerné.
- [Lettre-circulaire n° 002/MINDAF/CAB/LC du 09 février 2024 — CPDFC-AR](https://www.labase-lextenso.fr/sites/lextenso/files/lextenso_upload/l_cameroun_lettre_circulaire_0002mindcafcablc_9_fevr._2024.pdf) : texte instituant ce certificat dans le cadre indiqué par la circulaire.

- La suppression ou la fusion d'une fiche ne doit pas effacer les preuves, événements ou relations historiques ; toute opération doit être traçable et soumise aux permissions.

## 4. Parcours utilisateur

### Étape 1 — Démarrer une fiche

L'utilisateur connecté disposant du droit de création choisit « Bâtiment ou bien immobilier ». Le choix doit être distinct du parcours Terrain et clairement expliqué.

Champs minimaux :
- nom ou désignation du bien ;
- type de construction ;
- commune/localité ou indication de localisation, si connue.

La désignation peut être provisoire. Le système ne doit pas inventer une adresse ou un identifiant lorsque l'information manque.

### Étape 2 — Identifier le bien

Renseigner uniquement les informations utiles à son identification et à son suivi :
- désignation ou nom usuel du bien ;
- catégorie générale : maison, immeuble, appartement, boutique, bureau, bâtiment commercial, bâtiment mixte, dépendance ou autre ;
- usage déclaré, si connu ;
- adresse, quartier, localité ou description permettant de le retrouver ;
- statut général déclaré : en projet, en construction, existant, inoccupé, occupé, en travaux ou démoli ;
- description courte facultative et nombre d'unités lorsque cela aide à identifier l'ensemble.

Les détails techniques (matériaux, structure, toiture, équipements, diagnostic et état technique détaillé) ne font pas partie du parcours V1. Les champs inconnus restent explicitement inconnus ; aucune caractéristique ne doit être déduite automatiquement.

### Étape 3 — Localiser

Permettre :
- saisie d'une adresse ou description locale ;
- pays, région, département, commune/arrondissement, quartier/localité selon la granularité réellement disponible ;
- coordonnées GPS obtenues par action explicite ou saisies manuellement ;
- affichage sur carte avec fournisseur configurable, sous réserve de connexion ;
- rattachement facultatif à une fiche Terrain existante ;
- ajout facultatif de références foncières, cadastrales, domaniales, administratives ou d'urbanisme selon les règles de la section 3.3 ; les références relatives au terrain restent rattachées à la fiche Terrain.

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

### Étape 5 — Suivre l'occupation et la gestion courante

Enregistrer les informations de gestion utiles, selon les besoins :
- bien occupé, vacant ou utilisé par plusieurs personnes ;
- personnes qui occupent le bien et qualité déclarée (membre de famille, occupant, locataire, gardien, gestionnaire ou autre) ;
- période d'occupation connue ;
- contrat ou accord de location, vente, mise à disposition ou gestion lorsqu'il existe ;
- loyers, dépôts, échéances ou paiements uniquement si le suivi correspondant est activé et validé dans le périmètre fonctionnel ;
- événements de remise des clés, entrée, sortie, remise en état ou fin d'accord.

La V1 permet de documenter les relations et événements de gestion ; elle ne constitue pas un logiciel complet de gestion locative ni un service de recouvrement. Aucune occupation ou transaction déclarée ne vaut reconnaissance juridique automatique.

### Étape 6 — Identifier les personnes liées et les ayants droit déclarés

Une fiche peut être liée à plusieurs personnes ou organisations, avec des relations distinctes et datées :
- propriétaire ou copropriétaire déclaré ;
- détenteur ou possesseur déclaré ;
- bénéficiaire d'un droit déclaré ;
- représentant, mandataire ou gestionnaire ;
- occupant, locataire ou acquéreur déclaré ;
- héritier ou ayant droit potentiel/déclaré ;
- voisin ou autre personne concernée par une limite, un accès ou un différend.

Pour chaque relation, conserver sa nature, sa portée déclarée, sa période, sa source, les documents associés et son historique. Identifier un ayant droit dans Heritis ne signifie pas que sa qualité successorale est juridiquement établie. Les droits, parts et qualités successorales ne sont pas calculés ou confirmés automatiquement.

Les informations de succession et de legs doivent être reliées au domaine « Héritage et succession » et, lorsque cela est pertinent, au domaine « Volontés secrètes et dernières volontés ». La fiche immobilière conserve le lien avec le bien et les personnes concernées sans remplacer le dossier successoral, un testament ou les formalités applicables.

L'accès à la fiche, la capacité de modifier les données et la relation déclarée au bien sont trois notions distinctes. Les permissions sont gérées selon les règles transversales Heritis.

### Étape 7 — Ajouter les documents et preuves

Catégories proposées :
- acte ou titre présenté ;
- titre foncier, certificat de propriété ou autre référence foncière présentée ;
- CPDFC-AR ou pièce relative à une procédure d'immatriculation, si applicable ;
- document administratif, cadastral, domanial ou d'urbanisme ;
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

### Étape 8 — Documenter les ventes, achats, locations et transmissions

Conserver les événements et pièces relatifs à :
- vente ou achat déclaré, promesse ou accord préparatoire ;
- changement de personne se présentant comme acquéreur ou vendeur ;
- location, renouvellement, modification ou fin d'un contrat ;
- remise ou restitution des clés ;
- donation, legs annoncé ou transmission déclarée ;
- décès signalé et ouverture d'un suivi successoral, avec accès restreint ;
- contestation, opposition ou désaccord signalé sur une transaction ou une occupation.

Pour chaque événement, préciser qui a fait la déclaration, à quelle date, sur quelle base et avec quelles pièces. Plusieurs versions ou déclarations contradictoires doivent pouvoir coexister avec leur provenance ; ne pas écraser une déclaration antérieure ni désigner automatiquement une partie comme titulaire du droit.

### Étape 9 — Documenter les différends et échanges

Prévoir un dossier ou un signalement lié au bien pour organiser notamment :
- désaccord de voisinage ;
- contestation de limite, passage, accès ou occupation ;
- plainte ou désaccord concernant des nuisances ou dégradations ;
- contestation entre vendeur, acheteur, propriétaire déclaré, locataire, occupant ou gestionnaire ;
- désaccord sur un contrat, une remise de clés, un paiement ou la libération du bien.

Le suivi peut contenir les personnes concernées, les faits allégués par chaque partie, une chronologie, les échanges, les pièces, les témoins déclarés, les démarches entreprises et les suites connues. Les informations contradictoires restent attribuées à leur auteur et ne sont pas fusionnées en une version réputée vraie.

Heritis aide à conserver et organiser les éléments, à suivre les actions et à orienter vers un professionnel ou une autorité compétente lorsque nécessaire. Il ne mène pas d'enquête coercitive, ne convoque pas les parties, ne tranche pas le différend, ne fixe pas une limite officielle et ne rend aucune décision juridique. Toute médiation éventuelle doit être explicitement cadrée, volontaire et distincte d'une décision officielle.

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

1. **Lot A — Audit et modèle :** vérifier les entités, relations, permissions, RLS, synchronisation et données existantes ; proposer un modèle cible sans migration prématurée.
2. **Lot B — Déclaration et sécurisation :** identification minimale du bien, rattachement facultatif à un terrain, sauvegarde, accès et protection des informations.
3. **Lot C — Personnes et gestion :** rôles déclarés, unités, occupants, locataires, acquéreurs, gestionnaires et événements de gestion.
4. **Lot D — Documentation et transmission :** pièces, historique, ayants droit déclarés et liens avec les domaines succession et volontés.
5. **Lot E — Différends :** signalements, chronologie contradictoire, échanges, preuves et orientation sans arbitrage.
6. **Lot F — Fiche détaillée et qualité :** consultation, actions, accessibilité, mode hors connexion, sécurité et non-régression.

Chaque lot doit être audité, testé et documenté sur GitHub avant le suivant. Ne pas modifier Lovable. Ne pas fusionner une PR sans validation explicite.

## 12. Points à valider avant développement

- Le périmètre exact du suivi financier des locations (loyers, dépôts, échéances et paiements) doit être confirmé avant d'en faire une fonctionnalité complète.
- Les règles de partage d'un dossier de différend entre plusieurs parties doivent être cadrées avec des permissions strictes, car chaque partie peut fournir des informations contradictoires ou confidentielles.
- Les modalités d'orientation, de médiation volontaire ou de transfert vers un professionnel/une autorité doivent être définies sans présenter Heritis comme arbitre.

Les caractéristiques techniques détaillées du bâtiment et les diagnostics sont reportés aux versions futures et ne constituent pas des questions bloquantes de la V1.

---

**Règle de prudence :** toute information immobilière reste une déclaration, une observation, une pièce déposée ou une référence externe selon sa provenance. Heritis ne transforme pas ces éléments en certification juridique ou technique.
