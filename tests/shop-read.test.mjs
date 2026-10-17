import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validShopSnapshot,recommendedShopOffers} from '../extension/shop-read-model.mjs';
import {createShopGuide} from '../extension/shop-context.mjs';

test('loja nativa marca Poliwag e Quaxwell pela família, sem depender da classe planned',async()=>{
  const b=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8')),plan=Object.values(b.plans).find(p=>p.selection.compId==='6'&&p.selection.variantIndex===0),guide=createShopGuide(b.guide);
  const shop={slots:6,offers:['POLIWAG','QUAXWELL','GYARADOS','EEVEE','PIKACHU'].map((pokemon,index)=>({index,pokemon}))};
  const config=level=>({plan,pokemons:b.guide.pokemons,obtained:[],guide:guide(plan,{guideLevel:level,obtained:[]})});
  const start=recommendedShopOffers(config(2),shop);assert(start.some(o=>o.pokemon==='POLIWAG'));assert(!start.some(o=>o.pokemon==='QUAXWELL'));
  const later=recommendedShopOffers(config(6),shop);assert(later.some(o=>o.pokemon==='QUAXWELL'));assert(!later.some(o=>o.pokemon==='POLIWAG'));assert(later.some(o=>o.pokemon==='GYARADOS'));
  const ready={...config(6),obtained:[4]};assert(!recommendedShopOffers(ready,shop).some(o=>o.pokemon==='GYARADOS'));
  assert(!later.some(o=>['EEVEE','PIKACHU'].includes(o.pokemon)));
});

test('snapshot de ofertas preserva slots vazios e rejeita índice duplicado ou ID desconhecido',()=>{
  const ids=new Set(['GOOMY','QUAXWELL']),shop={slots:6,offers:[{index:0,pokemon:'GOOMY'},{index:4,pokemon:'QUAXWELL'}]};assert.deepEqual(validShopSnapshot(shop,ids),shop);
  for(const value of [{...shop,slots:0},{...shop,offers:[...shop.offers,shop.offers[0]]},{...shop,offers:[{index:6,pokemon:'GOOMY'}]},{...shop,offers:[{index:0,pokemon:'UNKNOWN'}]}])assert.equal(validShopSnapshot(value,ids),null);
});

test('regressão Sombrio 5 / Normal 3 recomenda Pupitar para o Tyranitar pendente',async()=>{
  const b=JSON.parse(await readFile(new URL('../extension/dist/overlay/plans.json',import.meta.url),'utf8')),plan=Object.values(b.plans).find(p=>['HOOPA','PURUGLY','DUSCLOPS','TYRANITAR'].every(id=>p.units.some(u=>u.id===id)));assert(plan);
  const config={plan,pokemons:b.guide.pokemons,obtained:[],guide:createShopGuide(b.guide)(plan,{guideLevel:2,obtained:[]})},shop={slots:6,offers:['VANILLISH','PUPITAR','SPOINK','TRAPINCH','DARMANITAN','WHISMUR'].map((pokemon,index)=>({index,pokemon}))};
  assert(validShopSnapshot(shop,new Set(b.guide.pokemons.map(p=>p.id))));
  assert(recommendedShopOffers(config,shop).some(o=>o.pokemon==='PUPITAR'));
  const slot=plan.units.find(u=>u.id==='TYRANITAR').slot;assert(!recommendedShopOffers({...config,obtained:[slot]},shop).some(o=>o.pokemon==='PUPITAR'));
});
