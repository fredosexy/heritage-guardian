
# Plan MVP — "Mémoire" (nom provisoire)

App PWA mobile-first, offline-first, FR/EN, design moderne épuré (terre/ocre + vert), centrée sur la **Mémoire des Terres** avec un **assistant IA proactif** au cœur de l'expérience.

## 🎯 Périmètre MVP
1. Auth (email + téléphone OTP)
2. Onboarding intelligent (IA pose 3-4 questions, active modules)
3. **Module Mémoire des Terres** (complet)
4. **Assistant IA** (accueil, contextuel, proactif, actionnable)
5. Profil utilisateur + paramètres
6. PWA installable + offline

Modules Héritage / Volontés / Savoirs : **placeholders visibles** (cards "Bientôt disponible") pour montrer la vision sans les construire.

## 🎨 Design system
- Palette : ocre/terre cuite (#B45309-like), vert savane, fond ivoire chaud, texte charbon
- Typo : Inter (UI) + une serif douce pour titres patrimoniaux
- Composants : cards arrondies (radius 12-16px), ombres douces, icônes Lucide
- Mobile-first, max 3 niveaux de navigation, CTA gros et visibles
- Bottom nav 5 items : Accueil · Dossiers · ➕ Créer · Alertes · Profil

## 📱 Écrans MVP

**Auth**
- Écran de connexion (toggle Email / Téléphone)
- OTP SMS via Twilio (connecteur)
- Inscription rapide (nom, langue préférée)

**Onboarding IA** (3-4 écrans)
- "Bonjour, je suis votre assistant patrimonial"
- Questions : Avez-vous un terrain ? Souhaitez-vous protéger un héritage ? Enregistrer une volonté ?
- → génère un parcours personnalisé + 1ère suggestion d'action

**Accueil (Dashboard vivant)**
- Header : photo + "Bonjour [Nom]" + 🔔
- **Bloc IA principal** : message dynamique + 4 boutons rapides (Sécuriser terrain, Créer héritage, Ajouter volonté, Gérer conflit)
- Bloc Alertes (cartes colorées par criticité)
- Bloc Suggestions IA
- Feed activité/conseils locaux

**Mes dossiers**
- Liste filtrable, badge statut (🟢 sécurisé / 🟡 incomplet / 🔴 risque)
- Recherche + filtres par type

**Création (flow guidé par IA)**
- Choix type → étapes 1-écran-1-action
- IA suggère les champs manquants en temps réel

**Page dossier Terrain**
- Header : nom + statut visuel + score de sécurisation
- Onglets : Résumé · Preuves · Participants · Historique
- Géolocalisation (carte Leaflet, optionnelle offline)
- Upload preuves (image/doc/vidéo, compression auto pour 2G/3G)
- **IA fixe en bas** : suggestions contextuelles ("Ajoutez un titre foncier", "Invitez un témoin")

**Alertes** : liste filtrée (Urgent / Info / IA)

**Profil** : infos perso, modules activés, langue (FR/EN), thème, sécurité, déconnexion

## 🤖 Assistant IA (Lovable AI Gateway, gemini-3-flash-preview)

Edge functions :
- `ai-onboarding` : analyse réponses → renvoie parcours + modules à activer
- `ai-context` : suggestions par dossier (analyse complétude, génère 2-3 actions concrètes)
- `ai-proactive` : cron quotidien → scanne dossiers utilisateur → crée alertes (manque preuve, héritier non défini, etc.)
- `ai-actionable` : génère brouillon de dossier à partir d'une intention en langage naturel
- `ai-chat` : assistant conversationnel streaming (juridique simplifié)

Personnalité : simple, humaine, locale, orientée action. Prompts en FR/EN selon préférence.

## 🗄️ Backend (Lovable Cloud / Supabase)

Tables :
- `profiles` (id, name, phone, language, theme, onboarding_completed)
- `user_roles` (séparée, app_role enum) — sécurité
- `dossiers` (id, user_id, type, title, status, visibility, metadata jsonb, geo_point, created_at)
- `proofs` (id, dossier_id, type, storage_path, verified, created_at)
- `participants` (id, dossier_id, user_id ou contact_info, role, permissions)
- `alerts` (id, user_id, type, message, related_dossier_id, severity, read)
- `ai_conversations` + `ai_messages`

Storage bucket : `dossier-proofs` (privé, RLS par propriétaire/participant)

RLS strict sur toutes les tables. `has_role()` security definer.

## 🔌 Offline-first

- Service worker (vite-plugin-pwa) avec stratégie network-first pour API, cache-first pour assets
- IndexedDB (via Dexie) pour dossiers + brouillons hors-ligne
- File de sync : actions queued localement → rejouées dès reconnexion
- Indicateur de statut connexion + nombre d'éléments en attente

## 🌍 i18n
- `react-i18next`, FR par défaut, EN dispo
- Switch dans Profil

## 🔐 Sécurité
- Auth email + OTP téléphone (Twilio connecteur)
- RLS sur toutes tables, rôles séparés
- Storage privé avec policies par dossier
- Préparation chiffrement futur pour Volontés (V2)

## 📦 Stack
- React + Vite + TS + Tailwind + shadcn (existant)
- Lovable Cloud (Postgres + Auth + Storage + Edge functions)
- Lovable AI Gateway (gemini-3-flash-preview)
- Twilio (OTP SMS) via connecteur
- Leaflet (carte), Dexie (IndexedDB), vite-plugin-pwa
- react-i18next

## 🚀 Ordre de livraison (1 implémentation)
1. Design system + i18n + layout + bottom nav
2. Auth (email d'abord, puis OTP Twilio)
3. Schéma DB + RLS + storage
4. Onboarding IA + dashboard accueil
5. Module Terres : création, liste, page dossier, preuves, géoloc
6. Assistant IA (contextuel + chat)
7. Alertes + IA proactive (cron)
8. PWA + offline (Dexie + sync queue)
9. Profil + paramètres
10. Cards "Bientôt" pour Héritage/Volontés/Savoirs

Tu pourras itérer ensuite module par module (Héritage, Volontés, Savoirs, écosystème experts).
