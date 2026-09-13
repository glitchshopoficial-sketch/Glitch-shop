/* =========================================================
   GLITCH SHOP — Interactive Logic v3
   + Supabase Auth (correo+password) por pestaña separada (login.html)
   + Carrito persistente: Supabase (user logged) | localStorage (guest)
   + Checkout WhatsApp (5216442514818)
   + Super Admin check: SOLO DB (raw_app_meta_data.role='super_admin')
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

/* --------------------------
   DETECTAR PÁGINA ACTUAL
   (para comportamientos distintos entre login.html / admin.html / index.html / catalogo.html)
   -------------------------- */
const PAGE = (() => {
  const f = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (f === 'login.html' || f === 'login') return 'login';
  if (f === 'admin.html' || f === 'admin') return 'admin';
  return 'store';   /* index.html, catalogo.html */
})();

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
  cart: readCart('gs_cart_guest') || [],
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
let authReady = Promise.resolve();

function loginUrl() {
  const route = location.pathname.endsWith('.html') ? 'login.html' : 'login';
  return route + '?next=' + encodeURIComponent(location.pathname + location.search + location.hash);
}

function returnAfterLogin() {
  const next = new URLSearchParams(location.search).get('next');
  const destination = next && /^\/(?:index(?:\.html)?|catalogo(?:\.html)?|admin(?:\.html)?)?(?:[?#].*)?$/.test(next) ? next : 'index.html';
  window.location.replace(destination);
}

function isSuperAdmin(user) {
  if (!user) return false;
  /* 
     ⚠️  VERIFICACIÓN ÚNICA POR BASE DE DATOS:
     El usuario ES super_admin SOLAMENTE si en la tabla auth.users 
     el campo raw_app_meta_data->>'role' = 'super_admin'.
     No hay correos hardcodeados. Promueve usuarios con el SQL entregado.
  */
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
  const previousId = state.user?.id;
  if (!userRecord) {
    state.user = null;
    if (previousId) state.cart = readCart('gs_cart_guest') || [];
    renderAuthUI();
    renderCart();
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

  if (previousId === userRecord.id) return;
  const cached = readCart('gs_cart_' + userRecord.id);
  const guest = readCart('gs_cart_guest') || [];
  state.cart = mergeCarts(cached || [], guest);
  renderCart();
  syncCartFromDB(cached !== null);

}

function renderAuthUI() {
  const popover = $('#authPopover');
  const loggedIn = $('#authLoggedIn');
  const openAdminBtn = $('#openAdminBtn');
  const badgeAdmin = $('#badgeAdmin');
  const authIcon = $('#authIcon');
  const authBtn = $('#authBtn');   /* ÚNICO elemento: <a href="login.html">  (invitado) / toggle popover (logeado) */

  /* =============== LOGIN PAGE =============== */
  if (PAGE === 'login') {
    if (state.user) {
      showToast('Bienvenido de vuelta 🎮 — Redirigiendo…', 'success');
      setTimeout(() => {
        returnAfterLogin();
      }, 900);
    }
    return;
  }

  /* =============== ADMIN PAGE =============== */
  if (PAGE === 'admin') {
    const notAllowed = $('#adminNotAllowed');
    const container = $('#adminContainer');
    const subtitle = $('#adminSubtitle');
    const btnAdd = $('#adminAddBtn');
    const btnRefresh = $('#adminRefreshBtn');

    if (!state.user || !state.user.isAdmin) {
      if (notAllowed) notAllowed.hidden = false;
      if (container) container.hidden = true;
      if (btnAdd) btnAdd.disabled = true;
      if (btnRefresh) btnRefresh.disabled = true;
      if (subtitle) subtitle.textContent = state.user ? 'Tu cuenta no tiene privilegios de Super Administrador.' : 'Inicia sesión con tu cuenta de administrador.';
    } else {
      if (notAllowed) notAllowed.hidden = true;
      if (container) container.hidden = false;
      if (btnAdd) btnAdd.disabled = false;
      if (btnRefresh) btnRefresh.disabled = false;
      if (subtitle) subtitle.innerHTML = `¡Hola <b>${state.user.name || state.user.email}</b>! Gestiona el catálogo, inventario y ofertas.`;
      renderAdminList();
    }
    /* caer al final para también aplicar lógica del botón auth */
  }

  /* =============== SHARED (admin + store) authBtn según sesión =============== */
  if (!state.user) {
    /* ------ INVITADO: comportamiento normal link a login.html target=_blank ------ */
    if (authBtn) {
      authBtn.setAttribute('href', loginUrl());
      authBtn.removeAttribute('target');
      authBtn.removeAttribute('rel');
      authBtn.removeAttribute('role');
      authBtn.setAttribute('aria-expanded', 'false');
      authBtn.setAttribute('title', 'Iniciar sesión o crear cuenta');
      authBtn.setAttribute('aria-label', 'Iniciar sesión');
      /* Quitar handlers popover (preventDefault) si existen (en bind se asegura también) */
    }
    if (authIcon) authIcon.textContent = 'person_outline';
    if (popover) popover.hidden = true;
  } else {
    /* ------ LOGEADO: anular link, convertir en botón popover ------ */
    if (authBtn) {
      authBtn.setAttribute('href', '#account');
      authBtn.removeAttribute('target');
      authBtn.removeAttribute('rel');
      authBtn.setAttribute('title', 'Mi cuenta');
      authBtn.setAttribute('aria-label', 'Mi cuenta');
      authBtn.setAttribute('role', 'button');
    }
    if (authIcon) authIcon.textContent = 'person';
    if (loggedIn) loggedIn.hidden = false;

    const avatar = $('#userAvatar');
    if (avatar) avatar.textContent = initialsOf(state.user.name, state.user.email);
    const uName = $('#userName');
    if (uName) uName.textContent = state.user.name || 'Usuario';
    const uEmail = $('#userEmail');
    if (uEmail) uEmail.textContent = state.user.email || '';
    const verified = $('#profileVerified');
    if (verified) verified.textContent = state.user.raw.email_confirmed_at ? 'Verificado' : 'Pendiente de verificación';
    const joined = $('#profileJoined');
    const createdAt = new Date(state.user.raw.created_at);
    if (joined) joined.textContent = Number.isNaN(createdAt.getTime()) ? '—' : createdAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    if (badgeAdmin) badgeAdmin.hidden = !state.user.isAdmin;
    if (openAdminBtn) openAdminBtn.hidden = !state.user.isAdmin;
  }
}

function toggleAuthPopover(forceShow) {
  const popover = $('#authPopover');
  if (!popover) return;
  const will = forceShow !== undefined ? !!forceShow : popover.hidden;
  popover.hidden = !will;
  const trigger = $('#authBtn');
  if (trigger) trigger.setAttribute('aria-expanded', String(will));
  if (will) $('#closeProfileBtn')?.focus();
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
  $$('.auth-card__tab, .auth-tab, .glauth__tab').forEach(t => {
    t.classList.toggle('glauth__tab--active', t.dataset.tab === tabKey);
    if (t.getAttribute('role') === 'tab') {
      t.setAttribute('aria-selected', String(t.dataset.tab === tabKey));
      t.tabIndex = t.dataset.tab === tabKey ? 0 : -1;
    }
    t.classList.toggle('auth-card__tab--active', t.dataset.tab === tabKey);
    t.classList.toggle('auth-tab--active', t.dataset.tab === tabKey);
  });
  const signIn = tabKey === 'signin';
  const tSI = $('#tabSignIn'); if (tSI) {
    tSI.classList.toggle('auth-card__tab--active', signIn);
    tSI.classList.toggle('auth-tab--active', signIn);
  }
  const tSU = $('#tabSignUp'); if (tSU) {
    tSU.classList.toggle('auth-card__tab--active', !signIn);
    tSU.classList.toggle('auth-tab--active', !signIn);
  }
  const title = $('#authModalTitle');
  if (title) title.textContent = signIn ? 'Iniciar sesión' : 'Crear cuenta nueva';
  const tag = document.getElementById('authTag');
  if (tag) tag.textContent = signIn ? 'Accede a tu cuenta' : 'Únete a la comunidad Glitch';
  const sub = document.getElementById('authPanelSub');
  if (sub) sub.textContent = signIn
    ? 'Ingresa tu correo y contraseña para entrar a tu cuenta.'
    : 'Guarda tu carrito y lleva tus juegos contigo.';
  const nameField = $('#authNameField');
  if (nameField) nameField.hidden = signIn;
  const nameInput = $('#authName');
  if (nameInput) nameInput.required = !signIn;
  const passwordInput = $('#authPassword');
  if (passwordInput) passwordInput.autocomplete = signIn ? 'current-password' : 'new-password';
  const passwordHint = $('#authPasswordHint');
  if (passwordHint) passwordHint.hidden = signIn;
  const form = $('#authForm');
  if (form && form.getAttribute('role') === 'tabpanel') form.setAttribute('aria-labelledby', signIn ? 'tabSignIn' : 'tabSignUp');
  /* Olvidaste tu contraseña solo visible en tab signin */
  const forgotBtn = document.getElementById('forgotBtn');
  if (forgotBtn) forgotBtn.hidden = !signIn;
  const submitText = $('#authSubmitText');
  if (submitText) submitText.textContent = signIn ? 'Iniciar sesión' : 'Crear mi cuenta';
  const submitIcon = $('#authSubmitIcon');
  if (submitIcon) submitIcon.textContent = signIn ? 'login' : 'how_to_reg';
  const switchPrompt = document.getElementById('authSwitchPrompt');
  if (switchPrompt) {
    switchPrompt.innerHTML = signIn
      ? '<span>¿No tienes una cuenta aún?</span> <button type="button" class="auth-card__switch-link auth-tab" data-tab="signup">Crear cuenta gratis</button>'
      : '<span>¿Ya tienes una cuenta registrada?</span> <button type="button" class="auth-card__switch-link auth-tab" data-tab="signin">Iniciar sesión aquí</button>';
    const switchBtn = switchPrompt.querySelector('.auth-tab');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => switchAuthTab(switchBtn.dataset.tab));
    }
  }
  setAuthModalError('');
}

function setAuthModalError(msg, type = 'error') {
  const el = $('#authHint');
  if (!el) return;
  if (!msg) { el.hidden = true; el.className = 'auth-hint'; el.innerHTML = ''; return; }
  el.hidden = false;
  el.className = 'auth-hint ' + type;
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
  const btn = $('#authSubmitBtn');
  const loader = document.querySelector('.auth-card__submit-loader, .glauth__submit-loader');
  const iconSubmit = document.getElementById('authSubmitIcon');
  const textSubmit = document.getElementById('authSubmitText');
  if (btn) btn.disabled = true;
  if (loader) loader.hidden = false;
  if (iconSubmit) iconSubmit.hidden = true;
  if (textSubmit) textSubmit.hidden = true;
  setAuthModalError('');
  try {
    if (state.authTab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast('Bienvenido de vuelta 🎮', 'success');
      /* Si estamos en login.html: cerrar pestaña (si fue abierta por script) o redirigir a tienda */
      if (PAGE === 'login') {
        setTimeout(() => {
          returnAfterLogin();
        }, 600);
      } else {
        toggleAuthModal(false);
      }
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
      setAuthModalError('✅ <b>Cuenta creada</b>. Te enviamos un correo de verificación a <b>' + email + '</b> desde glitchshopoficial@gmail.com. Revisa tu bandeja de entrada (y spam si no llega) para confirmarla antes de iniciar sesión.', 'success');
    }
  } catch (err) {
    let msg = err.message || 'Error desconocido.';
    if (msg.toLowerCase().includes('invalid') && msg.toLowerCase().includes('credentials')) msg = 'Correo o contraseña incorrectos. Verifica e intenta de nuevo.';
    else if (msg.toLowerCase().includes('user')) msg = 'Usuario no registrado. Cambia a la pestaña "Crear cuenta".';
    else if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('confirm')) msg = 'Tu correo aún no está verificado. Revisa tu bandeja de entrada y confirma.';
    setAuthModalError('❌ ' + msg, 'error');
  } finally {
    if (btn) btn.disabled = false;
    if (loader) loader.hidden = true;
    if (iconSubmit) iconSubmit.hidden = false;
    if (textSubmit) textSubmit.hidden = false;
  }
}

