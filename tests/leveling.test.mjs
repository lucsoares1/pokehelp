import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planLevel,rarityChance,xpCost} from '../site/lib/leveling-model.mjs';
import {levelingGuide} from '../site/lib/leveling-view.mjs';
import {staticModule,pokemonClassData} from '../tools/lib/static-typescript.mjs';
import {normalizeProgression,validateProgression} from '../tools/lib/progression.mjs';
import {variantsFor} from '../site/lib/composition-model.mjs';
import {teamSynergies} from '../site/lib/composition-model.mjs';
import {bestShopLevels,lineupChanges} from '../site/lib/progression-planner.mjs';
import {progressionChangesView} from '../site/lib/progression-change-view.mjs';
const pointer=JSON.parse(await readFile(new URL('../site/data/current.json',import.meta.url),'utf8'));
const read=async path=>JSON.parse(await readFile(new URL('../site/'+pointer.base+path,import.meta.url),'utf8'));
const [rules,pokemons,items,synergies,comps,teamRules]=await Promise.all(['catalog/progression.json','catalog/pokemons.json','catalog/items.json','catalog/synergies.json','compositions.json','catalog/team-rules.json'].map(read));
const data={pokemons,items,synergies,teamRules,maps:{pokemons:new Map(pokemons.map(p=>[p.id,p])),items:new Map(items.map(i=>[i.id,i])),synergies:new Map(synergies.map(s=>[s.id,s]))}};
const team={members:[{id:'RHYDON',items:['MUSCLE_BAND']},{id:'GRAVELER',items:[]},{id:'LANDORUS',items:[]}]};

test('progressão importa as chances e a economia padrão da revisão publicada',()=>{
  assert.equal(validateProgression(rules,{pokemons}),true);
  assert.deepEqual(rules.shop.rates[5],[.36,.42,.2,.02,0]);assert.equal(rarityChance(rules,'ULTRA',7),.01);assert.equal(rarityChance(rules,'ULTRA',9),.1);
  assert.equal(rarityChance(rules,'LEGENDARY',9),null);assert.equal(rules.shop.size,6);assert.equal(rules.economy.rerollGold,1);assert.equal(rules.economy.baseInterestCap,5);
  assert.equal(rules.experience.purchaseXp,4);assert.equal(rules.experience.purchaseGold,4);assert.equal(rules.experience.passiveXp,2);assert.deepEqual(rules.events.portals,[0,10,20]);
});
test('evoluções têm receita própria; Rhydon usa Rhyhorn Ultra, Gyarados exige oito Magikarp',()=>{
  assert.equal(rules.acquisition.RHYDON.baseId,'RHYHORN');assert.equal(rules.acquisition.RHYDON.rarity,'ULTRA');assert.equal(rules.acquisition.RHYDON.copies,3);
  assert.equal(rules.acquisition.GRAVELER.baseId,'GEODUDE');assert.equal(rules.acquisition.GRAVELER.rarity,'COMMON');
  assert.equal(rules.acquisition.GYARADOS.copies,8);assert.equal(rules.acquisition.GYARADOS.method,'special');
  assert.equal(rules.acquisition.PRIMAL_GROUDON.method,'legendary');assert.equal(rules.acquisition.PRIMAL_GROUDON.copies,null);assert(rules.acquisition.PRIMAL_GROUDON.steps.some(s=>s.items.includes('RED_ORB')));
  assert.equal(rules.acquisition.ZYGARDE_50.baseId,'ZYGARDE_50');assert.equal(rules.acquisition.ZYGARDE_50.method,'legendary');
});
test('começo respeita raridades; fim é a meta exata com receitas pendentes explícitas',()=>{
  const p2=planLevel(team,data,rules,{level:2});assert.equal(p2.chance,0);assert(!p2.lineup.some(p=>p.id==='RHYHORN'||p.id==='LANDORUS'));assert(p2.action.includes('0%'));
  assert(!planLevel(team,data,rules,{level:7}).lineup.some(p=>p.id==='RHYHORN'));
  assert(planLevel(team,data,rules,{level:8}).lineup.some(p=>p.id==='RHYHORN'));
  const p9=planLevel(team,data,rules,{level:9});assert.deepEqual(p9.lineup.map(m=>({id:m.id,items:m.items})),team.members);
  assert(p9.finalGoal);assert(p9.lineup.every(m=>!m.obtained));assert.match(p9.lineup.find(m=>m.id==='RHYDON').condition,/3 Rhyhorn/);assert.match(p9.lineup.find(m=>m.id==='LANDORUS').condition,/etapa 20/);assert(p9.action.includes('não compre mais XP'));
});
test('peças marcadas prontas entram no exemplo e o plano para de buscar cópias do alvo',()=>{
  const plan=planLevel(team,data,rules,{level:4,obtained:[0,2]});assert(plan.lineup.some(p=>p.id==='RHYDON'));assert(plan.lineup.some(p=>p.id==='LANDORUS'));assert(plan.focusDone);assert(plan.action.includes('Pare de gastar'));
});
test('custo de XP usa compras inteiras e XP atual, respeitando nível máximo',()=>{
  assert.deepEqual(xpCost(rules,5,0),{xp:22,clicks:6,gold:24,max:false});assert.deepEqual(xpCost(rules,5,20),{xp:2,clicks:1,gold:4,max:false});assert.equal(xpCost(rules,9).max,true);assert.equal(xpCost(rules,9).gold,0);assert.equal(xpCost(rules,2,-5).xp,2);
});
test('guias de todos os grupos respeitam vagas, linhagens e contagem oficial de sinergias',()=>{
  for(const comp of comps){const example=variantsFor(comp)[0];if(!example)continue;
    for(let level=2;level<=9;level++){
      const p=planLevel(example,data,rules,{level});assert(p.lineup.length<=level);
      assert.deepEqual(p.synergies,teamSynergies({members:p.lineup},data));
      for(const unit of p.lineup){const pokemon=data.maps.pokemons.get(unit.id);assert(pokemon);
        if(unit.temporary){assert.equal(pokemon.stars,1);assert(!pokemon.regional&&!pokemon.additional);assert(rarityChance(rules,pokemon.rarity,level)>0);assert(pokemon.types.some(type=>p.finalSynergies.some(s=>s.id===type)));}
        else {const t=p.targets[unit.index];assert(t.route.path.includes(unit.id)||unit.id===t.target.id);if(pokemon.regional||pokemon.additional||t.route.method!=='shop')assert(unit.conditional);if(level<9)assert.equal(t.route.method,'shop');}
        if(level<9)assert.equal(unit.items.length,0);
      }
    }
    for(const variant of variantsFor(comp))assert(levelingGuide(variant,data,rules).includes('Como este guia foi montado'));
  }
});

