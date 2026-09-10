/* =========================================================
   GLITCH SHOP — Interactive Logic v2
   + Supabase Auth (correo+password)
   + Carrito persistente: Supabase (user logged) | localStorage (guest)
   + Checkout WhatsApp (5216442514818)
   + Super Admin check: glitchshopoficial@gmail.com + DB (raw_app_meta_data.role)
   ========================================================= */

/* -----------------------------------------------------------
   0. SUPABASE CONFIG — Credenciales del proyecto (.env.local.example)
   Project Ref: swaoqmumbyofrnmhlgxr
   ----------------------------------------------------------- */
const SUPABASE_URL = (window.VITE_SUPABASE_URL
  || localStorage.getItem('VITE_SUPABASE_URL')
  || 'https://swaoqmumbyofrnmhlgxr.supabase.co');

const SUPABASE_ANON_KEY = (window.VITE_SUPABASE_ANON_KEY
  || localStorage.getItem('VITE_SUPABASE_ANON_KEY')
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YW9xbXVtYnlvZnJubWhsZ3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5OTk4NDcsImV4cCI6MjEwNDU3NTg0N30.nSOSA2bjTkcchF8OsWAgnHchdMt4igAbNDNOFflXHNo');

/* WHATSAPP PROPIETARIO — formato E.164 México: 521 + 10 dígitos */
const OWNER_WHATSAPP_E164 = (window.VITE_OWNER_WHATSAPP_E164
  || localStorage.getItem('VITE_OWNER_WHATSAPP_E164')
  || '5216442514818');
const OWNER_WHATSAPP_NAME = (window.VITE_OWNER_WHATSAPP_NAME
  || localStorage.getItem('VITE_OWNER_WHATSAPP_NAME')
  || 'Glitch Shop Oficial');

/* Super admin — BOTH check: (1) correo exacto + (2) DB meta.role = 'super_admin' */
const SUPER_ADMIN_EMAILS = ['glitchshopoficial@gmail.com'];

/* Instancia Supabase (se inicializa más abajo) */
let supabase = null;
try {
  if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
      }
    });
  }
} catch (e) { console.warn('[Glitch] Supabase no inicializado:', e.message); }

/* -----------------------------------------------------------
   1. PRODUCT CATALOG — PRECIOS EN MXN
   (Array hardcodeado — si Supabase trae products DB reemplaza)
   ----------------------------------------------------------- */
