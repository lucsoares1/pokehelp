import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {itemAdvice,validItemSnapshot,rankItemOffers,carouselItemChoices,recipeQueue,rewardChoices} from '../extension/item-model.mjs';
import {itemAdviceView} from '../extension/item-view.mjs';
import {handleMessage,initialState,referenceKey} from '../extension/protocol.mjs';
const catalog=[{id:'A',name:'Componente A',components:[]},{id:'B',name:'Componente B',components:[]},{id:'C',name:'Componente C',components:[]},{id:'AB',name:'Equipamento AB',components:['A','B']},{id:'AA',name:'Equipamento AA',components:['A','A']},{id:'AC',name:'Equipamento AC',components:['A','C']}].map(i=>({...i,image:`assets/pac/items/${i.id}.png`}));
const pokemons=[{id:'FINAL',family:'BASE'},{id:'BASE',family:'BASE'},{id:'OTHER',family:'OTHER'}];
const plan=(...ids)=>({units:ids.map((id,slot)=>({slot,id:'FINAL',name:'Destino',items:[{id}]}))});
const snapshot=(inventory=[],equipped=[])=>({code:'connected',inventory,equipped,sources:[]});

test('receitas usam contagens reais: componente repetido e compartilhado não é duplicado',()=>{
  const one=itemAdvice(plan('AA'),catalog,pokemons,snapshot(['A']));assert.equal(one.goals[0].status,'missing');assert.deepEqual(one.goals[0].missing,['A']);assert.equal(one.used.get('A'),1);
  const shared=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A','C']));assert.equal(shared.goals[0].status,'missing');assert.deepEqual(shared.goals[0].missing,['A','B']);assert.equal(shared.goals[1].status,'craft');assert.equal(shared.used.get('A'),1);assert(!shared.picks.has('AC'));
  const enough=itemAdvice(plan('AA'),catalog,pokemons,snapshot(['A','A','A']));assert.equal(enough.goals[0].status,'craft');assert.equal(enough.used.get('A'),2);assert.equal(enough.picks.size,0);
});
test('equipados só abatem o destino da mesma família e cada cópia é usada uma vez',()=>{
  const wrong=itemAdvice(plan('AB'),catalog,pokemons,snapshot([],[{pokemon:'OTHER',items:['AB']}]));assert.equal(wrong.goals[0].status,'missing');
  const right=itemAdvice(plan('AB','AB'),catalog,pokemons,snapshot([],[{pokemon:'BASE',items:['AB']}]));assert.equal(right.goals[0].status,'equipped');assert.equal(right.goals[1].status,'missing');
  const loose=itemAdvice({...plan('AB'),obtained:[0]},catalog,pokemons,snapshot(['AB','A']));assert.equal(loose.goals[0].status,'available');assert.equal(loose.used.get('AB'),1);assert(!loose.used.has('A'));assert.equal(loose.picks.size,0);
});
test('reserva desconhecida não é reserva vazia, e peças prontas não significam equipamentos prontos',()=>{
  const p=plan('AB');const unknown=itemAdvice(p,catalog,pokemons,{code:'waiting'});assert.equal(unknown.known,false);assert.equal(unknown.goals[0].status,'unknown');assert(unknown.picks.has('A'));
  const empty=itemAdvice({...p,obtained:[0]},catalog,pokemons,snapshot());assert.equal(empty.known,true);assert.deepEqual(empty.goals[0].missing,['A','B']);
  assert.match(itemAdviceView(p,catalog,pokemons,{code:'waiting'}),/Abra os detalhes/);assert(!itemAdviceView(p,catalog,pokemons,{code:'waiting'}).includes('Falta:'));
  const unsafe=plan('AB');unsafe.units[0].name='<img onerror=x>';assert(itemAdviceView(unsafe,catalog,pokemons,snapshot()).includes('&lt;img onerror=x&gt;'));
});
test('escolha prioriza equipamento pronto ou último componente, sem fingir posse desconhecida',()=>{
  const advice=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A']));
  const ranks=rankItemOffers(advice,['C','B','AB']);assert.deepEqual(ranks.map(r=>r.id),['AB','B','C']);assert(ranks.every(r=>r.completes));
  const duplicate=itemAdvice(plan('AA'),catalog,pokemons,snapshot(['A']));assert(rankItemOffers(duplicate,['A'])[0].completes);
  const unknown=rankItemOffers(itemAdvice(plan('AB'),catalog,pokemons,{code:'carousel'}),['A','B']);assert(unknown.every(r=>r.score===0&&!r.completes));
  assert(!rankItemOffers(itemAdvice(plan('AB'),catalog,pokemons,snapshot(['AB'])),['AB','A','B']).length);
});
test('carrossel tem uma única prioridade por oferta, inclusive cópias do mesmo componente',()=>{
  const advice=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A']));
  const sources=[{key:'one',item:'B'},{key:'two',item:'B'},{key:'three',item:'C'},{key:'four',item:'A'}];
  const choices=carouselItemChoices(advice,sources);assert.equal(choices.filter(c=>c.primary).length,1);assert.equal(choices.find(c=>c.primary).source.key,'one');assert.equal(choices[1].primary,false);
  const unknown=carouselItemChoices(itemAdvice(plan('AB'),catalog,pokemons,{code:'waiting'}),sources);assert(unknown.every(c=>!c.primary));
});

