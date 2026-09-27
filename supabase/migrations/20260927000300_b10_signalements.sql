-- B10 — neutral reports, disputes and append-only fact history
CREATE TABLE public.signalements(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 on_behalf_of uuid REFERENCES public.persons(id) ON DELETE RESTRICT,creator_role text NOT NULL CHECK(creator_role IN('titulaire','ayant_droit','declarant','accompagnateur','temoin','professionnel','service','autorite')),
 bien_id uuid REFERENCES public.biens(id) ON DELETE RESTRICT,dossier_id uuid REFERENCES public.dossiers(id) ON DELETE RESTRICT,
 step_id uuid REFERENCES public.dossier_steps(id) ON DELETE RESTRICT,intervention_id uuid REFERENCES public.dossier_interventions(id) ON DELETE RESTRICT,
 actor_concerned_id uuid REFERENCES public.actors(id) ON DELETE RESTRICT,
 signalement_type text NOT NULL CHECK(signalement_type IN('intervention_contestee','document_conteste','action_sans_accord','etape_mal_traitee','information_modifiee','traitement_conteste','autre')),
 description text NOT NULL CHECK(char_length(btrim(description)) BETWEEN 10 AND 5000),expected_resolution text CHECK(expected_resolution IS NULL OR char_length(expected_resolution)<=2000),
 status text NOT NULL DEFAULT 'brouillon' CHECK(status IN('brouillon','a_documenter','a_verifier','transmis','en_examen','resolu','clos')),
 occurred_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),closed_at timestamptz,
 CHECK(bien_id IS NOT NULL OR dossier_id IS NOT NULL),CHECK((status='clos')=(closed_at IS NOT NULL))
);
CREATE TABLE public.signalement_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),signalement_id uuid NOT NULL REFERENCES public.signalements(id) ON DELETE RESTRICT,
 event_type text NOT NULL CHECK(event_type IN('created','document_added','witness_added','comment_added','submitted','review_started','additional_info_requested','status_changed','resolved','closed')),
 actor_id uuid REFERENCES public.actors(id) ON DELETE RESTRICT,created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 details text CHECK(details IS NULL OR char_length(details)<=3000),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.signalement_documents(signalement_id uuid NOT NULL REFERENCES public.signalements(id) ON DELETE RESTRICT,document_id uuid NOT NULL REFERENCES public.proofs(id) ON DELETE RESTRICT,attached_by uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(signalement_id,document_id));
CREATE TABLE public.signalement_witnesses(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),signalement_id uuid NOT NULL REFERENCES public.signalements(id) ON DELETE RESTRICT,participant_id uuid REFERENCES public.dossier_participants(id) ON DELETE RESTRICT,actor_id uuid REFERENCES public.actors(id) ON DELETE RESTRICT,added_by uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),CHECK((participant_id IS NOT NULL)::int+(actor_id IS NOT NULL)::int=1));
CREATE UNIQUE INDEX signalement_witness_participant_unique ON public.signalement_witnesses(signalement_id,participant_id) WHERE participant_id IS NOT NULL;
CREATE UNIQUE INDEX signalement_witness_actor_unique ON public.signalement_witnesses(signalement_id,actor_id) WHERE actor_id IS NOT NULL;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_signalement_fkey FOREIGN KEY(signalement_id) REFERENCES public.signalements(id) ON DELETE RESTRICT;
CREATE INDEX signalements_created_by_idx ON public.signalements(created_by);CREATE INDEX signalements_dossier_idx ON public.signalements(dossier_id);CREATE INDEX signalements_bien_idx ON public.signalements(bien_id);CREATE INDEX signalements_step_idx ON public.signalements(step_id);CREATE INDEX signalements_intervention_idx ON public.signalements(intervention_id);CREATE INDEX signalements_actor_idx ON public.signalements(actor_concerned_id);CREATE INDEX signalements_status_created_idx ON public.signalements(status,created_at DESC);CREATE INDEX signalement_events_timeline_idx ON public.signalement_events(signalement_id,created_at);

CREATE OR REPLACE FUNCTION public.can_access_signalement(sid uuid,uid uuid)RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
 SELECT EXISTS(SELECT 1 FROM public.signalements s WHERE s.id=sid AND(s.created_by=uid OR(s.dossier_id IS NOT NULL AND public.owns_dossier(s.dossier_id,uid)) OR public.can_verify_actor(uid)))
