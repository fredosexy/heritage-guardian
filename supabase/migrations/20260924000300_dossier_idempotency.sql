ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS client_operation_id text;

ALTER TABLE public.dossiers
  DROP CONSTRAINT IF EXISTS dossiers_client_operation_id_length;

ALTER TABLE public.dossiers
  ADD CONSTRAINT dossiers_client_operation_id_length
  CHECK (client_operation_id IS NULL OR length(client_operation_id) BETWEEN 8 AND 120);

ALTER TABLE public.dossiers
  DROP CONSTRAINT IF EXISTS dossiers_user_client_operation_unique;

ALTER TABLE public.dossiers
  ADD CONSTRAINT dossiers_user_client_operation_unique
  UNIQUE (user_id, client_operation_id);
