import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {nativePlannerBoard} from '../extension/shop-model.mjs';
import {createShopGuide} from '../extension/shop-context.mjs';
import {handleMessage,initialState,normalizeState,referenceKey} from '../extension/protocol.mjs';
import {overlayView} from '../site/lib/overlay-view.mjs';
const source=await readFile(new URL('../extension/shop-planner.js',import.meta.url),'utf8');
const context={};vm.runInNewContext(source,context);const {KEY,BACKUP,create}=context.PCHShopPlanner;
const board=[{name:'GYARADOS',x:1,y:3,items:['SOUL_DEW']}];
const raw=value=>JSON.stringify({expirationDate:9999999999999,value});
function fixture(previous=null){
  const values=new Map(previous===null?[]:[[KEY,previous]]),writes=[],statuses=[];let active=false,events=0;
  const storage={getItem:key=>{assert([KEY,BACKUP].includes(key));return values.get(key)??null;},setItem:(k,v)=>{writes.push(k);values.set(k,v);},removeItem:k=>{writes.push(k);values.delete(k);}};
  const options={storage,notify:()=>{events++;},flag:v=>{active=v;},onStatus:s=>statuses.push(s),now:()=>1000};
  return {values,writes,statuses,storage,options,controller:create(options),get active(){return active;},get events(){return events;}};
}
test('planejador preserva plano anterior exato e restaura ao desligar, inclusive ausência de chave',()=>{
  for(const previous of [null,raw([{name:'PIKACHU',x:0,y:1,items:[]}])]){
    const f=fixture(previous);f.controller.sync(board);assert(f.active);assert.equal(f.controller.status,'synced');assert.deepEqual(JSON.parse(f.values.get(KEY)).value,board);
    assert.equal(JSON.parse(f.values.get(BACKUP)).previous,previous);assert.equal(f.writes[0],BACKUP);assert.equal(f.events,1);
    const count=f.writes.length;f.controller.sync(board);assert.equal(f.writes.length,count);
    f.controller.sync([]);assert.deepEqual(JSON.parse(f.values.get(KEY)).value,[]);assert.equal(JSON.parse(f.values.get(BACKUP)).previous,previous);
    f.controller.sync(null);assert.equal(f.values.get(KEY)??null,previous);assert(!f.values.has(BACKUP));assert(!f.active);
  }
});

