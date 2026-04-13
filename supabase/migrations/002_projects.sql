-- ─────────────────────────────────────────────────────────────
-- Projects
-- ─────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack  TEXT[]       NOT NULL DEFAULT '{}',
  status      VARCHAR(50)  NOT NULL DEFAULT 'in_progress'
                CHECK (status IN ('idea', 'in_progress', 'completed', 'archived')),
  is_public   BOOLEAN      NOT NULL DEFAULT false,
  github_url  TEXT,
  live_url    TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_projects_user_id    ON projects (user_id);
CREATE INDEX idx_projects_public     ON projects (user_id, is_public);
CREATE INDEX idx_projects_tech_stack ON projects USING GIN (tech_stack);

-- ─────────────────────────────────────────────────────────────
-- Trigger updated_at (reutiliza la función de 001_jobs.sql)
-- ─────────────────────────────────────────────────────────────

-- Si la función set_updated_at ya existe de la migración anterior, skip:
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SELECT unificado:
--   • Owner (autenticado): ve todos sus proyectos
--   • Anónimo/otro usuario: ve sólo los que son públicos
--   Usar una sola política OR evita que un owner vea proyectos
--   públicos de OTROS usuarios en queries sin filtro de user_id.
CREATE POLICY "projects: select"
  ON projects FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "projects: insert own"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: update own"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "projects: delete own"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