$$;
CREATE OR REPLACE FUNCTION public.create_signalement(p_bien_id uuid,p_dossier_id uuid,p_step_id uuid,p_intervention_id uuid,p_actor_id uuid,p_type text,p_description text,p_expected text,p_occurred_at timestamptz,p_on_behalf_of uuid,p_role text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE sid uuid;resolved_bien uuid;
BEGIN
 IF auth.uid() IS NULL OR p_dossier_id IS NULL OR NOT(public.can_view_dossier(p_dossier_id,auth.uid()) OR public.has_active_grant(p_dossier_id,auth.uid())) THEN RAISE EXCEPTION 'signalement_creation_forbidden' USING ERRCODE='42501';END IF;
 SELECT bien_id INTO resolved_bien FROM public.dossiers WHERE id=p_dossier_id;
 IF p_bien_id IS NOT NULL AND p_bien_id<>resolved_bien THEN RAISE EXCEPTION 'signalement_context_mismatch' USING ERRCODE='22023';END IF;
 IF p_step_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.dossier_steps WHERE id=p_step_id AND dossier_id=p_dossier_id) THEN RAISE EXCEPTION 'signalement_context_mismatch' USING ERRCODE='22023';END IF;
 IF p_intervention_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.dossier_interventions WHERE id=p_intervention_id AND dossier_id=p_dossier_id) THEN RAISE EXCEPTION 'signalement_context_mismatch' USING ERRCODE='22023';END IF;
 IF btrim(p_description)~*'(fraude confirmée|coupable|corrompu|voleur)' THEN RAISE EXCEPTION 'non_neutral_signalement_description' USING ERRCODE='22023';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.dossier_participants dp JOIN public.persons p ON p.id=dp.person_id WHERE dp.dossier_id=p_dossier_id AND dp.status='actif' AND(p.linked_profile_id=auth.uid() OR dp.user_id=auth.uid())AND dp.role=p_role)
 AND NOT EXISTS(SELECT 1 FROM public.actors a WHERE a.profile_id=auth.uid() AND((p_role='professionnel' AND a.actor_type='professionnel')OR(p_role='service' AND a.actor_type='service_administratif')OR(p_role='autorite' AND a.actor_type='autorite_locale')))
 THEN RAISE EXCEPTION 'signalement_role_forbidden' USING ERRCODE='42501';END IF;
 IF p_on_behalf_of IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.dossier_participants WHERE dossier_id=p_dossier_id AND person_id=p_on_behalf_of AND status='actif') THEN RAISE EXCEPTION 'signalement_representation_forbidden' USING ERRCODE='42501';END IF;
 INSERT INTO public.signalements(created_by,on_behalf_of,creator_role,bien_id,dossier_id,step_id,intervention_id,actor_concerned_id,signalement_type,description,expected_resolution,occurred_at)
 VALUES(auth.uid(),p_on_behalf_of,p_role,resolved_bien,p_dossier_id,p_step_id,p_intervention_id,p_actor_id,p_type,btrim(p_description),nullif(btrim(p_expected),''),p_occurred_at)RETURNING id INTO sid;
 INSERT INTO public.signalement_events(signalement_id,event_type,created_by,details)VALUES(sid,'created',auth.uid(),'Fait signalé créé');
 RETURN sid;
END $$;
CREATE OR REPLACE FUNCTION public.attach_signalement_document(p_signalement_id uuid,p_document_id uuid)RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN IF NOT public.can_access_signalement(p_signalement_id,auth.uid()) OR NOT EXISTS(SELECT 1 FROM public.proofs d JOIN public.signalements s ON s.id=p_signalement_id WHERE d.id=p_document_id AND d.dossier_id=s.dossier_id AND(public.can_view_dossier(d.dossier_id,auth.uid()) OR public.can_access_document(d.id,auth.uid()))) THEN RAISE EXCEPTION 'signalement_document_forbidden' USING ERRCODE='42501';END IF;
 INSERT INTO public.signalement_documents VALUES(p_signalement_id,p_document_id,auth.uid(),now())ON CONFLICT DO NOTHING;INSERT INTO public.signalement_events(signalement_id,event_type,created_by,details)VALUES(p_signalement_id,'document_added',auth.uid(),'Document associé');END $$;
CREATE OR REPLACE FUNCTION public.add_signalement_witness(p_signalement_id uuid,p_participant_id uuid,p_actor_id uuid)RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE did uuid;BEGIN IF NOT public.can_access_signalement(p_signalement_id,auth.uid()) THEN RAISE EXCEPTION 'signalement_witness_forbidden' USING ERRCODE='42501';END IF;SELECT dossier_id INTO did FROM public.signalements WHERE id=p_signalement_id;
 IF p_participant_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.dossier_participants WHERE id=p_participant_id AND dossier_id=did) THEN RAISE EXCEPTION 'invalid_witness' USING ERRCODE='22023';END IF;
 INSERT INTO public.signalement_witnesses(signalement_id,participant_id,actor_id,added_by)VALUES(p_signalement_id,p_participant_id,p_actor_id,auth.uid());INSERT INTO public.signalement_events(signalement_id,event_type,created_by,details)VALUES(p_signalement_id,'witness_added',auth.uid(),'Témoin associé');END $$;
