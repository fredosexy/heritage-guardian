-- Regression tests for shared proof file access.
-- Run only against a disposable local Supabase database:
--   supabase start
--   supabase db reset
--   supabase test db

BEGIN;
SELECT plan(11);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', '51000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'proof-owner@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '51000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'proof-participant@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '51000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'proof-outsider@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '51000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'proof-pending@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

INSERT INTO public.dossiers (id, user_id, type, title)
VALUES ('52000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'terrain', 'Proof access test');

INSERT INTO public.participants (dossier_id, user_id, role, accepted_at)
VALUES
  ('52000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000002', 'viewer', now()),
  ('52000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000004', 'viewer', NULL);

INSERT INTO public.proofs (id, dossier_id, uploaded_by, type, title, storage_path)
VALUES ('53000000-0000-0000-0000-000000000001', '52000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'document', 'Shared proof', '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/shared.pdf');

-- A second object in the owner's folder without a proof record must not be shared.
INSERT INTO storage.objects (bucket_id, name)
VALUES
  ('dossier-proofs', '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/shared.pdf'),
  ('dossier-proofs', '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/unregistered.pdf');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000002', true);
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/shared.pdf'),
  1,
  'a participant can read a proof object attached to their dossier'
);
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/unregistered.pdf'),
  0,
  'a participant cannot read an object without a proof record'
);

SELECT set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000004', true);
SELECT is(
  (SELECT count(*)::integer FROM public.dossiers WHERE id = '52000000-0000-0000-0000-000000000001'),
  0,
  'a participant who has not accepted the invitation cannot read the dossier'
);
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/shared.pdf'),
  0,
  'a participant who has not accepted the invitation cannot read proof files'
);

SELECT set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000003', true);
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/shared.pdf'),
  0,
  'an unrelated user cannot read another dossier proof object'
);

SELECT set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000001', true);
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/shared.pdf'),
  1,
  'the owner retains access to their own proof object'
);

INSERT INTO storage.objects (bucket_id, name, metadata)
VALUES (
  'dossier-proofs',
  '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf',
  '{"original": true}'::jsonb
);
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf'),
  1,
  'the owner can upload an object for their own dossier'
);

SELECT set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000003', true);
SELECT throws_ok(
  $INSERT INTO storage.objects (bucket_id, name)
    VALUES ('dossier-proofs', '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/outsider-upload.pdf')$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'an unrelated user cannot upload into another owner folder'
);
UPDATE storage.objects
SET metadata = '{"tampered": true}'::jsonb
WHERE bucket_id = 'dossier-proofs'
  AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf';
SELECT is(
  (SELECT metadata->>'original' FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf'),
  'true',
  'an unrelated user cannot update an owner proof object'
);
DELETE FROM storage.objects
WHERE bucket_id = 'dossier-proofs'
  AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf';
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf'),
  1,
  'an unrelated user cannot delete an owner proof object'
);

SELECT set_config('request.jwt.claim.sub', '51000000-0000-0000-0000-000000000001', true);
DELETE FROM storage.objects
WHERE bucket_id = 'dossier-proofs'
  AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf';
SELECT is(
  (SELECT count(*)::integer FROM storage.objects WHERE bucket_id = 'dossier-proofs' AND name = '51000000-0000-0000-0000-000000000001/52000000-0000-0000-0000-000000000001/owner-upload.pdf'),
  0,
  'the owner can delete their own proof object'
);

SELECT * FROM finish();
ROLLBACK;
