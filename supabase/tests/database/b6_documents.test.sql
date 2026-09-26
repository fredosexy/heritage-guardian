begin;
select plan(24);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b6000000-0000-4000-8000-000000000001','authenticated','authenticated','b6-owner@example.test','',now(),'{}','{"full_name":"Owner B6"}',now(),now()),
('00000000-0000-0000-0000-000000000000','b6000000-0000-4000-8000-000000000002','authenticated','authenticated','b6-other@example.test','',now(),'{}','{"full_name":"Other B6"}',now(),now()),
('00000000-0000-0000-0000-000000000000','b6000000-0000-4000-8000-000000000003','authenticated','authenticated','b6-admin@example.test','',now(),'{}','{"full_name":"Admin B6"}',now(),now());
insert into public.user_roles(user_id,role) values('b6000000-0000-4000-8000-000000000003','admin');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b6000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$ select public.create_bien_with_holder('terrain','Terrain B6','Ngomedzap','propre_bien',null,null,null,null,'Jeanne',null,null,'titulaire') $$,'owner creates asset and provider');
select lives_ok($$ select public.create_dossier((select id from public.biens where title='Terrain B6'),'succession','Dossier B6','prive',null,true,'b6-dossier') $$,'owner creates dossier');
select lives_ok($$ insert into storage.objects(bucket_id,name,owner_id) values('dossier-proofs','dossiers/'||(select id from public.dossiers where title='Dossier B6')||'/documents/b6100000-0000-4000-8000-000000000001/b6200000-0000-4000-8000-000000000001','b6000000-0000-4000-8000-000000000001') $$,'owner uploads into accessible dossier path');
select lives_ok($$ select public.register_document_version(
  'b6100000-0000-4000-8000-000000000001','b6200000-0000-4000-8000-000000000001',
  (select id from public.dossiers where title='Dossier B6'),(select id from public.biens where title='Terrain B6'),
  'acte','Acte familial','utilisateur',
  'dossiers/'||(select id from public.dossiers where title='Dossier B6')||'/documents/b6100000-0000-4000-8000-000000000001/b6200000-0000-4000-8000-000000000001',
  'application/pdf',1200,repeat('a',64),(select id from public.persons where display_name='Jeanne' limit 1),'b6-document-op') $$,'owner registers first document version');
select is((select version_number from public.document_versions where document_id='b6100000-0000-4000-8000-000000000001'),1,'first version is one');
select is((select current_version_id from public.proofs where id='b6100000-0000-4000-8000-000000000001'),'b6200000-0000-4000-8000-000000000001'::uuid,'first version becomes current');
select is((select verification_status from public.proofs where id='b6100000-0000-4000-8000-000000000001'),'fourni','upload is only marked provided');
select isnt((select uploaded_by from public.document_versions where id='b6200000-0000-4000-8000-000000000001'),(select provided_by from public.document_versions where id='b6200000-0000-4000-8000-000000000001'),'uploader and provider remain distinct');
select lives_ok($$ insert into storage.objects(bucket_id,name,owner_id) values('dossier-proofs','dossiers/'||(select id from public.dossiers where title='Dossier B6')||'/documents/b6100000-0000-4000-8000-000000000001/b6200000-0000-4000-8000-000000000002','b6000000-0000-4000-8000-000000000001') $$,'owner uploads replacement path');
select lives_ok($$ select public.register_document_version(
  'b6100000-0000-4000-8000-000000000001','b6200000-0000-4000-8000-000000000002',
  (select id from public.dossiers where title='Dossier B6'),(select id from public.biens where title='Terrain B6'),
  'acte','Acte familial','utilisateur',
  'dossiers/'||(select id from public.dossiers where title='Dossier B6')||'/documents/b6100000-0000-4000-8000-000000000001/b6200000-0000-4000-8000-000000000002',
  'application/pdf',1300,repeat('b',64),null,null) $$,'owner appends second version');
select is((select count(*) from public.document_versions where document_id='b6100000-0000-4000-8000-000000000001'),2::bigint,'old version is preserved');
select is((select max(version_number) from public.document_versions where document_id='b6100000-0000-4000-8000-000000000001'),2,'version increments');
select ok((select replaced_at is not null from public.document_versions where id='b6200000-0000-4000-8000-000000000001'),'previous version is marked replaced');
select is((select current_version_id from public.proofs where id='b6100000-0000-4000-8000-000000000001'),'b6200000-0000-4000-8000-000000000002'::uuid,'second version becomes current');
select throws_ok($$ select public.transition_document_status('b6100000-0000-4000-8000-000000000001','officiel','source_officielle') $$,'42501','document_verification_forbidden','ordinary user cannot mark official');
select results_eq($$ delete from storage.objects where name like '%b6200000-0000-4000-8000-000000000001' returning name $$,ARRAY[]::text[],'registered historical file cannot be deleted');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b6000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.proofs),0::bigint,'unrelated user cannot see document');
select is((select count(*) from public.document_versions),0::bigint,'unrelated user cannot see versions');
select is((select count(*) from storage.objects where bucket_id='dossier-proofs'),0::bigint,'unrelated user cannot list private bucket');
select throws_ok($$ insert into storage.objects(bucket_id,name,owner_id) values('dossier-proofs','dossiers/b6990000-0000-4000-8000-000000000099/documents/x/y','b6000000-0000-4000-8000-000000000002') $$,'42501',null,'unrelated user cannot upload to another dossier');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b6000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select lives_ok($$ select public.transition_document_status('b6100000-0000-4000-8000-000000000001','a_verifier') $$,'admin starts verification');
select lives_ok($$ select public.transition_document_status('b6100000-0000-4000-8000-000000000001','verifie') $$,'admin verifies document');
select lives_ok($$ select public.transition_document_status('b6100000-0000-4000-8000-000000000001','officiel','source_officielle') $$,'admin marks verified official source as official');
select is((select verification_status from public.proofs where id='b6100000-0000-4000-8000-000000000001'),'officiel','official status persisted');

select * from finish();
rollback;
