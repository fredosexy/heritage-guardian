-- B3 — dossiers linked to durable assets and protected participants

ALTER TABLE public.dossiers
  ADD COLUMN bien_id uuid REFERENCES public.biens(id) ON DELETE RESTRICT,
  ADD COLUMN owner_id uuid REFERENCES auth.users(id),
  ADD COLUMN completion_level text NOT NULL DEFAULT 'debut'
    CHECK (completion_level IN ('debut','a_completer','a_verifier','partiellement_documente','bien_documente','parcours_avance','a_finaliser')),
  ADD COLUMN closed_at timestamptz,
  ADD COLUMN archived_at timestamptz;

-- Existing installations receive one durable asset per historical dossier.
INSERT INTO public.biens (
  id, created_by, type, title, description, location_label,
  latitude, longitude, creation_context, status, created_at, updated_at
)
SELECT
  d.id, d.user_id, 'autre', d.title, d.description,
  COALESCE(NULLIF(btrim(d.location_name), ''), 'Localisation à compléter'),
  d.latitude, d.longitude, 'propre_bien', 'a_verifier', d.created_at, d.updated_at
FROM public.dossiers d
WHERE NOT EXISTS (SELECT 1 FROM public.biens b WHERE b.id = d.id);

UPDATE public.dossiers SET bien_id = id WHERE bien_id IS NULL;
UPDATE public.dossiers SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE public.dossiers SET visibility = 'prive' WHERE visibility = 'private';
UPDATE public.dossiers SET status = CASE status::text
  WHEN 'secure' THEN 'actif'::public.dossier_status
  WHEN 'risk' THEN 'bloque'::public.dossier_status
  ELSE 'a_completer'::public.dossier_status
END
WHERE status::text IN ('secure', 'risk', 'incomplete');

ALTER TABLE public.dossiers ALTER COLUMN bien_id SET NOT NULL;
ALTER TABLE public.dossiers ALTER COLUMN owner_id SET NOT NULL;

CREATE INDEX dossiers_bien_id_idx ON public.dossiers(bien_id);
CREATE INDEX dossiers_owner_id_idx ON public.dossiers(owner_id);

CREATE OR REPLACE FUNCTION public.sync_dossier_owner_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.owner_id := COALESCE(NEW.owner_id, NEW.user_id);
  NEW.user_id := COALESCE(NEW.user_id, NEW.owner_id);
  IF NEW.owner_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'dossier_owner_mismatch' USING ERRCODE = '23514';
  END IF;
  IF NEW.bien_id IS NULL THEN
    INSERT INTO public.biens (
      id, created_by, type, title, description, location_label,
      latitude, longitude, creation_context, status
    ) VALUES (
      NEW.id, NEW.owner_id, 'autre', NEW.title, NEW.description,
      COALESCE(NULLIF(btrim(NEW.location_name), ''), 'Localisation à compléter'),
      NEW.latitude, NEW.longitude, 'propre_bien', 'a_verifier'
    ) ON CONFLICT (id) DO NOTHING;
    NEW.bien_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_dossier_owner_columns
  BEFORE INSERT OR UPDATE OF owner_id, user_id ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.sync_dossier_owner_columns();

-- The historical table becomes the canonical B3 relation; `participants` remains an updatable compatibility view.
ALTER TABLE public.participants RENAME TO dossier_participants;
ALTER INDEX IF EXISTS idx_participants_dossier RENAME TO dossier_participants_dossier_idx;
ALTER INDEX IF EXISTS idx_participants_user RENAME TO dossier_participants_user_idx;

ALTER TABLE public.dossier_participants
  ADD COLUMN person_id uuid REFERENCES public.persons(id) ON DELETE RESTRICT,
  ADD COLUMN status text NOT NULL DEFAULT 'invite' CHECK (status IN ('invite','actif','refuse','revoque')),
  ADD COLUMN invited_by uuid REFERENCES auth.users(id),
  ADD COLUMN accepted_at timestamptz,
  ADD COLUMN revoked_at timestamptz;

