-- Add a dedicated dossier type for buildings without changing existing records.
-- This migration is intentionally separate: PostgreSQL requires a newly added
-- enum value to be committed before it can be used by later DDL or DML.
ALTER TYPE public.dossier_type ADD VALUE IF NOT EXISTS 'batiment';
