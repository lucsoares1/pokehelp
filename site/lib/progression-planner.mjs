import {teamSynergies} from './composition-model.mjs';

// Editorial goals, never an inventory or a forecast of rolls. Cache only immutable inputs.
const caches=new WeakMap();
const chance=(rules,rarity,level)=>rules.shop.rates[level]?.[rules.shop.rarities.indexOf(rarity)]??0;
export function bestShopLevels(rules,rarity){
  const levels=Array.from({length:rules.experience.maxLevel-rules.experience.initialLevel+1},(_,i)=>i+rules.experience.initialLevel);
  const best=Math.max(...levels.map(l=>chance(rules,rarity,l)));
  return best?{chance:best,levels:levels.filter(l=>chance(rules,rarity,l)===best)}:null;
}
function availableAt(rules,rarity){
  return Array.from({length:rules.experience.maxLevel-rules.experience.initialLevel+1},(_,i)=>i+rules.experience.initialLevel).find(l=>chance(rules,rarity,l)>=(rarity==='ULTRA'?.05:.1))??Infinity;
}
function goal(entry,level,rules,owned,terminal,data){
  const {target,route,base,index,member}=entry,ready=owned.has(index);
  let id=base?.id??target.id;
  if(ready||terminal)id=target.id;
  else if(route.method==='shop'){
    const first=availableAt(rules,route.rarity);
    if(level<first)return null;
    const age=level-first,total=Array.from({length:age+1},(_,i)=>chance(rules,route.rarity,first+i)).reduce((a,b)=>a+b,0);
    // Milestones for collecting copies. Conditions below remain explicit, not auto-evolution.
    let copies=1;
    for(const step of route.steps){
      if(step.type!=='count')break;
      copies*=step.numberRequired;
      if(age>=(copies<=3?1:3)&&total>=(copies<=3?.45:1))id=step.to;else break;
    }
  }else return null; // Player level does not prove a portal, hatch, or special acquisition.
  const evolved=id!==base?.id,needsEvolution=!ready&&evolved;
  const conditions=[];
  if(!ready){
    if(route.regional)conditions.push('Região precisa liberar a família.');
    if(route.additional)conditions.push(`Só se a família for liberada na seleção adicional (etapas ${rules.events.additionalPicks.join(', ')}).`);
    if(base?.types.includes('WILD'))conditions.push('Depende das regras de encontro Selvagem.');
    if(route.method==='unique')conditions.push(`Escolha única na etapa ${rules.events.portals[1]}; etapa não é nível.`);
    if(route.method==='legendary')conditions.push(`Escolha lendária na etapa ${rules.events.portals[2]}; não vem no reroll comum.`);
    if(route.method==='egg')conditions.push('Depende de ovo e eclosão.');
    if(route.method==='special')conditions.push('Obtenção especial; consulte a receita da família.');
    if(route.method==='review')conditions.push('Rota em revisão; mantenha um substituto se não conseguir.');
    if(needsEvolution){
      const until=(route.steps??[]).slice(0,route.path.indexOf(id)),count=until.length&&until.every(s=>s.type==='count')?until.reduce((n,s)=>n*s.numberRequired,1):null;
      const triggers=until.flatMap(s=>s.items??[]),special=until.some(s=>s.type==='stack')?'Depende dos acúmulos da família.':until.some(s=>s.type==='hatch')?'Depende de eclosão.':triggers.length?`Exige item de evolução: ${triggers.map(id=>data.maps.items?.get(id)?.name??id).join(' / ')}.`:'Cumpra a condição de evolução.';
      conditions.push(count?`Junte ${count} ${base?.name??'cópias da base'} no total para esta forma.`:`${special} Subir de nível não evolui a peça.`);
    }
  }
  return {id,index,targetId:target.id,temporary:false,obtained:ready,planned:!ready,conditional:conditions.length>0,condition:conditions.join(' '),items:terminal?[...member.items]:[],stage:ready?'Pronto':evolved?'Meta de evolução':'Da comp',needsEvolution};
}
const asTeam=lineup=>({members:lineup.map(m=>({id:m.id,items:m.items}))});

