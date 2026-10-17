import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sha256 } from './source-reader.mjs';

export async function writeJson(path,value) {await mkdir(dirname(path),{recursive:true});const bytes=JSON.stringify(value);await writeFile(path,bytes+'\n');return {bytes:Buffer.byteLength(bytes)+1,sha256:sha256(bytes+'\n')};}

export async function publishSnapshot({siteRoot,stageRoot,id,manifest}) {
  const directory=resolve(siteRoot,'data/releases',id);await mkdir(dirname(directory),{recursive:true});
  await rename(stageRoot,directory);
  // Um único ponteiro muda após todos os arquivos estarem disponíveis.
  const pointer=resolve(siteRoot,'data/current.json'),temporary=pointer+'.tmp';
  await writeJson(temporary,{schemaVersion:1,id,base:`data/releases/${id}/`,manifest:'manifest.json',version:manifest.gameVersion});
  await rename(temporary,pointer);
  return JSON.parse(await readFile(pointer,'utf8'));
}
