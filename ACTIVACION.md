# Activación de cambios

Sitio: https://glitch-shop-official.vercel.app

## Verificación de cuenta

El registro ya envía `emailRedirectTo` al origen actual + `/index.html`.
La recuperación usa el origen actual + `/login.html?tab=reset`.
En Supabase → Authentication → URL Configuration:

- Site URL: `https://glitch-shop-official.vercel.app`
- Redirect URLs: `https://glitch-shop-official.vercel.app/**`

Revisar que las plantillas de confirmación y recuperación enlacen a
`{{ .ConfirmationURL }}` y que no tengan una dirección localhost escrita a mano.
Solicitar un correo nuevo después de guardar la configuración y probar registro
y recuperación desde el sitio público. Los enlaces ya enviados no se corrigen.

Documentación: https://supabase.com/docs/guides/auth/redirect-urls

## Suscripciones

Ejecutar `supabase/migrations/008_newsletter.sql` en el editor SQL del proyecto.
El formulario guarda correos en `public.newsletter_subscribers`; evita duplicados
y no permite leer correos desde el navegador. El envío de campañas aún requiere
conectar un proveedor de correo. Las bajas solicitadas por WhatsApp deben ser
atendidas por la tienda antes de enviar nuevas campañas.

## Publicación y comprobación

Ejecutar `node --test tests/*.test.cjs` y `npm run build`, y publicar el resultado
en el proyecto existente de Vercel. Probar búsqueda desde inicio y catálogo,
combinación y limpieza de filtros, favoritos tras recargar, y suscripción con
un correo de prueba autorizado. La confirmación solo aparece si Supabase responde
sin error; un fallo conserva el correo para reintentar.
