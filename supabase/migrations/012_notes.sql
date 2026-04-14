-- ─────────────────────────────────────────────────────────────
-- 012_notes.sql — Sistema de Notas/Wiki con Markdown
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- Carpetas
-- ─────────────────────────────────────────────────────────────

CREATE TABLE note_folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20)  DEFAULT 'default',   -- default | red | orange | yellow | green | blue | purple | pink
  icon        VARCHAR(50)  DEFAULT NULL,         -- nombre de ícono lucide opcional
  parent_id   UUID REFERENCES note_folders(id) ON DELETE SET NULL,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_note_folders_user_id   ON note_folders(user_id);
CREATE INDEX idx_note_folders_parent_id ON note_folders(parent_id);

-- ─────────────────────────────────────────────────────────────
-- Notas
-- ─────────────────────────────────────────────────────────────

CREATE TABLE notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id    UUID REFERENCES note_folders(id) ON DELETE SET NULL,
  title        VARCHAR(255)  NOT NULL DEFAULT 'Sin título',
  slug         VARCHAR(255)  NOT NULL DEFAULT '',
  content      TEXT          NOT NULL DEFAULT '',
  excerpt      TEXT          GENERATED ALWAYS AS (LEFT(content, 200)) STORED,
  tags         TEXT[]        DEFAULT '{}',
  is_pinned    BOOLEAN       DEFAULT false,
  is_archived  BOOLEAN       DEFAULT false,
  is_public    BOOLEAN       DEFAULT false,   -- wiki público
  word_count   INTEGER       DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, slug)
);

CREATE INDEX idx_notes_user_id    ON notes(user_id);
CREATE INDEX idx_notes_folder_id  ON notes(folder_id);
CREATE INDEX idx_notes_is_public  ON notes(is_public) WHERE is_public = true;
CREATE INDEX idx_notes_is_pinned  ON notes(is_pinned, user_id);
CREATE INDEX idx_notes_tags       ON notes USING GIN(tags);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- Full-text search index (Spanish + English)
CREATE INDEX idx_notes_fts ON notes
  USING GIN(to_tsvector('spanish', COALESCE(title, '') || ' ' || COALESCE(content, '')));

-- ─────────────────────────────────────────────────────────────
-- Wiki-links entre notas
-- ─────────────────────────────────────────────────────────────

CREATE TABLE note_links (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  target_note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (source_note_id, target_note_id)
);

CREATE INDEX idx_note_links_source ON note_links(source_note_id);
CREATE INDEX idx_note_links_target ON note_links(target_note_id);

-- ─────────────────────────────────────────────────────────────
-- RLS — note_folders
-- ─────────────────────────────────────────────────────────────

ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own folders"
  ON note_folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- RLS — notes
-- ─────────────────────────────────────────────────────────────

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view public notes"
  ON notes FOR SELECT
  USING (is_public = true);

-- ─────────────────────────────────────────────────────────────
-- RLS — note_links
-- ─────────────────────────────────────────────────────────────

ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own note links"
  ON note_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_links.source_note_id
        AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view links of public notes"
  ON note_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_links.source_note_id
        AND notes.is_public = true
    )
  );

-- ─────────────────────────────────────────────────────────────
-- Función: generar slug único por usuario
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_note_slug(p_title TEXT, p_uid UUID)
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INTEGER := 0;
BEGIN
  base_slug  := LOWER(REGEXP_REPLACE(p_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug  := TRIM(BOTH '-' FROM base_slug);
  IF base_slug = '' THEN
    base_slug := 'nota';
  END IF;
  final_slug := base_slug;

  WHILE EXISTS (
    SELECT 1 FROM notes WHERE slug = final_slug AND user_id = p_uid
  ) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Trigger: before INSERT OR UPDATE on notes
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notes_before_insert_update()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  -- Auto-slug si no se provee o está vacío
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_note_slug(NEW.title, NEW.user_id);
  END IF;

  -- word_count aproximado
  NEW.word_count := ARRAY_LENGTH(
    STRING_TO_ARRAY(TRIM(REGEXP_REPLACE(NEW.content, '\s+', ' ', 'g')), ' '),
    1
  );
  IF NEW.word_count IS NULL THEN
    NEW.word_count := 0;
  END IF;

  -- Timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER notes_before_changes
  BEFORE INSERT OR UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION notes_before_insert_update();

-- ─────────────────────────────────────────────────────────────
-- Trigger: updated_at para note_folders
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER note_folders_updated_at
  BEFORE UPDATE ON note_folders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Función FTS: buscar notas de un usuario
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_notes(p_uid UUID, p_query TEXT)
RETURNS TABLE (
  id           UUID,
  title        TEXT,
  slug         TEXT,
  excerpt      TEXT,
  tags         TEXT[],
  folder_id    UUID,
  is_pinned    BOOLEAN,
  is_archived  BOOLEAN,
  is_public    BOOLEAN,
  updated_at   TIMESTAMPTZ,
  rank         REAL
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT
      n.id,
      n.title::TEXT,
      n.slug::TEXT,
      n.excerpt::TEXT,
      n.tags,
      n.folder_id,
      n.is_pinned,
      n.is_archived,
      n.is_public,
      n.updated_at,
      ts_rank(
        to_tsvector('spanish', COALESCE(n.title, '') || ' ' || COALESCE(n.content, '')),
        plainto_tsquery('spanish', p_query)
      ) AS rank
    FROM notes n
    WHERE n.user_id = p_uid
      AND to_tsvector('spanish', COALESCE(n.title, '') || ' ' || COALESCE(n.content, ''))
          @@ plainto_tsquery('spanish', p_query)
    ORDER BY rank DESC, n.updated_at DESC
    LIMIT 20;
END;
$$;
