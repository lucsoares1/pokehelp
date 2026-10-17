(()=>{
  if(window!==top||location.origin!=='https://pokemon-auto-chess.com')return;
  const CHANNEL='PCH_NATIVE_ITEMS_V1',ID=/^[A-Z][A-Z0-9_]{0,90}$/;
  const VERSION='0.18.0';
  let token=null,until=0,scene=null,timer=null,probe=null,probeTimer=null,nextProbe=0,sceneSource='waiting',diagnostics={};
  const empty=code=>({code,inventory:null,equipped:[],sources:[],portals:[],stage:null,board:null,boardMode:null,rewards:[],shop:null});
  function stopProbe(){
    clearTimeout(probeTimer);
    if(probe&&Map.prototype.forEach===probe.wrapper)Object.defineProperty(Map.prototype,'forEach',probe.descriptor);
    probe=null;
  }
  function acceptScene(candidate,source){
    const canvas=document.querySelector?.('#game canvas');
    if(candidate?.sys?.settings?.key!=='gameScene'||!candidate.sys.isActive?.()||!canvas?.isConnected||candidate.sys.game?.canvas!==canvas)return false;
    scene=candidate;sceneSource=source;stopProbe();return true;
  }
  function probeRenderLoop(){
    if(probe||Date.now()<nextProbe||!document.querySelector?.('#game canvas')?.isConnected)return;
    const descriptor=Object.getOwnPropertyDescriptor(Map.prototype,'forEach');
    if(!descriptor?.configurable||typeof descriptor.value!=='function')return;
    const original=descriptor.value,values=Map.prototype.values;
    // The production Phaser bundle omits PHASER_GAME. Its visible minigame
    // maps are visited every frame. Observe one rendered entry without wrapping
    // the game's callback, changing arguments, entities, or the iteration result.
    // Restore the exact descriptor as soon as the scene is found (max 500 ms).
    function wrapper(callback,thisArg){
      if(typeof callback==='function'&&token&&Date.now()<=until&&!document.hidden)try{
        const object=Reflect.apply(values,this,[]).next().value,candidate=object?.scene,manager=candidate?.minigameManager;
        if(manager&&manager.uid===candidate.uid&&(this===manager.pokemons||this===manager.items||this===manager.portals||this===manager.symbols||candidate.board?.uid===candidate.uid&&this===candidate.board.pokemons))acceptScene(candidate,'render-loop');
      }catch{/* Discovery must never change native Map behavior or errors. */}
      return Reflect.apply(original,this,arguments);
    }
    probe={descriptor,wrapper};Object.defineProperty(Map.prototype,'forEach',{...descriptor,value:wrapper});
    nextProbe=Date.now()+2000;probeTimer=setTimeout(stopProbe,500);
  }
  function renderedShop(){
    // Read only the props of each currently rendered native shop card. No React
    // store, hooks, room state, image recognition or remote player is consulted.
    const cards=document.querySelectorAll('.game-pokemons-store > .game-pokemon-portrait');
    diagnostics.domSlots=cards.length;diagnostics.shop=cards.length?'react-unavailable':'no-cards';
    if(!cards.length||cards.length>24)return null;
    const offers=[];
    for(let index=0;index<cards.length;index++){
      const card=cards[index],keys=Object.getOwnPropertyNames(card),fiberKey=keys.find(k=>k.startsWith('__reactFiber$')),propsKey=keys.find(k=>k.startsWith('__reactProps$'));
      let fiber=card[fiberKey];const domProps=card[propsKey];
      if(!fiber||!domProps)return null;
      // The DOM expando can point at the previous commit's fiber. Select the
      // branch whose host props are exactly the DOM's committed props.
      if(fiber.memoizedProps!==domProps)fiber=fiber.alternate;
      if(fiber?.stateNode!==card||fiber.memoizedProps!==domProps)return null;
      let props=null;
      for(let n=0,parent=fiber.return;parent&&n<6;parent=parent.return,n++){
        const candidate=parent.memoizedProps;
        if(candidate?.origin==='shop'&&candidate.index===index){props=candidate;break;}
      }
      if(!props)return null;
      const pokemon=props.pokemon;
      if(pokemon==null||pokemon==='DEFAULT'){if(!card.classList.contains('empty'))return null;continue;}
      if(!ID.test(pokemon)||card.classList.contains('empty')||card.getAttribute('data-tooltip-id')!==`tooltip-shop-${index}`)return null;
      offers.push({index,pokemon});
    }
    diagnostics.shop='react-read';diagnostics.nativeSlots=cards.length;return {slots:cards.length,offers};
  }
  function nativeShop(s){
    diagnostics.shop='not-owner';
    if(s.board?.uid!==s.uid||s.board?.player?.id!==s.uid)return renderedShop();
    const cards=document.querySelectorAll('.game-pokemons-store > .game-pokemon-portrait'),shop=s.board.player.shop;
    diagnostics.domSlots=cards.length;diagnostics.nativeSlots=Number.isInteger(shop?.length)?shop.length:0;
    diagnostics.shop=!cards.length?'no-cards':'slot-count';
    if(!cards.length||cards.length>24||shop?.length!==cards.length)return null;
    const offers=[];
    for(let index=0;index<cards.length;index++){
      const pokemon=shop[index],card=cards[index];
      diagnostics.shop='invalid-id';if(!ID.test(pokemon))return null;
      diagnostics.shop='slot-dom';
      if(pokemon==='DEFAULT'){if(!card.classList.contains('empty'))return null;continue;}
      if(card.classList.contains('empty')||card.getAttribute('data-tooltip-id')!==`tooltip-shop-${index}`)return null;
      offers.push({index,pokemon});
    }
    diagnostics.shop='read';return {slots:cards.length,offers};
  }
  function visible(object){for(let p=object,n=0;p&&n<16;p=p.parentContainer,n++)if(p.visible===false||p.alpha===0)return false;return true;}
  function discover(){
    if(scene&&acceptScene(scene,sceneSource))return scene;
    scene=null;
    // Debug builds may expose a game; production builds require the rendered
    // object probe below. Always bind to this page's exact native game canvas.
    const game=window.PHASER_GAME,canvas=document.querySelector?.('#game canvas');
    if(game?.canvas===canvas&&canvas?.isConnected){
      try{const candidate=game.scene?.getScene?.('gameScene');
        if(candidate?.sys?.game===game&&acceptScene(candidate,'global'))return scene;
      }catch{/* Scene may not have been registered during boot yet. */}
    }
    for(const node of document.querySelectorAll('#game .item-detail-tooltip, #game .game-pokemon-detail-tooltip, #game .game-dialog')){
      const candidate=node.phaser?.scene;
      if(acceptScene(candidate,'dom'))break;
    }
    if(!scene)probeRenderLoop();
    return scene;
  }
  function bounds(sprite,s){
    try{
    if(!sprite||!visible(sprite))return null;
    const canvas=s.sys.game.canvas,r=canvas.getBoundingClientRect(),camera=s.cameras?.main,matrix=camera?.matrix;
    if(!r.width||!r.height||!matrix?.transformPoint||!(s.scale?.width>0)||!(s.scale?.height>0))return null;
    // Bounds of the sprite only: its parent may also contain a large HTML tooltip.
    const b=sprite.getBounds(),fx=sprite.scrollFactorX??1,fy=sprite.scrollFactorY??1;
    const points=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>matrix.transformPoint(x-camera.scrollX*fx,y-camera.scrollY*fy,{}));
    const xs=points.map(p=>r.left+p.x*r.width/s.scale.width),ys=points.map(p=>r.top+p.y*r.height/s.scale.height);
    const box={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
    if(!Object.values(box).every(Number.isFinite)||box.width<4||box.height<4||box.width>500||box.height>500||box.x<r.left||box.y<r.top||box.x+box.width>r.right||box.y+box.height>r.bottom||box.x+box.width<0||box.y+box.height<0||box.x>innerWidth||box.y>innerHeight)return null;
    return box;
    }catch{return null;}
  }
  function read(){
    diagnostics={nativeVersion:VERSION,scene:'waiting',global:!!window.PHASER_GAME,canvas:!!document.querySelector?.('#game canvas')?.isConnected};
    const s=discover();if(!s)return {...empty('waiting'),shop:renderedShop()};
    diagnostics.scene=sceneSource;diagnostics.ownBoard=s.board?.uid===s.uid&&s.board?.player?.id===s.uid;
    if(s.spectate||!s.uid)return empty('scouting');
    const sources=[],portals=[],shop=nativeShop(s);let count=0;
    // Public visible carousel offers do not depend on the currently viewed board.
    if(s.minigameManager?.uid===s.uid)s.minigameManager.items?.forEach?.(item=>{
      if(++count>128||!ID.test(item.name)||item.circle?.strokeColor!==0xffffff||!visible(item))return;
      const rect=bounds(visible(item.sprite)?item.sprite:item.tempSprite,s);if(rect)sources.push({key:`carousel:${count}`,kind:'carousel',item:item.name,rect});
    });
    // Only rendered public portal/symbol objects. No room state, maps or future offers.
    const ownAvatar=s.minigameManager?.uid===s.uid?s.minigameManager.pokemons?.get?.(s.uid):null;
    if(ownAvatar?.playerId===s.uid&&visible(ownAvatar)&&ownAvatar.scaleX!==0&&ownAvatar.scaleY!==0){
      const symbols=new Map();let symbolCount=0;
      s.minigameManager.symbols?.forEach?.(symbol=>{
        if(++symbolCount>128||!ID.test(symbol.synergy)||!visible(symbol)||!bounds(symbol,s))return;
        if(!symbols.has(symbol.portalId))symbols.set(symbol.portalId,[]);
        symbols.get(symbol.portalId).push(symbol.synergy);
      });
      let portalCount=0;
      s.minigameManager.portals?.forEach?.(portal=>{
        if(++portalCount>16||!visible(portal))return;
        const types=symbols.get(portal.id),rect=bounds(portal.sprite,s);
        if(types?.length&&types.length<=16&&rect)portals.push({key:`portal:${portalCount}`,types,rect});
      });
      diagnostics.portalObjects=portalCount;diagnostics.symbolObjects=symbolCount;
    }
    diagnostics.portalsRead=portals.length;
    const stageNode=document.querySelector?.('#game-stage-info .stage-information > p');
    const stageText=stageNode?.getClientRects?.().length&&getComputedStyle(stageNode).visibility!=='hidden'?stageNode.textContent.trim():'';
    const stageMatch=/^(?:\D{1,40})?(\d{1,2})$/.exec(stageText),stage=stageMatch?Number(stageMatch[1]):null;
    const withoutReserve=code=>{const offers=sources.filter(s=>s.kind==='carousel');return offers.length||portals.length?{...empty('carousel'),sources:offers,portals,stage,shop}:{...empty(code),shop,stage};};
    const stash=s.itemsContainer;
    if(s.board?.player?.id!==s.uid)return withoutReserve('scouting');
    const player=s.board.player,stashOwned=stash?.playerId===s.uid&&stash.pokemonId===null;
    let inventory=[],reserveSource;
    if(player.items?.forEach){player.items.forEach(id=>inventory.push(id));reserveSource='player';}
    else if(stashOwned&&Array.isArray(stash.items)){inventory=[...stash.items];reserveSource='rendered';}
    else return withoutReserve('scouting');
    if(inventory.length>256||!player.board?.forEach)return withoutReserve('unsupported');
    const equipped=[],board=[];let boardValid=s.board.uid===s.uid;
    if(inventory.some(id=>typeof id!=='string'||!ID.test(id)))return withoutReserve('unsupported');
    s.board.player.board.forEach(p=>{
      const values=[];p.items?.forEach?.(id=>values.push(id));
      equipped.push({pokemon:p.name,items:values});
      // The owned preparation lineup, never battle entities or another player's state.
      if(p.positionY<0)return;
      if(typeof p.id!=='string'||!(/^[\w-]{1,80}$/).test(p.id)||!Number.isInteger(p.positionX)||p.positionX<0||p.positionX>7||!Number.isInteger(p.positionY)||p.positionY>3||!Number.isInteger(p.stars)||p.stars<1||p.stars>4){boardValid=false;return;}
      const unit={key:'unit:'+p.id,pokemon:p.name,x:p.positionX,y:p.positionY,stars:p.stars,items:values};
      if(typeof p.canBePlaced==='boolean')unit.canPlace=p.canBePlaced;
      if(typeof p.doesCountForTeamSize==='boolean')unit.countsForTeam=p.doesCountForTeamSize;
      if(boardValid){const view=s.board.pokemons?.get?.(p.id);if(view?.playerId===s.uid&&view.name===p.name&&!view.inBattle&&visible(view)){const rect=bounds(view.sprite,s);if(rect)unit.rect=rect;}}
      board.push(unit);
    });
    if(equipped.length>64)return withoutReserve('unsupported');
    // Rendered items can lag the authoritative own inventory while a reward is
    // delivered. Missing/stale sprites must not erase a readable reserve.
    const remaining=new Map();for(const id of inventory)remaining.set(id,(remaining.get(id)??0)+1);
    for(let i=0;stashOwned&&Array.isArray(stash.list)&&i<stash.list.length&&i<256;i++){
      const item=stash.list[i];if(item.playerId!==s.uid||item.pokemonId!==null||!(remaining.get(item.name)>0))continue;
      remaining.set(item.name,remaining.get(item.name)-1);
      const rect=bounds(visible(item.sprite)?item.sprite:item.tempSprite,s);if(rect)sources.push({key:`stash:${i}`,kind:'stash',item:item.name,rect});
    }
    // Only the first choice already displayed in the native menu, never queued
    // rewards or another player's offers. DOM order is the native choice index.
    const rewards=[],menu=document.querySelector?.('.game-choice > .my-container'),cards=document.querySelectorAll('.game-choice-pokemons-list > .my-box.active.clickable');
    if(menu&&cards.length>0&&cards.length<=16&&menu.getClientRects?.().length&&getComputedStyle(menu).visibility!=='hidden'){
      const choice=s.board.player.choices?.[0];
      if(choice?.pokemons?.length===cards.length)for(let index=0;index<cards.length;index++){
        const pokemon=choice.pokemons[index],item=choice.items?.[index]??null;
        if(ID.test(pokemon)&&(item===null||ID.test(item)))rewards.push({index,pokemon,item});
      }
    }
    const level=Number.isInteger(player.experienceManager?.level)&&player.experienceManager.level>=1&&player.experienceManager.level<=20?player.experienceManager.level:null;
    const teamSize=Number.isInteger(player.boardSize)&&player.boardSize>=0&&player.boardSize<=24?player.boardSize:null;
    // This native counter already includes special rules such as Crowded.
    // Scope was checked above; never read a spectated player's capacity.
    const counter=document.querySelector?.('#game-team-info [data-tooltip-id="detail-team-size"] > span');
    const ratio=counter?.getClientRects?.().length&&getComputedStyle(counter).visibility!=='hidden'?/^(\d{1,2})\s*\/\s*(\d{1,2})$/.exec(counter.textContent.trim()):null;
    const capacity=ratio&&Number(ratio[2])>=1&&Number(ratio[2])<=24&&(teamSize===null||Number(ratio[1])===teamSize)&&(level===null||Number(ratio[2])===level||Number(ratio[2])===level+3)?Number(ratio[2]):null;
    return {code:'connected',inventory,equipped,sources,portals,stage,board:boardValid?board:null,boardMode:['pick','battle','town'].includes(s.board.mode)?s.board.mode:null,level,capacity,teamSize,rewards,shop,reserveSource};
  }
  function tick(){
    clearTimeout(timer);if(!token||Date.now()>until){stopProbe();scene=null;token=null;return;}
    if(!document.hidden){let snapshot;try{snapshot=read();}catch{snapshot=empty('unsupported');diagnostics.read='exception';}snapshot.diagnostics={...diagnostics,code:snapshot.code};window.postMessage({channel:CHANNEL,type:'snapshot',token,snapshot},location.origin);}else stopProbe();
    timer=setTimeout(tick,150);
  }
  window.addEventListener('message',event=>{
    const m=event.data;if(event.source!==window||event.origin!==location.origin||m?.channel!==CHANNEL||m.type!=='watch'||typeof m.token!=='string'||!/^[a-f0-9]{32}$/.test(m.token))return;
    if(m.enabled!==true){clearTimeout(timer);stopProbe();token=null;scene=null;return;}
    token=m.token;until=Date.now()+5000;tick();
  });
})();
