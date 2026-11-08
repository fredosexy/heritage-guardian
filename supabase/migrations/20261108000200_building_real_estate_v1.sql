-- Building and real-estate V1 data model.
-- Additive only: existing Terrain dossiers, proofs, participants and metadata remain intact.

CREATE TABLE public.building_properties (
  dossier_id uuid PRIMARY KEY REFERENCES public.dossiers(id) ON DELETE CASCADE,
  parent_terrain_dossier_id uuid REFERENCES public.dossiers(id) ON DELETE SET NULL,
  property_kind text NOT NULL CHECK (property_kind IN ('immeuble', 'maison', 'commerce', 'bureau', 'autre')),
  locality text,
  address_description text,
  declared_surface numeric(14,2) CHECK (declared_surface IS NULL OR declared_surface >= 0),
  surface_unit text NOT NULL DEFAULT 'm2' CHECK (surface_unit IN ('m2', 'are', 'hectare')),
  administrative_references jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(administrative_references) = 'array'),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX building_properties_parent_terrain_idx
  ON public.building_properties(parent_terrain_dossier_id)
  WHERE parent_terrain_dossier_id IS NOT NULL;

CREATE TABLE public.building_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_dossier_id uuid NOT NULL REFERENCES public.building_properties(dossier_id) ON DELETE CASCADE,
  designation text NOT NULL CHECK (char_length(btrim(designation)) BETWEEN 1 AND 160),
  unit_kind text NOT NULL CHECK (unit_kind IN ('appartement', 'boutique', 'bureau', 'local', 'autre')),
  declared_surface numeric(14,2) CHECK (declared_surface IS NULL OR declared_surface >= 0),
  surface_unit text NOT NULL DEFAULT 'm2' CHECK (surface_unit IN ('m2', 'are', 'hectare')),
  occupancy_status text NOT NULL DEFAULT 'inconnu' CHECK (occupancy_status IN ('occupe', 'vacant', 'inconnu')),
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX building_units_building_idx ON public.building_units(building_dossier_id);

CREATE TABLE public.building_person_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_dossier_id uuid NOT NULL REFERENCES public.building_properties(dossier_id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.building_units(id) ON DELETE SET NULL,
  person_name text NOT NULL CHECK (char_length(btrim(person_name)) BETWEEN 1 AND 180),
  contact_phone text,
  contact_email text,
  declared_role text NOT NULL CHECK (declared_role IN (
    'proprietaire_declare', 'coproprietaire_declare', 'detenteur', 'possesseur',
    'beneficiaire_droit_declare', 'representant', 'gestionnaire', 'occupant',
    'locataire', 'acheteur', 'vendeur', 'heritier_potentiel', 'ayant_droit_declare',
    'voisin', 'autre'
  )),
  declaration_status text NOT NULL DEFAULT 'declare' CHECK (declaration_status IN ('declare', 'piece_associee', 'a_verifier')),
  relation_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT building_person_unit_same_building CHECK (unit_id IS NULL OR building_dossier_id IS NOT NULL)
);
CREATE INDEX building_person_relations_building_idx ON public.building_person_relations(building_dossier_id);
CREATE INDEX building_person_relations_unit_idx ON public.building_person_relations(unit_id);

CREATE TABLE public.building_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_dossier_id uuid NOT NULL REFERENCES public.building_properties(dossier_id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.building_units(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'declaration', 'gestion', 'occupation', 'vente', 'achat', 'location',
    'transmission', 'entretien', 'desaccord_voisinage', 'limite', 'acces',
    'occupation_contestee', 'desaccord_vente_achat_location', 'autre'
  )),
  occurred_on date,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 180),
  description text,
  parties_statements jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(parties_statements) = 'array'),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX building_events_building_date_idx
  ON public.building_events(building_dossier_id, occurred_on DESC);

-- Ensure a building dossier really has type 'batiment', and an optional linked
-- terrain is a Terrain dossier owned by the same account.
CREATE OR REPLACE FUNCTION public.validate_building_property_links()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  building_row record;
  terrain_row record;
BEGIN
  SELECT id, user_id, type INTO building_row
  FROM public.dossiers WHERE id = NEW.dossier_id;

  IF NOT FOUND OR building_row.type <> 'batiment' THEN
    RAISE EXCEPTION 'building_property_requires_batiment_dossier'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.parent_terrain_dossier_id IS NOT NULL THEN
    SELECT id, user_id, type INTO terrain_row
    FROM public.dossiers WHERE id = NEW.parent_terrain_dossier_id;

    IF NOT FOUND OR terrain_row.type <> 'terrain'
      OR terrain_row.user_id <> building_row.user_id THEN
      RAISE EXCEPTION 'parent_terrain_must_be_owned_terrain_dossier'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_building_property_links
  BEFORE INSERT OR UPDATE OF dossier_id, parent_terrain_dossier_id
  ON public.building_properties
  FOR EACH ROW EXECUTE FUNCTION public.validate_building_property_links();

