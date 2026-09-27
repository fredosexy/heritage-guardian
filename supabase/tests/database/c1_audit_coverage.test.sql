begin;
select plan(20);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','c1000000-0000-4000-8000-000000000001','authenticated','authenticated','c1-owner@example.test','',now(),'{}','{"full_name":"Owner C1"}',now(),now()),
('00000000-0000-0000-0000-000000000000','c1000000-0000-4000-8000-000000000002','authenticated','authenticated','c1-admin@example.test','',now(),'{}','{"full_name":"Admin C1"}',now(),now());
insert into public.user_roles(user_id,role) values('c1000000-0000-4000-8000-000000000002','admin');

insert into public.actors(id,actor_type,name,location,territorial_level)
values('c1100000-0000-4000-8000-000000000001','professionnel','Acteur C1','Yaoundé','local');
insert into public.actor_competences(id,actor_id,competence_code,label)
values('c1200000-0000-4000-8000-000000000001','c1100000-0000-4000-8000-000000000001','mediation','Médiation');
insert into public.actor_credentials(id,actor_id,credential_type,reference)
values('c1300000-0000-4000-8000-000000000001','c1100000-0000-4000-8000-000000000001','carte_professionnelle','C1-REF');
insert into public.procedure_definitions(id,code,dossier_type,territory,version)
values('c1400000-0000-4000-8000-000000000001','procedure_c1','succession','*',1);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok(
  $$ select public.create_bien_with_holder('terrain','Terrain C1','Yaoundé','propre_bien',null,null,null,null,'Propriétaire C1',null,null,'titulaire') $$,
  'owner creates the C1 asset'
);
select lives_ok(
  $$ select public.create_dossier((select id from public.biens where title='Terrain C1'),'succession','Dossier C1','prive',null,true,'c1-dossier') $$,
  'owner creates the C1 dossier'
);
select lives_ok(
  $$ select public.register_document_version(
    'c1500000-0000-4000-8000-000000000001','c1600000-0000-4000-8000-000000000001',
    (select id from public.dossiers where title='Dossier C1'),(select id from public.biens where title='Terrain C1'),
    'acte','Acte C1','utilisateur',
    'dossiers/'||(select id from public.dossiers where title='Dossier C1')||'/documents/c1500000-0000-4000-8000-000000000001/c1600000-0000-4000-8000-000000000001',
    'application/pdf',1200,repeat('c',64),null,'c1-document'
  ) $$,
  'document registration succeeds'
);
select is(
  (select count(*) from public.audit_events where action='DOCUMENT_ADDED' and target_id='c1500000-0000-4000-8000-000000000001'),
  1::bigint,
  'document creation is audited once'
);
select is(
  (select count(*) from public.audit_events where action='VERSION_ADDED' and target_id='c1600000-0000-4000-8000-000000000001'),
  1::bigint,
  'document version is audited once'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select lives_ok(
  $$ select public.transition_document_status('c1500000-0000-4000-8000-000000000001','a_verifier') $$,
  'admin starts document verification'
);
select lives_ok(
  $$ select public.transition_document_status('c1500000-0000-4000-8000-000000000001','verifie') $$,
  'admin verifies the document'
);
select is(
  (select count(*) from public.audit_events where action='DOCUMENT_VERIFIED' and target_id='c1500000-0000-4000-8000-000000000001'),
  1::bigint,
  'document verification is audited once'
);

select lives_ok($$ select public.verify_actor('c1100000-0000-4000-8000-000000000001','verifie') $$,'actor verification succeeds');
select lives_ok($$ select public.verify_actor_competence('c1200000-0000-4000-8000-000000000001','verifie') $$,'competence verification succeeds');
select lives_ok($$ select public.verify_actor_credential('c1300000-0000-4000-8000-000000000001','verifie') $$,'credential verification succeeds');
select lives_ok($$ select public.verify_actor('c1100000-0000-4000-8000-000000000001','suspendu') $$,'actor suspension succeeds');
select lives_ok($$ select public.verify_actor('c1100000-0000-4000-8000-000000000001','revoque') $$,'actor revocation succeeds');
select lives_ok($$ select public.verify_actor_competence('c1200000-0000-4000-8000-000000000001','suspendu'); select public.verify_actor_competence('c1200000-0000-4000-8000-000000000001','revoque') $$,'competence suspension and revocation succeed');
select lives_ok($$ select public.verify_actor_credential('c1300000-0000-4000-8000-000000000001','suspendu'); select public.verify_actor_credential('c1300000-0000-4000-8000-000000000001','revoque') $$,'credential suspension and revocation succeed');

select lives_ok(
  $$ update public.procedure_definitions set status='publiee',verified_by='c1000000-0000-4000-8000-000000000002',verified_at=now()
     where id='c1400000-0000-4000-8000-000000000001' $$,
  'procedure publication succeeds'
);
select lives_ok(
  $$ update public.procedure_definitions set status='archivee'
     where id='c1400000-0000-4000-8000-000000000001' $$,
  'procedure archival succeeds'
);

reset role;
select is(
  (select count(*) from public.audit_events where target_id='c1100000-0000-4000-8000-000000000001' and action in ('ACTOR_VERIFIED','ACTOR_SUSPENDED','ACTOR_REVOKED')),
  3::bigint,
  'actor lifecycle audit is complete'
);
select is(
  (select count(*) from public.audit_events where target_id='c1200000-0000-4000-8000-000000000001' and action like 'ACTOR_COMPETENCE_%'),
  3::bigint,
  'competence lifecycle audit is complete'
);
select is(
  (select count(*) from public.audit_events where target_id='c1300000-0000-4000-8000-000000000001' and action like 'ACTOR_CREDENTIAL_%'),
  3::bigint,
  'credential lifecycle audit is complete'
);
select is(
  (select count(*) from public.audit_events where target_id='c1400000-0000-4000-8000-000000000001' and action in ('PROCEDURE_PUBLISHED','PROCEDURE_ARCHIVED')),
  2::bigint,
  'procedure publication lifecycle audit is complete'
);
select ok(
  not has_function_privilege('authenticated','public.c1_audit_non_case(text,text,text,uuid,text,uuid,jsonb)','EXECUTE'),
  'authenticated clients cannot execute the internal audit helper'
);

select * from finish();
rollback;
