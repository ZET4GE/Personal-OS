-- ─────────────────────────────────────────────────────────────
-- Analytics — Page Views
-- ─────────────────────────────────────────────────────────────

CREATE TABLE page_views (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          REFERENCES auth.users(id) ON DELETE CASCADE, -- dueño del contenido
  page_type   VARCHAR(50)   NOT NULL,    -- 'profile' | 'project' | 'cv'
  page_id     UUID,                      -- id del proyecto si aplica, null para profile/cv
  visitor_id  TEXT,                      -- fingerprint anónimo (hash SHA-256 de IP+UA)
  referrer    TEXT,
  user_agent  TEXT,
  country     VARCHAR(100),
  city        VARCHAR(100),
  viewed_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_user_id   ON page_views (user_id);
CREATE INDEX idx_page_views_viewed_at ON page_views (viewed_at);
CREATE INDEX idx_page_views_page_type ON page_views (user_id, page_type);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- El owner ve sus propias analytics
CREATE POLICY "analytics: select own"
  ON page_views FOR SELECT
  USING (auth.uid() = user_id);

-- Cualquiera puede registrar una vista (visitor anónimo)
CREATE POLICY "analytics: insert any"
  ON page_views FOR INSERT
  WITH CHECK (true);
