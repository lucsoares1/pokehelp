import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createOverlayPlan,parseOverlayState,emptyOverlayState,selectionKey,clampOverlayPosition} from '../site/lib/overlay-model.mjs';
import {overlayView} from '../site/lib/overlay-view.mjs';
import {createOverlayGuide} from '../site/lib/overlay-guide.mjs';
import {planLevel} from '../site/lib/leveling-model.mjs';
import {variantsFor} from '../site/lib/composition-model.mjs';
const pointer=JSON.parse(await readFile(new URL('../site/data/current.json',import.meta.url),'utf8'));
const read=async path=>JSON.parse(await readFile(new URL('../site/'+pointer.base+path,import.meta.url),'utf8'));
const [pokemons,items,synergies,comps,teamRules,progression,manifest]=await Promise.all(['catalog/pokemons.json','catalog/items.json','catalog/synergies.json','compositions.json','catalog/team-rules.json','catalog/progression.json','manifest.json'].map(read));
const data={pokemons,items,synergies,teamRules,manifest,maps:{pokemons:new Map(pokemons.map(p=>[p.id,p])),items:new Map(items.map(i=>[i.id,i])),synergies:new Map(synergies.map(s=>[s.id,s]))}};

test('overlay importa cada equipe e variação exata, com todos os itens e posições válidas',()=>{
  for(const comp of comps)for(const team of variantsFor(comp)){
    const plan=createOverlayPlan(comp,data,team.index,progression);
    assert.deepEqual(plan.units.map(p=>({id:p.id,items:p.items.map(i=>i.id)})),team.members);
    assert.equal(plan.selection.variantIndex,team.index);assert.equal(plan.selection.snapshotId,pointer.id);
    const cells=new Set();for(const u of plan.formation.units){assert(u.row>=0&&u.row<3&&u.col>=0&&u.col<8);cells.add(`${u.row},${u.col}`);}assert.equal(cells.size,team.members.length);
    assert(!overlayView(plan,{...emptyOverlayState(),selection:plan.selection}).includes('undefined'));
  }
});
test('referência identifica snapshot e índice original; índice ausente não escolhe outra equipe',()=>{
  const comp=comps[0],v=variantsFor(comp).at(-1),plan=createOverlayPlan(comp,data,v.index);
  assert.equal(selectionKey(plan.selection),`${comp.id}@${pointer.id}~${v.index}`);
  assert.throws(()=>createOverlayPlan(comp,data,999),/não está disponível/);
});
test('duplicatas do mesmo Pokémon são vagas independentes e componentes mantêm quantidades',()=>{
  const comp={id:'test',synergies:[],members:[{id:'GYARADOS',frequency:1}],examples:[{members:[{id:'GYARADOS',items:['SOUL_DEW']},{id:'GYARADOS',items:['SOUL_DEW']}]}]};
  const plan=createOverlayPlan(comp,data,0,progression);
  assert.deepEqual(plan.units.map(p=>p.slot),[0,1]);
  assert.equal(plan.components.find(i=>i.id==='TWISTED_SPOON').count,2);
  assert.equal(plan.components.find(i=>i.id==='MYSTIC_WATER').count,2);
  assert(plan.targets.every(t=>t.base.id==='MAGIKARP'&&t.base.copies===8&&t.method==='special'));
  const rhydon={...comp,examples:[{members:[{id:'RHYDON',items:[]}]}]};
  const target=createOverlayPlan(rhydon,data,0,progression).targets[0];assert.equal(target.method,'shop');assert.equal(target.base.id,'RHYHORN');assert.equal(target.base.copies,3);
});
test('estado local rejeita schema inválido, caminhos e variantes inválidas e normaliza marcas',()=>{
  for(const raw of [null,'{','[]','{"schemaVersion":2}',JSON.stringify({schemaVersion:1,selection:{compId:'1',snapshotId:'../../outside',variantIndex:0}})])assert.deepEqual(parseOverlayState(raw),emptyOverlayState());
  const raw={schemaVersion:1,selection:{compId:'1',snapshotId:pointer.id,variantIndex:2},obtained:[0,0,1,-1,999,'2'],visible:true};
  assert.deepEqual(parseOverlayState(JSON.stringify(raw)).obtained,[0,1]);
  assert.equal(parseOverlayState(JSON.stringify(raw)).selection.variantIndex,2);
});
test('posição continua acessível após mover ou reduzir a janela',()=>{
  assert.deepEqual(clampOverlayPosition({x:2000,y:1000},600,400,1280,720),{x:672,y:312});
  assert.deepEqual(clampOverlayPosition({x:-10,y:-90},600,400,390,844),{x:8,y:8});
});
test('overlay apresenta estado manual e mantém marcação por vaga, sem executar texto',()=>{
  const plan=createOverlayPlan(comps[0],data,variantsFor(comps[0])[0].index,progression);
  plan.title='<script>alert(1)</script>';
  const html=overlayView(plan,{...emptyOverlayState(),selection:plan.selection,obtained:[1]});
  assert(!html.includes('<script>'));assert(html.includes('data-ov-obtained="1" aria-pressed="true"'));
  assert(html.includes('Guia manual'));assert(html.includes('Formação sugerida'));assert(html.includes('O que procurar'));
});

