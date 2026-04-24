-- 066_drop_skills_level_text.sql
-- Drop deprecated skills.level text column.
-- Replaced by level_pct (0-100 smallint) in migration 064.
-- Confirmed no code references skills.level after 064 was applied.

ALTER TABLE skills DROP COLUMN IF EXISTS level;
