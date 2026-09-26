begin;
select plan(19);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b4000000-0000-4000-8000-000000000001','authenticated','authenticated','b4-owner@example.test','',now(),'{}','{"full_name":"B4 Owner"}',now(),now()),
('00000000-0000-0000-0000-000000000000','b4000000-0000-4000-8000-000000000002','authenticated','authenticated','b4-other@example.test','',now(),'{}','{"full_name":"B4 Other"}',now(),now()),
('00000000-0000-0000-0000-000000000000','b4000000-0000-4000-8000-000000000003','authenticated','authenticated','b4-admin@example.test','',now(),'{}','{"full_name":"B4 Admin"}',now(),now());

insert into public.user_roles (user_id,role) values ('b4000000-0000-4000-8000-000000000003','admin');
insert into public.procedure_definitions (id,code,dossier_type,territory,version,status,source_reference,verified_by,verified_at) values
('b4100000-0000-4000-8000-000000000001','succession_test','succession','*',1,'publiee','Référence de test','b4000000-0000-4000-8000-000000000003',now()),
('b4100000-0000-4000-8000-000000000002','succession_test','succession','*',2,'draft',null,null,null);
insert into public.procedure_steps (procedure_id,step_order,code,title,short_description,territorial_level,is_optional,rules_json) values
('b4100000-0000-4000-8000-000000000001',1,'declaration','Déclarer la situation','Présentez la situation familiale.','rural',false,null),
('b4100000-0000-4000-8000-000000000001',2,'verification','Faire vérifier','Faites vérifier les informations.','arrondissement',false,'{"bien_type":["terrain","parcelle"]}'),
('b4100000-0000-4000-8000-000000000001',3,'maison_seulement','Étape maison','Uniquement pour une maison.','departement',true,'{"bien_type":"maison"}');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b4000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$ select public.create_bien_with_holder('terrain','Terrain B4','Yaoundé','propre_bien',null,null,null,null,null,null,null,'titulaire') $$,'owner creates B4 asset');
select lives_ok($$ select public.create_dossier((select id from public.biens where title='Terrain B4'),'succession','Dossier B4','prive',null,true,'b4-operation') $$,'owner creates dossier');
select is((select count(*) from public.procedure_definitions),1::bigint,'ordinary user sees only published definition');
select throws_ok($$ insert into public.procedure_definitions(code,dossier_type,territory,version) values('forbidden','succession','*',1) $$,'42501',null,'ordinary user cannot create reference procedure');
select lives_ok($$ select public.initialize_dossier_journey((select id from public.dossiers where title='Dossier B4')) $$,'owner initializes journey');
select is((select procedure_definition_id from public.dossiers where title='Dossier B4'),'b4100000-0000-4000-8000-000000000001'::uuid,'dossier pins procedure version one');
select is((select count(*) from public.dossier_steps),2::bigint,'rule engine excludes non-applicable optional step');
select is((select status from public.dossier_steps order by step_order limit 1),'en_cours','first applicable step starts');
select is((select status from public.dossier_steps order by step_order offset 1 limit 1),'a_faire','next step waits');
select throws_ok($$ select public.transition_dossier_step((select id from public.dossier_steps order by step_order offset 1 limit 1),'terminee') $$,'22023',null,'invalid transition is rejected');
select lives_ok($$ select public.transition_dossier_step((select id from public.dossier_steps order by step_order limit 1),'terminee') $$,'owner completes current step');
select is((select status from public.dossier_steps order by step_order offset 1 limit 1),'en_cours','next step automatically becomes current');

reset role;
update public.procedure_definitions set status='publiee',verified_by='b4000000-0000-4000-8000-000000000003',verified_at=now() where id='b4100000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b4000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select procedure_definition_id from public.dossiers where title='Dossier B4'),'b4100000-0000-4000-8000-000000000001'::uuid,'publishing v2 does not silently migrate existing dossier');
select lives_ok($$ select public.transition_dossier_step((select id from public.dossier_steps where status='en_cours'),'bloquee','Information manquante') $$,'owner blocks current step with a reason');
select is((select count(*) from public.dossier_steps where status='bloquee'),1::bigint,'blocked step is reported');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b4000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.dossier_steps),0::bigint,'unrelated user cannot read dossier journey');
select throws_ok($$ select public.transition_dossier_step((select id from public.dossier_steps limit 1),'en_cours') $$,'42501',null,'unrelated user cannot transition hidden step');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b4000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.procedure_definitions),2::bigint,'admin sees all procedure versions');
select is((select count(*) from public.procedure_definitions where code='succession_test'),2::bigint,'old and new versions remain intact');

select * from finish();
rollback;