const PRODUCTS = [
  { id: 1, title: 'PlayStation 5 Pro Edición Digital 2TB', category: 'consolas', platform: 'playstation', emoji: '🎮', price: 11899.99, oldPrice: 13599.99, stock: 'available', offer: true, isNew: true, platformLabel: 'PS5 PRO' },
  { id: 2, title: 'Xbox Series X 1TB Diablo IV Edition', category: 'consolas', platform: 'xbox', emoji: '🎯', price: 9349.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'XBOX X' },
  { id: 3, title: 'Nintendo Switch OLED Edición Zelda', category: 'consolas', platform: 'nintendo', emoji: '🕹️', price: 6459.99, oldPrice: 7309.99, stock: 'available', offer: true, isNew: false, platformLabel: 'SWITCH OLED' },
  { id: 4, title: 'PC Gamer Ryzen 9 7950X + RTX 4090 32GB', category: 'consolas', platform: 'pc', emoji: '🖥️', price: 42499.99, oldPrice: 47599.99, stock: 'low', offer: true, isNew: true, platformLabel: 'PC ULTRA' },
  { id: 5, title: 'GTA VI Premium Edition PS5', category: 'juegos', platform: 'playstation', emoji: '🌆', price: 1529.99, oldPrice: 1869.99, stock: 'available', offer: true, isNew: true, platformLabel: 'PS5' },
  { id: 6, title: 'Elden Ring Shadow of the Erdtree', category: 'juegos', platform: 'playstation', emoji: '⚔️', price: 1019.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'PS5' },
  { id: 7, title: 'Forza Motorsport 8 Xbox Series X', category: 'juegos', platform: 'xbox', emoji: '🏎️', price: 1189.99, oldPrice: 1444.99, stock: 'available', offer: true, isNew: false, platformLabel: 'XBOX' },
  { id: 8, title: 'Starfield Constellation Edition', category: 'juegos', platform: 'xbox', emoji: '🚀', price: 2209.99, oldPrice: 2719.99, stock: 'low', offer: true, isNew: false, platformLabel: 'XBOX / PC' },
  { id: 9, title: 'The Legend of Zelda Tears of the Kingdom', category: 'juegos', platform: 'nintendo', emoji: '🗡️', price: 1104.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'SWITCH' },
  { id: 10, title: 'Mario Kart 8 Deluxe Booster Pass', category: 'juegos', platform: 'nintendo', emoji: '🏁', price: 764.99, oldPrice: 934.99, stock: 'available', offer: true, isNew: false, platformLabel: 'SWITCH' },
  { id: 11, title: 'Cyberpunk 2077 Ultimate Edition PC', category: 'juegos', platform: 'pc', emoji: '🌃', price: 934.99, oldPrice: 1359.99, stock: 'available', offer: true, isNew: false, platformLabel: 'PC / STEAM' },
  { id: 12, title: 'Baldur\'s Gate 3 Deluxe Edition', category: 'juegos', platform: 'pc', emoji: '🐉', price: 1359.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'PC / STEAM' },
  { id: 13, title: 'DualSense Edge Controller PS5 Pro', category: 'accesorios', platform: 'playstation', emoji: '🎮', price: 3569.99, oldPrice: 4079.99, stock: 'available', offer: true, isNew: true, platformLabel: 'PS5' },
  { id: 14, title: 'Auriculares Pulse 3D Wireless Midnight', category: 'accesorios', platform: 'playstation', emoji: '🎧', price: 1699.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'PS5 / PS4' },
  { id: 15, title: 'Xbox Elite Wireless Controller Series 2', category: 'accesorios', platform: 'xbox', emoji: '🕹️', price: 3059.99, oldPrice: 3569.99, stock: 'available', offer: true, isNew: false, platformLabel: 'XBOX / PC' },
  { id: 16, title: 'Auriculares Astro A50 Wireless Xbox', category: 'accesorios', platform: 'xbox', emoji: '🎧', price: 5099.99, oldPrice: null, stock: 'low', offer: false, isNew: true, platformLabel: 'XBOX' },
  { id: 17, title: 'Pro Controller Nintendo Switch Smash Bros', category: 'accesorios', platform: 'nintendo', emoji: '🎯', price: 1359.99, oldPrice: 1529.99, stock: 'available', offer: true, isNew: false, platformLabel: 'SWITCH' },
  { id: 18, title: 'Volante Logitech G923 Driving Force', category: 'accesorios', platform: 'pc', emoji: '🏎️', price: 6799.99, oldPrice: 7819.99, stock: 'available', offer: true, isNew: false, platformLabel: 'PC / PS' },
  { id: 19, title: 'Razer BlackWidow V4 Pro RGB', category: 'accesorios', platform: 'pc', emoji: '⌨️', price: 4249.99, oldPrice: null, stock: 'available', offer: false, isNew: true, platformLabel: 'PC' },
  { id: 20, title: 'Nintendo Switch Joy-Con Set Pastel', category: 'accesorios', platform: 'nintendo', emoji: '🎨', price: 1189.99, oldPrice: null, stock: 'available', offer: false, isNew: true, platformLabel: 'SWITCH' },
  { id: 21, title: 'Camiseta Glitch Shop Retrogaming XL', category: 'merch', platform: 'pc', emoji: '👕', price: 594.99, oldPrice: 764.99, stock: 'available', offer: true, isNew: false, platformLabel: 'MERCH' },
  { id: 22, title: 'Hoodie Zelda Triforce Limited Edition', category: 'merch', platform: 'nintendo', emoji: '🧥', price: 1274.99, oldPrice: null, stock: 'low', offer: false, isNew: true, platformLabel: 'MERCH' },
  { id: 23, title: 'Figura Genshin Impact Hu Tao 1/7 Scale', category: 'merch', platform: 'pc', emoji: '🎎', price: 3229.99, oldPrice: 3739.99, stock: 'low', offer: true, isNew: false, platformLabel: 'COLLECTOR' },
  { id: 24, title: 'Poster Metalizado Cyberpunk 2077 70x50', category: 'merch', platform: 'pc', emoji: '🖼️', price: 509.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'MERCH' },
  { id: 25, title: 'PlayStation 5 Slim 1TB Edición Estándar', category: 'consolas', platform: 'playstation', emoji: '🎮', price: 8999.99, oldPrice: 10499.99, stock: 'available', offer: true, isNew: false, platformLabel: 'PS5 SLIM' },
  { id: 26, title: 'Xbox Series S 512GB Robot White', category: 'consolas', platform: 'xbox', emoji: '🎯', price: 5499.99, oldPrice: 6299.99, stock: 'available', offer: true, isNew: false, platformLabel: 'XBOX S' },
  { id: 27, title: 'Steam Deck OLED 512GB Handheld', category: 'consolas', platform: 'pc', emoji: '🕹️', price: 13299.99, oldPrice: null, stock: 'low', offer: false, isNew: true, platformLabel: 'STEAM DECK' },
  { id: 28, title: 'Nintendo Switch Lite Coral Portátil', category: 'consolas', platform: 'nintendo', emoji: '🕹️', price: 3699.99, oldPrice: 4199.99, stock: 'available', offer: true, isNew: false, platformLabel: 'SWITCH LITE' },
  { id: 29, title: 'Marvel\'s Spider-Man 2 PS5', category: 'juegos', platform: 'playstation', emoji: '🕷️', price: 1199.99, oldPrice: 1499.99, stock: 'available', offer: true, isNew: false, platformLabel: 'PS5' },
  { id: 30, title: 'Super Mario Odyssey Nintendo Switch', category: 'juegos', platform: 'nintendo', emoji: '🍄', price: 999.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'SWITCH' },
  { id: 31, title: 'Halo Infinite Campaign Xbox Series', category: 'juegos', platform: 'xbox', emoji: '🛡️', price: 799.99, oldPrice: 1099.99, stock: 'available', offer: true, isNew: false, platformLabel: 'XBOX' },
  { id: 32, title: 'God of War Ragnarök PS5', category: 'juegos', platform: 'playstation', emoji: '🪓', price: 1149.99, oldPrice: 1399.99, stock: 'available', offer: true, isNew: false, platformLabel: 'PS5' },
  { id: 33, title: 'HyperX Cloud III Wireless Gaming Headset', category: 'accesorios', platform: 'pc', emoji: '🎧', price: 2499.99, oldPrice: 2899.99, stock: 'available', offer: true, isNew: true, platformLabel: 'PC / PS' },
  { id: 34, title: 'Mouse Logitech G502 X PLUS Lightspeed', category: 'accesorios', platform: 'pc', emoji: '🖱️', price: 2199.99, oldPrice: null, stock: 'available', offer: false, isNew: false, platformLabel: 'PC' },
  { id: 35, title: 'Lámpara Iconos PlayStation LED RGB', category: 'merch', platform: 'playstation', emoji: '💡', price: 649.99, oldPrice: 799.99, stock: 'available', offer: true, isNew: false, platformLabel: 'MERCH' },
  { id: 36, title: 'Mochila Gamer Antirrobo Impermeable USB', category: 'merch', platform: 'pc', emoji: '🎒', price: 899.99, oldPrice: 1199.99, stock: 'available', offer: true, isNew: true, platformLabel: 'MERCH' },
];