// Match physical copies once, then pair evolutions before unrelated exchanges.
export function lineupChanges(previous,next,data){
  const outgoing=previous.slice(),incoming=next.slice(),pairs=[];
  const take=(oldIndex,newIndex)=>{const from=outgoing.splice(oldIndex,1)[0],to=incoming.splice(newIndex,1)[0];return {from,to};};
  for(const exact of [true,false])for(let i=outgoing.length-1;i>=0;i--){
    const j=incoming.findIndex(n=>n.id===outgoing[i].id&&(!exact||n.index===outgoing[i].index));if(j>=0)take(i,j);
  }
  const family=m=>data.maps.pokemons.get(m.id)?.family??m.id;
  for(const bySlot of [true,false])for(let i=outgoing.length-1;i>=0;i--){
    const j=incoming.findIndex(n=>family(n)===family(outgoing[i])&&(!bySlot||n.index!=null&&n.index===outgoing[i].index));
    if(j>=0)pairs.push({...take(i,j),kind:bySlot?'evolution':'replacement'});
  }
  while(outgoing.length&&incoming.length)pairs.push({...take(0,0),kind:'replacement'});
  pairs.sort((a,b)=>previous.indexOf(a.from)-previous.indexOf(b.from));
  const portrait=m=>{const p=data.maps.pokemons.get(m.id);return {id:m.id,index:m.index,name:p.name,image:p.image,rarity:p.rarity,stars:p.stars,temporary:m.temporary};};
  return {replacements:pairs.map(p=>({from:portrait(p.from),to:portrait(p.to),kind:p.kind})),additions:incoming.map(portrait),removals:outgoing.map(portrait)};
}

