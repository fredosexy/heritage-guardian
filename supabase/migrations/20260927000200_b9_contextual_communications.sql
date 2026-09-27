-- B9 — contextual conversations and private messages
CREATE TABLE public.conversations(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 conversation_type text NOT NULL CHECK(conversation_type IN('dossier','dossier_step','access_request','intervention','signalement')),
 dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE RESTRICT,
 step_id uuid REFERENCES public.dossier_steps(id) ON DELETE RESTRICT,
 access_request_id uuid REFERENCES public.access_requests(id) ON DELETE RESTRICT,
 intervention_id uuid REFERENCES public.dossier_interventions(id) ON DELETE RESTRICT,
 signalement_id uuid,
 created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 status text NOT NULL DEFAULT 'active' CHECK(status IN('active','closed','archived')),
 created_at timestamptz NOT NULL DEFAULT now(),closed_at timestamptz,
 CHECK((status='closed')=(closed_at IS NOT NULL)),
 CHECK(
  (conversation_type='dossier' AND step_id IS NULL AND access_request_id IS NULL AND intervention_id IS NULL AND signalement_id IS NULL) OR
  (conversation_type='dossier_step' AND step_id IS NOT NULL AND access_request_id IS NULL AND intervention_id IS NULL AND signalement_id IS NULL) OR
  (conversation_type='access_request' AND step_id IS NULL AND access_request_id IS NOT NULL AND intervention_id IS NULL AND signalement_id IS NULL) OR
  (conversation_type='intervention' AND step_id IS NULL AND access_request_id IS NULL AND intervention_id IS NOT NULL AND signalement_id IS NULL) OR
  (conversation_type='signalement' AND step_id IS NULL AND access_request_id IS NULL AND intervention_id IS NULL AND signalement_id IS NOT NULL)
 )
);
CREATE TABLE public.conversation_members(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE RESTRICT,
 member_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,member_actor_id uuid REFERENCES public.actors(id) ON DELETE RESTRICT,
 role text NOT NULL CHECK(char_length(btrim(role)) BETWEEN 2 AND 80),joined_at timestamptz NOT NULL DEFAULT now(),left_at timestamptz,
 status text NOT NULL DEFAULT 'active' CHECK(status IN('active','left','removed')),
 UNIQUE(conversation_id,member_user_id),CHECK((status='active')=(left_at IS NULL))
);
CREATE TABLE public.messages(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE RESTRICT,
 sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,sender_actor_id uuid REFERENCES public.actors(id) ON DELETE RESTRICT,
 message_type text NOT NULL CHECK(message_type IN('text','audio','document','system')),text_content text,audio_path text,
 attachment_document_id uuid REFERENCES public.proofs(id) ON DELETE RESTRICT,client_message_id text NOT NULL,
 reply_to_message_id uuid REFERENCES public.messages(id) ON DELETE RESTRICT,created_at timestamptz NOT NULL DEFAULT now(),
 server_received_at timestamptz NOT NULL DEFAULT now(),edited_at timestamptz,deleted_at timestamptz,
 UNIQUE(sender_user_id,client_message_id),
 CHECK(char_length(client_message_id) BETWEEN 8 AND 160),
 CHECK((message_type='text' AND text_content IS NOT NULL AND char_length(btrim(text_content)) BETWEEN 1 AND 4000 AND audio_path IS NULL AND attachment_document_id IS NULL)
 OR(message_type='audio' AND audio_path IS NOT NULL AND text_content IS NULL AND attachment_document_id IS NULL)
 OR(message_type='document' AND attachment_document_id IS NOT NULL AND audio_path IS NULL)
 OR(message_type='system' AND text_content IS NOT NULL AND audio_path IS NULL AND attachment_document_id IS NULL))
);
CREATE INDEX conversations_dossier_idx ON public.conversations(dossier_id);
CREATE INDEX conversations_step_idx ON public.conversations(step_id);
CREATE INDEX conversations_signalement_idx ON public.conversations(signalement_id);
CREATE INDEX conversation_members_conversation_idx ON public.conversation_members(conversation_id);
CREATE INDEX conversation_members_user_idx ON public.conversation_members(member_user_id);
CREATE INDEX messages_conversation_created_idx ON public.messages(conversation_id,created_at DESC);