async function handleSignOut() {
  const button = $('#signOutBtn');
  if (button) button.disabled = true;
  try {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  } catch (e) {
    showToast('No se pudo cerrar la sesión. Inténtalo de nuevo.', 'error');
    return;
  } finally {
    if (button) button.disabled = false;
  }
  state.user = null;
  state.cart = readCart('gs_cart_guest') || [];
  renderAuthUI();

  if (PAGE !== 'login') {
    renderCart();
    if ($('#featuredGrid')) renderFeatured();
    if ($('#productsGrid')) renderProducts();
  }
  showToast('Sesión cerrada correctamente.', 'warn');

  /* Si estamos en admin page sin user: después de cerrar sesión redirigir a index */
  if (PAGE === 'admin') {
    setTimeout(() => window.location.href = 'index.html', 700);
  }
}

/* -----------------------------------------------------------
   5. CARRITO (localStorage + sync Supabase si user logged)
   ----------------------------------------------------------- */
function readCart(key) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return null;
    const items = JSON.parse(saved);
    if (!Array.isArray(items)) return null;
    return items.flatMap(item => {
      const product = PRODUCTS.find(p => p.id === Number(item.id));
      const qty = Number(item.qty);
      return product && Number.isInteger(qty) && qty > 0
        ? [{ id: product.id, title: product.title, price: product.price, emoji: product.emoji, platformLabel: product.platformLabel, qty }] : [];
    });
  } catch { return null; }
}

