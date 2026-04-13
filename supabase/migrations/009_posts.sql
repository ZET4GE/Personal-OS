-- ─────────────────────────────────────────────────────────────
-- 009_posts.sql — Blog posts públicos
-- ─────────────────────────────────────────────────────────────

CREATE TABLE posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL,
  excerpt      TEXT,
  content      TEXT NOT NULL,
  cover_image  TEXT,
  tags         TEXT[]   DEFAULT '{}',
  status       VARCHAR(20) DEFAULT 'draft',   -- draft | published | archived
  is_featured  BOOLEAN  DEFAULT false,
  reading_time INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, slug)
);

CREATE INDEX idx_posts_user_id      ON posts(user_id);
CREATE INDEX idx_posts_status       ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug         ON posts(slug);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Owner puede todo
CREATE POLICY "Users manage own posts"
  ON posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Público solo lee posts publicados
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- ─────────────────────────────────────────────────────────────
-- Función: generar slug único por usuario
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_post_slug(p_title TEXT, p_uid UUID)
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INTEGER := 0;
BEGIN
  base_slug  := LOWER(REGEXP_REPLACE(p_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug  := TRIM(BOTH '-' FROM base_slug);
  final_slug := base_slug;

  WHILE EXISTS (
    SELECT 1 FROM posts WHERE slug = final_slug AND user_id = p_uid
  ) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Función: calcular tiempo de lectura (~200 wpm)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_reading_time(p_content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql AS $$
BEGIN
  RETURN GREATEST(
    1,
    CEIL(ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(p_content), ' '), 1) / 200.0)::INTEGER
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Trigger: before INSERT OR UPDATE
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION posts_before_insert_update()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  -- Auto-slug si no se provee
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_post_slug(NEW.title, NEW.user_id);
  END IF;

  -- Recalcular reading_time
  NEW.reading_time := calculate_reading_time(NEW.content);

  -- Timestamp de actualización
  NEW.updated_at := NOW();

  -- published_at al primer cambio a 'published'
  IF NEW.status = 'published' AND (
    TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published'
  ) THEN
    IF NEW.published_at IS NULL THEN
      NEW.published_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_before_changes
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_before_insert_update();
