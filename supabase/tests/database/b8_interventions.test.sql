begin;
select plan(18);
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b8000000-0000-4000-8000-000000000001','authenticated','authenticated','owner-b8@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b8000000-0000-4000-8000-000000000002','authenticated','authenticated','actor-b8@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b8000000-0000-4000-8000-000000000003','authenticated','authenticated','other-b8@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b8000000-0000-4000-8000-000000000004','authenticated','authenticated','admin-b8@test','',now(),'{}','{}',now(),now());
insert into public.user_roles(user_id,role) values('b8000000-0000-4000-8000-000000000004','admin');
insert into public.biens(id,created_by,type,title,location_label,creation_context) values('b8100000-0000-4000-8000-000000000001','b8000000-0000-4000-8000-000000000001','terrain','Bien B8','Ngomedzap','propre_bien');
insert into public.dossiers(id,user_id,owner_id,bien_id,type,title,status,visibility) values('b8200000-0000-4000-8000-000000000001','b8000000-0000-4000-8000-000000000001','b8000000-0000-4000-8000-000000000001','b8100000-0000-4000-8000-000000000001','succession','Dossier B8','actif','prive');
insert into public.procedure_definitions(id,code,dossier_type,territory,version,status,verified_by,verified_at) values('b8300000-0000-4000-8000-000000000001','succession_b8','succession','*',1,'publiee','b8000000-0000-4000-8000-000000000004',now());
insert into public.procedure_steps(id,procedure_id,step_order,code,title,short_description,territorial_level,required_competence,rules_json)
values('b8400000-0000-4000-8000-000000000001','b8300000-0000-4000-8000-000000000001',1,'validation','Validation notariale','Faire valider','rural','notaire','{"required_intervention_action":"valide"}');
insert into public.dossier_steps(id,dossier_id,procedure_step_id,step_order,title,short_description,territorial_level,status,started_at)
values('b8500000-0000-4000-8000-000000000001','b8200000-0000-4000-8000-000000000001','b8400000-0000-4000-8000-000000000001',1,'Validation notariale','Faire valider','rural','en_cours',now());
insert into public.actors(id,profile_id,actor_type,name,location,territorial_level,verification_status,is_published,verified_by,verified_at)
values('b8600000-0000-4000-8000-000000000001','b8000000-0000-4000-8000-000000000002','professionnel','Notaire B8','Ngomedzap','rural','verifie',true,'b8000000-0000-4000-8000-000000000004',now());
insert into public.actor_competences(id,actor_id,competence_code,label,status,verified_by,verified_at)
values('b8700000-0000-4000-8000-000000000001','b8600000-0000-4000-8000-000000000001','notaire','Notaire','verifie','b8000000-0000-4000-8000-000000000004',now());
insert into public.actor_credentials(id,actor_id,credential_type,status,verified_by,verified_at)
values('b8800000-0000-4000-8000-000000000001','b8600000-0000-4000-8000-000000000001','carte professionnelle','verifie','b8000000-0000-4000-8000-000000000004',now());

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b8000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select throws_ok($$select public.create_dossier_intervention('b8200000-0000-4000-8000-000000000001','b8500000-0000-4000-8000-000000000001','b8600000-0000-4000-8000-000000000001',null,null,'professionnel','valide','rural','Sans accès')$$,'42501','intervention_forbidden','verified professional without grant cannot intervene');
select is((select count(*) from public.dossier_interventions),0::bigint,'unauthorized user sees no intervention');

reset role;
insert into public.access_grants(id,dossier_id,grantee_actor_id,grantee_user_id,granted_by,purpose,expires_at)
values('b8900000-0000-4000-8000-000000000001','b8200000-0000-4000-8000-000000000001','b8600000-0000-4000-8000-000000000001','b8000000-0000-4000-8000-000000000002','b8000000-0000-4000-8000-000000000001','Valider',now()+interval '1 day');
insert into public.access_grant_scopes values('b8900000-0000-4000-8000-000000000001','intervenir');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b8000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select lives_ok($$select public.create_dossier_intervention('b8200000-0000-4000-8000-000000000001','b8500000-0000-4000-8000-000000000001','b8600000-0000-4000-8000-000000000001',null,null,'professionnel','valide','rural','Validation réalisée')$$,'actor with scope and qualifications intervenes');
select is((select verification_status from public.dossier_interventions),'a_verifier','sensitive action is not automatically verified');
select is(public.can_complete_dossier_step('b8500000-0000-4000-8000-000000000001'),false,'unverified intervention does not complete step');
select throws_ok($$select public.verify_dossier_intervention((select id from public.dossier_interventions),'verifie')$$,'42501','intervention_verification_forbidden','ordinary actor cannot self verify');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b8000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.dossier_interventions),0::bigint,'unrelated user cannot view intervention');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b8000000-0000-4000-8000-000000000004","role":"authenticated"}',true);
select lives_ok($$select public.verify_dossier_intervention((select id from public.dossier_interventions),'verifie')$$,'authorized verifier verifies intervention');
select ok((select verified_by='b8000000-0000-4000-8000-000000000004' from public.dossier_interventions),'verifier responsibility is retained');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b8000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select ok(public.can_complete_dossier_step('b8500000-0000-4000-8000-000000000001'),'verified required action satisfies step');
select lives_ok($$select public.complete_dossier_step_from_interventions('b8500000-0000-4000-8000-000000000001')$$,'owner completes step through controlled workflow');
select is((select status from public.dossier_steps where id='b8500000-0000-4000-8000-000000000001'),'terminee','step is completed');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b8000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select lives_ok($$select public.correct_dossier_intervention((select id from public.dossier_interventions where supersedes_intervention_id is null),'corrige','Précision')$$,'performer creates a correction');
select is((select count(*) from public.dossier_interventions),2::bigint,'original intervention remains after correction');
select ok((select supersedes_intervention_id is not null from public.dossier_interventions where action_type='corrige'),'correction points to original');
select results_eq($$update public.dossier_interventions set comment='overwrite' returning id$$,ARRAY[]::uuid[],'direct update is denied');
select throws_ok($$delete from public.dossier_interventions$$,'42501',null,'destructive delete is denied');

reset role;
update public.access_grants set expires_at=now()-interval '1 minute' where id='b8900000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b8000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is(public.can_create_intervention('b8200000-0000-4000-8000-000000000001','b8500000-0000-4000-8000-000000000001','b8600000-0000-4000-8000-000000000001',null,'professionnel','constate'),false,'expired grant blocks intervention');

select * from finish(); rollback;
