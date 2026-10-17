import { staticModule, pokemonClassData } from './static-typescript.mjs';
import { explainText, localized, rangeProfile } from '../../site/lib/content.mjs';

export function parseCsv(text) {
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));if(row.some(Boolean))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted)throw new Error('CSV com aspas sem fechamento');
  if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
  const headers=rows.shift();if(!headers?.includes('Attack Range'))throw new Error('Schema do CSV alterado');
  return rows.map(r=>{if(r.length!==headers.length)throw new Error('Colunas inconsistentes no CSV');return Object.fromEntries(headers.map((h,i)=>[h,r[i]]));});
}

const safeNumber=(value,name)=>{const n=Number(value);if(value==null||value===''||!Number.isFinite(n))throw new Error(`Número inválido: ${name}`);return n;};
const required=(condition,message)=>{if(!condition)throw new Error(message);};

export function normalizeCatalog(raw, lock) {
  const pt=raw.pt,en=raw.en;
  const text=(ns,id)=>{const l=localized(pt,en,ns,id);return {...l,text:explainText(l.text,pt,en)};};
  const itemModule=staticModule(raw.itemEnum), itemIds=itemModule.get('Item');
  const recipes=itemModule.get('ItemRecipe');
  itemModule.set('Scarves',Object.keys(recipes).filter(id=>recipes[id].includes('SILK_SCARF')));
  const groups=Object.fromEntries(['ItemComponents','Tools','ShinyItems','UnholdableItems','ConsumableItems','RemovableItems'].map(name=>[name,new Set(itemModule.get(name))]));
  const gameModule=staticModule(raw.gameEnum);
  const itemStats=staticModule(raw.itemStats,{Item:itemIds,Stat:gameModule.get('Stat')}).get('ItemStats');
  const pkmModule=staticModule(raw.pokemonEnum);
  const symbols={Pkm:pkmModule.get('Pkm'),Synergy:staticModule(raw.synergyEnum).get('Synergy'),Passive:staticModule(raw.passiveEnum).get('Passive'),Ability:staticModule(raw.abilityEnum).get('Ability'),Rarity:gameModule.get('Rarity'),DEFAULT_SPEED:staticModule(raw.battle).get('DEFAULT_SPEED')};
  if(raw.evolutionRuleEnum){symbols.EvolutionRuleType=staticModule(raw.evolutionRuleEnum).get('EvolutionRuleType');symbols.Item=itemIds;for(const name of ['Tools','Flavors','ItemComponents','CraftableItems','SynergyItems']){try{symbols[name]=itemModule.get(name);}catch{/* Contextual item conditions remain explicitly unresolved. */}}}
  const classes=pokemonClassData(raw.pokemonClasses,symbols);
  const indexes=pkmModule.get('PkmIndex'),families=pkmModule.get('PkmFamily');
  const items=Object.values(itemIds).map(id=>{
    const description=text('item_description',id);
    return {id,name:text('item',id).text,description:description.text,descriptionLanguage:description.language,stats:itemStats[id]??{},components:recipes[id]??[],buildsInto:Object.entries(recipes).filter(([,parts])=>parts.includes(id)).map(([target])=>target),categories:[...(groups.ItemComponents.has(id)?['component']:[]),...(recipes[id]?['craftable']:[]),...(groups.Tools.has(id)?['tool']:[]),...(groups.ShinyItems.has(id)?['shiny']:[])],holdable:!groups.UnholdableItems.has(id),consumable:groups.ConsumableItems.has(id),removable:groups.RemovableItems.has(id),image:`assets/pac/items/${id}.png`,source:{revision:lock.revision,version:lock.gameVersion}};
  });
  const corrections=[];
  const csvRows=parseCsv(raw.csv),rowsById=new Map(csvRows.map(row=>[row.Name,row]));
  required(rowsById.size===csvRows.length,'Pokémon duplicado no CSV');
  for(const row of csvRows)required(Object.hasOwn(symbols.Pkm,row.Name),`CSV contém identificador fora da revisão: ${row.Name}`);
  const missingCsv=Object.values(symbols.Pkm).filter(id=>!rowsById.has(id));
  const pokemons=Object.values(symbols.Pkm).map(id=>{
    const row=rowsById.get(id)??{Name:id,Index:indexes[id],Family:families[id],Category:classes[id]?.rarity};
    const definition=classes[id];required(definition,`Pokémon sem classe: ${id}`);
    const fields={hp:'HP',atk:'Attack',speed:'Speed',def:'Defense',speDef:'Special Defense',range:'Attack Range',maxPP:'Max PP',stars:'Tier'};
    const stats={};for(const [name,column]of Object.entries(fields)){const csv=row[column]==null?null:safeNumber(row[column],id+'.'+name);stats[name]=definition[name]??csv;required(Number.isFinite(stats[name]),`Atributo ausente: ${id}.${name}`);if(csv!=null&&stats[name]!==csv)corrections.push({id,field:name,csv,value:stats[name],reason:'Declaração da classe na revisão fixada prevalece sobre CSV gerado'});}
    const abilityId=definition.skill??row.Ability, passiveId=definition.passive??'NONE';
    const ability=text('ability_description',abilityId), passive=text('passive_description',passiveId);
    const kind=id==='DEFAULT'?'sentinel':id==='EGG'?'egg':id==='SUBSTITUTE'||id.startsWith('PILLAR_')?'summon':'pokemon';
    return {id,kind,index:indexes[id],name:text('pkm',id).text,rarity:definition.rarity??row.Category,stars:stats.stars,rarityLabel:text('rarity',definition.rarity??row.Category).text,family:families[id],evolution:definition.evolution==='DEFAULT'?null:definition.evolution??null,evolutions:definition.evolutions??[],evolutionRule:definition.evolutionRule??null,types:definition.types??[row['Type 1'],row['Type 2'],row['Type 3'],row['Type 4']].filter(Boolean),additional:definition.additional??row['Additional pick']==='true',regional:definition.regional??row.Regional==='true',variant:row.Variant==='true',special:['SPECIAL'].includes(row.Category),stats,range:rangeProfile(stats.range),ability:{id:abilityId,name:text('ability',abilityId).text,description:ability.text,language:ability.language},passive:{id:passiveId,description:passive.text,language:passive.language},role:null,image:`assets/pac/portraits/${indexes[id]}.png`,source:{version:lock.gameVersion,revision:lock.revision}};
  });
  const synergyIds=staticModule(raw.synergyEnum).get('Synergy');
  itemModule.set('Synergy',synergyIds);
  const teamRules={revision:lock.revision,version:lock.gameVersion,board:{columns:8,rows:3},synergyOrder:Object.values(synergyIds),synergyGivenByItem:itemModule.get('SynergyGivenByItem')};
  const thresholds=staticModule(raw.synergies,{Synergy:synergyIds,Item:itemIds}).get('SynergyTiersThresholds');
  const synergies=Object.values(synergyIds).map(id=>({id,name:text('synergy',id).text,description:text('synergy_description',id).text,thresholds:thresholds[id],members:pokemons.filter(p=>p.types.includes(id)).map(p=>p.id),image:`assets/pac/types/${id}.svg`}));
  const tiers=staticModule(raw.elo,{EloRank:staticModule(raw.eloEnum).get('EloRank')}).get('EloRankThreshold');
  for(const entity of [...pokemons,...items,...synergies])entity.image=entity.image.replace('assets/pac/',`assets/pac/${lock.revision.slice(0,12)}/`);
  return {pokemons,items,synergies,tiers,corrections,missingCsv,teamRules};
}

