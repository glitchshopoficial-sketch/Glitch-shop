-- =========================================================
--  GLITCH SHOP — Supabase Database Schema (PostgreSQL)
--  Tablas: categories, platforms, products, cart_items,
--          featured_products, orders (para WhatsApp)
--  Auth users = auth.users (tabla built-in de Supabase Auth)
--  Roles: super_admin (propietario) / customer (cliente)
-- =========================================================

-- ----------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------
-- 1. TABLA: categories (catálogo navegable)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,          -- 'consolas' | 'juegos' | 'accesorios' | 'merch'
    name        TEXT NOT NULL,                 -- 'Consolas'
    icon_name   TEXT NOT NULL,                 -- Material Icon ligature: 'sports_esports'
    sort_order  INT NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------
-- 2. TABLA: platforms (PlayStation, Xbox, Nintendo, PC)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platforms (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,          -- 'playstation' | 'xbox' | 'nintendo' | 'pc'
    name        TEXT NOT NULL,
    css_class   TEXT NOT NULL                  -- 'platform-ps' | 'platform-xbox' | ...
);

-- ----------------------------------------------------------------
-- 3. TABLA: products (36 productos del inventario actual)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    sku             TEXT,
    emoji           TEXT,                       -- placeholder visual mientras suben imágenes
    image_url       TEXT,                       -- ruta en Supabase Storage bucket 'product-images'
    category_id     INT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    platform_id     INT NOT NULL REFERENCES public.platforms(id) ON DELETE RESTRICT,
    platform_label  TEXT NOT NULL,              -- 'PS5 PRO'
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    old_price       NUMERIC(10,2) CHECK (old_price IS NULL OR old_price >= 0),
    stock           TEXT NOT NULL DEFAULT 'available' CHECK (stock IN ('available','low','soldout')),
    is_offer        BOOLEAN NOT NULL DEFAULT FALSE,
    is_new          BOOLEAN NOT NULL DEFAULT FALSE,
    description     TEXT,
    weight_kg       NUMERIC(6,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_platform ON public.products(platform_id);
CREATE INDEX IF NOT EXISTS idx_products_offer    ON public.products(is_offer) WHERE is_offer = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_stock    ON public.products(stock);

-- Trigger auto-updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

DROP TRIGGER IF EXISTS products_update_ts ON public.products;
CREATE TRIGGER products_update_ts
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ----------------------------------------------------------------
-- 4. TABLA: featured_products (destacados HOME)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.featured_products (
    product_id  INT NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    sort_order  INT NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id)
);

-- ----------------------------------------------------------------
-- 5. TABLA: cart_items (carrito persistente cliente ↔ Supabase)
--    El cliente autenticado se liga por auth.users.id
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id  INT  NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity    INT  NOT NULL CHECK (quantity > 0) DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);

DROP TRIGGER IF EXISTS cart_items_update_ts ON public.cart_items;
CREATE TRIGGER cart_items_update_ts
BEFORE UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ----------------------------------------------------------------
-- 6. TABLA: orders (pedidos enviados por WhatsApp al propietario)
-- ----------------------------------------------------------------
CREATE TYPE order_status AS ENUM ('pending','sent_to_owner','confirmed','cancelled');