-- Prevent a dossier already used as a building or linked Terrain from being
-- silently reclassified after the relationship has been established.
CREATE OR REPLACE FUNCTION public.guard_building_dossier_type_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF NEW.type IS DISTINCT FROM OLD.type THEN
    IF EXISTS (SELECT 1 FROM public.building_properties bp WHERE bp.dossier_id = OLD.id)
      AND NEW.type <> 'batiment' THEN
      RAISE EXCEPTION 'building_dossier_type_is_locked'
        USING ERRCODE = '23514';
    END IF;
    IF EXISTS (SELECT 1 FROM public.building_properties bp WHERE bp.parent_terrain_dossier_id = OLD.id)
      AND NEW.type <> 'terrain' THEN
      RAISE EXCEPTION 'linked_terrain_dossier_type_is_locked'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER guard_building_dossier_type_change
  BEFORE UPDATE OF type ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.guard_building_dossier_type_change();

REVOKE ALL ON FUNCTION public.guard_building_dossier_type_change() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.validate_building_unit_relation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF NEW.unit_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.building_units u
    WHERE u.id = NEW.unit_id AND u.building_dossier_id = NEW.building_dossier_id
  ) THEN
    RAISE EXCEPTION 'unit_must_belong_to_same_building'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_building_person_unit
  BEFORE INSERT OR UPDATE OF unit_id, building_dossier_id
  ON public.building_person_relations
  FOR EACH ROW EXECUTE FUNCTION public.validate_building_unit_relation();

CREATE TRIGGER validate_building_event_unit
  BEFORE INSERT OR UPDATE OF unit_id, building_dossier_id
  ON public.building_events
  FOR EACH ROW EXECUTE FUNCTION public.validate_building_unit_relation();

-- Keep timestamps consistent with the existing application convention.
CREATE TRIGGER update_building_properties_updated_at
  BEFORE UPDATE ON public.building_properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_building_units_updated_at
  BEFORE UPDATE ON public.building_units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_building_person_relations_updated_at
  BEFORE UPDATE ON public.building_person_relations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_building_events_updated_at
  BEFORE UPDATE ON public.building_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.building_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_person_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.building_properties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.building_units TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.building_person_relations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.building_events TO authenticated;

-- Owners can manage their building records. Accepted participants can read only.
CREATE POLICY building_properties_select ON public.building_properties
  FOR SELECT TO authenticated
  USING (public.owns_dossier(dossier_id, (SELECT auth.uid()))
    OR public.is_dossier_participant(dossier_id, (SELECT auth.uid())));
CREATE POLICY building_properties_insert ON public.building_properties
  FOR INSERT TO authenticated
  WITH CHECK (public.owns_dossier(dossier_id, (SELECT auth.uid())));
CREATE POLICY building_properties_update ON public.building_properties
  FOR UPDATE TO authenticated
  USING (public.owns_dossier(dossier_id, (SELECT auth.uid())))
  WITH CHECK (public.owns_dossier(dossier_id, (SELECT auth.uid())));
CREATE POLICY building_properties_delete ON public.building_properties
  FOR DELETE TO authenticated
  USING (public.owns_dossier(dossier_id, (SELECT auth.uid())));

CREATE POLICY building_units_select ON public.building_units
  FOR SELECT TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid()))
    OR public.is_dossier_participant(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_units_insert ON public.building_units
  FOR INSERT TO authenticated
  WITH CHECK (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_units_update ON public.building_units
  FOR UPDATE TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid())))
  WITH CHECK (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_units_delete ON public.building_units
  FOR DELETE TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));

CREATE POLICY building_person_relations_select ON public.building_person_relations
  FOR SELECT TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid()))
    OR public.is_dossier_participant(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_person_relations_insert ON public.building_person_relations
  FOR INSERT TO authenticated
  WITH CHECK (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_person_relations_update ON public.building_person_relations
  FOR UPDATE TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid())))
  WITH CHECK (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_person_relations_delete ON public.building_person_relations
  FOR DELETE TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));

CREATE POLICY building_events_select ON public.building_events
  FOR SELECT TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid()))
    OR public.is_dossier_participant(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_events_insert ON public.building_events
  FOR INSERT TO authenticated
  WITH CHECK (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_events_update ON public.building_events
  FOR UPDATE TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid())))
  WITH CHECK (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));
CREATE POLICY building_events_delete ON public.building_events
  FOR DELETE TO authenticated
  USING (public.owns_dossier(building_dossier_id, (SELECT auth.uid())));

REVOKE ALL ON FUNCTION public.validate_building_property_links() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_building_unit_relation() FROM PUBLIC, anon, authenticated;
