begin;
select plan(18);

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','b5000000-0000-4000-8000-000000000001','authenticated','authenticated','b5-actor@example.test','',now(),'{}','{"full_name":"Acteur B5"}',now(),now()),
('00000000-0000-0000-0000-000000000000','b5000000-0000-4000-8000-000000000002','authenticated','authenticated','b5-other@example.test','',now(),'{}','{"full_name":"Autre B5"}',now(),now()),
('00000000-0000-0000-8000-000000000003','b5000000-0000-4000-8000-000000000003','authenticated','authenticated','b5-admin@example.test','',now(),'{}','{"full_name":"Admin B5"}',now(),now());
insert into public.user_roles (user_id,role) values ('b5000000-0000-4000-8000-000000000003','admin');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b5000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$ insert into public.actors(id,profile_id,actor_type,name,location,territorial_level) values('b5100000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000001','professionnel','Notaire test','Ngomedzap','rural') $$,'user creates own unverified actor');
select lives_ok($$ insert into public.actor_competences(id,actor_id,competence_code,label) values('b5200000-0000-4000-8000-000000000001','b5100000-0000-4000-8000-000000000001','notaire','Notaire') $$,'actor declares competence');
select lives_ok($$ insert into public.actor_credentials(id,actor_id,credential_type,reference) values('b5300000-0000-4000-8000-000000000001','b5100000-0000-4000-8000-000000000001','carte_professionnelle','REF-PRIVEE') $$,'actor submits credential');
select is((select verification_status from public.actors where id='b5100000-0000-4000-8000-000000000001'),'non_verifie','actor starts unverified');
select throws_ok($$ update public.actors set verification_status='verifie',verified_by='b5000000-0000-4000-8000-000000000001',verified_at=now(),is_published=true where id='b5100000-0000-4000-8000-000000000001' $$,'42501','actor_verification_fields_forbidden','actor cannot self verify');
select lives_ok($$ update public.actors set description='Accompagnement succession' where id='b5100000-0000-4000-8000-000000000001' $$,'actor updates allowed descriptive field');
select throws_ok($$ select public.verify_actor('b5100000-0000-4000-8000-000000000001','verifie') $$,'42501','verification_forbidden','ordinary user cannot call verification workflow');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b5000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.actors),0::bigint,'unpublished actor is hidden from another user');
select is((select count(*) from public.actor_credentials),0::bigint,'private credential is hidden from another user');
select is((select count(*) from public.actor_competences),0::bigint,'competence of unpublished actor is hidden');
select results_eq($$ update public.actors set name='Interdit' where id='b5100000-0000-4000-8000-000000000001' returning name $$,ARRAY[]::text[],'user cannot update another actor');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b5000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select lives_ok($$ select public.verify_actor('b5100000-0000-4000-8000-000000000001','verifie') $$,'admin verifies actor');
select lives_ok($$ select public.verify_actor_competence('b5200000-0000-4000-8000-000000000001','verifie') $$,'admin verifies competence');
select lives_ok($$ select public.verify_actor_credential('b5300000-0000-4000-8000-000000000001','verifie') $$,'admin verifies credential');
select is((select verification_status from public.actors where id='b5100000-0000-4000-8000-000000000001'),'verifie','verified actor status persisted');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b5000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.actors),1::bigint,'published verified actor is readable');
select is((select status from public.actor_competences where competence_code='notaire'),'verifie','verified competence is readable');
select is((select count(*) from public.actor_credentials),0::bigint,'verified credential details remain private');

select * from finish();
rollback;
