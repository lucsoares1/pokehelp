export function validShopSnapshot(value,pokemonIds){
  if(value==null)return null;
  if(!Number.isInteger(value.slots)||value.slots<1||value.slots>24||!Array.isArray(value.offers)||value.offers.length>value.slots)return null;
  const indices=new Set(),offers=[];
  for(const offer of value.offers){
    if(!Number.isInteger(offer.index)||offer.index<0||offer.index>=value.slots||indices.has(offer.index)||!pokemonIds.has(offer.pokemon))return null;
    indices.add(offer.index);offers.push({index:offer.index,pokemon:offer.pokemon});
  }
  return {slots:value.slots,offers};
}

export function shopTargets(config){
  const catalog=new Map(config.pokemons.map(p=>[p.id,p])),ready=new Set(config.obtained??[]);
  const ids=[...config.plan.units.filter(u=>!ready.has(u.slot)).map(u=>u.id),...(config.guide?.lineup??[]).filter(u=>u.temporary&&!u.obtained).map(u=>u.id)];
  return new Set(ids.map(id=>catalog.get(id)?.family??id));
}

export function recommendedShopOffers(config,shop){
  if(!shop)return [];
  const catalog=new Map(config.pokemons.map(p=>[p.id,p])),families=shopTargets(config);
  return shop.offers.filter(o=>families.has(catalog.get(o.pokemon)?.family??o.pokemon));
}
