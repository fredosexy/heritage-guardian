-- Allow multiple free-form dossier steps while keeping procedure-step references unique.
-- The original UNIQUE NULLS NOT DISTINCT constraint treats NULL references as duplicates.
-- Replace it with a partial unique index that only applies to actual procedure-step references.

ALTER TABLE public.dossier_steps
  DROP CONSTRAINT IF EXISTS dossier_steps_dossier_id_procedure_step_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS dossier_steps_dossier_procedure_step_uidx
  ON public.dossier_steps (dossier_id, procedure_step_id)
  WHERE procedure_step_id IS NOT NULL;
