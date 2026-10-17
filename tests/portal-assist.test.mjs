import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPortalContext,rankPortalOffers} from '../extension/portal-model.mjs';
import {itemAdviceView} from '../extension/item-view.mjs';
import {handleMessage,initialState,referenceKey} from '../extension/protocol.mjs';
const bundle=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8'));
const {pokemons,rules,synergies,items}=bundle.guide;
const unit=id=>{const p=pokemons.find(p=>p.id===id);return {id,name:p.name,items:[]};};
const portals=[{key:'portal:1',types:['GROUND','GROUND','ROCK']},{key:'portal:2',types:['DRAGON','PSYCHIC','WATER']},{key:'portal:3',types:['NORMAL','BUG','DARK']}];

test('portal Único busca Latios/Latias; etapa lendária busca Zygarde, sem misturar os pools',()=>{
  const context=createPortalContext({units:['LATIOS','LATIAS','ZYGARDE_50'].map(unit)},pokemons,rules);
  const unique=rankPortalOffers(context,portals,10)[0];assert.equal(unique.key,'portal:2');assert.deepEqual(unique.targets.map(t=>t.id),['LATIOS','LATIAS']);
  const legendary=rankPortalOffers(context,portals,20)[0];assert.equal(legendary.key,'portal:1');assert.deepEqual(legendary.targets.map(t=>t.id),['ZYGARDE_50']);
  assert(rankPortalOffers(context,portals,0).every(p=>!p.targets.length));
});
test('portal usa tipos da base obtida e retira alvos prontos, sem considerar emblemas dos itens',()=>{
  const units=[unit('ARCHALUDON')];units[0].items=[{id:'WATER_STONE'}];
  const context=createPortalContext({units},pokemons,rules);assert.deepEqual(context.goals[0].types,pokemons.find(p=>p.id==='DURALUDON').types);assert(!context.goals[0].types.includes('ELECTRIC'));assert(!context.goals[0].types.includes('WATER'));
  const ranks=rankPortalOffers(context,[{key:'portal:1',types:['ELECTRIC']},{key:'portal:2',types:['DRAGON']}],10);assert.equal(ranks[0].key,'portal:2');assert.equal(ranks[1].targets.length,0);
  assert.equal(createPortalContext({units},pokemons,rules,[0]).goals.length,0);
});
test('sem etapa ou alvo correspondente, portal indica apenas afinidade e não promete uma oferta',()=>{
  const plan={units:[unit('LATIOS'),unit('LATIAS')]},snapshot={code:'carousel',inventory:null,equipped:[],portals,stage:null};
  const html=itemAdviceView(plan,items,pokemons,snapshot,{rules,synergies});assert.match(html,/Etapa não identificada/);assert(!html.includes('Favorece opções para'));
  const known=itemAdviceView(plan,items,pokemons,{...snapshot,stage:10},{rules,synergies});assert.match(known,/Latios, Latias/);assert.match(known,/não garantem um Pokémon/);assert.match(known,/Etapa 10 · Únicos/);
  assert(!rankPortalOffers(createPortalContext(plan,pokemons,rules),[{key:'portal:1',types:['FIRE']}],10).length);
});

test('estágio 0 recomenda portal compatível com as bases comuns da comp final',()=>{
  const context=createPortalContext({units:['SLIGOO','SEADRA','LATIOS'].map(unit)},pokemons,rules);
  const ranks=rankPortalOffers(context,[{key:'portal:1',types:['FIRE','FIELD','BUG']},{key:'portal:2',types:['DRAGON','AQUATIC','AMORPHOUS']}],0);
  assert.equal(ranks[0].key,'portal:2');assert.equal(ranks[0].method,'shop');assert(ranks[0].stageKnown);assert(ranks[0].targets.some(g=>g.label.includes('Goomy')));assert(!ranks[0].targets.some(g=>g.id==='LATIOS'));
});

test('tipos do campo apoiam a escolha do portal, sem superar um alvo final compatível',()=>{
  const field=[{id:'WATER',count:2,next:3,active:false}],offers=[{key:'portal:water',types:['WATER']},{key:'portal:dragon',types:['DRAGON']}];
  const support=rankPortalOffers({goals:[],affinity:[]},offers,10,field);assert.equal(support[0].key,'portal:water');assert.deepEqual(support[0].support,[{id:'WATER',count:2,next:3}]);
  const context=createPortalContext({units:[unit('LATIOS')]},pokemons,rules);assert.equal(rankPortalOffers(context,offers,10,field)[0].key,'portal:dragon');
});
test('contexto do endpoint acompanha marcas e fornece só dados estáticos para portais',async()=>{
  const plan={units:[unit('LATIOS'),unit('ZYGARDE_50')]},selection={compId:'one',snapshotId:'snap',variantIndex:0};let obtained=[];
  const env={id:'test',plans:{[referenceKey(selection)]:plan},pokemonCatalog:pokemons,itemCatalog:items,portalRules:rules,synergyCatalog:synergies,storage:{get:async()=>({...initialState(),selection,shopEnabled:true,obtained}),set:()=>assert.fail('Nenhuma gravação')}};
  const sender={id:'test',url:'https://pokemon-auto-chess.com/',frameId:0};
  assert.equal((await handleMessage({type:'PCH_ITEM_PLAN'},sender,env)).context.portal.goals.length,2);obtained=[0];
  const result=await handleMessage({type:'PCH_ITEM_PLAN'},sender,env);assert.deepEqual(result.context.portal.goals.map(g=>g.id),['ZYGARDE_50']);assert(result.context.synergies.length);assert(!('inventory' in result.context));
});
test('todas as 778 equipes usam tipos canônicos da obtenção e ranking de portais é determinístico',()=>{
  const ids=new Set(synergies.map(s=>s.id));
  for(const plan of Object.values(bundle.plans)){
    const context=createPortalContext(plan,pokemons,rules);
    for(const goal of context.goals)assert(goal.types.every(id=>ids.has(id)));
    for(const stage of [0,10,20,null]){const ranks=rankPortalOffers(context,portals,stage);assert.deepEqual(ranks,rankPortalOffers(context,portals,stage));assert(ranks.every(p=>p.targets.every(t=>stage===10?t.method==='unique':stage===20?t.method==='legendary':stage===0?t.method==='shop'&&t.rarity==='COMMON':false)));}
  }
});
