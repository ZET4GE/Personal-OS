-- ─────────────────────────────────────────────────────────────
-- Habits
-- ─────────────────────────────────────────────────────────────

CREATE TABLE habits (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           VARCHAR(255)  NOT NULL,
  description    TEXT,
  icon           VARCHAR(50),
  color          VARCHAR(20)   NOT NULL DEFAULT 'blue',
  frequency      VARCHAR(20)   NOT NULL DEFAULT 'daily'
                   CHECK (frequency IN ('daily', 'weekly', 'weekdays')),
  target_days    INTEGER[]     NOT NULL DEFAULT '{1,2,3,4,5,6,0}',
  reminder_time  TIME,
  is_active      BOOLEAN       NOT NULL DEFAULT true,
  order_index    INTEGER       NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE habit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id     UUID        NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at DATE        NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  UNIQUE (habit_id, completed_at)
);

-- ─────────────────────────────────────────────────────────────
-- Routines
-- ─────────────────────────────────────────────────────────────

CREATE TABLE routines (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               VARCHAR(255) NOT NULL,
  description        TEXT,
  time_of_day        VARCHAR(20)  NOT NULL DEFAULT 'morning'
                       CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
  estimated_minutes  INTEGER,
  is_active          BOOLEAN      NOT NULL DEFAULT true,
  order_index        INTEGER      NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE routine_items (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id       UUID         NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  duration_minutes INTEGER,
  order_index      INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE routine_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id      UUID        NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at    DATE        NOT NULL DEFAULT CURRENT_DATE,
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  completed_items UUID[]      NOT NULL DEFAULT '{}',
  UNIQUE (routine_id, completed_at)
);

-- ─────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────

CREATE INDEX idx_habits_user_id         ON habits (user_id);
CREATE INDEX idx_habit_logs_habit_date  ON habit_logs (habit_id, completed_at);
CREATE INDEX idx_habit_logs_user_date   ON habit_logs (user_id, completed_at);
CREATE INDEX idx_routines_user_id       ON routines (user_id);
CREATE INDEX idx_routine_items_routine  ON routine_items (routine_id);
CREATE INDEX idx_routine_logs_date      ON routine_logs (routine_id, completed_at);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

ALTER TABLE habits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_logs  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits: all own"
  ON habits FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_logs: all own"
  ON habit_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines: all own"
  ON routines FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routine_items: all own"
  ON routine_items FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routine_logs: all own"
  ON routine_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
