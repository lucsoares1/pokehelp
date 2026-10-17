import test from 'node:test';
import assert from 'node:assert/strict';
import {rankEquipmentRewards} from '../extension/holder-model.mjs';
const items=[
  {id:'ASSAULT_VEST',stats:{SPE_DEF:40}},
  {id:'PROTECTIVE_PADS',stats:{ATK:6,SHIELD:60}},
  {id:'SAFETY_GOGGLES',stats:{DEF:3,CRIT_CHANCE:10}},
  {id:'PUNCHING_GLOVE',stats:{ATK:12}},
  {id:'REAPER_CLOTH',stats:{AP:10}},
  {id:'NULLIFY_BANDANNA',stats:{ATK:10}},
  {id:'WONDER_BOX',stats:{}},
  {id:'COMPONENT',stats:{ATK:3},categories:['component']},
  {id:'CONSUMABLE',stats:{ATK:3},consumable:true}
].map(i=>({name:i.id,components:['A','B'],categories:['craftable'],holdable:true,consumable:false,...i}));
const mon=(id,{tank=false,...props}={})=>({id,name:id,family:id,kind:'pokemon',stars:2,passiveId:'NONE',abilityId:'TACKLE',stats:{atk:tank?10:50,speed:tank?30:60,range:1,hp:tank?240:80,def:tank?20:4,speDef:tank?20:4,maxPP:100},abilityProfile:{scalesAP:false,specialDamage:false},types:[],...props});
const pokemons=[mon('ATTACK'),mon('TANK',{tank:true}),mon('TEMP_ATTACK'),mon('TEMP_TANK',{tank:true}),mon('NO_ITEMS',{passiveId:'COMFEY'}),mon('CASTER',{abilityProfile:{scalesAP:true,specialDamage:true}})];
const unit=(pokemon,items=[],y=3)=>({key:'unit:'+pokemon,pokemon,stars:2,x:0,y,items});
const plan={units:[{id:'ATTACK',slot:0,items:[{id:'PUNCHING_GLOVE'}]},{id:'TANK',slot:1,items:[]}],formation:{units:[{slot:0,col:1,row:0},{slot:1,col:2,row:0}]}};
const context={items,pokemons,plan};
const snapshot=board=>({code:'connected',inventory:[],equipped:board.map(u=>({pokemon:u.pokemon,items:u.items})),board});
const offers=ids=>ids.map((item,index)=>({item,index}));

test('três equipamentos fora da build recebem avaliação e portadores próprios, sem usar o banco',()=>{
  const board=[unit('TEMP_ATTACK'),unit('TEMP_TANK'),unit('ATTACK',[],0)],result=rankEquipmentRewards(context,snapshot(board),offers(['ASSAULT_VEST','PROTECTIVE_PADS','SAFETY_GOGGLES']));
  assert.equal(result.length,3);assert(result.every(r=>!r.exact&&r.source==='live'));
  assert.equal(result.find(r=>r.item==='ASSAULT_VEST').recipient.id,'TANK');assert.equal(result.find(r=>r.item==='ASSAULT_VEST').holder.id,'TEMP_TANK');
  assert.equal(result.find(r=>r.item==='PROTECTIVE_PADS').holder.id,'TEMP_ATTACK');assert(result.every(r=>r.holder.temporary));
  const changed=rankEquipmentRewards(context,snapshot([unit('TEMP_TANK',['X','Y','Z']),unit('TEMP_ATTACK')]),offers(['ASSAULT_VEST']));assert.equal(changed[0].holder.id,'TEMP_ATTACK');
});

test('item exato pendente tem prioridade e equipamento já coberto não é pedido outra vez',()=>{
  const board=[unit('TEMP_ATTACK'),unit('TEMP_TANK')],s=snapshot(board),result=rankEquipmentRewards(context,s,offers(['ASSAULT_VEST','PUNCHING_GLOVE']));
  assert.equal(result[0].item,'PUNCHING_GLOVE');assert(result[0].exact);assert.equal(result[0].holder.id,'TEMP_ATTACK');
  s.inventory=['PUNCHING_GLOVE'];const ready=rankEquipmentRewards(context,s,offers(['PUNCHING_GLOVE','ASSAULT_VEST']));assert.equal(ready[0].item,'ASSAULT_VEST');assert(ready.find(r=>r.item==='PUNCHING_GLOVE').covered);
});

test('campo vazio conhecido não usa guia; campo desconhecido usa guia com rótulo condicional',()=>{
  const guide={lineup:[{id:'TEMP_ATTACK',stars:1}]};
  const empty=rankEquipmentRewards({...context,guide},snapshot([]),offers(['PROTECTIVE_PADS']))[0];assert.equal(empty.source,'live');assert.equal(empty.holder,null);
  const fallback=rankEquipmentRewards({...context,guide},{code:'waiting'},offers(['PROTECTIVE_PADS']))[0];assert.equal(fallback.source,'guide');assert.equal(fallback.holder.source,'guide');assert.equal(fallback.holder.id,'TEMP_ATTACK');
});

test('alternativas respeitam slots da build, portadores proibidos, duplicatas e famílias protegidas',()=>{
  const full={...context,plan:{...plan,units:plan.units.map(u=>({...u,items:[{id:'X'},{id:'Y'},{id:'Z'}]}))}};
  assert(rankEquipmentRewards(full,snapshot([]),offers(['ASSAULT_VEST']))[0].noFit);
  const result=rankEquipmentRewards(context,snapshot([unit('NO_ITEMS'),unit('TEMP_TANK',['ASSAULT_VEST']),unit('ATTACK')]),offers(['ASSAULT_VEST']))[0];assert.equal(result.holder,null);
  assert.equal(rankEquipmentRewards(context,snapshot([]),offers(['COMPONENT','CONSUMABLE','WONDER_BOX','UNKNOWN'])).length,0);
  assert(rankEquipmentRewards(context,snapshot([unit('TEMP_ATTACK')]),offers(['REAPER_CLOTH']))[0].noFit);
  const casterContext={...context,plan:{units:[{slot:0,id:'CASTER',items:[]}]}};assert(rankEquipmentRewards(casterContext,snapshot([unit('CASTER')]),offers(['NULLIFY_BANDANNA']))[0].noFit);
});
