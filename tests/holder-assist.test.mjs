import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {holderAdvice} from '../extension/holder-model.mjs';
import {validItemSnapshot} from '../extension/item-model.mjs';
import {itemAdviceView} from '../extension/item-view.mjs';
const pokemon=(id,stats,extra={})=>({id,family:id,name:id,image:'assets/'+id+'.png',kind:'pokemon',abilityId:'ATTACK',passiveId:'NONE',types:[],stats,abilityProfile:{scalesAP:false,specialDamage:false},...extra});
const caster={hp:60,atk:3,speed:35,range:3,maxPP:80,def:2,speDef:3},physical={hp:80,atk:15,speed:70,range:1,maxPP:100,def:3,speDef:3},tank={hp:150,atk:4,speed:30,range:1,maxPP:100,def:8,speDef:8};
const pokemons=[pokemon('FINAL_AP',caster,{abilityProfile:{scalesAP:true,specialDamage:true}}),pokemon('FINAL_AD',physical),pokemon('CASTER',caster,{abilityProfile:{scalesAP:true,specialDamage:true}}),pokemon('ATTACKER',physical),pokemon('TANK',tank),pokemon('EGG',tank,{passiveId:'EGG'}),pokemon('BASE_AP',caster,{family:'FINAL_AP',abilityProfile:{scalesAP:true,specialDamage:true}})];
const items=[['SOUL_DEW',{},['A','B']],['PUNCHING_GLOVE',{ATK:3},['A','C']],['KINGS_ROCK',{HP:100},['B','C']],['WATER_STONE',{PP:30},['A','D']],['A',{},[]],['B',{},[]],['C',{},[]],['D',{},[]]].map(([id,stats,components])=>({id,name:id,image:'assets/'+id+'.png',stats,components,holdable:true,consumable:false,removable:false}));
const unit=(pokemon,x=0,y=1,held=[],key=pokemon)=>({key:'unit:'+key,pokemon,x,y,stars:1,items:held});
const snapshot=(board,inventory=[])=>({code:'connected',inventory,board,boardMode:'pick',equipped:board.map(u=>({pokemon:u.pokemon,items:u.items})),sources:[],portals:[],stage:null});
const plan=(...goals)=>({units:goals.map(([id,item])=>({id,name:id,items:[{id:item}]}))});