/* IDs destacados home */
const FEATURED_IDS = [1, 2, 3, 5, 13, 15];

/* -----------------------------------------------------------
   2. STATE — con user session
   ----------------------------------------------------------- */
const state = {
  user: null,                   /* {id, email, name, isAdmin} */
  filters: {
    categories: ['all'],
    platforms: [],
    maxPrice: 50000,
    stock: 'all',
    search: '',
    sort: 'featured',
  },
  view: 'grid',
  /* CARRITO: array de {id, title, price, qty, platformLabel, emoji} */
  cart: JSON.parse(localStorage.getItem('gs_cart_guest') || '[]'),
  authTab: 'signin',        /* signin | signup */
  syncingCart: false,
};

/* -----------------------------------------------------------
   3. UTILITIES
   ----------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const formatPrice = n => {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch (e) {
    return '$' + Math.round(n).toLocaleString('es-MX') + '.00';
  }
};

const platformClass = p => {
  const map = { playstation: 'platform-ps', xbox: 'platform-xbox', nintendo: 'platform-switch', pc: 'platform-pc' };
  return map[p] || '';
};

const stockBadge = s => {
  if (s === 'available') return { label: 'En stock', cls: 'product__stock--available' };
  if (s === 'low') return { label: 'Últimas unidades', cls: 'product__stock--low' };
  return { label: 'Agotado', cls: '' };
};

function showToast(msg, type = 'success') {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.borderLeftColor = type === 'success' ? 'var(--success)' : (type === 'error' ? 'var(--danger)' : 'var(--warn)');
  toast.classList.add('toast--show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('toast--show'), 2800);
}

function initialsOf(name, email) {
  if (name && name.trim()) return name.trim().split(/\s+/).slice(0,2).map(s => s[0]).join('').toUpperCase();
  if (email) return email.trim().charAt(0).toUpperCase();
  return 'U';
}

/* -----------------------------------------------------------
   4. AUTH — Supabase signUp / signIn / signOut + renderUI
   ----------------------------------------------------------- */
function isSuperAdmin(user) {
  if (!user) return false;
  /* 1) Lista hardcodeada (correo dueño) */
  if (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  /* 2) DB meta.role */
  try {
    if (user.app_metadata && user.app_metadata.role === 'super_admin') return true;
    if (user.raw_app_meta_data && user.raw_app_meta_data.role === 'super_admin') return true;
  } catch(e) {}
  return false;
}

async function refreshSession() {
  if (!supabase) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      applyUser(session.user);
      return true;
    }
  } catch (e) { console.warn('[Auth] refreshSession fail:', e.message); }
  applyUser(null);
  return false;
}

function applyUser(userRecord) {
  if (!userRecord) {
    state.user = null;
    renderAuthUI();
    return;
  }
  const email = userRecord.email || '';
  const name = (userRecord.user_metadata && userRecord.user_metadata.name)
    || (userRecord.identities && userRecord.identities[0] && userRecord.identities[0].identity_data && userRecord.identities[0].identity_data.name)
    || email.split('@')[0];

  state.user = {
    id: userRecord.id,
    email,
    name: name,
    isAdmin: isSuperAdmin(userRecord),
    raw: userRecord,
  };
  renderAuthUI();

  /* Si había carrito de invitado, mergearlo con el del usuario */
  const guestCart = JSON.parse(localStorage.getItem('gs_cart_guest') || '[]');
  if (guestCart.length) {
    state.cart = mergeCarts(state.cart || [], guestCart);
  }
  /* Luego sincronizar con DB (async) */
  syncCartFromDB();
}

function renderAuthUI() {
  const popover = $('#authPopover');
  const loggedOut = $('#authLoggedOut');
  const loggedIn = $('#authLoggedIn');
  const openAdminBtn = $('#openAdminBtn');
  const badgeAdmin = $('#badgeAdmin');
  const authIcon = $('#authIcon');

  if (!popover) return;

  if (!state.user) {
    if (loggedOut) loggedOut.hidden = false;
    if (loggedIn) loggedIn.hidden = true;
    if (authIcon) authIcon.textContent = 'person_outline';
  } else {
    if (loggedOut) loggedOut.hidden = true;
    if (loggedIn) loggedIn.hidden = false;
    if (authIcon) authIcon.textContent = 'person';
    const avatar = $('#userAvatar');
    if (avatar) avatar.textContent = initialsOf(state.user.name, state.user.email);
    const uName = $('#userName');
    if (uName) uName.textContent = state.user.name || 'Usuario';
    const uEmail = $('#userEmail');
    if (uEmail) uEmail.textContent = state.user.email || '';
    if (badgeAdmin) badgeAdmin.hidden = !state.user.isAdmin;
    if (openAdminBtn) openAdminBtn.hidden = !state.user.isAdmin;
  }
}

function toggleAuthPopover(forceShow) {
  const popover = $('#authPopover');
  if (!popover) return;
  const will = forceShow !== undefined ? !!forceShow : popover.hidden;
  popover.hidden = !will;
}

function toggleAuthModal(forceShow) {
  const modal = $('#authModal');
  if (!modal) return;
  const will = forceShow !== undefined ? !!forceShow : modal.hasAttribute('hidden');
  if (will) {
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const emailField = $('#authEmail'); if (emailField) setTimeout(() => emailField.focus(), 50);
  } else {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setAuthModalError('');
  }
}

