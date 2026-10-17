import {teamSynergies} from '../site/lib/composition-model.mjs';

// One manual move at a time. Only the owned preparation lineup and bench are
// evaluated; no battle entities, purchases, selling, room state or future rolls.
export function boardAdvice(plan,pokemons,snapshot,{guide=null,synergies=[],items=[],teamRules={}}={}){
  const base={code:'waiting',field:[],bench:[],suggestion:null,liveSuggestion:null,planSuggestion:null,level:snapshot?.level??null,capacity:snapshot?.capacity??null,guideLevel:guide?.level??null};
  if(snapshot?.code==='off')return {...base,code:'off'};
  if(snapshot?.code==='scouting')return {...base,code:'scouting'};
  if(snapshot?.code!=='connected'||!Array.isArray(snapshot.board))return base;
  const catalog=new Map(pokemons.map(p=>[p.id,p])),equipment=new Map(items.map(i=>[i.id,i])),family=u=>catalog.get(u.pokemon)?.family??u.pokemon;
  const describe=u=>({...u,name:catalog.get(u.pokemon)?.name??u.pokemon,image:catalog.get(u.pokemon)?.image});
  const field=snapshot.board.filter(u=>u.y>0),bench=snapshot.board.filter(u=>u.y===0),state={...base,code:'steady',field:field.map(describe),bench:bench.map(describe),phase:snapshot.boardMode};
  const counts=u=>u.countsForTeam??(catalog.get(u.pokemon)?.passiveId!=='INANIMATE'&&!u.items.includes('GOLD_BOW'));
  const playable=u=>u.canPlace!==false&&u.pokemon!=='EGG'&&catalog.get(u.pokemon)?.kind==='pokemon'&&catalog.get(u.pokemon)?.passiveId!=='INANIMATE';
  const occupied=field.filter(counts).length;
  state.occupied=occupied;
  const cells=new Set();for(const u of snapshot.board){const cell=u.x+','+u.y;if(cells.has(cell))return {...state,code:'updating'};cells.add(cell);}
  if(snapshot.teamSize!==null&&snapshot.teamSize!==undefined&&snapshot.teamSize!==occupied)return {...state,code:'updating'};
  if(snapshot.boardMode==='town')return {...state,code:'town'};
  if(!['pick','battle'].includes(snapshot.boardMode))return {...state,code:'waiting-phase'};
  if(!Number.isInteger(snapshot.capacity)||snapshot.capacity<1||snapshot.capacity>24)return {...state,code:'waiting-capacity'};
  if(occupied>snapshot.capacity)return {...state,code:'over-capacity'};
  const finalCounts=new Map(),guideCounts=new Map(),affinity=new Set();
  for(const u of plan?.units??[]){const p=catalog.get(u.id),id=p?.family??u.id;finalCounts.set(id,(finalCounts.get(id)??0)+1);for(const t of p?.types??[])affinity.add(t);}
  for(const u of guide?.lineup??[]){const id=catalog.get(u.id)?.family??u.id;guideCounts.set(id,(guideCounts.get(id)??0)+1);}
  const data={teamRules,synergies,maps:{pokemons:catalog,synergies:new Map(synergies.map(s=>[s.id,s]))}};
  const traits=units=>teamSynergies({members:units.map(u=>({id:u.pokemon,items:u.items}))},data);
  const coverage=units=>{const n=new Map();for(const u of units)n.set(family(u),(n.get(family(u))??0)+1);let score=0;for(const [id,count]of n)score+=Math.min(count,finalCounts.get(id)??0)*80+Math.min(count,guideCounts.get(id)??0)*140;return score;};
  const range=u=>Math.max(1,(catalog.get(u.pokemon)?.stats?.range??1)+u.items.reduce((n,id)=>n+(equipment.get(id)?.stats?.RANGE??0),0));
  const power=u=>{const s=catalog.get(u.pokemon)?.stats??{};return ([0,35,115,260,420][u.stars]??0)+Math.min(80,(s.hp??0)/12+((s.atk??0)*(s.speed??0)/80)+((s.def??0)+(s.speDef??0))/2)+u.items.reduce((n,id)=>n+(equipment.get(id)?.categories?.includes('component')?8:55),0);};
  const value=(units,synergy)=>coverage(units)+units.reduce((n,u)=>n+power(u),0)+synergy.reduce((n,s)=>n+s.tier*100+(affinity.has(s.id)?Math.min(s.count,s.next??s.count)*3:0),0)+(units.length>=2&&units.some(u=>range(u)===1)?90:0);
  // The immediate comparison deliberately has no comp/guide coverage or type
  // affinity bonus. A useful bench unit need not belong to the planned team.
  const frontValue=units=>units.length<2?0:Math.min(60,Math.max(0,...units.filter(u=>range(u)===1).map(u=>{const s=catalog.get(u.pokemon)?.stats??{};return (s.hp??0)/3+(s.def??0)+(s.speDef??0);})));
  const liveValue=(units,synergy)=>units.reduce((n,u)=>n+power(u),0)+synergy.reduce((n,s)=>n+s.tier*100,0)+frontValue(units);
  const beforeTraits=traits(field),before=value(field,beforeTraits),beforeLive=liveValue(field,beforeTraits),beforeMap=new Map(beforeTraits.map(s=>[s.id,s]));
  const candidates=[],liveCandidates=[];let protectedItems=false,protectedStars=false;
  for(const incoming of bench.filter(playable)){
    if(field.length>=24)continue;
    // A non-counting unit can fill an empty cell without consuming capacity.
    const hasSpace=!counts(incoming)||occupied<snapshot.capacity;
    const outgoingOptions=hasSpace?[null]:field.filter(u=>playable(u)&&counts(u));
    for(const outgoing of outgoingOptions){
      const next=field.filter(u=>u!==outgoing).concat(incoming),projected=traits(next),afterMap=new Map(projected.map(s=>[s.id,s]));
      const gains=projected.filter(s=>s.tier>(beforeMap.get(s.id)?.tier??0)).map(s=>({id:s.id,from:beforeMap.get(s.id)?.count??0,to:s.count,tiers:s.tier-(beforeMap.get(s.id)?.tier??0)}));
      const losses=beforeTraits.filter(s=>s.tier>(afterMap.get(s.id)?.tier??0)).map(s=>({id:s.id,from:s.count,to:afterMap.get(s.id)?.count??0,tiers:s.tier-(afterMap.get(s.id)?.tier??0)}));
      const gained=gains.reduce((n,g)=>n+g.tiers,0),lost=losses.reduce((n,g)=>n+g.tiers,0),same=outgoing&&family(incoming)===family(outgoing);
      const delta=value(next,projected)-before,liveDelta=liveValue(next,projected)-beforeLive;
      if(outgoing){
        // Moving a unit to the bench does not transfer its equipment. Do not
        // empty an equipped holder in exchange for an unequipped replacement.
        if(outgoing.items.length>incoming.items.length){protectedItems=true;continue;}
        if(incoming.stars<outgoing.stars&&gained<=lost){protectedStars=true;continue;}
        if(outgoing.stars-incoming.stars>=2&&gained-lost<2){protectedStars=true;continue;}
      }
      const safeLoss=score=>lost<=gained||same||incoming.stars>(outgoing?.stars??0)&&score>=220;
      const towardPlan=coverage(next)>coverage(field)||(guideCounts.has(family(incoming))||finalCounts.has(family(incoming)))&&coverage(next)===coverage(field);
      const eligiblePlan=towardPlan&&(!outgoing||delta>=25)&&safeLoss(delta),eligibleLive=(!outgoing||liveDelta>=30)&&safeLoss(liveDelta);
      const move={incoming:describe(incoming),outgoing:outgoing?describe(outgoing):null,gains,losses,kind:outgoing?'swap':'add',nextPhase:snapshot.boardMode==='battle',sameFamily:!!same};
      if(eligibleLive){
        const reasons=[];
        if(!outgoing)reasons.push('Aproveita uma vaga livre com uma peça que você já tem.');
        else{
          if(incoming.stars>outgoing.stars)reasons.push(same?'Reforça a mesma família com mais estrelas.':'Mais estrelas que a peça atual.');
          if(gained>lost)reasons.push('Melhora os patamares de sinergia do campo atual.');
          if(power(incoming)-power(outgoing)>=25&&incoming.stars===outgoing.stars)reasons.push('Atributos base e equipamentos dão mais força estimada para esta vaga.');
          if(field.length>=2&&!field.some(u=>range(u)===1)&&next.some(u=>range(u)===1))reasons.push('Acrescenta uma opção de curto alcance ao campo.');
          if(!reasons.length)reasons.push('Melhor encaixe estimado entre as peças do campo e do banco.');
        }
        liveCandidates.push({...move,reasons,delta:liveDelta,source:'live',planTradeoff:coverage(next)<coverage(field)});
      }
      if(!eligiblePlan)continue;
      const reasons=[];
      if(!outgoing)reasons.push('Preenche uma vaga no campo.');
      if(same&&incoming.stars>outgoing.stars)reasons.push('Reforça a mesma família com mais estrelas.');
      else if(guideCounts.has(family(incoming)))reasons.push(finalCounts.has(family(incoming))?'Aproxima o campo da comp e do guia deste nível.':'Provisório indicado para este nível.');
      else if(finalCounts.has(family(incoming)))reasons.push('Peça da família de um destino final da comp.');
      else if(outgoing&&incoming.stars>outgoing.stars)reasons.push('Reforço provisório com mais estrelas.');
      candidates.push({...move,reasons,delta,source:'plan'});
    }
  }
  candidates.sort((a,b)=>b.delta-a.delta||a.incoming.key.localeCompare(b.incoming.key)||(a.outgoing?.key??'').localeCompare(b.outgoing?.key??''));
  liveCandidates.sort((a,b)=>b.delta-a.delta||a.incoming.key.localeCompare(b.incoming.key)||(a.outgoing?.key??'').localeCompare(b.outgoing?.key??''));
  const liveSuggestion=liveCandidates[0]??null,planSuggestion=candidates[0]??null,suggestion=liveSuggestion??planSuggestion;
  return {...state,occupied,code:suggestion?'suggested':bench.length?'steady':'no-bench',suggestion,liveSuggestion,planSuggestion,protectedItems,protectedStars};
}
