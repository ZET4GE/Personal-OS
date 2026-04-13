-- ─────────────────────────────────────────────────────────────
-- 004_cv.sql — Tablas de CV: experiencia laboral, educación y skills
-- ─────────────────────────────────────────────────────────────

-- ── Experiencia laboral ──────────────────────────────────────

CREATE TABLE work_experience (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company     VARCHAR(255) NOT NULL,
  role        VARCHAR(255) NOT NULL,
  description TEXT,
  start_date  DATE        NOT NULL,
  end_date    DATE,                   -- NULL = presente
  is_current  BOOLEAN     NOT NULL DEFAULT false,
  location    VARCHAR(100),
  order_index INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

-- Propietario: acceso completo
CREATE POLICY "owner_all_work_experience" ON work_experience
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Público: lectura si el perfil es público
CREATE POLICY "public_read_work_experience" ON work_experience
  FOR SELECT USING (
    (SELECT is_public FROM profiles WHERE id = user_id) = true
  );

-- ── Educación ────────────────────────────────────────────────

CREATE TABLE education (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree      VARCHAR(255) NOT NULL,
  field       VARCHAR(255),
  start_date  DATE,
  end_date    DATE,
  description TEXT,
  order_index INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_education" ON education
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_read_education" ON education
  FOR SELECT USING (
    (SELECT is_public FROM profiles WHERE id = user_id) = true
  );

-- ── Skills ───────────────────────────────────────────────────

CREATE TABLE skills (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  category    VARCHAR(50)  NOT NULL DEFAULT 'technical'
                CHECK (category IN ('technical', 'soft', 'language', 'tool')),
  level       VARCHAR(20)
                CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  order_index INTEGER     NOT NULL DEFAULT 0
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_skills" ON skills
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_read_skills" ON skills
  FOR SELECT USING (
    (SELECT is_public FROM profiles WHERE id = user_id) = true
  );

-- ── Índices ──────────────────────────────────────────────────

CREATE INDEX idx_work_experience_user_id ON work_experience (user_id, order_index);
CREATE INDEX idx_education_user_id       ON education        (user_id, order_index);
CREATE INDEX idx_skills_user_id          ON skills           (user_id, category, order_index);
