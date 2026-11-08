-- Add a dedicated dossier type for declared agricultural and rural assets.
-- The shared dossier remains the canonical identity and security boundary in V1.
ALTER TYPE public.dossier_type ADD VALUE IF NOT EXISTS 'agricole';
