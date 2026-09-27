begin;select plan(16);
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)values
('00000000-0000-0000-0000-000000000000','ba000000-0000-4000-8000-000000000001','authenticated','authenticated','owner-b10@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','ba000000-0000-4000-8000-000000000002','authenticated','authenticated','helper-b10@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','ba000000-0000-4000-8000-000000000003','authenticated','authenticated','other-b10@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','ba000000-0000-4000-8000-000000000004','authenticated','authenticated','admin-b10@test','',now(),'{}','{}',now(),now());
insert into public.user_roles(user_id,role)values('ba000000-0000-4000-8000-000000000004','admin');
insert into public.biens(id,created_by,type,title,location_label,creation_context)values('ba100000-0000-4000-8000-000000000001','ba000000-0000-4000-8000-000000000001','terrain','Bien B10','Ngomedzap','propre_bien');
insert into public.dossiers(id,user_id,owner_id,bien_id,type,title,status,visibility)values('ba200000-0000-4000-8000-000000000001','ba000000-0000-4000-8000-000000000001','ba000000-0000-4000-8000-000000000001','ba100000-0000-4000-8000-000000000001','succession','Dossier B10','actif','prive');
insert into public.persons(id,linked_profile_id,display_name,created_by)values
('ba300000-0000-4000-8000-000000000001','ba000000-0000-4000-8000-000000000001','Titulaire B10','ba000000-0000-4000-8000-000000000001'),
('ba300000-0000-4000-8000-000000000002','ba000000-0000-4000-8000-000000000002','Accompagnateur B10','ba000000-0000-4000-8000-000000000001');
insert into public.dossier_participants(id,dossier_id,person_id,user_id,contact_name,role,status,invited_by,accepted_at)values
('ba400000-0000-4000-8000-000000000001','ba200000-0000-4000-8000-000000000001','ba300000-0000-4000-8000-000000000001','ba000000-0000-4000-8000-000000000001','Titulaire','titulaire','actif','ba000000-0000-4000-8000-000000000001',now()),
('ba400000-0000-4000-8000-000000000002','ba200000-0000-4000-8000-000000000001','ba300000-0000-4000-8000-000000000002','ba000000-0000-4000-8000-000000000002','Accompagnateur','accompagnateur','actif','ba000000-0000-4000-8000-000000000001',now());
insert into public.dossier_interventions(id,dossier_id,participant_id,performed_by,role,action_type,territorial_level,verification_status,comment)values('ba500000-0000-4000-8000-000000000001','ba200000-0000-4000-8000-000000000001','ba400000-0000-4000-8000-000000000002','ba000000-0000-4000-8000-000000000002','accompagnateur','transmis','rural','declare','Intervention originale');
insert into public.proofs(id,dossier_id,bien_id,type,title,storage_path,mime_type,size_bytes,uploaded_by,verified,document_type,source_type,verification_status,created_by)values('ba600000-0000-4000-8000-000000000001','ba200000-0000-4000-8000-000000000001','ba100000-0000-4000-8000-000000000001','document','Pièce B10','legacy/b10','application/pdf',10,'ba000000-0000-4000-8000-000000000001',false,'acte','utilisateur','fourni','ba000000-0000-4000-8000-000000000001');

set local role authenticated;select set_config('request.jwt.claims','{"sub":"ba000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select lives_ok($$select public.create_signalement('ba100000-0000-4000-8000-000000000001','ba200000-0000-4000-8000-000000000001',null,'ba500000-0000-4000-8000-000000000001',null,'intervention_contestee','Je conteste la manière dont cette intervention a été enregistrée','Faire examiner cette intervention',now(), 'ba300000-0000-4000-8000-000000000001','accompagnateur')$$,'accompanist creates report on behalf of holder');
select is((select on_behalf_of from public.signalements),'ba300000-0000-4000-8000-000000000001'::uuid,'represented holder is retained');
select is((select count(*) from public.signalement_events),1::bigint,'creation appends first event');
select lives_ok($$select public.attach_signalement_document((select id from public.signalements),'ba600000-0000-4000-8000-000000000001')$$,'authorized document is attached');
select lives_ok($$select public.add_signalement_witness((select id from public.signalements),'ba400000-0000-4000-8000-000000000001',null)$$,'existing participant is added as witness');
select throws_ok($b10$select public.create_signalement('ba100000-0000-4000-8000-000000000001','ba200000-0000-4000-8000-000000000001',null,null,null,'autre','Cette personne est coupable et doit être punie',null,null,null,'accompagnateur')$b10$,'22023','non_neutral_signalement_description','accusatory automatic conclusion is rejected');
select lives_ok($$select public.transition_signalement((select id from public.signalements),'transmis','Soumis pour examen')$$,'author submits report');
select throws_ok($$select public.transition_signalement((select id from public.signalements),'resolu','Auto résolution')$$,'42501','signalement_transition_forbidden','ordinary user cannot self resolve');
select lives_ok($$select public.create_signalement_conversation((select id from public.signalements),array['ba000000-0000-4000-8000-000000000004']::uuid[])$$,'B9 conversation is linked to report');

reset role;set local role authenticated;select set_config('request.jwt.claims','{"sub":"ba000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.signalements),0::bigint,'external user sees no report');
select is((select count(*) from public.signalement_events),0::bigint,'external user sees no fact history');
select is((select count(*) from public.signalement_witnesses),0::bigint,'witness identity remains private');

reset role;set local role authenticated;select set_config('request.jwt.claims','{"sub":"ba000000-0000-4000-8000-000000000004","role":"authenticated"}',true);
select lives_ok($$select public.transition_signalement((select id from public.signalements),'en_examen','Examen commencé')$$,'authorized reviewer starts review');
select lives_ok($$select public.transition_signalement((select id from public.signalements),'resolu','Examen terminé')$$,'authorized reviewer resolves report');
select is((select comment from public.dossier_interventions where id='ba500000-0000-4000-8000-000000000001'),'Intervention originale','original intervention remains unchanged');
select throws_ok($$update public.signalement_events set details='réécrit'$$,'42501',null,'report event history is append only');
select * from finish();rollback;