import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';

test('servidor transmite MP4 por intervalos, HEAD e rejeita intervalos inválidos',async()=>{
  const server=spawn(process.execPath,['site/server.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  try{
    const address=await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(Error('Servidor não iniciou')),5000);
      server.once('error',reject);server.once('exit',code=>reject(Error('Servidor saiu: '+code)));
      server.stdout.on('data',chunk=>{const match=/http:\/\/127\.0\.0\.1:\d+/.exec(String(chunk));if(match){clearTimeout(timeout);resolve(match[0]);}});
    });
    const url=address+'/assets/presentation/banner.mp4',source=await readFile('site/assets/presentation/banner.mp4');
    const head=await fetch(url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'video/mp4');assert.equal(head.headers.get('accept-ranges'),'bytes');assert.equal(Number(head.headers.get('content-length')),source.length);
    for(const range of ['bytes=0-31','bytes=-32',`bytes=${source.length-32}-`]){
      const response=await fetch(url,{headers:{Range:range}});assert.equal(response.status,206);
      const bytes=Buffer.from(await response.arrayBuffer());assert.deepEqual(bytes,range==='bytes=0-31'?source.subarray(0,32):source.subarray(-32));
    }
    for(const range of ['bytes=9-2','bytes=-',`bytes=${source.length}-`])assert.equal((await fetch(url,{headers:{Range:range}})).status,416);
  }finally{server.kill();await once(server,'exit');}
});