CREATE TABLE IF NOT EXISTS public.orders (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name   TEXT,
    customer_phone  TEXT,                       -- teléfono registrado en perfil
    customer_email  TEXT,
    items_snapshot  JSONB NOT NULL,             -- copia de línea con precio en el momento
    subtotal_mxn    NUMERIC(12,2) NOT NULL,
    total_mxn       NUMERIC(12,2) NOT NULL,
    whatsapp_msg    TEXT,                       -- texto que se mandó al dueño
    owner_phone_e164 TEXT NOT NULL,             -- 521XXXXXXXXXX
    status          order_status NOT NULL DEFAULT 'pending',
    whatsapp_sent_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user   ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ----------------------------------------------------------------
-- =========================================================
-- ROW LEVEL SECURITY (RLS) —  seguridad  contra lecturas
-- indebidas: solo admin ve todo, clientes solo sus datos.
-- =========================================================
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;

-- Rol helper =========================================================
-- Si aún no existe, creamos rol autenticado (Supabase ya lo trae por default)
-- CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '...'; (omitido, propio de Supabase)

-- ====== POLICIES ======

-- --- Todos los usuarios (anon + auth) pueden LEER catálogo público ---
CREATE POLICY "Catalog public readable"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Platforms public readable"
    ON public.platforms FOR SELECT
    USING (true);

CREATE POLICY "Products public readable (not deleted)"
    ON public.products FOR SELECT
    USING (stock <> 'soldout' OR current_setting('request.jwt.claim.role', true) = 'service_role'
           OR (auth.uid() IS NOT NULL AND is_super_admin(auth.uid())));

CREATE POLICY "Featured products public readable"
    ON public.featured_products FOR SELECT
    USING (true);

-- --- Super admin: FULL CRUD categories/platforms/products/featured ---
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
         WHERE id = uid
           AND (raw_app_meta_data->>'role')::TEXT = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE POLICY "Admin CRUD categories"
    ON public.categories FOR ALL
    USING (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()));

CREATE POLICY "Admin CRUD platforms"
    ON public.platforms FOR ALL
    USING (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()));

CREATE POLICY "Admin CRUD products"
    ON public.products FOR ALL
    USING (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()));

CREATE POLICY "Admin CRUD featured products"
    ON public.featured_products FOR ALL
    USING (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND is_super_admin(auth.uid()));

-- --- Cart items: solo el DUEÑO del user_id lee/escribe ---
CREATE POLICY "Cart owner read own"
    ON public.cart_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Cart owner insert own"
    ON public.cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cart owner update own"
    ON public.cart_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cart owner delete own"
    ON public.cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- --- Orders: dueño del user_id y super_admin ---
CREATE POLICY "Orders owner + admin read"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

CREATE POLICY "Orders owner + admin insert"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id OR is_super_admin(auth.uid()));

CREATE POLICY "Orders admin update status"
    ON public.orders FOR UPDATE
    USING (is_super_admin(auth.uid()))
    WITH CHECK (is_super_admin(auth.uid()));

-- ----------------------------------------------------------------
-- =========================================================
--  SEED DATA (Coincide con el PRODUCTS[] actual de script.js)
-- =========================================================

TRUNCATE TABLE public.featured_products CASCADE;
TRUNCATE TABLE public.cart_items         CASCADE;
TRUNCATE TABLE public.orders             CASCADE;
TRUNCATE TABLE public.products           CASCADE;
TRUNCATE TABLE public.categories         CASCADE;
TRUNCATE TABLE public.platforms          CASCADE;

ALTER SEQUENCE public.categories_id_seq RESTART WITH 1;
ALTER SEQUENCE public.platforms_id_seq  RESTART WITH 1;
ALTER SEQUENCE public.products_id_seq   RESTART WITH 1;

-- 1. Categories (coincide con HTML nav: Juegos, Consolas, Accesorios, Merch, Ofertas → oferta es flag)
INSERT INTO public.categories (slug, name, icon_name, sort_order) VALUES
 ('consolas',   'Consolas',     'sports_esports', 1),
 ('juegos',     'Juegos',       'gamepad',        2),
 ('accesorios', 'Accesorios',   'headset_mic',    3),
 ('merch',      'Merchandising','storefront',     4);

-- 2. Platforms
INSERT INTO public.platforms (slug, name, css_class) VALUES
 ('playstation', 'PlayStation', 'platform-ps'),
 ('xbox',        'Xbox',        'platform-xbox'),
 ('nintendo',    'Nintendo',    'platform-switch'),
 ('pc',          'PC',          'platform-pc');

-- Helpers temp
CREATE TEMP TABLE _cat (slug TEXT, id INT);
INSERT INTO _cat SELECT slug, id FROM public.categories;
CREATE TEMP TABLE _plt (slug TEXT, id INT);
INSERT INTO _plt SELECT slug, id FROM public.platforms;

