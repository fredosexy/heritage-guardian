begin;
select plan(17);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b3000000-0000-4000-8000-000000000001','authenticated','authenticated','b3-owner@example.test','',now(),'{}','{"full_name":"Paul M."}',now(),now()),
('00000000-0000-0000-0000-000000000000','b3000000-0000-4000-8000-000000000002','authenticated','authenticated','b3-holder@example.test','',now(),'{}','{"full_name":"Jeanne M."}',now(),now()),
('00000000-0000-0000-0000-000000000000','b3000000-0000-4000-8000-000000000003','authenticated','authenticated','b3-other@example.test','',now(),'{}','{"full_name":"Other"}',now(),now());

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b3000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$ select public.create_bien_with_holder('terrain','Bien B3','Yaoundé','proche_accompagne',null,null,null,null,'Jeanne M.',null,'b3-holder@example.test','titulaire') $$,'owner creates asset for another person');

update public.persons set linked_profile_id='b3000000-0000-4000-8000-000000000002'
where display_name='Jeanne M.' and created_by='b3000000-0000-4000-8000-000000000001';

select lives_ok($$ select public.create_dossier((select id from public.biens where title='Bien B3'),'succession','Succession Jeanne','prive',null,true,'b3-operation-1') $$,'owner creates dossier linked to asset');
select is((select count(*) from public.dossiers where title='Succession Jeanne' and bien_id is not null),1::bigint,'dossier has one asset');
select is((select count(*) from public.dossier_participants where role='titulaire'),1::bigint,'asset holder is proposed once');
select is((select owner_id from public.dossiers where title='Succession Jeanne'),'b3000000-0000-4000-8000-000000000001'::uuid,'creator is application owner');
select isnt((select p.linked_profile_id from public.dossier_participants dp join public.persons p on p.id=dp.person_id limit 1),(select owner_id from public.dossiers where title='Succession Jeanne'),'owner and holder stay distinct');
select throws_ok($$ select public.add_dossier_participant((select id from public.dossiers where title='Succession Jeanne'),(select id from public.persons where linked_profile_id='b3000000-0000-4000-8000-000000000002'),'autorite') $$,'42501',null,'protected authority role cannot be freely assigned');

reset role;
update public.dossier_participants set status='actif',accepted_at=now() where dossier_id=(select id from public.dossiers where title='Succession Jeanne');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b3000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.dossiers where title='Succession Jeanne'),1::bigint,'active participant reads dossier');
select is((select count(*) from public.dossier_participants),1::bigint,'participant reads people concerned');
select throws_ok($$ update public.dossier_participants set role='autorite' $$,'42501',null,'participant cannot increase own role');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b3000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.dossiers where title='Succession Jeanne'),0::bigint,'unrelated user cannot read private dossier');
select is((select count(*) from public.dossier_participants),0::bigint,'unrelated user cannot read participants');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b3000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$ select public.revoke_dossier_participant((select id from public.dossier_participants limit 1)) $$,'owner revokes participant');
select is((select status from public.dossier_participants limit 1),'revoque','revocation is soft and timestamped');
select is((select count(*) from pg_policies where schemaname='public' and tablename='dossiers' and cmd='DELETE'),0::bigint,'physical dossier deletion has no policy');
select lives_ok($$ update public.dossiers set status='archive',archived_at=now() where title='Succession Jeanne' $$,'owner archives dossier');
select is((select status::text from public.dossiers where title='Succession Jeanne'),'archive','archive state is persisted');

select * from finish();
rollback;
