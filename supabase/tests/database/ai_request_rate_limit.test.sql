begin;

select plan(10);

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

select * from finish();
rollback;