UPDATE public.dossier_participants dp
SET person_id = p.id,
    invited_by = d.owner_id,
    status = 'actif',
    accepted_at = COALESCE(dp.created_at, now())
FROM public.persons p, public.dossiers d
WHERE dp.dossier_id = d.id
  AND dp.user_id IS NOT NULL
  AND p.linked_profile_id = dp.user_id;

INSERT INTO public.persons (linked_profile_id, display_name, created_by)
SELECT DISTINCT dp.user_id, COALESCE(NULLIF(btrim(dp.contact_name), ''), 'Participant'), d.owner_id
FROM public.dossier_participants dp
JOIN public.dossiers d ON d.id = dp.dossier_id
WHERE dp.user_id IS NOT NULL AND dp.person_id IS NULL
ON CONFLICT (linked_profile_id) DO NOTHING;

INSERT INTO public.persons (display_name, phone, email, created_by)
SELECT COALESCE(NULLIF(btrim(dp.contact_name), ''), 'Participant'), dp.contact_phone, dp.contact_email, d.owner_id
FROM public.dossier_participants dp
JOIN public.dossiers d ON d.id = dp.dossier_id
WHERE dp.user_id IS NULL AND dp.person_id IS NULL;

UPDATE public.dossier_participants dp
SET person_id = p.id,
    invited_by = d.owner_id
FROM public.persons p, public.dossiers d
WHERE dp.dossier_id = d.id AND dp.user_id IS NULL AND dp.person_id IS NULL
  AND p.created_by = d.owner_id
  AND p.display_name = COALESCE(NULLIF(btrim(dp.contact_name), ''), 'Participant')
  AND p.created_at >= dp.created_at;

UPDATE public.dossier_participants dp
SET person_id = p.id,
    invited_by = d.owner_id,
    status = 'actif',
    accepted_at = COALESCE(dp.created_at, now())
FROM public.persons p, public.dossiers d
WHERE dp.dossier_id = d.id AND p.linked_profile_id = dp.user_id AND dp.person_id IS NULL;

ALTER TABLE public.dossier_participants ALTER COLUMN person_id SET NOT NULL;
ALTER TABLE public.dossier_participants ALTER COLUMN invited_by SET NOT NULL;
ALTER TABLE public.dossier_participants ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.dossier_participants ALTER COLUMN role TYPE text USING CASE role::text
  WHEN 'owner' THEN 'titulaire' WHEN 'heir' THEN 'ayant_droit'
  WHEN 'witness' THEN 'temoin' WHEN 'expert' THEN 'professionnel'
  ELSE 'accompagnateur' END;
ALTER TABLE public.dossier_participants ALTER COLUMN role SET DEFAULT 'accompagnateur';
ALTER TABLE public.dossier_participants ADD CONSTRAINT dossier_participants_role_check
  CHECK (role IN ('titulaire','ayant_droit','declarant','accompagnateur','temoin','professionnel','service','autorite'));

CREATE INDEX dossier_participants_person_idx ON public.dossier_participants(person_id);
CREATE INDEX dossier_participants_status_idx ON public.dossier_participants(status);
CREATE UNIQUE INDEX dossier_participants_active_unique_idx
  ON public.dossier_participants(dossier_id, person_id, role) WHERE status <> 'revoque';

DROP POLICY IF EXISTS "owners view dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "participants view dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "owners insert dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "owners update dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "owners delete dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "owners view participants" ON public.dossier_participants;
DROP POLICY IF EXISTS "self view as participant" ON public.dossier_participants;
DROP POLICY IF EXISTS "owners manage participants" ON public.dossier_participants;

CREATE OR REPLACE FUNCTION public.can_view_dossier(_dossier_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public SET row_security = off AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dossiers d
    WHERE d.id = _dossier_id AND (
      d.owner_id = _user_id OR EXISTS (
        SELECT 1 FROM public.dossier_participants dp
        JOIN public.persons p ON p.id = dp.person_id
        WHERE dp.dossier_id = d.id AND dp.status = 'actif'
          AND (p.linked_profile_id = _user_id OR dp.user_id = _user_id)
      )
    )
  )
