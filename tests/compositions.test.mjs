import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {suggestFormation,teamSynergies,selectedVariant,variantsFor,compositionHref,parseCompositionKey} from '../site/lib/composition-model.mjs';
import {compositionCard,compositionDetail} from '../site/lib/composition-view.mjs';
import {featuredMember,primarySynergies,matchingVariants,filterCompositions} from '../site/lib/composition-filters.mjs';

const pointer=JSON.parse(await readFile(new URL('../site/data/current.json',import.meta.url),'utf8'));
const read=async path=>JSON.parse(await readFile(new URL(`../site/${pointer.base}${path}`,import.meta.url),'utf8'));
const pokemons=await read('catalog/pokemons.json'),items=await read('catalog/items.json'),synergies=await read('catalog/synergies.json'),comps=await read('compositions.json');
const data={pokemons,items,synergies,teamRules:await read('catalog/team-rules.json'),maps:{pokemons:new Map(pokemons.map(p=>[p.id,p])),items:new Map(items.map(i=>[i.id,i])),synergies:new Map(synergies.map(s=>[s.id,s]))}};
const member=(id,items=[])=>({id,items});
const counts=team=>new Map(teamSynergies({members:team},data).map(s=>[s.id,s.count]));
data.manifest={id:pointer.id};

test('filtros distinguem sinergia principal do grupo e sinergia ativa na equipe',()=>{
  const water=filterCompositions(comps,data,{synergy:'WATER'});
  assert(water.length>0);water.forEach(({comp})=>assert(primarySynergies(comp).includes('WATER')));
  assert.deepEqual(primarySynergies({synergies:[{id:'WATER',count:4},{id:'FIRE',count:4},{id:'ICE',count:2}]}),['WATER','FIRE']);
  const active=filterCompositions(comps,data,{synergy:'WATER',synergyScope:'active'});
  assert(active.length>0);active.forEach(({variants})=>variants.forEach(team=>assert(teamSynergies(team,data).some(s=>s.id==='WATER'&&s.active))));
});

test('Pokémon e sinergia precisam corresponder à mesma equipe real; destaque usa a peça mais equipada',()=>{
  const entries=filterCompositions(comps,data,{pokemon:'gyarados'});assert(entries.length>0);
  entries.forEach(({variants})=>variants.forEach(team=>assert(team.members.some(m=>m.id==='GYARADOS'))));
  const focused=filterCompositions(comps,data,{pokemon:'gyarados',pokemonScope:'featured'});assert(focused.length>0);
  focused.forEach(({variants})=>variants.forEach(team=>assert.equal(featuredMember(team).id,'GYARADOS')));
  for(const {comp,variants}of focused){
    const indices=variants.map(v=>v.index),html=compositionDetail(comp,data,indices[0],indices);
    assert.deepEqual([...html.matchAll(/data-select-variant="(\d+)"/g)].map(match=>Number(match[1])),indices);
  }
  assert.equal(featuredMember({members:[member('A',['x']),member('B',['x','y']),member('C',['x','y'])]}).id,'B');
  const comp={synergies:[],members:[],examples:[{members:[member('GYARADOS')]},{members:[member('CHARIZARD')]}]};
  assert.equal(matchingVariants(comp,data,{synergy:'FIRE',synergyScope:'active',pokemon:'gyarados'}).length,0);
  assert.equal(filterCompositions(comps,data,{pokemon:'nenhuma-especie-existente'}).length,0);
});

test('ordenação de filtros preserva dados e índices originais das variações',()=>{
  const before=JSON.stringify(comps);
  for(const [sort,key,direction]of [['count','count',-1],['wins','winRatePercent',-1],['place','meanPlace',1]]){
    const entries=filterCompositions(comps,data,{sort});
    for(let i=1;i<entries.length;i++)assert((entries[i].comp[key]-entries[i-1].comp[key])*direction>=0);
    for(const {comp,variants}of entries)for(const v of variants)assert.deepEqual(v.members,comp.examples[v.index].members);
  }
  assert.equal(JSON.stringify(comps),before);
});

test('as 130 comps e suas equipes válidas renderizam; exemplos vazios não viram opções',()=>{
  let variants=0;
  for(const comp of comps){
    assert(compositionCard(comp,0,data).includes('composition-header'));
    for(const team of variantsFor(comp)){variants++;assert(compositionDetail(comp,data,team.index).includes('pac-battle-board'));assert(team.members.length>0);}
  }
  assert.equal(variants,778);
  assert.equal(selectedVariant({members:[],examples:[{members:[]}]},0),null);
});

test('cada exemplo mantém todos os Pokémon e itens, em casas únicas dentro do campo 8 × 3',()=>{
  let teams=0;
  for(const comp of comps)for(const team of comp.examples){
    const result=suggestFormation(team,data);teams++;
    assert.equal(result.units.length,team.members.length);
    assert.equal(new Set(result.units.map(u=>`${u.row},${u.col}`)).size,team.members.length);
    result.units.forEach((u,index)=>{assert(u.row>=0&&u.row<3&&u.col>=0&&u.col<8);assert.equal(u.id,team.members[index].id);assert.deepEqual(u.items,team.members[index].items);});
  }
  assert(teams>=700);
});

test('formação usa alcance com itens: melee na frente, alcance 2 no meio, alcance 3+ no fundo',()=>{
  const result=suggestFormation({members:[member('RHYDON'),member('VOLCANION'),member('ABRA'),member('RHYDON',['WIDE_LENS'])]},data);
  assert.deepEqual(result.units.map(u=>u.row),[0,1,2,2]);
  assert.equal(result.units[3].range,3);
});

test('evoluções e duplicatas da mesma família não duplicam a sinergia; itens concedem tipos',()=>{
  const c=counts([member('GIBLE',['FIRE_STONE']),member('GABITE',['FIRE_STONE']),member('RHYDON')]);
  assert.equal(c.get('DRAGON'),1);assert.equal(c.get('GROUND'),2);assert.equal(c.get('FIRE'),1);
});

test('Dragão dobra o segundo tipo por família depois de ativar o primeiro patamar',()=>{
  const c=counts([member('GABITE'),member('VIBRAVA'),member('TYRANTRUM')]);
  assert.equal(c.get('DRAGON'),3);assert.equal(c.get('GROUND'),3);assert.equal(c.get('BUG'),2);assert.equal(c.get('ROCK'),2);
});

test('Protean adiciona as sinergias dominantes e pode ativar a duplicação de Dragão',()=>{
  const c=counts([member('GABITE'),member('VIBRAVA'),member('ARCEUS')]);
  assert.equal(c.get('DRAGON'),3);assert.equal(c.get('GROUND'),5);assert.equal(c.get('BUG'),3);
});

test('seleção principal é uma equipe real; links identificam a variação original e o snapshot',()=>{
  const comp=comps[0],before=JSON.stringify(comp),variants=variantsFor(comp),main=selectedVariant(comp,null);
  assert.equal(main.label,'Principal');assert.deepEqual(main.members,comp.examples[main.index].members);
  for(const team of variants){const key=compositionHref(comp,team.index).slice(6),parsed=parseCompositionKey(key);assert.equal(parsed.id,comp.id);assert.equal(parsed.snapshotId,pointer.id);assert.equal(parsed.variant,team.index);assert.deepEqual(selectedVariant(comp,parsed.variant).members,team.members);}
  assert.equal(JSON.stringify(comp),before);assert.equal(parseCompositionKey(`${comp.id}@${pointer.id}`).variant,null);
});
