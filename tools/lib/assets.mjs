import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { mapLimit, sha256 } from './source-reader.mjs';
import {staticModule} from './static-typescript.mjs';

export function readPortraitFallbacks(source) {
  const fallbacks=staticModule(source).get('PORTRAITS_FALLBACKS');
  if(!fallbacks||Array.isArray(fallbacks)||typeof fallbacks!=='object')throw new Error('Mapa de retratos inválido');
  for(const [index,target]of Object.entries(fallbacks)){
    if(!/^\d{4}(?:-\d{4})*$/.test(index)||typeof target!=='string'||!/^\d{4}(?:-\d{4})*$/.test(target)||index===target||Object.hasOwn(fallbacks,target))throw new Error('Redirecionamento de retrato inválido: '+index);
  }
  return fallbacks;
}

export async function cacheAssets(catalog,lock,siteRoot,portraitSource) {
  const fallbacks=readPortraitFallbacks(portraitSource),indexes=new Set(catalog.pokemons.map(p=>p.index));
  for(const target of Object.values(fallbacks))if(!indexes.has(target))throw new Error('Retrato de destino fora do catálogo: '+target);
  const prefix=`https://raw.githubusercontent.com/${lock.repository}/${lock.revision}/app/public/src/assets/`;
  const jobs=[...catalog.pokemons.map(p=>{const index=fallbacks[p.index]??p.index;return {entity:p,path:p.image,url:prefix+`portraits/${index.replaceAll('-','/')}/Normal.png`,...(index!==p.index?{portraitFallback:{from:p.index,to:index}}:{})};}),...catalog.items.map(i=>({entity:i,path:i.image,url:prefix+`item%7Btps%7D/${i.id}.png`})),...catalog.synergies.map(s=>({entity:s,path:s.image,url:prefix+`types/${s.id}.svg`}))];
  jobs.push({entity:{id:'patch-poster'},path:`assets/pac/${lock.revision.slice(0,12)}/poster.png`,url:prefix+`posters/${lock.gameVersion.split('.').slice(0,2).join('.')}.png`});
  const assets=await mapLimit(jobs,4,async(job)=>{
    const destination=resolve(siteRoot,job.path);
    const missingRecord=resolve(siteRoot,'../.cache/assets-missing',sha256(job.url)+'.json');
    try{await readFile(missingRecord);job.entity.image='assets/pac/unavailable.svg';return {entity:job.entity.id,url:job.url,path:null,status:'missing'};}catch(error){if(error.code!=='ENOENT')throw error;}
    let bytes;
    try{bytes=await readFile(destination);}catch(error){if(error.code!=='ENOENT')throw error;}
    if(!bytes){
      const response=await fetch(job.url,{signal:AbortSignal.timeout(30_000),redirect:'error'});
      if(response.status===404){await mkdir(dirname(missingRecord),{recursive:true});await writeFile(missingRecord,JSON.stringify({url:job.url,status:404}));job.entity.image='assets/pac/unavailable.svg';return {entity:job.entity.id,url:job.url,path:null,status:'missing'};}
      if(!response.ok)throw new Error(`Imagem HTTP ${response.status}: ${job.url}`);
      bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length>2_000_000)throw new Error('Imagem excede limite');
      const svg=job.path.endsWith('.svg');
      if(svg?!bytes.toString('utf8').includes('<svg'):!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error(`Formato de imagem inválido: ${job.path}`);
      await mkdir(dirname(destination),{recursive:true});await writeFile(destination,bytes);
    }
    return {entity:job.entity.id,url:job.url,path:job.path,bytes:bytes.length,sha256:sha256(bytes),status:'available',...(job.portraitFallback?{portraitFallback:job.portraitFallback}:{}),credit:'Pokémon Auto Chess / autores dos recursos; ver créditos da revisão',license:'Direitos dos recursos devem ser verificados individualmente'};
  });
  if(assets.filter(a=>a.status==='missing').length>jobs.length*.05)throw new Error('Mais de 5% dos recursos estão ausentes; importação interrompida: '+JSON.stringify(assets.filter(a=>a.status==='missing').slice(0,10)));
  return assets;
}
