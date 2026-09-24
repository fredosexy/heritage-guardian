begin;

select plan(9);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'phase0-owner@example.test', '', now(), '{}', '{"full_name":"Owner"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'phase0-other@example.test', '', now(), '{}', '{"full_name":"Other"}', now(), now());

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

insert into public.dossiers (id, user_id, type, title)
values (
  '30000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000001',
  'terrain',
  'Phase 0 isolation dossier'
);

insert into public.dossiers (user_id, type, title, client_operation_id)
values (
  '10000000-0000-4000-8000-000000000001',
  'terrain',
  'Idempotent dossier',
  'phase0-operation-0001'
)
on conflict (user_id, client_operation_id)
do update set title = excluded.title;

insert into public.dossiers (user_id, type, title, client_operation_id)
values (
  '10000000-0000-4000-8000-000000000001',
  'terrain',
  'Idempotent dossier',
  'phase0-operation-0001'
)
on conflict (user_id, client_operation_id)
do update set title = excluded.title;

select is(
  (select count(*) from public.dossiers where client_operation_id = 'phase0-operation-0001'),
  1::bigint,
  'replaying one offline operation does not duplicate a dossier'
);

select is(
  (select count(*) from public.dossiers where id = '30000000-0000-4000-8000-000000000003'),
  1::bigint,
  'owner can read own dossier'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}', true);

select is(
  (select count(*) from public.dossiers where id = '30000000-0000-4000-8000-000000000003'),
  0::bigint,
  'unrelated user cannot read dossier'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

insert into public.participants (dossier_id, user_id, role)
values (
  '30000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000002',
  'viewer'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}', true);

select is(
  (select count(*) from public.dossiers where id = '30000000-0000-4000-8000-000000000003'),
  1::bigint,
  'declared participant can read dossier'
);

insert into public.alerts (user_id, type, severity, title, message)
values (
  '20000000-0000-4000-8000-000000000002',
  'info', 'low', 'Own alert', 'Visible only to owner'
);

select is((select count(*) from public.alerts), 1::bigint, 'user reads own alerts only');
select ok(public.consume_ai_quota(30), 'authenticated user can consume AI quota');

select is(
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'avatars %'),
  4::bigint,
  'avatar storage has four ownership policies'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'proofs'),
  4::bigint,
  'proofs table has expected RLS policies'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'dossiers'),
  5::bigint,
  'dossiers table has expected RLS policies'
);

select * from finish();
rollback;
