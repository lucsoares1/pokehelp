import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {UI_ICON_FILES} from '../site/lib/ui-icons.mjs';
const version='1.57.0',root=resolve(import.meta.dirname,'../site/assets/icons/lucide');
await mkdir(root,{recursive:true});
const sources=await Promise.all([...UI_ICON_FILES.map(path=>path.split('/').at(-1)),'LICENSE'].map(async name=>{
  const url=`https://unpkg.com/lucide-static@${version}/${name==='LICENSE'?'LICENSE':'icons/'+name}`;
  const response=await fetch(url);if(!response.ok)throw new Error(`${name}: ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(name.endsWith('.svg')&&(!bytes.toString().includes('<svg')||/<script|<foreignObject|\bon\w+=|https?:\/\//i.test(bytes.toString().replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"/,''))))throw new Error('SVG não permitido: '+name);
  await writeFile(resolve(root,name),bytes);
  return {name,url,sha256:createHash('sha256').update(bytes).digest('hex')};
}));
await writeFile(resolve(root,'SOURCE.json'),JSON.stringify({package:'lucide-static',version,license:'ISC; includes Feather MIT notices in LICENSE',sources},null,2)+'\n');
console.log(`${UI_ICON_FILES.length} SVGs locais Lucide ${version}, com licença e hashes.`);