$$;
REVOKE ALL ON FUNCTION public.can_view_dossier(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_dossier(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.owns_dossier(_dossier_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public SET row_security = off AS $$
  SELECT EXISTS (SELECT 1 FROM public.dossiers WHERE id = _dossier_id AND owner_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_dossier_participant(_dossier_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public SET row_security = off AS $$
  SELECT public.can_view_dossier(_dossier_id, _user_id)
$$;

CREATE POLICY "authorized users view dossiers" ON public.dossiers FOR SELECT
  USING (public.can_view_dossier(id, auth.uid()));
CREATE POLICY "owners create dossiers" ON public.dossiers FOR INSERT
  WITH CHECK (owner_id = auth.uid() AND user_id = auth.uid() AND public.can_view_bien(bien_id, auth.uid()));
CREATE POLICY "owners update dossiers" ON public.dossiers FOR UPDATE
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND user_id = auth.uid());

CREATE POLICY "authorized users view dossier participants" ON public.dossier_participants FOR SELECT
  USING (public.can_view_dossier(dossier_id, auth.uid()));

REVOKE ALL ON public.dossier_participants FROM anon, authenticated;
GRANT SELECT ON public.dossier_participants TO authenticated;

CREATE OR REPLACE FUNCTION public.create_dossier(
  p_bien_id uuid, p_type public.dossier_type, p_title text,
  p_visibility public.dossier_visibility DEFAULT 'prive', p_description text DEFAULT NULL,
  p_include_bien_holders boolean DEFAULT true, p_client_operation_id text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET row_security = off AS $$
DECLARE current_user_id uuid := auth.uid(); new_id uuid;
BEGIN
  IF current_user_id IS NULL OR NOT public.can_view_bien(p_bien_id, current_user_id) THEN
    RAISE EXCEPTION 'dossier_creation_forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_visibility::text NOT IN ('prive','public') THEN RAISE EXCEPTION 'invalid_visibility' USING ERRCODE = '22023'; END IF;
  INSERT INTO public.dossiers (bien_id, owner_id, user_id, type, visibility, status, completion_level, title, description, client_operation_id)
  VALUES (p_bien_id, current_user_id, current_user_id, p_type, p_visibility, 'brouillon', 'debut', btrim(p_title), p_description, p_client_operation_id)
  ON CONFLICT (user_id, client_operation_id)
  DO UPDATE SET updated_at = public.dossiers.updated_at RETURNING id INTO new_id;
  IF p_include_bien_holders THEN
    INSERT INTO public.dossier_participants (dossier_id, person_id, user_id, contact_name, role, status, invited_by, accepted_at)
    SELECT new_id, brh.person_id, p.linked_profile_id, p.display_name,
      CASE WHEN brh.role = 'ayant_droit' THEN 'ayant_droit' ELSE 'titulaire' END,
      CASE WHEN p.linked_profile_id = current_user_id THEN 'actif' ELSE 'invite' END,
      current_user_id, CASE WHEN p.linked_profile_id = current_user_id THEN now() ELSE NULL END
    FROM public.bien_right_holders brh JOIN public.persons p ON p.id = brh.person_id
    WHERE brh.bien_id = p_bien_id AND brh.status <> 'revoque'
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_dossier(uuid, public.dossier_type, text, public.dossier_visibility, text, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_dossier(uuid, public.dossier_type, text, public.dossier_visibility, text, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_dossier_participant(p_dossier_id uuid, p_person_id uuid, p_role text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET row_security = off AS $$
DECLARE current_user_id uuid := auth.uid(); relation_id uuid; linked_user uuid; person_name text;
BEGIN
  IF NOT public.owns_dossier(p_dossier_id, current_user_id) THEN RAISE EXCEPTION 'participant_management_forbidden' USING ERRCODE = '42501'; END IF;
  IF p_role NOT IN ('declarant','accompagnateur','temoin','titulaire','ayant_droit') THEN RAISE EXCEPTION 'protected_participant_role' USING ERRCODE = '42501'; END IF;
  IF p_role IN ('titulaire','ayant_droit') AND NOT EXISTS (
    SELECT 1 FROM public.dossiers d JOIN public.bien_right_holders brh ON brh.bien_id = d.bien_id
    WHERE d.id = p_dossier_id AND brh.person_id = p_person_id AND brh.status <> 'revoque'
      AND ((p_role = 'ayant_droit' AND brh.role = 'ayant_droit') OR (p_role = 'titulaire' AND brh.role IN ('titulaire','co_titulaire')))
  ) THEN RAISE EXCEPTION 'protected_participant_role' USING ERRCODE = '42501'; END IF;
  SELECT linked_profile_id, display_name INTO linked_user, person_name FROM public.persons WHERE id = p_person_id AND public.can_view_person(id, current_user_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'person_not_accessible' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.dossier_participants (dossier_id, person_id, user_id, contact_name, role, status, invited_by)
  VALUES (p_dossier_id, p_person_id, linked_user, person_name, p_role, 'invite', current_user_id)
  RETURNING id INTO relation_id;
  RETURN relation_id;
END;
$$;
REVOKE ALL ON FUNCTION public.add_dossier_participant(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_dossier_participant(uuid, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_dossier_participant(p_participant_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET row_security = off AS $$
BEGIN
  UPDATE public.dossier_participants dp SET status = 'revoque', revoked_at = now()
  WHERE dp.id = p_participant_id AND dp.status <> 'revoque' AND public.owns_dossier(dp.dossier_id, auth.uid());
  IF NOT FOUND THEN RAISE EXCEPTION 'participant_revocation_forbidden' USING ERRCODE = '42501'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.revoke_dossier_participant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_dossier_participant(uuid) TO authenticated;

CREATE OR REPLACE VIEW public.participants WITH (security_invoker = true) AS SELECT * FROM public.dossier_participants;

CREATE OR REPLACE FUNCTION public.insert_legacy_participant()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET row_security = off AS $$
DECLARE owner_user uuid; resolved_person uuid; resolved_name text;
BEGIN
  SELECT owner_id INTO owner_user FROM public.dossiers
  WHERE id = NEW.dossier_id AND owner_id = auth.uid();
  IF owner_user IS NULL THEN RAISE EXCEPTION 'participant_management_forbidden' USING ERRCODE = '42501'; END IF;
  resolved_name := COALESCE(NULLIF(btrim(NEW.contact_name), ''), 'Participant');
  IF NEW.user_id IS NOT NULL THEN
    SELECT id INTO resolved_person FROM public.persons WHERE linked_profile_id = NEW.user_id;
    IF resolved_person IS NULL THEN
      INSERT INTO public.persons (linked_profile_id, display_name, created_by)
      VALUES (NEW.user_id, resolved_name, owner_user) RETURNING id INTO resolved_person;
    END IF;
  ELSE
    INSERT INTO public.persons (display_name, phone, email, created_by)
    VALUES (resolved_name, NEW.contact_phone, NEW.contact_email, owner_user) RETURNING id INTO resolved_person;
  END IF;
  INSERT INTO public.dossier_participants (
    id, dossier_id, person_id, user_id, contact_name, contact_phone, contact_email,
    role, share_percentage, invited_at, accepted_at, created_at, status, invited_by
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()), NEW.dossier_id, resolved_person, NEW.user_id,
    NEW.contact_name, NEW.contact_phone, NEW.contact_email,
    CASE NEW.role WHEN 'owner' THEN 'titulaire' WHEN 'heir' THEN 'ayant_droit'
      WHEN 'witness' THEN 'temoin' WHEN 'expert' THEN 'professionnel' ELSE 'accompagnateur' END,
    NEW.share_percentage, COALESCE(NEW.invited_at, now()), COALESCE(NEW.accepted_at, now()),
    COALESCE(NEW.created_at, now()), 'actif', owner_user
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER insert_legacy_participant INSTEAD OF INSERT ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.insert_legacy_participant();
GRANT SELECT, INSERT ON public.participants TO authenticated;