test('receitas numeradas distinguem três componentes para o mesmo Pokémon sem reutilizá-los',()=>{
  const advice=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A','B','C'])),queue=recipeQueue(advice);
  assert.deepEqual(queue.map(q=>[q.number,q.goal.id,q.goal.status]),[[1,'AB','craft'],[2,'AC','missing']]);
  assert.deepEqual(queue[0].goal.allocated,['A','B']);assert.deepEqual(queue[1].goal.allocated,['C']);assert.deepEqual(queue[1].goal.missing,['A']);
  const html=itemAdviceView(plan('AB','AC'),catalog,pokemons,snapshot(['A','B','C']));assert.match(html,/O que juntar primeiro/);assert.match(html,/Monte primeiro/);assert.match(html,/Componente A/);assert.match(html,/Componente B/);
  const after=recipeQueue(itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['AB','C'])));assert.equal(after.length,1);assert.equal(after[0].goal.id,'AC');
  assert.equal(recipeQueue(itemAdvice(plan('AB'),catalog,pokemons,{code:'waiting'})).length,0);
});

test('escolha de Pokémon com item usa o item anexo e distingue alvo da equipe de afinidade do item',()=>{
  const advice=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A']));
  const sources=[{key:'one',item:'C'},{key:'two',item:'B'},{key:'three',item:'A'}];
  const choices=rewardChoices(advice,sources);assert.equal(choices[0].source.key,'two');assert.equal(choices.filter(c=>c.primary).length,1);assert.equal(choices[0].rank.goal.id,'AB');
  const wanted=rewardChoices(advice,[...sources,{key:'four',pokemonWanted:true}]);assert.equal(wanted[0].source.key,'four');assert.equal(wanted[0].rank,undefined);assert(wanted[0].primary);
  const unknown=itemAdvice(plan('AB'),catalog,pokemons,{code:'waiting'});assert(rewardChoices(unknown,sources).every(c=>!c.primary));assert.equal(rewardChoices(unknown,[{key:'wanted',pokemonWanted:true}])[0].primary,true);
});
test('ponte recusa catálogo desconhecido, coordenadas inválidas, excesso e chaves duplicadas',()=>{
  const ids=new Set(catalog.map(i=>i.id)),pids=new Set(pokemons.map(p=>p.id)),s=snapshot(['A']);
  const source={key:'stash:0',kind:'stash',item:'A',rect:{x:20,y:20,width:35,height:35}};s.sources=[source];assert(validItemSnapshot(s,ids,pids));
  for(const change of [{inventory:['UNKNOWN']},{inventory:Array(257).fill('A')},{sources:[source,source]},{sources:[{...source,rect:{...source.rect,x:NaN}}]},{sources:[{...source,item:'<img>'}]},{equipped:[{pokemon:'BAD',items:[]}]}])assert.equal(validItemSnapshot({...s,...change},ids,pids),null);
  assert.equal(validItemSnapshot({...s,code:'scouting'},ids,pids).inventory,null);
});
test('endpoint entrega apenas plano estático ao jogo e nunca grava inventário',async()=>{
  const selection={compId:'one',snapshotId:'snap',variantIndex:0},plans={[referenceKey(selection)]:plan('AB')};let writes=0;
  const env={id:'test',plans,itemCatalog:catalog,pokemonCatalog:pokemons,storage:{get:async()=>({...initialState(),selection,shopEnabled:true}),set:async()=>writes++}};
  const game={id:'test',url:'https://pokemon-auto-chess.com/game',frameId:0};assert((await handleMessage({type:'PCH_ITEM_PLAN'},game,env)).context.plan);assert.equal(writes,0);
  for(const sender of [{...game,frameId:1},{...game,url:'http://127.0.0.1:4173/'},{...game,url:'chrome-extension://test/overlay/index.html'}])await assert.rejects(handleMessage({type:'PCH_ITEM_PLAN'},sender,env));
  env.storage.get=async()=>({...initialState(),selection,shopEnabled:false});assert.equal((await handleMessage({type:'PCH_ITEM_PLAN'},game,env)).context,null);
});

test('carrossel realoca reserva parcial para fechar a receita disponível, antes de acumular componentes',()=>{
  const advice=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A'])),before=JSON.stringify(advice.goals);
  // A was earmarked for AB, but B is absent. C can use that A to finish AC.
  const ranks=rankItemOffers(advice,['A','C']);
  assert.deepEqual(ranks.map(r=>r.id),['C']);assert.equal(ranks[0].goal,advice.goals[1]);assert(ranks[0].completes);assert.deepEqual(ranks[0].allocated,['A']);assert.deepEqual(ranks[0].missing,['C']);
  const choices=carouselItemChoices(advice,[{key:'extra',item:'A'},{key:'finish',item:'C'}]);assert.equal(choices.find(c=>c.primary).source.key,'finish');
  assert.equal(rewardChoices(advice,[{key:'extra',item:'A'},{key:'finish',item:'C'}])[0].source.key,'finish');
  assert.equal(JSON.stringify(advice.goals),before);assert.equal(advice.offerPool.get('A'),1);
  assert.deepEqual(rankItemOffers(advice,['C']),rankItemOffers(advice,['C']));
});

