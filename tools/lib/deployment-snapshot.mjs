import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {sha256,mapLimit} from './source-reader.mjs';
import {verifySnapshot} from './verify-snapshot.mjs';

const validId=id=>typeof id==='string'&&/^[\w.-]{1,100}$/.test(id)&&!id.includes('..');
function destination(root,path,id,revision){
  if(typeof path!=='string'||path.includes('\\')||path.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error('Caminho de publicação inválido');
  if(path!=='data/current.json'&&!path.startsWith(`data/releases/${id}/`)&&!path.startsWith(`assets/pac/${revision.slice(0,12)}/`))throw new Error('Arquivo fora do snapshot de publicação');
  const target=resolve(root,path);if(!target.startsWith(resolve(root)+sep))throw new Error('Arquivo fora do destino');return target;
}

// Public, reviewed data and images only. Deployment never contacts the game or
// silently changes patch/comp IDs; the website and extension share this snapshot.
export async function createDeploymentSnapshot(siteRoot,bundleFile){
  const pointer=JSON.parse(await readFile(resolve(siteRoot,'data/current.json'),'utf8'));
  if(!validId(pointer.id)||pointer.base!==`data/releases/${pointer.id}/`)throw new Error('Ponteiro de publicação inválido');
  const release=resolve(siteRoot,pointer.base),manifest=JSON.parse(await readFile(resolve(release,'manifest.json'),'utf8'));
  if(manifest.id!==pointer.id||!/^[a-f0-9]{40}$/.test(manifest.revision))throw new Error('Manifesto de publicação inválido');
  const assets=await verifySnapshot(siteRoot,release,manifest);
  const paths=[...new Set(['data/current.json',...['manifest.json','SOURCE-LICENSE.txt',...Object.keys(manifest.files)].map(p=>pointer.base+p),...assets.filter(a=>a.status==='available').map(a=>a.path)])].sort();
  const files=await mapLimit(paths,12,async path=>{const bytes=await readFile(destination(siteRoot,path,pointer.id,manifest.revision));return {path,bytes:bytes.length,sha256:sha256(bytes),data:bytes.toString('base64')};});
  const bundle={schemaVersion:1,snapshotId:pointer.id,revision:manifest.revision,files};
  const compressed=gzipSync(JSON.stringify(bundle),{level:9});
  await mkdir(dirname(bundleFile),{recursive:true});await writeFile(bundleFile,compressed);
  return {snapshotId:pointer.id,files:files.length,bytes:compressed.length,sha256:sha256(compressed)};
}

export async function restoreDeploymentSnapshot(bundleFile,siteRoot){
  const bundle=JSON.parse(gunzipSync(await readFile(bundleFile),{maxOutputLength:128*1024*1024}));
  if(bundle.schemaVersion!==1||!validId(bundle.snapshotId)||!/^[a-f0-9]{40}$/.test(bundle.revision)||!Array.isArray(bundle.files)||bundle.files.length>10000)throw new Error('Pacote de publicação inválido');
  const seen=new Set(),files=bundle.files.map(file=>{
    const path=destination(siteRoot,file.path,bundle.snapshotId,bundle.revision);
    if(seen.has(path)||typeof file.data!=='string')throw new Error('Arquivo de publicação duplicado ou inválido');seen.add(path);
    const bytes=Buffer.from(file.data,'base64');
    if(bytes.length!==file.bytes||sha256(bytes)!==file.sha256)throw new Error(`Hash de publicação inválido: ${file.path}`);
    return {path,bytes};
  });
  await mapLimit(files,12,async({path,bytes})=>{await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);});
  const pointer=JSON.parse(await readFile(resolve(siteRoot,'data/current.json'),'utf8'));
  if(pointer.id!==bundle.snapshotId||pointer.base!==`data/releases/${bundle.snapshotId}/`)throw new Error('Snapshot de publicação inconsistente');
  const release=resolve(siteRoot,pointer.base),manifest=JSON.parse(await readFile(resolve(release,'manifest.json'),'utf8'));
  if(manifest.id!==pointer.id||manifest.revision!==bundle.revision)throw new Error('Manifesto de publicação inconsistente');
  await verifySnapshot(siteRoot,release,manifest);
  return {snapshotId:pointer.id,revision:bundle.revision,files:files.length};
}
