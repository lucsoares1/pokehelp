import {readdir}from'node:fs/promises';
import {resolve}from'node:path';
import {spawnSync}from'node:child_process';
let count=0;
async function check(directory){for(const file of await readdir(directory,{withFileTypes:true})){
  if(['assets','data','node_modules','dist'].includes(file.name))continue;
  const path=resolve(directory,file.name);
  if(file.isDirectory())await check(path);
  else if(/\.(mjs|js)$/.test(file.name)){const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status)throw new Error(result.stderr);count++;}
}}
for(const directory of ['site','tools','tests','extension'])await check(directory);
console.log(`${count} arquivos JavaScript com sintaxe válida.`);
