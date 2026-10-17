(()=>{
  if(window!==top||location.origin!=='https://pokemon-auto-chess.com')return;
  const KEY='pokechess-game-overlay-v1',CHANNEL='PCH_OVERLAY_FRAME',VERSION='0.18.0';
  const extensionId=chrome.runtime.id,resourceBase=chrome.runtime.getURL(''),resource=path=>resourceBase+path,extensionOrigin=resourceBase.replace(/\/$/,'');
  let disconnected=false,healthTimer;
  function runtimeAlive(){if(disconnected)return false;try{if(extensionId&&chrome.runtime.id!==extensionId){disconnect();return false;}return true;}catch{disconnect();return false;}}
  async function request(message){
    if(!runtimeAlive())throw Error('Extensão desconectada');
    try{return await chrome.runtime.sendMessage(message);}catch(error){if(/context invalidated|extension context|extensão desconectada/i.test(error?.message??''))disconnect();throw error;}
  }
  function disconnect(){
    if(disconnected)return;disconnected=true;clearTimeout(healthTimer);clearTimeout(loadTimer);clearTimeout(shopReplay);clearTimeout(shopRequestTimer);clearTimeout(itemRequestTimer);shopToken++;itemToken++;
    shopObserver?.disconnect();discovery?.disconnect();nativeShop?.sync(null);nativeItems?.sync(null);
    frame.style.display='none';launcher.hidden=false;launcher.disabled=true;launcher.textContent='Extensão atualizada ou desconectada · Recarregue a página do jogo';
    host.style.height='64px';host.style.width='min(360px,calc(100% - 24px))';
  }
  function health(){if(runtimeAlive())healthTimer=setTimeout(health,2000);}
  const host=document.createElement('div');host.id='pokechess-helper-extension';
  // The iframe belongs to the Helper; shop badges use the native planner contract.
  host.style.cssText='position:fixed;z-index:2147483000;right:16px;bottom:16px;width:min(600px,calc(100% - 24px));height:500px;max-height:calc(100% - 24px);pointer-events:auto;color-scheme:dark;';
  const shadow=host.attachShadow({mode:'closed'}),frame=document.createElement('iframe'),launcher=document.createElement('button');
  launcher.type='button';launcher.style.cssText='position:absolute;inset:0;border:1px solid #56617a;border-top:3px solid #c71e42;border-radius:10px;padding:10px 16px;background:#1b2030;color:#f1f4fb;font:700 13px Arial,sans-serif;cursor:pointer;';launcher.setAttribute('aria-label','Abrir PokeChess Helper overlay');
  frame.src=resource('overlay/index.html');frame.title='PokeChess Helper — equipe e itens';frame.allow='';
  frame.style.cssText='display:block;width:100%;height:100%;border:0;border-radius:12px;background:transparent;color-scheme:dark;';shadow.append(frame,launcher);
  const gameUI=globalThis.PCHGameUI;
  function updateMenuOcclusion(rects=gameUI?.blocks?.()??[]){const r=host.getBoundingClientRect(),blocked=rects.length>0||(gameUI?.widgets?.()??[]).some(b=>gameUI.overlaps({x:r.left,y:r.top,width:r.width,height:r.height},b,6));host.style.visibility=blocked?'hidden':'visible';host.style.pointerEvents=blocked?'none':'auto';host.inert=blocked;host.setAttribute('aria-hidden',String(blocked));}
  gameUI?.subscribe(updateMenuOcclusion);
  let state={},height=640,drag=null,panelReady=false,loadTimer,boardAlert=false;
  let shopCode='off',shopTargets=0,shopToken=0,shopFingerprint='',shopStatus={},watchedShop=null,shopTick=0,itemFingerprint='',itemToken=0,itemStatus={code:'off'},shopNeedsNotify=false,shopReplay,shopRequestTimer,nativeReadStatus={code:'waiting'};
  let itemRequestTimer,itemContext='off';
  const nativeItems=globalThis.PCHItemAssist?.create({onStatus:status=>{itemStatus=status;sendItemStatus();},onShopStatus:status=>{nativeReadStatus=status;shopFeedback();}});
  function sendItemStatus(){if(!disconnected&&panelReady)frame.contentWindow.postMessage({channel:CHANNEL,type:'item-status',status:{...itemStatus,diagnostics:{...itemStatus.diagnostics,hostVersion:VERSION,context:itemContext,reader:!!nativeItems,planner:shopCode,shopTargets:nativeReadStatus.targets,shopMatches:nativeReadStatus.count}}},extensionOrigin);}
  function syncItems(){
    const fingerprint=JSON.stringify([state.selection,state.shopEnabled,state.closed,state.obtained,state.guideLevel]);if(fingerprint===itemFingerprint)return;itemFingerprint=fingerprint;const token=++itemToken;
    clearTimeout(itemRequestTimer);itemContext='off';nativeItems?.sync(null);if(!state.selection||!state.shopEnabled||state.closed){sendItemStatus();return;}
    itemContext='pending';sendItemStatus();
    itemRequestTimer=setTimeout(()=>{if(token===itemToken&&!disconnected){itemContext='timeout';sendItemStatus();}},8000);
    void request({type:'PCH_ITEM_PLAN'}).then(reply=>{if(token!==itemToken||disconnected)return;clearTimeout(itemRequestTimer);if(!reply?.ok)throw Error('items');itemContext='ready';nativeItems?.sync(reply.context);sendItemStatus();}).catch(()=>{if(token===itemToken&&!disconnected){clearTimeout(itemRequestTimer);itemContext='error';itemStatus={code:'unsupported'};sendItemStatus();}});
  }
  function shopFeedback(){
    if(disconnected)return;
    const shop=document.querySelector?.('.game-pokemons-store');
    if(shop!==watchedShop){shopObserver?.disconnect();watchedShop=shop; if(shop){shopObserver?.observe(shop,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});shopNeedsNotify=true;scheduleShop();}position();}
    shopStatus={code:shopCode,targets:shopTargets,shopPresent:!!shop,count:shopCode==='synced'?shop?.querySelectorAll('.game-pokemon-portrait.planned:not(.empty)').length??0:0};
    if(nativeReadStatus.code==='connected'&&state.shopEnabled&&!state.closed)shopStatus={code:'synced',source:'native',targets:nativeReadStatus.targets,shopPresent:!!shop,count:nativeReadStatus.count,offers:nativeReadStatus.offers};
    if(panelReady)frame.contentWindow.postMessage({channel:CHANNEL,type:'shop-status',status:shopStatus},extensionOrigin);
  }
  function scheduleShop(records){
    if(disconnected)return;
    if(Array.isArray(records)&&records.some(r=>r.type==='attributes'&&r.attributeName==='style'&&r.target?.matches?.('.game-pokemon-portrait')||r.type==='childList'&&(r.target===watchedShop||[...(r.addedNodes??[])].some(n=>n.matches?.('.game-pokemon-portrait')))))shopNeedsNotify=true;
    if(!shopTick&&typeof requestAnimationFrame==='function')shopTick=requestAnimationFrame(()=>{shopTick=0;shopFeedback();if(shopNeedsNotify){shopNeedsNotify=false;replayShop();}});
  }
  function replayShop(){clearTimeout(shopReplay);const shop=watchedShop;if(!shop||!state.shopEnabled||state.closed)return;shopReplay=setTimeout(()=>{if(watchedShop===shop&&state.shopEnabled&&!state.closed)nativeShop?.announce?.();},250);}
  const shopObserver=typeof MutationObserver==='function'?new MutationObserver(scheduleShop):null;
  const discovery=typeof MutationObserver==='function'?new MutationObserver(scheduleShop):null;
  discovery?.observe(document.documentElement,{childList:true,subtree:true});
  const nativeShop=globalThis.PCHShopPlanner?.create({
    storage:{getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value),removeItem:key=>window.localStorage.removeItem(key)},
    notify:()=>{window.dispatchEvent(new StorageEvent('storage',{key:'team_planner'}));window.postMessage({channel:'PCH_NATIVE_PLANNER_V1',type:'notify',key:'team_planner'},location.origin);},
    flag:active=>{if(active&&!disconnected){document.documentElement.style.setProperty('--pch-buy-badge',`url("${resource('assets/shop-buy.svg')}")`);document.documentElement.style.setProperty('--pch-buy-logo',`url("${resource('overlay/assets/brand/logo.png')}")`);document.documentElement.setAttribute('data-pch-shop','active');}else{document.documentElement.removeAttribute('data-pch-shop');document.documentElement.style.removeProperty('--pch-buy-badge');document.documentElement.style.removeProperty('--pch-buy-logo');}},
    // Preference compatibility controls only writes to the game's planner.
    // Read-only recommendations belong to the selected Helper comp and stay on.
    onStatus:code=>{shopCode=code;shopFeedback();}
  });
  function syncShop(){
    if(!nativeShop)return;
    const fingerprint=JSON.stringify([state.selection,state.obtained,state.guideLevel,state.shopEnabled,state.closed]);if(fingerprint===shopFingerprint)return;shopFingerprint=fingerprint;
    const token=++shopToken;
    clearTimeout(shopRequestTimer);
    if(!state.selection||!state.shopEnabled||state.closed){clearTimeout(shopReplay);shopTargets=0;nativeShop.sync(null);return;}
    shopCode='loading';shopFeedback();
    shopRequestTimer=setTimeout(()=>{if(token===shopToken&&!disconnected&&shopCode==='loading'){shopCode='timeout';shopFeedback();}},8000);
    void request({type:'PCH_SHOP_PLAN'}).then(reply=>{
      if(token!==shopToken||disconnected)return;clearTimeout(shopRequestTimer);if(!reply?.ok)throw Error('planner');shopTargets=reply.board?.length??0;nativeShop.sync(reply.board);shopFeedback();replayShop();
    }).catch(()=>{if(token===shopToken&&!disconnected){clearTimeout(shopRequestTimer);nativeShop.sync(null);shopCode='error';shopFeedback();}});
  }
  window.addEventListener('storage',event=>{if(event.key==='team_planner'||event.key==='pokechess-native-planner-v1'){nativeShop?.refresh();scheduleShop();}});
  window.addEventListener('message',event=>{if(event.source===window&&event.origin===location.origin&&event.data?.channel==='PCH_NATIVE_PLANNER_V1'&&event.data.type==='ready'){shopNeedsNotify=true;scheduleShop();}});
  function startTimer(){clearTimeout(loadTimer);loadTimer=setTimeout(()=>{if(!panelReady)launcher.textContent='PokeChess · Tentar carregar overlay ↻';},6000);}
  function reloadPanel(){if(!runtimeAlive())return;panelReady=false;boardAlert=false;frame.src=resource('overlay/index.html');apply(state);startTimer();}
  launcher.addEventListener('click',()=>{
    if(!state.selection){const origin=['http://127.0.0.1:4173','http://localhost:4173'].includes(state.helperOrigin)?state.helperOrigin:'http://127.0.0.1:4173';window.open(origin+'/#compositions','pokechess-helper','noopener');}
    else if(state.closed)void request({type:'PCH_REOPEN'}).then(r=>{if(r?.ok)apply(r.state);}).catch(()=>{});
    else reloadPanel();
  });
  function position(){
    if(disconnected)return;
    const w=document.documentElement.clientWidth,h=innerHeight;
    const shopBounds=!state.position?watchedShop?.closest('.game-shop')?.getBoundingClientRect()??watchedShop?.getBoundingClientRect():null;
    // Keep the panel above the raised shop insignias as well as the cards.
    const bottom=shopBounds&&shopBounds.height>0&&shopBounds.top>160&&shopBounds.top<h?Math.ceil(h-shopBounds.top+(w<=700?24:32)):16;
    if(!state.position){host.style.bottom=bottom+'px';host.style.top='auto';host.style.left='auto';host.style.right='16px';}
    const compact=!state.selection||state.closed;host.style.width=compact?'min(300px,calc(100% - 24px))':'min(600px,calc(100% - 24px))';host.style.height=compact?'46px':Math.max(80,Math.min(state.minimized?(boardAlert?230:150):height,h-(state.position?24:bottom+12)))+'px';
    if(state.position){host.style.left=Math.max(8,Math.min(state.position.x,w-host.getBoundingClientRect().width-8))+'px';host.style.top=Math.max(8,Math.min(state.position.y,h-host.getBoundingClientRect().height-8))+'px';host.style.right='auto';host.style.bottom='auto';}
    if(gameUI)updateMenuOcclusion();
  }
  function apply(next){if(!runtimeAlive())return;state=next??{};host.hidden=false;host.style.display='block';const compact=!state.selection||state.closed;frame.style.display=compact?'none':'block';launcher.hidden=!compact&&panelReady;launcher.textContent=!state.selection?'PokeChess · Escolher composição ↗':state.closed?'PokeChess · Reabrir overlay':'PokeChess · Carregando overlay…';position();syncShop();syncItems();}
  function mount(){(document.fullscreenElement??document.documentElement).append(host);position();}
  mount();apply({});startTimer();
  void request({type:'PCH_STATE'}).then(r=>{if(r?.ok)apply(r.state);}).catch(()=>{});health();
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[KEY])apply(changes[KEY].newValue);});
  chrome.runtime.onMessage.addListener((message,sender,reply)=>{
    if(message?.type==='PCH_PROBE'){shopFeedback();reply({ok:true,ready:panelReady,selection:!!state.selection,closed:!!state.closed,shop:shopStatus});return;}
    if(message?.type==='PCH_APPLY'){apply(message.state);reply({ok:true,ready:panelReady,selection:!!state.selection,closed:!!state.closed});return;}
    if(message?.type==='PCH_SHOW'){void request({type:'PCH_REOPEN'}).then(r=>{if(r?.ok)apply(r.state);reply({ok:!!r?.ok});}).catch(()=>reply({ok:false}));return true;}
  });
  window.addEventListener('resize',position);document.addEventListener('fullscreenchange',mount);
  window.addEventListener('message',event=>{
    if(!runtimeAlive()||event.source!==frame.contentWindow||event.origin!==extensionOrigin||event.data?.channel!==CHANNEL)return;
    const m=event.data;
    if(m.type==='board-alert'&&typeof m.active==='boolean'&&boardAlert!==m.active){boardAlert=m.active;position();}
    if(m.type==='ready'){panelReady=true;clearTimeout(loadTimer);apply(state);shopFeedback();sendItemStatus();}
    if(m.type==='retry-shop'){shopNeedsNotify=false;if(state.shopEnabled&&!state.closed){itemFingerprint='';syncItems();if(['loading','timeout','error'].includes(shopCode)){shopFingerprint='';syncShop();}else nativeShop?.announce?.();}shopFeedback();}
    if(m.type==='start'&&Number.isFinite(m.x)&&Number.isFinite(m.y)){const r=host.getBoundingClientRect();drag={x:m.x,y:m.y,left:r.left,top:r.top};}
    if(m.type==='move'&&drag&&Number.isFinite(m.x)&&Number.isFinite(m.y)){state.position={x:drag.left+m.x-drag.x,y:drag.top+m.y-drag.y};position();}
    if(m.type==='end'&&drag){drag=null;void request({type:'PCH_POSITION',position:{x:host.getBoundingClientRect().left,y:host.getBoundingClientRect().top}}).catch(()=>{});}
    if(m.type==='key'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(m.key)){
      const r=host.getBoundingClientRect(),step=m.shift?32:16;state.position={x:r.left+(m.key==='ArrowLeft'?-step:m.key==='ArrowRight'?step:0),y:r.top+(m.key==='ArrowUp'?-step:m.key==='ArrowDown'?step:0)};position();void request({type:'PCH_POSITION',position:{x:host.getBoundingClientRect().left,y:host.getBoundingClientRect().top}}).catch(()=>{});
    }
  });
})();
