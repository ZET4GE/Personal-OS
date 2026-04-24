-- 065_profile_nationality.sql
-- Adds nationality field to profiles for CV contact section

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nationality VARCHAR(80);
