begin;

select plan(16);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', 'b2000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'b2-creator@example.test', '', now(), '{}', '{"full_name":"B2 Creator"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b2000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'b2-other@example.test', '', now(), '{}', '{"full_name":"B2 Other"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b2000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'b2-holder@example.test', '', now(), '{}', '{"full_name":"B2 Holder"}', now(), now());

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b2000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

select lives_ok(
  $$ select public.create_bien_with_holder(
    'terrain', 'Terrain personnel', 'Ngomedzap', 'propre_bien',
    'Bien créé par son titulaire', null, null, 'achat familial',
    null, null, null, 'titulaire'
  ) $$,
  'creator can create an own asset atomically'
);

select lives_ok(
  $$ select public.create_bien_with_holder(
    'propriete_familiale', 'Maison de tante Jeanne', 'Mbalmayo', 'proche_accompagne',
    'Bien renseigné avec accompagnement', null, null, 'héritage déclaré',
    'Jeanne M.', '+237600000000', null, 'titulaire'
  ) $$,
  'creator can create an accompanied person asset'
);

select is((select count(*) from public.biens), 2::bigint, 'creator reads created assets');
select is((select count(*) from public.bien_right_holders), 2::bigint, 'each asset has one declared holder');
select is(
  (select count(*)
   from public.biens b
   join public.bien_right_holders brh on brh.bien_id = b.id
   join public.persons p on p.id = brh.person_id
   where b.creation_context = 'proche_accompagne'
     and b.created_by = 'b2000000-0000-4000-8000-000000000001'
     and p.display_name = 'Jeanne M.'
     and p.linked_profile_id is null),
  1::bigint,
  'accompanied creator is not silently made holder'
);

select is(
  (select count(*)
   from public.biens b
   join public.bien_right_holders brh on brh.bien_id = b.id
   join public.persons p on p.id = brh.person_id
   where b.creation_context = 'propre_bien'
     and p.linked_profile_id = b.created_by),
  1::bigint,
  'own asset explicitly links creator as holder'
);

select throws_ok(
  $$ insert into public.bien_right_holders (bien_id, person_id, role, status, declared_by)
     select brh.bien_id, brh.person_id, brh.role, 'declare', brh.declared_by
     from public.bien_right_holders brh limit 1 $$,
  '23505',
  null,
  'active duplicate holder relation is rejected'
);

select throws_ok(
  $$ update public.bien_right_holders set status = 'verifie', verified_at = now() $$,
  '42501',
  null,
  'ordinary declarant cannot self-verify a holder'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'biens'),
  3::bigint,
  'assets use explicit select insert update policies'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b2000000-0000-4000-8000-000000000002","role":"authenticated"}', true);

select is((select count(*) from public.biens), 0::bigint, 'unrelated user cannot read assets');
select is((select count(*) from public.bien_right_holders), 0::bigint, 'unrelated user cannot read holders');
select is((select count(*) from public.persons), 0::bigint, 'unrelated user cannot read declared persons');
select lives_ok(
  $$ update public.biens set title = 'Intrusion' $$,
  'RLS safely hides assets from unrelated update'
);

select is(
  (select count(*) from public.biens where title = 'Intrusion'),
  0::bigint,
  'unrelated user changes no asset'
);

reset role;

insert into public.persons (linked_profile_id, display_name, created_by)
values (
  'b2000000-0000-4000-8000-000000000003',
  'B2 Holder',
  'b2000000-0000-4000-8000-000000000003'
)
on conflict (linked_profile_id) do update set display_name = excluded.display_name;

insert into public.bien_right_holders (bien_id, person_id, role, status, declared_by)
select b.id, p.id, 'ayant_droit', 'declare', b.created_by
from public.biens b
cross join public.persons p
where b.title = 'Terrain personnel'
  and p.linked_profile_id = 'b2000000-0000-4000-8000-000000000003';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b2000000-0000-4000-8000-000000000003","role":"authenticated"}', true);

select is((select count(*) from public.biens), 1::bigint, 'declared registered holder can read related asset');
select is((select count(*) from public.bien_right_holders), 2::bigint, 'holder can see declared relations on related asset');

update public.biens
set status = 'archive', archived_at = now()
where created_by = 'b2000000-0000-4000-8000-000000000003';

select is((select count(*) from public.biens where status = 'archive'), 0::bigint, 'holder cannot archive asset they did not create');

select * from finish();
rollback;
