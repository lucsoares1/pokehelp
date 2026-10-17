import {STATE_KEY,handleMessage,isGameUrl,HELPER_ORIGINS} from './protocol.mjs';
import {createShopGuide} from './shop-context.mjs';
let queue=Promise.resolve(),bundle,guideFor;
async function boundedReply(request){let timer;try{return await Promise.race([request,new Promise(resolve=>{timer=setTimeout(()=>resolve(null),2000);})]);}finally{clearTimeout(timer);}}
const getBundle=()=>bundle??=fetch(chrome.runtime.getURL('overlay/plans.json')).then(r=>{if(!r.ok)throw new Error('Pacote de equipes indisponível.');return r.json();});
async function gameHealth(state){
  const tabs=await chrome.tabs.query({url:'https://pokemon-auto-chess.com/*'});
  const responses=await Promise.all(tabs.map(async tab=>{try{return await boundedReply(chrome.tabs.sendMessage(tab.id,state?{type:'PCH_APPLY',state}:{type:'PCH_PROBE'}));}catch{return null;}}));
  return {tabs:tabs.length,connected:responses.filter(r=>r?.ok).length,ready:responses.filter(r=>r?.ok&&r.ready&&r.selection&&!r.closed).length,
    shop:{synced:responses.filter(r=>r?.ok&&r.shop?.code==='synced').length,visible:responses.filter(r=>r?.ok&&r.shop?.shopPresent).length,conflicts:responses.filter(r=>r?.ok&&r.shop?.code==='conflict').length,offers:responses.reduce((n,r)=>n+(r?.ok&&r.shop?.code==='synced'?r.shop.count??0:0),0)}};
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  const run=async()=>{
    try{const {plans,snapshotId,guide}=await getBundle();const result=await handleMessage(message,sender,{id:chrome.runtime.id,plans,snapshotId,itemCatalog:guide.items,pokemonCatalog:guide.pokemons,portalRules:guide.rules,synergyCatalog:guide.synergies,teamRules:guide.teamRules,getGuide:(plan,state)=>(guideFor??=createShopGuide(guide))(plan,state),storage:{get:async()=>(await chrome.storage.local.get(STATE_KEY))[STATE_KEY],set:state=>chrome.storage.local.set({[STATE_KEY]:state})}});
      return result;}
    catch(e){return {ok:false,error:e.message};}
  };
  // Tab diagnostics must not hold the state queue: a tab can be suspended or
  // waiting for a plan from this same worker while its health reply is pending.
  const operation=queue.then(run,run);queue=operation.then(()=>{},()=>{});
  void operation.then(async result=>{if(result.ok&&['PCH_HELLO','PCH_IMPORT'].includes(message.type))try{result.game=await gameHealth(message.type==='PCH_IMPORT'?result.state:null);}catch{result.game={unavailable:true};}reply(result);});return true;
});
chrome.action.onClicked.addListener(async tab=>{
  if(isGameUrl(tab.url)){
    try{await chrome.tabs.sendMessage(tab.id,{type:'PCH_SHOW'});}catch{await chrome.action.setBadgeText({tabId:tab.id,text:'↻'});}
  }else await chrome.tabs.create({url:HELPER_ORIGINS[0]+'/#compositions'});
});