function mergeCarts(a, b) {
  const out = a.map(item => ({ ...item }));
  for (const item of b) {
    const existing = out.find(x => x.id === item.id);
    if (existing) existing.qty += item.qty;
    else out.push({ ...item });
  }
  return out;
}

let cartWriteQueue = Promise.resolve();
function persistCart() {
  try {
    const key = state.user ? 'gs_cart_' + state.user.id : 'gs_cart_guest';
    localStorage.setItem(key, JSON.stringify(state.cart));
  } catch (error) { console.warn('[Cart] local save failed:', error.message); }
  if (state.user) syncCartToDB();
}

async function syncCartFromDB(hasCachedCart = false) {
  if (!state.user) return;
  const userId = state.user.id;
  state.syncingCart = true;
  let restored = hasCachedCart;
  try {
    // A device's saved cart includes edits that may not have reached Supabase.
    if (!hasCachedCart && supabase) {
      const { data, error } = await supabase.from('cart_items').select('product_id, quantity').eq('user_id', userId);
      if (error) throw error;
      if (state.user?.id !== userId) return;
      const remote = (data || []).flatMap(row => {
        const p = PRODUCTS.find(product => product.id === Number(row.product_id));
        return p ? [{ id: p.id, title: p.title, price: p.price, platformLabel: p.platformLabel, emoji: p.emoji, qty: row.quantity }] : [];
      });
      state.cart = mergeCarts(remote, state.cart);
      restored = true;
    }
  } catch (error) { console.warn('[Cart] restore failed:', error.message); }
  finally {
    if (state.user?.id === userId) {
      state.syncingCart = false;
      if (restored) {
        try {
          localStorage.setItem('gs_cart_' + userId, JSON.stringify(state.cart));
          localStorage.removeItem('gs_cart_guest');
        } catch (error) { console.warn('[Cart] cache failed:', error.message); }
        syncCartToDB();
      }
      renderCart();
      if ($('#featuredGrid')) renderFeatured();
      if ($('#productsGrid')) renderProducts();
    }
  }
}

function syncCartToDB() {
  if (!state.user || !supabase || state.syncingCart) return cartWriteQueue;
  const userId = state.user.id;
  const rows = state.cart.map(c => ({ user_id: userId, product_id: c.id, quantity: c.qty }));
  // Serialize snapshots so a slower previous write cannot overwrite a later edit.
  cartWriteQueue = cartWriteQueue.then(async () => {
    if (rows.length) {
      const { error } = await supabase.from('cart_items').upsert(rows, { onConflict: 'user_id,product_id' });
      if (error) throw error;
    }
    let deletion = supabase.from('cart_items').delete().eq('user_id', userId);
    if (rows.length) deletion = deletion.not('product_id', 'in', '(' + rows.map(r => r.product_id).join(',') + ')');
    const { error } = await deletion;
    if (error) throw error;
  }).catch(error => console.warn('[Cart] sync failed; local cart retained:', error.message));
  return cartWriteQueue;
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
        ${p.image_url
          ? `<img class="product__img" src="${p.image_url}" alt="${p.title}" loading="lazy" />`
          : `<div class="product__emoji">${p.emoji}</div>`}
      </div>
      <div class="product__body">
        <h3 class="product__title"><button type="button" class="product__detail-trigger" aria-haspopup="dialog" aria-controls="productDetailDialog">${escapeHtml(p.title)}</button></h3>
        ${p.description ? `<p class="product__desc">${p.description}</p>` : ''}
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
  $$('.product', rootEl || document).forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('button, a') && !event.target.closest('.product__detail-trigger')) return;
      openProductDetail(+card.dataset.id, card);
    });
  });
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

/* Card-to-dialog transition using the supplied GSAP Flip / CustomEase effect. */
let productDetailModal = null;

