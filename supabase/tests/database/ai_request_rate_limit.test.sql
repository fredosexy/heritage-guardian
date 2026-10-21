begin;

select plan(15);

select ok(
  NOT has_function_privilege('anon', 'public.consume_ai_request(uuid,text,integer,integer)', 'EXECUTE'),
  'anon cannot execute the private AI rate-limit function'
);
select ok(
  NOT has_function_privilege('authenticated', 'public.consume_ai_request(uuid,text,integer,integer)', 'EXECUTE'),
  'authenticated cannot execute the private AI rate-limit function'
);
select ok(
  has_function_privilege('service_role', 'public.consume_ai_request(uuid,text,integer,integer)', 'EXECUTE'),
  'service_role can execute the private AI rate-limit function'
);

select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select throws_ok(
  $$select public.consume_ai_request(NULL, 'ai-chat', 12, 60)$$,
  '42501',
  'service_role_required',
  'non-service callers are rejected before argument processing'
);

select set_config('request.jwt.claim.role', 'service_role', true);
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
select throws_ok(
  $$select public.consume_ai_request(NULL, 'ai-chat', 12, 60)$$,
  '22023',
  'invalid_ai_rate_limit_arguments',
  'null user IDs are rejected'
);
select throws_ok(
  $$select public.consume_ai_request('00000000-0000-4000-8000-000000000001', NULL, 12, 60)$$,
  '22023',
  'invalid_ai_rate_limit_arguments',
  'null function names are rejected'
);
select throws_ok(
  $$select public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-chat', NULL, 60)$$,
  '22023',
  'invalid_ai_rate_limit_arguments',
  'null limits are rejected'
);
select throws_ok(
  $$select public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-chat', 12, NULL)$$,
  '22023',
  'invalid_ai_rate_limit_arguments',
  'null windows are rejected'
);
select throws_ok(
  $$select public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-chat', 0, 60)$$,
  '22023',
  'invalid_ai_rate_limit_arguments',
  'limits below one are rejected'
);
select throws_ok(
  $$select public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-chat', 12, 3601)$$,
  '22023',
  'invalid_ai_rate_limit_arguments',
  'windows above one hour are rejected'
);

-- Use a real local auth.users row so the FK and rate-limit ledger are exercised.
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'rate-limit-test@example.invalid', '',
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
);

select is(
  public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-chat', 2, 60),
  true,
  'first request is allowed under a quota of two'
);
select is(
  public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-chat', 2, 60),
  true,
  'second request is allowed under a quota of two'
);
select is(
  public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-chat', 2, 60),
  false,
  'third request is rejected after the quota is reached'
);
select is(
  public.consume_ai_request('00000000-0000-4000-8000-000000000001', 'ai-context', 1, 60),
  true,
  'ai-context has an independent quota from ai-chat'
);
select is(
  public.consume_ai_request('00000000-0000-4000-8000-000000000002', 'ai-chat', 1, 60),
  true,
  'a different user has an independent quota'
);

select * from finish();
rollback;
