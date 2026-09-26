-- B5 — actors, competences, credentials and controlled verification
CREATE TABLE public.actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('professionnel','autorite_locale','service_administratif','organisation','autre')),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 160),
  description text,
  location text NOT NULL CHECK (char_length(btrim(location)) BETWEEN 2 AND 160),
  territorial_level text NOT NULL CHECK (territorial_level IN ('local','rural','arrondissement','departement','region','national','autre')),
  verification_status text NOT NULL DEFAULT 'non_verifie' CHECK (verification_status IN ('non_verifie','verification_en_cours','verifie','suspendu','revoque')),
  availability_status text NOT NULL DEFAULT 'inconnue' CHECK (availability_status IN ('disponible','indisponible','inconnue')),
  is_published boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  suspended_at timestamptz,
  CHECK ((verification_status = 'verifie') = (verified_by IS NOT NULL AND verified_at IS NOT NULL)),
  CHECK ((verification_status = 'suspendu') = (suspended_at IS NOT NULL))
);

CREATE TABLE public.actor_competences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES public.actors(id) ON DELETE CASCADE,
  competence_code text NOT NULL CHECK (competence_code IN ('geometre','notaire','chef_traditionnel','cadastre','conservation_fonciere','sous_prefecture','mindcaf','mediation','autre')),
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 2 AND 160),
  status text NOT NULL DEFAULT 'declare' CHECK (status IN ('declare','verification_en_cours','verifie','expire','suspendu','revoque')),
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (actor_id, competence_code),
  CHECK ((status = 'verifie') = (verified_by IS NOT NULL AND verified_at IS NOT NULL))
);

CREATE TABLE public.actor_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES public.actors(id) ON DELETE CASCADE,
  credential_type text NOT NULL CHECK (char_length(btrim(credential_type)) BETWEEN 2 AND 120),
  reference text,
  document_id uuid,
  status text NOT NULL DEFAULT 'declare' CHECK (status IN ('declare','verification_en_cours','verifie','expire','suspendu','revoque')),
  issued_at timestamptz,
  expires_at timestamptz,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'verifie') = (verified_by IS NOT NULL AND verified_at IS NOT NULL))
);

CREATE INDEX actors_type_idx ON public.actors(actor_type);
CREATE INDEX actors_territorial_level_idx ON public.actors(territorial_level);
CREATE INDEX actors_verification_status_idx ON public.actors(verification_status);
CREATE INDEX actors_location_idx ON public.actors(lower(location));
CREATE INDEX actor_competences_actor_idx ON public.actor_competences(actor_id);
CREATE INDEX actor_competences_code_status_idx ON public.actor_competences(competence_code, status);
CREATE INDEX actor_credentials_actor_idx ON public.actor_credentials(actor_id);
CREATE INDEX actor_credentials_status_idx ON public.actor_credentials(status);

CREATE TRIGGER update_actors_updated_at BEFORE UPDATE ON public.actors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.can_verify_actor(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'moderator')
$$;

ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actor_competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actor_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published actors are readable" ON public.actors FOR SELECT
  USING (is_published OR profile_id = auth.uid() OR public.can_verify_actor(auth.uid()));
CREATE POLICY "users create own actor" ON public.actors FOR INSERT
  WITH CHECK (profile_id = auth.uid() AND verification_status = 'non_verifie' AND verified_by IS NULL AND verified_at IS NULL AND NOT is_published);
CREATE POLICY "owners update own actor" ON public.actors FOR UPDATE
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "verifiers manage actors" ON public.actors FOR ALL
  USING (public.can_verify_actor(auth.uid())) WITH CHECK (public.can_verify_actor(auth.uid()));

CREATE POLICY "published actor competences are readable" ON public.actor_competences FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.actors a WHERE a.id = actor_id AND (a.is_published OR a.profile_id = auth.uid() OR public.can_verify_actor(auth.uid()))));
CREATE POLICY "owners declare competences" ON public.actor_competences FOR INSERT
  WITH CHECK (status = 'declare' AND verified_by IS NULL AND verified_at IS NULL AND EXISTS (SELECT 1 FROM public.actors a WHERE a.id = actor_id AND a.profile_id = auth.uid()));
CREATE POLICY "verifiers manage competences" ON public.actor_competences FOR ALL
  USING (public.can_verify_actor(auth.uid())) WITH CHECK (public.can_verify_actor(auth.uid()));

