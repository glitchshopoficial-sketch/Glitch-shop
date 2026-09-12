-- =========================================================
--  003 — MIEMBROS + ALMACENAMIENTO DE IMÁGENES DE PRODUCTOS
--  Project: Glitch Shop  |  Supabase (PostgreSQL)
--  ---------------------------------------------------------
--  Qué agrega este archivo:
--    (1) Función RPC  public.get_members()
--        -> permite al super_admin listar a los usuarios
--           registrados (email, nombre, rol, fechas) desde el
--           panel de administración.
--    (2) Bucket de Storage  product-images  (público)
--        -> para subir las fotos de los productos desde el panel.
--        + políticas: todo el mundo puede VER, solo el admin puede
--          subir / reemplazar / borrar.
-- =========================================================

-- ¿CÓMO USARLO?
--   1. Entra a tu Supabase Dashboard:
--      https://supabase.com/dashboard/project/swaoqmumbyofrnmhlgxr
--   2. Abre el menú -> SQL Editor (icono </>).
--   3. Crea una "New query" y PEGA TODO este archivo.
--   4. Ejecuta (Run). Listo.

-- ---------------------------------------------------------------
-- (1) Función RPC para LISTAR MIEMBROS (solo super_admin)
--     auth.users es una tabla interna de Supabase Auth que NO se
--     puede consultar directo desde el navegador. Esta función
--     corre como "definer" y solo devuelve datos si quien llama
--     es super_admin (revisa raw_app_meta_data.role).
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_members()
RETURNS TABLE (
    id               uuid,
    email            text,
    name             text,
    role             text,
    created_at       timestamptz,
    last_sign_in_at  timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_super_admin(auth.uid()) THEN
        RAISE EXCEPTION 'No autorizado: se requiere rol super_admin'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.email,
        COALESCE(u.raw_user_meta_data->>'name',
                 split_part(u.email, '@', 1)) AS name,
        COALESCE(u.raw_app_meta_data->>'role', 'customer') AS role,
        u.created_at,
        u.last_sign_in_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- Solo usuarios autenticados pueden llamarla (la función misma valida
-- que además sea super_admin).
REVOKE ALL ON FUNCTION public.get_members() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_members() TO authenticated;

-- ---------------------------------------------------------------
-- (2) Bucket de Storage  product-images  (público)
-- ---------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública: cualquier visitante puede ver las fotos.
DROP POLICY IF EXISTS "product-images public read" ON storage.objects;
CREATE POLICY "product-images public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

-- Escritura: solo el super_admin autenticado puede subir.
DROP POLICY IF EXISTS "product-images admin insert" ON storage.objects;
CREATE POLICY "product-images admin insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND public.is_super_admin(auth.uid()));

-- Reemplazo / actualización: solo super_admin.
DROP POLICY IF EXISTS "product-images admin update" ON storage.objects;
CREATE POLICY "product-images admin update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images' AND public.is_super_admin(auth.uid()))
    WITH CHECK (bucket_id = 'product-images' AND public.is_super_admin(auth.uid()));

-- Borrado: solo super_admin.
DROP POLICY IF EXISTS "product-images admin delete" ON storage.objects;
CREATE POLICY "product-images admin delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images' AND public.is_super_admin(auth.uid()));
