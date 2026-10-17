import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {boardAdvice} from '../extension/board-model.mjs';
import {boardAdviceView,boardAlertView} from '../extension/board-view.mjs';
const mon=(id,types=[],range=2,extra={})=>({id,family:id,name:id,image:'assets/'+id+'.png',kind:'pokemon',passiveId:'NONE',types,stats:{hp:60,atk:10,speed:40,def:4,speDef:4,range},...extra});
const pokemons=[mon('TARGET',['DRAGON']),mon('TANK',['WATER'],1),mon('FILLER',['NORMAL']),mon('OTHER',['FIRE']),mon('BRIDGE',['DRAGON']),mon('EGG',[],1,{passiveId:'EGG'})];
const synergies=['DRAGON','WATER','NORMAL','FIRE'].map(id=>({id,name:id,thresholds:[2,4]})),items=[{id:'ARMOR',categories:['craftable']},{id:'DRAGON_ITEM',categories:['craftable']}];
const plan={units:[{slot:0,id:'TARGET',items:[]}]},guide={level:2,lineup:[{id:'TARGET'},{id:'TANK',temporary:true}]};
const options={guide,synergies,items,teamRules:{synergyOrder:synergies.map(s=>s.id),synergyGivenByItem:{DRAGON_ITEM:'DRAGON'}}};
const unit=(pokemon,x,y,stars=1,items=[])=>({key:`unit:${pokemon}-${x}-${y}`,pokemon,x,y,stars,items});
const snap=(board,capacity=2,extra={})=>({code:'connected',board,boardMode:'pick',level:capacity,capacity,teamSize:board.filter(u=>u.y>0&&u.countsForTeam!==false&&!u.items.includes('GOLD_BOW')).length,...extra});
const check=s=>boardAdvice(plan,pokemons,s,options);

test('peça final recém-comprada entra por quem não pertence à meta, usando só o banco real',()=>{
  const filler=unit('FILLER',0,1),tank=unit('TANK',1,3),target=unit('TARGET',2,0),a=check(snap([filler,tank,target]));
  assert.equal(a.code,'suggested');assert.equal(a.suggestion.incoming.key,target.key);assert.equal(a.suggestion.outgoing.key,filler.key);assert.equal(a.suggestion.kind,'swap');
  assert.equal(a.field.length,2);assert.equal(a.bench.length,1);
  const after=check(snap([{...target,x:0,y:1},tank,{...filler,x:2,y:0}]));assert.equal(after.suggestion,null);
});

test('vaga livre sugere entrada sem tirar ninguém; capacidade especial é respeitada',()=>{
  const a=check(snap([unit('FILLER',0,1),unit('TANK',1,3),unit('TARGET',2,0)],5,{level:2}));
  assert.equal(a.suggestion.kind,'add');assert.equal(a.suggestion.outgoing,null);assert.equal(a.capacity,5);assert.equal(a.level,2);
});

test('provisório do guia é considerado e uma cópia repetida não inventa sinergia',()=>{
  const a=boardAdvice(plan,pokemons,snap([unit('FILLER',0,1),unit('TANK',1,3),unit('BRIDGE',2,0)]),{...options,guide:{level:2,lineup:[{id:'BRIDGE',temporary:true},{id:'TANK'}]}});
  assert.equal(a.suggestion.incoming.pokemon,'BRIDGE');assert(a.suggestion.reasons.some(r=>r.includes('Provisório')));
  const duplicate=check(snap([unit('TARGET',0,1),unit('TANK',1,3),unit('TARGET',2,0)]));assert.equal(duplicate.suggestion,null);
  const stronger=check(snap([unit('TARGET',0,1),unit('TANK',1,3),unit('TARGET',2,0,2)]));assert(stronger.suggestion.sameFamily);assert.equal(stronger.suggestion.outgoing.pokemon,'TARGET');
});

test('não tira portador equipado nem troca peça muito evoluída por base sem ganho suficiente',()=>{
  const equipped=check(snap([unit('FILLER',0,1,1,['ARMOR']),unit('TANK',1,3,1,['ARMOR']),unit('TARGET',2,0)]));assert.equal(equipped.suggestion,null);assert(equipped.protectedItems);
  const evolved=check(snap([unit('FILLER',0,1,3),unit('TANK',1,3,3),unit('TARGET',2,0)]));assert.equal(evolved.suggestion,null);assert(evolved.protectedStars);
});

