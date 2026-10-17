import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createShopGuide} from '../extension/shop-context.mjs';
import {nativePlannerBoard} from '../extension/shop-model.mjs';
import {initialState} from '../extension/protocol.mjs';
const relaySource=await readFile(new URL('../extension/planner-notify.js',import.meta.url),'utf8');
test('notificação MAIN só aceita a origem/janela/chave previstas e coalesce solicitações',()=>{
  let receive;const queued=[],dispatched=[],posts=[];
  const window={addEventListener:(_,fn)=>{receive=fn;},dispatchEvent:e=>dispatched.push(e),postMessage:m=>posts.push(m)};
  const origin='https://pokemon-auto-chess.com';class StorageEvent{constructor(type,fields){this.type=type;Object.assign(this,fields);}}
  vm.runInNewContext(relaySource,{window,top:window,location:{origin},setTimeout:fn=>queued.push(fn),StorageEvent});assert.equal(posts[0].type,'ready');
  const data={channel:'PCH_NATIVE_PLANNER_V1',type:'notify',key:'team_planner'};
  for(const event of [{source:{},origin,data},{source:window,origin:'https://evil.test',data},{source:window,origin,data:{...data,key:'pac_preferences'}},{source:window,origin,data:{...data,type:'write'}}])receive(event);
  assert.equal(queued.length,0);receive({source:window,origin,data});receive({source:window,origin,data});assert.equal(queued.length,1);
  queued.shift()();assert.equal(dispatched.length,1);assert.equal(dispatched[0].key,'team_planner');assert.equal(dispatched[0].type,'storage');
  assert(!/localStorage|WebSocket|fetch\(|buyInShop|getContext|gameScene/.test(relaySource));
});
test('regressão da imagem: Goomy corresponde à família de Sligoo no plano do nível 2',async()=>{
  const b=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8'));
  const plan=Object.values(b.plans).find(p=>p.selection.compId==='6'&&p.selection.variantIndex===0),state={obtained:[],guideLevel:2};assert(plan);
  const guide=createShopGuide(b.guide)(plan,state),board=nativePlannerBoard(plan,state,guide),families=new Map(b.guide.pokemons.map(p=>[p.id,p.family]));
  assert(guide.lineup.some(p=>p.id==='GOOMY'));assert(board.some(p=>families.get(p.name)===families.get('GOOMY')));assert(board.some(p=>p.name==='POLIWAG'));
});
test('host reapresenta depois de montar/atualizar ofertas, sem loop nas classes planned',async()=>{
  const source=await readFile(new URL('../extension/game.js',import.meta.url),'utf8'),events=new Map(),frames=new Map(),timers=new Map(),observers=[],changes=[];
  let seq=0,shop=null,announcements=0;const selection={compId:'one',snapshotId:'snap',variantIndex:0},state={...initialState(),selection,shopEnabled:true};
  const host={style:{},attachShadow:()=>({append(){}}),getBoundingClientRect:()=>({left:0,top:0,width:600,height:400})},frame={style:{},contentWindow:{postMessage(){}}},launcher={style:{},setAttribute(){},addEventListener(){}};
  const doc={documentElement:{clientWidth:1280,append(){},style:{setProperty(){},removeProperty(){}},setAttribute(){},removeAttribute(){}},querySelector:()=>shop,createElement:t=>t==='iframe'?frame:t==='button'?launcher:host,addEventListener(){}};
  const window={addEventListener(type,fn){if(!events.has(type))events.set(type,[]);events.get(type).push(fn);}};
  const chrome={runtime:{getURL:p=>`chrome-extension://test/${p}`,sendMessage:async m=>m.type==='PCH_STATE'?{ok:true,state}:{ok:true,board:[],context:null},onMessage:{addListener(){}}},storage:{onChanged:{addListener:fn=>changes.push(fn)}}};
  class MutationObserver{constructor(fn){this.callback=fn;observers.push(this);}observe(){}disconnect(){}}
  vm.runInNewContext(source,{window,top:window,document:doc,chrome,location:{origin:'https://pokemon-auto-chess.com'},innerHeight:800,MutationObserver,setTimeout:(fn,ms)=>{timers.set(++seq,{fn,ms});return seq;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>{frames.set(++seq,fn);return seq;},PCHShopPlanner:{create:options=>({sync(){options.onStatus('synced');},refresh(){},announce(){announcements++;}})}});
  await new Promise(resolve=>setImmediate(resolve));
  const flushFrames=()=>{for(let i=0;frames.size&&i<5;i++){const next=[...frames];frames.clear();for(const [,fn]of next)fn();}};
  const flushReplay=()=>{for(const [id,t]of [...timers])if(t.ms===250){timers.delete(id);t.fn();}};
  shop={querySelectorAll:()=>[],closest:()=>null,getBoundingClientRect:()=>({top:650,height:100})};
  observers[1].callback([{type:'childList',target:doc.documentElement,addedNodes:[]}]);flushFrames();assert.equal(announcements,0);flushReplay();assert.equal(announcements,1);
  observers[0].callback([{type:'attributes',attributeName:'class',target:{matches:()=>true}}]);flushFrames();flushReplay();assert.equal(announcements,1);
  observers[0].callback([{type:'attributes',attributeName:'style',target:{matches:()=>true}}]);flushFrames();flushReplay();assert.equal(announcements,2);
  const message={source:frame.contentWindow,origin:'chrome-extension://test',data:{channel:'PCH_OVERLAY_FRAME',type:'retry-shop'}};
  for(const fn of events.get('message'))fn({...message,source:{}});assert.equal(announcements,2);
  for(const fn of events.get('message'))fn(message);assert.equal(announcements,3);
  changes[0]({'pokechess-game-overlay-v1':{newValue:{...state,shopEnabled:false}}},'local');
  for(const fn of events.get('message'))fn(message);assert.equal(announcements,3);
});

test('contexto invalidado limpa destaques, restaura o planejador e não repete chamadas mortas',async()=>{
  const source=await readFile(new URL('../extension/game.js',import.meta.url),'utf8'),plannerSource=await readFile(new URL('../extension/shop-planner.js',import.meta.url),'utf8');
  const events=new Map(),timers=new Map(),original=JSON.stringify({expirationDate:9999999999999,value:[{name:'EEVEE',items:[]}]}),values=new Map([['team_planner',original]]),itemSync=[];
  let seq=0,valid=true,calls=0,urls=0;
  const host={style:{},attachShadow:()=>({append(){}}),getBoundingClientRect:()=>({left:0,top:0,width:600,height:400})},frame={style:{},contentWindow:{postMessage(){}}},launcher={style:{},setAttribute(){},addEventListener(){}};
  const doc={documentElement:{clientWidth:1280,append(){},style:{setProperty(){},removeProperty(){}},setAttribute(){},removeAttribute(){}},querySelector:()=>null,createElement:t=>t==='iframe'?frame:t==='button'?launcher:host,addEventListener(){}};
  const window={localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},dispatchEvent(){},postMessage(){},addEventListener(type,fn){if(!events.has(type))events.set(type,[]);events.get(type).push(fn);}};
  const runtime={get id(){return valid?'test':undefined;},getURL:p=>{urls++;if(!valid)throw Error('Extension context invalidated.');return 'chrome-extension://test/'+p;},sendMessage:async m=>{calls++;if(!valid)throw Error('Extension context invalidated.');return m.type==='PCH_STATE'?{ok:true,state:{...initialState(),selection:{compId:'one',snapshotId:'snap',variantIndex:0},shopEnabled:true}}:{ok:true,board:[{name:'SLIGOO',x:0,y:1,items:[]}],context:{}};},onMessage:{addListener(){}}};
  const context=vm.createContext({window,top:window,document:doc,chrome:{runtime,storage:{onChanged:{addListener(){}}}},location:{origin:'https://pokemon-auto-chess.com'},innerHeight:800,StorageEvent:class{constructor(type,fields){Object.assign(this,fields);}},setTimeout:(fn,ms)=>{timers.set(++seq,{fn,ms});return seq;},clearTimeout:id=>timers.delete(id),PCHItemAssist:{create:()=>({sync:value=>itemSync.push(value)})}});
  vm.runInContext(plannerSource,context);vm.runInContext(source,context);await new Promise(resolve=>setImmediate(resolve));
  assert.notEqual(values.get('team_planner'),original);assert(itemSync.at(-1));
  valid=false;const beforeCalls=calls,beforeUrls=urls;
  const event={source:frame.contentWindow,origin:'chrome-extension://test',data:{channel:'PCH_OVERLAY_FRAME',type:'ready'}};
  for(let i=0;i<20;i++)for(const fn of events.get('message'))assert.doesNotThrow(()=>fn(event));
  assert.equal(values.get('team_planner'),original);assert(!values.has('pokechess-native-planner-v1'));assert.equal(itemSync.at(-1),null);assert.equal(frame.style.display,'none');assert.match(launcher.textContent,/Recarregue a página do jogo/);assert(launcher.disabled);
  assert.equal(calls,beforeCalls);assert.equal(urls,beforeUrls);assert.equal(timers.size,0);
});
