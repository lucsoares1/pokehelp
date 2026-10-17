import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const allowed = new Set(['https://pokemon-auto-chess.com','https://raw.githubusercontent.com']);

export function createSourceReader(cacheRoot, { refresh=false, fetcher=fetch }={}) {
  const sources=[];
  async function read(url, { maxBytes=8_000_000, format='text', immutable=false, maxAgeMs=3_600_000 }={}) {
    const parsed=new URL(url);
    if(!allowed.has(parsed.origin))throw new Error(`Origem não permitida: ${parsed.origin}`);
    const key=sha256(url), recordPath=resolve(cacheRoot,`${key}.json`);
    await mkdir(cacheRoot,{recursive:true});
    let previous;
    try{previous=JSON.parse(await readFile(recordPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
    const useCache=previous&&(immutable||(!refresh&&Date.now()-Date.parse(previous.fetchedAt)<maxAgeMs));
    let bytes, record;
    if(useCache){record=previous;bytes=await readFile(resolve(cacheRoot,record.sha256+'.raw'));}
    else {
      const headers={'User-Agent':'PokeChessHelper/0.2 (local public-data importer)'};
      if(previous?.etag)headers['If-None-Match']=previous.etag;
      if(previous?.lastModified)headers['If-Modified-Since']=previous.lastModified;
      const response=await fetcher(url,{headers,signal:AbortSignal.timeout(90_000),redirect:'error'});
      if(response.status===304&&previous){record={...previous,checkedAt:new Date().toISOString()};bytes=await readFile(resolve(cacheRoot,record.sha256+'.raw'));}
      else {
        if(!response.ok)throw new Error(`HTTP ${response.status}: ${url}`);
        if(Number(response.headers.get('content-length'))>maxBytes)throw new Error(`Fonte excede limite: ${url}`);
        const chunks=[];let length=0;
        for await(const chunk of response.body){length+=chunk.length;if(length>maxBytes)throw new Error(`Fonte excede limite: ${url}`);chunks.push(chunk);}
        bytes=Buffer.concat(chunks);
        record={url,sha256:sha256(bytes),bytes:length,fetchedAt:new Date().toISOString(),etag:response.headers.get('etag'),lastModified:response.headers.get('last-modified'),contentType:response.headers.get('content-type')};
        await writeFile(resolve(cacheRoot,record.sha256+'.raw'),bytes);
      }
      await writeFile(recordPath,JSON.stringify(record,null,2)+'\n');
    }
    if(bytes.length>maxBytes||sha256(bytes)!==record.sha256)throw new Error(`Cache inválido: ${url}`);
    sources.push(record);
    const text=bytes.toString('utf8');
    return format==='json'?JSON.parse(text):text;
  }
  return {read,sources};
}

export async function mapLimit(values, limit, fn) {
  let next=0;const results=new Array(values.length);
  // Aguarda todas as tarefas antes de propagar erro; não publica trabalho parcial.
  const workers=await Promise.allSettled(Array.from({length:Math.min(limit,values.length)},async()=>{
    while(next<values.length){const i=next++;results[i]=await fn(values[i],i);}
  }));
  const failure=workers.find(r=>r.status==='rejected');
  if(failure)throw failure.reason;
  return results;
}
