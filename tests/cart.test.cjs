const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');

function setup(saved = {}) {
  const storage = new Map(Object.entries(saved));
  const nodes = new Map();
  for (const id of ['cartCount', 'cartItems', 'cartFooter', 'cartSubtotal', 'cartTotal', 'cartShipping', 'whatsappCheckoutBtn', 'whatsappWebLink', 'whatsappAppLink', 'whatsappOrderPreview', 'whatsappDialog']) {
    nodes.set('#' + id, { hidden: false, style: {}, textContent: '', innerHTML: '', disabled: false,
      querySelectorAll: () => [], setAttribute() {}, removeAttribute() {}, showModal() { this.open = true; } });
  }
  const calls = [];
  let error = null;
  const client = {
    from(table) {
      const query = {
        select() { return this; }, eq() { return this; }, not() { return this; },
        upsert(rows) { calls.push({ table, action: 'upsert', rows }); return this; },
        delete() { calls.push({ table, action: 'delete' }); return this; },
        insert(row) { calls.push({ table, action: 'insert', row }); return this; },
        then(resolve) { return Promise.resolve({ data: [], error }).then(resolve); }
      };
      return query;
    }
  };
  const context = vm.createContext({ console: { warn() {} }, URLSearchParams, Intl, Date,
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
    location: { pathname: '/catalogo', search: '', hash: '' },
    window: { supabase: { createClient: () => client } },
    document: { querySelector: s => nodes.get(s) || null, querySelectorAll: () => [], addEventListener() {}, getElementById: id => nodes.get('#' + id) || null },
    setTimeout() {}, clearTimeout() {}
  });
  vm.runInContext(source, context);
  return { run: text => vm.runInContext(text, context), storage, nodes, calls, fail: value => { error = value; } };
}

test('guest cart survives reload; empty cart clears totals and disables checkout', () => {
  const app = setup();
  app.run('addToCart(1); updateCartQty(1, 1); renderCart()');
  assert.match(app.nodes.get('#cartItems').innerHTML, /PlayStation 5 Pro/);
  const restored = setup(Object.fromEntries(app.storage));
  assert.equal(restored.run('state.cart[0].qty'), 2);
  restored.run('removeFromCart(1)');
  assert.equal(restored.nodes.get('#cartFooter').hidden, true);
  assert.equal(restored.nodes.get('#cartTotal').textContent, '$0.00');
  assert.equal(restored.nodes.get('#whatsappCheckoutBtn').disabled, true);
});

test('WhatsApp chooser contains recipient and complete encoded order without deleting or sending', () => {
  const app = setup();
  app.run('addToCart(1); addToCart(13); handleWhatsAppClick({preventDefault(){}})');
  const web = new URL(app.nodes.get('#whatsappWebLink').href);
  const mobile = new URL(app.nodes.get('#whatsappAppLink').href);
  assert.equal(web.hostname, 'web.whatsapp.com');
  assert.equal(web.searchParams.get('phone'), '5216442514818');
  assert.equal(mobile.hostname, 'wa.me');
  assert.equal(mobile.searchParams.get('text'), web.searchParams.get('text'));
  assert.match(web.searchParams.get('text'), /Quiero comprar/);
  assert.match(web.searchParams.get('text'), /DualSense Edge/);
  assert.match(web.searchParams.get('text'), /15,469.98/);
  assert.equal(app.run('state.cart.length'), 2);
  assert.equal(app.calls.length, 0);
});

test('saving a pending order retains cart on success and on Supabase error', async () => {
  const app = setup();
  app.run("state.user = {id: 'test-user', name: 'Test', email: 'test@example.com'}; state.cart = [{...PRODUCTS[0], qty: 1}]");
  assert.equal(await app.run('saveOrderToDB()'), true);
  assert.equal(app.calls[0].row.status, 'pending');
  assert.equal(app.calls[0].row.whatsapp_sent_at, undefined);
  assert.equal(app.run('state.cart.length'), 1);
  app.fail(new Error('database unavailable'));
  assert.equal(await app.run('saveOrderToDB()'), false);
  assert.equal(app.run('state.cart.length'), 1);
});

test('cached account cart restores once and never doubles on auth refresh', async () => {
  const app = setup({gs_cart_guest: JSON.stringify([{id: 1, qty: 1}]), 'gs_cart_user-a': JSON.stringify([{id: 1, qty: 2}])});
  app.run("applyUser({id: 'user-a', email: 'test@example.com', user_metadata:{name:'Test'}})");
  await app.run('cartWriteQueue');
  assert.equal(app.run('state.cart[0].qty'), 3);
  assert.equal(app.storage.has('gs_cart_guest'), false);
  app.run("applyUser({id: 'user-a', email: 'test@example.com', user_metadata:{name:'Test'}})");
  assert.equal(app.run('state.cart[0].qty'), 3);
  app.run('applyUser(null)');
  assert.equal(app.run('state.cart.length'), 0);
});

test('serialized database writes use latest quantities and do not delete after a failed upsert', async () => {
  const app = setup();
  app.run("state.user={id:'test-user'}; addToCart(1); addToCart(1)");
  await app.run('cartWriteQueue');
  assert.deepEqual(app.calls.filter(c => c.action === 'upsert').map(c => c.rows[0].quantity), [1,2]);
  app.calls.length = 0;
  app.fail(new Error('write rejected'));
  app.run('addToCart(1)');
  await app.run('cartWriteQueue');
  assert.equal(app.calls.some(c => c.action === 'delete'), false);
  assert.equal(JSON.parse(app.storage.get('gs_cart_test-user'))[0].qty, 3);
});