function switchAuthTab(tabKey) {
  state.authTab = tabKey;
  $$('.auth-tab').forEach(t => t.classList.toggle('auth-tab--active', t.dataset.tab === tabKey));
  const signIn = tabKey === 'signin';
  $('#tabSignIn').classList.toggle('auth-tab--active', signIn);
  $('#tabSignUp').classList.toggle('auth-tab--active', !signIn);
  const title = $('#authModalTitle');
  if (title) title.textContent = signIn ? 'Iniciar sesión' : 'Crear cuenta nueva';
  const nameField = $('#authNameField');
  if (nameField) nameField.hidden = signIn;
  const submitText = $('#authSubmitText');
  if (submitText) submitText.textContent = signIn ? 'Iniciar sesión' : 'Crear mi cuenta';
  const submitIcon = $('#authSubmitIcon');
  if (submitIcon) submitIcon.textContent = signIn ? 'login' : 'how_to_reg';
  setAuthModalError('');
}

function setAuthModalError(msg, type = 'error') {
  const el = $('#authHint');
  if (!el) return;
  if (!msg) { el.hidden = true; el.className = 'auth-modal__hint'; el.innerHTML = ''; return; }
  el.hidden = false;
  el.className = 'auth-modal__hint ' + (type === 'error' ? 'auth-modal__hint--error' : 'auth-modal__hint--success');
  el.innerHTML = msg;
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  if (!supabase) {
    setAuthModalError('⚠️ Supabase no está conectado. Revisa tus credenciales <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.', 'error');
    return;
  }
  const email = ($('#authEmail').value || '').trim();
  const password = ($('#authPassword').value || '');
  if (!email || !password) return;
  const btn = $('#authSubmitBtn'); if (btn) btn.disabled = true;
  setAuthModalError('');
  try {
    if (state.authTab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast('Bienvenido de vuelta 🎮', 'success');
      toggleAuthModal(false);
    } else {
      /* Crear cuenta (signup) — se envía correo de confirmación automático si está encendido */
      const nameInput = $('#authName');
      const name = nameInput ? (nameInput.value || '').trim() : email.split('@')[0];
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, accepted_terms: true },
          emailRedirectTo: window.location.origin + '/index.html',
        }
      });
      if (error) throw error;
      setAuthModalError('✅ <b>Cuenta creada</b>. Te enviamos un correo de verificación a <b>' + email + '</b>. Revisa tu bandeja de entrada (y spam si no llega) para confirmarla antes de iniciar sesión.', 'success');
    }
  } catch (err) {
    let msg = err.message || 'Error desconocido.';
    if (msg.toLowerCase().includes('invalid') && msg.toLowerCase().includes('credentials')) msg = 'Correo o contraseña incorrectos. Verifica e intenta de nuevo.';
    else if (msg.toLowerCase().includes('user')) msg = 'Usuario no registrado. Cambia a la pestaña "Crear cuenta".';
    else if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('confirm')) msg = 'Tu correo aún no está verificado. Revisa tu bandeja de entrada y confirma.';
    setAuthModalError('❌ ' + msg, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleSignOut() {
  try {
    if (supabase) await supabase.auth.signOut();
  } catch (e) {}
  /* Guardar carrito actual en guest antes de borrar user (para no perder) */
  if (state.cart.length) try { localStorage.setItem('gs_cart_guest', JSON.stringify(state.cart)); } catch(e) {}
  state.user = null;
  state.cart = JSON.parse(localStorage.getItem('gs_cart_guest') || '[]');
  renderAuthUI();
  renderCart();
  if ($('#featuredGrid')) renderFeatured();
  if ($('#productsGrid')) renderProducts();
  showToast('Sesión cerrada correctamente.', 'warn');
}

/* -----------------------------------------------------------
   5. CARRITO (localStorage + sync Supabase si user logged)
   ----------------------------------------------------------- */
function mergeCarts(a, b) {
  const out = [...a];
  for (const item of b) {
    const existing = out.find(x => x.id === item.id);
    if (existing) existing.qty = (existing.qty || 1) + (item.qty || 1);
    else out.push({ ...item });
  }
  return out;
}

function persistCart() {
  try {
    if (state.user) {
      /* Usuario autenticado — guardar en BD (async) y también localStorage backup */
      localStorage.setItem('gs_cart_' + state.user.id, JSON.stringify(state.cart));
      syncCartToDB();
    } else {
      localStorage.setItem('gs_cart_guest', JSON.stringify(state.cart));
    }
  } catch (e) {}
}

async function syncCartFromDB() {
  if (!state.user || !supabase) return;
  state.syncingCart = true;
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('user_id', state.user.id);
    if (error) throw error;
    if (data && data.length) {
      const fromDb = [];
      for (const row of data) {
        const p = PRODUCTS.find(pr => pr.id === row.product_id);
        if (p) fromDb.push({ id: p.id, title: p.title, price: p.price, platformLabel: p.platformLabel, emoji: p.emoji, qty: row.quantity });
      }
      const merged = mergeCarts(fromDb, state.cart);
      state.cart = merged;
      renderCart();
      if ($('#featuredGrid')) renderFeatured();
      if ($('#productsGrid')) renderProducts();
    } else {
      /* Si BD está vacía y hay carrito en memoria, guardarlo */
      if (state.cart.length) syncCartToDB();
    }
  } catch (e) { console.warn('[Cart] sync from DB fail:', e.message); }
  finally { state.syncingCart = false; }
}

async function syncCartToDB() {
  if (!state.user || !supabase || state.syncingCart) return;
  try {
    /* 1) Borramos todos los renglones de este usuario (replace) */
    await supabase.from('cart_items').delete().eq('user_id', state.user.id);
    if (state.cart.length) {
      const rows = state.cart.map(c => ({
        user_id: state.user.id,
        product_id: c.id,
        quantity: c.qty || 1,
      }));
      await supabase.from('cart_items').insert(rows);
    }
  } catch (e) { console.warn('[Cart] sync to DB fail:', e.message); }
}

/* -----------------------------------------------------------
   6. PRODUCT CARD (shared)
   ----------------------------------------------------------- */
