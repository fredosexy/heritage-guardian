begin;
select plan(21);
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b7000000-0000-4000-8000-000000000001','authenticated','authenticated','owner-b7@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b7000000-0000-4000-8000-000000000002','authenticated','authenticated','requester-b7@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b7000000-0000-4000-8000-000000000003','authenticated','authenticated','other-b7@test','',now(),'{}','{}',now(),now());
insert into public.biens(id,created_by,type,title,location_label,creation_context) values('b7100000-0000-4000-8000-000000000001','b7000000-0000-4000-8000-000000000001','terrain','Bien B7','Ngomedzap','propre_bien');
insert into public.dossiers(id,user_id,owner_id,bien_id,type,title,status,visibility) values('b7200000-0000-4000-8000-000000000001','b7000000-0000-4000-8000-000000000001','b7000000-0000-4000-8000-000000000001','b7100000-0000-4000-8000-000000000001','succession','Dossier B7','actif','prive');
insert into public.proofs(id,dossier_id,bien_id,type,title,storage_path,mime_type,size_bytes,uploaded_by,verified,document_type,source_type,verification_status,created_by)
values
('b7300000-0000-4000-8000-000000000001','b7200000-0000-4000-8000-000000000001','b7100000-0000-4000-8000-000000000001','document','Acte','legacy/a','application/pdf',10,'b7000000-0000-4000-8000-000000000001',false,'acte','utilisateur','fourni','b7000000-0000-4000-8000-000000000001'),
('b7300000-0000-4000-8000-000000000002','b7200000-0000-4000-8000-000000000001','b7100000-0000-4000-8000-000000000001','document','Plan','legacy/b','application/pdf',10,'b7000000-0000-4000-8000-000000000001',false,'plan','utilisateur','fourni','b7000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.dossiers),0::bigint,'user without grant cannot read private dossier');
select is((select count(*) from public.proofs),0::bigint,'user without grant cannot read documents');
select lives_ok($$ select public.request_dossier_access('b7200000-0000-4000-8000-000000000001',null,'Aider au dossier','Besoin du résumé',array['voir_resume','voir_documents_selectionnes'],now()+interval '2 days') $$,'user requests scoped access');
select is((select count(*) from public.access_requests),1::bigint,'requester reads own request');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.access_requests where status='en_attente'),1::bigint,'owner sees pending request');
select lives_ok($$ select public.resolve_access_request((select id from public.access_requests),'acceptee',array['voir_resume'],array[]::uuid[],now()+interval '1 day') $$,'owner grants reduced scope');
select is((select count(*) from public.access_grant_scopes),1::bigint,'only granted scope persisted');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select ok(public.has_scope('b7200000-0000-4000-8000-000000000001','b7000000-0000-4000-8000-000000000002','voir_resume'),'summary scope is active');
select is((select count(*) from public.get_granted_dossier_summary('b7200000-0000-4000-8000-000000000001')),1::bigint,'summary projection is accessible');
select is((select count(*) from public.proofs),0::bigint,'summary grant exposes no documents');
select throws_ok($$ insert into public.access_grant_scopes values((select id from public.access_grants limit 1),'intervenir') $$,'42501',null,'grantee cannot increase scopes');
select lives_ok($$ select public.request_dossier_access('b7200000-0000-4000-8000-000000000001',null,'Voir un acte','',array['voir_documents_selectionnes'],now()+interval '2 days') $$,'requester asks selected documents');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$ select public.resolve_access_request((select id from public.access_requests where status='en_attente'),'acceptee',array['voir_documents_selectionnes'],array['b7300000-0000-4000-8000-000000000001']::uuid[],now()+interval '1 day') $$,'owner grants one selected document');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.proofs),1::bigint,'selected document grant exposes only one document');
select is((select title from public.proofs),'Acte','unselected document remains hidden');

reset role;
insert into public.access_grants(id,dossier_id,grantee_user_id,granted_by,purpose,granted_at,expires_at) values('b7400000-0000-4000-8000-000000000099','b7200000-0000-4000-8000-000000000001','b7000000-0000-4000-8000-000000000003','b7000000-0000-4000-8000-000000000001','Expired',now()-interval '2 days',now()-interval '1 day');
insert into public.access_grant_scopes values('b7400000-0000-4000-8000-000000000099','voir_resume');
set local role authenticated; select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is(public.has_active_grant('b7200000-0000-4000-8000-000000000001','b7000000-0000-4000-8000-000000000003'),false,'expired grant is inactive');
select is((select count(*) from public.get_granted_dossier_summary('b7200000-0000-4000-8000-000000000001')),0::bigint,'expired grant exposes no summary');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$ select public.revoke_access_grant((select id from public.access_grants where created_from_request_id is not null and exists(select 1 from public.access_grant_scopes s where s.grant_id=access_grants.id and s.scope='voir_resume'))) $$,'owner revokes active grant');
select ok((select revoked_at is not null from public.access_grants where exists(select 1 from public.access_grant_scopes s where s.grant_id=access_grants.id and s.scope='voir_resume') and created_from_request_id is not null),'revocation is persisted');

reset role; set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b7000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is(public.has_scope('b7200000-0000-4000-8000-000000000001','b7000000-0000-4000-8000-000000000002','voir_resume'),false,'revoked scope stops immediately');
select is((select count(*) from public.proofs),1::bigint,'revocation of summary does not expand selected-document grant');
select * from finish(); rollback;
