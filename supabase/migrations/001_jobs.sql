-- ─────────────────────────────────────────────────────────────
-- Job Applications
-- ─────────────────────────────────────────────────────────────

CREATE TABLE job_applications (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company     VARCHAR(255) NOT NULL,
  role        VARCHAR(255) NOT NULL,
  status      VARCHAR(50)  NOT NULL DEFAULT 'applied'
                CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
  link        TEXT,
  notes       TEXT,
  applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índice para filtros por usuario (RLS lo necesita internamente igual)
CREATE INDEX idx_job_applications_user_id ON job_applications (user_id);
CREATE INDEX idx_job_applications_status  ON job_applications (user_id, status);

-- ─────────────────────────────────────────────────────────────
-- Trigger: actualiza updated_at automáticamente
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve sólo sus propios registros
CREATE POLICY "jobs: select own"
  ON job_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Solo puede insertar con su propio user_id
CREATE POLICY "jobs: insert own"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo puede modificar sus propios registros
CREATE POLICY "jobs: update own"
  ON job_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo puede borrar sus propios registros
CREATE POLICY "jobs: delete own"
  ON job_applications FOR DELETE
  USING (auth.uid() = user_id);
