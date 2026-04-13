-- ─────────────────────────────────────────────────────────────
-- Profiles
-- ─────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id           UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     VARCHAR(50)  UNIQUE NOT NULL,
  full_name    VARCHAR(255),
  bio          TEXT,
  avatar_url   TEXT,
  location     VARCHAR(100),
  website      TEXT,
  github_url   TEXT,
  linkedin_url TEXT,
  twitter_url  TEXT,
  is_public    BOOLEAN      NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_public   ON profiles (is_public);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();  -- función de 001_jobs.sql

-- ─────────────────────────────────────────────────────────────
-- Trigger: crea perfil automáticamente al registrarse
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER   -- bypasa RLS para poder escribir en profiles
SET search_path = public
AS $$
DECLARE
  base_username  TEXT;
  final_username TEXT;
  suffix         INT := 0;
BEGIN
  -- Derivar username desde full_name o parte local del email
  base_username := LOWER(
    REGEXP_REPLACE(
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  );

  -- Quitar guiones al inicio/final y truncar a 40 chars
  base_username := TRIM(BOTH '-' FROM base_username);
  base_username := LEFT(base_username, 40);

  -- Fallback si quedó vacío
  IF base_username = '' OR LENGTH(base_username) < 3 THEN
    base_username := 'user';
  END IF;

  -- Garantizar unicidad
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || '-' || suffix;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    final_username,
    NEW.raw_user_meta_data->>'full_name'
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT unificado:
--   • Owner: siempre ve su propio perfil (incluso privado)
--   • Todos: sólo perfiles con is_public = true
CREATE POLICY "profiles: select"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_public = true);

-- UPDATE: solo el owner
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- INSERT: el trigger usa SECURITY DEFINER, no hace falta policy.
-- Por seguridad, bloqueamos INSERT desde el cliente:
CREATE POLICY "profiles: no client insert"
  ON profiles FOR INSERT
  WITH CHECK (false);
