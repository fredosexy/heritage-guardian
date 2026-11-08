-- Building and real-estate V1 RLS and relationship regression tests.
-- Run only against a disposable local Supabase database:
--   supabase start
--   supabase db reset
--   supabase test db

BEGIN;
SELECT plan(16);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'building-owner@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'building-participant@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'building-outsider@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '61000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'building-pending@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

INSERT INTO public.dossiers (id, user_id, type, title)
VALUES
  ('62000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001', 'terrain', 'Terrain parent'),
  ('62000000-0000-0000-0000-000000000002', '61000000-0000-0000-0000-000000000001', 'batiment', 'Bâtiment principal'),
  ('62000000-0000-0000-0000-000000000003', '61000000-0000-0000-0000-000000000001', 'batiment', 'Second bâtiment'),
  ('62000000-0000-0000-0000-000000000004', '61000000-0000-0000-0000-000000000002', 'terrain', 'Terrain autre propriétaire'),
  ('62000000-0000-0000-0000-000000000005', '61000000-0000-0000-0000-000000000001', 'terrain', 'Dossier non bâtiment');

INSERT INTO public.participants (dossier_id, user_id, role, accepted_at)
VALUES
  ('62000000-0000-0000-0000-000000000002', '61000000-0000-0000-0000-000000000002', 'viewer', now()),
  ('62000000-0000-0000-0000-000000000002', '61000000-0000-0000-0000-000000000004', 'viewer', NULL);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000001', true);

SELECT lives_ok(
  $$ INSERT INTO public.building_properties (dossier_id, parent_terrain_dossier_id, property_kind, locality)
     VALUES ('62000000-0000-0000-0000-000000000002', '62000000-0000-0000-0000-000000000001', 'immeuble', 'Douala') $$,
  'the owner can create a building linked to their own Terrain dossier'
);
SELECT lives_ok(
  $$ INSERT INTO public.building_properties (dossier_id, property_kind)
     VALUES ('62000000-0000-0000-0000-000000000003', 'maison') $$,
  'the owner can create a building without a known Terrain'
);
SELECT lives_ok(
  $$ INSERT INTO public.building_units (id, building_dossier_id, designation, unit_kind)
     VALUES ('63000000-0000-0000-0000-000000000001', '62000000-0000-0000-0000-000000000002', 'Appartement A', 'appartement') $$,
  'the owner can add a separately tracked unit'
);
SELECT lives_ok(
  $$ INSERT INTO public.building_person_relations (building_dossier_id, unit_id, person_name, declared_role)
     VALUES ('62000000-0000-0000-0000-000000000002', '63000000-0000-0000-0000-000000000001', 'Personne déclarée', 'proprietaire_declare') $$,
  'a declared person role can be linked to a building unit'
);
SELECT lives_ok(
  $$ INSERT INTO public.building_events (building_dossier_id, event_type, title, parties_statements)
     VALUES ('62000000-0000-0000-0000-000000000002', 'desaccord_voisinage', 'Désaccord signalé', '[{"party":"Partie A","statement":"Déclaration attribuée"}]'::jsonb) $$,
  'a dated or undated dispute event can preserve attributed party statements'
);
SELECT is(
  (SELECT count(*)::integer FROM public.building_properties WHERE dossier_id = '62000000-0000-0000-0000-000000000002'),
  1,
  'the owner can read the building property'
);

SELECT set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000002', true);
SELECT is(
  (SELECT count(*)::integer FROM public.building_properties WHERE dossier_id = '62000000-0000-0000-0000-000000000002'),
  1,
  'an accepted participant can read the building property'
);
SELECT throws_ok(
  $$ INSERT INTO public.building_events (building_dossier_id, event_type, title)
     VALUES ('62000000-0000-0000-0000-000000000002', 'autre', 'Participant write attempt') $$,
  '42501', NULL,
  'a read-only participant cannot add building events'
);

SELECT set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000004', true);
SELECT is(
  (SELECT count(*)::integer FROM public.building_properties WHERE dossier_id = '62000000-0000-0000-0000-000000000002'),
  0,
  'a pending participant cannot read the building property'
);

SELECT set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000003', true);
SELECT is(
  (SELECT count(*)::integer FROM public.building_properties WHERE dossier_id = '62000000-0000-0000-0000-000000000002'),
  0,
  'an unrelated user cannot read the building property'
);
UPDATE public.building_properties SET locality = 'Intrusion'
WHERE dossier_id = '62000000-0000-0000-0000-000000000002';
SELECT set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000001', true);
SELECT is(
  (SELECT locality FROM public.building_properties WHERE dossier_id = '62000000-0000-0000-0000-000000000002'),
  'Douala',
  'an unrelated user cannot update the building property'
);

SELECT set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000001', true);
SELECT throws_ok(
  $$ INSERT INTO public.building_properties (dossier_id, parent_terrain_dossier_id, property_kind)
     VALUES ('62000000-0000-0000-0000-000000000003', '62000000-0000-0000-0000-000000000004', 'maison') $$,
  '23514', 'parent_terrain_must_be_owned_terrain_dossier',
  'a building cannot link to another owner Terrain'
);
SELECT throws_ok(
  $$ INSERT INTO public.building_properties (dossier_id, property_kind)
     VALUES ('62000000-0000-0000-0000-000000000005', 'maison') $$,
  '23514', 'building_property_requires_batiment_dossier',
  'a Terrain dossier cannot be registered as a building'
);
SELECT throws_ok(
  $$ INSERT INTO public.building_person_relations (building_dossier_id, unit_id, person_name, declared_role)
     VALUES ('62000000-0000-0000-0000-000000000003', '63000000-0000-0000-0000-000000000001', 'Personne externe', 'voisin') $$,
  '23514', 'unit_must_belong_to_same_building',
  'a person relation cannot point to a unit from another building'
);
SELECT throws_ok(
  $$ UPDATE public.dossiers SET type = 'terrain'
     WHERE id = '62000000-0000-0000-0000-000000000002' $$,
  '23514', 'building_dossier_type_is_locked',
  'a dossier linked to a building cannot be silently reclassified'
);
SELECT lives_ok(
  $$ UPDATE public.building_properties SET locality = 'Douala - Bonanjo'
     WHERE dossier_id = '62000000-0000-0000-0000-000000000002' $$,
  'the owner can update the building property'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