test('campo do overlay associa os equipamentos à mesma vaga da equipe',()=>{
  for(const comp of comps){const v=variantsFor(comp)[0],plan=createOverlayPlan(comp,data,v.index,progression),html=overlayView(plan,emptyOverlayState());
    const board=html.slice(html.indexOf('<div class="ov-board"'),html.indexOf('<p class="ov-field-note"'));
    const buttons=[...board.matchAll(/<button[\s\S]*?<\/button>/g)].map(m=>m[0]);
    for(const p of plan.units){const button=buttons.find(b=>b.includes(`data-ov-obtained="${p.slot}"`));assert(button);assert.equal(button.includes('ov-board-items'),p.items.length>0);for(const i of p.items)assert(button.includes(`src="${i.image}"`),`${p.name}: ${i.name}`);}
  }
});

test('guia compacto usa as mesmas regras e ações do guia completo nos níveis 2 a 9',()=>{
  const comp={id:'guide',synergies:[],members:[{id:'RHYDON',frequency:1}],examples:[{members:[{id:'RHYDON',items:['SOUL_DEW']}]}]};
  const plan=createOverlayPlan(comp,data,0,progression),team=variantsFor(comp)[0];
  for(let level=2;level<=9;level++){
    const state={...emptyOverlayState(),guideLevel:level},compact=createOverlayGuide(plan,data,progression,state),full=planLevel(team,data,progression,{level});
    assert.equal(compact.action,full.action);assert.equal(compact.focus.chance,full.chance);assert.deepEqual(compact.lineup.map(p=>p.id),full.lineup.map(p=>p.id));assert.equal(compact.level,level);assert(compact.lineup.length<=level);
    const html=overlayView(plan,state,{guide:compact});assert(html.includes(`data-ov-level="${level}" aria-pressed="true"`));assert(html.includes(full.title));assert.deepEqual(compact.synergies.map(s=>[s.id,s.count,s.active]),full.synergies.map(s=>[s.id,s.count,s.active]));assert(html.includes('Sinergias do campo neste nível'));
  }
  const ready=createOverlayGuide(plan,data,progression,{...emptyOverlayState(),guideLevel:8,obtained:[0]});assert(ready.focus.done);assert(ready.lineup.some(p=>p.id==='RHYDON'&&p.obtained));assert.match(ready.action,/Pare de gastar/);
  assert.equal(createOverlayGuide(plan,data,null,emptyOverlayState()),null);
});

test('controles do overlay usam SVGs locais, com nomes acessíveis e estado de expansão',()=>{
  const plan=createOverlayPlan(comps[0],data,variantsFor(comps[0])[0].index,progression);
  for(const minimized of [true,false]){
    const html=overlayView(plan,{...emptyOverlayState(),minimized}),header=html.slice(0,html.indexOf('</header>'));
    assert(header.includes('external-link.svg'));assert(header.includes('x.svg'));assert(header.includes(minimized?'chevron-down.svg':'chevron-up.svg'));assert(header.includes('aria-label="Fechar overlay"'));assert(header.includes(`aria-expanded="${!minimized}"`));
    assert(!/[↗⌃⌄×]/.test(header));
  }
});