test('fechar receita supera componente futuro; empate mantém a ordem da comp',()=>{
  const advice=itemAdvice(plan('AB','AC','AA'),catalog,pokemons,snapshot(['C']));
  const ranks=rankItemOffers(advice,['B','A']);assert.equal(ranks[0].id,'A');assert.equal(ranks[0].goal.id,'AC');assert(ranks[0].completes);assert(!ranks[1].completes);
  const tied=rankItemOffers(itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A'])),['C','B']);assert.deepEqual(tied.map(r=>r.id),['B','C']);
});

test('ofertas preservam receitas completas e contam componentes repetidos',()=>{
  const advice=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['A','B']));
  const ranks=rankItemOffers(advice,['C','A','AB']);assert(ranks.every(r=>!r.completes));assert(!ranks.some(r=>r.id==='AB'));assert(ranks.every(r=>!r.allocated.length));
  const duplicate=itemAdvice(plan('AB','AA'),catalog,pokemons,snapshot(['A']));
  const repeated=rankItemOffers(duplicate,['A'])[0];assert.equal(repeated.goal.id,'AA');assert(repeated.completes);assert.deepEqual(repeated.allocated,['A']);
  const available=itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['AB','A']));assert.equal(rankItemOffers(available,['C'])[0].goal.id,'AC');assert(rankItemOffers(available,['C'])[0].completes);
  const already=itemAdvice(plan('AB'),catalog,pokemons,snapshot(['AB','A']));assert.deepEqual(rankItemOffers(already,['A','B','AB']),[]);
});

test('prioridade acompanha a reserva e desconhecido nunca afirma completar receita',()=>{
  for(const [inventory,winner]of [[['A'],'B'],[['C'],'A'],[['B'],'A']]){
    const ranks=rankItemOffers(itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(inventory)),['A','B','C']);assert.equal(ranks[0].id,winner);assert(ranks[0].completes);
  }
  const unknown=rankItemOffers(itemAdvice(plan('AB','AC'),catalog,pokemons,{code:'carousel'}),['C','B']);assert(unknown.every(r=>!r.completes&&r.allocated.length===0));
  assert.deepEqual(rankItemOffers(itemAdvice(plan('AB','AC'),catalog,pokemons,snapshot(['AB','AC'])),['A','B','C']),[]);
});

test('painel inspecionado usa a receita possível da oferta sem reescrever a fila atual',()=>{
  const state={...snapshot(['A']),focus:{kind:'carousel',item:'C',goal:1}},html=itemAdviceView(plan('AB','AC'),catalog,pokemons,state);
  const inspected=html.split('ov-item-inspected')[1].split('</article>')[0];assert.match(inspected,/Equipamento AC/);assert.match(inspected,/Falta: Componente C/);assert(!inspected.includes('Falta: Componente A'));
  assert.match(html.split('ov-craft-queue')[1].split('</section>')[0],/Equipamento AB/);
});

test('catálogo real fecha Boneca com Escama mesmo quando o Gelo estava separado para Lentes',async()=>{
  const bundle=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8'));
  const p=plan('WIDE_LENS','POKE_DOLL'),state=snapshot(['NEVER_MELT_ICE']);
  const advice=itemAdvice(p,bundle.guide.items,bundle.guide.pokemons,state),ranks=rankItemOffers(advice,['NEVER_MELT_ICE','HEART_SCALE']);
  assert.deepEqual(ranks.map(r=>r.id),['HEART_SCALE']);assert(ranks[0].completes);assert.equal(ranks[0].goal.id,'POKE_DOLL');assert.deepEqual(ranks[0].allocated,['NEVER_MELT_ICE']);
  const {itemAdvice:packagedAdvice,rankItemOffers:packagedRank}=await import('../extension/dist/item-model.mjs');
  assert.deepEqual(packagedRank(packagedAdvice(p,bundle.guide.items,bundle.guide.pokemons,state),['NEVER_MELT_ICE','HEART_SCALE']),ranks);
});

