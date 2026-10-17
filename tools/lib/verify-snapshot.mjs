import {readFile}from'node:fs/promises';
import {resolve,sep}from'node:path';
import {sha256}from'./source-reader.mjs';

export async function verifySnapshot(siteRoot,release,manifest) {
  async function checkedFile(base,relative,expected){
    const path=resolve(base,relative);if(!path.startsWith(base+sep))throw new Error('Caminho de snapshot inválido');
    let bytes;try{bytes=await readFile(path);}catch{throw new Error(`Snapshot incompleto: ${relative}`);}
    if(expected.bytes!=null&&bytes.length!==expected.bytes||sha256(bytes)!==expected.sha256)throw new Error(`Hash de snapshot inválido: ${relative}`);
  }
  for(const [file,record]of Object.entries(manifest.files))await checkedFile(release,file,record);
  const assets=JSON.parse(await readFile(resolve(release,'assets.json'),'utf8'));
  for(const asset of assets)if(asset.status==='available')await checkedFile(siteRoot,asset.path,asset);
  return assets;
}