export function progressionStep(team,data,rules,targets,level,owned,focus){
  let cache=caches.get(data);if(!cache)caches.set(data,cache=new Map());
  const key=JSON.stringify([team.members,[...owned].sort(),focus?.index,rules.revision]);
  let history=cache.get(key);if(!history){history=new Map();cache.set(key,history);if(cache.size>900)cache.delete(cache.keys().next().value);}
  if(history.has(level))return history.get(level);
  const finalSynergies=teamSynergies(team,data),primary=finalSynergies.find(s=>s.active)?.id??finalSynergies[0]?.id;
  const relevant=new Set(finalSynergies.filter(s=>s.active).map(s=>s.id));
  const goalTypes=new Set(finalSynergies.map(s=>s.id));
  const targetFamilies=new Set(targets.map(t=>t.target.family));
  for(let current=rules.experience.initialLevel;current<=level;current++){
    if(history.has(current))continue;
    const previous=history.get(current-1)?.lineup??[],previousIds=new Set(previous.map(m=>m.id)),terminal=current===rules.experience.maxLevel;
    const goals=targets.map(t=>goal(t,current,rules,owned,terminal,data)).filter(Boolean);
    const slots=terminal?Math.min(current,team.members.length):current,pool=goals.slice();
    if(!terminal){
      const fillers=data.pokemons.filter(p=>p.kind==='pokemon'&&p.stars===1&&!p.variant&&!p.regional&&!p.additional&&!p.types.includes('WILD')&&p.abilityId!=='DEFAULT'&&!targetFamilies.has(p.family)&&rules.acquisition[p.id]?.method==='shop'&&current>=availableAt(rules,p.rarity)&&p.types.some(t=>goalTypes.has(t)));
      const coverage=p=>Number(p.types.includes(primary))*3+p.types.filter(t=>relevant.has(t)).length*2+p.types.filter(t=>goalTypes.has(t)).length;
      fillers.sort((a,b)=>Number(previousIds.has(b.id))-Number(previousIds.has(a.id))||coverage(b)-coverage(a)||chance(rules,b.rarity,current)-chance(rules,a.rarity,current)||a.id.localeCompare(b.id));
      // A cap on records must not become a cap on usable families/board slots.
      const families=new Set(),distinct=fillers.filter(p=>{if(families.has(p.family))return false;families.add(p.family);return true;});
      pool.push(...distinct.slice(0,12).map(p=>({id:p.id,targetId:null,index:null,temporary:true,obtained:false,planned:true,conditional:false,condition:'Provisório para fechar sinergia; substitua pela família final.',items:[],stage:'Ponte de sinergia'})));
      for(const p of previous)if(p.temporary&&!pool.some(m=>m.id===p.id))pool.push(p);
    }
    const synergyMemo=new Map();
    const synergies=units=>{const k=units.map(m=>m.id+':'+m.items.join(',')).sort().join('|');if(!synergyMemo.has(k))synergyMemo.set(k,teamSynergies(asTeam(units),data));return synergyMemo.get(k);};
    const score=units=>{
      const ss=synergies(units);
      let n=units.reduce((sum,m)=>sum+(m.obtained?400:0)+(m.temporary?0:64)+(m.index===focus?.index?14:0)+(previous.some(old=>data.maps.pokemons.get(old.id).family===data.maps.pokemons.get(m.id).family)?32:0)-(m.conditional?5:0),0);
      for(const s of ss){
        const weight=s.id===primary?150:relevant.has(s.id)?65:24;
        n+=s.tier*weight;
        // Reward progress between real breakpoints, without calling it an active bonus.
        if(s.next)n+=weight*.35*s.count/s.next;
      }
      return n;
    };
    let lineup=[];
    if(terminal)lineup=goals.slice().sort((a,b)=>Number(b.obtained)-Number(a.obtained)||b.items.length-a.items.length||a.index-b.index).slice(0,slots).sort((a,b)=>a.index-b.index);
    else{
      const legal=(candidate,rest)=>!rest.some(m=>m.index!=null&&m.index===candidate.index||data.maps.pokemons.get(m.id).family===data.maps.pokemons.get(candidate.id).family);
      // Extend last level's board instead of rebuilding it independently.
      for(const old of previous){
        const updated=old.index!=null?goals.find(m=>m.index===old.index):pool.find(m=>m.id===old.id);
        if(updated&&lineup.length<slots&&legal(updated,lineup))lineup.push(updated);
      }
      while(lineup.length<slots){
        const options=pool.filter(m=>legal(m,lineup)).map(m=>({m,score:score([...lineup,m])})).sort((a,b)=>b.score-a.score||String(a.m.id).localeCompare(b.m.id));
        if(!options.length)break;lineup.push(options[0].m);
      }
      // Temporary reshuffles need a real relevant breakpoint, not a tiny score gain.
      let temporaryExchange=false;
      for(let slot=0;slot<lineup.length;slot++){
        const rest=lineup.filter((_,i)=>i!==slot);let best=score(lineup),replacement=lineup[slot];
        for(const m of pool)if(legal(m,rest)){
          if(m.temporary&&lineup[slot].id!==m.id){
            if(temporaryExchange||!lineup[slot].temporary)continue;
            const before=synergies(lineup),after=synergies([...rest,m]);
            if(!after.some(s=>(s.id===primary||relevant.has(s.id))&&s.tier>(before.find(b=>b.id===s.id)?.tier??0)))continue;
          }
          const next=score([...rest,m]);if(next>best+.01){best=next;replacement=m;}
        }
        if(replacement.temporary&&lineup[slot].id!==replacement.id)temporaryExchange=true;
        lineup[slot]=replacement;
      }
      lineup.sort((a,b)=>(a.index??999)-(b.index??999)||a.id.localeCompare(b.id));
    }
    const changes=lineupChanges(previous,lineup,data);
    const transitions=[...changes.replacements.map(p=>`${p.from.name} → ${p.to.name}${p.kind==='evolution'?' · só após completar a evolução':' · substituição'}.`),...changes.removals.map(p=>`Retirar ${p.name} · ajuste à equipe final.`)];
    const bench=terminal?goals.filter(m=>!lineup.some(n=>n.index===m.index)):[];
    const reserves=terminal?[]:goals.filter(m=>!lineup.some(n=>n.index===m.index)).map(m=>{
      const t=targets[m.index];return {base:t.base?.name??t.target.name,target:t.target.name,condition:m.condition};
    });
    const currentSynergies=synergies(lineup),main=currentSynergies.find(s=>s.id===primary),destination=finalSynergies.find(s=>s.id===primary);
    const synergyGoal=destination?{name:destination.synergy?.name??primary,count:main?.count??0,next:main?main.next:destination.synergy?.thresholds[0]??null,goal:destination.count}:null;
    const pendingSpecial=targets.filter(t=>t.route.method!=='shop'&&!owned.has(t.index)).map(t=>({id:t.target.id,name:t.target.name,method:t.route.method,eventStage:t.route.method==='unique'?rules.events.portals[1]:t.route.method==='legendary'?rules.events.portals[2]:null}));
    history.set(current,{lineup,synergies:currentSynergies,finalSynergies,primary,synergyGoal,transitions,changes,bench,reserves,pendingSpecial,freeSlots:current-lineup.length,finalGoal:terminal,title:terminal?'Equipe final planejada':'Meta de campo neste nível'});
  }
  return history.get(level);
}
