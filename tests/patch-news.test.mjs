import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {patchBanner,patchContent} from '../site/lib/patch-news.mjs';
const notes=JSON.parse(await readFile(new URL('../site/data/patches/latest.json',import.meta.url),'utf8'));
const pointer=JSON.parse(await readFile(new URL('../site/data/current.json',import.meta.url),'utf8'));
const catalog=JSON.parse(await readFile(new URL('../site/'+pointer.base+'catalog/pokemons.json',import.meta.url),'utf8'));
const data={maps:{pokemons:new Map(catalog.map(p=>[p.id,p]))}};

test('patch distingue a versão principal da correção e só informa versão atual quando coincide',()=>{
  assert.equal(notes.baseVersion,'6.11');assert.equal(notes.version,'6.11.1');
  assert(patchBanner(notes,notes.version).includes('Versão atual'));
  assert(!patchBanner(notes,'6.12').includes('Versão atual'));
  const html=patchContent(notes,data);
  for(const id of notes.newcomers){assert(data.maps.pokemons.has(id));assert(html.includes(data.maps.pokemons.get(id).name));}
  for(const b of notes.balance)assert(html.includes(b.change));
  assert(html.includes('O que chegou no 6.11'));assert(html.includes('O que mudou no 6.11.1'));
  assert(!html.includes('undefined'));
  assert(!patchBanner({...notes,title:'<script>alert(1)</script>'},notes.version).includes('<script>'));
});

test('banner do patch preserva a imagem fornecida e as notas apontam à revisão fixada',async()=>{
  assert.deepEqual(await readFile(new URL('../assets/banner2.jpg',import.meta.url)),await readFile(new URL('../site/'+notes.image,import.meta.url)));
  for(const source of notes.sources){const url=new URL(source.url);assert.equal(url.origin,'https://github.com');assert(url.pathname.includes('/'+notes.revision+'/'));}
});