export function normalizeReports(raw,catalog) {
  const pokemonIds=new Set(catalog.pokemons.map(p=>p.id)),itemIds=new Set(catalog.items.map(i=>i.id));
  const unresolved=[],invalidMetrics=[];
  const known=(id,kind,context)=>{const exists=(kind==='pokemon'?pokemonIds:itemIds).has(id);if(!exists)unresolved.push({id,kind,context});return exists;};
  const validateSummary=(record,context)=>{
    required(record&&Number.isFinite(record.count)&&record.count>=0&&Number.isInteger(record.count),`Contagem inválida: ${context}`);
    required(record.rank==null||(Number.isFinite(record.rank)&&record.rank>=0&&record.rank<=9),`Colocação inválida: ${context}`);
  };
  const reports={};
  for(const [kind,collection] of [['items',raw.itemReports],['pokemons',raw.pokemonReports]]){
    required(Array.isArray(collection)&&collection.length>0,`Relatório ausente: ${kind}`);
    for(const tier of collection){required(Object.hasOwn(catalog.tiers,tier.tier),`Faixa desconhecida: ${tier.tier}`);required(tier[kind]&&typeof tier[kind]==='object',`Mapa inválido: ${kind}`);reports[tier.tier]??={items:{},pokemons:{}};
      for(const [id,record] of Object.entries(tier[kind])){
        if(!known(id,kind==='items'?'item':'pokemon',tier.tier))continue;
        validateSummary(record,id);
        const associated=kind==='items'?'pokemons':'items';required(Array.isArray(record[associated]),`Associações inválidas: ${id}`);
        const available=record.count>0&&record.rank>=1&&record.rank<=8;
        if(!available)invalidMetrics.push({id,kind,tier:tier.tier,sourceMeanPlace:record.rank,count:record.count,reason:'Sem amostra válida ou colocação fora de 1–8; não exibida como desempenho'});
        reports[tier.tier][kind][id]={id,count:record.count,available,meanPlace:available?record.rank:null,sourceMeanPlace:record.rank??null,[associated]:record[associated].filter(ref=>known(ref,associated==='items'?'item':'pokemon',id)),meanItemCount:record.item_count??null};
      }
    }
  }
  required(Array.isArray(raw.comps)&&raw.comps.length>0,'Relatório de comps vazio');
  const compositions=raw.comps.map(c=>{
    validateSummary({count:c.count,rank:c.mean_rank},`comp ${c.cluster_id}`);
    required(c.mean_rank>=1&&c.mean_rank<=8,'Colocação da comp fora de 1–8');
    required(Number.isFinite(c.winrate)&&c.winrate>=0&&c.winrate<=100,'Winrate deve usar escala 0–100');
    for(const item of c.mean_items??[])required(Number.isFinite(item.frequency)&&item.frequency>=0&&item.frequency<=1,'Frequência de item deve usar escala 0–1');
    for(const [id,count]of Object.entries(c.synergies))required(catalog.synergies?.some(s=>s.id===id.toUpperCase())&&Number.isInteger(count)&&count>=0,`Sinergia de comp inválida: ${id}`);
    const members=Object.entries(c.mean_team?.pokemons??{}).filter(([id])=>known(id,'pokemon',`comp ${c.cluster_id}`)).map(([id,p])=>{
      required(Number.isFinite(p.frequency)&&p.frequency>=0&&p.frequency<=1,'Frequência deve usar escala 0–1');
      return {id,frequency:p.frequency,meanItemCount:p.mean_items,items:(p.items??[]).filter(i=>known(i,'item',id))};
    }).sort((a,b)=>b.frequency-a.frequency);
    return {id:String(c.cluster_id),count:c.count,meanPlace:c.mean_rank,winRatePercent:c.winrate,sourceRatio:c.ratio,synergies:Object.entries(c.synergies).map(([id,count])=>({id:id.toUpperCase(),count})),members,popularItems:(c.mean_items??[]).filter(i=>known(i.item,'item',c.cluster_id)).map(i=>({id:i.item,frequency:i.frequency})),examples:(c.top_teams??[]).map(team=>({place:team.rank,elo:team.elo,members:team.pokemons.filter(p=>known(p.name,'pokemon',c.cluster_id)).map(p=>({id:p.name,items:p.items.filter(i=>known(i,'item',p.name))}))})),generatedAt:c.generated_at??null,positioningAvailable:false};
  }).sort((a,b)=>a.meanPlace-b.meanPlace);
  required(new Set(compositions.map(c=>c.id)).size===compositions.length,'Cluster duplicado no relatório');
  required(raw.metadata?.[0]?.count>0,'Metadados ausentes');
  for(const field of ['created_at','time_limit'])required(typeof raw.metadata[0][field]==='string'&&Number.isFinite(Date.parse(raw.metadata[0][field])),`Data inválida: ${field}`);
  return {reports,compositions,invalidMetrics,metadata:{generatedAt:raw.metadata[0].created_at,periodStart:raw.metadata[0].time_limit,count:raw.metadata[0].count,timezone:'unspecified',gameVersion:null,mode:null},unresolved:[...new Map(unresolved.map(x=>[JSON.stringify(x),x])).values()]};
}