-- 3. Products — 36 filas (id 1..36 del script.js)
INSERT INTO public.products (
  id, title, emoji, category_id, platform_id, platform_label,
  price, old_price, stock, is_offer, is_new
) VALUES
  -- CONSOLAS
 (1,  'PlayStation 5 Pro Edición Digital 2TB',     '🎮', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='playstation'), 'PS5 PRO',     11899.99, 13599.99, 'available', TRUE,  TRUE),
 (2,  'Xbox Series X 1TB Diablo IV Edition',        '🎯', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='xbox'),        'XBOX X',      9349.99, NULL,      'available', FALSE, FALSE),
 (3,  'Nintendo Switch OLED Edición Zelda',         '🕹️', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='nintendo'),    'SWITCH OLED', 6459.99,  7309.99, 'available', TRUE,  FALSE),
 (4,  'PC Gamer Ryzen 9 7950X + RTX 4090 32GB',     '🖥️', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='pc'),          'PC ULTRA',    42499.99,47599.99, 'low',       TRUE,  TRUE),
 (25, 'PlayStation 5 Slim 1TB Edición Estándar',    '🎮', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='playstation'), 'PS5 SLIM',    8999.99, 10499.99, 'available', TRUE,  FALSE),
 (26, 'Xbox Series S 512GB Robot White',             '🎯', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='xbox'),        'XBOX S',      5499.99,  6299.99, 'available', TRUE,  FALSE),
 (27, 'Steam Deck OLED 512GB Handheld',              '🕹️', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='pc'),          'STEAM DECK',  13299.99,NULL,      'low',       FALSE, TRUE),
 (28, 'Nintendo Switch Lite Coral Portátil',         '🕹️', (SELECT id FROM _cat WHERE slug='consolas'), (SELECT id FROM _plt WHERE slug='nintendo'),    'SWITCH LITE', 3699.99,  4199.99, 'available', TRUE,  FALSE),

 -- JUEGOS
 (5,  'GTA VI Premium Edition PS5',                  '🌆', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='playstation'), 'PS5',         1529.99,  1869.99, 'available', TRUE,  TRUE),
 (6,  'Elden Ring Shadow of the Erdtree',            '⚔️', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='playstation'), 'PS5',         1019.99,  NULL,    'available', FALSE, FALSE),
 (7,  'Forza Motorsport 8 Xbox Series X',            '🏎️', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='xbox'),        'XBOX',        1189.99,  1444.99, 'available', TRUE,  FALSE),
 (8,  'Starfield Constellation Edition',             '🚀', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='xbox'),        'XBOX / PC',   2209.99,  2719.99, 'low',       TRUE,  FALSE),
 (9,  'The Legend of Zelda Tears of the Kingdom',    '🗡️', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='nintendo'),    'SWITCH',      1104.99,  NULL,    'available', FALSE, FALSE),
 (10, 'Mario Kart 8 Deluxe Booster Pass',            '🏁', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='nintendo'),    'SWITCH',      764.99,    934.99, 'available', TRUE,  FALSE),
 (11, 'Cyberpunk 2077 Ultimate Edition PC',          '🌃', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='pc'),          'PC / STEAM',  934.99,   1359.99, 'available', TRUE,  FALSE),
 (12, 'Baldur''s Gate 3 Deluxe Edition',             '🐉', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='pc'),          'PC / STEAM',  1359.99,  NULL,    'available', FALSE, FALSE),
 (29, 'Marvel''s Spider-Man 2 PS5',                  '🕷️', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='playstation'), 'PS5',         1199.99,  1499.99, 'available', TRUE,  FALSE),
 (30, 'Super Mario Odyssey Nintendo Switch',         '🍄', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='nintendo'),    'SWITCH',      999.99,   NULL,    'available', FALSE, FALSE),
 (31, 'Halo Infinite Campaign Xbox Series',          '🛡️', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='xbox'),        'XBOX',        799.99,   1099.99, 'available', TRUE,  FALSE),
 (32, 'God of War Ragnarök PS5',                     '🪓', (SELECT id FROM _cat WHERE slug='juegos'),   (SELECT id FROM _plt WHERE slug='playstation'), 'PS5',         1149.99,  1399.99, 'available', TRUE,  FALSE),

 -- ACCESORIOS
 (13, 'DualSense Edge Controller PS5 Pro',           '🎮', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='playstation'), 'PS5',         3569.99,  4079.99, 'available', TRUE,  TRUE),
 (14, 'Auriculares Pulse 3D Wireless Midnight',      '🎧', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='playstation'), 'PS5 / PS4',   1699.99,  NULL,    'available', FALSE, FALSE),
 (15, 'Xbox Elite Wireless Controller Series 2',     '🕹️', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='xbox'),        'XBOX / PC',   3059.99,  3569.99, 'available', TRUE,  FALSE),
 (16, 'Auriculares Astro A50 Wireless Xbox',         '🎧', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='xbox'),        'XBOX',        5099.99,  NULL,    'low',       FALSE, TRUE),
 (17, 'Pro Controller Nintendo Switch Smash Bros',   '🎯', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='nintendo'),    'SWITCH',      1359.99,  1529.99, 'available', TRUE,  FALSE),
 (18, 'Volante Logitech G923 Driving Force',         '🏎️', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='pc'),          'PC / PS',     6799.99,  7819.99, 'available', TRUE,  FALSE),
 (19, 'Razer BlackWidow V4 Pro RGB',                 '⌨️', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='pc'),          'PC',          4249.99,  NULL,    'available', FALSE, TRUE),
 (20, 'Nintendo Switch Joy-Con Set Pastel',          '🎨', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='nintendo'),    'SWITCH',      1189.99,  NULL,    'available', FALSE, TRUE),
 (33, 'HyperX Cloud III Wireless Gaming Headset',    '🎧', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='pc'),          'PC / PS',     2499.99,  2899.99, 'available', TRUE,  TRUE),
 (34, 'Mouse Logitech G502 X PLUS Lightspeed',       '🖱️', (SELECT id FROM _cat WHERE slug='accesorios'),(SELECT id FROM _plt WHERE slug='pc'),          'PC',          2199.99,  NULL,    'available', FALSE, FALSE),

 -- MERCH
 (21, 'Camiseta Glitch Shop Retrogaming XL',         '👕', (SELECT id FROM _cat WHERE slug='merch'),    (SELECT id FROM _plt WHERE slug='pc'),          'MERCH',       594.99,    764.99, 'available', TRUE,  FALSE),
 (22, 'Hoodie Zelda Triforce Limited Edition',       '🧥', (SELECT id FROM _cat WHERE slug='merch'),    (SELECT id FROM _plt WHERE slug='nintendo'),    'MERCH',       1274.99,  NULL,    'low',       FALSE, TRUE),
 (23, 'Figura Genshin Impact Hu Tao 1/7 Scale',      '🎎', (SELECT id FROM _cat WHERE slug='merch'),    (SELECT id FROM _plt WHERE slug='pc'),          'COLLECTOR',   3229.99,  3739.99, 'low',       TRUE,  FALSE),
 (24, 'Poster Metalizado Cyberpunk 2077 70x50',      '🖼️', (SELECT id FROM _cat WHERE slug='merch'),    (SELECT id FROM _plt WHERE slug='pc'),          'MERCH',       509.99,   NULL,    'available', FALSE, FALSE),
 (35, 'Lámpara Iconos PlayStation LED RGB',          '💡', (SELECT id FROM _cat WHERE slug='merch'),    (SELECT id FROM _plt WHERE slug='playstation'), 'MERCH',       649.99,    799.99, 'available', TRUE,  FALSE),
 (36, 'Mochila Gamer Antirrobo Impermeable USB',     '🎒', (SELECT id FROM _cat WHERE slug='merch'),    (SELECT id FROM _plt WHERE slug='pc'),          'MERCH',       899.99,   1199.99, 'available', TRUE,  TRUE);

-- featured = [1, 2, 3, 5, 13, 15]  (coincide con FEATURED_IDS)
INSERT INTO public.featured_products (product_id, sort_order) VALUES
 (1,  10), (2, 20), (3, 30),
 (5,  40), (13,50), (15,60);

-- =========================================================
-- STORAGE bucket: crear bucket 'product-images' (OPCIONAL)
-- se necesita CLI de Supabase. Reemplazar con:
--   supabase storage buckets create product-images --public
-- Aquí solo anotamos:
COMMENT ON TABLE public.products IS
  'La columna image_url apunta a objectos del Storage bucket = product-images';