test('todas as 778 variações convergem para a equipe exata; capacidade extra fica explícita',()=>{
  for(const comp of comps)for(const variant of variantsFor(comp)){
    const p=planLevel(variant,data,rules,{level:9});
    assert.equal(planLevel(variant,data,rules,{level:2}).lineup.length,2);
    const all=[...p.lineup,...p.bench].sort((a,b)=>a.index-b.index);
    assert.deepEqual(all.map(m=>({id:m.id,items:m.items})),variant.members);
    assert(!all.some(m=>m.temporary));assert.equal(p.freeSlots,Math.max(0,9-variant.members.length));
  }
});

test('cada nível de montagem preenche todas as vagas nas 778 variações e explica toda saída',()=>{
  for(const comp of comps)for(const variant of variantsFor(comp)){
    let previous=[];
    for(let level=2;level<=9;level++){
      const p=planLevel(variant,data,rules,{level});
      if(level<9){assert.equal(p.lineup.length,level,`${comp.id}~${variant.index}, nível ${level}`);assert.equal(p.freeSlots,0);}
      const ids=previous.map(m=>m.id);
      for(const out of [...p.changes.replacements.map(r=>r.from),...p.changes.removals]){const index=ids.indexOf(out.id);assert(index>=0);ids.splice(index,1);}
      ids.push(...p.changes.replacements.map(r=>r.to.id),...p.changes.additions.map(m=>m.id));
      assert.deepEqual(ids.sort(),p.lineup.map(m=>m.id).sort());
      assert.equal(p.transitions.length,p.changes.replacements.length+p.changes.removals.length);
      assert(!p.transitions.some(t=>t.startsWith('Entrar:')));
      if(!p.changes.replacements.length&&!p.changes.removals.length)assert.equal(progressionChangesView(p.changes),'');
      previous=p.lineup;
    }
  }
});

