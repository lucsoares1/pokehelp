import {cp,rm,readFile,stat} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {restoreDeploymentSnapshot} from './lib/deployment-snapshot.mjs';

const root=resolve(import.meta.dirname,'..'),source=resolve(root,'site'),out=resolve(root,'dist');
// Only the dedicated generated directory can be removed; never the source site.
if(relative(root,out)!=='dist')throw new Error('Destino de build inválido');
await rm(out,{recursive:true,force:true});
const excluded=['server.mjs','README.md','data/current.json','data/releases','assets/pac','downloads'];
await cp(source,out,{recursive:true,filter:path=>{const name=relative(source,path).replaceAll('\\','/');return !excluded.some(p=>name===p||name.startsWith(p+'/'));}});
const snapshot=await restoreDeploymentSnapshot(resolve(root,'data/deployment/site-snapshot.json.gz'),out);
const lock=JSON.parse(await readFile(resolve(root,'data/source-lock.json'),'utf8'));
if(snapshot.revision!==lock.revision)throw new Error('Atualize deploy:snapshot após revisar a revisão de dados');
const build=spawnSync(process.execPath,[resolve(root,'tools/build-extension.mjs')],{cwd:root,stdio:'inherit',env:{...process.env,PCH_BUILD_SITE_ROOT:out,PCH_BUILD_EXTENSION_OUT:resolve(root,'.cache/deployment-extension')}});
if(build.status!==0)throw new Error('Não foi possível gerar o download da extensão');
for(const file of ['index.html','main.mjs','styles.css','data/current.json','downloads/pokechess-overlay.zip'])if(!(await stat(resolve(out,file))).isFile())throw new Error(`Build incompleto: ${file}`);
console.log(`Site estático pronto em dist · snapshot ${snapshot.snapshotId} · sem servidor local ou importação pela rede.`);
