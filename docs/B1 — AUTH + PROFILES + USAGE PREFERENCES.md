# B1 — AUTH + PROFILES + USAGE PREFERENCES

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

Le projet existe déjà. Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Avant toute modification, inspecte :

- Supabase/Auth existant ;
- migrations ;
- `profiles` éventuel ;
- onboarding ;
- AuthContext/hooks/stores ;
- profil utilisateur ;
- paramètres ;
- types générés Supabase ;
- RLS existante ;
- préférences utilisateur existantes.

Compare l'existant avec B1.

Si une fonctionnalité existe et est conforme : **garde-la**.

Si elle existe partiellement : **complète-la**.

Ne crée jamais une deuxième implémentation.

---

# 2. OBJECTIF B1

Finaliser en production uniquement :

1. Supabase Auth ;
2. profil applicatif ;
3. préférences d'utilisation ;
4. accès frontend typé à ces données ;
5. RLS ;
6. intégration avec onboarding et paramètres existants.

Ne touche pas encore :

- Biens ;
- Dossiers ;
- Parcours ;
- Acteurs ;
- Documents ;
- Signalements ;
- Communications.

---

# 3. AUTH

Réutilise l'authentification Supabase existante.

Garantir :

- session persistante ;
- restauration de session ;
- logout propre ;
- loading state global ;
- utilisateur authentifié accessible via une seule source de vérité ;
- aucune duplication `AuthContext` / store auth ;
- aucune clé secrète dans le frontend.

Ne change pas le provider ou le flow d'auth existant s'il fonctionne.

---

# 4. PROFILE

Créer ou compléter `profiles`.

Relation :

```text
profiles.id → auth.users.id
```

Champs minimum :

```text
id
display_name
preferred_language
phone nullable
avatar_path nullable
status
created_at
updated_at
```

Ne stocke pas ici :

- permissions Dossier ;
- rôles propres à un dossier ;
- compétences professionnelles ;
- historique métier.

Prévoir la création du profil utilisateur selon le mécanisme backend le plus sûr déjà compatible avec l'architecture existante.

---

# 5. USAGE PREFERENCES

Créer ou compléter `usage_preferences`.

Relation :

```text
profile/user 1 → 1 usage_preferences
```

Champs :

```text
user_id
context_type
assistance_level
interface_level
audio_preference
accompaniment_preference
created_at
updated_at
```

Valeurs :

```text
context_type:
rural | urbain

assistance_level:
autonome | assiste

interface_level:
essentiel | standard | complet

audio_preference:
prefere | optionnel

accompaniment_preference:
seul | accompagne
```

Important :

`rural` ne signifie jamais automatiquement `assisté`.

Ces préférences modifient uniquement l'expérience UI/UX.

Elles ne donnent aucun droit métier supplémentaire.

---

# 6. RLS

Activer et tester la RLS.

`profiles` :

- utilisateur authentifié peut lire son propre profil ;
- peut modifier uniquement les champs autorisés de son profil ;
- aucun utilisateur ordinaire ne peut modifier le profil d'un autre.

`usage_preferences` :

- utilisateur peut lire ses propres préférences ;
- créer/modifier uniquement ses propres préférences ;
- aucune lecture des préférences privées d'un autre utilisateur sans autorisation explicite future.

Politique par défaut :

**DENY BY DEFAULT.**

---

# 7. FRONTEND

Réutilise les hooks/services existants.

Créer seulement si absent une API frontend claire permettant conceptuellement :

```ts
useAuth()
useProfile()
useUsagePreferences()
```

ou l'équivalent déjà utilisé par le projet.

Les composants ne doivent jamais appeler directement :

```ts
supabase.from(...)
```

Flux :

```text
UI
↓
hook
↓
service/repository
↓
Supabase
```

---

# 8. ONBOARDING

Adapter l'onboarding existant uniquement si nécessaire.

Lors de la première utilisation, recueillir progressivement :

- contexte principal : rural / urbain ;
- préférence : lire / écouter ;
- niveau d'interface souhaité : simple / standard / complet ;
- seul / accompagné.

Ne pas afficher de formulation stigmatisante comme :

`Savez-vous lire ?`

Utiliser des formulations simples comme :

`Comment préférez-vous recevoir les explications ?`

Les préférences doivent être enregistrées dans `usage_preferences`.

---

# 9. PROFIL > PARAMÈTRES

Ajouter ou compléter :

**Mode d'utilisation**

Permettre de modifier :

- contexte ;
- assistance ;
- niveau d'interface ;
- audio ;
- accompagnement.

Les changements doivent être persistés immédiatement et reflétés dans l'application sans recréer un deuxième état local indépendant.

---

# 10. TYPES

Utiliser les types Supabase générés si le projet possède déjà ce workflow.

Éviter de maintenir manuellement un deuxième modèle incompatible avec la base.

Aucun `any` injustifié.

---

# 11. MIGRATIONS

Toute modification DB doit être faite par migration versionnée.

Ne modifie pas manuellement un schéma production sans migration.

Ne crée pas une nouvelle table si une table existante couvre déjà correctement le besoin.

---

# 12. VALIDATION

Avant de terminer, vérifier :

- build réussi ;
- TypeScript sans erreur ;
- login/session existants toujours fonctionnels ;
- profil chargé après authentification ;
- préférences chargées ;
- modification des préférences persistée ;
- RLS testée entre au moins deux utilisateurs ;
- aucun accès croisé non autorisé ;
- aucune duplication auth/store/profile ;
- aucun appel Supabase métier ajouté dans les composants ;
- onboarding existant toujours fonctionnel ;
- aucun domaine B2+ modifié.

---

# 13. LIVRABLE

À la fin, rapporte uniquement :

1. existant réutilisé ;
2. fichiers créés ;
3. fichiers modifiés ;
4. migrations créées ;
5. policies RLS ajoutées/modifiées ;
6. hooks/services réutilisés ou ajoutés ;
7. tests exécutés ;
8. écarts restant éventuellement à traiter.

**Ne commence pas B2.**