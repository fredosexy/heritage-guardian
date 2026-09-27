begin;select plan(17);
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b9000000-0000-4000-8000-000000000001','authenticated','authenticated','owner-b9@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b9000000-0000-4000-8000-000000000002','authenticated','authenticated','member-b9@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','b9000000-0000-4000-8000-000000000003','authenticated','authenticated','other-b9@test','',now(),'{}','{}',now(),now());
insert into public.biens(id,created_by,type,title,location_label,creation_context)values('b9100000-0000-4000-8000-000000000001','b9000000-0000-4000-8000-000000000001','terrain','Bien B9','Ngomedzap','propre_bien');
insert into public.dossiers(id,user_id,owner_id,bien_id,type,title,status,visibility)values('b9200000-0000-4000-8000-000000000001','b9000000-0000-4000-8000-000000000001','b9000000-0000-4000-8000-000000000001','b9100000-0000-4000-8000-000000000001','succession','Dossier B9','actif','prive');
insert into public.persons(id,linked_profile_id,display_name,created_by)values('b9300000-0000-4000-8000-000000000001','b9000000-0000-4000-8000-000000000002','Membre B9','b9000000-0000-4000-8000-000000000001');
insert into public.dossier_participants(id,dossier_id,person_id,user_id,contact_name,role,status,invited_by,accepted_at)
values('b9400000-0000-4000-8000-000000000001','b9200000-0000-4000-8000-000000000001','b9300000-0000-4000-8000-000000000001','b9000000-0000-4000-8000-000000000002','Membre B9','accompagnateur','actif','b9000000-0000-4000-8000-000000000001',now());
insert into public.proofs(id,dossier_id,bien_id,type,title,storage_path,mime_type,size_bytes,uploaded_by,verified,document_type,source_type,verification_status,created_by)
values('b9500000-0000-4000-8000-000000000001','b9200000-0000-4000-8000-000000000001','b9100000-0000-4000-8000-000000000001','document','Acte privé','legacy/b9','application/pdf',10,'b9000000-0000-4000-8000-000000000001',false,'acte','utilisateur','fourni','b9000000-0000-4000-8000-000000000001');

set local role authenticated;select set_config('request.jwt.claims','{"sub":"b9000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.create_contextual_conversation('dossier','b9200000-0000-4000-8000-000000000001',null,null,null,array['b9000000-0000-4000-8000-000000000002']::uuid[])$$,'owner creates contextual conversation');
select is((select count(*) from public.conversation_members),2::bigint,'only legitimate members are added');
select lives_ok($$select public.send_contextual_message((select id from public.conversations),'text','client-b9-0001','Bonjour',null,null,null,null)$$,'owner sends text');
select lives_ok($$select public.send_contextual_message((select id from public.conversations),'document','client-b9-0002',null,null,'b9500000-0000-4000-8000-000000000001',null,null)$$,'owner attaches existing B6 document');
select is((select count(*) from public.messages),2::bigint,'two messages persisted');

reset role;set local role authenticated;select set_config('request.jwt.claims','{"sub":"b9000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.conversations),1::bigint,'active member reads conversation');
select is((select count(*) from public.messages),2::bigint,'dossier participant reads authorized messages');
select lives_ok($$select public.send_contextual_message((select id from public.conversations),'text','client-b9-0003','Réponse',null,null,null,null)$$,'member replies');
select is(public.send_contextual_message((select id from public.conversations),'text','client-b9-0003','Réponse retry',null,null,null,null),(select id from public.messages where client_message_id='client-b9-0003'),'client message retry is idempotent');
select lives_ok($$insert into storage.objects(bucket_id,name,owner_id)values('dossier-proofs','conversations/'||(select id from public.conversations)||'/client-b9-audio','b9000000-0000-4000-8000-000000000002')$$,'active member uploads private voice note');
select lives_ok($$select public.send_contextual_message((select id from public.conversations),'audio','client-b9-audio',null,'conversations/'||(select id from public.conversations)||'/client-b9-audio',null,null,null)$$,'member registers voice message');
select throws_ok($b9$insert into public.messages(conversation_id,sender_user_id,message_type,text_content,client_message_id)values((select id from public.conversations),'b9000000-0000-4000-8000-000000000001','text','Usurpation','client-b9-fake')$b9$,'42501',null,'member cannot send as another user');

reset role;set local role authenticated;select set_config('request.jwt.claims','{"sub":"b9000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.conversations),0::bigint,'external user cannot read conversation');
select is((select count(*) from public.messages),0::bigint,'external user cannot read messages');
select throws_ok($b9$insert into storage.objects(bucket_id,name,owner_id)values('dossier-proofs','conversations/'||(select id from public.conversations)||'/forbidden','b9000000-0000-4000-8000-000000000003')$b9$,'42501',null,'external user cannot upload conversation audio');

reset role;set local role authenticated;select set_config('request.jwt.claims','{"sub":"b9000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.remove_conversation_member((select id from public.conversations),'b9000000-0000-4000-8000-000000000002')$$,'owner removes member');
reset role;set local role authenticated;select set_config('request.jwt.claims','{"sub":"b9000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.conversations),0::bigint,'removed member immediately loses access');
select * from finish();rollback;