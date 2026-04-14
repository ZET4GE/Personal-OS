-- ─────────────────────────────────────────────────────────────
-- 011_integrations.sql — OAuth integrations (Google, GitHub)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE user_integrations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  provider         VARCHAR(50) NOT NULL,               -- 'google' | 'github'
  access_token     TEXT,
  refresh_token    TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope            TEXT,
  provider_user_id TEXT,
  provider_email   TEXT,
  metadata         JSONB       DEFAULT '{}',
  is_active        BOOLEAN     DEFAULT true,
  connected_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, provider)
);

CREATE INDEX idx_integrations_user     ON user_integrations(user_id);
CREATE INDEX idx_integrations_provider ON user_integrations(provider);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own integrations"
  ON user_integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger (reuses set_updated_at if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE FUNCTION set_updated_at()
    RETURNS TRIGGER LANGUAGE plpgsql AS $fn$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $fn$;
  END IF;
END
$$;

CREATE TRIGGER user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
