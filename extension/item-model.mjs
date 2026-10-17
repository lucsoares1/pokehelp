// Read-only recipe allocation. Ready Pokémon marks are deliberately irrelevant here.
export function itemAdvice(plan,catalog,pokemons,snapshot){
  const items=new Map(catalog.map(i=>[i.id,i])),families=new Map(pokemons.map(p=>[p.id,p.family||p.id]));
  const count=ids=>{const m=new Map();for(const id of ids??[])if(items.has(id))m.set(id,(m.get(id)||0)+1);return m;};
  const known=snapshot?.code==='connected'&&Array.isArray(snapshot.inventory);
  const pool=count(known?snapshot.inventory:[]),equipment=new Map(),used=new Map(),picks=new Map();let offerPool=new Map();
  const take=(map,id)=>{if(!(map.get(id)>0))return false;map.set(id,map.get(id)-1);return true;};
  if(known)for(const p of snapshot.equipped??[]){if(!families.has(p.pokemon))continue;const family=families.get(p.pokemon);if(!equipment.has(family))equipment.set(family,new Map());const m=equipment.get(family);for(const id of p.items??[])if(items.has(id))m.set(id,(m.get(id)||0)+1);}
  const goals=(plan?.units??[]).flatMap(p=>p.items.filter(i=>items.has(i.id)).map(i=>({id:i.id,recipient:p.name,pokemon:p.id,family:families.get(p.id)||p.id,recipe:(items.get(i.id).components??[]).filter(id=>items.has(id)),status:known?'missing':'unknown',allocated:[],missing:[]})));
  const allocate=(g,id)=>{take(pool,id);g.allocated.push(id);used.set(id,(used.get(id)||0)+1);};
  if(known){
    for(const g of goals)if(take(equipment.get(g.family)??new Map(),g.id))g.status='equipped';
    // A complete item on a known temporary counts once as in transit, not delivered.
    if(Array.isArray(snapshot.board)){
      const finalFamilies=new Set((plan?.units??[]).map(p=>families.get(p.id)||p.id)),transit=new Map(),delivered=new Map();
      for(const g of goals)if(g.status==='equipped'){const key=g.family+':'+g.id;delivered.set(key,(delivered.get(key)||0)+1);}
      const units=[...snapshot.board].sort((a,b)=>Number(finalFamilies.has(families.get(a.pokemon)||a.pokemon))-Number(finalFamilies.has(families.get(b.pokemon)||b.pokemon)));
      for(const unit of units)for(const id of unit.items){const key=(families.get(unit.pokemon)||unit.pokemon)+':'+id;if(take(delivered,key))continue;if(!transit.has(id))transit.set(id,[]);transit.get(id).push(unit);}
      for(const g of goals)if(g.status==='missing'&&transit.get(g.id)?.length){g.status='held';g.heldOn=transit.get(g.id).shift();g.protectedHolder=finalFamilies.has(families.get(g.heldOn.pokemon)||g.heldOn.pokemon);}
    }
    for(const g of goals)if(g.status==='missing'&&pool.get(g.id)>0){allocate(g,g.id);g.status='available';}
    // Finish whole recipes before assigning scarce shared components to incomplete ones.
    for(const g of goals)if(g.status==='missing'&&g.recipe.length&&[...count(g.recipe)].every(([id,n])=>(pool.get(id)||0)>=n)){
      for(const id of g.recipe)allocate(g,id);g.status='craft';
    }
    // Complete recipes stay protected. Partial reservations may be reassigned
    // when evaluating mutually exclusive offers from the carousel or a menu.
    offerPool=new Map(pool);
    for(const g of goals)if(g.status==='missing')for(const id of g.recipe){if(pool.get(id)>0)allocate(g,id);else g.missing.push(id);}
  }
  for(const g of goals){
    if(['equipped','held','available','craft'].includes(g.status))continue;
    for(const id of [g.id,...new Set(known?g.missing:g.recipe)]){
      if(!picks.has(id))picks.set(id,[]);picks.get(id).push(g);
    }
  }
  return {known,goals,used,picks,offerPool};
}

