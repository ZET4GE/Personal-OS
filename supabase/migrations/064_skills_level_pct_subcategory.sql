-- 064_skills_level_pct_subcategory.sql
-- Replaces the discrete level text enum with a 0–100 percentage
-- Adds optional subcategory for fine-grained grouping within fixed categories

ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS level_pct smallint
    CHECK (level_pct IS NULL OR (level_pct BETWEEN 0 AND 100));

ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS subcategory VARCHAR(80);

-- Migrate existing level values to approximate percentages
UPDATE public.skills
SET level_pct = CASE level
  WHEN 'beginner'     THEN 25
  WHEN 'intermediate' THEN 50
  WHEN 'advanced'     THEN 75
  WHEN 'expert'       THEN 95
  ELSE NULL
END
WHERE level IS NOT NULL AND level_pct IS NULL;

CREATE INDEX IF NOT EXISTS idx_skills_subcategory
  ON public.skills (user_id, category, subcategory, order_index);