class PrettyModal {
  constructor(dialog) {
    this.dialog = dialog;
    if (window.gsap && window.Flip && window.CustomEase) {
      window.gsap.registerPlugin(window.Flip, window.CustomEase);
      this.ease = window.CustomEase.create('pretty-modal', 'M0,0 C0.305,0.206 0.116,0.567 0.3,0.8 0.394,0.921 0.491,1 1,1');
    }
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      this.close();
    });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target.closest('[data-detail-close]') ||
          (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom))) this.close();
    });
    dialog.addEventListener('close', () => {
      this.flipAnimation?.kill();
      this.animation?.cancel();
      this.closing = false;
      document.body.style.overflow = this.previousOverflow;
      dialog.classList.remove('pretty-modal-opening', 'pretty-modal-closing');
      this.restoreStyle();
      this.getOrigin()?.querySelector('.product__detail-trigger')?.focus({ preventScroll: true });
    });
  }

  restoreStyle() {
    if (this.originalStyle === null) this.dialog.removeAttribute('style');
    else this.dialog.setAttribute('style', this.originalStyle);
  }

  getOrigin() {
    // Adding to the cart re-renders the cards; resolve the new card when needed.
    return this.origin?.isConnected ? this.origin :
      this.originGrid?.querySelector(`.product[data-id="${this.productId}"]`);
  }

  cardTransform(rect, target) {
    return `translate(${rect.left - target.left}px, ${rect.top - target.top}px) scale(${rect.width / target.width}, ${rect.height / target.height})`;
  }

  animate(frames, done) {
    // Keep the requested animation visible even when the OS requests reduced motion.
    // Native fallback also animates if a GSAP asset fails to load.
    if (!this.dialog.animate) {
      done();
      return;
    }
    const animation = this.dialog.animate(frames, {
      duration: 700, easing: 'cubic-bezier(.3,.2,.12,1)', fill: 'both'
    });
    this.animation = animation;
    animation.onfinish = () => { animation.cancel(); done(); };
  }

  open(origin) {
    if (this.dialog.open) return;
    this.origin = origin;
    this.originGrid = origin.parentElement;
    this.productId = origin.dataset.id;
    this.originalStyle = this.dialog.getAttribute('style');
    const flipId = `pretty-modal-${this.productId}`;
    origin.dataset.flipId = this.dialog.dataset.flipId = flipId;
    const originState = this.ease ? window.Flip.getState(origin) : null;
    const rect = origin.getBoundingClientRect();
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.dialog.showModal();
    this.dialog.scrollTop = 0;
    if (originState) {
      this.flipAnimation = window.Flip.from(originState, {
        targets: this.dialog,
        scale: true,
        ease: this.ease,
        toggleClass: 'pretty-modal-opening',
        duration: 0.7,
        onComplete: () => this.restoreStyle()
      });
      return;
    }
    const target = this.dialog.getBoundingClientRect();
    this.dialog.classList.add('pretty-modal-opening');
    this.animate([
      { transform: this.cardTransform(rect, target), opacity: 0, filter: 'blur(8px)', borderRadius: '20px' },
      { transform: 'none', opacity: 1, filter: 'blur(0px)', borderRadius: '24px' }
    ], () => this.dialog.classList.remove('pretty-modal-opening'));
  }

  close() {
    if (!this.dialog.open || this.closing) return;
    this.closing = true;
    const origin = this.getOrigin();
    const originRect = origin?.getBoundingClientRect();
    const originVisible = originRect && originRect.width && originRect.bottom > 0 && originRect.top < window.innerHeight;
    if (this.ease && originVisible) {
      this.flipAnimation?.kill();
      this.dialog.classList.remove('pretty-modal-opening');
      origin.dataset.flipId = this.dialog.dataset.flipId;
      this.flipAnimation = window.Flip.to(window.Flip.getState(origin), {
        targets: this.dialog,
        scale: true,
        ease: this.ease,
        toggleClass: 'pretty-modal-closing',
        duration: 0.7,
        onComplete: () => this.dialog.close()
      });
      return;
    }
    const current = getComputedStyle(this.dialog);
    const first = { transform: current.transform, opacity: current.opacity, filter: current.filter, borderRadius: current.borderRadius };
    this.flipAnimation?.kill();
    this.animation?.cancel();
    this.dialog.classList.remove('pretty-modal-opening');
    this.dialog.classList.add('pretty-modal-closing');
    const rect = this.getOrigin()?.getBoundingClientRect();
    const target = this.dialog.getBoundingClientRect();
    const visible = rect && rect.width && rect.bottom > 0 && rect.top < window.innerHeight;
    this.animate([first, {
      transform: visible ? this.cardTransform(rect, target) : 'scale(.9)',
      opacity: 0, filter: 'blur(32px)', borderRadius: '400px'
    }], () => this.dialog.close());
  }
}

