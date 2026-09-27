begin;

select plan(39);

select ok(to_regclass('public.role_assignments') is not null,'role_assignments exists');
select ok(to_regclass('public.permission_grants') is not null,'permission_grants exists');
select ok(to_regclass('public.permission_denies') is not null,'permission_denies exists');
select ok(to_regclass('public.representation_mandates') is not null,'representation_mandates exists');
select ok(to_regclass('public.command_idempotency_records') is not null,'command idempotency table exists');
select ok(to_regclass('public.event_contracts') is not null,'event contract registry exists');
select ok(to_regclass('public.integration_outbox') is not null,'integration outbox exists');
select ok(to_regclass('public.integration_inbox') is not null,'integration inbox exists');
select ok(to_regclass('public.audit_events') is not null,'audit_events exists');
select ok(to_regprocedure('public.has_effective_permission(text,text,uuid)') is not null,'public effective permission function exists');

select ok((select relrowsecurity from pg_class where oid='public.role_assignments'::regclass),'role assignments RLS enabled');
select ok((select relrowsecurity from pg_class where oid='public.permission_grants'::regclass),'permission grants RLS enabled');
select ok((select relrowsecurity from pg_class where oid='public.permission_denies'::regclass),'permission denies RLS enabled');
select ok((select relrowsecurity from pg_class where oid='public.representation_mandates'::regclass),'mandates RLS enabled');
select ok((select relrowsecurity from pg_class where oid='public.audit_events'::regclass),'audit RLS enabled');

select ok(
  NOT (select has_function_privilege('authenticated',p.oid,'EXECUTE')
       from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='record_audit_event'),
  'authenticated cannot execute internal audit writer directly'
);
select ok(
  NOT (select has_function_privilege('authenticated',p.oid,'EXECUTE')
       from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='enqueue_domain_event'),
  'authenticated cannot enqueue domain events directly'
);
select ok(
  NOT (select has_function_privilege('authenticated',p.oid,'EXECUTE')
       from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='claim_command_idempotency'),
  'authenticated cannot claim command idempotency directly'
);
select ok(
  (select has_function_privilege('authenticated',p.oid,'EXECUTE')
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='has_effective_permission'),
  'authenticated may call the safe effective-permission query'
);
select ok(
  (select has_function_privilege('service_role',p.oid,'EXECUTE')
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='claim_outbox_batch'),
  'service role may claim outbox work'
);

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','aa000000-0000-4000-8000-000000000001','authenticated','authenticated','phasea-one@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','aa000000-0000-4000-8000-000000000002','authenticated','authenticated','phasea-two@test','',now(),'{}','{}',now(),now());

insert into public.persons(id,linked_profile_id,display_name,created_by)
values('aa100000-0000-4000-8000-000000000001','aa000000-0000-4000-8000-000000000002','Personne représentée','aa000000-0000-4000-8000-000000000002');

