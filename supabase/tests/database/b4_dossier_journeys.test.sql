-- B4 dossier journey regression tests.
-- Run only against a disposable local Supabase database:
--   supabase start
--   supabase db reset
--   supabase test db
-- These fixtures are local test data; never point this test at the active Heritis project.

BEGIN;

SELECT plan(19);

-- Stable fixtures; the local auth trigger creates matching profiles and default roles.
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'b4-owner@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'b4-other@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'b4-admin@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

INSERT INTO public.user_roles (user_id, role)
VALUES ('10000000-0000-0000-0000-000000000003', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.dossiers (id, user_id, type, title, location_name, metadata)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'terrain', 'B4 test owner dossier', 'Douala', '{}'::jsonb),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'terrain', 'B4 test other dossier', 'Douala', '{}'::jsonb);

INSERT INTO public.procedure_definitions (
  id, code, dossier_type, territory, version, status, verified_by, verified_at
) VALUES (
  '30000000-0000-0000-0000-000000000001', 'b4_test_terrain', 'terrain', '*', 1, 'publiee',
  '10000000-0000-0000-0000-000000000003', now()
);

INSERT INTO public.procedure_steps (
  id, procedure_id, step_order, code, title, short_description, territorial_level
) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, 'b4_test_first', 'Première étape', 'Étape de test numéro un', 'local'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 2, 'b4_test_second', 'Deuxième étape', 'Étape de test numéro deux', 'rural');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

SELECT throws_ok(
  $$ INSERT INTO public.procedure_definitions (code, dossier_type, territory, version, status)
     VALUES ('b4_non_admin_insert', 'terrain', '*', 1, 'draft') $$,
  '42501', NULL,
  'un utilisateur non administrateur ne peut pas créer une procédure'
);

SELECT is(
  (SELECT status FROM public.procedure_definitions WHERE id = '30000000-0000-0000-0000-000000000001'),
  'publiee',
  'un utilisateur non administrateur ne peut pas modifier une procédure publiée'
);
UPDATE public.procedure_definitions
SET status = 'archivee'
WHERE id = '30000000-0000-0000-0000-000000000001';

SELECT lives_ok(
  $$ SELECT public.initialize_dossier_journey('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001') $$,
  'le propriétaire peut initialiser le parcours de son dossier'
);
SELECT is(
  (SELECT count(*)::integer FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001'),
  2,
  'l’initialisation crée toutes les étapes de la procédure'
);
SELECT is(
  (SELECT status FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 1),
  'en_cours',
  'la première étape est démarrée automatiquement'
);
SELECT throws_ok(
  $$ SELECT public.initialize_dossier_journey('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001') $$,
  '42501', 'journey_initialization_forbidden',
  'un utilisateur ne peut pas initialiser le parcours du dossier d’un autre'
);

SELECT set_config('request.jwt.claim.sub', '', true);
SELECT throws_ok(
  $$ SELECT public.initialize_dossier_journey('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001') $$,
  '42501', 'journey_initialization_forbidden',
  'une identité absente est refusée lors de l’initialisation'
);

SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
SELECT lives_ok(
  $$ SELECT public.transition_dossier_step(
       (SELECT id FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 1),
       'terminee'
     ) $$,
  'le propriétaire peut terminer une étape en cours'
);
SELECT ok(
  (SELECT completed_at IS NOT NULL FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 1),
  'la fin d’une étape renseigne completed_at'
);
SELECT is(
  (SELECT status FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 2),
  'en_cours',
  'la prochaine étape à faire démarre automatiquement'
);
SELECT throws_ok(
  $$ SELECT public.transition_dossier_step(
       (SELECT id FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 2),
       'a_faire'
     ) $$,
  '22023', 'invalid_step_transition',
  'une transition non autorisée est refusée'
);
SELECT throws_ok(
  $$ SELECT public.transition_dossier_step(
       (SELECT id FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 2),
       'bloquee', ' '
     ) $$,
  '22023', 'blocked_reason_required',
  'une étape bloquée exige une raison non vide'
);
SELECT lives_ok(
  $$ SELECT public.transition_dossier_step(
       (SELECT id FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 2),
       'bloquee', 'Document manquant'
     ) $$,
  'une étape peut être bloquée avec une raison explicite'
);
SELECT lives_ok(
  $$ SELECT public.transition_dossier_step(
       (SELECT id FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 2),
       'en_cours'
     ) $$,
  'une étape bloquée peut reprendre son parcours'
);
SELECT throws_ok(
  $$ SELECT public.transition_dossier_step(
       (SELECT id FROM public.dossier_steps WHERE dossier_id = '20000000-0000-0000-0000-000000000001' AND step_order = 2),
       'terminee'
     ) $$,
  '42501', 'step_transition_forbidden',
  'une transition est refusée sans identité'
);

SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
SELECT lives_ok(
  $$ INSERT INTO public.procedure_definitions (code, dossier_type, territory, version, status)
     VALUES ('b4_admin_insert', 'terrain', '*', 1, 'draft') $$,
  'un administrateur peut créer une procédure'
);

RESET ROLE;
SELECT lives_ok(
  $$ INSERT INTO public.dossier_steps (dossier_id, procedure_step_id, step_order, title, short_description, territorial_level)
     VALUES ('20000000-0000-0000-0000-000000000001', NULL, 90, 'Étape libre A', 'Étape sans référence A', 'autre') $$,
  'une étape autonome sans référence peut être insérée'
);
SELECT lives_ok(
  $$ INSERT INTO public.dossier_steps (dossier_id, procedure_step_id, step_order, title, short_description, territorial_level)
     VALUES ('20000000-0000-0000-0000-000000000001', NULL, 91, 'Étape libre B', 'Étape sans référence B', 'autre') $$,
  'plusieurs étapes autonomes sans référence peuvent coexister'
);
SELECT throws_ok(
  $$ INSERT INTO public.dossier_steps (dossier_id, procedure_step_id, step_order, title, short_description, territorial_level)
     VALUES ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 92, 'Doublon', 'Référence déjà utilisée', 'autre') $$,
  '23505', NULL,
  'une référence d’étape de procédure ne peut pas être dupliquée dans le même dossier'
);

SELECT * FROM finish();
ROLLBACK;