test('ganhos/perdas usam tipos dos itens e contam famílias só uma vez',()=>{
  const a=boardAdvice(plan,pokemons,snap([unit('FILLER',0,1),unit('TANK',1,3,1,['DRAGON_ITEM']),unit('TARGET',2,0)]),options);
  assert.equal(a.suggestion.outgoing.pokemon,'FILLER');assert.deepEqual(a.suggestion.gains.map(g=>[g.id,g.to]),[['DRAGON',2],['WATER',2]]);
});

test('compra, venda, fase e leitura alheia não geram presença ou trocas fictícias',()=>{
  const board=[unit('FILLER',0,1),unit('TANK',1,3)];assert.equal(check(snap(board)).suggestion,null);
  for(const code of ['off','waiting','scouting','unsupported'])assert.equal(check({...snap(board),code}).suggestion,null);
  assert.equal(check({...snap(board),board:null}).code,'waiting');
  assert.equal(check(snap(board,2,{teamSize:0})).code,'updating');
  assert.equal(check(snap(board,2,{capacity:null})).code,'waiting-capacity');
  assert.equal(check(snap([...board,unit('TARGET',2,0)],2,{boardMode:'town'})).suggestion,null);
  const fighting=check(snap([...board,unit('TARGET',2,0)],2,{boardMode:'battle'}));assert(fighting.suggestion.nextPhase);
  const moving=check(snap([...board,unit('TARGET',0,1)]));assert.equal(moving.code,'updating');
});

test('ovo não é candidato; unidade com Gold Bow pode entrar sem gastar vaga',()=>{
  const field=[unit('FILLER',0,1),unit('TANK',1,3)];assert.equal(check(snap([...field,unit('EGG',2,0)])).suggestion,null);
  const a=check(snap([...field,unit('TARGET',2,0,1,['GOLD_BOW'])]));assert.equal(a.suggestion.kind,'add');
});

test('view mostra banco/campo, próxima preparação e banner compacto, escapando nomes',()=>{
  const data=pokemons.map(p=>p.id==='TARGET'?{...p,name:'<img onerror=x>'}:p),a=boardAdvice(plan,data,snap([unit('FILLER',0,1),unit('TANK',1,3),unit('TARGET',2,0)],2,{boardMode:'battle'}),options),html=boardAdviceView(a,synergies);
  assert.match(html,/Entra na próxima preparação/);assert.match(html,/Sai para o banco/);assert.match(html,/Banco 3/);assert.match(html,/data-board-roster/);assert.match(html,/&lt;img onerror=x&gt;/);assert(!html.includes('<img onerror=x>'));
  assert.match(boardAlertView(a),/Ver troca/);assert.match(boardAlertView(a),/Próxima preparação/);
});

test('reforço fora da comp substitui uma peça final quando melhora o campo real',()=>{
  const target=unit('TARGET',0,1),tank=unit('TANK',1,3),strong=unit('OTHER',2,0,2),a=check(snap([target,tank,strong]));
  assert.equal(a.liveSuggestion.incoming.key,strong.key);assert.equal(a.liveSuggestion.outgoing.key,target.key);assert(a.liveSuggestion.planTradeoff);assert.equal(a.suggestion.source,'live');
  const after=check(snap([{...target,x:2,y:0},tank,{...strong,x:0,y:1}]));assert.equal(after.liveSuggestion,null);
  assert.match(boardAdviceView(a),/Reforço provisório para agora/);assert.match(boardAlertView(a),/Melhor agora/);
});

test('melhor agora e caminho da comp são duas opções distintas, sem perder o guia',()=>{
  const a=check(snap([unit('FILLER',0,1),unit('TANK',1,3),unit('TARGET',2,0),unit('OTHER',3,0,2)]));
  assert.equal(a.liveSuggestion.incoming.pokemon,'OTHER');assert.equal(a.planSuggestion.incoming.pokemon,'TARGET');assert.equal(a.suggestion,a.liveSuggestion);
  const html=boardAdviceView(a);assert.match(html,/data-board-suggestion="live"/);assert.match(html,/data-board-plan/);assert.match(html,/data-board-suggestion="plan"/);assert.match(html,/não confirma um ganho imediato/);
  assert.match(boardAlertView(a),/Entra OTHER/);
});

