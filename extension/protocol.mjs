import {nativePlannerBoard} from './shop-model.mjs';
import {createPortalContext} from './portal-model.mjs';
export const STATE_KEY='pokechess-game-overlay-v1';
export const EXTENSION_VERSION='0.18.0';
export const GAME_ORIGIN='https://pokemon-auto-chess.com';
export const HELPER_ORIGINS=['http://127.0.0.1:4173','http://localhost:4173'];
export const referenceKey=s=>`${s.compId}@${s.snapshotId}~${s.variantIndex}`;
export function isGameUrl(value){try{return new URL(value).origin===GAME_ORIGIN;}catch{return false;}}
export function helperOrigin(value){try{const u=new URL(value);return HELPER_ORIGINS.includes(u.origin)&&['/','/index.html'].includes(u.pathname)?u.origin:null;}catch{return null;}}
export function validSelection(s){return !!s&&typeof s.compId==='string'&&/^[\w.-]{1,100}$/.test(s.compId)&&typeof s.snapshotId==='string'&&/^[\w.-]{1,100}$/.test(s.snapshotId)&&Number.isInteger(s.variantIndex)&&s.variantIndex>=0&&s.variantIndex<=500;}
export const initialState=()=>({schemaVersion:1,selection:null,obtained:[],shopEnabled:false,minimized:false,closed:false,position:null,theme:'dark',guideLevel:2,helperOrigin:HELPER_ORIGINS[0]});
export function normalizeState(value,plans){
  const empty=initialState();if(value?.schemaVersion!==1)return empty;
  const selection=validSelection(value.selection)&&Object.hasOwn(plans,referenceKey(value.selection))?value.selection:null;
  const count=selection?plans[referenceKey(selection)].units.length:0;
  return {...empty,selection,shopEnabled:value.shopEnabled===true,obtained:Array.isArray(value.obtained)?[...new Set(value.obtained.filter(n=>Number.isInteger(n)&&n>=0&&n<count))]:[],minimized:value.minimized===true,closed:value.closed===true,
    position:value.position&&Number.isFinite(value.position.x)&&Number.isFinite(value.position.y)?{x:Math.max(0,Math.min(10000,value.position.x)),y:Math.max(0,Math.min(10000,value.position.y))}:null,
    theme:value.theme==='light'?'light':'dark',guideLevel:Number.isInteger(value.guideLevel)&&value.guideLevel>=2&&value.guideLevel<=9?value.guideLevel:2,helperOrigin:HELPER_ORIGINS.includes(value.helperOrigin)?value.helperOrigin:empty.helperOrigin};
}
export async function handleMessage(message,sender,{id,plans,storage,snapshotId,getGuide,itemCatalog=[],pokemonCatalog=[],portalRules={},synergyCatalog=[],teamRules={}}){
  if(sender.id!==id)throw new Error('Origem não permitida.');
  const origin=helperOrigin(sender.url),game=isGameUrl(sender.url),panel=sender.url===`chrome-extension://${id}/overlay/index.html`;
  if((!origin&&!game&&!panel)||((origin||game)&&sender.frameId!==0))throw new Error('Origem não permitida.');
  if(message?.type==='PCH_HELLO'&&origin)return {ok:true,version:EXTENSION_VERSION,snapshotId};
  let state=normalizeState(await storage.get(),plans);
  if(message?.type==='PCH_STATE'&&(game||panel||origin))return {ok:true,state};
  if(message?.type==='PCH_ITEM_PLAN'&&game){
    const plan=state.selection&&state.shopEnabled&&!state.closed?plans[referenceKey(state.selection)]:null;
    return {ok:true,context:plan?{plan,obtained:state.obtained,items:itemCatalog,pokemons:pokemonCatalog.map(p=>({id:p.id,family:p.family,name:p.name,image:p.image,kind:p.kind,stats:p.stats,passiveId:p.passiveId,abilityId:p.abilityId,abilityProfile:p.abilityProfile,types:p.types})),guide:getGuide?.(plan,state)??null,synergyGivenByItem:teamRules.synergyGivenByItem??{},teamRules,portal:createPortalContext(plan,pokemonCatalog,portalRules,state.obtained),synergies:synergyCatalog.map(s=>({id:s.id,name:s.name,image:s.image,thresholds:s.thresholds}))}:null};
  }
  if(message?.type==='PCH_SHOP_PLAN'&&game){
    const plan=state.selection&&state.shopEnabled&&!state.closed?plans[referenceKey(state.selection)]:null;
    return {ok:true,board:plan?nativePlannerBoard(plan,state,getGuide?.(plan,state)):null};
  }
  if(message?.type==='PCH_IMPORT'&&origin){
    const selection=message.selection;
    if(!validSelection(selection)||!Object.hasOwn(plans,referenceKey(selection)))throw new Error('Snapshot ou variação ausente na extensão. Baixe a versão atual e recarregue a extensão.');
    const same=state.selection&&referenceKey(selection)===referenceKey(state.selection);
    state={...state,selection:{compId:selection.compId,snapshotId:selection.snapshotId,variantIndex:selection.variantIndex},obtained:same?state.obtained:[],shopEnabled:true,minimized:false,closed:false,helperOrigin:origin,theme:message.theme==='light'?'light':'dark'};
  }else if(message?.type==='PCH_REOPEN'&&game){state.closed=false;}
  else if(message?.type==='PCH_POSITION'&&game){
    const p=message.position;if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw new Error('Posição inválida.');
    state.position={x:Math.max(0,Math.min(10000,p.x)),y:Math.max(0,Math.min(10000,p.y))};
  }else if(message?.type==='PCH_PATCH'&&(panel||origin)){
    if(origin&&(!validSelection(message.selection)||!state.selection||referenceKey(message.selection)!==referenceKey(state.selection)||!['toggle','reset','level'].includes(message.action)))throw new Error('A equipe mudou no jogo. Importe a seleção novamente para sincronizar.');
    const action=message.action,plan=state.selection?plans[referenceKey(state.selection)]:null;
    if(action==='toggle'&&plan&&Number.isInteger(message.slot)&&message.slot>=0&&message.slot<plan.units.length)state.obtained=state.obtained.includes(message.slot)?state.obtained.filter(n=>n!==message.slot):[...state.obtained,message.slot];
    else if(action==='reset')state.obtained=[];
    else if(action==='shop'&&panel&&typeof message.enabled==='boolean')state.shopEnabled=message.enabled;
    else if(action==='minimize')state.minimized=!state.minimized;
    else if(action==='close')state.closed=true;
    else if(action==='level'&&Number.isInteger(message.level)&&message.level>=2&&message.level<=9)state.guideLevel=message.level;
    else if(action==='variant'&&plan&&Number.isInteger(message.index)){
      const selection={...state.selection,variantIndex:message.index};if(!Object.hasOwn(plans,referenceKey(selection)))throw new Error('Variação indisponível.');
      if(referenceKey(selection)!==referenceKey(state.selection))state.obtained=[];state.selection=selection;
    }else throw new Error('Ação inválida.');
  }else throw new Error('Mensagem não permitida nesta origem.');
  await storage.set(state);return {ok:true,state};
}