function productCard(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const stock = stockBadge(p.stock);
  const inCart = state.cart.find(c => c.id === p.id);

  return `
    <article class="product" data-id="${p.id}">
      <div class="product__media">
        ${p.isNew ? `<span class="product__badge product__badge--new">Nuevo</span>` : ''}
        ${p.offer ? `<span class="product__badge product__badge--offer">-${discount}%</span>` : ''}
        ${p.stock === 'low' ? `<span class="product__badge product__badge--low" style="top:auto; bottom:12px;">Últimas</span>` : ''}
        <span class="product__platform ${platformClass(p.platform)}">${p.platformLabel}</span>
        <div class="product__emoji">${p.emoji}</div>
      </div>
      <div class="product__body">
        <h3 class="product__title">${p.title}</h3>
        <div class="product__price-row">
          <span class="product__price">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="product__price--old">${formatPrice(p.oldPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="product__discount">AHORRA ${discount}%</span>` : ''}
        </div>
        <span class="product__stock ${stock.cls}">${stock.label}</span>
        <div class="product__actions">
          <button class="product__add" data-add="${p.id}" ${p.stock === 'soldout' ? 'disabled' : ''}>
            ${inCart
              ? '<span class="material-icons" style="font-size:16px;vertical-align:-2px;margin-right:4px;">check_circle</span>Añadido'
              : '<span class="material-icons" style="font-size:16px;vertical-align:-2px;margin-right:4px;">shopping_cart</span>Añadir al carrito'}
          </button>
          <button class="product__fav" aria-label="Favorito">
            <span class="material-icons" style="font-size:18px;">favorite_border</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function bindProductEvents(rootEl) {
  $$('[data-add]', rootEl || document).forEach(btn => {
    btn.addEventListener('click', () => addToCart(+btn.dataset.add));
  });
  $$('.product__fav', rootEl || document).forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('.material-icons');
      const isActive = btn.classList.toggle('product__fav--active');
      if (icon) icon.textContent = isActive ? 'favorite' : 'favorite_border';
      showToast(isActive ? 'Añadido a favoritos' : 'Eliminado de favoritos', 'success');
    });
  });
}

/* -----------------------------------------------------------
   7. HOME — FEATURED PRODUCTS
   ----------------------------------------------------------- */
function renderFeatured() {
  const grid = $('#featuredGrid');
  if (!grid) return;
  const list = FEATURED_IDS
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);
  grid.innerHTML = list.map(productCard).join('');
  bindProductEvents(grid);
}

/* -----------------------------------------------------------
   8. CATALOG — FILTERS + RENDER
   ----------------------------------------------------------- */
function filterProducts() {
  const f = state.filters;
  let list = PRODUCTS.filter(p => {
    if (!f.categories.includes('all') && !f.categories.includes(p.category)) return false;
    if (f.platforms.length && !f.platforms.includes(p.platform)) return false;
    if (p.price > f.maxPrice) return false;
    if (f.stock === 'available' && p.stock !== 'available' && p.stock !== 'low') return false;
    if (f.stock === 'offer' && !p.offer) return false;
    if (f.search && !(p.title.toLowerCase().includes(f.search.toLowerCase()) || p.category.includes(f.search.toLowerCase()))) return false;
    return true;
  });

  switch (f.sort) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'name':       list.sort((a, b) => a.title.localeCompare(b.title, 'es')); break;
    default:           list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || (b.offer ? 1 : 0) - (a.offer ? 1 : 0));
  }
  return list;
}