test('campo real associa AP/ataque/tanque a portadores diferentes, ignorando o banco',()=>{
  const p=plan(['FINAL_AP','SOUL_DEW'],['FINAL_AD','PUNCHING_GLOVE'],['FINAL_AD','KINGS_ROCK']);
  const advice=holderAdvice(p,items,pokemons,snapshot([unit('CASTER'),unit('ATTACKER',1),unit('TANK',2,3),unit('FINAL_AP',3,0)],['SOUL_DEW','PUNCHING_GLOVE','KINGS_ROCK']));
  assert.equal(advice.source,'live');assert.deepEqual(advice.goals.map(g=>g.holder.id),['CASTER','ATTACKER','TANK']);assert(advice.goals.every(g=>g.holder.temporary));
});
test('campo vazio ou só banco não inventa presença do guia; sem leitura o fallback é condicional',()=>{
  const p=plan(['FINAL_AP','SOUL_DEW']),guide={level:4,lineup:[{id:'CASTER',stars:1}]};
  for(const board of [[],[unit('CASTER',0,0)]])assert(!holderAdvice(p,items,pokemons,snapshot(board,['SOUL_DEW']),{guide}).goals[0].holder);
  const advice=holderAdvice(p,items,pokemons,{code:'waiting'},{guide});assert.equal(advice.source,'guide');assert.equal(advice.goals[0].holder.source,'guide');
  const html=itemAdviceView(p,items,pokemons,{code:'waiting'},{guide});assert.match(html,/Campo não lido/);assert.match(html,/Exemplo condicional/);assert.match(html,/Quando montar/);
  const known=itemAdviceView(plan(['FINAL_AP','SOUL_DEW'],['FINAL_AD','PUNCHING_GLOVE']),items,pokemons,{...snapshot([],['SOUL_DEW']),board:null},{guide});assert.match(known,/A reserva foi lida/);assert.match(known,/Se estiver em campo, equipe em/);assert(!known.split('data-holder-advice')[1].split('</section>')[0].includes('PUNCHING_GLOVE'));
});
test('linhagem definitiva em campo tem prioridade; chegada e retirada de peças atualizam o portador',()=>{
  const p=plan(['FINAL_AP','SOUL_DEW']),stock=['SOUL_DEW'];
  let advice=holderAdvice(p,items,pokemons,snapshot([unit('CASTER')],stock));assert.equal(advice.goals[0].holder.id,'CASTER');
  advice=holderAdvice(p,items,pokemons,snapshot([unit('CASTER'),unit('BASE_AP',1)],stock));assert.equal(advice.goals[0].holder.id,'BASE_AP');assert.equal(advice.goals[0].holder.temporary,false);
  advice=holderAdvice(p,items,pokemons,snapshot([unit('FINAL_AP')],stock));assert.equal(advice.goals[0].holder.id,'FINAL_AP');
});
test('equipamento em provisório conta uma vez como em trânsito, sem pedir outra cópia',()=>{
  const p=plan(['FINAL_AP','SOUL_DEW']);let state=snapshot([unit('CASTER',0,1,['SOUL_DEW'])]);
  let advice=holderAdvice(p,items,pokemons,state);assert.equal(advice.goals[0].status,'held');assert(!advice.picks.has('SOUL_DEW'));assert(!advice.goals[0].transferTo);
  state=snapshot([unit('CASTER',0,1,['SOUL_DEW']),unit('FINAL_AP',1)]);advice=holderAdvice(p,items,pokemons,state);assert.equal(advice.goals[0].transferTo.id,'FINAL_AP');
  const html=itemAdviceView(p,items,pokemons,state);assert.match(html,/Já está com/);assert.match(html,/Destino já no campo: FINAL_AP/);
  advice=holderAdvice(p,items,pokemons,snapshot([unit('FINAL_AP')],['SOUL_DEW']));assert.equal(advice.goals[0].status,'available');assert.equal(advice.goals[0].holder.id,'FINAL_AP');
  const twice=holderAdvice(plan(['FINAL_AP','SOUL_DEW'],['FINAL_AP','SOUL_DEW']),items,pokemons,snapshot([unit('CASTER',0,1,['SOUL_DEW'])]));assert.deepEqual(twice.goals.map(g=>g.status),['held','missing']);
});
test('itens em outra família final são protegidos, não aconselha vender a peça nem reutiliza entrega',()=>{
  const p=plan(['FINAL_AP','SOUL_DEW'],['FINAL_AD','PUNCHING_GLOVE']);
  const advice=holderAdvice(p,items,pokemons,snapshot([unit('FINAL_AD',0,1,['SOUL_DEW'])]));assert(advice.goals[0].holder.protected);assert.equal(advice.goals[0].holder.temporary,false);assert(!advice.picks.has('SOUL_DEW'));
  assert.match(itemAdviceView(p,items,pokemons,snapshot([unit('FINAL_AD',0,1,['SOUL_DEW'])])),/Não venda uma peça da comp/);
  const done=holderAdvice(plan(['FINAL_AP','SOUL_DEW'],['FINAL_AP','SOUL_DEW']),items,pokemons,snapshot([unit('FINAL_AP',0,1,['SOUL_DEW'])]));assert.deepEqual(done.goals.map(g=>g.status),['equipped','missing']);
});
test('limita três itens por instância, não repete equipamento, não escolhe peça proibida ou tipo já nativo',()=>{
  const p=plan(['FINAL_AP','SOUL_DEW'],['FINAL_AP','SOUL_DEW'],['FINAL_AD','PUNCHING_GLOVE'],['FINAL_AD','KINGS_ROCK']);
  const advice=holderAdvice(p,items,pokemons,snapshot([unit('CASTER',0,1,['A','B']),unit('EGG',1)],['SOUL_DEW','SOUL_DEW','PUNCHING_GLOVE','KINGS_ROCK']));assert.equal(advice.goals.filter(g=>g.holder).length,1);
  const water=pokemons.map(p=>p.id==='CASTER'?{...p,types:['WATER']}:p);
  const rejected=holderAdvice(plan(['FINAL_AP','WATER_STONE']),items,water,snapshot([unit('CASTER')],['WATER_STONE']),{synergyGivenByItem:{WATER_STONE:'WATER'}});assert(!rejected.goals[0].holder);
});
test('não recomenda componente solto, item que depende de dano especial sem dano, ou silenciar um caster',()=>{
  const special=[...items,{id:'POKEMONOMICON',holdable:true,stats:{AP:30},components:['A','B']},{id:'NULLIFY_BANDANNA',holdable:true,stats:{SHIELD:30},components:['A','C']},{id:'RAW',holdable:true,categories:['component'],stats:{AP:20},components:[]}];
  const utility=pokemons.map(p=>p.id==='CASTER'?{...p,abilityProfile:{scalesAP:true,specialDamage:false}}:p);
  for(const id of ['POKEMONOMICON','RAW'])assert(!holderAdvice(plan(['FINAL_AP',id]),special,utility,snapshot([unit('CASTER')],[id])).goals[0].holder);
  assert(!holderAdvice(plan(['FINAL_AD','NULLIFY_BANDANNA']),special,pokemons,snapshot([unit('CASTER')],['NULLIFY_BANDANNA'])).goals[0].holder);
});
test('valida posições/instâncias/itens e exige que equipamento do campo conste na leitura própria',()=>{
  const state=snapshot([unit('CASTER',0,1,['SOUL_DEW'])]),ids=new Set(items.map(i=>i.id)),pids=new Set(pokemons.map(p=>p.id));assert(validItemSnapshot(state,ids,pids));
  for(const board of [[unit('CASTER',0,4)],[unit('CASTER'),unit('CASTER')],[unit('CASTER',0,1,['A','B','C','D'])],[unit('CASTER',0,1,['KINGS_ROCK'])]])assert.equal(validItemSnapshot({...state,board},ids,pids),null);
  assert.equal(validItemSnapshot({...state,code:'carousel',inventory:null,equipped:[]},ids,pids),null);
});
test('catálogo empacotado tem atributos/perfis reais e conserva slots/cópias nas 778 builds',async()=>{
  const b=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8'));
  assert(b.guide.pokemons.find(p=>p.id==='CHARMANDER').abilityProfile.specialDamage);assert.equal(b.guide.items.find(i=>i.id==='SOUL_DEW').holdable,true);
  const own=[unit('CHARMANDER',0,2),unit('RATICATE',1,1),unit('GEODUDE',2,3)];
  for(const p of Object.values(b.plans)){
    const inv=p.units.flatMap(u=>u.items.map(i=>i.id)).slice(0,9),advice=holderAdvice(p,b.guide.items,b.guide.pokemons,snapshot(own,inv),{synergyGivenByItem:b.guide.teamRules.synergyGivenByItem}),counts=new Map(),held=new Map();
    for(const g of advice.goals)if(g.holder){const k=g.holder.key;counts.set(k,(counts.get(k)||0)+1);if(!held.has(k))held.set(k,new Set());assert(!held.get(k).has(g.id));held.get(k).add(g.id);}
    assert([...counts.values()].every(n=>n<=3));for(const [id,n]of advice.used)assert(n<=inv.filter(i=>i===id).length);
  }
});