const nativeSource=await readFile(new URL('../extension/items-native.js',import.meta.url),'utf8');
function nativeFixture(){
  const events={},messages=[],timers=new Map();let seq=0,details=true,reads=0;
  const sprite={visible:true,getBounds(){reads++;return {x:100,y:100,width:20,height:20};}};
  const canvas={isConnected:true,getBoundingClientRect:()=>({left:50,top:30,right:550,bottom:530,width:500,height:500})};
  const scene={sys:{settings:{key:'gameScene'},isActive:()=>true,game:{canvas}},uid:'own',spectate:false,scale:{width:1000,height:1000},cameras:{main:{scrollX:10,scrollY:20,matrix:{transformPoint(x,y,p){p.x=x*2+5;p.y=y*2+7;return p;}}}},itemsContainer:{playerId:'own',pokemonId:null,items:['A'],list:[{name:'A',playerId:'own',pokemonId:null,sprite}]},board:{player:{id:'own',board:new Map([['p',{name:'BASE',items:['AB']}]])}},minigameManager:{uid:'own',display:false,items:new Map([['free',{name:'B',sprite,circle:{strokeColor:0xffffff}}],['taken',{name:'C',sprite,circle:{strokeColor:0xcf0000}}],['mine',{name:'A',sprite,circle:{strokeColor:0x4cff00}}]])}};
  const window={addEventListener:(type,fn)=>events[type]=fn,postMessage:m=>messages.push(structuredClone(m))};
  const document={hidden:false,querySelector:selector=>selector==='#game canvas'?canvas:null,querySelectorAll:()=>details?[{phaser:{scene}}]:[]},NativeMap=vm.runInNewContext('Map');
  vm.runInNewContext(nativeSource,{Map:NativeMap,window,top:window,location:{origin:'https://pokemon-auto-chess.com'},document,getComputedStyle:()=>({visibility:'visible'}),innerWidth:1000,innerHeight:800,setTimeout:fn=>{timers.set(++seq,fn);return seq;},clearTimeout:id=>timers.delete(id),Date});
  const watch=(changes={})=>events.message({source:window,origin:'https://pokemon-auto-chess.com',data:{channel:'PCH_NATIVE_ITEMS_V1',type:'watch',token:'a'.repeat(32),enabled:true,...changes}});
  return {scene,canvas,sprite,document,messages,timers,watch,events,window,NativeMap,set details(v){details=v;},get reads(){return reads;}};
}
test('leitor nativo projeta zoom/pan/escala e usa sprite, preservando itens reivindicados',()=>{
  const f=nativeFixture();f.watch();const s=f.messages.at(-1).snapshot;assert.equal(s.code,'connected');assert.deepEqual(s.inventory,['A']);assert.deepEqual(s.equipped,[{pokemon:'BASE',items:['AB']}]);assert.equal(s.sources.length,2);assert.deepEqual(s.sources[0].rect,{x:142.5,y:113.5,width:20,height:20});assert.equal(s.sources.find(s=>s.kind==='carousel').item,'B');assert.equal(f.scene.minigameManager.display,false);
  f.sprite.visible=false;f.watch();assert.equal(f.messages.at(-1).snapshot.sources.length,0);
});

test('reserva das primeiras etapas vem do jogador mesmo antes de os ícones renderizarem',()=>{
  const f=nativeFixture();f.scene.board.uid='own';f.scene.board.player.items=['A','B','C'];f.scene.itemsContainer.items=[];f.scene.itemsContainer.list=[];
  f.watch();let s=f.messages.at(-1).snapshot;assert.equal(s.code,'connected');assert.equal(s.reserveSource,'player');assert.deepEqual(s.inventory,['A','B','C']);
  f.scene.itemsContainer.list=[{name:'A',playerId:'own',pokemonId:null,sprite:f.sprite}];f.watch();s=f.messages.at(-1).snapshot;assert.deepEqual(s.inventory,['A','B','C']);assert.equal(s.sources.filter(s=>s.kind==='stash').length,1);
  f.scene.itemsContainer=undefined;f.watch();s=f.messages.at(-1).snapshot;assert.equal(s.code,'connected');assert.deepEqual(s.inventory,['A','B','C']);
  f.scene.board.player.id='other';Object.defineProperty(f.scene.board.player,'items',{get(){throw Error('Não ler itens de outro jogador');}});f.watch();assert.equal(f.messages.at(-1).snapshot.inventory,null);
});

test('campo/banco carregam nível próprio, flags e capacidade nativa, incluindo regra especial',()=>{
  const f=nativeFixture(),query=f.document.querySelector;f.scene.board.uid='own';f.scene.board.player.experienceManager={level:5};f.scene.board.player.boardSize=1;
  f.scene.board.player.board=new Map([['base',{id:'base',name:'BASE',positionX:0,positionY:1,stars:1,items:[],canBePlaced:true,doesCountForTeamSize:true}]]);
  const counter={textContent:'1/8',getClientRects:()=>[{}]};f.document.querySelector=s=>s==='#game-team-info [data-tooltip-id="detail-team-size"] > span'?counter:query(s);
  f.watch();const s=f.messages.at(-1).snapshot;assert.equal(s.level,5);assert.equal(s.capacity,8);assert.equal(s.teamSize,1);assert.equal(s.board[0].canPlace,true);assert.equal(s.board[0].countsForTeam,true);
  const valid=validItemSnapshot(s,new Set(['A','B','AB']),new Set(['BASE']));assert.equal(valid.capacity,8);assert.equal(valid.board[0].canPlace,true);
  for(const change of [{level:0},{capacity:25},{teamSize:-1},{board:[{...s.board[0],canPlace:'yes'}]}])assert.equal(validItemSnapshot({...s,...change},new Set(['A','B','AB']),new Set(['BASE'])),null);
  counter.textContent='0/8';f.watch();assert.equal(f.messages.at(-1).snapshot.capacity,null);
  counter.textContent='1/7';f.watch();assert.equal(f.messages.at(-1).snapshot.capacity,null);
  f.scene.board.player.id='other';Object.defineProperty(f.scene.board.player,'experienceManager',{get(){throw Error('Não ler nível de outro jogador');}});f.watch();assert.equal(f.messages.at(-1).snapshot.level,undefined);
});

