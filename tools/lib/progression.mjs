import ts from 'typescript';
import {staticModule} from './static-typescript.mjs';

function section(source,name){
  const ast=ts.createSourceFile('mechanics.ts',source,ts.ScriptTarget.Latest,true),found=[];
  function visit(node){if((ts.isMethodDeclaration(node)||ts.isFunctionDeclaration(node)||ts.isClassDeclaration(node))&&node.name?.getText(ast)===name)found.push(node.getText(ast));ts.forEachChild(node,visit);}
  visit(ast);if(found.length!==1)throw new Error(`Mecânica ambígua/ausente: ${name}`);return found[0];
}
function numberFrom(source,pattern,label){const matches=[...source.matchAll(new RegExp(pattern,'g'))];if(matches.length!==1)throw new Error(`Revisar mecânica ${label}: formato alterado`);return Number(matches[0][1]);}

export function normalizeProgression(raw,lock,catalog){
  if(lock.gameVersion!=='6.11.1')throw new Error('Revisar a política de progressão e a economia para o novo patch');
  const Rarity=staticModule(raw.gameEnum).get('Rarity'),shop=staticModule(raw.shopParameters,{Rarity}),xp=staticModule(raw.experienceParameters),stages=staticModule(raw.stagesParameters);
  const rates=shop.get('RarityProbabilityPerLevel'),expTable=xp.get('ExpTable');
  for(const [level,values]of Object.entries(rates))if(values.length!==5||values.some(v=>v<0||v>1)||Math.abs(values.reduce((a,b)=>a+b,0)-1)>1e-9)throw new Error(`Chances da loja inválidas: ${level}`);
  const income=section(raw.gameCommands,'computeIncome'),reroll=section(raw.gameCommands,'OnShopRerollCommand');
  const enumModule=staticModule(raw.pokemonEnum),poolModule=staticModule(raw.poolParameters,{Rarity,Pkm:enumModule.get('Pkm'),PkmDuo:enumModule.get('PkmDuo')}),duos=enumModule.get('PkmDuos');
  const offeredBases=[];
  for(const name of ['UniquePool','LegendaryPool']){
    const declaration=poolModule.ast.statements.filter(ts.isVariableStatement).flatMap(s=>[...s.declarationList.declarations]).find(d=>d.name.getText(poolModule.ast)===name);
    const expression=declaration?.initializer;
    if(!expression||!ts.isNewExpression(expression)||expression.expression.getText(poolModule.ast)!=='Array')throw new Error('Revisar pool de escolhas: '+name);
    for(const arg of expression.arguments??[]){const id=poolModule.evaluate(arg);if(typeof id!=='string')throw new Error('Proposição inválida');offeredBases.push(...(duos[id]??[id]));}
  }
  return {schemaVersion:1,version:lock.gameVersion,revision:lock.revision,mode:'Regras padrão; sem modificador especial',shop:{size:shop.get('SHOP_SIZE'),rarities:['COMMON','UNCOMMON','RARE','EPIC','ULTRA'],rates,costs:shop.get('RarityCost'),poolSize:staticModule(raw.poolParameters,{Rarity}).get('PoolSize')},experience:{initialLevel:numberFrom(raw.experienceManager,'this\\.level = (\\d+)','nível inicial'),maxLevel:xp.get('MAX_LEVEL'),thresholds:expTable,purchaseXp:numberFrom(raw.gameCommands,'player\\.addExperience\\((\\d+)\\)\\s*player\\.money -= cost','XP por compra'),purchaseGold:numberFrom(section(raw.experienceManager,'getLevelUpCost'),'const cost = (\\d+)','custo de XP'),passiveXp:numberFrom(income,'player\\.addExperience\\((\\d+)\\)','XP passivo')},economy:{rerollGold:numberFrom(reroll,'const rollCost = player\\.shopFreeRolls > 0 \\? 0 : (\\d+)','reroll'),baseIncome:numberFrom(income,'income \\+= (\\d+)\\s','renda base'),baseInterestCap:numberFrom(income,'player\\.maxInterest = (\\d+) \\+','limite de juros'),goldPerInterest:numberFrom(income,'Math\\.floor\\(player\\.money / (\\d+)\\)','juros'),streakCap:numberFrom(income,'income \\+= max\\((\\d+)\\)\\(player\\.streak\\)','sequência')},events:{portals:stages.get('PortalCarouselStages'),additionalPicks:stages.get('AdditionalPicksStages')},acquisition:Object.fromEntries(catalog.pokemons.map(p=>[p.id,acquisitionRoute(p,catalog.pokemons,offeredBases)]))};
}

