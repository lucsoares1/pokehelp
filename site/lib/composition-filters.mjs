import {normalizeSearch} from './content.mjs';
import {variantsFor,teamSynergies} from './composition-model.mjs';

// Presentation focus: most equipped member, with source order breaking ties.
export function featuredMember(team) {
  return team?.members.reduce((best,member,index)=>!best||member.items.length>best.items.length?{...member,index}:best,null)??null;
}

export function primarySynergies(comp) {
  const maximum=Math.max(0,...comp.synergies.map(s=>s.count));
  return comp.synergies.filter(s=>s.count===maximum).map(s=>s.id);
}

export function matchingVariants(comp,data,{synergy='',synergyScope='primary',pokemon='',pokemonScope='any'}={}) {
  if(synergy&&synergyScope==='primary'&&!primarySynergies(comp).includes(synergy))return [];
  const term=normalizeSearch(pokemon.trim());
  return variantsFor(comp).filter(team=>{
    if(synergy&&synergyScope==='active'&&!teamSynergies(team,data).some(s=>s.id===synergy&&s.active))return false;
    const members=pokemonScope==='featured'?[featuredMember(team)].filter(Boolean):team.members;
    return !term||members.some(m=>{const p=data.maps.pokemons.get(m.id);return normalizeSearch(`${p?.name??''} ${m.id}`).includes(term);});
  });
}

export function filterCompositions(comps,data,filters={}) {
  const entries=comps.map(comp=>({comp,variants:matchingVariants(comp,data,filters)})).filter(entry=>entry.variants.length);
  const value=(c,key)=>Number.isFinite(c[key])?c[key]:null;
  const compare=(a,b,key,direction)=>{
    const x=value(a.comp,key),y=value(b.comp,key);
    return x===null?y===null?0:1:y===null?-1:(x-y)*direction;
  };
  if(filters.sort==='wins')entries.sort((a,b)=>compare(a,b,'winRatePercent',-1));
  else if(filters.sort==='count')entries.sort((a,b)=>compare(a,b,'count',-1));
  else if(filters.sort==='place')entries.sort((a,b)=>compare(a,b,'meanPlace',1));
  return entries;
}