export function validItemSnapshot(value,itemIds,pokemonIds,synergyIds=new Set()){
  if(!value||!['connected','carousel','waiting','scouting','unsupported'].includes(value.code))return null;
  if(!['connected','carousel'].includes(value.code))return {code:value.code,inventory:null,equipped:[],sources:[]};
  if(value.code==='carousel'&&(value.inventory!==null||value.equipped?.length))return null;
  if(value.code==='connected'&&(!Array.isArray(value.inventory)||value.inventory.length>256||value.inventory.some(id=>!itemIds.has(id))))return null;
  if(!Array.isArray(value.equipped)||value.equipped.length>64||!Array.isArray(value.sources)||value.sources.length>384)return null;
  const equipped=[];
  for(const p of value.equipped){if(!pokemonIds.has(p.pokemon)||!Array.isArray(p.items)||p.items.length>16||p.items.some(id=>!itemIds.has(id)))return null;equipped.push({pokemon:p.pokemon,items:[...p.items]});}
  const sources=[],keys=new Set();
  for(const s of value.sources){
    if(!s||!['stash','carousel'].includes(s.kind)||typeof s.key!=='string'||!/^[\w:-]{1,100}$/.test(s.key)||keys.has(s.key)||!itemIds.has(s.item)||!s.rect||!['x','y','width','height'].every(k=>Number.isFinite(s.rect[k])&&Math.abs(s.rect[k])<50000)||s.rect.width<4||s.rect.height<4||s.rect.width>500||s.rect.height>500)return null;
    keys.add(s.key);sources.push({key:s.key,kind:s.kind,item:s.item,rect:{...s.rect}});
  }
  if(value.code==='carousel'&&sources.some(s=>s.kind!=='carousel'))return null;
  const board=[];const unitKeys=new Set();
  if(value.board!=null){
    if(value.code!=='connected'||!Array.isArray(value.board)||value.board.length>64)return null;
    for(const u of value.board){
      if(!u||typeof u.key!=='string'||!/^unit:[\w-]{1,80}$/.test(u.key)||unitKeys.has(u.key)||!pokemonIds.has(u.pokemon)||!Number.isInteger(u.x)||u.x<0||u.x>7||!Number.isInteger(u.y)||u.y<0||u.y>3||!Number.isInteger(u.stars)||u.stars<1||u.stars>4||!Array.isArray(u.items)||u.items.length>3||u.items.some(id=>!itemIds.has(id)))return null;
      unitKeys.add(u.key);const unit={key:u.key,pokemon:u.pokemon,x:u.x,y:u.y,stars:u.stars,items:[...u.items]};
      for(const flag of ['canPlace','countsForTeam'])if(u[flag]!==undefined){if(typeof u[flag]!=='boolean')return null;unit[flag]=u[flag];}
      if(u.rect){if(!['x','y','width','height'].every(k=>Number.isFinite(u.rect[k])&&Math.abs(u.rect[k])<50000)||u.rect.width<4||u.rect.height<4||u.rect.width>500||u.rect.height>500)return null;unit.rect={...u.rect};}
      board.push(unit);
    }
    const owned=new Map();for(const u of equipped)for(const id of u.items){const key=u.pokemon+':'+id;owned.set(key,(owned.get(key)||0)+1);}
    for(const u of board)for(const id of u.items){const key=u.pokemon+':'+id;if(!(owned.get(key)>0))return null;owned.set(key,owned.get(key)-1);}
  }
  const portals=[],portalKeys=new Set(),stage=value.stage??null;
  if(stage!==null&&(!Number.isInteger(stage)||stage<0||stage>99))return null;
  if(value.portals!==undefined&&(!Array.isArray(value.portals)||value.portals.length>16))return null;
  for(const p of value.portals??[]){
    if(!p||typeof p.key!=='string'||!/^portal:[\w:-]{1,90}$/.test(p.key)||portalKeys.has(p.key)||!Array.isArray(p.types)||!p.types.length||p.types.length>16||p.types.some(id=>!synergyIds.has(id))||!p.rect||!['x','y','width','height'].every(k=>Number.isFinite(p.rect[k])&&Math.abs(p.rect[k])<50000)||p.rect.width<4||p.rect.height<4||p.rect.width>500||p.rect.height>500)return null;
    portalKeys.add(p.key);portals.push({key:p.key,types:[...p.types],rect:{...p.rect}});
  }
  const rewards=[],rewardIndices=new Set();
  if(value.rewards!==undefined&&(!Array.isArray(value.rewards)||value.rewards.length>16))return null;
  for(const reward of value.rewards??[]){
    if(value.code!=='connected'||!Number.isInteger(reward.index)||reward.index<0||reward.index>15||rewardIndices.has(reward.index))return null;
    rewardIndices.add(reward.index);
    // Duo identifiers absent from the catalog are ignored, not guessed.
    if(!pokemonIds.has(reward.pokemon)||reward.item!==null&&!itemIds.has(reward.item))continue;
    rewards.push({index:reward.index,pokemon:reward.pokemon,item:reward.item});
  }
  const metadata={};for(const [key,min,max]of [['level',1,20],['capacity',1,24],['teamSize',0,24]]){const v=value[key]??null;if(v!==null&&(!Number.isInteger(v)||v<min||v>max||value.code!=='connected'))return null;metadata[key]=v;}
  return {code:value.code,inventory:value.code==='connected'?[...value.inventory]:null,equipped,sources,portals,stage,board:value.board==null?null:board,boardMode:['pick','battle','town'].includes(value.boardMode)?value.boardMode:null,...metadata,rewards};
}