test('regressão Dragão/Solosis: nível 5 adiciona a quinta peça e mantém o campo anterior',()=>{
  const variant=comps.find(c=>c.id==='6').examples[0];
  const four=planLevel(variant,data,rules,{level:4,focusId:'DUOSION'}),five=planLevel(variant,data,rules,{level:5,focusId:'DUOSION'});
  assert.equal(four.lineup.length,4);assert.equal(five.lineup.length,5);
  assert(four.lineup.every(m=>five.lineup.some(n=>n.id===m.id)));assert.equal(five.changes.replacements.length,0);assert.equal(five.changes.additions.length,1);
});

test('trocas pareiam evolução primeiro, incluem saídas da comp e não exibem adições isoladas',()=>{
  const previous=[{id:'HORSEA',index:0},{id:'MAGIKARP',index:1},{id:'CHARMANDER',index:null,temporary:true}],next=[{id:'DRATINI',index:null,temporary:true},{id:'SEADRA',index:0},{id:'DEINO',index:null,temporary:true},{id:'GOOMY',index:3}];
  const changes=lineupChanges(previous,next,data);
  assert.deepEqual(changes.replacements.map(p=>[p.from.id,p.to.id,p.kind]),[['HORSEA','SEADRA','evolution'],['MAGIKARP','DRATINI','replacement'],['CHARMANDER','DEINO','replacement']]);
  assert.deepEqual(changes.additions.map(m=>m.id),['GOOMY']);
  for(const compact of [true,false]){const html=progressionChangesView(changes,{compact});assert(html.includes('Sai')&&html.includes('Entra'));assert(html.includes('data-change-from="CHARMANDER" data-change-to="DEINO"'));assert(!html.includes('Goomy'));}
});

test('cópias repetidas são consumidas uma vez e mudança de rótulo não inventa uma troca',()=>{
  const changes=lineupChanges([{id:'GYARADOS',index:0},{id:'GYARADOS',index:1},{id:'GEODUDE',index:null,temporary:true}],[{id:'GYARADOS',index:0},{id:'RHYDON',index:2},{id:'GEODUDE',index:3}],data);
  assert.deepEqual(changes.replacements.map(r=>[r.from.id,r.to.id]),[['GYARADOS','RHYDON']]);assert.equal(changes.additions.length,0);assert.equal(changes.removals.length,0);
});

test('regressão da imagem: Dudunsparce e Mudsdale aparecem no fim, Gible não vira Garchomp',()=>{
  const ids=['DUDUNSPARCE','DIGGERSBY','ZYGARDE_50','GIBLE','VIBRAVA','GROTLE','FURRET','MUDSDALE'];
  const variant=comps.flatMap(c=>c.examples).find(t=>t.members.length===8&&ids.every(id=>t.members.some(m=>m.id===id)));assert(variant);
  const initial=JSON.stringify(variant),p9=planLevel(variant,data,rules,{level:9});assert.deepEqual(p9.lineup.map(m=>m.id),variant.members.map(m=>m.id));assert.equal(p9.freeSlots,1);
  assert.match(p9.lineup.find(m=>m.id==='DUDUNSPARCE').condition,/acúmulos/);assert.match(p9.lineup.find(m=>m.id==='DIGGERSBY').condition,/seleção adicional/);
  assert(p9.transitions.some(s=>s.includes('→ Mudsdale')));
  const eight=planLevel(variant,data,rules,{level:8});assert(eight.lineup.some(m=>m.targetId==='MUDSDALE')||eight.reserves.some(m=>m.base==='Mudbray'&&m.target==='Mudsdale'));
  for(let level=2;level<=9;level++){const p=planLevel(variant,data,rules,{level});assert(!p.lineup.some(m=>['GABITE','GARCHOMP'].includes(m.id)));if(level>=4)assert(p.lineup.filter(m=>!m.temporary).length>=Math.min(level,4));}
  assert.equal(JSON.stringify(variant),initial);
});

test('Latios/Latias são Únicos, não Ultras; nível 6 sozinho não confirma obtenção',()=>{
  const variant=comps.find(c=>c.id==='6').examples[0],six=planLevel(variant,data,rules,{level:6});
  for(const id of ['LATIOS','LATIAS']){assert.equal(data.maps.pokemons.get(id).rarity,'UNIQUE');assert.equal(rarityChance(rules,'UNIQUE',6),null);assert(!six.lineup.some(m=>m.id===id));assert(six.pendingSpecial.some(m=>m.id===id&&m.eventStage===10));}
  const indices=variant.members.flatMap((m,i)=>['LATIOS','LATIAS'].includes(m.id)?[i]:[]),ready=planLevel(variant,data,rules,{level:6,obtained:indices});
  assert(ready.lineup.some(m=>m.id==='LATIOS'&&m.obtained));assert(ready.lineup.some(m=>m.id==='LATIAS'&&m.obtained));
  assert.equal(rarityChance(rules,'ULTRA',6),0);
});

