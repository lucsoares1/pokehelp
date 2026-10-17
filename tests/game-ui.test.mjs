import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {initialState} from '../extension/protocol.mjs';
const source=await readFile(new URL('../extension/game-ui.js',import.meta.url),'utf8');
test('menus visíveis bloqueiam overlay; esconder/restaurar o menu atualiza assinantes sem loops',()=>{
  const card={hidden:false,style:{display:'block',visibility:'visible'},getBoundingClientRect:()=>({left:10,top:20,width:300,height:200,right:310,bottom:220})},callbacks=[],frames=[];let observe;
  const document={documentElement:{},querySelectorAll:()=>[card]},window={addEventListener(){}};
  class MutationObserver{constructor(fn){observe=fn;}observe(){}disconnect(){}}
  const context={document,window,innerWidth:1000,innerHeight:800,getComputedStyle:e=>e.style,MutationObserver,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}};vm.runInNewContext(source,context);const ui=context.PCHGameUI;ui.subscribe(rects=>callbacks.push(rects.length));assert.deepEqual(callbacks,[1]);
  card.style.visibility='hidden';observe();frames.shift()();assert.deepEqual(callbacks,[1,0]);observe();frames.shift()();assert.deepEqual(callbacks,[1,0]);card.style.visibility='visible';observe();frames.shift()();assert.deepEqual(callbacks,[1,0,1]);
  card.hidden=true;assert.equal(ui.blocks().length,0);assert(ui.overlaps({x:0,y:0,width:20,height:20},{x:19,y:19,width:10,height:10}));assert(!ui.overlaps({x:0,y:0,width:20,height:20},{x:30,y:30,width:10,height:10}));
});
test('painel cede ao menu sem fechar a seleção ou mudar posição; retorna ao estado anterior',async()=>{
  const game=await readFile(new URL('../extension/game.js',import.meta.url),'utf8');let blockChanged;let widgets=[];const sent=[],attributes=new Map(),selection={compId:'one',snapshotId:'snap',variantIndex:0};
  const state={...initialState(),selection,minimized:true,position:{x:100,y:80}};
  const host={style:{},setAttribute:(k,v)=>attributes.set(k,v),attachShadow:()=>({append(){}}),getBoundingClientRect:()=>({left:100,top:80,width:600,height:150})},frame={style:{},contentWindow:{postMessage(){}}},launcher={style:{},setAttribute(){},addEventListener(){}};
  const document={documentElement:{clientWidth:1280,append(){}},createElement:t=>t==='iframe'?frame:t==='button'?launcher:host,addEventListener(){}};
  const window={addEventListener(){}},chrome={runtime:{getURL:p=>`chrome-extension://test/${p}`,sendMessage:async m=>{sent.push(m.type);return {ok:true,state};},onMessage:{addListener(){}}},storage:{onChanged:{addListener(){}}}};
  vm.runInNewContext(game,{window,top:window,document,chrome,location:{origin:'https://pokemon-auto-chess.com'},innerHeight:800,setTimeout:()=>0,clearTimeout(){},PCHGameUI:{blocks:()=>[],widgets:()=>widgets,overlaps:(a,b,gap)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y,subscribe:fn=>{blockChanged=fn;fn([]);}}});await new Promise(resolve=>setImmediate(resolve));
  const before={src:frame.src,height:host.style.height,left:host.style.left,top:host.style.top};blockChanged([{x:0,y:0,width:900,height:300}]);assert.equal(host.style.visibility,'hidden');assert.equal(host.style.pointerEvents,'none');assert.equal(host.inert,true);assert.equal(attributes.get('aria-hidden'),'true');
  widgets=[{x:200,y:100,width:100,height:40}];blockChanged([]);assert.equal(host.style.visibility,'hidden');widgets=[{x:900,y:500,width:100,height:40}];blockChanged([]);assert.equal(host.style.visibility,'visible');assert.equal(host.style.pointerEvents,'auto');assert.equal(host.inert,false);assert.deepEqual({src:frame.src,height:host.style.height,left:host.style.left,top:host.style.top},before);assert(!sent.includes('PCH_PATCH'));assert(!sent.includes('PCH_POSITION'));
});