// Exactly one offer gets the main badge, even when several copies share the same ID.
export function carouselItemChoices(advice,sources){
  const ranks=rankItemOffers(advice,sources.map(s=>s.item)),byId=new Map(ranks.map(r=>[r.id,r]));let main=false;
  return sources.flatMap(source=>{const rank=byId.get(source.item);if(!rank)return [];const primary=advice.known&&!main&&rank===ranks[0];if(primary)main=true;return [{source,rank,primary}];});
}

// Priority describes concrete recipe progress, not a claim about the best strategy.
export function rankItemOffers(advice,ids){
  return [...new Set(ids)].flatMap((id,order)=>{
    const candidates=advice.goals.flatMap((goal,goalIndex)=>{
      if(!['missing','unknown'].includes(goal.status))return [];
      if(goal.id===id)return [{goal,goalIndex,allocated:[],missing:[],score:advice.known?400:0,completes:advice.known}];
      if(!goal.recipe.includes(id))return [];
      const pool=new Map(advice.offerPool),allocated=[],missing=[];
      for(const part of goal.recipe){
        if(advice.known&&(pool.get(part)||0)>0){pool.set(part,pool.get(part)-1);allocated.push(part);}
        else missing.push(part);
      }
      // An extra copy of a component already covered cannot progress this goal.
      if(!missing.includes(id))return [];
      const completes=advice.known&&missing.length===1;
      return [{goal,goalIndex,allocated,missing,completes,score:!advice.known?0:completes?350:allocated.length?200:100}];
    });
    candidates.sort((a,b)=>b.score-a.score||a.goalIndex-b.goalIndex);const best=candidates[0];
    return best?[{id,order,...best}]:[];
  }).sort((a,b)=>b.score-a.score||(advice.known?a.goalIndex-b.goalIndex:0)||a.order-b.order);
}

// The same recipe order is shared by inventory labels and the panel. Numbers
// identify recipes, never the three item slots of a Pokémon.
export function recipeQueue(advice){
  return advice.goals.map((goal,index)=>({goal,index})).filter(({goal:g})=>g.recipe.length&&['craft','missing'].includes(g.status)&&g.allocated.length)
    .sort((a,b)=>Number(b.goal.status==='craft')-Number(a.goal.status==='craft')||a.goal.missing.length-b.goal.missing.length||a.index-b.index)
    .map((entry,index)=>({...entry,number:index+1}));
}

export function rewardChoices(advice,sources){
  const byId=new Map(rankItemOffers(advice,sources.map(s=>s.item).filter(Boolean)).map(r=>[r.id,r]));
  const ranked=sources.flatMap((source,order)=>{const rank=byId.get(source.item);return rank||source.pokemonWanted?[{source,rank,order,score:(source.pokemonWanted?500:0)+(rank?.score??0)}]:[];})
    .sort((a,b)=>b.score-a.score||(advice.known?(a.rank?.goalIndex??Infinity)-(b.rank?.goalIndex??Infinity):0)||a.order-b.order);
  return ranked.map((choice,index)=>({...choice,primary:index===0&&(advice.known||choice.source.pokemonWanted===true)}));
}
