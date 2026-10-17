import {readFile,stat} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifySnapshot} from './lib/verify-snapshot.mjs';
import {validateCatalog} from './lib/normalize.mjs';
import {validateProgression} from './lib/progression.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../site');
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const pointer=await read(resolve(root,'data/current.json'));
if(!/^data\/releases\/[\w.-]+\/$/.test(pointer.base))throw new Error('Ponteiro inválido');
const release=resolve(root,pointer.base),manifest=await read(resolve(release,'manifest.json'));
if(pointer.id!==manifest.id||pointer.version!==manifest.gameVersion)throw new Error('Snapshot inconsistente');
const assets=await verifySnapshot(root,release,manifest);
const index=await read(resolve(release,'catalog/pokemons.json'));
const pokemons=await Promise.all(index.map(p=>read(resolve(release,`pokemon/${p.id}.json`))));
const items=await read(resolve(release,'catalog/items.json')),synergies=await read(resolve(release,'catalog/synergies.json'));
validateCatalog({pokemons,items,synergies});
if(manifest.files['catalog/progression.json']){
  const progression=await read(resolve(release,'catalog/progression.json'));
  if(progression.revision!==manifest.revision||progression.version!==manifest.gameVersion)throw new Error('Progressão incompatível com snapshot');
  validateProgression(progression,{pokemons});
}
if(manifest.files['catalog/team-rules.json']){
  const rules=await read(resolve(release,'catalog/team-rules.json'));
  if(rules.revision!==manifest.revision||rules.version!==manifest.gameVersion||rules.board.columns!==8||rules.board.rows!==3)throw new Error('Regras de equipe incompatíveis');
  for(const [id,type] of Object.entries(rules.synergyGivenByItem))if(!items.some(i=>i.id===id)||!synergies.some(s=>s.id===type))throw new Error('Tipo concedido por item desconhecido: '+id);
  if(!index.every(p=>typeof p.passiveId==='string'))throw new Error('Índice sem passivas para as sinergias dinâmicas');
}
for(const entity of [...pokemons,...items,...synergies])if(!(await stat(resolve(root,entity.image))).isFile())throw new Error('Recurso ausente: '+entity.id);
for(const tier of Object.keys(manifest.tiers)){
  const report=await read(resolve(release,`reports/${tier}.json`));
  for(const kind of ['items','pokemons'])for(const r of Object.values(report[kind]))if(r.available&&!(r.meanPlace>=1&&r.meanPlace<=8))throw new Error('Desempenho inválido');
}
console.log(JSON.stringify({snapshot:pointer.id,files:Object.keys(manifest.files).length,pokemons:pokemons.length,items:items.length,assets:assets.length,availableAssets:assets.filter(a=>a.status==='available').length,missingAssets:assets.filter(a=>a.status==='missing').length,valid:true},null,2));
