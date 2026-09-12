-- =========================================================
--  006 — GRANTS + POLÍTICAS (arreglo definitivo de permisos)
--  Project: Glitch Shop  |  Supabase (PostgreSQL)
--  =========================================================
--  PROBLEMA: "permission denied for table products"
--  Al editar/borrar/crear productos desde el panel admin.
--
--  CAUSA: las tablas creadas por SQL Editor no siempre reciben
--  automáticamente el permiso de escritura (GRANT) para el rol
--  `authenticated`, que es el que usa tu app cuando el usuario
--  inicia sesión. RLS puede estar bien, pero sin GRANT la
--  escritura se bloquea ANTES de llegar a las políticas.
--
--  SOLUCIÓN (idempotente, se puede ejecutar varias veces):
--    (1) Dar permisos (GRANT) a los roles de Supabase.
--    (2) Recrear la función is_super_admin() para que lea
--        el rol desde profiles O desde raw_app_meta_data.
--    (3) Recrear las políticas CRUD de administrador.
-- =========================================================

-- ---------- (1) GRANTS ----------
-- Acceso al esquema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Lectura pública (catálogo) para anon y authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Escritura para usuarios logueados (protegida por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Acceso total para service_role (usado por el backend / Edge Functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Secuencias (necesarias para INSERT con id SERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role;

-- Funciones
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon, service_role;

-- Para tablas que se creen en el futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, anon, service_role;

-- ---------- (2) FUNCIÓN is_super_admin robusta ----------
-- Acepta como admin a quien tenga el rol en `profiles.role`
-- O en auth.users.raw_app_meta_data. Cualquiera de las dos basta.
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Vía 1: tabla profiles (la que editas en el Table Editor)
  IF EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'super_admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Vía 2: metadata de auth.users (lo que lee el JWT)
  RETURN EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = uid
      AND COALESCE(u.raw_app_meta_data->>'role', '') = 'super_admin'
  );
END;
$$;

-- ---------- (3) POLÍTICAS CRUD (idempotente) ----------
DROP POLICY IF EXISTS "Admin CRUD categories" ON public.categories;
CREATE POLICY "Admin CRUD categories"
    ON public.categories FOR ALL
    USING (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin CRUD platforms" ON public.platforms;
CREATE POLICY "Admin CRUD platforms"
    ON public.platforms FOR ALL
    USING (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin CRUD products" ON public.products;
CREATE POLICY "Admin CRUD products"
    ON public.products FOR ALL
    USING (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin CRUD featured products" ON public.featured_products;
CREATE POLICY "Admin CRUD featured products"
    ON public.featured_products FOR ALL
    USING (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_super_admin(auth.uid()));

-- ---------- (4) Sincronizar roles existentes ----------
-- Por si el trigger de la migración 004 no llegó a copiar el rol
-- desde profiles hacia auth.users.raw_app_meta_data.
UPDATE auth.users u
SET raw_app_meta_data =
      COALESCE(u.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', p.role),
    updated_at = now()
FROM public.profiles p
WHERE p.id = u.id
  AND COALESCE(u.raw_app_meta_data->>'role', '') IS DISTINCT FROM p.role::text;
