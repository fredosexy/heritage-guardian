begin;select plan(13);
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)values
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000001','authenticated','authenticated','owner-b11@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000002','authenticated','authenticated','helper-b11@test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','bb000000-0000-4000-8000-000000000003','authenticated','authenticated','other-b11@test','',now(),'{}','{}',now(),now());
insert into public.biens(id,created_by,type,title,location_label,creation_context)values
('bb100000-0000-4000-8000-000000000001','bb000000-0000-4000-8000-000000000001','terrain','Bien B11','Mbalmayo','propre_bien');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into public.dossiers(id,user_id,owner_id,bien_id,type,title,status,visibility)values
('bb200000-0000-4000-8000-000000000001','bb000000-0000-4000-8000-000000000001','bb000000-0000-4000-8000-000000000001','bb100000-0000-4000-8000-000000000001','succession','Dossier B11','actif','prive');
select is((select count(*) from public.audit_events where entity_id='bb200000-0000-4000-8000-000000000001'),1::bigint,'dossier creation is audited');
select is((select action from public.audit_events where entity_id='bb200000-0000-4000-8000-000000000001'),'created','audit action is normalized');
select is((select actor_user_id from public.audit_events where entity_id='bb200000-0000-4000-8000-000000000001'),'bb000000-0000-4000-8000-000000000001'::uuid,'actual user is retained');
select ok((select request_id is not null from public.audit_events where entity_id='bb200000-0000-4000-8000-000000000001'),'correlation id is server generated');
select is((select source from public.audit_events where entity_id='bb200000-0000-4000-8000-000000000001'),'backend','untrusted clients get controlled backend source');

insert into public.persons(id,linked_profile_id,display_name,created_by)values
('bb300000-0000-4000-8000-000000000001','bb000000-0000-4000-8000-000000000002','Participant B11','bb000000-0000-4000-8000-000000000001');
insert into public.dossier_participants(id,dossier_id,person_id,user_id,contact_name,role,status,invited_by)values
('bb400000-0000-4000-8000-000000000001','bb200000-0000-4000-8000-000000000001','bb300000-0000-4000-8000-000000000001','bb000000-0000-4000-8000-000000000002','Participant','accompagnateur','invite','bb000000-0000-4000-8000-000000000001');
select is((select action from public.audit_events where entity_id='bb400000-0000-4000-8000-000000000001'),'participant_added','participant addition is audited');
update public.dossier_participants set status='revoque',revoked_at=now() where id='bb400000-0000-4000-8000-000000000001';
select is((select action from public.audit_events where entity_id='bb400000-0000-4000-8000-000000000001' order by created_at desc,id desc limit 1),'participant_revoked','participant revocation is audited');

select throws_ok($$insert into public.audit_events(actor_user_id,entity_type,entity_id,action,source)values(auth.uid(),'dossier','bb200000-0000-4000-8000-000000000001','updated','web')$$,'42501',null,'client cannot forge audit event');
select throws_ok($$update public.audit_events set action='updated' where entity_id='bb200000-0000-4000-8000-000000000001'$$,'42501',null,'audit events cannot be updated');
select throws_ok($$delete from public.audit_events where entity_id='bb200000-0000-4000-8000-000000000001'$$,'42501',null,'audit events cannot be deleted');
select ok((select count(*)>=3 from public.audit_events where dossier_id='bb200000-0000-4000-8000-000000000001'),'owner reads consolidated dossier history');

reset role;set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.audit_events where dossier_id='bb200000-0000-4000-8000-000000000001'),0::bigint,'unrelated user sees no audit event');
select throws_ok($$select public.record_audit_event('dossier','bb200000-0000-4000-8000-000000000001','updated','bb200000-0000-4000-8000-000000000001')$$,'42501',null,'internal audit writer is not callable by clients');
select * from finish();rollback;