test('ofertas são lidas apenas do dono e ligadas aos slots nativos, independentemente da reserva',()=>{
  const f=nativeFixture(),query=f.document.querySelectorAll;f.scene.board.uid='own';f.scene.board.player.shop=['BASE','DEFAULT','OTHER'];
  const cards=[0,1,2].map(index=>({classList:{contains:name=>name==='empty'&&index===1},getAttribute:()=>`tooltip-shop-${index}`}));
  f.document.querySelectorAll=selector=>selector==='.game-pokemons-store > .game-pokemon-portrait'?cards:query(selector);
  f.scene.itemsContainer=undefined;f.watch();assert.deepEqual(f.messages.at(-1).snapshot.shop,{slots:3,offers:[{index:0,pokemon:'BASE'},{index:2,pokemon:'OTHER'}]});
  f.scene.board.player.shop[0]='OTHER';f.watch();assert.equal(f.messages.at(-1).snapshot.shop.offers[0].pokemon,'OTHER');
  f.scene.board.player.id='other';Object.defineProperty(f.scene.board.player,'shop',{get(){throw Error('Não ler loja alheia');}});f.watch();assert.equal(f.messages.at(-1).snapshot.shop,null);
});

test('loja renderizada independe da cena e escolhe o commit atual do React, sem ler store ou hooks',()=>{
  const f=nativeFixture();f.details=false;
  const cards=['BASE',null,'OTHER'].map((pokemon,index)=>{
    const card={classList:{contains:name=>name==='empty'&&pokemon===null},getAttribute:()=>`tooltip-shop-${index}`},domProps={children:index};
    const parent={memoizedProps:{origin:'shop',index,pokemon}},current={stateNode:card,memoizedProps:domProps,return:parent};
    Object.defineProperty(parent,'memoizedState',{get(){throw Error('Não ler hooks nem store');}});
    card.__reactProps$test=domProps;card.__reactFiber$test={stateNode:card,memoizedProps:{},return:{memoizedProps:{origin:'shop',index,pokemon:'STALE'}},alternate:current};
    return card;
  });
  f.document.querySelectorAll=selector=>selector==='.game-pokemons-store > .game-pokemon-portrait'?cards:[];
  f.watch();let s=f.messages.at(-1).snapshot;assert.equal(s.code,'waiting');assert.deepEqual(s.shop,{slots:3,offers:[{index:0,pokemon:'BASE'},{index:2,pokemon:'OTHER'}]});assert.equal(s.diagnostics.shop,'react-read');
  cards[0].__reactFiber$test.alternate.return.memoizedProps.origin='player';f.watch();assert.equal(f.messages.at(-1).snapshot.shop,null);
  f.watch({enabled:false});
});

test('estágio 0 conecta ao Phaser sem detalhes nem reserva e lê os oito portais renderizados',()=>{
  const f=nativeFixture(),manager=f.scene.minigameManager;f.details=false;
  const stage={textContent:'Estágio 0',getClientRects:()=>[{}]};
  f.document.querySelector=selector=>selector==='#game canvas'?f.canvas:selector==='#game-stage-info .stage-information > p'?stage:null;
  const game=f.scene.sys.game;game.canvas=f.canvas;game.scene={getScene:key=>{assert.equal(key,'gameScene');return f.scene;}};f.window.PHASER_GAME=game;
  f.scene.itemsContainer=undefined;manager.items.clear();manager.pokemons=new Map([['own',{playerId:'own',visible:true,scaleX:1,scaleY:1}]]);
  manager.portals=new Map(Array.from({length:8},(_,i)=>['p'+i,{id:'p'+i,sprite:f.sprite,visible:true}]));
  manager.symbols=new Map(Array.from({length:8},(_,i)=>['s'+i,{...f.sprite,synergy:i===0?'DRAGON':'WATER',portalId:'p'+i}]));
  Object.defineProperty(f.scene,'room',{get(){throw Error('Não ler sala');}});
  f.watch();const snapshot=f.messages.at(-1).snapshot;
  assert.equal(snapshot.code,'carousel');assert.equal(snapshot.stage,0);assert.equal(snapshot.inventory,null);assert.equal(snapshot.portals.length,8);assert.deepEqual(snapshot.portals[0].types,['DRAGON']);
  const valid=validItemSnapshot(snapshot,new Set(catalog.map(i=>i.id)),new Set(pokemons.map(p=>p.id)),new Set(['DRAGON','WATER']));assert(valid);assert.equal(valid.portals.length,8);
});