export function validateCatalog(catalog) {
  const pokemonIds=new Set(), itemIds=new Set(catalog.items.map(i=>i.id));
  required(catalog.pokemons.length>100&&catalog.items.length>50,'Catálogo incompleto');
  required(itemIds.size===catalog.items.length,'Item duplicado');
  for(const p of catalog.pokemons){required(!pokemonIds.has(p.id),'Pokémon duplicado');pokemonIds.add(p.id);required(/^\d{4}(?:-\d{4})*$/.test(p.index),'Índice inválido');required(Object.values(p.stats).every(v=>Number.isFinite(v)&&v>=0),`Atributo inválido: ${p.id}`);required(p.ability.language!=='missing',`Habilidade sem descrição: ${p.id}`);required(p.passive.language!=='missing',`Passiva sem descrição: ${p.id}`);}
  for(const item of catalog.items){required(item.descriptionLanguage!=='missing',`Item sem descrição: ${item.id}`);for(const id of item.components)required(itemIds.has(id),`Receita com componente desconhecido: ${id}`);}
  for(const p of catalog.pokemons)if(p.evolution)required(pokemonIds.has(p.evolution),`Evolução desconhecida: ${p.evolution}`);
  for(const synergy of catalog.synergies)required(Array.isArray(synergy.thresholds)&&synergy.thresholds.every(Number.isFinite),`Patamares inválidos: ${synergy.id}`);
  const itemMap=new Map(catalog.items.map(i=>[i.id,i]));
  const visited=new Set();
  function visit(id,path=new Set()){
    required(!path.has(id),`Ciclo de receitas: ${id}`);if(visited.has(id))return;
    const next=new Set(path);next.add(id);for(const child of itemMap.get(id).components)visit(child,next);visited.add(id);
  }
  for(const item of catalog.items)visit(item.id);
  return true;
}