test('todas as obtenções especiais exigem posse nas bases; referência final continua condicional',()=>{
  for(const comp of comps)for(const variant of variantsFor(comp))for(let level=2;level<=8;level++){
    const plan=planLevel(variant,data,rules,{level});
    for(const m of plan.lineup)assert.equal(rules.acquisition[m.id]?.method,'shop',`${comp.id}~${variant.index}: ${m.id} no ${level}`);
  }
});

test('evolução tem Evoluir e receita, sem Sai/Entra; substituições têm as faixas sem seta textual',()=>{
  const changes=lineupChanges([{id:'GOOMY',index:0}],[{id:'SLIGOO',index:0}],data),html=progressionChangesView(changes,{compact:true});
  assert(html.includes('Evoluir'));assert(html.includes('após completar a receita'));assert(!html.includes('>Sai<')&&!html.includes('>Entra<'));assert(!html.includes('→'));assert(html.includes('chevrons-right.svg'));
  const swap=progressionChangesView(lineupChanges([{id:'POLIWAG',index:null,temporary:true}],[{id:'CHARMANDER',index:null,temporary:true}],data));
  assert(swap.includes('is-out')&&swap.includes('is-in'));assert(swap.includes('>Sai<')&&swap.includes('>Entra<'));assert(!swap.includes('→'));
});

test('Água usa 3/6/9; nível 5 não finge ter 6, nível 6 fecha o patamar com famílias disponíveis',()=>{
  const water={members:['BLASTOISE','SEAKING','KINGDRA','LANTURN','FERALIGATR','POLIWRATH'].map(id=>({id,items:[]}))};
  assert.deepEqual(data.maps.synergies.get('WATER').thresholds,[3,6,9]);
  const p5=planLevel(water,data,rules,{level:5}),p6=planLevel(water,data,rules,{level:6});
  const s5=p5.synergies.find(s=>s.id==='WATER');assert(s5.active&&s5.count<=5);assert.equal(s5.tier,1);assert.equal(s5.next,6);
  assert(p5.synergies.some(s=>s.id==='AQUATIC'&&s.active));assert.equal(p5.synergyGoal.next,6);
  const s6=p6.synergies.find(s=>s.id==='WATER');assert(s6.count>=6);assert.equal(s6.tier,2);
  assert(p6.lineup.filter(m=>!m.temporary).length>=5);
});

test('picos da loja são calculados e raros continuam eficientes no 8/9',()=>{
  assert.deepEqual(bestShopLevels(rules,'RARE'),{chance:.35,levels:[7,8,9]});assert.deepEqual(bestShopLevels(rules,'UNCOMMON'),{chance:.42,levels:[5]});
  const p=planLevel({members:[{id:'VIBRAVA',items:[]}]},data,rules,{level:8});assert(!p.action.includes('já passou'));assert.match(p.action,/35%/);
});
test('guia declara limitação de capacidade quando o exemplo tem dez unidades',()=>{
  const example=comps.flatMap(c=>c.examples).find(t=>t.members.length===10);assert(example);
  assert(levelingGuide(example,data,rules,{level:9}).includes('excede o limite padrão de 9'));
  assert(levelingGuide(example,data,null).includes('relatório antigo'));
});
test('AST lê Object.freeze como dados e não executa callbacks de evoluções',()=>{
  assert.equal(staticModule('const table=Object.freeze({1:4})').get('table')[1],4);
  assert.throws(()=>staticModule('const table=Object.freeze(danger())').get('table'),/não permitida/);
  const classes=pokemonClassData('class Base { evolutionRule={type:EvolutionRuleType.COUNT,numberRequired:3,divergentEvolution:()=>danger()} } const PokemonClasses={A:Base}',{EvolutionRuleType:{COUNT:'count'}});
  assert.deepEqual(classes.A.evolutionRule,{type:'count',conditional:true,numberRequired:3});
});
test('novo patch e tabelas inválidas exigem revisão em vez de publicar planos silenciosamente',()=>{
  assert.throws(()=>normalizeProgression({}, {gameVersion:'6.12.0'},{}),/Revisar/);
  const bad=structuredClone(rules);bad.shop.rates[5][0]=2;assert.throws(()=>validateProgression(bad,{pokemons}),/Chances inválidas/);
});
