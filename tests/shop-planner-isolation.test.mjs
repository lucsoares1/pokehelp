import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {initialState} from '../extension/protocol.mjs';
const hostSource=await readFile(new URL('../extension/game.js',import.meta.url),'utf8'),plannerSource=await readFile(new URL('../extension/shop-planner.js',import.meta.url),'utf8');

for(const mode of ['incompatible','conflict'])test(`planejador ${mode} preserva a preferência e não bloqueia badges da leitura nativa`,async()=>{
  const original=mode==='incompatible'?JSON.stringify({differentFormat:true}):JSON.stringify({expirationDate:9999999999999,value:[{name:'EEVEE',items:[]}]}),values=new Map([['team_planner',original]]),events=new Map(),messages=[],disabled=[];
  let options,allowed=true;
  const host={style:{},attachShadow:()=>({append(){}}),getBoundingClientRect:()=>({left:0,top:0,width:600,height:400})},frame={style:{},contentWindow:{postMessage:m=>messages.push(m)}},launcher={style:{},setAttribute(){},addEventListener(){}};
  const doc={documentElement:{clientWidth:1280,append(){},style:{setProperty(){},removeProperty(){}},setAttribute(){},removeAttribute(){}},querySelector:()=>null,createElement:t=>t==='iframe'?frame:t==='button'?launcher:host,addEventListener(){}};
  const window={localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},dispatchEvent(){},postMessage(){},addEventListener(type,fn){if(!events.has(type))events.set(type,[]);events.get(type).push(fn);}};
  const state={...initialState(),selection:{compId:'one',snapshotId:'snap',variantIndex:0},shopEnabled:true},chrome={runtime:{id:'test',getURL:p=>'chrome-extension://test/'+p,sendMessage:async m=>m.type==='PCH_STATE'?{ok:true,state}:{ok:true,board:[{name:'TYRANITAR',x:0,y:1,items:[]}],context:{}},onMessage:{addListener(){}}},storage:{onChanged:{addListener(){}}}};
  const context=vm.createContext({window,top:window,document:doc,chrome,location:{origin:'https://pokemon-auto-chess.com'},innerHeight:800,StorageEvent:class{constructor(type,fields){Object.assign(this,fields);}},setTimeout:()=>1,clearTimeout(){},PCHItemAssist:{create:callbacks=>{options=callbacks;return {sync(next){callbacks.onShopStatus(next&&allowed?{code:'connected',offers:6,count:1,targets:9}:{code:'waiting'});},setShopAllowed(value){allowed=value;if(!value)disabled.push(value);}};}}});
  vm.runInContext(plannerSource,context);vm.runInContext(hostSource,context);await new Promise(resolve=>setImmediate(resolve));
  let expected=original;
  if(mode==='conflict'){expected=JSON.stringify({expirationDate:9999999999999,value:[{name:'PIKACHU',items:[]}]});values.set('team_planner',expected);for(const fn of events.get('storage'))fn({key:'team_planner'});}
  for(const fn of events.get('message'))fn({source:frame.contentWindow,origin:'chrome-extension://test',data:{channel:'PCH_OVERLAY_FRAME',type:'ready'}});
  assert.equal(values.get('team_planner'),expected);assert.deepEqual(disabled,[]);
  const status=messages.filter(m=>m.type==='shop-status').at(-1).status;assert.equal(status.source,'native');assert.equal(status.count,1);assert.equal(status.code,'synced');
  options.onStatus({code:'connected',diagnostics:{shop:'read'}});
  assert.equal(messages.filter(m=>m.type==='item-status').at(-1).status.diagnostics.planner,mode);
});
