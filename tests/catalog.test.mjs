import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile}from'node:fs/promises';
import {pokemonCard}from'../site/lib/views.mjs';
import {homePaths}from'../site/lib/home-view.mjs';
import {pokemonArt,pokemonArtImage}from'../site/lib/presentation.mjs';
const pointer=JSON.parse(await readFile(new URL('../site/data/current.json',import.meta.url),'utf8'));
const root=new URL('../site/'+pointer.base,import.meta.url);
const json=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const index=await json('catalog/pokemons.json'),items=await json('catalog/items.json');

test('ilustrações mantêm identidade exata e alternativa para o retrato do jogo',()=>{
  const p=index.find(p=>p.id==='GYARADOS');
  assert.equal(pokemonArt(p),'assets/presentation/pokemon/130.png');
  assert(pokemonArtImage(p).includes(`data-portrait="${p.image}"`));
  for(const id of ['MEGA_GYARADOS','FLOETTE_YELLOW']){
    const form={id,name:id,image:'assets/pac/own-form.png'};
    assert.equal(pokemonArt(form),form.image);
    assert(pokemonArtImage(form).includes('is-portrait'));
    assert(!pokemonArtImage(form).includes('data-portrait'));
  }
});

test('cards de todos os Pokémon renderizam com links válidos, incluindo a home',async()=>{
  const synergies=await json('catalog/synergies.json'),report=await json('reports/LEVEL_BALL.json');
  const data={pokemons:index,items,synergies,maps:{pokemons:new Map(index.map(p=>[p.id,p])),items:new Map(items.map(i=>[i.id,i])),synergies:new Map(synergies.map(s=>[s.id,s]))}};
  for(const p of index){const card=pokemonCard(p,data,report);assert(card.includes(`href="#pokemon/${encodeURIComponent(p.id)}"`));assert(!card.includes('undefined'));}
  assert(homePaths(data).includes('href="#compositions"'));
});

test('catálogo cruza CSV e classes, preservando as novidades publicadas de 6.11',()=>{
  for(const id of ['GALAR_MEOWTH','PERRSERKER','PIKACHU_LIBRE'])assert(index.some(p=>p.id===id));
  assert.equal(index.find(p=>p.id==='PIKACHU_LIBRE').index,'0025-0006');
  assert.equal(index.find(p=>p.id==='EGG').kind,'egg');
  if(pointer.version==='6.11.1')assert(!index.some(p=>p.id==='BOMBIRDIER'));
});
test('estatísticas das classes corrigem o CSV antigo e as habilidades são da revisão fixada',async()=>{
  const p=await json('pokemon/GYARADOS.json');
  if(pointer.version==='6.11.1'){assert.equal(p.ability.id,'DRAGON_RAGE');assert.equal(p.stats.def,6);assert.equal(p.stats.speDef,5);}
  assert.equal(p.range.kind,'melee');assert.equal(p.role.primary,'Lutador resistente');
});
test('receitas navegam em ambos os sentidos e preservam componentes repetidos',()=>{
  assert.deepEqual(items.find(i=>i.id==='SOUL_DEW').components,['TWISTED_SPOON','MYSTIC_WATER']);
  assert(items.find(i=>i.id==='MYSTIC_WATER').buildsInto.includes('SOUL_DEW'));
  assert.deepEqual(items.find(i=>i.id==='CHOICE_SPECS').components,['TWISTED_SPOON','TWISTED_SPOON']);
});
test('todos os registros possuem ficha e Perrserker preserva sua passiva',async()=>{
  const p=await json('pokemon/PERRSERKER.json');assert.equal(p.passive.id,'STEELY_SPIRIT');assert(p.ability.description.length>0);
  const manifest=await json('manifest.json');for(const p of index)assert(Object.hasOwn(manifest.files,`pokemon/${p.id}.json`));
});