function renderProducts() {
  const grid = $('#productsGrid');
  if (!grid) return;
  const list = filterProducts();
  const empty = $('#emptyState');
  const count = $('#productCount');
  if (count) count.textContent = list.length;
  grid.setAttribute('data-view', state.view);

  if (list.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  grid.innerHTML = list.map(productCard).join('');
  bindProductEvents(grid);
}

function applyHashFilters() {
  const hash = (location.hash || '').replace(/^#/, '').trim();
  if (!hash) return;
  const catInputs = $$('.f-category');
  const catMap = { juegos: 'juegos', consolas: 'consolas', accesorios: 'accesorios', merch: 'merch', ofertas: '__offer__' };
  const key = hash.split('=')[0];
  if (catMap[key] && catInputs.length) {
    if (key === 'ofertas') {
      const offerRadio = document.querySelector('input[name="stock"][value="offer"]');
      if (offerRadio) {
        offerRadio.checked = true;
        state.filters.stock = 'offer';
      }
    } else {
      catInputs.forEach(i => i.checked = (i.value === catMap[key]));
      state.filters.categories = [catMap[key]];
    }
  }
  if (hash.startsWith('search=')) {
    const q = decodeURIComponent(hash.slice(7));
    state.filters.search = q;
    const si = $('.search__input');
    if (si) si.value = q;
  }
  const matchingLink = $$(`.nav [data-category="${catMap[key] || key}"]`)[0];
  if (matchingLink) {
    $$('.nav__link').forEach(l => l.classList.remove('nav__link--active'));
    matchingLink.classList.add('nav__link--active');
  }
}

function bindFilters() {
  if (!$('#productsGrid')) return;
  applyHashFilters();

  const catInputs = $$('.f-category');
  catInputs.forEach(inp => {
    inp.addEventListener('change', () => {
      if (inp.value === 'all' && inp.checked) {
        catInputs.forEach(i => { if (i.value !== 'all') i.checked = false; });
      } else if (inp.checked) {
        const all = catInputs.find(i => i.value === 'all');
        if (all) all.checked = false;
      }
      const checked = catInputs.filter(i => i.checked).map(i => i.value);
      state.filters.categories = checked.length ? checked : ['all'];
      if (!checked.length) catInputs.find(i => i.value === 'all').checked = true;
      renderProducts();
    });
  });

  $$('.f-platform').forEach(inp => {
    inp.addEventListener('change', () => {
      state.filters.platforms = $$('.f-platform:checked').map(i => i.value);
      renderProducts();
    });
  });

  const priceRange = $('#priceRange');
  const priceValue = $('#priceValue');
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      state.filters.maxPrice = +priceRange.value;
      if (priceValue) priceValue.textContent = '$' + (+priceRange.value).toLocaleString('es-MX');
      renderProducts();
    });
  }

  $$('input[name="stock"]').forEach(inp => {
    inp.addEventListener('change', () => {
      state.filters.stock = inp.value;
      renderProducts();
    });
  });

  const resetFilters = $('#resetFilters');
  if (resetFilters) resetFilters.addEventListener('click', () => {
    catInputs.forEach(i => i.checked = i.value === 'all');
    state.filters.categories = ['all'];
    $$('.f-platform').forEach(i => i.checked = false);
    state.filters.platforms = [];
    if (priceRange) {
      priceRange.value = 50000;
      state.filters.maxPrice = 50000;
      if (priceValue) priceValue.textContent = '$50,000';
    }
    const allStock = document.querySelector('input[name="stock"][value="all"]');
    if (allStock) allStock.checked = true;
    state.filters.stock = 'all';
    const si = $('.search__input');
    if (si) { si.value = ''; state.filters.search = ''; }
    const sortSelect = $('#sortSelect');
    if (sortSelect) { sortSelect.value = 'featured'; state.filters.sort = 'featured'; }
    history.replaceState(null, '', location.pathname);
    renderProducts();
    showToast('Filtros restaurados');
  });

  const sortSelect = $('#sortSelect');
  if (sortSelect) sortSelect.addEventListener('change', e => {
    state.filters.sort = e.target.value;
    renderProducts();
  });

  const searchInput = $('.catalog .search__input') || $('.search__input');
  if (searchInput && $('#productsGrid')) {
    searchInput.addEventListener('input', e => {
      state.filters.search = e.target.value.trim();
      renderProducts();
    });
  }

  $$('.view-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.view-toggle__btn').forEach(b => b.classList.remove('view-toggle__btn--active'));
      btn.classList.add('view-toggle__btn--active');
      state.view = btn.dataset.view;
      renderProducts();
    });
  });

  $$('.nav__link[data-category]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const cat = link.dataset.category;
      $$('.nav__link').forEach(l => l.classList.remove('nav__link--active'));
      link.classList.add('nav__link--active');
      if (cat === 'ofertas') {
        document.querySelector('input[name="stock"][value="offer"]').checked = true;
        state.filters.stock = 'offer';
      } else {
        const target = catInputs.find(i => i.value === cat);
        if (target) {
          catInputs.forEach(i => i.checked = false);
          target.checked = true;
          state.filters.categories = [cat];
        }
      }
      history.replaceState(null, '', '#' + cat);
      renderProducts();
    });
  });
}

/* -----------------------------------------------------------
   9. CART LOGIC (add/updateQty/remove/render/checkout WhatsApp)
   ----------------------------------------------------------- */
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else state.cart.push({
    id: product.id,
    title: product.title,
    price: product.price,
    qty: 1,
    platformLabel: product.platformLabel,
    emoji: product.emoji,
  });
  persistCart();
  showToast(`"${product.title}" añadido al carrito`);
  renderCart();
  if ($('#featuredGrid')) renderFeatured();
  if ($('#productsGrid')) renderProducts();
}

function updateCartQty(id, delta) {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { persistCart(); renderCart(); }
}

function removeFromCart(id) {
  state.cart = state.cart.filter(c => c.id !== id);
  persistCart();
  renderCart();
  if ($('#featuredGrid')) renderFeatured();
  if ($('#productsGrid')) renderProducts();
  showToast('Producto eliminado del carrito', 'warn');
}

function renderCart() {
  const countEl = $('#cartCount');
  const body = $('#cartItems');
  const footer = $('#cartFooter');
  if (!countEl || !body) return;
  const totalCount = state.cart.reduce((a, c) => a + c.qty, 0);
  countEl.textContent = totalCount;
  countEl.style.display = totalCount > 0 ? 'grid' : 'none';

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-drawer__empty">
        <span class="material-icons" style="font-size:48px;color:var(--text-muted);opacity:.6;margin-bottom:12px;display:block;">remove_shopping_cart</span>
        Tu carrito está vacío<br>
        <small style="color:var(--text-muted);display:block;margin-top:8px;">¡Añade productos para empezar!</small>
      </div>`;
    if (footer) footer.hidden = true;
    updateWhatsAppHref();
    return;
  }
  if (footer) footer.hidden = false;

  body.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__img">${item.emoji}</div>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.title}</div>
        <div class="cart-item__plat">${item.platformLabel}</div>
        <div class="cart-item__price">${formatPrice(item.price)}</div>
        <div class="cart-item__qty">
          <button data-qty="${item.id}" data-delta="-1" aria-label="Restar">−</button>
          <span>${item.qty}</span>
          <button data-qty="${item.id}" data-delta="1" aria-label="Sumar">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-remove="${item.id}" aria-label="Eliminar">
        <span class="material-icons" style="font-size:16px;">delete</span>
      </button>
    </div>
  `).join('');

  const sub = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
  if ($('#cartSubtotal')) $('#cartSubtotal').textContent = formatPrice(sub);
  if ($('#cartTotal')) $('#cartTotal').textContent = formatPrice(sub);
  if ($('#cartShipping')) $('#cartShipping').textContent = sub >= 2500 ? 'Gratis 🎉' : 'Calculado al finalizar';

  $$('[data-qty]').forEach(b => b.addEventListener('click', () => updateCartQty(+b.dataset.qty, +b.dataset.delta)));
  $$('[data-remove]').forEach(b => b.addEventListener('click', () => removeFromCart(+b.dataset.remove)));

  updateWhatsAppHref();
}