CREATE POLICY "owners and verifiers read credentials" ON public.actor_credentials FOR SELECT
  USING (public.can_verify_actor(auth.uid()) OR EXISTS (SELECT 1 FROM public.actors a WHERE a.id = actor_id AND a.profile_id = auth.uid()));
CREATE POLICY "owners submit credentials" ON public.actor_credentials FOR INSERT
  WITH CHECK (status = 'declare' AND verified_by IS NULL AND verified_at IS NULL AND EXISTS (SELECT 1 FROM public.actors a WHERE a.id = actor_id AND a.profile_id = auth.uid()));
CREATE POLICY "verifiers manage credentials" ON public.actor_credentials FOR ALL
  USING (public.can_verify_actor(auth.uid())) WITH CHECK (public.can_verify_actor(auth.uid()));

REVOKE ALL ON public.actors, public.actor_competences, public.actor_credentials FROM anon, authenticated;
GRANT SELECT ON public.actors, public.actor_competences TO anon, authenticated;
GRANT SELECT ON public.actor_credentials TO authenticated;
GRANT INSERT ON public.actors, public.actor_competences, public.actor_credentials TO authenticated;
GRANT UPDATE ON public.actors, public.actor_competences, public.actor_credentials TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_actor_verification_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.can_verify_actor(auth.uid()) AND
    (NEW.verification_status, NEW.verified_by, NEW.verified_at, NEW.suspended_at, NEW.is_published)
      IS DISTINCT FROM
    (OLD.verification_status, OLD.verified_by, OLD.verified_at, OLD.suspended_at, OLD.is_published)
  THEN RAISE EXCEPTION 'actor_verification_fields_forbidden' USING ERRCODE = '42501'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_actor_verification BEFORE UPDATE ON public.actors
  FOR EACH ROW EXECUTE FUNCTION public.protect_actor_verification_fields();

CREATE OR REPLACE FUNCTION public.verify_actor(p_actor_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_verify_actor(auth.uid()) THEN RAISE EXCEPTION 'verification_forbidden' USING ERRCODE = '42501'; END IF;
  IF p_status NOT IN ('non_verifie','verification_en_cours','verifie','suspendu','revoque') THEN RAISE EXCEPTION 'invalid_actor_status' USING ERRCODE = '22023'; END IF;
  UPDATE public.actors SET verification_status=p_status,
    verified_by=CASE WHEN p_status='verifie' THEN auth.uid() ELSE NULL END,
    verified_at=CASE WHEN p_status='verifie' THEN now() ELSE NULL END,
    suspended_at=CASE WHEN p_status='suspendu' THEN now() ELSE NULL END,
    is_published=(p_status='verifie') WHERE id=p_actor_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'actor_not_found' USING ERRCODE = 'P0002'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_actor_competence(p_competence_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_verify_actor(auth.uid()) THEN RAISE EXCEPTION 'verification_forbidden' USING ERRCODE = '42501'; END IF;
  IF p_status NOT IN ('declare','verification_en_cours','verifie','expire','suspendu','revoque') THEN RAISE EXCEPTION 'invalid_competence_status' USING ERRCODE = '22023'; END IF;
  UPDATE public.actor_competences SET status=p_status,
    verified_by=CASE WHEN p_status='verifie' THEN auth.uid() ELSE NULL END,
    verified_at=CASE WHEN p_status='verifie' THEN now() ELSE NULL END WHERE id=p_competence_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'competence_not_found' USING ERRCODE = 'P0002'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_actor_credential(p_credential_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_verify_actor(auth.uid()) THEN RAISE EXCEPTION 'verification_forbidden' USING ERRCODE = '42501'; END IF;
  IF p_status NOT IN ('declare','verification_en_cours','verifie','expire','suspendu','revoque') THEN RAISE EXCEPTION 'invalid_credential_status' USING ERRCODE = '22023'; END IF;
  UPDATE public.actor_credentials SET status=p_status,
    verified_by=CASE WHEN p_status='verifie' THEN auth.uid() ELSE NULL END,
    verified_at=CASE WHEN p_status='verifie' THEN now() ELSE NULL END WHERE id=p_credential_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'credential_not_found' USING ERRCODE = 'P0002'; END IF;
END $$;

REVOKE ALL ON FUNCTION public.verify_actor(uuid,text), public.verify_actor_competence(uuid,text), public.verify_actor_credential(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_actor(uuid,text), public.verify_actor_competence(uuid,text), public.verify_actor_credential(uuid,text) TO authenticated;
