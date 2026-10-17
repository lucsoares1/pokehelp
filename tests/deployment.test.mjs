import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createDeploymentSnapshot,restoreDeploymentSnapshot} from '../tools/lib/deployment-snapshot.mjs';
import {sha256} from '../tools/lib/source-reader.mjs';
import {handleMessage,initialState,referenceKey,helperOrigin} from '../extension/protocol.mjs';
import vm from 'node:vm';

async function fixture(t){
  const root=await mkdtemp(resolve(tmpdir(),'pch-deployment-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const source=resolve(root,'source'),release=resolve(source,'data/releases/test-snapshot'),bundle=resolve(root,'snapshot.json.gz'),revision='a'.repeat(40),image=`assets/pac/${revision.slice(0,12)}/items/TEST.png`;
  const write=async(path,bytes)=>{await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);};
  const imageBytes=Buffer.from('public image'),assets=Buffer.from(JSON.stringify([{status:'available',path:image,bytes:imageBytes.length,sha256:sha256(imageBytes)}]));
  const data=Buffer.from('{"pokemons":[]}');
  await write(resolve(source,image),imageBytes);await write(resolve(release,'assets.json'),assets);await write(resolve(release,'catalog.json'),data);await write(resolve(release,'SOURCE-LICENSE.txt'),'Public source license');
  await write(resolve(release,'manifest.json'),JSON.stringify({id:'test-snapshot',revision,files:Object.fromEntries([['assets.json',assets],['catalog.json',data]].map(([path,bytes])=>[path,{bytes:bytes.length,sha256:sha256(bytes)}]))}));
  await write(resolve(source,'data/current.json'),JSON.stringify({schemaVersion:1,id:'test-snapshot',base:'data/releases/test-snapshot/'}));
  return {root,source,bundle,image};
}

test('build restaura dados, imagens e licença sem fontes locais ou acesso ao jogo',async t=>{
  const f=await fixture(t);await createDeploymentSnapshot(f.source,f.bundle);const first=await readFile(f.bundle);await createDeploymentSnapshot(f.source,f.bundle);assert.deepEqual(await readFile(f.bundle),first);
  await rm(f.source,{recursive:true});const out=resolve(f.root,'out'),result=await restoreDeploymentSnapshot(f.bundle,out);assert.equal(result.snapshotId,'test-snapshot');assert.equal(result.files,6);
  assert.equal(await readFile(resolve(out,f.image),'utf8'),'public image');assert.equal(await readFile(resolve(out,'data/releases/test-snapshot/SOURCE-LICENSE.txt'),'utf8'),'Public source license');
});

test('snapshot alterado ou caminho fora dos dados impede publicação',async t=>{
  const f=await fixture(t);await createDeploymentSnapshot(f.source,f.bundle);const original=JSON.parse(gunzipSync(await readFile(f.bundle)));
  for(const change of [bundle=>{bundle.files[0].data=Buffer.from('changed').toString('base64');},bundle=>{bundle.files[0].path='../outside.txt';},bundle=>{bundle.files[0].path='server.mjs';},bundle=>{bundle.files.push(bundle.files[0]);}]){
    const altered=structuredClone(original);change(altered);await writeFile(f.bundle,gzipSync(JSON.stringify(altered)));const out=resolve(f.root,'rejected');await assert.rejects(restoreDeploymentSnapshot(f.bundle,out));await assert.rejects(access(out));
  }
});

test('site público importa equipe no domínio exato e rejeita outros projetos Vercel',async()=>{
  const origin='https://pokehelp-one.vercel.app',selection={compId:'one',snapshotId:'test',variantIndex:0},plans={[referenceKey(selection)]:{units:[]}};let state=initialState();
  const env={id:'test',plans,snapshotId:'test',storage:{get:async()=>state,set:async next=>{state=next;}}};
  assert.equal(helperOrigin(origin+'/#compositions'),origin);
  await handleMessage({type:'PCH_IMPORT',selection},{id:'test',url:origin+'/',frameId:0},env);assert.equal(state.helperOrigin,origin);assert.deepEqual(state.selection,selection);
  for(const url of ['https://other.vercel.app/','https://pokehelp-one.vercel.app.evil.test/','http://pokehelp-one.vercel.app/','https://pokehelp-one.vercel.app/overlay.html']){
    assert.equal(helperOrigin(url),null);await assert.rejects(handleMessage({type:'PCH_IMPORT',selection},{id:'test',url,frameId:0},env));
  }
});

test('ponte do site público funciona somente na origem e quadro autorizados',async()=>{
  const source=await readFile(new URL('../extension/helper-bridge.js',import.meta.url),'utf8');
  for(const origin of ['https://pokehelp-one.vercel.app','https://other.vercel.app']){
    const events=[],calls=[],window={addEventListener:(type,fn)=>events.push(fn),postMessage(){}};
    vm.runInNewContext(source,{window,top:window,location:{origin,pathname:'/'},chrome:{runtime:{sendMessage:async message=>{calls.push(message);return {ok:true};}},storage:{onChanged:{addListener(){}}}}});
    if(origin.includes('other')){assert.equal(events.length,0);continue;}
    assert.equal(events.length,1);await events[0]({source:window,origin,data:{channel:'PCH_HELPER_REQUEST',type:'PCH_STATE',requestId:'test'}});assert.equal(calls.length,1);
    await events[0]({source:window,origin:'https://other.vercel.app',data:{channel:'PCH_HELPER_REQUEST',type:'PCH_STATE',requestId:'test'}});assert.equal(calls.length,1);
  }
});
