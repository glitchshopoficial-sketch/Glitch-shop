-- =========================================================
--  004 — TABLA profiles CON COLUMNA role (editable desde UI)
--  Project: Glitch Shop  |  Supabase (PostgreSQL)
--  =========================================================
--  Qué hace:
--   (1) Crea public.profiles con una columna `role`:
--         'super_admin'  ->  administrador
--         'customer'     ->  cliente normal
--   (2) Cada usuario NUEVO recibe su fila en profiles
--       automáticamente (trigger en auth.users).
--   (3) Al editar `role` desde el Table Editor, un trigger
--       sincroniza ese valor a auth.users.raw_app_meta_data,
--       que es lo que la app lee para saber si eres admin.
--   (4) Hace backfill de los usuarios ya existentes.
--
--  CÓMO USARLO DESDE EL DASHBOARD (sin escribir SQL nunca más):
--    Supabase -> Table Editor -> tabla `profiles`
--    -> en la columna `role` elige super_admin o customer.
--    El cambio aplica al CERRAR sesión y volver a entrar.
--
--  NOTA: no depende de las migraciones anteriores.
-- =========================================================

-- 1. Tipo enum para que la columna muestre un desplegable
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('super_admin', 'customer');
  END IF;
END $$;

-- 2. Tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  role        public.user_role NOT NULL DEFAULT 'customer',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. RLS: cada quien lee su propio perfil; el super_admin lee todos
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_read_all_super_admin" ON public.profiles;
CREATE POLICY "profiles_read_all_super_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM auth.users u
      WHERE u.id = auth.uid()
        AND COALESCE(u.raw_app_meta_data->>'role', '') = 'super_admin'
    )
  );

-- 4. Trigger: crear la fila de perfil cuando alguien se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.raw_app_meta_data->>'role' = 'super_admin'
        THEN 'super_admin'::public.user_role
      ELSE 'customer'::public.user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Trigger: sincronizar role -> auth.users.raw_app_meta_data (lo que lee la app)
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
        COALESCE(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object('role', NEW.role),
      updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_to_auth();

-- 6. Backfill: crea la fila de profile para los usuarios que YA existen
INSERT INTO public.profiles (id, email, role)
SELECT
  id,
  email,
  CASE
    WHEN raw_app_meta_data->>'role' = 'super_admin'
      THEN 'super_admin'::public.user_role
    ELSE 'customer'::public.user_role
  END
FROM auth.users
ON CONFLICT (id) DO NOTHING;