insert into public.role_assignments(id,user_id,role,scope_type,scope_id,assigned_by)
values(
'aa200000-0000-4000-8000-000000000001',
'aa000000-0000-4000-8000-000000000001',
'CONTRIBUTOR','CASE','aa300000-0000-4000-8000-000000000001',
'aa000000-0000-4000-8000-000000000001'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select throws_ok(
  $$ insert into public.role_assignments(user_id,role,scope_type,scope_id) values(
    'aa000000-0000-4000-8000-000000000001','CASE_ADMIN','CASE','aa300000-0000-4000-8000-000000000001'
  ) $$,
  '42501',null,
  'authenticated clients cannot mutate role assignments directly'
);

select is((select count(*) from public.role_assignments),1::bigint,'user can read own role assignment');
select ok(public.has_effective_permission('VIEW','CASE','aa300000-0000-4000-8000-000000000001'),'contributor role grants VIEW');
select ok(NOT public.has_effective_permission('MANAGE_CONFLICT','CASE','aa300000-0000-4000-8000-000000000001'),'contributor role does not grant MANAGE_CONFLICT');

reset role;

insert into public.permission_grants(id,user_id,permission,scope_type,scope_id,granted_by)
values(
'aa210000-0000-4000-8000-000000000001',
'aa000000-0000-4000-8000-000000000001',
'EDIT','CASE','aa300000-0000-4000-8000-000000000001',
'aa000000-0000-4000-8000-000000000001'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select ok(public.has_effective_permission('EDIT','CASE','aa300000-0000-4000-8000-000000000001'),'explicit grant grants EDIT');
select ok(NOT public.has_effective_permission('EDIT','CASE','aa300000-0000-4000-8000-000000000099'),'grant is scoped to exact case');

reset role;
insert into public.permission_denies(id,user_id,permission,scope_type,scope_id,reason_code,denied_by)
values(
'aa220000-0000-4000-8000-000000000001',
'aa000000-0000-4000-8000-000000000001',
'VIEW','CASE','aa300000-0000-4000-8000-000000000001',
'TEST_DENY',
'aa000000-0000-4000-8000-000000000001'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select ok(NOT public.has_effective_permission('VIEW','CASE','aa300000-0000-4000-8000-000000000001'),'explicit deny overrides role allow');

reset role;
insert into public.representation_mandates(
  id,represented_person_id,representative_user_id,scope_type,scope_id,permissions,source_type,created_by,confirmed_by_represented_at
) values(
  'aa230000-0000-4000-8000-000000000001',
  'aa100000-0000-4000-8000-000000000001',
  'aa000000-0000-4000-8000-000000000001',
  'ASSET','aa310000-0000-4000-8000-000000000001',
  array['VIEW','EDIT'],'DOCUMENTED',
  'aa000000-0000-4000-8000-000000000002',now()
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select ok(public.has_effective_permission('EDIT','ASSET','aa310000-0000-4000-8000-000000000001'),'active mandate grants listed permission');

reset role;
update public.representation_mandates
set status='REVOKED',revoked_at=now(),revoked_by='aa000000-0000-4000-8000-000000000002'
where id='aa230000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select ok(NOT public.has_effective_permission('EDIT','ASSET','aa310000-0000-4000-8000-000000000001'),'revoked mandate stops permission immediately');

select throws_ok(
  $$ insert into public.audit_events(action,target_domain,result,correlation_id)
     values('fake','test','SUCCEEDED','aa400000-0000-4000-8000-000000000001') $$,
  '42501',null,
  'authenticated client cannot forge audit events'
);

reset role;
insert into public.audit_events(
  id,event_type,actor_user_id,action,target_domain,target_type,target_id,result,correlation_id
) values(
  'aa410000-0000-4000-8000-000000000001','ACTION','aa000000-0000-4000-8000-000000000001',
  'phase_a_test','test','resource','aa420000-0000-4000-8000-000000000001','SUCCEEDED',
  'aa400000-0000-4000-8000-000000000001'
);

select throws_ok(
  $$ update public.audit_events set result='FAILED' where id='aa410000-0000-4000-8000-000000000001' $$,
  '55000','audit_events_append_only',
  'audit events are append only'
);

select set_config('request.jwt.claims','{"sub":"aa000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select public.enqueue_domain_event(
  'aa500000-0000-4000-8000-000000000001',
  'test.aggregate.created',
  1,'DOMAIN_EVENT','test','aggregate','aa510000-0000-4000-8000-000000000001',
  1,1,now(),null,null,null,null,
  'aa400000-0000-4000-8000-000000000001',null,'NORMAL','APPLICATION',
  '{"safe":true}'::jsonb
);

select public.enqueue_domain_event(
  'aa500000-0000-4000-8000-000000000001',
  'test.aggregate.created',
  1,'DOMAIN_EVENT','test','aggregate','aa510000-0000-4000-8000-000000000001',
  1,1,now(),null,null,null,null,
  'aa400000-0000-4000-8000-000000000001',null,'NORMAL','APPLICATION',
  '{"safe":true}'::jsonb
);

select is(
  (select count(*) from public.integration_outbox where event_id='aa500000-0000-4000-8000-000000000001'),
  1::bigint,
  'same event_id produces one logical outbox event'
);

select ok(
  public.register_inbox_event(
    'phase-a-consumer','aa500000-0000-4000-8000-000000000001','test.aggregate.created',1,'{"safe":true}'::jsonb
  ),
  'first inbox delivery is accepted'
);

select ok(
  NOT public.register_inbox_event(
    'phase-a-consumer','aa500000-0000-4000-8000-000000000001','test.aggregate.created',1,'{"safe":true}'::jsonb
  ),
  'duplicate inbox delivery is deduplicated'
);

select is(
  (select is_new from public.claim_command_idempotency(
    'CreateTestResource',1,'phase-a-idempotency-key-0001',repeat('a',64),'aa400000-0000-4000-8000-000000000001'
  )),
  true,
  'first command idempotency claim is new'
);

select is(
  (select is_new from public.claim_command_idempotency(
    'CreateTestResource',1,'phase-a-idempotency-key-0001',repeat('a',64),'aa400000-0000-4000-8000-000000000001'
  )),
  false,
  'same command key and payload reuses logical command'
);

select throws_ok(
  $$ select * from public.claim_command_idempotency(
    'CreateTestResource',1,'phase-a-idempotency-key-0001',repeat('b',64),'aa400000-0000-4000-8000-000000000001'
  ) $$,
  '22023','idempotency_key_reused_with_different_payload',
  'same idempotency key with different payload is rejected'
);

select is(
  (select count(*) from public.command_idempotency_records where command_name='CreateTestResource'),
  1::bigint,
  'command idempotency table contains one logical command'
);

reset role;
select is(
  public.has_effective_permission_for(
    'aa000000-0000-4000-8000-000000000002',
    'VIEW','CASE','aa300000-0000-4000-8000-000000000001'
  ),
  false,
  'unrelated user receives no implicit permission'
);

select * from finish();
rollback;