/* ---- WHATSAPP CHECKOUT — build mensaje + href wa.me/OWNER ---- */
function buildWhatsAppMessage() {
  if (!state.cart.length) return null;
  const sub = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
  const freeShip = sub >= 2500;
  const dateStr = new Date().toLocaleString('es-MX');
  const userName = state.user ? state.user.name : null;
  const userEmail = state.user ? state.user.email : null;

  const lines = [];
  lines.push('🛒 *NUEVO PEDIDO — GLITCH SHOP*');
  lines.push('');
  lines.push(`📅 Fecha: ${dateStr}`);
  if (userName) lines.push(`👤 Cliente: ${userName}`);
  if (userEmail) lines.push(`📧 Correo: ${userEmail}`);
  lines.push('');
  lines.push('📦 *Productos:*');
  state.cart.forEach((c, idx) => {
    const lineTotal = c.price * c.qty;
    lines.push(
      `  ${idx + 1}. ${c.emoji} *${c.title}* (${c.platformLabel})` +
      `\n     🎯 Cantidad: ${c.qty} · Precio unit.: ${formatPrice(c.price)} · Subtotal: ${formatPrice(lineTotal)}`
    );
  });
  lines.push('');
  lines.push(`💵 *Subtotal:* ${formatPrice(sub)}`);
  lines.push(`🚚 *Envío:* ${freeShip ? '✅ GRATIS (≥ $2,500)' : 'Pendiente de calcular'}`);
  lines.push(`💰 *TOTAL A PAGAR:* ${formatPrice(sub)}`);
  lines.push('');
  lines.push('🙋 Hola! Quiero confirmar este pedido. ¿Podrían indicarme método de pago y tiempo de entrega? ¡Gracias! 🎮');

  return lines.join('\n');
}

function updateWhatsAppHref() {
  const btn = $('#whatsappCheckoutBtn');
  if (!btn) return;
  if (!state.cart.length) { btn.setAttribute('href', '#'); btn.setAttribute('disabled', ''); return; }
  const msg = buildWhatsAppMessage();
  const url = 'https://wa.me/' + OWNER_WHATSAPP_E164.replace(/\D/g, '') + '?text=' + encodeURIComponent(msg);
  btn.setAttribute('href', url);
  btn.removeAttribute('disabled');
}

function handleWhatsAppClick(e) {
  if (!state.cart.length) { e.preventDefault(); showToast('Tu carrito está vacío.', 'warn'); return; }
  /* Guardar pedido en tabla orders si está logeado + supabase */
  saveOrderToDB();
  /* abrir WhatsApp en nueva pestaña — target="_blank" ya está en HTML */
  toggleCart(false);
  showToast('Abriendo WhatsApp... Te contactaremos pronto. 🎮', 'success');
}

async function saveOrderToDB() {
  if (!state.user || !supabase || !state.cart.length) return null;
  try {
    const sub = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
    const items = state.cart.map(c => ({
      product_id: c.id, title: c.title, price: c.price, qty: c.qty, platformLabel: c.platformLabel, emoji: c.emoji,
      line_total: Math.round(c.price * c.qty * 100) / 100,
    }));
    const msg = buildWhatsAppMessage();
    await supabase.from('orders').insert({
      user_id: state.user.id,
      customer_name: state.user.name || null,
      customer_email: state.user.email || null,
      items_snapshot: items,
      subtotal_mxn: Math.round(sub * 100) / 100,
      total_mxn: Math.round(sub * 100) / 100,
      whatsapp_msg: msg,
      owner_phone_e164: OWNER_WHATSAPP_E164,
      status: 'sent_to_owner',
      whatsapp_sent_at: new Date().toISOString(),
    });
    /* Limpiar carrito SOLO si fue exitoso insert */
    state.cart = [];
    persistCart();
    renderCart();
  } catch (e) { console.warn('[Orders] saveOrderToDB fail:', e.message); }
}

function toggleCart(show) {
  const drawer = $('#cartDrawer');
  if (!drawer) return;
  const willShow = show === undefined ? !drawer.classList.contains('cart-drawer--open') : show;
  drawer.classList.toggle('cart-drawer--open', willShow);
  drawer.setAttribute('aria-hidden', !willShow);
  document.body.style.overflow = willShow ? 'hidden' : '';
}

/* -----------------------------------------------------------
   10. ADMIN PANEL — Listar productos (sólo super_usuario)
   ----------------------------------------------------------- */
