import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import vm from 'node:vm';
import {handleMessage,normalizeState,initialState,referenceKey,isGameUrl,helperOrigin} from '../extension/protocol.mjs';
import {createOverlayGuide} from '../site/lib/overlay-guide.mjs';
const id='test-extension',selection={compId:'121',snapshotId:'snapshot-1',variantIndex:5};
const plans={
  [referenceKey(selection)]:{units:[{id:'GYARADOS'},{id:'GYARADOS'}]},
  [referenceKey({...selection,variantIndex:1})]:{units:[{id:'ABSOL'}]}
};
const helper={id,url:'http://127.0.0.1:4173/#compositions',frameId:0},game={id,url:'https://pokemon-auto-chess.com/',frameId:0},panel={id,url:`chrome-extension://${id}/overlay/index.html`,frameId:8};
function fixture(){let state;return {get state(){return state;},env:{id,plans,snapshotId:'snapshot-1',storage:{get:async()=>state,set:async value=>{state=structuredClone(value);}}}};}
test('extensão aceita somente jogo exato, Helper local configurado e sua própria página',async()=>{
  assert(isGameUrl(game.url));assert(!isGameUrl('https://pokemon-auto-chess.com.evil.test/'));assert(!isGameUrl('http://pokemon-auto-chess.com/'));assert(!helperOrigin('http://127.0.0.1:4174/'));assert(!helperOrigin('http://127.0.0.1:4173/overlay.html'));
  const f=fixture();assert.equal((await handleMessage({type:'PCH_HELLO'},helper,f.env)).snapshotId,'snapshot-1');
  for(const sender of [{...helper,id:'other'},{...helper,url:'https://evil.test/'},{...helper,frameId:1}])await assert.rejects(handleMessage({type:'PCH_IMPORT',selection},sender,f.env),/Origem/);
  await assert.rejects(handleMessage({type:'PCH_IMPORT',selection},game,f.env),/Mensagem/);
  await assert.rejects(handleMessage({type:'PCH_PATCH',action:'close'},helper,f.env),/equipe mudou/);
});
test('importação é confirmada somente após persistir uma referência exata do pacote',async()=>{
  const f=fixture();await assert.rejects(handleMessage({type:'PCH_IMPORT',selection:{...selection,variantIndex:99}},helper,f.env),/ausente/);assert.equal(f.state,undefined);
  const r=await handleMessage({type:'PCH_IMPORT',selection,theme:'light'},helper,f.env);assert(r.ok);assert.deepEqual(f.state.selection,selection);assert.equal(f.state.theme,'light');
  await handleMessage({type:'PCH_PATCH',action:'toggle',slot:1},panel,f.env);assert.deepEqual(f.state.obtained,[1]);
  await handleMessage({type:'PCH_IMPORT',selection},helper,f.env);assert.deepEqual(f.state.obtained,[1]);
  await handleMessage({type:'PCH_PATCH',action:'variant',index:1},panel,f.env);assert.deepEqual(f.state.obtained,[]);assert.equal(f.state.selection.variantIndex,1);
  await assert.rejects(handleMessage({type:'PCH_PATCH',action:'toggle',slot:1},panel,f.env),/inválida/);
});
test('fechar, reabrir, mover e marcar não alteram o jogo nem confundem vagas duplicadas',async()=>{
  const f=fixture();await handleMessage({type:'PCH_IMPORT',selection},helper,f.env);
  await handleMessage({type:'PCH_PATCH',action:'toggle',slot:1},panel,f.env);assert.deepEqual(f.state.obtained,[1]);
  await handleMessage({type:'PCH_PATCH',action:'minimize'},panel,f.env);assert(f.state.minimized);
  await handleMessage({type:'PCH_PATCH',action:'close'},panel,f.env);assert(f.state.closed);
  await handleMessage({type:'PCH_REOPEN'},game,f.env);assert(!f.state.closed);
  await handleMessage({type:'PCH_POSITION',position:{x:-5,y:20000}},game,f.env);assert.deepEqual(f.state.position,{x:0,y:10000});
  await handleMessage({type:'PCH_PATCH',action:'reset'},panel,f.env);assert.deepEqual(f.state.obtained,[]);
  const bad={...f.state,obtained:[0,0,1,2,-1,'1'],theme:'invalid',helperOrigin:'https://evil.test/'};const normalized=normalizeState(bad,plans);assert.deepEqual(normalized.obtained,[0,1]);assert.equal(normalized.theme,'dark');assert.equal(normalized.helperOrigin,helper.url.split('/#')[0]);
  assert.deepEqual(normalizeState({schemaVersion:99},plans),initialState());
});
test('manifesto restringe painel ao jogo e ponte ao Helper, sem acesso amplo ou código remoto',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../extension/manifest.json',import.meta.url),'utf8'));
  assert.deepEqual(manifest.permissions,['storage']);assert.equal(manifest.manifest_version,3);assert.deepEqual(manifest.host_permissions,['https://pokemon-auto-chess.com/*']);assert(!manifest.externally_connectable);
  const content=manifest.content_scripts;assert.deepEqual(content[0].matches,['https://pokemon-auto-chess.com/*']);assert.equal(content[0].all_frames,false);
  assert.deepEqual(content[1].include_globs,['http://127.0.0.1:4173/*','http://localhost:4173/*']);assert.deepEqual(manifest.web_accessible_resources[0].matches,content[0].matches);
  assert(!manifest.content_security_policy.extension_pages.includes('unsafe-eval'));
  const native=content.find(c=>c.js.includes('items-native.js'));assert.equal(native.world,'MAIN');assert.equal(native.all_frames,false);assert.deepEqual(native.matches,content[0].matches);assert(manifest.web_accessible_resources[0].resources.includes('item-model.mjs'));assert(manifest.web_accessible_resources[0].resources.includes('portal-model.mjs'));
  const script=await readFile(new URL('../extension/game.js',import.meta.url),'utf8');let touched=false;
  for(const origin of ['https://example.com','http://pokemon-auto-chess.com','https://pokemon-auto-chess.com.evil.test']){
    const window={};window.top=window;vm.runInNewContext(script,{window,top:window,location:{origin},document:{createElement(){touched=true;throw new Error('Não deveria montar');}}});
  }assert.equal(touched,false);
});
test('ZIP contém apenas recursos locais auditados e todas as 778 equipes utilizáveis',async()=>{
  const zip=await readFile(new URL('../site/downloads/pokechess-overlay.zip',import.meta.url)),files=new Map();let offset=0;
  while(zip.readUInt32LE(offset)===0x04034b50){const size=zip.readUInt32LE(offset+18),length=zip.readUInt16LE(offset+26),extra=zip.readUInt16LE(offset+28),name=zip.subarray(offset+30,offset+30+length).toString(),start=offset+30+length+extra;assert(!name.includes('..'));files.set(name,inflateRawSync(zip.subarray(start,start+size)));offset=start+size;}
  const metadata=JSON.parse(files.get('build.json')),bundle=JSON.parse(files.get('overlay/plans.json'));assert.equal(Object.keys(bundle.plans).length,778);assert.equal(metadata.teams,778);
  assert(files.has('board-model.mjs'));assert(files.has('board-view.mjs'));
  for(const entry of metadata.resources){const bytes=files.get(entry.path);assert(bytes,entry.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.path);}
  function checkImages(value){if(value&&typeof value==='object')for(const [key,item] of Object.entries(value)){if(key==='image'&&typeof item==='string')assert(files.has('overlay/'+item),item);else checkImages(item);}}checkImages(bundle.plans);
  const manifest=JSON.parse(files.get('manifest.json'));assert.equal(manifest.version,'0.18.0');assert(files.has('diagnostic-view.mjs'));assert(files.has('shop-planner.js'));assert(files.has('shop-model.mjs'));assert(files.has('shop.css'));assert(files.has('overlay/index.html'));assert(files.has('overlay/lib/overlay-guide.mjs'));assert(bundle.guide.rules.shop);checkImages(bundle.guide.pokemons);assert(![...files.keys()].some(p=>/\.env|banner\.mp4|videobanner|history\//.test(p)));
  checkImages(bundle.guide.items);assert(files.has('items-native.js'));assert(files.has('game-ui.js'));assert(files.has('planner-notify.js'));assert(files.has('item-assist.js'));assert(files.has('item-model.mjs'));assert(files.has('item-view.mjs'));assert(files.has('portal-model.mjs'));assert(files.has('holder-model.mjs'));checkImages(bundle.guide.synergies);assert(files.has('overlay/lib/progression-planner.mjs'));assert(files.has('overlay/lib/progression-change-view.mjs'));assert(files.has('overlay/lib/composition-model.mjs'));
  assert(files.has('overlay/lib/ui-icons.mjs'));const iconSource=JSON.parse(files.get('overlay/assets/icons/lucide/SOURCE.json'));assert.equal(iconSource.version,'1.57.0');
  for(const entry of iconSource.sources){const bytes=files.get('overlay/assets/icons/lucide/'+entry.name);assert(bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);}
  const compactData={...bundle.guide,maps:{pokemons:new Map(bundle.guide.pokemons.map(p=>[p.id,p])),synergies:new Map(bundle.guide.synergies.map(s=>[s.id,s])),items:new Map(bundle.guide.items.map(i=>[i.id,i]))}};
  for(const plan of Object.values(bundle.plans)){
    const guide=createOverlayGuide(plan,compactData,bundle.guide.rules,{guideLevel:9,obtained:[]});
    assert.deepEqual([...guide.lineup,...guide.bench].map(p=>p.id).sort(),plan.units.map(p=>p.id).sort());
    if(!guide.overCapacity)assert.deepEqual(guide.synergies.filter(s=>s.active).map(s=>[s.id,s.count]),plan.synergies.map(s=>[s.id,s.count]));
    for(let level=2;level<=8;level++){
      const step=createOverlayGuide(plan,compactData,bundle.guide.rules,{guideLevel:level,obtained:[]});
      assert.equal(step.lineup.length,level,`${referenceKey(plan.selection)}, nível ${level}`);
      assert.equal(step.transitions.length,step.changes.replacements.length+step.changes.removals.length);
      for(const unit of step.lineup)assert.equal(bundle.guide.rules.acquisition[unit.id]?.method,'shop');
    }
  }
});

test('ponte do Helper rejeita respostas de outra origem e não confirma sem extensão',async()=>{
  const source=await readFile(new URL('../site/lib/game-overlay-bridge.mjs',import.meta.url),'utf8');
  const listeners=new Set();let request;
  const window={addEventListener:(type,fn)=>listeners.add(fn),removeEventListener:(type,fn)=>listeners.delete(fn),postMessage:message=>{request=message;}};
  const context=vm.createContext({window,location:{origin:'http://127.0.0.1:4173'},crypto:{randomUUID:()=> 'test-request'},setTimeout,clearTimeout,Error});
  vm.runInContext(source.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')+'\nthis.requestExtension=requestExtension;',context);
  const pending=context.requestExtension('PCH_IMPORT',{selection},1000);assert.equal(request.type,'PCH_IMPORT');
  for(const fn of listeners)fn({source:window,origin:'https://evil.test',data:{channel:'PCH_HELPER_RESPONSE',requestId:request.requestId,ok:true}});assert.equal(listeners.size,1);
  for(const fn of listeners)fn({source:window,origin:'http://127.0.0.1:4173',data:{channel:'PCH_HELPER_RESPONSE',requestId:request.requestId,ok:true,state:{selection}}});
  assert((await pending).ok);assert.equal(listeners.size,0);
  await assert.rejects(context.requestExtension('PCH_HELLO',{},5),/não conectada/);assert.equal(listeners.size,0);
});

test('host do jogo monta só seu iframe, acompanha estado e ignora mensagens forjadas',async()=>{
  const source=await readFile(new URL('../extension/game.js',import.meta.url),'utf8'),events={},changes=[];let mounted;
  const host={style:{},hidden:false,attachShadow:()=>({append:()=>{}}),getBoundingClientRect:()=>({left:200,top:100,width:600,height:400})};
  const launcher={style:{},hidden:false,setAttribute(){},addEventListener(type,fn){events.launcher=fn;}},frame={style:{},contentWindow:{}},doc={documentElement:{clientWidth:1280,append:el=>{mounted=el;}},createElement:type=>type==='iframe'?frame:type==='button'?launcher:host,addEventListener:(type,fn)=>{events[type]=fn;}};
  const window={addEventListener:(type,fn)=>{events[type]=fn;}};
  const chrome={runtime:{getURL:path=>`chrome-extension://${id}/${path}`,sendMessage:async()=>({ok:true,state:{...initialState(),selection}}),onMessage:{addListener:fn=>{events.runtime=fn;}}},storage:{onChanged:{addListener:fn=>changes.push(fn)}}};
  vm.runInNewContext(source,{window,top:window,location:{origin:'https://pokemon-auto-chess.com'},document:doc,chrome,innerHeight:800,setTimeout:()=>0,clearTimeout:()=>{}});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(mounted,host);assert.equal(frame.src,`chrome-extension://${id}/overlay/index.html`);assert.equal(host.hidden,false);
  events.message({source:{},origin:`chrome-extension://${id}`,data:{channel:'PCH_OVERLAY_FRAME',type:'size',height:200}});assert.equal(host.style.height,'640px');
  events.message({source:frame.contentWindow,origin:`chrome-extension://${id}`,data:{channel:'PCH_OVERLAY_FRAME',type:'size',height:99999}});assert.equal(host.style.height,'640px');
  changes[0]({'pokechess-game-overlay-v1':{newValue:{...initialState(),selection,minimized:true}}},'local');assert.equal(host.style.height,'150px');
  changes[0]({'pokechess-game-overlay-v1':{newValue:{...initialState(),selection,closed:true}}},'local');assert.equal(host.style.display,'block');assert.equal(launcher.hidden,false);assert.equal(host.style.height,'46px');
  changes[0]({'pokechess-game-overlay-v1':{newValue:initialState()}},'local');assert.match(launcher.textContent,/Escolher composição/);assert.equal(host.hidden,false);
  let probe;events.runtime({type:'PCH_PROBE'},{},reply=>{probe=reply;});assert.equal(probe.selection,false);
});

test('Helper acompanha marcas da equipe exata sem fechar o painel do jogo',async()=>{
  const f=fixture();await handleMessage({type:'PCH_IMPORT',selection},helper,f.env);
  await handleMessage({type:'PCH_PATCH',selection,action:'toggle',slot:1},helper,f.env);
  const read=await handleMessage({type:'PCH_STATE'},helper,f.env);assert.deepEqual(read.state.obtained,[1]);
  await assert.rejects(handleMessage({type:'PCH_PATCH',selection:{...selection,variantIndex:1},action:'toggle',slot:0},helper,f.env),/equipe mudou/);
  await assert.rejects(handleMessage({type:'PCH_PATCH',selection,action:'close'},helper,f.env),/equipe mudou/);
  assert.equal(f.state.closed,false);assert.deepEqual(f.state.obtained,[1]);
  await handleMessage({type:'PCH_PATCH',selection,action:'level',level:8},helper,f.env);assert.equal(f.state.guideLevel,8);
  await assert.rejects(handleMessage({type:'PCH_PATCH',selection,action:'level',level:10},panel,f.env),/inválida/);assert.equal(f.state.guideLevel,8);
});

test('diagnóstico consulta só abas do jogo e distingue conexão de painel carregado',async()=>{
  const source=await readFile(new URL('../extension/background.mjs',import.meta.url),'utf8');let receive,query;const calls=[];
  const chrome={runtime:{id,getURL:p=>`chrome-extension://${id}/${p}`,onMessage:{addListener:fn=>{receive=fn;}}},action:{onClicked:{addListener(){}}},storage:{local:{get:async()=>({}),set:async()=>{}}},tabs:{query:async q=>{query=q;return [{id:1},{id:2},{id:3}];},sendMessage:async(tab,message)=>{calls.push(message);if(tab===3)throw new Error('Sem content script');return {ok:true,ready:true,selection:tab===1,closed:false};}}};
  vm.runInNewContext(source.replace(/^import .*;\r?\n/gm,''),{chrome,setTimeout,clearTimeout,STATE_KEY:'test',handleMessage,isGameUrl,HELPER_ORIGINS:['http://127.0.0.1:4173'],fetch:async()=>({ok:true,json:async()=>({plans,snapshotId:'snapshot-1',guide:{items:[],pokemons:[]}})})});
  const result=await new Promise(reply=>receive({type:'PCH_HELLO'},helper,reply));
  assert.equal(query.url,'https://pokemon-auto-chess.com/*');assert.equal(result.game.tabs,3);assert.equal(result.game.connected,2);assert.equal(result.game.ready,1);assert(calls.every(m=>m.type==='PCH_PROBE'));
});

test('aba sem responder ao diagnóstico não bloqueia leituras do plano na fila do worker',async()=>{
  const source=await readFile(new URL('../extension/background.mjs',import.meta.url),'utf8'),timers=new Map();let receive,seq=0,healthCalls=0,helloResult;
  const chrome={runtime:{id,getURL:p=>`chrome-extension://${id}/${p}`,onMessage:{addListener:fn=>{receive=fn;}}},action:{onClicked:{addListener(){}}},storage:{local:{get:async()=>({}),set:async()=>{}}},tabs:{query:async()=>[{id:1}],sendMessage:()=>{healthCalls++;return new Promise(()=>{});}}};
  vm.runInNewContext(source.replace(/^import .*;\r?\n/gm,''),{chrome,STATE_KEY:'test',handleMessage,isGameUrl,HELPER_ORIGINS:['http://127.0.0.1:4173'],setTimeout:(fn,ms)=>{assert.equal(ms,2000);timers.set(++seq,fn);return seq;},clearTimeout:i=>timers.delete(i),fetch:async()=>({ok:true,json:async()=>({plans,snapshotId:'snapshot-1',guide:{items:[],pokemons:[]}})})});
  receive({type:'PCH_HELLO'},helper,r=>{helloResult=r;});await new Promise(resolve=>setImmediate(resolve));assert.equal(healthCalls,1);assert.equal(helloResult,undefined);
  let stateResult;receive({type:'PCH_STATE'},game,r=>{stateResult=r;});await new Promise(resolve=>setImmediate(resolve));assert(stateResult.ok);assert.equal(helloResult,undefined);
  for(const fn of [...timers.values()])fn();await new Promise(resolve=>setImmediate(resolve));assert(helloResult.ok);assert.equal(helloResult.game.connected,0);assert.equal(timers.size,0);
});
