async function json(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(15_000),cache:'no-cache'});
  if(!response.ok)throw new Error(`Não foi possível carregar estes dados (${response.status}). Recarregue a página.`);
  return response.json();
}

export async function loadGameData(snapshotId=null) {
  if(snapshotId&&!/^[\w.-]+$/.test(snapshotId))throw new Error('Snapshot inválido');
  const pointer=snapshotId?{schemaVersion:1,id:snapshotId,base:`data/releases/${snapshotId}/`}:await json('data/current.json');
  if(pointer.schemaVersion!==1||!/^data\/releases\/[\w.-]+\/$/.test(pointer.base))throw new Error('Versão de dados não suportada');
  const read=path=>json(pointer.base+path);
  const manifest=await read('manifest.json');
  if(manifest.schemaVersion!==1||manifest.id!==pointer.id)throw new Error('Snapshot inconsistente');
  const [pokemons,items,synergies,compositions]=await Promise.all(['catalog/pokemons.json','catalog/items.json','catalog/synergies.json','compositions.json'].map(read));
  const teamRules=manifest.files['catalog/team-rules.json']?await read('catalog/team-rules.json'):null;
  const cache=new Map();
  const cached=path=>{
    if(!cache.has(path))cache.set(path,read(path).catch(error=>{cache.delete(path);throw error;}));
    return cache.get(path);
  };
  const maps={pokemons:new Map(pokemons.map(p=>[p.id,p])),items:new Map(items.map(i=>[i.id,i])),synergies:new Map(synergies.map(s=>[s.id,s]))};
  return {pointer,manifest,pokemons,items,synergies,compositions,maps,teamRules,
    pokemon:id=>maps.pokemons.has(id)?cached(`pokemon/${id}.json`):Promise.reject(new Error('Pokémon não encontrado')),
    report:tier=>Object.hasOwn(manifest.tiers,tier)?cached(`reports/${tier}.json`):Promise.reject(new Error('Faixa não encontrada')),
    quality:()=>cached('quality.json'),
    progression:()=>manifest.files['catalog/progression.json']?cached('catalog/progression.json'):Promise.resolve(null),
    history:(tier,kind)=>Object.hasOwn(manifest.tiers,tier)&&['items','pokemons'].includes(kind)?cached(`history/${tier}-${kind}.json`):Promise.reject(new Error('Histórico não encontrado'))
  };
}