test('descoberta inicial ignora canvas alheio, cena inativa, errada ou ainda não registrada',()=>{
  for(const mode of ['foreign','inactive','otherScene','otherGame','boot']){
    const f=nativeFixture();f.details=false;const game=f.scene.sys.game;
    f.window.PHASER_GAME=game;game.canvas=f.canvas;f.document.querySelector=()=>mode==='foreign'?{}:f.canvas;
    game.scene={getScene:()=>{if(mode==='boot')throw Error('Scene não registrada');return f.scene;}};
    if(mode==='inactive')f.scene.sys.isActive=()=>false;
    if(mode==='otherScene')f.scene.sys.settings.key='lobbyScene';
    if(mode==='otherGame')f.scene.sys.game={canvas:f.canvas};
    f.watch();assert.equal(f.messages.at(-1).snapshot.code,'waiting',mode);assert.equal(f.reads,0);
  }
  const retry=nativeFixture();retry.details=false;retry.document.querySelector=()=>retry.canvas;retry.window.PHASER_GAME=retry.scene.sys.game;
  retry.window.PHASER_GAME.scene={getScene:()=>{throw Error('Não registrado');}};retry.watch();assert.equal(retry.messages.at(-1).snapshot.code,'waiting');
  retry.window.PHASER_GAME.scene.getScene=()=>retry.scene;retry.watch();assert.equal(retry.messages.at(-1).snapshot.code,'connected');
});

test('Phaser de produção é descoberto no frame renderizado sem global de debug ou tooltip',()=>{
  const f=nativeFixture();f.details=false;const prototype=f.NativeMap.prototype,descriptor=Object.getOwnPropertyDescriptor(prototype,'forEach'),manager=f.scene.minigameManager;
  manager.pokemons=new f.NativeMap([['own',{scene:f.scene,playerId:'own',scaleX:1,scaleY:1}]]);
  Object.defineProperty(f.scene,'room',{get(){throw Error('A descoberta não deve acessar a sala');}});
  f.watch();assert.equal(f.messages.at(-1).snapshot.code,'waiting');assert.notEqual(prototype.forEach,descriptor.value);
  const thisArg={},calls=[];manager.pokemons.forEach(function(value,key,map){assert.equal(this,thisArg);calls.push([value,key,map]);},thisArg);
  assert.equal(calls.length,1);assert.equal(calls[0][2],manager.pokemons);assert.deepEqual(Object.getOwnPropertyDescriptor(prototype,'forEach'),descriptor);
  f.watch();const s=f.messages.at(-1).snapshot;assert.equal(s.code,'connected');assert.equal(s.diagnostics.scene,'render-loop');assert.equal(s.diagnostics.global,false);assert.equal(s.diagnostics.nativeVersion,'0.18.0');
});

test('sonda temporária preserva erros, rejeita mapas/canvas alheios e restaura ao desligar',()=>{
  const f=nativeFixture();f.details=false;const prototype=f.NativeMap.prototype,original=prototype.forEach,own={scene:f.scene};
  f.scene.minigameManager.pokemons=new f.NativeMap([['own',own]]);f.watch();
  assert.throws(()=>prototype.forEach.call({},()=>{}),e=>e.name==='TypeError');assert.throws(()=>new f.NativeMap().forEach(null),e=>e.name==='TypeError');
  const sentinel=Error('erro nativo');assert.throws(()=>f.scene.minigameManager.pokemons.forEach(()=>{throw sentinel;}),e=>e===sentinel);assert.equal(prototype.forEach,original);
  const other=nativeFixture();other.details=false;const baseline=other.NativeMap.prototype.forEach;other.watch();
  new other.NativeMap([['unrelated',{scene:other.scene}]]).forEach(()=>{});assert.notEqual(other.NativeMap.prototype.forEach,baseline);
  const manager=other.scene.minigameManager;manager.pokemons=new other.NativeMap([['own',{scene:other.scene}]]);other.scene.sys.game.canvas={isConnected:true};manager.pokemons.forEach(()=>{});assert.notEqual(other.NativeMap.prototype.forEach,baseline);
  other.watch({enabled:false});assert.equal(other.NativeMap.prototype.forEach,baseline);assert.equal(other.timers.size,0);
  const timeout=nativeFixture();timeout.details=false;const before=timeout.NativeMap.prototype.forEach;timeout.watch();[...timeout.timers.values()][0]();assert.equal(timeout.NativeMap.prototype.forEach,before);timeout.watch({enabled:false});
});

test('detalhes e preview temporário não perdem a reserva; uma geometria destruída não invalida todos os itens',()=>{
  const f=nativeFixture(),item=f.scene.itemsContainer.list[0],original=item.sprite.getBounds;
  f.watch();assert.equal(f.messages.at(-1).snapshot.sources.length,2);
  item.detail={visible:true,getBounds(){throw Error('Não usar área do tooltip');}};f.watch();assert.equal(f.messages.at(-1).snapshot.sources.length,2);
  item.sprite.visible=false;item.tempSprite={visible:true,getBounds:()=>({x:200,y:200,width:20,height:20})};f.watch();assert(f.messages.at(-1).snapshot.sources.some(s=>s.kind==='stash'));
  item.sprite.visible=true;delete item.tempSprite;item.sprite.getBounds=()=>{throw Error('Sprite substituído entre frames');};f.watch();assert.equal(f.messages.at(-1).snapshot.code,'connected');assert.deepEqual(f.messages.at(-1).snapshot.inventory,['A']);
  item.sprite.getBounds=original;f.watch();assert.equal(f.messages.at(-1).snapshot.sources.length,2);
});

