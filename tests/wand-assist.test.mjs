import test from 'node:test';
import assert from 'node:assert/strict';
import {rankWandRewards} from '../extension/choice-model.mjs';
const ids=['LONG_WAND','SPIRIT_WAND','HP_SWAP_WAND'];
const items=[...ids.map(id=>({id,stats:{}})),{id:'GEM',stats:{}},{id:'NULLIFY_BANDANNA',stats:{}},{id:'PROTECTIVE_PADS',stats:{}}];
const pokemon=(id,range,maxPP,hp=100)=>({id,name:id,kind:'pokemon',types:['FAIRY'],abilityId:'TEST',stats:{range,maxPP,hp,atk:25,speed:50,def:5,speDef:5},abilityProfile:{specialDamage:true}});
const pokemons=[pokemon('RANGED',4,200),pokemon('CASTER',2,20),pokemon('TANK',1,200,400),{...pokemon('OTHER',4,200),types:['WATER']}];
const context=id=>({items,pokemons,plan:{units:[{id,items:[]}]},synergyGivenByItem:{GEM:'FAIRY'}});
const offers=ids.map(item=>({item})),unit=(pokemon,y=1,items=[])=>({pokemon,y,items});
test('as três varinhas do screenshot mudam de prioridade conforme alcance, PP e resistência das Fadas',()=>{
  for(const [id,expected] of [['RANGED','LONG_WAND'],['CASTER','SPIRIT_WAND'],['TANK','HP_SWAP_WAND']]){
    const ranks=rankWandRewards(context(id),{code:'connected',board:[unit(id)]},offers);
    assert.equal(ranks[0].item,expected);assert.equal(ranks.filter(r=>r.primary).length,1);assert.equal(ranks[0].source,'plan+live');assert.equal(ranks[0].activeNow,true);assert(ranks[0].reason.length>0);
  }
});
test('banco não concede benefício ativo; plano final e guia são identificados sem inventar presença',()=>{
  const empty=rankWandRewards(context('CASTER'),{code:'connected',board:[unit('CASTER',0)]},offers)[0];assert.equal(empty.item,'SPIRIT_WAND');assert.equal(empty.source,'plan');assert.equal(empty.activeNow,false);
  const guide=rankWandRewards({...context('OTHER'),guide:{lineup:[{id:'TANK'}]}},{code:'waiting'},offers)[0];assert.equal(guide.source,'guide');assert.equal(guide.activeNow,null);
  const knownEmpty=rankWandRewards({...context('OTHER'),guide:{lineup:[{id:'TANK'}]}},{code:'connected',board:[]},offers);assert(knownEmpty.every(r=>!r.primary&&r.source==='none'));
});
test('itens que dão Fada e impedem habilidade alteram a avaliação; instâncias não colocáveis ficam fora',()=>{
  const gem=rankWandRewards(context('OTHER'),{code:'connected',board:[unit('OTHER',1,['GEM'])]},offers)[0];assert.equal(gem.source,'live');assert.equal(gem.item,'LONG_WAND');
  const muted={...context('CASTER'),plan:{units:[{id:'CASTER',items:[{id:'NULLIFY_BANDANNA'}]}]}};
  assert.notEqual(rankWandRewards(muted,{code:'connected',board:[unit('CASTER',1,['NULLIFY_BANDANNA'])]},offers)[0].item,'SPIRIT_WAND');
  const illegal=rankWandRewards(context('OTHER'),{code:'connected',board:[{...unit('TANK'),canPlace:false}]},offers);assert(illegal.every(r=>!r.primary));
});
test('somente varinhas conhecidas entram; empate e cópias têm uma única recomendação e recuo é explícito',()=>{
  assert.deepEqual(rankWandRewards(context('CASTER'),{code:'waiting'},[{item:'UNKNOWN_WAND'},{item:'GEM'}]),[]);
  const dup=rankWandRewards(context('RANGED'),{code:'waiting'},[{item:'LONG_WAND'},{item:'LONG_WAND'}]);assert.equal(dup.filter(r=>r.primary).length,1);
  const two={...context('RANGED'),items:[...items,{id:'TWO_EDGED_WAND',stats:{}}]};const rank=rankWandRewards(two,{code:'waiting'},[{item:'TWO_EDGED_WAND'}])[0];assert.match(rank.reason,/risco.*recuo/);
});
