-- ─────────────────────────────────────────────────────────────
-- Fix: políticas RLS de profiles
--
-- Problema raíz: updateProfile() usa .upsert() que genera
-- INSERT ... ON CONFLICT DO UPDATE. PostgreSQL evalúa la
-- política INSERT antes de detectar el conflicto, así que
-- la policy "no client insert" bloqueaba TODAS las escrituras
-- desde el cliente, incluso cuando el perfil ya existía.
--
-- Fix:
--   1. Reemplazar la policy de INSERT por una que permita
--      al usuario insertar su propio perfil (auth.uid() = id).
--   2. Añadir WITH CHECK al UPDATE para simetría.
--   3. Backfill de perfiles para usuarios sin row en profiles.
--   4. Recrear el trigger (más robusto: ON CONFLICT DO NOTHING).
-- ─────────────────────────────────────────────────────────────


-- ── 1. Corregir políticas RLS ────────────────────────────────

-- Eliminar la policy que bloqueaba todo INSERT desde cliente
DROP POLICY IF EXISTS "profiles: no client insert" ON profiles;

-- Permitir que el usuario cree su propio perfil
-- (necesario para upsert cuando el trigger no lo creó aún)
CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Reemplazar UPDATE para incluir WITH CHECK explícito
DROP POLICY IF EXISTS "profiles: update own" ON profiles;

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── 2. Backfill: crear perfiles para usuarios sin row ────────
--
-- Aplica la misma lógica de username del trigger:
-- full_name → email local → 'user', garantizando unicidad.

DO $$
DECLARE
  u              RECORD;
  base_username  TEXT;
  final_username TEXT;
  suffix         INT;
BEGIN
  FOR u IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM   auth.users au
    WHERE  NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = au.id
    )
  LOOP
    suffix := 0;

    base_username := LOWER(
      REGEXP_REPLACE(
        COALESCE(
          u.raw_user_meta_data->>'full_name',
          SPLIT_PART(u.email, '@', 1)
        ),
        '[^a-z0-9]+', '-', 'g'
      )
    );
    base_username := TRIM(BOTH '-' FROM base_username);
    base_username := LEFT(base_username, 40);

    IF base_username = '' OR LENGTH(base_username) < 3 THEN
      base_username := 'user';
    END IF;

    final_username := base_username;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
      suffix        := suffix + 1;
      final_username := base_username || '-' || suffix;
    END LOOP;

    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
      u.id,
      final_username,
      u.raw_user_meta_data->>'full_name'
    );

    RAISE NOTICE 'Perfil creado para % → username: %', u.email, final_username;
  END LOOP;
END;
$$;


-- ── 3. Recrear trigger más robusto ───────────────────────────
--
-- ON CONFLICT (id) DO NOTHING evita errores si la race condition
-- hiciera que el perfil ya existiera al ejecutar el trigger.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username  TEXT;
  final_username TEXT;
  suffix         INT := 0;
BEGIN
  base_username := LOWER(
    REGEXP_REPLACE(
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  );
  base_username := TRIM(BOTH '-' FROM base_username);
  base_username := LEFT(base_username, 40);

  IF base_username = '' OR LENGTH(base_username) < 3 THEN
    base_username := 'user';
  END IF;

  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix        := suffix + 1;
    final_username := base_username || '-' || suffix;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    final_username,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;   -- ← más seguro que sin ON CONFLICT

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
