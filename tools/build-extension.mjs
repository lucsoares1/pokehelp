import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {createOverlayPlan,selectionKey} from '../site/lib/overlay-model.mjs';
import {UI_ICON_FILES} from '../site/lib/ui-icons.mjs';
import {variantsFor} from '../site/lib/composition-model.mjs';
const workspace=resolve(import.meta.dirname,'..'),site=resolve(workspace,'site'),out=resolve(workspace,'extension/dist');
const read=async path=>JSON.parse(await readFile(resolve(site,path),'utf8'));
const pointer=await read('data/current.json'),base=pointer.base;
const [manifest,pokemons,items,synergies,compositions,teamRules,progression]=await Promise.all(['manifest.json','catalog/pokemons.json','catalog/items.json','catalog/synergies.json','compositions.json','catalog/team-rules.json','catalog/progression.json'].map(p=>read(base+p)));
const data={manifest,pokemons,items,synergies,compositions,teamRules,maps:{pokemons:new Map(pokemons.map(p=>[p.id,p])),items:new Map(items.map(i=>[i.id,i])),synergies:new Map(synergies.map(s=>[s.id,s]))}};
const plans=Object.create(null),assets=new Set(['assets/brand/logo.png',...UI_ICON_FILES]);
function images(value){if(!value||typeof value!=='object')return;for(const [key,item] of Object.entries(value)){if(key==='image'&&typeof item==='string'){if(!/^assets\/(pac|brand)\/[\w./-]+$/.test(item)||item.includes('..'))throw new Error('Caminho de imagem não permitido.');assets.add(item);}else images(item);}}
for(const comp of compositions)for(const v of variantsFor(comp)){const plan=createOverlayPlan(comp,data,v.index,progression);plans[selectionKey(plan.selection)]=plan;images(plan);}
const guidePokemons=pokemons.map(p=>Object.fromEntries(['id','name','image','rarity','rarityLabel','kind','stars','abilityId','passiveId','regional','additional','variant','types','family','stats'].map(key=>[key,p[key]])));
for(const p of guidePokemons){
  const detail=await read(base+'pokemon/'+p.id+'.json'),text=detail.ability?.description??'';
  p.abilityProfile={scalesAP:/poder de habilidade|ability power|\bAP\b/i.test(text),specialDamage:/dano especial|special damage/i.test(text),healing:/cura|heals?|restaura.*(?:PV|HP)|restore.*(?:PV|HP)/i.test(text)};
}
images(guidePokemons);images(synergies);images(items);
const files=new Map();
async function put(path,bytes){const absolute=resolve(out,path);if(!absolute.startsWith(out+'\\')&&!absolute.startsWith(out+'/'))throw new Error('Destino fora do pacote.');await mkdir(dirname(absolute),{recursive:true});await writeFile(absolute,bytes);files.set(path,Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes));}
async function copy(from,path){await put(path,await readFile(from));}
for(const file of ['manifest.json','protocol.mjs','background.mjs','helper-bridge.js','game.js','game-ui.js','shop-model.mjs','shop-read-model.mjs','shop-planner.js','shop.css','items-native.js','planner-notify.js','item-assist.js','item-model.mjs','item-view.mjs','portal-model.mjs','holder-model.mjs','wand-model.mjs'])await copy(resolve(workspace,'extension',file),file);
await put('choice-model.mjs',(await readFile(resolve(workspace,'extension/choice-model.mjs'),'utf8')).replace("'../site/lib/composition-model.mjs'","'./overlay/lib/composition-model.mjs'"));
await put('board-model.mjs',(await readFile(resolve(workspace,'extension/board-model.mjs'),'utf8')).replace("'../site/lib/composition-model.mjs'","'./overlay/lib/composition-model.mjs'"));
await copy(resolve(workspace,'extension/board-view.mjs'),'board-view.mjs');
await put('shop-context.mjs',(await readFile(resolve(workspace,'extension/shop-context.mjs'),'utf8')).replace("'../site/lib/overlay-guide.mjs'","'./overlay/lib/overlay-guide.mjs'"));
await copy(resolve(workspace,'extension/assets/shop-buy.svg'),'assets/shop-buy.svg');
for(const file of ['panel.html','panel.mjs','panel.css','panel-layout.mjs','item-tooltip.mjs'])await copy(resolve(workspace,'extension',file),'overlay/'+(file==='panel.html'?'index.html':file));
await copy(resolve(workspace,'extension/diagnostic-view.mjs'),'diagnostic-view.mjs');
for(const file of ['styles.css','composition-teams.css','theme.css','overlay.css','lib/overlay-view.mjs','lib/overlay-guide.mjs','lib/leveling-model.mjs','lib/progression-planner.mjs','lib/progression-change-view.mjs','lib/ui-icons.mjs','lib/composition-model.mjs','lib/view-primitives.mjs','lib/content.mjs'])await copy(resolve(site,file),'overlay/'+file);
for(const file of await readdir(resolve(site,'assets/fonts')))await copy(resolve(site,'assets/fonts',file),'overlay/assets/fonts/'+file);
for(const name of ['LICENSE','SOURCE.json'])await copy(resolve(site,'assets/icons/lucide',name),'overlay/assets/icons/lucide/'+name);
for(const asset of assets)await copy(resolve(site,asset),'overlay/'+asset);
await put('overlay/plans.json',JSON.stringify({schemaVersion:1,snapshotId:manifest.id,gameVersion:manifest.gameVersion,plans,guide:{pokemons:guidePokemons,rules:progression,synergies,items:items.map(i=>({id:i.id,name:i.name,image:i.image,components:i.components,categories:i.categories,stats:i.stats,holdable:i.holdable,consumable:i.consumable,removable:i.removable})),teamRules}}));
const metadata={schemaVersion:1,snapshotId:manifest.id,teams:Object.keys(plans).length,resources:[...files].map(([path,bytes])=>({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}))};
await put('build.json',JSON.stringify(metadata,null,2)+'\n');
// ZIP using standard Node modules: UTF-8 paths, DEFLATE, fixed dates, no shell/dependency.
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let n=0;n<8;n++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
const chunks=[],central=[];let offset=0;
for(const [path,bytes] of [...files].sort(([a],[b])=>a.localeCompare(b))){
  const name=Buffer.from(path.replaceAll('\\','/')),compressed=deflateRawSync(bytes),crc=crc32(bytes),local=Buffer.alloc(30),record=Buffer.alloc(46);
  local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(name.length,26);
  record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(8,10);record.writeUInt16LE(33,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(compressed.length,20);record.writeUInt32LE(bytes.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);
  chunks.push(local,name,compressed);central.push(record,name);offset+=local.length+name.length+compressed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
await mkdir(resolve(site,'downloads'),{recursive:true});const zip=Buffer.concat([...chunks,directory,end]);await writeFile(resolve(site,'downloads/pokechess-overlay.zip'),zip);
console.log(`Extensão: ${relative(workspace,out)} · ${Object.keys(plans).length} equipes · ${assets.size} imagens · ZIP ${(zip.length/1024/1024).toFixed(2)} MB · snapshot ${manifest.id}`);
