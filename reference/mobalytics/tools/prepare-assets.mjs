import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { champions, compositions } from '../data.js';
import { compositionDetails } from '../composition-details.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const assetRoot=resolve(root,'assets');
const cdn='https://cdn.mobalytics.gg/assets/';
let manifest=[];
try { manifest=JSON.parse(await readFile(resolve(root,'assets-manifest.json'),'utf8')).assets; } catch(error) { if(error.code!=='ENOENT')throw error; }
const fromUrl=url=>{
  const parsed=new URL(url);
  if(parsed.origin!=='https://cdn.mobalytics.gg'||!parsed.pathname.startsWith('/assets/'))throw new Error('Asset origin not allowed');
  const destination=resolve(assetRoot,decodeURIComponent(parsed.pathname.slice('/assets/'.length)));
  if(!destination.startsWith(assetRoot+sep))throw new Error('Invalid asset path');
  return destination;
};
if(process.argv[2]){
  const bundled=JSON.parse(await readFile(process.argv[2],'utf8'));
  for(const entry of bundled.assets){
    if(entry.kind!=='image'||!entry.url.startsWith(cdn))continue;
    const destination=fromUrl(entry.url);
    await mkdir(dirname(destination),{recursive:true});
    await copyFile(entry.path,destination);
    const file=destination.slice(root.length+1).replaceAll('\\','/');
    manifest=manifest.filter(m=>m.file!==file);
    manifest.push({source:entry.url,file,type:entry.contentType});
  }
}
const paths=new Set(['tft/images/page-background/tft-header-widget-bg.png','tft/images/rarity/cost-5.png','common/icons/tft-system/coin.svg',...champions.map(c=>`tft/images/champions/thumbnail/set18/${c.id}.png`),...champions.flatMap(c=>c.traits.map(([,id])=>`common/icons/tft-synergies-set18/24-${id}.svg`)),...compositions.map(c=>`tft/images/champions/team-comp-images/set18/${c.background}.png`),...champions.flatMap(c=>c.items.map(id=>`tft/images/game-items/set18/${id}.png`)),...compositions.flatMap(c=>c.units.flatMap(u=>u.items.map(id=>`tft/images/game-items/set18/${id}.png`)))]);
const tasks=[...paths].filter(path=>!manifest.some(m=>m.file===`assets/${path}`)).map(path=>({url:cdn+path,destination:fromUrl(cdn+path)}));
const detailPaths=new Set(['common/icons/star.svg','common/icons/system-icons/down-arrow.svg','common/icons/system-icons/right-arrow.svg','common/icons/system-icons/right-line-arrow.svg','common/icons/system-icons/16-share.svg','common/icons/system-icons/check.svg','common/icons/specific-icons/double-arrow-up.svg','common/icons/side-menu-icon/live-companion.svg','common/icons/social/facebook.svg','common/icons/social/twitter.svg','common/icons/social/youtube.svg','common/icons/social/instagram.svg']);
for(const [index,detail] of compositionDetails.entries()){
  detailPaths.add(`tft/images/champions/page-background/set18/${compositions[index].background}.png`);
  for(const [id,,badge] of detail.synergies){detailPaths.add(`common/icons/tft-synergies-set18/24-${id}.svg`);detailPaths.add(`tft/images/synergies-badges/${badge}.png`);}
  for(const id of detail.augments.flat())detailPaths.add(`tft/images/hextech-augments/set18/${id}.webp`);
  for(const id of detail.carousel)detailPaths.add(`tft/images/game-items/set18/${id}.png`);
  for(const [,,id] of detail.board)detailPaths.add(`tft/images/${['tree','lifebloom'].includes(id)?'summoned-units':'champions/icons'}/set18/${id}.png`);
}
for(const path of detailPaths)if(!manifest.some(m=>m.file===`assets/${path}`)&&!tasks.some(t=>t.url===cdn+path))tasks.push({url:cdn+path,destination:fromUrl(cdn+path)});
for(const family of ['roboto','oswald'])for(const weight of [400,500,700])if(!manifest.some(m=>m.file===`assets/fonts/${family}-${weight}.woff2`))tasks.push({url:`https://cdn.jsdelivr.net/fontsource/fonts/${family}@latest/latin-${weight}-normal.woff2`,destination:resolve(assetRoot,`fonts/${family}-${weight}.woff2`)});
let cursor=0;
await Promise.all(Array.from({length:4},async()=>{while(cursor<tasks.length){const task=tasks[cursor++];const response=await fetch(task.url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Asset ${response.status}: ${task.url}`);const bytes=Buffer.from(await response.arrayBuffer());const type=response.headers.get('content-type')||'';if(!/image\/|font\/|application\/(octet-stream|font|x-font)/.test(type))throw new Error(`Unexpected content type ${type}: ${task.url}`);await mkdir(dirname(task.destination),{recursive:true});await writeFile(task.destination,bytes);manifest.push({source:task.url,file:task.destination.slice(root.length+1).replaceAll('\\','/'),type});}}));
manifest.sort((a,b)=>a.file.localeCompare(b.file));
for(const entry of manifest){const bytes=await readFile(resolve(root,entry.file));entry.bytes=bytes.length;entry.sha256=createHash('sha256').update(bytes).digest('hex');}
await writeFile(resolve(root,'assets-manifest.json'),JSON.stringify({page:'https://mobalytics.gg/tft?int_source=homepage&int_medium=mainbutton',capturedAt:'2026-10-15',purpose:'Local visual reference for PokeChess Helper; not an official Mobalytics site.',assets:manifest},null,2)+'\n');
console.log(JSON.stringify({assets:manifest.length,location:assetRoot}));
