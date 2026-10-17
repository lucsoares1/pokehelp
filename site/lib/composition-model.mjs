// Local presentation suggestions stay separate from observed teams and game mechanics.
export function compositionTitle(comp,data) {
  return comp.synergies.slice().sort((a,b)=>b.count-a.count).slice(0,2).map(s=>`${data.maps.synergies.get(s.id)?.name??s.id} ${s.count}`).join(' / ');
}

export function compositionSelectionName(team,data){
  return team.members.map((p,index)=>({...p,index})).filter(p=>p.items.length)
    .sort((a,b)=>b.items.length-a.items.length||a.index-b.index).slice(0,2)
    .map(p=>data.maps.pokemons.get(p.id)?.name??p.id).join(' + ')||`${team.members.length} Pokémon`;
}

export function variantsFor(comp) {
  const frequencies=new Map(comp.members.map(p=>[p.id,p.frequency]));
  const variants=comp.examples.map((team,index)=>({...team,index,score:team.members.reduce((sum,p)=>sum+(frequencies.get(p.id)??0),0)/Math.max(1,team.members.length)}));
  return variants.filter(team=>team.members.length>0).sort((a,b)=>b.score-a.score||a.index-b.index).map((team,order)=>({...team,label:order===0?'Principal':`Variação ${order+1}`}));
}

export function selectedVariant(comp,index) {
  const variants=variantsFor(comp);
  return (index==null?null:variants.find(v=>v.index===Number(index)))??variants[0]??null;
}

export function effectiveRange(member,data) {
  const p=data.maps.pokemons.get(member.id);
  return Math.max(1,(p?.stats.range??1)+member.items.reduce((sum,id)=>sum+(data.maps.items.get(id)?.stats.RANGE??0),0));
}

export function suggestFormation(team,data) {
  const columns=data.teamRules?.board.columns??8,rows=data.teamRules?.board.rows??3;
  const center=Array.from({length:columns},(_,x)=>x).sort((a,b)=>Math.abs(a-(columns-1)/2)-Math.abs(b-(columns-1)/2)||a-b);
  const occupied=new Set();
  const units=team.members.map((member,index)=>{
    const p=data.maps.pokemons.get(member.id),range=effectiveRange(member,data);
    const durability=(p?.stats.hp??0)*(2+(p?.stats.def??0)+(p?.stats.speDef??0));
    return {...member,index,pokemon:p,range,durability};
  }).sort((a,b)=>(a.range===1?0:1)-(b.range===1?0:1)||b.durability-a.durability||a.index-b.index);
  const placed=units.map(unit=>{
    const rowOrder=unit.range===1?[0,1,2]:unit.range===2?[1,2,0]:[2,1,0];
    for(const row of rowOrder)for(const col of center){
      const key=row*columns+col;
      if(!occupied.has(key)){occupied.add(key);return {...unit,row,col};}
    }
    return {...unit,row:null,col:null};
  });
  return {columns,rows,units:placed.sort((a,b)=>a.index-b.index)};
}

// Port of the pinned game's family/item/Dragon/Protean counting. No battle simulation.
export function teamSynergies(team,data) {
  const rules=data.teamRules,order=rules?.synergyOrder??data.synergies.map(s=>s.id);
  const counts=new Map(order.map(id=>[id,0]));
  const units=team.members.map(member=>{
    const p=data.maps.pokemons.get(member.id);
    const dynamic=p?.passiveId==='PROTEAN3'?3:p?.passiveId==='PROTEAN2'?2:0;
    let types=dynamic?[]:[...(p?.types??[])];
    for(const item of member.items){const type=rules?.synergyGivenByItem[item];if(type)types=type==='DRAGON'?[type,...types.filter(t=>t!==type)]:[...new Set([...types,type])];}
    return {family:p?.family??member.id,types,dynamic};
  });
  const add=id=>counts.set(id,(counts.get(id)??0)+1);
  const byFamily=new Map();
  for(const unit of units){if(!byFamily.has(unit.family))byFamily.set(unit.family,new Set());for(const type of unit.types)byFamily.get(unit.family).add(type);}
  for(const types of byFamily.values())for(const type of types)add(type);
  const dragonThreshold=data.maps.synergies.get('DRAGON')?.thresholds[0]??Infinity;
  const doubleDragon=()=>{
    const families=new Map();
    for(const unit of units)if(unit.types.includes('DRAGON')&&unit.types.length>1){if(!families.has(unit.family))families.set(unit.family,new Set());families.get(unit.family).add(unit.types[1]);}
    for(const types of families.values())for(const type of types)add(type);
  };
  if(counts.get('DRAGON')>=dragonThreshold)doubleDragon();
  for(const unit of units)if(unit.dynamic){
    const sorted=order.slice().sort((a,b)=>counts.get(b)-counts.get(a));
    if(sorted.slice(0,unit.dynamic).includes('DRAGON')){sorted.splice(sorted.indexOf('DRAGON'),1);sorted.unshift('DRAGON');}
    let recompute=false;
    for(const type of sorted.slice(0,unit.dynamic))if(!unit.types.includes(type)&&counts.get(type)>0){
      unit.types.push(type);add(type);
      if(type==='DRAGON'){
        if(counts.get(type)===dragonThreshold)recompute=true;
        else if(counts.get(type)>dragonThreshold)add(sorted[1]);
      }
    }
    if(recompute)doubleDragon();
  }
  return [...counts].filter(([,count])=>count>0).map(([id,count])=>{
    const synergy=data.maps.synergies.get(id),thresholds=synergy?.thresholds??[];
    return {id,count,synergy,active:thresholds.some(t=>count>=t),tier:thresholds.filter(t=>count>=t).length,next:thresholds.find(t=>t>count)??null};
  }).sort((a,b)=>Number(b.active)-Number(a.active)||b.count-a.count||b.tier-a.tier);
}

export function compositionHref(comp,index=null) {
  return `#comp/${comp.id}@${comp.snapshotId}${index==null?'':`~${index}`}`;
}

export function parseCompositionKey(key='') {
  const [identity,variant]=key.split('~'),[id,snapshotId]=identity.split('@');
  return {id,snapshotId,variant:variant!=null&&/^\d+$/.test(variant)?Number(variant):null};
}