CREATE OR REPLACE FUNCTION public.can_access_conversation(cid uuid,uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
 SELECT EXISTS(SELECT 1 FROM public.conversations c JOIN public.conversation_members cm ON cm.conversation_id=c.id
 WHERE c.id=cid AND cm.member_user_id=uid AND cm.status='active'
 AND (public.can_view_dossier(c.dossier_id,uid) OR public.has_active_grant(c.dossier_id,uid)))
$$;

CREATE OR REPLACE FUNCTION public.create_contextual_conversation(
 p_type text,p_dossier_id uuid,p_step_id uuid DEFAULT NULL,p_access_request_id uuid DEFAULT NULL,p_intervention_id uuid DEFAULT NULL,p_member_user_ids uuid[] DEFAULT '{}'
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE cid uuid;member_id uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT(public.can_view_dossier(p_dossier_id,auth.uid()) OR public.has_active_grant(p_dossier_id,auth.uid()))
 THEN RAISE EXCEPTION 'conversation_creation_forbidden' USING ERRCODE='42501';END IF;
 IF p_type='dossier_step' AND NOT EXISTS(SELECT 1 FROM public.dossier_steps WHERE id=p_step_id AND dossier_id=p_dossier_id) THEN RAISE EXCEPTION 'invalid_conversation_context' USING ERRCODE='22023';END IF;
 IF p_type='access_request' AND NOT EXISTS(SELECT 1 FROM public.access_requests WHERE id=p_access_request_id AND dossier_id=p_dossier_id) THEN RAISE EXCEPTION 'invalid_conversation_context' USING ERRCODE='22023';END IF;
 IF p_type='intervention' AND NOT EXISTS(SELECT 1 FROM public.dossier_interventions WHERE id=p_intervention_id AND dossier_id=p_dossier_id) THEN RAISE EXCEPTION 'invalid_conversation_context' USING ERRCODE='22023';END IF;
 INSERT INTO public.conversations(conversation_type,dossier_id,step_id,access_request_id,intervention_id,created_by)
 VALUES(p_type,p_dossier_id,p_step_id,p_access_request_id,p_intervention_id,auth.uid()) RETURNING id INTO cid;
 INSERT INTO public.conversation_members(conversation_id,member_user_id,role) VALUES(cid,auth.uid(),'createur');
 FOREACH member_id IN ARRAY p_member_user_ids LOOP
  IF member_id<>auth.uid() AND NOT(public.can_view_dossier(p_dossier_id,member_id) OR public.has_active_grant(p_dossier_id,member_id))
  THEN RAISE EXCEPTION 'conversation_member_forbidden' USING ERRCODE='42501';END IF;
  INSERT INTO public.conversation_members(conversation_id,member_user_id,role) VALUES(cid,member_id,'membre') ON CONFLICT DO NOTHING;
 END LOOP;RETURN cid;
END $$;

CREATE OR REPLACE FUNCTION public.send_contextual_message(
 p_conversation_id uuid,p_message_type text,p_client_message_id text,p_text text DEFAULT NULL,p_audio_path text DEFAULT NULL,p_document_id uuid DEFAULT NULL,p_reply_to uuid DEFAULT NULL,p_actor_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE mid uuid;did uuid;existing uuid;
BEGIN
 SELECT id INTO existing FROM public.messages WHERE sender_user_id=auth.uid() AND client_message_id=p_client_message_id;
 IF existing IS NOT NULL THEN RETURN existing;END IF;
 IF NOT public.can_access_conversation(p_conversation_id,auth.uid()) OR NOT EXISTS(SELECT 1 FROM public.conversations WHERE id=p_conversation_id AND status='active')
 THEN RAISE EXCEPTION 'message_send_forbidden' USING ERRCODE='42501';END IF;
 IF p_message_type='system' THEN RAISE EXCEPTION 'system_message_forbidden' USING ERRCODE='42501';END IF;
 IF p_actor_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.actors WHERE id=p_actor_id AND profile_id=auth.uid()) THEN RAISE EXCEPTION 'sender_actor_forbidden' USING ERRCODE='42501';END IF;
 SELECT dossier_id INTO did FROM public.conversations WHERE id=p_conversation_id;
 IF p_message_type='document' AND NOT EXISTS(SELECT 1 FROM public.proofs WHERE id=p_document_id AND dossier_id=did AND(public.can_view_dossier(did,auth.uid()) OR public.can_access_document(id,auth.uid())))
 THEN RAISE EXCEPTION 'message_document_forbidden' USING ERRCODE='42501';END IF;
 IF p_message_type='audio' AND p_audio_path<>format('conversations/%s/%s',p_conversation_id,p_client_message_id) THEN RAISE EXCEPTION 'invalid_audio_path' USING ERRCODE='22023';END IF;
 INSERT INTO public.messages(conversation_id,sender_user_id,sender_actor_id,message_type,text_content,audio_path,attachment_document_id,client_message_id,reply_to_message_id)
 VALUES(p_conversation_id,auth.uid(),p_actor_id,p_message_type,nullif(btrim(p_text),''),p_audio_path,p_document_id,p_client_message_id,p_reply_to) RETURNING id INTO mid;
 RETURN mid;
END $$;

CREATE OR REPLACE FUNCTION public.remove_conversation_member(p_conversation_id uuid,p_member_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.conversations WHERE id=p_conversation_id AND(created_by=auth.uid() OR public.owns_dossier(dossier_id,auth.uid())))
 THEN RAISE EXCEPTION 'member_removal_forbidden' USING ERRCODE='42501';END IF;
 UPDATE public.conversation_members SET status='removed',left_at=now() WHERE conversation_id=p_conversation_id AND member_user_id=p_member_user_id AND status='active';
END $$;
CREATE OR REPLACE FUNCTION public.close_conversation(p_conversation_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN UPDATE public.conversations SET status='closed',closed_at=now() WHERE id=p_conversation_id AND status='active' AND(created_by=auth.uid() OR public.owns_dossier(dossier_id,auth.uid()));
IF NOT FOUND THEN RAISE EXCEPTION 'conversation_close_forbidden' USING ERRCODE='42501';END IF;END $$;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members view conversations" ON public.conversations FOR SELECT USING(public.can_access_conversation(id,auth.uid()));
CREATE POLICY "members view memberships" ON public.conversation_members FOR SELECT USING(public.can_access_conversation(conversation_id,auth.uid()));
CREATE POLICY "members view messages" ON public.messages FOR SELECT USING(public.can_access_conversation(conversation_id,auth.uid()));
REVOKE ALL ON public.conversations,public.conversation_members,public.messages FROM anon,authenticated;
GRANT SELECT ON public.conversations,public.conversation_members,public.messages TO authenticated;
REVOKE ALL ON FUNCTION public.create_contextual_conversation(text,uuid,uuid,uuid,uuid,uuid[]),public.send_contextual_message(uuid,text,text,text,text,uuid,uuid,uuid),public.remove_conversation_member(uuid,uuid),public.close_conversation(uuid),public.can_access_conversation(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_contextual_conversation(text,uuid,uuid,uuid,uuid,uuid[]),public.send_contextual_message(uuid,text,text,text,text,uuid,uuid,uuid),public.remove_conversation_member(uuid,uuid),public.close_conversation(uuid),public.can_access_conversation(uuid,uuid) TO authenticated;
UPDATE storage.buckets SET allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','application/pdf','audio/mpeg','audio/mp4','audio/webm','video/mp4'] WHERE id='dossier-proofs';
CREATE POLICY "conversation audio upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='dossier-proofs' AND(storage.foldername(name))[1]='conversations' AND public.can_access_conversation(((storage.foldername(name))[2])::uuid,auth.uid()));
CREATE POLICY "conversation audio read" ON storage.objects FOR SELECT TO authenticated USING(bucket_id='dossier-proofs' AND(storage.foldername(name))[1]='conversations' AND public.can_access_conversation(((storage.foldername(name))[2])::uuid,auth.uid()));
