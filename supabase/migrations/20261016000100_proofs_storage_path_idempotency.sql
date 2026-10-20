-- Proof retries from multiple tabs must converge on one database row per Storage object.
-- Fail explicitly if historical duplicate paths need reconciliation before this constraint can apply.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.proofs
    GROUP BY storage_path
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce proofs.storage_path uniqueness: duplicate paths already exist. Reconcile duplicate proof rows before applying this migration.';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS proofs_storage_path_unique
  ON public.proofs (storage_path);
