import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPokemonRewards} from '../extension/choice-model.mjs';
const pokemon=(id,types,family=id)=>({id,name:id,kind:'pokemon',family,types});
const context={plan:{units:[{id:'TARGET',slot:0}]},pokemons:[pokemon('A',['WATER']),pokemon('B',['WATER']),pokemon('C',['WATER']),pokemon('EVOLVED_A',['WATER'],'A'),pokemon('TARGET',['WATER','PSYCHIC']),pokemon('FIRE',['FIRE'])],synergies:[{id:'WATER',thresholds:[3,6]},{id:'PSYCHIC',thresholds:[2,4]},{id:'FIRE',thresholds:[2,4]}],teamRules:{synergyOrder:['WATER','PSYCHIC','FIRE'],synergyGivenByItem:{}}};
const unit=(pokemon,y=1)=>({pokemon,y,items:[]});

test('Únicos consideram o campo atual e o patamar ativado se a oferta entrar',()=>{
  const snapshot={code:'connected',board:[unit('A'),unit('B')]};
  const ranks=rankPokemonRewards(context,snapshot,[{pokemon:'FIRE'},{pokemon:'C'}]);
  assert.equal(ranks[0].pokemon,'C');assert.equal(ranks[0].source,'live');assert.deepEqual(ranks[0].gains,[{id:'WATER',from:2,to:3}]);
  const changed=rankPokemonRewards(context,{code:'connected',board:[unit('FIRE')]},[{pokemon:'C'},{pokemon:'FIRE'}]);assert.equal(changed.find(p=>p.pokemon==='C').gains.length,0);
});

test('banco e duplicatas da mesma família não inventam sinergia; alvo final pendente tem prioridade',()=>{
  const snapshot={code:'connected',board:[unit('A'),unit('B'),unit('C',0)]};
  const duplicates=rankPokemonRewards(context,snapshot,[{pokemon:'EVOLVED_A'},{pokemon:'C'}]);assert.equal(duplicates[0].pokemon,'C');assert.equal(duplicates.find(p=>p.pokemon==='EVOLVED_A').gains.length,0);
  const final=rankPokemonRewards(context,snapshot,[{pokemon:'C'},{pokemon:'TARGET'}]);assert.equal(final[0].pokemon,'TARGET');assert(final[0].wanted);
  const ready=rankPokemonRewards({...context,obtained:[0]},snapshot,[{pokemon:'TARGET'}]);assert.equal(ready[0].wanted,false);
});

test('fallback do guia é identificado; campo vazio conhecido não vira guia e tipos sem ID não prometem ativação',()=>{
  const config={...context,guide:{lineup:[{id:'A'},{id:'B'}]}};
  assert.equal(rankPokemonRewards(config,{code:'waiting'},[{pokemon:'C'}])[0].source,'guide');
  const empty=rankPokemonRewards(config,{code:'connected',board:[]},[{pokemon:'C'}])[0];assert.equal(empty.source,'live');assert.equal(empty.gains.length,0);
  const types=rankPokemonRewards(context,{code:'connected',board:[unit('A'),unit('B')]},[{types:['WATER']}])[0];assert.equal(types.gains.length,0);assert(types.fit>0);
});
