-- ─── profiles: eliminar columnas obsoletas ─────────────────────────────────
ALTER TABLE profiles DROP COLUMN IF EXISTS birth_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS availability;
DROP TYPE IF EXISTS cv_availability CASCADE;

-- profiles: campos nuevos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_types TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_detail TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS open_to_travel BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_vehicle BOOLEAN NOT NULL DEFAULT false;

-- ─── skills: reemplazar nivel porcentual por nivel cualitativo ─────────────
ALTER TABLE skills DROP COLUMN IF EXISTS level;
ALTER TABLE skills DROP COLUMN IF EXISTS level_pct;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS skill_level TEXT
  CHECK (skill_level IS NULL OR skill_level IN ('solid', 'operative', 'learning'));

-- ─── cv_courses: soporte para estudios en curso ───────────────────────────
ALTER TABLE cv_courses ADD COLUMN IF NOT EXISTS is_in_progress BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE cv_courses ADD COLUMN IF NOT EXISTS expected_completion_date DATE;

-- ─── cv_highlights: logros destacados ────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_highlights (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  icon              TEXT,
  title             TEXT        NOT NULL,
  body              TEXT,
  order_index       INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cv_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_highlights" ON cv_highlights
  USING (user_id = auth.uid());

CREATE POLICY "public_read_highlights" ON cv_highlights
  FOR SELECT USING (true);

-- ─── learning_roadmaps: timestamp de actualización ───────────────────────
ALTER TABLE learning_roadmaps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
UPDATE learning_roadmaps SET updated_at = created_at WHERE updated_at IS NULL;
