/* =========================================================
   002 — PROMOVER USUARIO A SUPER ADMINISTRADOR
   Project: Glitch Shop  |  Supabase (PostgreSQL)
   =========================================================
   ¿CÓMO USARLO?
   1. Entra a tu Supabase Dashboard:
      https://supabase.com/dashboard/project/swaoqmumbyofrnmhlgxr
   2. Abre el menú → SQL Editor (icono </>).
   3. Crea una "New query" y PEGA TODO este archivo.
   4. ANTES DE EJECUTAR: cambia 'glitchshopoficial@gmail.com' (abajo)
      por el correo que usaste al registrar tu cuenta de administrador.
   5. Ejecuta RUN (►).
   6. Sal de tu sesión en la tienda (Cerrar sesión) y vuelve a INICIAR SESIÓN —
      ya verás el badge dorado "Super Admin" y el botón "Panel administrador"
      en el popover de perfil.
   =========================================================
   NOTA DE SEGURIDAD:
   El role 'super_admin' se lee ÚNICAMENTE del campo raw_app_meta_data
   de auth.users. NUNCA se hardcodea un correo en el código del frontend
   (script.js) — por lo tanto, si en el futuro quieres agregar OTRO
   administrador, solo tienes que volver a correr este query cambiando
   el email.
   ========================================================= */

/* ----------  CONFIGURA AQUÍ EL CORREO DEL ADMIN  ---------- */
DO $$
DECLARE
  target_email TEXT := 'glitchshopoficial@gmail.com';  /* ⚙️  CAMBIA ESTE VALOR POR TU CORREO REAL */
  target_uid   UUID;
BEGIN
  /* Buscar el ID del usuario en auth.users */
  SELECT id INTO target_uid
  FROM auth.users
  WHERE LOWER(email) = LOWER(target_email);

  IF target_uid IS NULL THEN
    RAISE NOTICE '
    ⚠️  NO SE ENCONTRÓ NINGÚN USUARIO CON EL CORREO: %
    
    ¿Qué hacer?
      1. Primero REGÍSTRATE en la tienda (login.html → Crear cuenta)
         con el correo que quieres que sea admin.
      2. Confirma tu correo (llega el link de Supabase).
      3. Vuelve a ejecutar este SQL.
    ', target_email;
  ELSE
    /* ✅ Asignar role = 'super_admin' en raw_app_meta_data */
    UPDATE auth.users
    SET
      raw_app_meta_data =
        COALESCE(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object('role', 'super_admin'),
      updated_at = NOW()
    WHERE id = target_uid;

    RAISE NOTICE '
    ✅  USUARIO PROMOVIDO A SUPER ADMINISTRADOR
    -------------------------------------------------
    ID:       %
    Email:    %
    
    📋  Pasos siguientes:
      1. En la tienda → Cerrar sesión (si es que la tienes abierta).
      2. Volver a Iniciar sesión con %.
      3. Al abrir el popover de perfil → badge 👑 SUPER ADMIN + botón
         "Panel administrador" que abre admin.html en pestaña nueva.
    ', target_uid, target_email, target_email;
  END IF;
END $$;

/* =========================================================
   (OPCIONAL) VERIFICAR QUE EL ROLE SE ASIGNÓ CORRECTAMENTE
   ========================================================= */
SELECT
  id,
  email,
  raw_app_meta_data->>'role' AS current_role,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE LOWER(email) = LOWER('glitchshopoficial@gmail.com');   /* ← mismo correo de arriba */

/* =========================================================
   (OPCIONAL 2) — QUITAR PRIVILEGIOS A UN ADMIN
   Si en el futuro quieres QUITARLE los privilegios a alguien:
   
   UPDATE auth.users
   SET raw_app_meta_data = raw_app_meta_data - 'role'
   WHERE LOWER(email) = LOWER('correo@a_quitar.com');
   ========================================================= */