CREATE OR REPLACE FUNCTION public.transition_signalement(p_signalement_id uuid,p_status text,p_details text DEFAULT NULL)RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE old text;protected boolean:=p_status IN('en_examen','resolu','clos');BEGIN SELECT status INTO old FROM public.signalements WHERE id=p_signalement_id FOR UPDATE;
 IF NOT FOUND OR NOT public.can_access_signalement(p_signalement_id,auth.uid()) OR(protected AND NOT public.can_verify_actor(auth.uid())) THEN RAISE EXCEPTION 'signalement_transition_forbidden' USING ERRCODE='42501';END IF;
 IF NOT((old='brouillon' AND p_status IN('a_documenter','a_verifier','transmis'))OR(old='a_documenter' AND p_status IN('a_verifier','transmis'))OR(old='a_verifier' AND p_status='transmis')OR(old='transmis' AND p_status='en_examen')OR(old='en_examen' AND p_status='resolu')OR(old='resolu' AND p_status='clos'))THEN RAISE EXCEPTION 'invalid_signalement_transition' USING ERRCODE='22023';END IF;
 UPDATE public.signalements SET status=p_status,updated_at=now(),closed_at=CASE WHEN p_status='clos' THEN now() ELSE NULL END WHERE id=p_signalement_id;
 INSERT INTO public.signalement_events(signalement_id,event_type,created_by,details)VALUES(p_signalement_id,CASE p_status WHEN'transmis'THEN'submitted'WHEN'en_examen'THEN'review_started'WHEN'resolu'THEN'resolved'WHEN'clos'THEN'closed'ELSE'status_changed'END,auth.uid(),p_details);END $$;
CREATE OR REPLACE FUNCTION public.create_signalement_conversation(p_signalement_id uuid,p_member_user_ids uuid[] DEFAULT '{}')RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE s public.signalements;cid uuid;u uuid;BEGIN SELECT * INTO s FROM public.signalements WHERE id=p_signalement_id;IF NOT FOUND OR NOT public.can_access_signalement(s.id,auth.uid())THEN RAISE EXCEPTION 'signalement_conversation_forbidden' USING ERRCODE='42501';END IF;
 INSERT INTO public.conversations(conversation_type,dossier_id,signalement_id,created_by)VALUES('signalement',s.dossier_id,s.id,auth.uid())RETURNING id INTO cid;INSERT INTO public.conversation_members(conversation_id,member_user_id,role)VALUES(cid,auth.uid(),'createur');
 FOREACH u IN ARRAY p_member_user_ids LOOP IF NOT public.can_access_signalement(s.id,u)THEN RAISE EXCEPTION 'signalement_member_forbidden' USING ERRCODE='42501';END IF;INSERT INTO public.conversation_members(conversation_id,member_user_id,role)VALUES(cid,u,'membre')ON CONFLICT DO NOTHING;END LOOP;RETURN cid;END $$;
ALTER TABLE public.signalements ENABLE ROW LEVEL SECURITY;ALTER TABLE public.signalement_events ENABLE ROW LEVEL SECURITY;ALTER TABLE public.signalement_documents ENABLE ROW LEVEL SECURITY;ALTER TABLE public.signalement_witnesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authorized view signalements" ON public.signalements FOR SELECT USING(public.can_access_signalement(id,auth.uid()));
CREATE POLICY "authorized view signalement events" ON public.signalement_events FOR SELECT USING(public.can_access_signalement(signalement_id,auth.uid()));
CREATE POLICY "authorized view signalement documents" ON public.signalement_documents FOR SELECT USING(public.can_access_signalement(signalement_id,auth.uid()) AND(public.can_access_document(document_id,auth.uid()) OR EXISTS(SELECT 1 FROM public.proofs d WHERE d.id=document_id AND public.can_view_dossier(d.dossier_id,auth.uid()))));
CREATE POLICY "authorized view signalement witnesses" ON public.signalement_witnesses FOR SELECT USING(public.can_access_signalement(signalement_id,auth.uid()));
REVOKE ALL ON public.signalements,public.signalement_events,public.signalement_documents,public.signalement_witnesses FROM anon,authenticated;GRANT SELECT ON public.signalements,public.signalement_events,public.signalement_documents,public.signalement_witnesses TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_signalement(uuid,uuid),public.create_signalement(uuid,uuid,uuid,uuid,uuid,text,text,text,timestamptz,uuid,text),public.attach_signalement_document(uuid,uuid),public.add_signalement_witness(uuid,uuid,uuid),public.transition_signalement(uuid,text,text),public.create_signalement_conversation(uuid,uuid[]) TO authenticated;