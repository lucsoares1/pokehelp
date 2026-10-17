import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,mkdir,writeFile,rm}from'node:fs/promises';
import {tmpdir}from'node:os';
import {join,resolve,dirname,basename}from'node:path';
import {parseCsv,normalizeReports}from'../tools/lib/normalize.mjs';
import {staticModule}from'../tools/lib/static-typescript.mjs';
import {readPortraitFallbacks}from'../tools/lib/assets.mjs';
import {createSourceReader}from'../tools/lib/source-reader.mjs';
import {publishSnapshot,writeJson}from'../tools/lib/publish.mjs';
import {explainText,rangeProfile,escapeHtml}from'../site/lib/content.mjs';
async function cleanup(directory){const target=resolve(directory);assert.equal(dirname(target),resolve(tmpdir()));assert(basename(target).startsWith('pokechess-'));await rm(target,{recursive:true,force:true});}

test('CSV preserva zeros, formas, aspas e campos com vírgula',()=>{
  const rows=parseCsv('Index,Name,Attack Range\r\n0025-0006,"Pikachu, Libre",1\r\n');
  assert.equal(rows[0].Index,'0025-0006');assert.equal(rows[0].Name,'Pikachu, Libre');
  assert.throws(()=>parseCsv('Index,Attack Range\n"0001,1'));
});
test('leitor TypeScript resolve receitas e spreads sem executar funções',()=>{
  const module=staticModule('enum Item {A="A",B="B"}; const first=[Item.A]; const all=[...first,Item.B]; const recipes = {[Item.B]: [Item.A,Item.A]}; const bad=process.exit();');
  assert.deepEqual(module.get('all'),['A','B']);assert.deepEqual(module.get('recipes').B,['A','A']);assert.throws(()=>module.get('bad'),/não permitida/);
});

test('retratos seguem o mapa oficial de formas sem executar funções ou aceitar caminhos externos',()=>{
  const fallbacks=readPortraitFallbacks('const PORTRAITS_FALLBACKS={"0670-0001":"0670","0669-0003":"0669"}; function getPortraitSrc(){throw new Error("não executar")}');
  assert.equal(fallbacks['0670-0001'],'0670');assert.equal(fallbacks['0669-0003'],'0669');
  assert.throws(()=>readPortraitFallbacks('const PORTRAITS_FALLBACKS={"0670-0001":"../image"}'),/inválido/);
  assert.throws(()=>readPortraitFallbacks('const PORTRAITS_FALLBACKS={"0670-0001":"0670-0002","0670-0002":"0670"}'),/inválido/);
  assert.throws(()=>readPortraitFallbacks('const PORTRAITS_FALLBACKS=process.exit()'),/não permitida/);
});
test('traduções mantêm todos os patamares e a escala de habilidade',()=>{
  const text=explainText('[20, 40, 80, 160, SP] SPECIAL, $t(pkm.EEVEE)',{pkm:{EEVEE:'Eevee'},damage:{SPECIAL:'dano especial'}},{});
  assert.equal(text,'20 / 40 / 80 / 160 (escala com Poder de Habilidade) dano especial, Eevee');
  assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
});
test('alcance base é separado de função tática',()=>{
  assert.equal(rangeProfile(1).kind,'melee');assert.equal(rangeProfile(2).kind,'ranged');assert.throws(()=>rangeProfile(NaN));
});
const fixture=()=>({metadata:[{count:100,created_at:'2026-10-14T06:00:00',time_limit:'2026-09-29T06:00:00'}],itemReports:[{tier:'LEVEL_BALL',items:{SOUL_DEW:{rank:4.22,count:20,pokemons:['EEVEE']},OLD_ROD:{rank:0.5,count:2,pokemons:[]}}}],pokemonReports:[{tier:'LEVEL_BALL',pokemons:{EEVEE:{rank:3,count:20,items:['SOUL_DEW']},FUTURE:{rank:3,count:5,items:[]}}}],comps:[{cluster_id:'121',count:10,mean_rank:2.1,winrate:40.3,ratio:.01,synergies:{wild:9},mean_team:{pokemons:{EEVEE:{frequency:.78,mean_items:1,items:['SOUL_DEW']}}},top_teams:[],mean_items:[]}]});
const catalog={pokemons:[{id:'EEVEE'}],items:[{id:'SOUL_DEW'},{id:'OLD_ROD'}],synergies:[{id:'WILD'}],tiers:{LEVEL_BALL:0}};
test('percentual da vitória e frequência não são confundidos; metadados sem versão inventada',()=>{
  const report=normalizeReports(fixture(),catalog);assert.equal(report.compositions[0].winRatePercent,40.3);assert.equal(report.compositions[0].members[0].frequency,.78);assert.equal(report.metadata.gameVersion,null);assert.equal(report.metadata.timezone,'unspecified');assert.equal(report.compositions[0].positioningAvailable,false);
});
test('referências desconhecidas são registradas e métricas fora de 1–8 não viram ranking',()=>{
  const report=normalizeReports(fixture(),catalog);assert.equal(report.reports.LEVEL_BALL.items.OLD_ROD.meanPlace,null);assert.equal(report.invalidMetrics.length,1);assert.equal(report.unresolved[0].id,'FUTURE');assert.equal(report.reports.LEVEL_BALL.pokemons.FUTURE,undefined);
});
test('mudanças de schema ou escala interrompem a normalização',()=>{
  const a=fixture();a.comps[0].mean_team.pokemons.EEVEE.frequency=78;assert.throws(()=>normalizeReports(a,catalog),/0–1/);
  const b=fixture();b.itemReports[0].tier='UNKNOWN';assert.throws(()=>normalizeReports(b,catalog),/Faixa desconhecida/);
});
test('falha de publicação preserva o último ponteiro válido',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'pokechess-publish-'));
  try{const site=join(dir,'site');await mkdir(join(site,'data'),{recursive:true});await writeJson(join(site,'data/current.json'),{id:'previous'});
    await assert.rejects(publishSnapshot({siteRoot:site,stageRoot:join(dir,'absent'),id:'next',manifest:{gameVersion:'6.11.1'}}));assert.equal(JSON.parse(await readFile(join(site,'data/current.json'),'utf8')).id,'previous');
  }finally{await cleanup(dir);}
});
test('leitor limita origens, volume e valida cache',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'pokechess-reader-'));
  try{const source=createSourceReader(dir,{fetcher:async()=>new Response('oversized')});await assert.rejects(source.read('https://example.com/'),/Origem/);await assert.rejects(source.read('https://pokemon-auto-chess.com/items',{maxBytes:2}),/limite/);}
  finally{await cleanup(dir);}
});
