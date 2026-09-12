-- =========================================================
--  007 - ARREGLO DE SECUENCIA + VERIFICACION DE VISIBILIDAD
--  Project: Glitch Shop  |  Supabase (PostgreSQL)
--  =========================================================
--  PROBLEMA: "Agrego un producto y solo aparece en el panel
--  admin, no en la tienda publica".
--
--  CAUSA 1 (principal): la secuencia products_id_seq quedo
--  en 1 porque el seed inserto los 36 productos con id
--  explicito (1..36), lo cual NO avanza la secuencia. Al
--  insertar un producto nuevo, nextval devuelve un id que
--  choca, o el producto no queda bien referenciado.
--
--  CAUSA 2: el producto puede haberse guardado con
--  stock = 'soldout' (la opcion "No publicado"), y la
--  politica RLS publica oculta los productos soldout.
--
--  QUE HACE ESTE ARCHIVO:
--    (1) Resetea la secuencia al max(id) actual.
--    (2) Te muestra una consulta para revisar que tus
--        productos esten en stock visible.
-- =========================================================

-- ---------- (1) ARREGLAR SECUENCIA ----------
SELECT setval(
  'public.products_id_seq',
  (SELECT COALESCE(MAX(id), 1) FROM public.products),
  true
);

-- ---------- (2) VERIFICAR VISIBILIDAD ----------
-- Ejecuta esto aparte (o el bloque completo) para ver el estado
-- real de tus productos. La columna "visible" te dice si el
-- producto sale en la tienda publica (stock != soldout).
SELECT
  id,
  title,
  stock,
  category_id,
  platform_id,
  CASE WHEN stock = 'soldout' THEN 'NO visible' ELSE 'visible' END AS visibilidad
FROM public.products
ORDER BY id DESC
LIMIT 10;