test('lê somente a recompensa exibida do próprio jogador; esconder o menu remove ofertas',()=>{
  const f=nativeFixture(),query=f.document.querySelectorAll;let shown=true;
  f.document.querySelector=selector=>selector==='#game canvas'?f.canvas:selector==='.game-choice > .my-container'?{getClientRects:()=>shown?[{}]:[]}:null;
  f.document.querySelectorAll=selector=>selector==='.game-choice-pokemons-list > .my-box.active.clickable'?[{},{}]:query(selector);
  const choices=[{pokemons:['BASE','OTHER'],items:['A','B']}];Object.defineProperty(choices,1,{get(){throw Error('Não ler recompensa futura');}});f.scene.board.player.choices=choices;
  f.watch();assert.deepEqual(f.messages.at(-1).snapshot.rewards,[{index:0,pokemon:'BASE',item:'A'},{index:1,pokemon:'OTHER',item:'B'}]);
  shown=false;f.watch();assert.deepEqual(f.messages.at(-1).snapshot.rewards,[]);
  f.scene.itemsContainer.playerId='other';Object.defineProperty(f.scene.board.player,'choices',{get(){throw Error('Não ler oferta do campo alheio');}});f.watch();assert.equal(f.messages.at(-1).snapshot.code,'carousel');
});
test('leitor distingue falta de ligação, campo alheio e contrato incompatível sem ler inventário alheio',()=>{
  const waiting=nativeFixture();waiting.details=false;waiting.watch();assert.equal(waiting.messages.at(-1).snapshot.code,'waiting');assert.equal(waiting.reads,0);
  for(const mode of ['spectate','scouting']){const f=nativeFixture();if(mode==='spectate')f.scene.spectate=true;else f.scene.itemsContainer.playerId='other';f.scene.minigameManager.items.clear();Object.defineProperty(f.scene.itemsContainer,'items',{get(){throw Error('Inventário alheio não pode ser lido');}});f.watch();assert.equal(f.messages.at(-1).snapshot.code,'scouting');assert.equal(f.reads,0);}
  const pending=nativeFixture();pending.scene.itemsContainer.list=[];pending.scene.minigameManager.items.clear();pending.watch();assert.equal(pending.messages.at(-1).snapshot.code,'connected');assert.deepEqual(pending.messages.at(-1).snapshot.inventory,['A']);assert.equal(pending.messages.at(-1).snapshot.sources.length,0);
});
test('carrossel próprio segue disponível sem ler reserva ou equipe do campo alheio',()=>{
  const f=nativeFixture();f.scene.itemsContainer.playerId='other';Object.defineProperty(f.scene.itemsContainer,'items',{get(){throw Error('Não ler inventário alheio');}});f.watch();
  const value=f.messages.at(-1).snapshot;assert.equal(value.code,'carousel');assert.equal(value.inventory,null);assert.deepEqual(value.equipped,[]);assert.deepEqual(value.sources.map(s=>s.item),['B']);
  const ids=new Set(catalog.map(i=>i.id)),pids=new Set(pokemons.map(p=>p.id));assert(validItemSnapshot(value,ids,pids));
  assert.equal(validItemSnapshot({...value,sources:[{...value.sources[0],kind:'stash'}]},ids,pids),null);assert.equal(validItemSnapshot({...value,inventory:['A']},ids,pids),null);
  f.scene.minigameManager.uid='other';f.watch();assert.equal(f.messages.at(-1).snapshot.code,'scouting');
});
test('campo próprio lê instâncias/posição/estrelas e muda ao trocar peças, sem ler sala ou sprite alheio',()=>{
  const f=nativeFixture(),own={id:'one',name:'BASE',positionX:2,positionY:3,stars:2,items:['AB']},bench={id:'two',name:'OTHER',positionX:1,positionY:0,stars:1,items:[]};
  Object.defineProperty(f.scene,'room',{get(){throw Error('Não ler a sala');}});f.scene.board.uid='own';f.scene.board.mode='pick';f.scene.board.player.board=new Map([['one',own],['two',bench]]);
  f.scene.board.pokemons=new Map([['one',{playerId:'other',name:'BASE',inBattle:false,sprite:{getBounds(){throw Error('Não ler sprite alheio');}}}]]);
  f.watch();let value=f.messages.at(-1).snapshot;assert.equal(value.boardMode,'pick');assert.deepEqual(value.board.map(u=>[u.key,u.pokemon,u.x,u.y,u.stars]),[['unit:one','BASE',2,3,2],['unit:two','OTHER',1,0,1]]);assert(!value.board[0].rect);
  own.positionY=0;own.name='FINAL';own.stars=3;f.watch();value=f.messages.at(-1).snapshot;assert.equal(value.board[0].y,0);assert.equal(value.board[0].pokemon,'FINAL');assert.equal(value.board[0].stars,3);
  f.scene.board.player.id='other';Object.defineProperty(f.scene.board.player,'board',{get(){throw Error('Não ler campo alheio');}});f.watch();assert.equal(f.messages.at(-1).snapshot.board,null);
});
test('portais agrupam símbolos renderizados por id, somem após reivindicação e não leem sala privada',()=>{
  const f=nativeFixture(),manager=f.scene.minigameManager;Object.defineProperty(f.scene,'room',{get(){throw Error('Não ler a sala');}});
  manager.pokemons=new Map([['own',{playerId:'own',visible:true,scaleX:1,scaleY:1}]]);
  manager.portals=new Map([['one',{id:'one',sprite:f.sprite,visible:true}],['two',{id:'two',sprite:f.sprite,visible:true}]]);
  manager.symbols=new Map([['a',{synergy:'WATER',portalId:'one',...f.sprite}],['b',{synergy:'WATER',portalId:'one',...f.sprite}],['c',{synergy:'DRAGON',portalId:'two',...f.sprite}],['hidden',{synergy:'PSYCHIC',portalId:'two',...f.sprite,visible:false}]]);
  f.watch();let value=f.messages.at(-1).snapshot;assert.deepEqual(value.portals.map(p=>p.types),[['WATER','WATER'],['DRAGON']]);
  const types=new Set(['WATER','DRAGON']),ids=new Set(catalog.map(i=>i.id)),pids=new Set(pokemons.map(p=>p.id));assert(validItemSnapshot(value,ids,pids,types));
  for(const extra of [{stage:100},{portals:[...value.portals,value.portals[0]]},{portals:[{...value.portals[0],types:['UNKNOWN']}]},{portals:[{...value.portals[0],rect:{...value.portals[0].rect,width:NaN}}]}])assert.equal(validItemSnapshot({...value,...extra},ids,pids,types),null);
  manager.symbols.delete('a');manager.symbols.delete('b');f.watch();assert.deepEqual(f.messages.at(-1).snapshot.portals.map(p=>p.types),[['DRAGON']]);
  f.scene.itemsContainer.playerId='other';Object.defineProperty(f.scene.itemsContainer,'items',{get(){throw Error('Não ler reserva alheia');}});manager.items.clear();f.watch();value=f.messages.at(-1).snapshot;assert.equal(value.code,'carousel');assert.equal(value.inventory,null);assert.equal(value.portals.length,1);
  manager.pokemons.get('own').scaleX=0;f.watch();assert.equal(f.messages.at(-1).snapshot.portals.length,0);manager.pokemons.get('own').scaleX=1;
  manager.uid='other';f.watch();assert.equal(f.messages.at(-1).snapshot.portals.length,0);
});
test('leitor não roda desligado/aba oculta, ignora origem falsa e expira vínculo com cena destruída',()=>{
  const f=nativeFixture();f.events.message({source:f.window,origin:'https://evil.test',data:{channel:'PCH_NATIVE_ITEMS_V1',type:'watch',token:'a'.repeat(32),enabled:true}});assert.equal(f.messages.length,0);
  f.document.hidden=true;f.watch();assert.equal(f.messages.length,0);f.document.hidden=false;f.watch();assert.equal(f.messages.at(-1).snapshot.code,'connected');
  f.watch({enabled:false});assert.equal(f.timers.size,0);const before=f.reads;f.canvas.isConnected=false;f.watch();assert.equal(f.messages.at(-1).snapshot.code,'waiting');assert.equal(f.reads,before);
});

