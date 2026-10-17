import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selectHomePokemons,homePokemonCard} from '../site/lib/home-view.mjs';
import {cardArtwork,pokemonCardArtImage} from '../site/lib/card-artwork.mjs';
import {createHash} from 'node:crypto';
const pointer=JSON.parse(await readFile(new URL('../site/data/current.json',import.meta.url),'utf8'));
const read=async path=>JSON.parse(await readFile(new URL('../site/'+pointer.base+path,import.meta.url),'utf8'));
const [pokemons,items,synergies,report]=await Promise.all(['catalog/pokemons.json','catalog/items.json','catalog/synergies.json','reports/LEVEL_BALL.json'].map(read));
const data={pokemons,maps:{pokemons:new Map(pokemons.map(p=>[p.id,p])),items:new Map(items.map(i=>[i.id,i])),synergies:new Map(synergies.map(s=>[s.id,s]))}};
test('vitrine inicial mantém oito identidades reais; busca e sinergia alcançam o catálogo além da seleção ilustrada',()=>{
  const featured=selectHomePokemons(data,report);assert.equal(featured.length,8);assert(featured.every(p=>p.kind==='pokemon'&&Object.hasOwn(cardArtwork,p.id))); 
  assert(selectHomePokemons(data,report,{search:'gardevoir'}).some(p=>p.id==='GARDEVOIR'));
  const water=selectHomePokemons(data,report,{search:'água',synergy:'WATER',range:'ranged'});assert(water.length>0);assert(water.every(p=>p.types.includes('WATER')&&p.range.kind==='ranged'));
});
test('funções vêm da curadoria e favoritos cruzam os outros filtros sem inferir papéis pelo alcance',()=>{
  const support=selectHomePokemons(data,report,{role:'support'});assert(support.length);assert(support.every(p=>p.role?.primary==='Suporte'));
  assert.deepEqual(selectHomePokemons(data,report,{role:'favorites',favorites:['UMBREON'],search:'gyarados'}),[]);
  assert.deepEqual(selectHomePokemons(data,report,{role:'favorites',favorites:['UMBREON','UNKNOWN']}).map(p=>p.id),['UMBREON']);
});
test('cards apontam para fichas e itens reais e não misturam controle de favorito com link da ficha',()=>{
  const p=pokemons.find(p=>p.id==='UMBREON'),html=homePokemonCard(p,data,report,true);
  assert(html.includes('assets/presentation/home-renders/197.png'));assert(html.includes('href="#pokemon/UMBREON"'));assert(html.includes('aria-pressed="true"'));assert(!html.includes('<a class="discovery-card-main" href="#pokemon/UMBREON"><button'));
  for(const id of report.pokemons.UMBREON.items.slice(0,3))assert(html.includes(`href="#item/${id}"`));
  const escaped=homePokemonCard({...p,name:'<script>"'},data,report);assert(!escaped.includes('<script>'));assert(!escaped.includes('undefined'));
});

test('renders de apresentação mantêm PNG original, resolução e proveniência; outras formas preservam a própria imagem',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../site/assets/presentation/home-renders/manifest.json',import.meta.url),'utf8'));
  for(const [id,art]of Object.entries(cardArtwork)){
    assert(pokemons.some(p=>p.id===id));const source=manifest.images[id];assert.equal(source.src,art.src);assert(source.source.startsWith('https://raw.githubusercontent.com/PokeAPI/sprites/'+manifest.revision+'/sprites/pokemon/other/home/')); 
    const bytes=await readFile(new URL('../site/'+art.src,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256);assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(bytes.readUInt32BE(16),512);assert.equal(bytes.readUInt32BE(20),512);assert.equal(bytes[25],6);
  }
  const form={id:'MEGA_GYARADOS',name:'Mega Gyarados',image:'assets/pac/mega-own.png'};const html=pokemonCardArtImage(form);assert(html.includes(form.image));assert(!html.includes('home-renders/130.png'));
});
