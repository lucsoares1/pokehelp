export {rankWandRewards} from './wand-model.mjs';
import {teamSynergies} from '../site/lib/composition-model.mjs';

// Evaluate the visible offer if added to the preparation field. This does not
// assume a free slot or choose which existing unit the player should remove.
export function fieldSynergies(context,snapshot){
  const {pokemons=[],synergies=[],guide,teamRules={}}=context,catalog=new Map(pokemons.map(p=>[p.id,p]));
  const live=snapshot?.code==='connected'&&Array.isArray(snapshot.board),source=live?'live':guide?'guide':'unavailable';
  const members=live?snapshot.board.filter(u=>u.y>0).map(u=>({id:u.pokemon,items:u.items})):(guide?.lineup??[]).map(u=>({id:u.id,items:[]}));
  const data={teamRules,synergies,maps:{pokemons:catalog,synergies:new Map(synergies.map(s=>[s.id,s]))}},current=teamSynergies({members},data);
  return {source,members,data,catalog,current};
}

export function rankPokemonRewards(context,snapshot,offers){
  const {plan}=context,{source,members,data,catalog,current}=fieldSynergies(context,snapshot),counts=new Map(current.map(s=>[s.id,s]));
  const ready=new Set(context.obtained??[]),pending=new Set((plan?.units??[]).filter(u=>!ready.has(u.slot)).map(u=>catalog.get(u.id)?.family??u.id)),affinity=new Map();
  for(const u of plan?.units??[])for(const type of catalog.get(u.id)?.types??[])affinity.set(type,(affinity.get(type)??0)+1);
  return offers.map((offer,order)=>{
    const p=catalog.get(offer.pokemon),types=p?.types??offer.types??[],wanted=p?pending.has(p.family??p.id):offer.pokemonWanted===true;
    const projected=p&&source!=='unavailable'?teamSynergies({members:[...members,{id:p.id,items:[]}]},data):[];
    const gains=projected.filter(s=>s.tier>(counts.get(s.id)?.tier??0)).map(s=>({id:s.id,from:counts.get(s.id)?.count??0,to:s.count}));
    const active=types.filter(id=>counts.get(id)?.active),fit=types.reduce((n,id)=>n+(affinity.get(id)??0),0);
    const score=(wanted?10000:0)+gains.length*400+active.length*40+fit*30;
    return {...offer,order,wanted,gains,active,fit,source,score};
  }).filter(o=>o.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
}