test('assinante montado após a escrita recebe replay sem reescrever plano ou backup',()=>{
  const f=fixture(raw([]));let subscribed=false,visible=[];
  const controller=create({...f.options,notify:()=>{f.options.notify();if(subscribed)visible=JSON.parse(f.values.get(KEY)).value;}});
  controller.sync(board);assert.deepEqual(visible,[]);subscribed=true;
  controller.refresh();assert.deepEqual(visible,[]); // Old behavior left this shop stale.
  const writes=f.writes.length,backup=f.values.get(BACKUP);controller.announce();
  assert.deepEqual(visible,board);assert.equal(f.writes.length,writes);assert.equal(f.values.get(BACKUP),backup);
  const manual=raw([{name:'EEVEE',x:0,y:1,items:[]}]);f.values.set(KEY,manual);const events=f.events;
  controller.announce();assert.equal(controller.status,'conflict');assert.equal(f.events,events);assert.equal(f.values.get(KEY),manual);
  controller.sync(null);const stopped=f.events;controller.announce();assert.equal(f.events,stopped);
});
test('edição nativa pausa sem sobrescrever; desligar/ligar preserva a nova edição',()=>{
  const f=fixture();f.controller.sync(board);const manual=raw([{name:'ABSOL',x:2,y:2,items:[]}]);f.values.set(KEY,manual);f.controller.refresh();assert.equal(f.controller.status,'conflict');assert(!f.active);
  f.controller.sync([{name:'MAGIKARP',x:0,y:1,items:[]}]);assert.equal(f.values.get(KEY),manual);
  f.controller.sync(null);assert.equal(f.values.get(KEY),manual);assert(!f.values.has(BACKUP));
  f.controller.sync(board);assert(f.active);f.controller.sync(null);assert.equal(f.values.get(KEY),manual);
});
test('reload e duas abas compartilham backup sem capturar como original o plano do Helper',()=>{
  const original=raw([]),f=fixture(original);f.controller.sync(board);
  const second=create(f.options);second.sync(board);assert.equal(JSON.parse(f.values.get(BACKUP)).previous,original);
  second.sync([{name:'MAGIKARP',x:0,y:2,items:[]}]);f.controller.sync([{name:'MAGIKARP',x:0,y:2,items:[]}]);assert.equal(f.controller.status,'synced');
  second.sync(null);f.controller.sync(null);assert.equal(f.values.get(KEY),original);assert(!f.values.has(BACKUP));
});
test('formatos desconhecidos, backup inválido e falha de quota não são sucesso nem apagam o original',()=>{
  const unknown=JSON.stringify({newSchema:2,team:board}),f=fixture(unknown);f.controller.sync(board);assert.equal(f.controller.status,'incompatible');assert.equal(f.values.get(KEY),unknown);assert.equal(f.writes.length,0);assert(!f.active);
  const broken=fixture(raw([]));broken.values.set(BACKUP,'invalid');broken.controller.sync(board);assert.equal(broken.controller.status,'error');assert.equal(broken.writes.length,0);
  const quota=fixture(raw([]));quota.storage.setItem=()=>{throw Error('quota');};quota.controller.sync(board);assert.equal(quota.controller.status,'error');assert(!quota.active);assert.equal(quota.values.get(KEY),raw([]));
});
test('interrupção entre backup e escrita conserva original e permite desligar sem perdê-lo',()=>{
  const original=raw([{name:'EEVEE',x:2,y:2,items:[]}]),f=fixture(original),write=f.storage.setItem;
  f.storage.setItem=(key,value)=>{if(key===KEY)throw Error('quota');write(key,value);};
  f.controller.sync(board);assert.equal(f.controller.status,'error');assert.equal(f.values.get(KEY),original);assert(f.values.has(BACKUP));
  const recovered=create(f.options);recovered.sync(board);assert.equal(recovered.status,'conflict');assert.equal(f.values.get(KEY),original);
  recovered.sync(null);assert.equal(f.values.get(KEY),original);assert(!f.values.has(BACKUP));
});
test('alvos nativos usam IDs, itens e orientação oficiais e removem somente as vagas prontas',async()=>{
  const bundle=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8'));
  for(const plan of Object.values(bundle.plans)){
    const full=nativePlannerBoard(plan,{obtained:[]});assert.equal(full.length,plan.units.length);
    for(const [i,p] of full.entries()){assert.equal(p.name,plan.units[i].id);assert.deepEqual(p.items,plan.units[i].items.map(i=>i.id));assert(p.x>=0&&p.x<=7&&p.y>=1&&p.y<=3);}
    assert.equal(new Set(full.map(p=>`${p.x},${p.y}`)).size,full.length);
    assert.equal(nativePlannerBoard(plan,{obtained:plan.units.map(p=>p.slot)}).length,0);
    assert.equal(nativePlannerBoard(plan,{obtained:[0]}).length,full.length-1);
  }
});
test('só o jogo recebe o plano validado; migração fica desligada e importação explícita ativa',async()=>{
  const selection={compId:'one',snapshotId:'snap',variantIndex:0},plan={units:[{slot:0,id:'GYARADOS',items:[]}],formation:{units:[{slot:0,row:0,col:1}]}};
  const plans={[referenceKey(selection)]:plan};let state;const id='test',env={id,plans,snapshotId:'snap',storage:{get:async()=>state,set:async s=>{state=s;}}};
  const helper={id,url:'http://127.0.0.1:4173/',frameId:0},game={id,url:'https://pokemon-auto-chess.com/game',frameId:0},panel={id,url:'chrome-extension://test/overlay/index.html'};
  assert.equal(normalizeState({schemaVersion:1,selection},plans).shopEnabled,false);
  await handleMessage({type:'PCH_IMPORT',selection},helper,env);assert(state.shopEnabled);
  assert.equal((await handleMessage({type:'PCH_SHOP_PLAN'},game,env)).board[0].name,'GYARADOS');
  for(const sender of [helper,panel,{...game,frameId:1}])await assert.rejects(handleMessage({type:'PCH_SHOP_PLAN'},sender,env));
  await assert.rejects(handleMessage({type:'PCH_PATCH',action:'shop',enabled:false,selection},helper,env));
  await handleMessage({type:'PCH_PATCH',action:'minimize'},panel,env);assert((await handleMessage({type:'PCH_SHOP_PLAN'},game,env)).board);
  await handleMessage({type:'PCH_PATCH',action:'close'},panel,env);assert.equal((await handleMessage({type:'PCH_SHOP_PLAN'},game,env)).board,null);
  await handleMessage({type:'PCH_REOPEN'},game,env);await handleMessage({type:'PCH_PATCH',action:'shop',enabled:false},panel,env);assert.equal((await handleMessage({type:'PCH_SHOP_PLAN'},game,env)).board,null);
});
test('controle e badge ficam restritos ao jogo e não interceptam o clique de compra',async()=>{
  const bundle=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8')),plan=Object.values(bundle.plans)[0],state={...initialState(),selection:plan.selection,shopEnabled:true};
  const game=overlayView(plan,state,{scope:'game'}),helper=overlayView(plan,state);
  assert.match(game,/data-ov-shop checked/);assert.match(game,/data-ov-shop-status role="status"/);assert(!helper.includes('data-ov-shop'));
  const css=await readFile(new URL('../extension/shop.css',import.meta.url),'utf8');assert.match(css,/pointer-events:none/);assert.match(css,/\.game-pokemons-store \.game-pokemon-portrait\.planned/);assert.match(css,/--pch-buy-badge/);assert.match(css,/outline:3px solid #f5cb54/);assert(!css.includes('DA SUA COMP'));
  assert(!/WebSocket|fetch\(|buyInShop|\.click\(|canvas|localStorage\.clear/.test(source));
});

test('lista de compras inclui somente os provisórios do nível atual nas 778 variações',async()=>{
  const b=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8')),guideFor=createShopGuide(b.guide);
  let transitions=0;
  for(const plan of Object.values(b.plans)){
    let previous=[];
    for(let level=2;level<=9;level++){
      const state={obtained:[],guideLevel:level},guide=guideFor(plan,state),board=nativePlannerBoard(plan,state,guide);
      const temporary=guide.lineup.filter(p=>p.temporary&&!p.obtained).map(p=>p.id);
      const expected=new Set([...plan.units.map(p=>p.id),...temporary]);
      assert.deepEqual(new Set(board.map(p=>p.name)),expected,`${referenceKey(plan.selection)} nível ${level}`);
      assert.equal(new Set(board.map(p=>`${p.x},${p.y}`)).size,board.length);assert(board.length<=24);
      for(const p of board)assert(p.x>=0&&p.x<8&&p.y>=1&&p.y<=3);
      for(const id of previous)if(!expected.has(id)){transitions++;assert(!board.some(p=>p.name===id));}
      previous=temporary;
    }
  }
  assert(transitions>0);
});

test('troca real no guia retira Smoliv no nível 3; protocolo, pacote e marcas usam o mesmo cálculo',async()=>{
  const b=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8')),getGuide=createShopGuide(b.guide);
  const {createShopGuide:packagedFactory}=await import('../extension/dist/shop-context.mjs');const packagedGuide=packagedFactory(b.guide);
  const plan=Object.values(b.plans).find(p=>p.selection.compId==='121'&&p.selection.variantIndex===5),selection=plan.selection,id='test';let state;
  const helper={id,url:'http://127.0.0.1:4173/',frameId:0},panel={id,url:'chrome-extension://test/overlay/index.html'},game={id,url:'https://pokemon-auto-chess.com/game',frameId:0};
  const env={id,plans:b.plans,snapshotId:b.snapshotId,getGuide,storage:{get:async()=>state,set:async s=>{state=s;}}};
  await handleMessage({type:'PCH_IMPORT',selection},helper,env);
  const before=(await handleMessage({type:'PCH_SHOP_PLAN'},game,env)).board;assert(before.some(p=>p.name==='SMOLIV'));
  await handleMessage({type:'PCH_PATCH',action:'level',level:3},panel,env);
  const after=(await handleMessage({type:'PCH_SHOP_PLAN'},game,env)).board;assert(!after.some(p=>p.name==='SMOLIV'));
  for(const u of plan.units)assert(after.some(p=>p.name===u.id));
  for(const level of [2,3,9]){
    const s={...state,guideLevel:level};assert.deepEqual(nativePlannerBoard(plan,s,packagedGuide(plan,s)),nativePlannerBoard(plan,s,getGuide(plan,s)));
  }
  await handleMessage({type:'PCH_PATCH',action:'toggle',slot:0},panel,env);
  const marked=(await handleMessage({type:'PCH_SHOP_PLAN'},game,env)).board;assert(!marked.some(p=>p.name===plan.units[0].id));
  assert.deepEqual(marked,nativePlannerBoard(plan,state,getGuide(plan,state)));
});

test('host atualiza a loja quando muda somente o nível, sem depender de trocar a comp',async()=>{
  const gameSource=await readFile(new URL('../extension/game.js',import.meta.url),'utf8'),listeners=[],events={},requests=[];
  const selection={compId:'one',snapshotId:'snap',variantIndex:0},state={...initialState(),selection,shopEnabled:true};
  const host={style:{},attachShadow:()=>({append(){}}),getBoundingClientRect:()=>({left:0,top:0,width:600,height:400})},frame={style:{},contentWindow:{}},launcher={style:{},setAttribute(){},addEventListener(){}};
  const doc={documentElement:{clientWidth:1280,append(){}},createElement:t=>t==='iframe'?frame:t==='button'?launcher:host,addEventListener(){}};
  const window={addEventListener:(type,fn)=>{events[type]=fn;}};
  const chrome={runtime:{getURL:p=>`chrome-extension://test/${p}`,sendMessage:async m=>{requests.push(m.type);return m.type==='PCH_STATE'?{ok:true,state}:{ok:true,board:[]};},onMessage:{addListener(){}}},storage:{onChanged:{addListener:fn=>listeners.push(fn)}}};
  vm.runInNewContext(gameSource,{window,top:window,document:doc,chrome,location:{origin:'https://pokemon-auto-chess.com'},innerHeight:800,setTimeout:()=>0,clearTimeout(){},PCHShopPlanner:{create:()=>({sync(){},refresh(){}})}});
  await new Promise(resolve=>setImmediate(resolve));const initial=requests.filter(t=>t==='PCH_SHOP_PLAN').length;assert.equal(initial,1);
  listeners[0]({'pokechess-game-overlay-v1':{newValue:{...state,guideLevel:3}}},'local');await new Promise(resolve=>setImmediate(resolve));assert.equal(requests.filter(t=>t==='PCH_SHOP_PLAN').length,initial+1);
  listeners[0]({'pokechess-game-overlay-v1':{newValue:{...state,guideLevel:3,minimized:true}}},'local');await new Promise(resolve=>setImmediate(resolve));assert.equal(requests.filter(t=>t==='PCH_SHOP_PLAN').length,initial+1);
});
