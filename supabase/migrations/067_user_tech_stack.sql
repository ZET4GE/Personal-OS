-- ─── user_tech_stack: showcase visual de tecnologías ────────────────────────
CREATE TABLE IF NOT EXISTS user_tech_stack (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tech_name     TEXT        NOT NULL,
  tech_slug     TEXT        NOT NULL,
  category      TEXT        NOT NULL CHECK (category IN ('language','framework','tool','platform','vendor','other')),
  display_order INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_tech_stack_user_id_idx ON user_tech_stack (user_id, display_order);

ALTER TABLE user_tech_stack ENABLE ROW LEVEL SECURITY;

-- owner: full CRUD
CREATE POLICY "owner_tech_stack" ON user_tech_stack
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- public: can read (for the public CV page)
CREATE POLICY "public_read_tech_stack" ON user_tech_stack
  FOR SELECT USING (true);
