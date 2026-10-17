import { mkdir, readFile, writeFile, stat, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSourceReader, mapLimit, sha256 } from './lib/source-reader.mjs';
import { normalizeCatalog, normalizeReports, validateCatalog } from './lib/normalize.mjs';
import { cacheAssets } from './lib/assets.mjs';
import { publishSnapshot, writeJson } from './lib/publish.mjs';
import {verifySnapshot} from './lib/verify-snapshot.mjs';
import {normalizeProgression,validateProgression} from './lib/progression.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const lock=JSON.parse(await readFile(resolve(root,'data/source-lock.json'),'utf8'));
if(!/^[a-f0-9]{40}$/.test(lock.revision)||lock.repository!=='keldaanCommunity/pokemonAutoChess')throw new Error('Revisão de origem inválida');
const reader=createSourceReader(resolve(root,'.cache/sources'),{refresh:process.argv.includes('--refresh')});
const repo=`https://raw.githubusercontent.com/${lock.repository}/${lock.revision}/`;
const files={package:'package.json',license:'LICENSE',csv:'app/models/precomputed/pokemons-data.csv',pokemonEnum:'app/types/enum/Pokemon.ts',itemEnum:'app/types/enum/Item.ts',itemStats:'app/config/game/items.ts',gameEnum:'app/types/enum/Game.ts',synergyEnum:'app/types/enum/Synergy.ts',synergies:'app/config/game/synergies.ts',passiveEnum:'app/types/enum/Passive.ts',abilityEnum:'app/types/enum/Ability.ts',pokemonClasses:'app/models/colyseus-models/pokemon.ts',battle:'app/config/game/battle.ts',elo:'app/config/game/elo.ts',eloEnum:'app/types/enum/EloRank.ts',credits:'app/models/precomputed/credits.json',pt:'app/public/dist/client/locales/pt/translation.json',en:'app/public/dist/client/locales/en/translation.json',patch:'app/public/dist/client/changelog/patch-6.11.1.md'};
console.log('Conferindo versão publicada e revisão fixada…');
const status=await reader.read('https://pokemon-auto-chess.com/status',{format:'json',maxAgeMs:0});
if(status.version!==lock.gameVersion)throw new Error(`Servidor ${status.version}; lock ${lock.gameVersion}. Revisar a nova versão antes de importar.`);
files.synergyMechanics='app/models/colyseus-models/synergies.ts';
files.boardUtils='app/utils/board.ts';
files.portraitUtils='app/utils/avatar.ts';
Object.assign(files,{shopParameters:'app/config/game/shop.ts',experienceParameters:'app/config/game/experience.ts',experienceManager:'app/models/colyseus-models/experience-manager.ts',stagesParameters:'app/config/game/stages.ts',poolParameters:'app/config/game/pools.ts',gameCommands:'app/rooms/commands/game-commands.ts',evolutionRuleEnum:'app/types/EvolutionRules.ts',countEvolution:'app/core/evolution-logic/count-evolution-handler.ts',shopMechanics:'app/models/shop.ts'});
const raw=Object.fromEntries(await mapLimit(Object.entries(files),4,async([name,path])=>[name,await reader.read(repo+path,{immutable:true,format:['package','pt','en','credits'].includes(name)?'json':'text'})]));
if(raw.package.version!==status.version)throw new Error('Versão do repositório diverge do servidor');
console.log('Normalizando Pokémon, habilidades, passivas, itens, receitas e sinergias…');
const catalog=normalizeCatalog(raw,lock);validateCatalog(catalog);
const progression=normalizeProgression(raw,lock,catalog);
validateProgression(progression,catalog);
const endpoints={metadata:'meta/metadata',comps:'meta-v2',itemReports:'meta/items',pokemonReports:'meta/pokemons',liveIndexes:'pokemons-index',liveItems:'items',liveThresholds:'types-trigger'};
const reportRaw=Object.fromEntries(await mapLimit(Object.entries(endpoints),2,async([name,path])=>[name,await reader.read('https://pokemon-auto-chess.com/'+path,{format:'json',maxBytes:name==='pokemonReports'?50_000_000:10_000_000})]));
for(const p of catalog.pokemons)if(reportRaw.liveIndexes[p.id]!==p.index)throw new Error(`Índice publicado diverge da revisão: ${p.id}`);
for(const i of catalog.items)if(reportRaw.liveItems[i.id]!==i.id)throw new Error(`Item não publicado: ${i.id}`);
for(const id of Object.keys(reportRaw.liveIndexes))if(!catalog.pokemons.some(p=>p.id===id))throw new Error(`Pokémon publicado sem cadastro na revisão: ${id}`);
for(const id of Object.keys(reportRaw.liveItems))if(!catalog.items.some(i=>i.id===id))throw new Error(`Item publicado sem cadastro na revisão: ${id}`);
for(const s of catalog.synergies)if(JSON.stringify(s.thresholds)!==JSON.stringify(reportRaw.liveThresholds[s.id]))throw new Error(`Patamares divergentes: ${s.id}`);
const stats=normalizeReports(reportRaw,catalog);
const roleContent=JSON.parse(await readFile(resolve(root,'content/roles.json'),'utf8'));
for(const [id,role]of Object.entries(roleContent.assignments)){
  if(!catalog.pokemons.some(p=>p.id===id))throw new Error(`Função editorial sem Pokémon: ${id}`);
  if(typeof role.primary!=='string'||typeof role.reason!=='string'||!Array.isArray(role.secondary)||!role.secondary.every(s=>typeof s==='string')||typeof role.position!=='string')throw new Error(`Função editorial inválida: ${id}`);
}
for(const p of catalog.pokemons){const role=roleContent.assignments[p.id];if(role&&role.version===lock.gameVersion)p.role=role;}
console.log(`Catálogo validado: ${catalog.pokemons.length} Pokémon, ${catalog.items.length} itens. Preparando PNGs/SVGs locais…`);
const assets=await cacheAssets(catalog,lock,resolve(root,'site'),raw.portraitUtils);
const implementations=await Promise.all(['tools/import-game.mjs','tools/lib/normalize.mjs','tools/lib/progression.mjs','tools/lib/static-typescript.mjs','tools/lib/assets.mjs','tools/lib/verify-snapshot.mjs','site/lib/content.mjs'].map(path=>readFile(resolve(root,path))));
const fingerprint=sha256(JSON.stringify({lock,roles:roleContent,sources:reader.sources.filter(s=>!s.url.endsWith('/status')).sort((a,b)=>a.url.localeCompare(b.url)).map(s=>[s.url,s.sha256]),implementations:implementations.map(sha256)}));
const id=`${lock.gameVersion}-${fingerprint.slice(0,16)}`;
const existing=resolve(root,'site/data/releases',id,'manifest.json');
try{
  await stat(existing);
  const previousManifest=JSON.parse(await readFile(existing,'utf8'));
  await verifySnapshot(resolve(root,'site'),dirname(existing),previousManifest);
  const finalStatus=await reader.read('https://pokemon-auto-chess.com/status',{format:'json',maxAgeMs:0});
  if(finalStatus.version!==lock.gameVersion)throw new Error('Versão mudou durante a importação');
  const pointer=resolve(root,'site/data/current.json');
  await writeJson(pointer+'.tmp',{schemaVersion:1,id,base:`data/releases/${id}/`,manifest:'manifest.json',version:lock.gameVersion});await rename(pointer+'.tmp',pointer);
  console.log(`Fontes sem alteração; snapshot reutilizado: ${id}`);process.exit(0);
}catch(error){if(error.code!=='ENOENT')throw error;}
const stageRoot=resolve(root,'.cache/staging',id);await mkdir(stageRoot,{recursive:true});
const output={};
const emit=async(path,value)=>{output[path]=await writeJson(resolve(stageRoot,path),value);};
await emit('catalog/pokemons.json',catalog.pokemons.map(({ability,passive,source,evolutions,evolutionRule,...p})=>({...p,abilityId:ability.id,passiveId:passive.id})));
await emit('catalog/progression.json',progression);
await emit('catalog/team-rules.json',catalog.teamRules);
await emit('catalog/items.json',catalog.items);
await emit('catalog/synergies.json',catalog.synergies);
await emit('compositions.json',stats.compositions.map(c=>({...c,snapshotId:id})));
for(const p of catalog.pokemons)await emit(`pokemon/${p.id}.json`,p);
for(const [tier,data]of Object.entries(stats.reports)){
  await emit(`reports/${tier}.json`,data);
  // Históricos separados para não enviar dezenas de MB ao abrir uma página.
  for(const kind of ['items','pokemons']){
    const source=(kind==='items'?reportRaw.itemReports:reportRaw.pokemonReports).find(t=>t.tier===tier)?.[kind]??{};
    await emit(`history/${tier}-${kind}.json`,Object.fromEntries(Object.entries(source).map(([key,value])=>[key,Object.fromEntries(Object.entries(value).filter(([field])=>field.endsWith('_history')))])));
  }
}
await emit('assets.json',assets);
await emit('quality.json',{unresolved:stats.unresolved,invalidMetrics:stats.invalidMetrics,statCorrections:catalog.corrections,missingFromCsv:catalog.missingCsv,acquisitionRoutesInReview:Object.entries(progression.acquisition).filter(([,route])=>route.method==='review').map(([id])=>id),evolutionConditionsInReview:Object.entries(progression.acquisition).filter(([,route])=>route.steps.some(step=>step.itemsUnresolved)).map(([id])=>id),missingAssets:assets.filter(a=>a.status==='missing'),staleRoles:Object.entries(roleContent.assignments).filter(([,role])=>role.version!==lock.gameVersion).map(([id])=>id),descriptionFallbacks:catalog.pokemons.filter(p=>p.ability.language!=='pt').map(p=>p.id),deploymentRevisionVerified:false});
await emit('credits.json',raw.credits);
await writeFile(resolve(stageRoot,'SOURCE-LICENSE.txt'),raw.license);
const manifest={schemaVersion:1,id,gameVersion:lock.gameVersion,revision:lock.revision,revisionCompatibility:lock.compatibility,createdAt:new Date().toISOString(),defaultTier:lock.defaultTier,tiers:catalog.tiers,report:stats.metadata,presentation:{poster:`assets/pac/${lock.revision.slice(0,12)}/poster.png`},counts:{pokemons:catalog.pokemons.length,items:catalog.items.length,synergies:catalog.synergies.length,compositions:stats.compositions.length,assets:assets.length},sources:reader.sources,files:output};
const finalStatus=await reader.read('https://pokemon-auto-chess.com/status',{format:'json',maxAgeMs:0});
if(finalStatus.version!==lock.gameVersion)throw new Error('Versão mudou durante a importação; o snapshot anterior foi preservado');
manifest.versionChecks={before:status.version,after:finalStatus.version};
await writeJson(resolve(stageRoot,'manifest.json'),manifest);
await publishSnapshot({siteRoot:resolve(root,'site'),stageRoot,id,manifest});
console.log(JSON.stringify({published:id,...manifest.counts,unresolved:stats.unresolved.length,missingAssets:assets.filter(a=>a.status==='missing').length,bytes:Object.values(output).reduce((sum,file)=>sum+file.bytes,0)},null,2));
