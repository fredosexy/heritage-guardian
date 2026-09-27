-- B7 — scoped, expiring and revocable dossier access.
CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  requester_actor_id uuid REFERENCES public.actors(id) ON DELETE SET NULL,
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  purpose text NOT NULL CHECK (char_length(btrim(purpose)) BETWEEN 3 AND 160),
  message text CHECK (message IS NULL OR char_length(message)<=1000),
  status text NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente','acceptee','refusee','annulee','expiree')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  CHECK (expires_at IS NULL OR expires_at>created_at),
  CHECK ((status='en_attente')=(resolved_at IS NULL AND resolved_by IS NULL))
);
CREATE TABLE public.access_request_scopes (
  request_id uuid NOT NULL REFERENCES public.access_requests(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('voir_resume','voir_documents_selectionnes','ajouter_document','accompagner','intervenir','commenter')),
  PRIMARY KEY(request_id,scope)
);
CREATE TABLE public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  grantee_actor_id uuid REFERENCES public.actors(id) ON DELETE SET NULL,
  grantee_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL REFERENCES auth.users(id),
  purpose text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_from_request_id uuid UNIQUE REFERENCES public.access_requests(id) ON DELETE SET NULL,
  CHECK (num_nonnulls(grantee_actor_id,grantee_user_id)>=1),
  CHECK (expires_at IS NULL OR expires_at>granted_at)
);
CREATE TABLE public.access_grant_scopes (
  grant_id uuid NOT NULL REFERENCES public.access_grants(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('voir_resume','voir_documents_selectionnes','ajouter_document','accompagner','intervenir','commenter')),
  PRIMARY KEY(grant_id,scope)
);
CREATE TABLE public.access_grant_documents (
  grant_id uuid NOT NULL REFERENCES public.access_grants(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.proofs(id) ON DELETE CASCADE,
  PRIMARY KEY(grant_id,document_id)
);
CREATE INDEX access_requests_dossier_idx ON public.access_requests(dossier_id);
CREATE INDEX access_requests_requester_idx ON public.access_requests(requested_by);
CREATE INDEX access_requests_status_idx ON public.access_requests(status);
CREATE INDEX access_grants_dossier_idx ON public.access_grants(dossier_id);
CREATE INDEX access_grants_user_idx ON public.access_grants(grantee_user_id);
CREATE INDEX access_grants_actor_idx ON public.access_grants(grantee_actor_id);
CREATE INDEX access_grants_validity_idx ON public.access_grants(expires_at,revoked_at);
CREATE INDEX access_grant_scopes_scope_idx ON public.access_grant_scopes(scope);

CREATE OR REPLACE FUNCTION public.grant_belongs_to_user(g public.access_grants,_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT g.grantee_user_id=_user_id OR EXISTS(SELECT 1 FROM public.actors a WHERE a.id=g.grantee_actor_id AND a.profile_id=_user_id)
$$;
CREATE OR REPLACE FUNCTION public.has_active_grant(_dossier_id uuid,_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(SELECT 1 FROM public.access_grants g WHERE g.dossier_id=_dossier_id AND public.grant_belongs_to_user(g,_user_id)
    AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now()))
$$;
CREATE OR REPLACE FUNCTION public.has_scope(_dossier_id uuid,_user_id uuid,_scope text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(SELECT 1 FROM public.access_grants g JOIN public.access_grant_scopes s ON s.grant_id=g.id
    WHERE g.dossier_id=_dossier_id AND public.grant_belongs_to_user(g,_user_id) AND s.scope=_scope
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now()))
$$;
CREATE OR REPLACE FUNCTION public.can_access_document(_document_id uuid,_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(SELECT 1 FROM public.proofs d WHERE d.id=_document_id AND (
    public.can_view_dossier(d.dossier_id,_user_id) OR EXISTS(
      SELECT 1 FROM public.access_grants g JOIN public.access_grant_scopes s ON s.grant_id=g.id
      JOIN public.access_grant_documents gd ON gd.grant_id=g.id AND gd.document_id=d.id
      WHERE g.dossier_id=d.dossier_id AND public.grant_belongs_to_user(g,_user_id)
        AND s.scope='voir_documents_selectionnes' AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now())
    )))
$$;
REVOKE ALL ON FUNCTION public.grant_belongs_to_user(public.access_grants,uuid),public.has_active_grant(uuid,uuid),public.has_scope(uuid,uuid,text),public.can_access_document(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_active_grant(uuid,uuid),public.has_scope(uuid,uuid,text),public.can_access_document(uuid,uuid) TO authenticated;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_request_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grant_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grant_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requester and owner view requests" ON public.access_requests FOR SELECT USING(requested_by=auth.uid() OR public.owns_dossier(dossier_id,auth.uid()));
CREATE POLICY "request scopes follow request" ON public.access_request_scopes FOR SELECT USING(EXISTS(SELECT 1 FROM public.access_requests r WHERE r.id=request_id AND (r.requested_by=auth.uid() OR public.owns_dossier(r.dossier_id,auth.uid()))));
CREATE POLICY "grant parties view grants" ON public.access_grants FOR SELECT USING(granted_by=auth.uid() OR public.owns_dossier(dossier_id,auth.uid()) OR public.grant_belongs_to_user(access_grants,auth.uid()));
CREATE POLICY "grant scopes follow grant" ON public.access_grant_scopes FOR SELECT USING(EXISTS(SELECT 1 FROM public.access_grants g WHERE g.id=grant_id AND (public.owns_dossier(g.dossier_id,auth.uid()) OR public.grant_belongs_to_user(g,auth.uid()))));
CREATE POLICY "grant documents follow grant" ON public.access_grant_documents FOR SELECT USING(EXISTS(SELECT 1 FROM public.access_grants g WHERE g.id=grant_id AND (public.owns_dossier(g.dossier_id,auth.uid()) OR public.grant_belongs_to_user(g,auth.uid()))));
REVOKE ALL ON public.access_requests,public.access_request_scopes,public.access_grants,public.access_grant_scopes,public.access_grant_documents FROM anon,authenticated;
GRANT SELECT ON public.access_requests,public.access_request_scopes,public.access_grants,public.access_grant_scopes,public.access_grant_documents TO authenticated;

CREATE OR REPLACE FUNCTION public.request_dossier_access(p_dossier_id uuid,p_actor_id uuid,p_purpose text,p_message text,p_scopes text[],p_expires_at timestamptz DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE rid uuid; sc text;
BEGIN
  IF auth.uid() IS NULL OR public.owns_dossier(p_dossier_id,auth.uid()) OR cardinality(p_scopes)=0 THEN RAISE EXCEPTION 'access_request_forbidden' USING ERRCODE='42501'; END IF;
  IF p_actor_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.actors WHERE id=p_actor_id AND profile_id=auth.uid()) THEN RAISE EXCEPTION 'actor_request_forbidden' USING ERRCODE='42501'; END IF;
  FOREACH sc IN ARRAY p_scopes LOOP IF sc NOT IN ('voir_resume','voir_documents_selectionnes','ajouter_document','accompagner','intervenir','commenter') THEN RAISE EXCEPTION 'invalid_access_scope' USING ERRCODE='22023'; END IF; END LOOP;
  INSERT INTO public.access_requests(dossier_id,requester_actor_id,requested_by,purpose,message,expires_at)
  VALUES(p_dossier_id,p_actor_id,auth.uid(),btrim(p_purpose),nullif(btrim(p_message),''),p_expires_at) RETURNING id INTO rid;
  INSERT INTO public.access_request_scopes SELECT rid,unnest(p_scopes) ON CONFLICT DO NOTHING;
  RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.resolve_access_request(p_request_id uuid,p_decision text,p_scopes text[] DEFAULT '{}',p_document_ids uuid[] DEFAULT '{}',p_expires_at timestamptz DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE r public.access_requests; gid uuid; sc text; did uuid;
BEGIN
  SELECT * INTO r FROM public.access_requests WHERE id=p_request_id FOR UPDATE;
  IF NOT FOUND OR r.status<>'en_attente' OR NOT public.owns_dossier(r.dossier_id,auth.uid()) OR p_decision NOT IN ('acceptee','refusee') THEN RAISE EXCEPTION 'access_resolution_forbidden' USING ERRCODE='42501'; END IF;
  IF p_decision='acceptee' THEN
    FOREACH sc IN ARRAY p_scopes LOOP
      IF NOT EXISTS(SELECT 1 FROM public.access_request_scopes WHERE request_id=r.id AND scope=sc) THEN RAISE EXCEPTION 'scope_not_requested' USING ERRCODE='22023'; END IF;
    END LOOP;
    IF cardinality(p_scopes)=0 THEN RAISE EXCEPTION 'grant_scope_required' USING ERRCODE='22023'; END IF;
    INSERT INTO public.access_grants(dossier_id,grantee_actor_id,grantee_user_id,granted_by,purpose,expires_at,created_from_request_id)
    VALUES(r.dossier_id,r.requester_actor_id,r.requested_by,auth.uid(),r.purpose,COALESCE(p_expires_at,r.expires_at),r.id) RETURNING id INTO gid;
    INSERT INTO public.access_grant_scopes SELECT gid,unnest(p_scopes);
    FOREACH did IN ARRAY p_document_ids LOOP
      IF NOT 'voir_documents_selectionnes'=ANY(p_scopes) OR NOT EXISTS(SELECT 1 FROM public.proofs WHERE id=did AND dossier_id=r.dossier_id) THEN RAISE EXCEPTION 'invalid_grant_document' USING ERRCODE='22023'; END IF;
    END LOOP;
    INSERT INTO public.access_grant_documents SELECT gid,unnest(p_document_ids);
  END IF;
  UPDATE public.access_requests SET status=p_decision,resolved_at=now(),resolved_by=auth.uid() WHERE id=r.id;
  RETURN gid;
END $$;
CREATE OR REPLACE FUNCTION public.cancel_access_request(p_request_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN UPDATE public.access_requests SET status='annulee',resolved_at=now(),resolved_by=auth.uid() WHERE id=p_request_id AND requested_by=auth.uid() AND status='en_attente';
IF NOT FOUND THEN RAISE EXCEPTION 'request_cancel_forbidden' USING ERRCODE='42501'; END IF; END $$;
CREATE OR REPLACE FUNCTION public.revoke_access_grant(p_grant_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN UPDATE public.access_grants SET revoked_at=now() WHERE id=p_grant_id AND public.owns_dossier(dossier_id,auth.uid()) AND revoked_at IS NULL;
IF NOT FOUND THEN RAISE EXCEPTION 'grant_revoke_forbidden' USING ERRCODE='42501'; END IF; END $$;

CREATE OR REPLACE FUNCTION public.get_granted_dossier_summary(p_dossier_id uuid)
RETURNS TABLE(id uuid,title text,type public.dossier_type,status public.dossier_status,location_label text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
 SELECT d.id,d.title,d.type,d.status,b.location_label FROM public.dossiers d JOIN public.biens b ON b.id=d.bien_id
 WHERE d.id=p_dossier_id AND public.has_scope(d.id,auth.uid(),'voir_resume')
$$;
REVOKE ALL ON FUNCTION public.request_dossier_access(uuid,uuid,text,text,text[],timestamptz),public.resolve_access_request(uuid,text,text[],uuid[],timestamptz),public.cancel_access_request(uuid),public.revoke_access_grant(uuid),public.get_granted_dossier_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_dossier_access(uuid,uuid,text,text,text[],timestamptz),public.resolve_access_request(uuid,text,text[],uuid[],timestamptz),public.cancel_access_request(uuid),public.revoke_access_grant(uuid),public.get_granted_dossier_summary(uuid) TO authenticated;

DROP POLICY IF EXISTS "authorized users view documents" ON public.proofs;
CREATE POLICY "authorized users view documents" ON public.proofs FOR SELECT USING(public.can_view_dossier(dossier_id,auth.uid()) OR public.can_access_document(id,auth.uid()));
DROP POLICY IF EXISTS "authorized users view document versions" ON public.document_versions;
CREATE POLICY "authorized users view document versions" ON public.document_versions FOR SELECT USING(public.can_access_document(document_id,auth.uid()));
CREATE POLICY "selected grant storage read" ON storage.objects FOR SELECT TO authenticated USING(
  bucket_id='dossier-proofs' AND EXISTS(SELECT 1 FROM public.document_versions v WHERE v.storage_path=name AND public.can_access_document(v.document_id,auth.uid())));

-- Extend the B6 write workflow without granting broad document visibility.
CREATE OR REPLACE FUNCTION public.register_document_version(
  p_document_id uuid,p_version_id uuid,p_dossier_id uuid,p_bien_id uuid,p_document_type text,p_title text,p_source_type text,
  p_storage_path text,p_mime_type text,p_size_bytes bigint,p_checksum text,p_provided_by uuid DEFAULT NULL,p_client_operation_id text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE next_version integer; current_user_id uuid:=auth.uid(); existing public.proofs; allowed boolean;
BEGIN
  allowed:=public.owns_dossier(p_dossier_id,current_user_id) OR public.has_scope(p_dossier_id,current_user_id,'ajouter_document');
  IF current_user_id IS NULL OR NOT allowed THEN RAISE EXCEPTION 'document_write_forbidden' USING ERRCODE='42501'; END IF;
  IF p_source_type NOT IN ('declaration','utilisateur','accompagnateur') THEN RAISE EXCEPTION 'document_source_forbidden' USING ERRCODE='42501'; END IF;
  IF p_document_type !~ '^[a-z0-9_]{2,80}$' OR char_length(btrim(p_title)) NOT BETWEEN 2 AND 200 THEN RAISE EXCEPTION 'invalid_document_metadata' USING ERRCODE='22023'; END IF;
  IF p_mime_type NOT IN ('image/jpeg','image/png','image/webp','application/pdf','audio/mpeg','audio/mp4','video/mp4') OR p_size_bytes NOT BETWEEN 1 AND 15728640 OR p_checksum !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'invalid_document_file' USING ERRCODE='22023'; END IF;
  IF p_storage_path<>format('dossiers/%s/documents/%s/%s',p_dossier_id,p_document_id,p_version_id) THEN RAISE EXCEPTION 'invalid_document_path' USING ERRCODE='22023'; END IF;
  SELECT * INTO existing FROM public.proofs WHERE id=p_document_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.proofs(id,dossier_id,bien_id,type,title,storage_path,mime_type,size_bytes,uploaded_by,verified,document_type,source_type,verification_status,created_by,client_operation_id)
    VALUES(p_document_id,p_dossier_id,p_bien_id,CASE WHEN p_mime_type LIKE 'image/%' THEN 'image'::public.proof_type ELSE 'document'::public.proof_type END,btrim(p_title),p_storage_path,p_mime_type,p_size_bytes,current_user_id,false,p_document_type,p_source_type,'fourni',current_user_id,p_client_operation_id);
    next_version:=1;
  ELSE
    IF existing.dossier_id<>p_dossier_id OR NOT allowed OR existing.archived_at IS NOT NULL THEN RAISE EXCEPTION 'document_write_forbidden' USING ERRCODE='42501'; END IF;
    SELECT COALESCE(max(version_number),0)+1 INTO next_version FROM public.document_versions WHERE document_id=p_document_id;
    UPDATE public.document_versions SET replaced_at=now() WHERE id=existing.current_version_id AND replaced_at IS NULL;
  END IF;
  INSERT INTO public.document_versions(id,document_id,storage_path,mime_type,size_bytes,checksum,version_number,uploaded_by,provided_by)
  VALUES(p_version_id,p_document_id,p_storage_path,p_mime_type,p_size_bytes,p_checksum,next_version,current_user_id,p_provided_by);
  UPDATE public.proofs SET current_version_id=p_version_id,storage_path=p_storage_path,mime_type=p_mime_type,size_bytes=p_size_bytes,uploaded_by=current_user_id,updated_at=now() WHERE id=p_document_id;
  RETURN p_version_id;
END $$;

CREATE POLICY "grant holders upload dossier documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK(
  bucket_id='dossier-proofs' AND (storage.foldername(name))[1]='dossiers'
  AND public.has_scope(((storage.foldername(name))[2])::uuid,auth.uid(),'ajouter_document'));
