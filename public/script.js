/* =========================================================
   GLITCH SHOP — Interactive Logic
   Home (Featured) + Catalog (Full) · Multi-page routing
   ========================================================= */

/* -----------------------------------------------------------
   1. PRODUCT CATALOG — PRECIOS EN MXN
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

/* IDs de productos destacados para HOME */
const FEATURED_IDS = [1, 2, 3, 5, 13, 15];

/* -----------------------------------------------------------
   2. STATE
   ----------------------------------------------------------- */
const state = {
  filters: {
    categories: ['all'],
    platforms: [],
    maxPrice: 50000,
    stock: 'all',
    search: '',
    sort: 'featured',
  },
  view: 'grid',
  cart: JSON.parse(localStorage.getItem('gs_cart') || '[]'),
};

/* -----------------------------------------------------------
   3. UTILITIES
   ----------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PERSIST_CART = true;
function persistCart() {
  if (PERSIST_CART) try { localStorage.setItem('gs_cart', JSON.stringify(state.cart)); } catch(e) {}
}

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
  toast.style.borderLeftColor = type === 'success' ? 'var(--success)' : 'var(--warn)';
  toast.classList.add('toast--show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('toast--show'), 2800);
}

/* -----------------------------------------------------------
   4. PRODUCT CARD (shared)
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
   5. HOME — FEATURED PRODUCTS
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
   6. CATALOG — FILTERS + RENDER
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
  /* Highlight nav link */
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

  /* Nav links con filtrado en-pagina (catalogo) */
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
   7. CART LOGIC
   ----------------------------------------------------------- */
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else state.cart.push({ ...product, qty: 1 });
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
  if ($('#cartShipping')) $('#cartShipping').textContent = sub >= 2500 ? 'Gratis' : 'Calculado al finalizar';

  $$('[data-qty]').forEach(b => b.addEventListener('click', () => updateCartQty(+b.dataset.qty, +b.dataset.delta)));
  $$('[data-remove]').forEach(b => b.addEventListener('click', () => removeFromCart(+b.dataset.remove)));
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
   8. UI BINDINGS (hamburger, cart, checkout) — shared
   ----------------------------------------------------------- */
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
    if (state.cart.length === 0) return;
    const total = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
    showToast(`Checkout iniciado · Total: ${formatPrice(total)} · (Métodos de pago configurables próximamente)`);
  });
}

/* -----------------------------------------------------------
   9. BOOT — multi-page aware
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  bindUi();

  if ($('#featuredGrid')) {
    /* HOME PAGE */
    renderFeatured();
  }
  if ($('#productsGrid')) {
    /* CATALOG PAGE */
    renderProducts();
    bindFilters();
  }
});
