// Portal symbols bias a random offer; they never identify a guaranteed Pokémon.
export function createPortalContext(plan,pokemons,rules={},obtained=[]){
  const catalog=new Map(pokemons.map(p=>[p.id,p])),ready=new Set(obtained),affinity=new Map(),goals=[];
  for(const [slot,unit]of (plan?.units??[]).entries()){
    const pokemon=catalog.get(unit.id);
    for(const type of new Set(pokemon?.types??[]))affinity.set(type,(affinity.get(type)||0)+1);
    if(ready.has(slot))continue;
    const route=rules.acquisition?.[unit.id],base=catalog.get(route?.baseId);
    if(base&&['shop','unique','legendary'].includes(route.method))goals.push({name:unit.name,label:base.id===unit.id?unit.name:`${base.name} (para ${unit.name})`,id:unit.id,method:route.method,rarity:route.rarity,types:[...new Set(base.types??[])]});
  }
  return {goals,affinity:[...affinity].map(([id,count])=>({id,count}))};
}

export function rankPortalOffers(context,portals,stage,current=[]){
  const method=stage===0?'shop':stage===10?'unique':stage===20?'legendary':null;
  const goals=(context?.goals??[]).filter(g=>g.method===method&&(stage!==0||g.rarity==='COMMON'));
  const affinity=new Map((context?.affinity??[]).map(t=>[t.id,t.count]));
  return (portals??[]).map((portal,order)=>{
    const targets=goals.filter(g=>portal.types.some(type=>g.types.includes(type)));
    const hits=targets.reduce((n,g)=>n+portal.types.filter(type=>g.types.includes(type)).length,0);
    const fit=portal.types.reduce((n,type)=>n+(affinity.get(type)||0),0);
    const support=current.filter(s=>portal.types.includes(s.id)&&(s.active||s.next===s.count+1));
    const currentFit=support.reduce((n,s)=>n+(s.next===s.count+1?4:2),0);
    return {...portal,order,targets,support:support.map(s=>({id:s.id,count:s.count,next:s.next})),score:targets.length*1000+hits*100+fit+currentFit,method,stageKnown:method!==null};
  }).filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
}
