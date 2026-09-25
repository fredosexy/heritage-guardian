begin;

select plan(11);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', 'b1000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'b1-owner@example.test', '', now(), '{}', '{"full_name":"B1 Owner"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b1000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'b1-other@example.test', '', now(), '{}', '{"full_name":"B1 Other"}', now(), now());

select is(
  (select count(*) from public.profiles where id::text like 'b1000000-%'),
  2::bigint,
  'signup trigger creates both profiles'
);

select is(
  (select count(*) from public.usage_preferences where user_id::text like 'b1000000-%'),
  2::bigint,
  'signup trigger creates one preference row per profile'
);

select is(
  (select context_type from public.usage_preferences where user_id = 'b1000000-0000-4000-8000-000000000001'),
  'urbain',
  'neutral context default is urbain'
);

select is(
  (select assistance_level from public.usage_preferences where user_id = 'b1000000-0000-4000-8000-000000000001'),
  'autonome',
  'context never implies assisted mode'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b1000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

select is((select count(*) from public.profiles), 1::bigint, 'user reads only own profile');
select is((select count(*) from public.usage_preferences), 1::bigint, 'user reads only own preferences');

update public.usage_preferences
set context_type = 'rural',
    assistance_level = 'autonome',
    interface_level = 'essentiel',
    audio_preference = 'prefere',
    accompaniment_preference = 'accompagne'
where user_id = 'b1000000-0000-4000-8000-000000000001';

select is(
  (select interface_level from public.usage_preferences),
  'essentiel',
  'user updates own usage preferences'
);

select throws_ok(
  $$ update public.profiles set status = 'suspended'
     where id = 'b1000000-0000-4000-8000-000000000001' $$,
  '42501',
  null,
  'ordinary user cannot update protected profile status'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b1000000-0000-4000-8000-000000000002","role":"authenticated"}', true);

select is((select count(*) from public.usage_preferences), 1::bigint, 'second user sees only own preferences');
select is(
  (select count(*) from public.usage_preferences
   where user_id = 'b1000000-0000-4000-8000-000000000001'),
  0::bigint,
  'second user cannot read first user preferences'
);

select is(
  (select count(*) from pg_policies
   where schemaname = 'public' and tablename = 'usage_preferences'),
  3::bigint,
  'usage preferences expose only explicit owner policies'
);

select * from finish();
rollback;
