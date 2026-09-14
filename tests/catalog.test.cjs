const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(saved={}) {
 const storage=new Map(Object.entries(saved));
 const context=vm.createContext({console,URLSearchParams,Intl,Date,location:{pathname:'/catalogo',search:'',hash:''},window:{},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},document:{querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},setTimeout(){},clearTimeout(){}});
 vm.runInContext(fs.readFileSync('script.js','utf8'),context);
 return {run:s=>vm.runInContext(s,context),storage};
}
test('search matches accents, platform labels, and words in any order',()=>{
 const app=setup();
 app.run("state.filters.search='ragnarok ps5'");
 assert.equal(app.run('filterProducts()[0].id'),32);
 app.run("state.filters.search='edicion playstation'");
 assert.ok(app.run('filterProducts().some(p=>p.id===1)'));
 app.run("state.filters.search='does not exist'");
 assert.equal(app.run('filterProducts().length'),0);
});
test('combined filters include compatible platforms and low stock; reset clears all constraints',()=>{
 const app=setup();
 app.run("Object.assign(state.filters,{categories:['accesorios'],platforms:['pc'],maxPrice:4000,stock:'offer'})");
 assert.ok(app.run('filterProducts().some(p=>p.id===15)'));
 assert.ok(app.run("filterProducts().every(p=>p.category==='accesorios'&&p.price<=4000&&p.offer)"));
 app.run("Object.assign(state.filters,{stock:'available',categories:['all'],platforms:[],maxPrice:50000})");
 assert.ok(app.run('filterProducts().some(p=>p.id===4)'));
 app.run('resetCatalogFilters()');
 assert.equal(app.run('filterProducts().length'),36);
});
test('favorites survive reload, filter results, and can be removed',()=>{
 const app=setup();
 app.run('toggleFavorite(6)');
 const restored=setup(Object.fromEntries(app.storage));
 restored.run('state.filters.favorites=true');
 assert.equal(restored.run('filterProducts()[0].id'),6);
 assert.match(restored.run('productCard(PRODUCTS[5])'),/aria-pressed="true"/);
 restored.run('toggleFavorite(6)');
 assert.equal(restored.run('filterProducts().length'),0);
 assert.equal(setup({'gs_favorites':'invalid'}).run('state.favorites.length'),0);
});
test('newsletter only confirms saved subscriptions and preserves input on failure',async()=>{
 const app=setup();
 app.run(`globalThis.input={value:'test@example.com'};globalThis.button={disabled:false};globalThis.event={preventDefault(){},currentTarget:{reportValidity:()=>true,querySelector:s=>s.startsWith('button')?button:input}};supabase={rpc:async()=>({error:new Error('offline')})}`);
 await app.run('submitNewsletter(event)');
 assert.equal(app.run('input.value'),'test@example.com');
 assert.equal(app.run('button.disabled'),false);
 app.run('supabase={rpc:async()=>({error:null})}');
 await app.run('submitNewsletter(event)');
 assert.equal(app.run('input.value'),'');
});
