import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {recipeTooltip} from '../extension/item-tooltip.mjs';
const pointer=JSON.parse(await readFile(new URL('../site/data/current.json',import.meta.url),'utf8'));
const items=JSON.parse(await readFile(new URL('../site/'+pointer.base+'catalog/items.json',import.meta.url),'utf8'));
test('tooltip usa receitas do catálogo e preserva duas cópias do mesmo componente',()=>{
  const item=items.find(i=>i.id==='OLD_AMBER'),component=items.find(i=>i.id==='FOSSIL_STONE');
  const html=recipeTooltip(item,items);assert.equal(html.split(`src="${component.image}"`).length-1,2);assert(html.includes('Componentes da receita'));assert(html.includes(item.name));
  const wide=recipeTooltip(items.find(i=>i.id==='WIDE_LENS'),items);for(const id of ['BLACK_GLASSES','NEVER_MELT_ICE'])assert(wide.includes(items.find(i=>i.id===id).name));
});
test('tooltip não inventa componentes ausentes e escapa nomes e caminhos',()=>{
  const item={id:'x',name:'<script>"',image:'x" onerror="bad',components:['missing']};const html=recipeTooltip(item,items);
  assert(html.includes('indisponível'));assert(!html.includes('undefined'));assert(!html.includes('<script>'));assert(!html.includes('src="x" onerror='));
});