function toggleAdminModal(forceShow) {
  const modal = $('#adminModal');
  if (!modal) return;
  const will = forceShow !== undefined ? !!forceShow : modal.hasAttribute('hidden');
  if (will) {
    if (!state.user || !state.user.isAdmin) { showToast('Solo el administrador puede acceder.', 'error'); return; }
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderAdminList();
  } else {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

async function renderAdminList() {
  const listEl = $('#adminList');
  if (!listEl) return;
  listEl.innerHTML = '<div class="admin-empty"><span class="material-icons" style="font-size:36px;opacity:.4;display:block;margin-bottom:8px;">cloud_sync</span>Cargando...</div>';
  let list = [];
  /* Intenta traer de la tabla products de Supabase; si falla, usa el array hardcodeado */
  if (supabase && state.user?.isAdmin) {
    try {
      const { data, error } = await supabase.from('products').select('id,title,category_id,platform_id,price,old_price,stock,is_offer,is_new,platform_label,emoji').order('id', { ascending: true });
      if (!error && data && data.length) list = data.map(row => mapDBProduct(row));
    } catch (e) { list = []; }
  }
  if (!list.length) list = PRODUCTS; /* Fallback */

  listEl.innerHTML = list.map(p => `
    <div class="admin-item" data-id="${p.id}">
      <div class="admin-item__emoji">${p.emoji || '📦'}</div>
      <div>
        <div class="admin-item__title">${p.title}</div>
        <div class="admin-item__meta">
          <span><span class="material-icons" style="font-size:14px;">category</span> ${p.category || 'N/A'}</span>
          <span><span class="material-icons" style="font-size:14px;">devices</span> ${p.platformLabel || '-'}</span>
          <span><span class="material-icons" style="font-size:14px;">inventory_2</span> ${p.stock}</span>
          <span class="admin-item__price">${formatPrice(p.price)}</span>
          ${p.offer ? '<span style="color:#ec4899;">🏷️ Oferta</span>' : ''}
          ${p.isNew ? '<span style="color:#5b5cff;">✨ Nuevo</span>' : ''}
        </div>
      </div>
      <div class="admin-item__actions">
        <button class="icon-btn" title="Editar producto" data-admin-edit="${p.id}">
          <span class="material-icons">edit</span>
        </button>
        <button class="icon-btn" title="Eliminar producto" data-admin-del="${p.id}">
          <span class="material-icons" style="color:#ef4444;">delete</span>
        </button>
      </div>
    </div>
  `).join('');

  /* Bind eventos admin (toast provisional) */
  $$('[data-admin-edit]').forEach(b => b.addEventListener('click', () => {
    showToast('Editor avanzado próximamente. Por ahora edita desde el SQL Editor de Supabase ⚙️', 'warn');
  }));
  $$('[data-admin-del]').forEach(b => b.addEventListener('click', () => {
    showToast('Funcionalidad eliminar próximo release.', 'warn');
  }));
}

function mapDBProduct(row) {
  const catsMap = { 1: 'consolas', 2: 'juegos', 3: 'accesorios', 4: 'merch' };
  return {
    id: row.id,
    title: row.title,
    category: catsMap[row.category_id] || 'juegos',
    platform: 'pc',
    emoji: row.emoji || '📦',
    price: +row.price,
    oldPrice: row.old_price ? +row.old_price : null,
    stock: row.stock || 'available',
    offer: !!row.is_offer,
    isNew: !!row.is_new,
    platformLabel: row.platform_label || 'PC',
  };
}

/* -----------------------------------------------------------
   11. UI BINDINGS (auth, admin, cart, checkout, tabs, search submit)
   ----------------------------------------------------------- */
function bindAuthUi() {
  const authBtn = $('#authBtn');
  const popover = $('#authPopover');
  if (authBtn) authBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleAuthPopover();
  });
  document.addEventListener('click', e => {
    if (popover && !popover.contains(e.target) && !authBtn.contains(e.target)) popover.hidden = true;
  });

  const openModalBtn = $('#openAuthModalBtn');
  if (openModalBtn) openModalBtn.addEventListener('click', () => { toggleAuthPopover(false); toggleAuthModal(true); });

  /* Cerrar modal */
  $$('[data-auth-close]').forEach(el => el.addEventListener('click', () => toggleAuthModal(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      toggleAuthModal(false);
      toggleAdminModal(false);
    }
  });

  /* Tabs del modal */
  $$('.auth-tab').forEach(t => t.addEventListener('click', () => switchAuthTab(t.dataset.tab)));

  /* Submit auth */
  const authForm = $('#authForm');
  if (authForm) authForm.addEventListener('submit', handleAuthSubmit);

  /* SignOut */
  const signOutBtn = $('#signOutBtn');
  if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);

  /* Admin */
  const adminBtn = $('#openAdminBtn');
  if (adminBtn) adminBtn.addEventListener('click', () => { toggleAuthPopover(false); toggleAdminModal(true); });
  $$('[data-admin-close]').forEach(el => el.addEventListener('click', () => toggleAdminModal(false)));
  const adminRefresh = $('#adminRefreshBtn');
  if (adminRefresh) adminRefresh.addEventListener('click', renderAdminList);
  const adminAdd = $('#adminAddBtn');
  if (adminAdd) adminAdd.addEventListener('click', () => showToast('Añadir producto: próximo release. Usa Supabase SQL Editor por ahora ⚙️', 'warn'));
}

function bindUi() {
  const hamburger = $('#hamburger');
  const nav = $('#nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const open = nav.classList.toggle('nav--open');
      hamburger.setAttribute('aria-expanded', open);
    });
  }

  const cartBtn = $('#cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', () => toggleCart());
  $$('[data-close]').forEach(el => el.addEventListener('click', () => toggleCart(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleCart(false);
  });

  const checkoutBtn = $('#checkoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if (state.cart.length === 0) { showToast('Tu carrito está vacío.', 'warn'); return; }
    if (!state.user) {
      showToast('Inicia sesión para guardar tu pedido.', 'warn');
      toggleAuthModal(true);
      return;
    }
    const total = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
    saveOrderToDB().then(() => {
      showToast(`✅ Pedido guardado. Total: ${formatPrice(total)} — te contactaremos por WhatsApp.`, 'success');
    });
  });

  /* Botón WhatsApp checkout — abre chat con dueño */
  const waBtn = $('#whatsappCheckoutBtn');
  if (waBtn) waBtn.addEventListener('click', handleWhatsAppClick);
}

/* -----------------------------------------------------------
   12. BOOT — multi-page aware + auth session restore + supabase listener
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  /* 1) Primero bindear UI para que botones no fallen si tarda auth */
  bindAuthUi();
  bindUi();

  /* 2) Render inicial UI + carrito guest */
  renderAuthUI();
  renderCart();

  if ($('#featuredGrid')) renderFeatured();
  if ($('#productsGrid')) {
    renderProducts();
    bindFilters();
  }

  /* 3) Restaurar sesión + Supabase onAuthStateChange */
  if (supabase) {
    await refreshSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        applyUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        applyUser(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        applyUser(session.user);
      }
    });
  }
});
