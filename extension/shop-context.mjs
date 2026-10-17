import {createOverlayGuide} from '../site/lib/overlay-guide.mjs';

// Reuse the same progression calculation as the displayed guide; never accumulate past steps.
export function createShopGuide(source){
  if(!source?.rules||!Array.isArray(source.pokemons)||!Array.isArray(source.synergies)||!Array.isArray(source.items))throw new Error('Guia de níveis indisponível no pacote da extensão.');
  const data={...source,maps:{pokemons:new Map(source.pokemons.map(p=>[p.id,p])),synergies:new Map(source.synergies.map(s=>[s.id,s])),items:new Map(source.items.map(i=>[i.id,i]))}};
  return (plan,state)=>createOverlayGuide(plan,data,source.rules,state);
}