export function acquisitionRoute(target,pokemons,offeredBases=[]){
  const byId=new Map(pokemons.map(p=>[p.id,p]));
  const family=pokemons.filter(p=>p.family===target.family&&p.kind==='pokemon');
  const bases=family.filter(p=>p.stars===1&&p.ability.id!=='DEFAULT');
  for(const p of family)if(offeredBases.includes(p.id)&&!bases.includes(p))bases.push(p);
  // Single-stage special picks legitimately start with 2 or 3 catalogue stars.
  if(!bases.length)bases.push(byId.get(target.family)??target);
  const routes=[];
  for(const base of bases){
    const queue=[{id:base.id,path:[base.id],steps:[],copies:1,conditional:false}];
    while(queue.length){
      const route=queue.shift();
      if(route.id===target.id){routes.push({...route,baseId:base.id,rarity:base.rarity,regional:base.regional,additional:base.additional});break;}
      const p=byId.get(route.id);if(!p)continue;
      for(const id of [...new Set([p.evolution,...(p.evolutions??[])].filter(Boolean))]){
        if(route.path.includes(id)||!byId.has(id))continue;
        const rule=p.evolutionRule??{type:'conditional',conditional:true},count=rule.type==='count'?rule.numberRequired:null;
        queue.push({id,path:[...route.path,id],steps:[...route.steps,{from:p.id,to:id,...rule}],copies:route.copies!=null&&count!=null?route.copies*count:null,conditional:route.conditional||rule.conditional||rule.type!=='count'});
      }
    }
  }
  const route=routes.sort((a,b)=>Number(a.conditional)-Number(b.conditional)||a.path.length-b.path.length||Number(a.baseId!==target.family)-Number(b.baseId!==target.family)||a.baseId.localeCompare(b.baseId))[0];
  if(!route)return {baseId:null,path:[],steps:[],copies:null,conditional:true,method:'review'};
  const method=['COMMON','UNCOMMON','RARE','EPIC','ULTRA'].includes(route.rarity)?'shop':route.rarity==='UNIQUE'?'unique':route.rarity==='LEGENDARY'?'legendary':route.rarity==='HATCH'?'egg':'special';
  return {...route,method};
}

export function validateProgression(rules,catalog){
  const ids=new Set(catalog.pokemons.map(p=>p.id));
  if(rules.schemaVersion!==1||rules.experience.maxLevel!==9||rules.experience.initialLevel!==2)throw new Error('Limites de progressão não revisados');
  for(let level=2;level<=rules.experience.maxLevel;level++){
    const rates=rules.shop.rates[level];
    if(!Array.isArray(rates)||rates.length!==5||rates.some(v=>!Number.isFinite(v)||v<0||v>1)||Math.abs(rates.reduce((a,b)=>a+b,0)-1)>1e-9)throw new Error('Chances inválidas no nível '+level);
    if(!Number.isInteger(rules.experience.thresholds[level])||rules.experience.thresholds[level]<=0)throw new Error('XP inválido no nível '+level);
  }
  for(const value of [rules.shop.size,rules.experience.purchaseXp,rules.experience.purchaseGold,rules.experience.passiveXp,...Object.values(rules.economy)])if(!Number.isFinite(value)||value<=0)throw new Error('Economia inválida');
  if(Object.keys(rules.acquisition).length!==ids.size)throw new Error('Rotas de obtenção incompletas');
  for(const [id,route]of Object.entries(rules.acquisition)){
    if(!ids.has(id)||route.baseId&&!ids.has(route.baseId)||route.path.some(p=>!ids.has(p)))throw new Error('Referência inválida em obtenção: '+id);
    if(route.method==='shop'&&!rules.shop.rarities.includes(route.rarity))throw new Error('Raridade fora da loja: '+id);
    if(route.copies!=null&&(!Number.isInteger(route.copies)||route.copies<1))throw new Error('Quantidade de cópias inválida: '+id);
  }
  return true;
}
