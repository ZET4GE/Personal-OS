-- ─────────────────────────────────────────────────────────────
-- Goals & Milestones
-- ─────────────────────────────────────────────────────────────

CREATE TABLE goals (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  category     VARCHAR(50)  NOT NULL DEFAULT 'personal',
  status       VARCHAR(20)  NOT NULL DEFAULT 'active',
  priority     VARCHAR(20)  NOT NULL DEFAULT 'medium',
  target_date  DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress     INTEGER      NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  icon         VARCHAR(50),
  color        VARCHAR(20)  NOT NULL DEFAULT 'blue',
  is_public    BOOLEAN      NOT NULL DEFAULT false,
  order_index  INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE milestones (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id      UUID         NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  is_completed BOOLEAN      NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  target_date  DATE,
  order_index  INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE goal_updates (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id    UUID  NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id    UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT  NOT NULL,
  mood       VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_goals_user     ON goals(user_id);
CREATE INDEX idx_goals_status   ON goals(status);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_milestones_goal     ON milestones(goal_id);
CREATE INDEX idx_goal_updates_goal   ON goal_updates(goal_id);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own goals"
  ON goals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public goals are viewable"
  ON goals FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users manage own milestones"
  ON milestones FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own updates"
  ON goal_updates FOR ALL
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_set_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_goals_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Progress recalculation trigger
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_goal_id            UUID;
  total_milestones     INTEGER;
  completed_milestones INTEGER;
  new_progress         INTEGER;
BEGIN
  v_goal_id := COALESCE(NEW.goal_id, OLD.goal_id);

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_completed = true)
  INTO total_milestones, completed_milestones
  FROM milestones
  WHERE goal_id = v_goal_id;

  IF total_milestones > 0 THEN
    new_progress := (completed_milestones * 100) / total_milestones;
  ELSE
    new_progress := 0;
  END IF;

  UPDATE goals
  SET
    progress     = new_progress,
    updated_at   = NOW(),
    status       = CASE
                     WHEN new_progress = 100 AND status = 'active' THEN 'completed'
                     ELSE status
                   END,
    completed_at = CASE
                     WHEN new_progress = 100 AND completed_at IS NULL THEN NOW()
                     ELSE completed_at
                   END
  WHERE id = v_goal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestone_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW EXECUTE FUNCTION calculate_goal_progress();
