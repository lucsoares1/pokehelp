import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {artworkById} from '../site/lib/presentation.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../site');
const revision='ba403973fdf9d0ac59175813861e6a1f8ed5020c';
const jobs=[...Object.entries(artworkById).map(([id,dex])=>({id,path:`assets/presentation/pokemon/${dex}.png`,source:`https://raw.githubusercontent.com/PokeAPI/sprites/${revision}/sprites/pokemon/other/official-artwork/${dex}.png`,credit:'Pokémon / Nintendo / Creatures / GAME FREAK; arquivo distribuído pelo repositório PokeAPI/sprites.'})),
  {id:'nunito-latin',path:'assets/fonts/nunito-latin.woff2',source:'https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKofINeaB.woff2',credit:'The Nunito Project Authors, SIL Open Font License 1.1.'},
  {id:'nunito-latin-ext',path:'assets/fonts/nunito-latin-ext.woff2',source:'https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKofIO-aBXso.woff2',credit:'The Nunito Project Authors, SIL Open Font License 1.1.'},
  {id:'nunito-license',path:'assets/fonts/Nunito-OFL.txt',source:'https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/OFL.txt',credit:'The Nunito Project Authors.'}];
const records=[];
for(const job of jobs){
  const response=await fetch(job.source,{signal:AbortSignal.timeout(30000),redirect:'error'});
  if(!response.ok)throw new Error(`HTTP ${response.status}: ${job.id}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length>1_500_000)throw new Error('Recurso de apresentação excede limite');
  if(job.path.endsWith('.png')&&!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('PNG inválido: '+job.id);
  if(job.path.endsWith('.woff2')&&bytes.toString('ascii',0,4)!=='wOF2')throw new Error('Fonte inválida');
  const dest=resolve(root,job.path);await mkdir(dirname(dest),{recursive:true});await writeFile(dest,bytes);
  records.push({...job,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(resolve(root,'assets/presentation/manifest.json'),JSON.stringify({revision,policy:'Recursos visuais de apresentação separados dos snapshots mecânicos. Nenhuma ilustração é usada para outra forma do Pokémon.',records},null,2)+'\n');
console.log(`${records.length} recursos locais; ${records.reduce((sum,r)=>sum+r.bytes,0)} bytes.`);
