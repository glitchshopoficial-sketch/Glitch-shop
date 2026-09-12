-- =========================================================
--  005 — ARREGLO DE PERMISOS ADMIN (editar / borrar productos)
--  Project: Glitch Shop  |  Supabase (PostgreSQL)
--  =========================================================
--  PROBLEMA que resuelve:
--    El panel reconoce al admin (por el JWT), pero al EDITAR
--    o BORRAR un producto Supabase responde con error de RLS.
--    Causa: la función is_super_admin() solo miraba
--    auth.users.raw_app_meta_data, y ese campo a veces no
--    estaba sincronizado con la tabla `profiles` que editas
--    en el Table Editor.
--
--  SOLUCIÓN:
--    (1) Recrea is_super_admin() para que acepte como admin
--        a quien tenga el rol en `profiles.role` O en
--        raw_app_meta_data (cualquiera de las dos basta).
--    (2) Recrea las políticas CRUD de products, categories,
--        platforms y featured_products usando esa función.
--
--  CÓMO USARLO:
--    Supabase -> SQL Editor -> New query -> pegar TODO -> Run.
--    Después CIERRA SESIÓN y vuelve a entrar con el admin.
-- =========================================================

-- 1. Función robusta: admin si profiles.role = super_admin
--    O si raw_app_meta_data->role = super_admin.
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

  -- Vía 1: la tabla profiles (la que editas en el Table Editor)
  IF EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'super_admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Vía 2: el metadata de auth.users (lo que lee el JWT)
  RETURN EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = uid
      AND COALESCE(u.raw_app_meta_data->>'role', '') = 'super_admin'
  );
END;
$$;

-- 2. Recrear políticas CRUD (idempotente: DROP + CREATE)
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

-- 3. (Opcional) Sincronizar AHORA los roles existentes desde profiles
--    hacia auth.users.raw_app_meta_data, por si el trigger falló antes.
UPDATE auth.users u
SET raw_app_meta_data =
      COALESCE(u.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', p.role),
    updated_at = now()
FROM public.profiles p
WHERE p.id = u.id
  AND COALESCE(u.raw_app_meta_data->>'role', '') IS DISTINCT FROM p.role::text;
