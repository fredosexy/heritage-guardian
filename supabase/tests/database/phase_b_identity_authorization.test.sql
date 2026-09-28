begin;

select plan(66);

-- --------------------------------------------------------------------------
-- Structure
-- --------------------------------------------------------------------------
select ok(to_regclass('public.person_aliases') is not null,'person_aliases exists');
select ok(to_regclass('public.family_relations') is not null,'family_relations exists');
select ok(to_regclass('public.family_relation_revisions') is not null,'family relation revisions exist');
select ok(to_regprocedure('public.resolve_action_context(text,uuid,uuid,text,uuid,uuid)') is not null,'action context resolver exists');
select ok(to_regprocedure('public.create_representation_mandate(uuid,uuid,text,uuid,text[],text,uuid,timestamptz,uuid)') is not null,'mandate application service exists');
select ok((select relrowsecurity from pg_class where oid='public.family_relations'::regclass),'family relations use RLS');
select ok((select relrowsecurity from pg_class where oid='public.person_aliases'::regclass),'person aliases use RLS');

-- --------------------------------------------------------------------------
-- Users and baseline
-- --------------------------------------------------------------------------
insert into auth.users(
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000001','authenticated','authenticated','phase-b-owner@test','',now(),'{}','{"full_name":"Owner B"}',now(),now()),
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000002','authenticated','authenticated','phase-b-reader@test','',now(),'{}','{"full_name":"Reader B"}',now(),now()),
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000003','authenticated','authenticated','phase-b-represented@test','',now(),'{}','{"full_name":"Represented B"}',now(),now()),
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000004','authenticated','authenticated','phase-b-representative@test','',now(),'{}','{"full_name":"Representative B"}',now(),now()),
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000005','authenticated','authenticated','phase-b-outsider@test','',now(),'{}','{"full_name":"Outsider B"}',now(),now()),
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000006','authenticated','authenticated','phase-b-claim@test','',now(),'{}','{"full_name":"Claim B"}',now(),now());

-- Migration backfill happened before these test users existed, so create linked Persons explicitly as system fixture.
insert into public.persons(id,linked_profile_id,display_name,created_by,identity_status) values
('bb100000-0000-4000-8000-000000000001','bb000000-0000-4000-8000-000000000001','Owner B','bb000000-0000-4000-8000-000000000001','DECLARED'),
('bb100000-0000-4000-8000-000000000002','bb000000-0000-4000-8000-000000000002','Reader B','bb000000-0000-4000-8000-000000000002','DECLARED'),
('bb100000-0000-4000-8000-000000000003','bb000000-0000-4000-8000-000000000003','Represented B','bb000000-0000-4000-8000-000000000003','DECLARED'),
('bb100000-0000-4000-8000-000000000004','bb000000-0000-4000-8000-000000000004','Representative B','bb000000-0000-4000-8000-000000000004','DECLARED'),
('bb100000-0000-4000-8000-000000000005','bb000000-0000-4000-8000-000000000005','Outsider B','bb000000-0000-4000-8000-000000000005','DECLARED');

insert into public.persons(id,display_name,created_by,identity_status) values
('bb110000-0000-4000-8000-000000000001','Oncle déclaré','bb000000-0000-4000-8000-000000000001','DECLARED'),
('bb110000-0000-4000-8000-000000000002','Doublon Oncle','bb000000-0000-4000-8000-000000000001','PARTIAL');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select is(public.current_user_person_id(),'bb100000-0000-4000-8000-000000000001'::uuid,'current account resolves to its Person');

select throws_ok(
  $$ insert into public.persons(display_name,created_by) values('Direct insert','bb000000-0000-4000-8000-000000000001') $$,
  '42501',null,
  'authenticated client cannot bypass person application service'
);

select lives_ok(
  $$ select public.update_person_record(
    'bb110000-0000-4000-8000-000000000001','Oncle Documenté',null,null,
    'DOCUMENTED','UNKNOWN',null,null,'bb900000-0000-4000-8000-000000000001'
  ) $$,
  'creator can document a declared person'
);

select is(
  (select identity_status from public.persons where id='bb110000-0000-4000-8000-000000000001'),
  'DOCUMENTED',
  'person identity status changes through RPC'
);

select throws_ok(
  $$ select public.update_person_record(
    'bb110000-0000-4000-8000-000000000001','Oncle Vérifié',null,null,
    'VERIFIED','UNKNOWN',null,null,'bb900000-0000-4000-8000-000000000002'
  ) $$,
  '42501','identity_verification_forbidden',
  'ordinary creator cannot self-verify identity'
);

select lives_ok(
  $$ select public.create_person_record(
    'Personne à revendiquer',null,'phase-b-claim@test','DECLARED',
    'bb900000-0000-4000-8000-000000000019'
  ) $$,
  'owner may declare a non-user Person before account linking'
);

reset role;
select set_config('test.claim_person_id',(select id::text from public.persons where email='phase-b-claim@test'),false);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000006","role":"authenticated"}',true);

select lives_ok(
  $$ select public.claim_person_record(
    current_setting('test.claim_person_id')::uuid,
    'bb900000-0000-4000-8000-000000000020'
  ) $$,
  'matching account can claim a pre-existing Person'
);

select is(
  (select linked_profile_id from public.persons where email='phase-b-claim@test'),
  'bb000000-0000-4000-8000-000000000006'::uuid,
  'claimed Person links to the claiming account'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select throws_ok(
  $$ select public.update_person_record(
    (select id from public.persons where email='phase-b-claim@test'),
    'Modification interdite',null,'phase-b-claim@test','DECLARED','UNKNOWN',null,null,
    'bb900000-0000-4000-8000-000000000021'
  ) $$,
  '42501','person_update_forbidden',
  'original declarant loses edit authority after Person is claimed'
);

-- --------------------------------------------------------------------------
-- Versioned family relations
-- --------------------------------------------------------------------------
select lives_ok(
  $$ select public.create_family_relation(
    'bb100000-0000-4000-8000-000000000001',
    'bb110000-0000-4000-8000-000000000001',
    'CHILD','DECLARATION',null,'Relation familiale déclarée',
    'bb900000-0000-4000-8000-000000000003'
  ) $$,
  'manageable people can receive a declared family relation'
);

select is((select count(*) from public.family_relations),1::bigint,'one logical family relation created');
select is((select count(*) from public.family_relation_revisions),1::bigint,'initial family revision persisted');
select is((select current_revision from public.family_relations),1,'initial revision is one');
select is((select status from public.family_relations),'DECLARED','declaration remains declared');

select lives_ok(
  $$ select public.revise_family_relation(
    (select id from public.family_relations limit 1),
    'CHILD','CONTESTED','DECLARATION',null,'Relation contestée',
    'bb900000-0000-4000-8000-000000000004'
  ) $$,
  'family relation can be contested without deleting history'
);
select is((select current_revision from public.family_relations),2,'relation revision advances');
select is((select count(*) from public.family_relation_revisions),2::bigint,'previous family revision remains');
select is((select status from public.family_relations),'CONTESTED','relation exposes contested current state');

-- --------------------------------------------------------------------------
-- Person merge preserves historical row and alias
-- --------------------------------------------------------------------------
select lives_ok(
  $$ select public.merge_person_records(
    'bb110000-0000-4000-8000-000000000002',
    'bb110000-0000-4000-8000-000000000001',
    'bb900000-0000-4000-8000-000000000005'
  ) $$,
  'duplicate local person can merge into canonical person'
);
select is(
  public.resolve_person_id('bb110000-0000-4000-8000-000000000002'),
  'bb110000-0000-4000-8000-000000000001'::uuid,
  'merged person resolves to canonical target'
);
select is((select count(*) from public.persons where id='bb110000-0000-4000-8000-000000000002'),1::bigint,'merged historical person row is retained');
select is((select count(*) from public.person_aliases where alias_type='MERGED_RECORD'),1::bigint,'merge records prior display name as alias');

select throws_ok(
  $ select public.merge_person_records(
    'bb100000-0000-4000-8000-000000000001',
    'bb100000-0000-4000-8000-000000000002',
    'bb900000-0000-4000-8000-000000000006'
  ) $,
  '42501',null,
  'distinct linked accounts cannot be merged by ordinary user'
);

-- Multi-hop merges must collapse directly to the terminal canonical Person.
select public.create_person_record(
  'Merge Chain A',null,null,'DECLARED','bb900000-0000-4000-8000-000000000022'
);
select public.create_person_record(
  'Merge Chain B',null,null,'DECLARED','bb900000-0000-4000-8000-000000000023'
);
select public.create_person_record(
  'Merge Chain C',null,null,'DECLARED','bb900000-0000-4000-8000-000000000024'
);

select lives_ok(
  $ select public.merge_person_records(
    (select id from public.persons where display_name='Merge Chain A' and created_by='bb000000-0000-4000-8000-000000000001'),
    (select id from public.persons where display_name='Merge Chain B' and created_by='bb000000-0000-4000-8000-000000000001'),
    'bb900000-0000-4000-8000-000000000025'
  ) $,
  'first merge in a canonical chain succeeds'
);

select lives_ok(
  $ select public.merge_person_records(
    (select id from public.persons where display_name='Merge Chain B' and created_by='bb000000-0000-4000-8000-000000000001'),
    (select id from public.persons where display_name='Merge Chain C' and created_by='bb000000-0000-4000-8000-000000000001'),
    'bb900000-0000-4000-8000-000000000026'
  ) $,
  'second merge re-canonicalizes prior aliases'
);

select is(
  public.resolve_person_id(
    (select id from public.persons where display_name='Merge Chain A' and created_by='bb000000-0000-4000-8000-000000000001')
  ),
  (select id from public.persons where display_name='Merge Chain C' and created_by='bb000000-0000-4000-8000-000000000001'),
  'multi-hop historical person resolves to terminal canonical target'
);

select is(
  (select merged_into_person_id from public.persons
   where display_name='Merge Chain A' and created_by='bb000000-0000-4000-8000-000000000001'),
  (select id from public.persons
   where display_name='Merge Chain C' and created_by='bb000000-0000-4000-8000-000000000001'),
  'historical redirect is flattened to a single hop'
);

select throws_ok(
  $ select public.merge_person_records(
    (select id from public.persons where display_name='Merge Chain C' and created_by='bb000000-0000-4000-8000-000000000001'),
    (select id from public.persons where display_name='Merge Chain A' and created_by='bb000000-0000-4000-8000-000000000001'),
    'bb900000-0000-4000-8000-000000000027'
  ) $,
  '22023','person_merge_invalid_state',
  'canonical person cannot merge back through its historical redirect'
);

-- --------------------------------------------------------------------------
-- Create an asset and case through existing B2/B3 path, verify canonical role sync
-- --------------------------------------------------------------------------
select public.create_bien_with_holder(
  'terrain','Terrain Phase B','Ngomedzap','propre_bien',
  null,null,null,null,null,null,null,'titulaire'
);

select is(
  (select count(*) from public.role_assignments
   where user_id='bb000000-0000-4000-8000-000000000001'
     and role='TITULAIRE' and scope_type='ASSET' and status='ACTIVE'),
  1::bigint,
  'own asset creates canonical TITULAIRE application role'
);

select public.create_dossier(
  (select id from public.biens where title='Terrain Phase B'),
  'terrain','Dossier Phase B','prive',null,true,'phase-b-case-001'
);

create temporary table phase_b_test_ids(key text primary key,id uuid);
insert into phase_b_test_ids(key,id)
select 'case',id from public.dossiers where title='Dossier Phase B';

select is(
  (select count(*) from public.role_assignments
   where user_id='bb000000-0000-4000-8000-000000000001'
     and role='CASE_ADMIN' and scope_type='CASE'
     and scope_id=(select id from phase_b_test_ids where key='case')
     and status='ACTIVE'),
  1::bigint,
  'case owner receives canonical CASE_ADMIN role'
);

select ok(
  public.has_effective_permission(
    'GRANT_ACCESS','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'case admin has canonical GRANT_ACCESS'
);

-- --------------------------------------------------------------------------
-- Role / grant / deny
-- --------------------------------------------------------------------------
select lives_ok(
  $$ select public.assign_application_role(
    'bb000000-0000-4000-8000-000000000002','READER','CASE',
    (select id from phase_b_test_ids where key='case'),
    null,'bb900000-0000-4000-8000-000000000007'
  ) $$,
  'case owner can assign scoped reader role'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000002","role":"authenticated"}',true);

select ok(
  public.has_effective_permission(
    'VIEW','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'reader role grants case VIEW'
);
select is(
  (select count(*) from public.dossiers where title='Dossier Phase B'),
  1::bigint,
  'canonical VIEW permission is honored by dossier RLS'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select public.deny_explicit_permission(
  'bb000000-0000-4000-8000-000000000002','VIEW','CASE',
  (select id from phase_b_test_ids where key='case'),
  null,'TEST_DENY','bb900000-0000-4000-8000-000000000008'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000002","role":"authenticated"}',true);

select ok(
  NOT public.has_effective_permission(
    'VIEW','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'explicit deny overrides reader role'
);
select is((select count(*) from public.dossiers where title='Dossier Phase B'),0::bigint,'deny is enforced by RLS immediately');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select lives_ok(
  $$ select public.revoke_explicit_permission(
    'DENY',(select id from public.permission_denies where user_id='bb000000-0000-4000-8000-000000000002' and permission='VIEW' and status='ACTIVE'),
    'bb900000-0000-4000-8000-000000000009'
  ) $$,
  'scope manager can revoke explicit deny'
);

select lives_ok(
  $$ select public.grant_explicit_permission(
    'bb000000-0000-4000-8000-000000000002','EDIT','CASE',
    (select id from phase_b_test_ids where key='case'),
    now()+interval '1 day','TEMP_EDIT','bb900000-0000-4000-8000-000000000010'
  ) $$,
  'scope manager can create explicit permission grant'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select ok(
  public.has_effective_permission(
    'EDIT','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'explicit permission grant is effective'
);

select throws_ok(
  $$ insert into public.permission_grants(user_id,permission,scope_type,scope_id,granted_by)
     values(
       'bb000000-0000-4000-8000-000000000002','ADMIN_CASE','CASE',
       (select id from phase_b_test_ids where key='case'),
       'bb000000-0000-4000-8000-000000000002'
     ) $$,
  '42501',null,
  'client cannot forge explicit permission rows'
);

-- --------------------------------------------------------------------------
-- Legacy B7 grant remains compatible with canonical permission engine
-- --------------------------------------------------------------------------
reset role;
insert into public.access_grants(
  id,dossier_id,grantee_user_id,granted_by,purpose
) values(
  'bb700000-0000-4000-8000-000000000001',
  (select id from phase_b_test_ids where key='case'),
  'bb000000-0000-4000-8000-000000000005',
  'bb000000-0000-4000-8000-000000000001','Legacy summary'
);
insert into public.access_grant_scopes(grant_id,scope)
values('bb700000-0000-4000-8000-000000000001','voir_resume');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000005","role":"authenticated"}',true);
select ok(
  public.has_effective_permission(
    'VIEW_CASE_SUMMARY','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'legacy voir_resume grant maps only to canonical summary permission'
);
select ok(
  NOT public.has_effective_permission(
    'VIEW','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'legacy summary grant does not widen into full case VIEW'
);

-- --------------------------------------------------------------------------
-- Representation mandate: declaration alone must not authorize.
-- --------------------------------------------------------------------------
reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

-- Owner creates a local non-user person through the canonical application service.
select public.create_person_record(
  'Parent accompagné',null,null,'DECLARED',
  'bb900000-0000-4000-8000-000000000016'
);

select lives_ok(
  $$ select public.create_representation_mandate(
    (select id from public.persons where display_name='Parent accompagné' and created_by='bb000000-0000-4000-8000-000000000001'),
    'bb000000-0000-4000-8000-000000000004',
    'CASE',(select id from phase_b_test_ids where key='case'),
    array['VIEW'],'DECLARATION',null,now()+interval '7 days',
    'bb900000-0000-4000-8000-000000000011'
  ) $$,
  'declared mandate may be recorded for a non-user person'
);

select is(
  (select status from public.representation_mandates where represented_person_id=(select id from public.persons where display_name='Parent accompagné' and created_by='bb000000-0000-4000-8000-000000000001')),
  'SUSPENDED',
  'unconfirmed declaration mandate is suspended'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000004","role":"authenticated"}',true);
select ok(
  NOT public.has_effective_permission(
    'VIEW','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'unconfirmed declared mandate gives no permission'
);

-- Account holder may delegate only authority it already holds.
reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select public.assign_application_role(
  'bb000000-0000-4000-8000-000000000003',
  'CONTRIBUTOR','CASE',(select id from phase_b_test_ids where key='case'),
  now()+interval '7 days','bb900000-0000-4000-8000-000000000017'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000003","role":"authenticated"}',true);

select throws_ok(
  $$ select public.create_representation_mandate(
    'bb100000-0000-4000-8000-000000000003',
    'bb000000-0000-4000-8000-000000000004',
    'CASE',(select id from phase_b_test_ids where key='case'),
    array['GRANT_ACCESS'],'DECLARATION',null,now()+interval '7 days',
    'bb900000-0000-4000-8000-000000000018'
  ) $$,
  '42501','mandate_permission_not_delegable',
  'represented principal cannot delegate a permission it does not hold'
);

select lives_ok(
  $$ select public.create_representation_mandate(
    'bb100000-0000-4000-8000-000000000003',
    'bb000000-0000-4000-8000-000000000004',
    'CASE',(select id from phase_b_test_ids where key='case'),
    array['VIEW','CONTRIBUTE'],'DECLARATION',null,now()+interval '7 days',
    'bb900000-0000-4000-8000-000000000012'
  ) $$,
  'represented account holder can explicitly create own mandate'
);

select is(
  (select status from public.representation_mandates
   where represented_person_id='bb100000-0000-4000-8000-000000000003'),
  'ACTIVE',
  'self-created represented-person mandate is active'
);

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000004","role":"authenticated"}',true);

select ok(
  public.has_effective_permission(
    'VIEW','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'confirmed mandate grants representative VIEW'
);

select lives_ok(
  $$ select public.resolve_action_context(
    'REPRESENTATIVE',
    'bb100000-0000-4000-8000-000000000003',
    (select id from public.representation_mandates where represented_person_id='bb100000-0000-4000-8000-000000000003'),
    'CASE',(select id from phase_b_test_ids where key='case'),
    'bb900000-0000-4000-8000-000000000013'
  ) $$,
  'server resolves a valid represented ActionContext'
);

select throws_ok(
  $$ select public.resolve_action_context(
    'REPRESENTATIVE',
    (select represented_person_id from public.representation_mandates where status='SUSPENDED' limit 1),
    (select id from public.representation_mandates where status='SUSPENDED' limit 1),
    'CASE',(select id from phase_b_test_ids where key='case'),
    'bb900000-0000-4000-8000-000000000014'
  ) $$,
  '42501','representation_mandate_invalid',
  'suspended mandate cannot be used in ActionContext'
);

select lives_ok(
  $$ select public.revoke_representation_mandate(
    (select id from public.representation_mandates where represented_person_id='bb100000-0000-4000-8000-000000000003'),
    'bb900000-0000-4000-8000-000000000015'
  ) $$,
  'representative may relinquish active mandate'
);

select ok(
  NOT public.has_effective_permission(
    'VIEW','CASE',(select id from phase_b_test_ids where key='case')
  ),
  'mandate revocation removes representative permission immediately'
);

-- --------------------------------------------------------------------------
-- Isolation and audit/event evidence
-- --------------------------------------------------------------------------
reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000005","role":"authenticated"}',true);
select is(
  (select count(*) from public.persons where id='bb110000-0000-4000-8000-000000000001'),
  0::bigint,
  'unrelated account cannot browse owner private Person without relationship'
);

reset role;
select ok(
  (select count(*) from public.integration_outbox where event_name like 'person.%')>=10,
  'phase B application services emit canonical domain events'
);
select ok(
  (select count(*) from public.audit_events where target_domain='person')>=10,
  'phase B application services emit structured audit records'
);
select is(
  (select count(*) from public.event_contracts where event_name like 'person.%' and status='ACTIVE'),
  12::bigint,
  'phase B event contracts are registered'
);

select ok(
  NOT (select has_function_privilege('anon',p.oid,'EXECUTE')
       from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='assign_application_role'),
  'anonymous role assignment is forbidden'
);
select ok(
  (select has_function_privilege('authenticated',p.oid,'EXECUTE')
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='resolve_action_context'),
  'authenticated principals can resolve their server ActionContext'
);

select * from finish();
rollback;