test('todas as 778 builds conservam componentes e todas as receitas têm ícones e IDs canônicos',async()=>{
  const bundle=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8'));
  const ids=new Set(bundle.guide.items.map(i=>i.id));assert.equal(ids.size,357);assert.equal(bundle.guide.items.filter(i=>i.components.length).length,55);
  assert.deepEqual(bundle.guide.items.find(i=>i.id==='SOUL_DEW').components,['TWISTED_SPOON','MYSTIC_WATER']);
  for(const item of bundle.guide.items){assert(item.image.startsWith('assets/pac/'));for(const id of item.components)assert(ids.has(id));}
  for(const p of Object.values(bundle.plans)){
    const inventory=p.units.flatMap(p=>p.items).flatMap(i=>bundle.guide.items.find(j=>j.id===i.id).components).filter((_,i)=>i%3!==0),counts=new Map();for(const id of inventory)counts.set(id,(counts.get(id)||0)+1);
    const advice=itemAdvice(p,bundle.guide.items,bundle.guide.pokemons,snapshot(inventory));
    for(const [id,n]of advice.used)assert(n<=(counts.get(id)||0),id);
    for(const g of advice.goals){if(g.status==='craft'){assert.deepEqual(g.allocated,g.recipe);assert(!advice.picks.get(g.id)?.includes(g));}if(g.status==='missing')assert.equal(g.missing.length+g.allocated.length,g.recipe.length);}
  }
});