function openProductDetail(id, origin) {
  const p = PRODUCTS.find(product => product.id === id);
  if (!p || productDetailModal?.dialog.open) return;
  if (!productDetailModal) {
    const dialog = document.createElement('dialog');
    dialog.id = 'productDetailDialog';
    dialog.className = 'product-detail';
    dialog.setAttribute('aria-labelledby', 'productDetailTitle');
    document.body.appendChild(dialog);
    productDetailModal = new PrettyModal(dialog);
  }
  const stock = stockBadge(p.stock);
  const discount = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const categories = { juegos: 'Videojuego', consolas: 'Consola', accesorios: 'Accesorio', merch: 'Merchandising' };
  const dialog = productDetailModal.dialog;
  dialog.innerHTML = `
    <button type="button" class="icon-btn product-detail__close" data-detail-close aria-label="Cerrar detalle" autofocus>
      <span class="material-icons" aria-hidden="true">close</span>
    </button>
    <div class="product-detail__layout">
      <div class="product-detail__visual">
        <span class="product-detail__tag">${p.isNew ? 'Nuevo · ' : ''}${escapeHtml(p.platformLabel || p.platform)}</span>
        ${p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" class="product-detail__image" />`
          : `<span class="product-detail__emoji" role="img" aria-label="${escapeHtml(p.title)}">${escapeHtml(p.emoji || '🎮')}</span>`}
      </div>
      <div class="product-detail__info">
        <p class="product-detail__eyebrow">${escapeHtml(categories[p.category] || p.category)} · GLITCH SHOP</p>
        <h2 id="productDetailTitle">${escapeHtml(p.title)}</h2>
        <span class="product__stock ${stock.cls}">${stock.label}</span>
        <p class="product-detail__description">${escapeHtml(p.description || `Consulta disponibilidad y detalles de ${p.title} con la tienda.`)}</p>
        <dl class="product-detail__specs">
          <div><dt>Plataforma</dt><dd>${escapeHtml(p.platformLabel || p.platform)}</dd></div>
          <div><dt>Categoría</dt><dd>${escapeHtml(categories[p.category] || p.category)}</dd></div>
        </dl>
        <div class="product__price-row">
          <span class="product__price">${formatPrice(p.price)}</span><span class="product-detail__currency">MXN</span>
          ${discount ? `<span class="product__price--old">${formatPrice(p.oldPrice)}</span><span class="product__discount">AHORRA ${discount}%</span>` : ''}
        </div>
        <button type="button" class="product__add product-detail__add" ${p.stock === 'soldout' ? 'disabled' : ''}>
          <span class="material-icons" aria-hidden="true">shopping_cart</span>${p.stock === 'soldout' ? 'Agotado' : 'Añadir al carrito'}
        </button>
        <p class="product-detail__feedback" role="status" aria-live="polite"></p>
      </div>
    </div>`;
  $('.product-detail__add', dialog).addEventListener('click', () => {
    if (p.stock === 'soldout') return;
    addToCart(p.id);
    $('.product-detail__feedback', dialog).textContent = `Añadido al carrito · ${state.cart.find(item => item.id === p.id).qty} en tu carrito`;
  });
  productDetailModal.open(origin);
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

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if ($('#cartSubtotal')) $('#cartSubtotal').textContent = formatPrice(subtotal);
  if ($('#cartTotal')) $('#cartTotal').textContent = formatPrice(subtotal);
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
  lines.push('Hola, Glitch Shop. Quiero comprar los siguientes productos:');
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
  lines.push(`💰 *Total de productos:* ${formatPrice(sub)}`);
  lines.push('');
  lines.push('🙋 Hola! Quiero confirmar este pedido. ¿Podrían indicarme método de pago y tiempo de entrega? ¡Gracias! 🎮');

  return lines.join('\n');
}

function updateWhatsAppHref() {
  const button = $('#whatsappCheckoutBtn');
  if (button) button.disabled = !state.cart.length;
}

function handleWhatsAppClick(event) {
  event.preventDefault();
  if (!state.cart.length) { showToast('Tu carrito está vacío.', 'warn'); return; }
  const message = encodeURIComponent(buildWhatsAppMessage());
  const phone = OWNER_WHATSAPP_E164.replace(/\D/g, '');
  $('#whatsappWebLink').href = 'https://web.whatsapp.com/send?phone=' + phone + '&text=' + message;
  $('#whatsappAppLink').href = 'https://wa.me/' + phone + '?text=' + message;
  $('#whatsappOrderPreview').textContent = buildWhatsAppMessage();
  $('#whatsappDialog').showModal();
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
    const { error } = await supabase.from('orders').insert({
      user_id: state.user.id,
      customer_name: state.user.name || null,
      customer_email: state.user.email || null,
      items_snapshot: items,
      subtotal_mxn: Math.round(sub * 100) / 100,
      total_mxn: Math.round(sub * 100) / 100,
      whatsapp_msg: msg,
      owner_phone_e164: OWNER_WHATSAPP_E164,
      status: 'pending',
    });
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('[Orders] saveOrderToDB fail:', e.message);
    return false;
  }
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

let adminRows = [];

async function renderAdminList() {
  const listEl = $('#adminList');
  if (!listEl) return;
  const countEl = $('#adminProductCount');
  listEl.innerHTML = '<div class="admin-empty"><span class="material-icons" style="font-size:36px;opacity:.4;display:block;margin-bottom:8px;">cloud_sync</span>Cargando...</div>';

  let list = [];
  adminRows = [];
  if (supabase && state.user?.isAdmin) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (error) throw error;
      adminRows = data || [];
      list = adminRows.map(row => mapDBProduct(row));
    } catch (e) {
      console.warn('[Admin] load products failed:', e.message);
      list = [];
      adminRows = [];
    }
  }
  if (!list.length) list = PRODUCTS; /* Fallback si la DB no responde */

  if (countEl) countEl.textContent = String(list.length);

  if (!list.length) {
    listEl.innerHTML = '<div class="admin-empty"><span class="material-icons" style="font-size:36px;opacity:.4;display:block;margin-bottom:8px;">inventory_2</span>No hay productos todavía. Usa "Añadir producto".</div>';
    return;
  }

  listEl.innerHTML = list.map(p => {
    const published = p.stock !== 'soldout';
    const thumb = p.image_url
      ? `<img class="admin-item__thumb" src="${p.image_url}" alt="" loading="lazy" />`
      : `<div class="admin-item__emoji">${p.emoji || '🎮'}</div>`;
    return `
    <div class="admin-item" data-id="${p.id}">
      ${thumb}
      <div class="admin-item__info">
        <div class="admin-item__title">${p.title}</div>
        ${p.description ? `<div class="admin-item__desc">${p.description}</div>` : ''}
        <div class="admin-item__meta">
          <span><span class="material-icons" style="font-size:14px;">category</span> ${p.category || 'N/A'}</span>
          <span><span class="material-icons" style="font-size:14px;">devices</span> ${p.platformLabel || '-'}</span>
          <span class="admin-item__price">${formatPrice(p.price)}</span>
          <span class="badge ${published ? 'badge--published' : 'badge--hidden'}">${published ? 'Publicado' : 'Oculto'}</span>
        </div>
      </div>
      <div class="admin-item__actions">
        <button class="icon-btn" title="Editar producto" data-admin-edit="${p.id}"><span class="material-icons">edit</span></button>
        <button class="icon-btn" title="Eliminar producto" data-admin-del="${p.id}"><span class="material-icons" style="color:#ef4444;">delete</span></button>
      </div>
    </div>`;
  }).join('');

  $$('[data-admin-edit]').forEach(b => b.addEventListener('click', () => {
    const id = +b.dataset.adminEdit;
    const row = adminRows.find(r => r.id === id);
    openProductForm(row || PRODUCTS.find(p => p.id === id));
  }));
  $$('[data-admin-del]').forEach(b => b.addEventListener('click', () => deleteProduct(+b.dataset.adminDel)));
}

function mapDBProduct(row, catMap, platMap) {
  const cats = catMap || { 1: 'consolas', 2: 'juegos', 3: 'accesorios', 4: 'merch' };
  const plats = platMap || { 1: 'playstation', 2: 'xbox', 3: 'nintendo', 4: 'pc' };
  return {
    id: row.id,
    title: row.title,
    category: cats[row.category_id] || 'juegos',
    platform: plats[row.platform_id] || 'pc',
    emoji: row.emoji || '🎮',
    image_url: row.image_url || null,
    description: row.description || null,
    sku: row.sku || null,
    weight_kg: row.weight_kg != null ? +row.weight_kg : null,
    price: +row.price,
    oldPrice: row.old_price != null ? +row.old_price : null,
    stock: row.stock || 'available',
    offer: !!row.is_offer,
    isNew: !!row.is_new,
    platformLabel: row.platform_label || 'PC',
  };
}

/* Carga el catálogo de la tienda desde Supabase (products + featured).
   Reemplaza el array local PRODUCTS cuando la DB responde, para que los
   productos publicados desde el panel aparezcan en index/catalogo. */
async function loadProductsFromDB() {
  if (!supabase) return;
  try {
    const [catRes, platRes, prodRes, featRes] = await Promise.all([
      supabase.from('categories').select('id,slug'),
      supabase.from('platforms').select('id,slug'),
      supabase.from('products').select('*').order('id', { ascending: true }),
      supabase.from('featured_products').select('product_id').order('sort_order', { ascending: true }),
    ]);
    if (prodRes.error || !prodRes.data || !prodRes.data.length) return; /* mantiene catálogo local */

    const catMap = {}; (catRes.data || []).forEach(c => { catMap[c.id] = c.slug; });
    const platMap = {}; (platRes.data || []).forEach(p => { platMap[p.id] = p.slug; });

    const mapped = prodRes.data.map(r => mapDBProduct(r, catMap, platMap));
    PRODUCTS.length = 0;
    mapped.forEach(p => PRODUCTS.push(p));

    const featIds = (featRes.data || []).map(f => f.product_id);
    if (featIds.length) {
      FEATURED_IDS.length = 0;
      featIds.forEach(id => FEATURED_IDS.push(id));
    }

    if ($('#featuredGrid')) renderFeatured();
    if ($('#productsGrid')) renderProducts();
  } catch (e) {
    console.warn('[Catalog] loadProductsFromDB failed:', e.message);
  }
}

/* -----------------------------------------------------------
   10b. ADMIN PANEL — Formulario de producto + Miembros
   ----------------------------------------------------------- */
const CATEGORY_SLUG_TO_ID = { consolas: 1, juegos: 2, accesorios: 3, merch: 4 };
const PLATFORM_SLUG_TO_ID = { playstation: 1, xbox: 2, nintendo: 3, pc: 4 };
let selectedImageFile = null;

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(value) {
  if (!value) return 'nunca';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'nunca';
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

function setVal(selector, value) {
  const el = $(selector);
  if (!el) return;
  if (el.type === 'checkbox') el.checked = !!value;
  else el.value = value == null ? '' : value;
}

function setFormError(msg) {
  const el = $('#productFormError');
  if (!el) return;
  if (msg) { el.textContent = msg; el.hidden = false; }
  else { el.textContent = ''; el.hidden = true; }
}

function showImagePreview(url) {
  const img = $('#fImagePreview');
  const empty = $('#uploadBoxEmpty');
  const name = $('#fImageName');
  const remove = $('#fImageRemove');
  if (img) { img.src = url; img.hidden = false; }
  if (empty) empty.hidden = true;
  if (name) name.textContent = 'Imagen lista (se subirá al guardar)';
  if (remove) remove.hidden = false;
}

function clearImagePreview() {
  selectedImageFile = null;
  const img = $('#fImagePreview');
  const empty = $('#uploadBoxEmpty');
  const name = $('#fImageName');
  const remove = $('#fImageRemove');
  const fileInput = $('#fImage');
  if (img) { img.src = ''; img.hidden = true; }
  if (empty) empty.hidden = false;
  if (name) name.textContent = 'Haz clic para subir una imagen (JPG, PNG o WebP)';
  if (remove) remove.hidden = true;
  if (fileInput) fileInput.value = '';
}

function handleImageSelect(file) {
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    setFormError('Formato no soportado. Usa JPG, PNG o WebP.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setFormError('La imagen no debe superar 5 MB.');
    return;
  }
  selectedImageFile = file;
  setFormError('');
  showImagePreview(URL.createObjectURL(file));
}

function openProductForm(product) {
  const modal = $('#productFormModal');
  if (!modal) return;
  setFormError('');
  const isEdit = !!product;
  const titleEl = $('#productFormTitle');
  const submitBtn = $('#productFormSubmit');
  if (titleEl) titleEl.innerHTML = isEdit
    ? '<span class="material-icons" aria-hidden="true">edit</span> Editar producto'
    : '<span class="material-icons" aria-hidden="true">add_box</span> Añadir producto';

  $('#productForm')?.reset();
  clearImagePreview();
  setVal('#fId', '');
  setVal('#fCategory', '2');
  setVal('#fPlatform', '4');
  setVal('#fStock', 'available');
  setVal('#fOffer', false);
  setVal('#fNew', false);

  if (product) {
    setVal('#fId', String(product.id));
    setVal('#fTitle', product.title || '');
    setVal('#fDescription', product.description || '');
    setVal('#fEmoji', product.emoji || '');
    setVal('#fCategory', String(product.category_id != null ? product.category_id : (CATEGORY_SLUG_TO_ID[product.category] || 2)));
    setVal('#fPlatform', String(product.platform_id != null ? product.platform_id : (PLATFORM_SLUG_TO_ID[product.platform] || 4)));
    setVal('#fPlatformLabel', product.platformLabel || '');
    setVal('#fPrice', product.price != null ? String(product.price) : '');
    setVal('#fOldPrice', product.oldPrice != null ? String(product.oldPrice) : '');
    setVal('#fStock', product.stock || 'available');
    setVal('#fSku', product.sku || '');
    setVal('#fWeight', product.weight_kg != null ? String(product.weight_kg) : '');
    setVal('#fOffer', !!product.offer);
    setVal('#fNew', !!product.isNew);
    if (product.image_url) showImagePreview(product.image_url);
  }

  if (submitBtn) submitBtn.disabled = false;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#fTitle')?.focus(), 50);
}

function closeProductForm() {
  const modal = $('#productFormModal');
  if (modal) modal.hidden = true;
  document.body.style.overflow = '';
}

async function uploadProductImage(file) {
  if (!supabase || !file) return null;
  const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
  const path = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

async function handleProductSubmit(e) {
  e.preventDefault();
  setFormError('');
  if (!supabase || !state.user?.isAdmin) {
    setFormError('No tienes permisos de administrador.');
    return;
  }
  const id = ($('#fId')?.value || '').trim();
  const title = ($('#fTitle')?.value || '').trim();
  const price = parseFloat($('#fPrice')?.value || '0');
  if (!title) { setFormError('El título es obligatorio.'); $('#fTitle')?.focus(); return; }
  if (!Number.isFinite(price) || price < 0) { setFormError('El precio debe ser un número válido.'); $('#fPrice')?.focus(); return; }

  const submitBtn = $('#productFormSubmit');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="material-icons" aria-hidden="true">hourglass_top</span> Guardando...'; }

  try {
    let imageUrl = ($('#fImagePreview')?.src && !selectedImageFile) ? $('#fImagePreview').src : null;
    if (imageUrl && imageUrl.startsWith('blob:')) imageUrl = null;
    if (selectedImageFile) imageUrl = await uploadProductImage(selectedImageFile);

    const payload = {
      title,
      description: ($('#fDescription')?.value || '').trim() || null,
      emoji: ($('#fEmoji')?.value || '').trim() || null,
      category_id: +($('#fCategory')?.value || 2),
      platform_id: +($('#fPlatform')?.value || 4),
      platform_label: ($('#fPlatformLabel')?.value || '').trim() || null,
      price,
      old_price: (($('#fOldPrice')?.value && parseFloat($('#fOldPrice').value) > 0) ? parseFloat($('#fOldPrice').value) : null),
      stock: $('#fStock')?.value || 'available',
      is_offer: !!$('#fOffer')?.checked,
      is_new: !!$('#fNew')?.checked,
      sku: ($('#fSku')?.value || '').trim() || null,
      weight_kg: (($('#fWeight')?.value && parseFloat($('#fWeight').value) > 0) ? parseFloat($('#fWeight').value) : null),
      image_url: imageUrl,
    };

    if (id) {
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) throw error;
      showToast('Producto actualizado.', 'success');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;
      showToast('Producto creado.', 'success');
    }

    closeProductForm();
    await renderAdminList();
    loadProductsFromDB();
  } catch (err) {
    console.error('[Admin] save product failed:', err);
    setFormError('No se pudo guardar: ' + (err.message || err));
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<span class="material-icons" aria-hidden="true">save</span> Guardar producto'; }
  }
}

async function deleteProduct(id) {
  if (!supabase || !state.user?.isAdmin) return;
  const row = adminRows.find(r => r.id === id);
  const p = row ? mapDBProduct(row) : PRODUCTS.find(x => x.id === id);
  const name = p ? p.title : ('#' + id);
  if (!confirm('¿Eliminar el producto "' + name + '" de forma permanente? Esta acción no se puede deshacer.')) return;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    showToast('Producto eliminado.', 'success');
    await renderAdminList();
    loadProductsFromDB();
  } catch (err) {
    console.error('[Admin] delete product failed:', err);
    showToast('No se pudo eliminar: ' + (err.message || err), 'error');
  }
}

function switchAdminTab(tab) {
  const productsPanel = $('#productsPanel');
  const membersPanel = $('#membersPanel');
  const tabProducts = $('#tabProductsBtn');
  const tabMembers = $('#tabMembersBtn');
  if (!productsPanel || !membersPanel) return;
  const isProducts = tab === 'products';
  productsPanel.hidden = !isProducts;
  membersPanel.hidden = isProducts;
  if (tabProducts) { tabProducts.classList.toggle('admin-tab--active', isProducts); tabProducts.setAttribute('aria-selected', String(isProducts)); }
  if (tabMembers) { tabMembers.classList.toggle('admin-tab--active', !isProducts); tabMembers.setAttribute('aria-selected', String(!isProducts)); }
  if (isProducts) renderAdminList();
  else renderMembers();
}

function renderMembers() {
  const el = $('#membersList');
  if (!el) return;
  if (!supabase || !state.user?.isAdmin) {
    el.innerHTML = '<div class="admin-empty"><span class="material-icons" style="font-size:36px;opacity:.4;display:block;margin-bottom:8px;">lock</span>No tienes permisos para ver miembros.</div>';
    return;
  }
  el.innerHTML = '<div class="admin-empty"><span class="material-icons" style="font-size:36px;opacity:.4;display:block;margin-bottom:8px;">cloud_sync</span>Cargando miembros...</div>';

  supabase.rpc('get_members').then(({ data, error }) => {
    if (error) {
      el.innerHTML = `
        <div class="admin-empty">
          <span class="material-icons" style="font-size:36px;opacity:.4;display:block;margin-bottom:8px;">build</span>
          <div style="font-weight:600;color:var(--text);margin-bottom:6px;">Falta configurar la base de datos</div>
          <p style="max-width:480px;margin:0 auto 12px;font-size:13px;">Ejecuta el archivo <code>supabase/migrations/003_members_and_storage.sql</code> en el SQL Editor de Supabase para poder listar los miembros.</p>
          <p style="font-size:12px;color:var(--text-muted);">Detalle: ${error.message || error}</p>
        </div>`;
      return;
    }
    const members = data || [];
    if (!members.length) {
      el.innerHTML = '<div class="admin-empty"><span class="material-icons" style="font-size:36px;opacity:.4;display:block;margin-bottom:8px;">group_off</span>Aún no hay miembros registrados.</div>';
      return;
    }
    el.innerHTML = members.map(m => {
      const initials = escapeHtml((m.name || m.email || '?').trim().slice(0, 2).toUpperCase());
      const isAdmin = m.role === 'super_admin';
      return `
        <div class="member-item">
          <div class="member-item__avatar" aria-hidden="true">${initials}</div>
          <div class="member-item__info">
            <div class="member-item__name">${escapeHtml(m.name || 'Sin nombre')} ${isAdmin ? '<span class="badge badge--admin-role">Super Admin</span>' : ''}</div>
            <div class="member-item__email">${escapeHtml(m.email || '-')}</div>
          </div>
          <div class="member-item__meta">
            <span>Miembro desde ${fmtDate(m.created_at)}</span>
            <span>Último acceso ${fmtDate(m.last_sign_in_at)}</span>
          </div>
        </div>`;
    }).join('');
  }).catch(err => {
    console.error('[Admin] get_members failed:', err);
    el.innerHTML = '<div class="admin-empty">No se pudieron cargar los miembros. Revisa la consola.</div>';
  });
}

/* -----------------------------------------------------------
   11. UI BINDINGS (auth, admin, cart, checkout, tabs, search submit)
   ----------------------------------------------------------- */
function bindAuthUi() {
  /* =============== LOGIN PAGE: tabs, submit auth. Sin popover ni modales. =============== */
  if (PAGE === 'login') {
    const urlTab = new URLSearchParams(window.location.search).get('tab');
    if (urlTab === 'signup' || urlTab === 'register') {
      state.authTab = 'signup';
    }
    switchAuthTab(state.authTab);
    $$('.auth-card__tab, .auth-tab, .glauth__tab').forEach(t => {
      t.addEventListener('click', () => switchAuthTab(t.dataset.tab));
      if (t.getAttribute('role') === 'tab') t.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'signin' : event.key === 'End' ? 'signup' : state.authTab === 'signin' ? 'signup' : 'signin';
        switchAuthTab(next);
        document.getElementById(next === 'signin' ? 'tabSignIn' : 'tabSignUp').focus();
      });
    });
    const authForm = $('#authForm');
    if (authForm) authForm.addEventListener('submit', handleAuthSubmit);

    /* Botón ojito: mostrar / ocultar contraseña */
    const eyeBtn = document.getElementById('togglePassword');
    const passInput = document.getElementById('authPassword');
    if (eyeBtn && passInput) {
      eyeBtn.addEventListener('click', () => {
        const isHidden = passInput.type === 'password';
        passInput.type = isHidden ? 'text' : 'password';
        const icon = eyeBtn.querySelector('.material-icons');
        if (icon) icon.textContent = isHidden ? 'visibility_off' : 'visibility';
        eyeBtn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
        eyeBtn.setAttribute('title', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
      });
    }

    /* Botón "Olvidaste tu contraseña": manda reset password por correo */
    const forgotBtn = document.getElementById('forgotBtn');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('authEmail');
        const email = emailInput ? (emailInput.value || '').trim() : '';
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
          setAuthModalError('⚠️ Escribe primero tu <b>correo electrónico</b> en el campo de arriba y luego presiona "Olvidaste tu contraseña".', 'warn');
          if (emailInput) emailInput.focus();
          return;
        }
        if (!supabase) return;
        forgotBtn.disabled = true;
        setAuthModalError('');
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/login.html?tab=reset',
          });
          if (error) throw error;
          setAuthModalError('✅ Te enviamos un enlace para restablecer tu contraseña a <b>' + email + '</b>. Revisa tu bandeja de entrada (o spam si no llega).', 'success');
        } catch (err) {
          setAuthModalError('❌ No se pudo enviar el enlace: ' + (err.message || err), 'error');
        } finally {
          forgotBtn.disabled = false;
        }
      });
    }
    return;
  }

  /* Resolve the session before choosing profile or sign-in navigation. */
  const authBtn = $('#authBtn');
  const popover = $('#authPopover');
  if (authBtn) {
    authBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      await authReady;
      if (state.user) toggleAuthPopover();
      else window.location.href = loginUrl();
    });
    authBtn.addEventListener('keydown', (event) => {
      if (event.key === ' ' && state.user) {
        event.preventDefault();
        authBtn.click();
      }
    });
  }
  const closeProfile = () => {
    toggleAuthPopover(false);
    authBtn?.focus();
  };
  $('#closeProfileBtn')?.addEventListener('click', closeProfile);
  document.addEventListener('click', (event) => {
    if (popover && !popover.hidden && !popover.contains(event.target) && !authBtn?.contains(event.target)) toggleAuthPopover(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popover && !popover.hidden) closeProfile();
  });

  const signOutBtn = $('#signOutBtn');
  if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);

  /* Admin toolbar (SOLO admin.html tiene estos botones fuera de modal) */
  const adminRefresh = $('#adminRefreshBtn');
  if (adminRefresh) adminRefresh.addEventListener('click', renderAdminList);
  const adminAdd = $('#adminAddBtn');
  if (adminAdd) adminAdd.addEventListener('click', () => openProductForm());

  /* Pestañas del panel admin */
  $('#tabProductsBtn')?.addEventListener('click', () => switchAdminTab('products'));
  $('#tabMembersBtn')?.addEventListener('click', () => switchAdminTab('members'));

  /* Formulario de producto (solo admin.html) */
  const productForm = $('#productForm');
  if (productForm) productForm.addEventListener('submit', handleProductSubmit);
  $('#closeProductFormBtn')?.addEventListener('click', closeProductForm);
  $('#productFormCancel')?.addEventListener('click', closeProductForm);
  $$('[data-close-form]').forEach(el => el.addEventListener('click', closeProductForm));
  const imageInput = $('#fImage');
  if (imageInput) imageInput.addEventListener('change', () => handleImageSelect(imageInput.files && imageInput.files[0]));
  const uploadBox = $('#uploadBox');
  if (uploadBox && imageInput) {
    uploadBox.addEventListener('click', () => imageInput.click());
    uploadBox.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); imageInput.click(); }
    });
  }
  $('#fImageRemove')?.addEventListener('click', clearImagePreview);
  document.addEventListener('keydown', e => {
    const modal = $('#productFormModal');
    if (e.key === 'Escape' && modal && !modal.hidden) closeProductForm();
  });

  if (PAGE === 'admin') return;

  /* STORE: click link panel admin cierra el popover */
  const adminBtn = $('#openAdminBtn');
  if (adminBtn) adminBtn.addEventListener('click', () => toggleAuthPopover(false));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      toggleAuthPopover(false);
      if (popover) popover.hidden = true;
    }
  });
}

function bindUi() {
  /* Login page: no requiere hamburger, cart, checkout, etc. */
  if (PAGE === 'login') return;

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
      window.location.href = loginUrl();
      return;
    }
    const total = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
    checkoutBtn.disabled = true;
    saveOrderToDB().then(saved => {
      showToast(saved ? `Pedido guardado. Total: ${formatPrice(total)}. Puedes continuar por WhatsApp.` : 'No se pudo guardar el pedido. Tu carrito sigue disponible; puedes comprar por WhatsApp.', saved ? 'success' : 'error');
    }).finally(() => { checkoutBtn.disabled = false; });
  });

  /* Botón WhatsApp checkout — abre chat con dueño */
  const waBtn = $('#whatsappCheckoutBtn');
  if (waBtn) waBtn.addEventListener('click', handleWhatsAppClick);
  const whatsappDialog = $('#whatsappDialog');
  $('#closeWhatsAppDialog')?.addEventListener('click', () => whatsappDialog.close());
  whatsappDialog?.addEventListener('click', event => {
    if (event.target === whatsappDialog) {
      const bounds = whatsappDialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) whatsappDialog.close();
    }
  });
}

/* -----------------------------------------------------------
   12. BOOT — multi-page aware + auth session restore + supabase listener
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  /* 1) Primero bindear UI para que botones no fallen si tarda auth */
  bindAuthUi();
  bindUi();

  /* 2) Render inicial UI auth (SIEMPRE, en todas las páginas) */
  renderAuthUI();

  /* 3) Render carrito, productos y filtros SOLO en páginas store (index/catalogo).
        Login page y admin page no los necesitan. */
  if (PAGE === 'store') {
    renderCart();
    if ($('#featuredGrid')) renderFeatured();
    if ($('#productsGrid')) {
      renderProducts();
      bindFilters();
    }
    /* Cargar catálogo real desde Supabase (products + featured). */
    if (supabase) loadProductsFromDB();
  } else if (PAGE === 'admin') {
    /* Admin page necesita renderCart? No estrictamente, pero si lo queremos para el header no hace falta.
       Pasamos. El renderAuthUI() ya se encargó de mostrar admin o bloqueado. */
  }

  /* 4) Restaurar sesión + Supabase onAuthStateChange (SIEMPRE) */
  if (supabase) {
    authReady = refreshSession();
    await authReady;

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