test('avaliação imediata independe da comp e do guia, inclusive sem plano selecionado',()=>{
  const snapshot=snap([unit('FILLER',0,1),unit('TANK',1,3),unit('OTHER',2,0,2)]);
  const a=check(snapshot),b=boardAdvice({units:[{id:'OTHER'}]},pokemons,snapshot,{...options,guide:{level:9,lineup:[{id:'FILLER'}]}}),c=boardAdvice(null,pokemons,snapshot,{...options,guide:null});
  for(const actual of [b,c]){
    assert.equal(actual.liveSuggestion.incoming.key,a.liveSuggestion.incoming.key);assert.equal(actual.liveSuggestion.outgoing.key,a.liveSuggestion.outgoing.key);assert.equal(actual.liveSuggestion.delta,a.liveSuggestion.delta);assert.deepEqual(actual.liveSuggestion.gains,a.liveSuggestion.gains);
  }
  assert.equal(c.planSuggestion,null);
});

test('guia continua disponível sem inventar que uma troca estática é mais forte agora',()=>{
  const a=check(snap([unit('FILLER',0,1),unit('TANK',1,3),unit('TARGET',2,0)]));
  assert.equal(a.liveSuggestion,null);assert.equal(a.planSuggestion.incoming.pokemon,'TARGET');assert.equal(a.suggestion.source,'plan');
  assert.match(boardAlertView(a),/Caminho da comp/);assert(!boardAlertView(a).includes('Melhor agora'));
});

test('quando as duas avaliações concordam a troca aparece uma só vez',()=>{
  const a=check(snap([unit('FILLER',0,1),unit('TANK',1,3),unit('TARGET',2,0,2)])),html=boardAdviceView(a);
  assert(a.liveSuggestion&&a.planSuggestion);assert.equal(a.liveSuggestion.incoming.key,a.planSuggestion.incoming.key);assert.match(html,/também segue a comp/);assert.equal((html.match(/data-board-suggestion=/g)??[]).length,1);assert(!html.includes('data-board-plan'));
});

test('sinergia ativa do campo pode indicar uma peça que não está na comp nem no guia',()=>{
  const all=[...pokemons,mon('FIRE_HELPER',['FIRE'])],a=boardAdvice(plan,all,snap([unit('OTHER',0,1),unit('FILLER',1,1),unit('FIRE_HELPER',2,0)]),options);
  assert.equal(a.liveSuggestion.incoming.pokemon,'FIRE_HELPER');assert.equal(a.liveSuggestion.outgoing.pokemon,'FILLER');assert.deepEqual(a.liveSuggestion.gains.map(g=>g.id),['FIRE']);assert.equal(a.planSuggestion,null);
  const duplicate=boardAdvice(plan,all.map(p=>p.id==='FIRE_HELPER'?{...p,family:'OTHER'}:p),snap([unit('OTHER',0,1),unit('FILLER',1,1),unit('FIRE_HELPER',2,0)]),options);assert.equal(duplicate.liveSuggestion,null);
});

test('atributos reais distinguem peças com as mesmas estrelas sem premiar melee fraco',()=>{
  const all=[...pokemons,mon('STRONG',[],2,{stats:{hp:400,atk:40,speed:80,def:15,speDef:15,range:2}}),mon('WEAK',[],1,{stats:{hp:20,atk:1,speed:20,def:1,speDef:1,range:1}})];
  const a=boardAdvice(plan,all,snap([unit('TARGET',0,1),unit('TANK',1,3),unit('STRONG',2,0)]),options);assert.equal(a.liveSuggestion.incoming.pokemon,'STRONG');assert(a.liveSuggestion.reasons.some(r=>r.includes('Atributos')));
  const weak=boardAdvice(plan,all,snap([unit('TARGET',0,1),unit('FILLER',1,1),unit('WEAK',2,0)]),options);assert.equal(weak.liveSuggestion,null);
  const neutral=boardAdvice(plan,all,snap([unit('TARGET',0,1),unit('TANK',1,3),unit('FILLER',2,0)]),options);assert.equal(neutral.liveSuggestion,null);
});

test('catálogo real e pacote indicam Raticate no lugar de Magikarp sem depender da comp',async()=>{
  const b=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8')),{boardAdvice:packaged}=await import('../extension/dist/board-model.mjs');
  const actualPlan={units:[{id:'CHARMANDER'}]},snapshot=snap([unit('MAGIKARP',0,1),unit('CHARMANDER',1,3),unit('RATICATE',2,0,2)]),config={items:b.guide.items,synergies:b.guide.synergies,teamRules:b.guide.teamRules};
  const a=boardAdvice(actualPlan,b.guide.pokemons,snapshot,config);assert.equal(a.liveSuggestion.incoming.pokemon,'RATICATE');assert.equal(a.liveSuggestion.outgoing.pokemon,'MAGIKARP');assert.equal(a.planSuggestion,null);assert.deepEqual(packaged(actualPlan,b.guide.pokemons,snapshot,config),a);
});
