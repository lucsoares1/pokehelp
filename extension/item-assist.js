(()=>{
  const CHANNEL='PCH_NATIVE_ITEMS_V1',VERSION='0.18.1';
  globalThis.PCHItemAssist={create({onStatus=()=>{},onShopStatus=()=>{}}={}){
    const resourceBase=chrome.runtime.getURL(''),resource=path=>resourceBase+path;
    let config=null,model=null,portalModel=null,holderModel=null,choiceModel=null,shopModel=null,latest=null,advice=null,lastSummary='',lastInput='',timer=null,layer=null,shadow=null,hint=null,lastReceived=0,pointer=null,focus=null,pointerTick=0,lastShopStatus='',bridge='waiting',nativeDiagnostics={};
    const shopCards=new Set();
    let itemIds=new Set(),pokemonIds=new Set(),synergyIds=new Set(),catalog=new Map(),synergies=new Map();
    const ui=globalThis.PCHGameUI,token=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join(''),markers=new Map(),choices=new Map();
    const load=Promise.all([import(resource('item-model.mjs')),import(resource('portal-model.mjs')),import(resource('holder-model.mjs')),import(resource('choice-model.mjs')),import(resource('shop-read-model.mjs'))]).then(([items,portals,holders,rewards,shop])=>{model=items;portalModel=portals;holderModel=holders;choiceModel=rewards;shopModel=shop;refresh();}).catch(()=>{bridge='module-error';publish({code:'unsupported',inventory:null,equipped:[]});});
    const watch=enabled=>window.postMessage({channel:CHANNEL,type:'watch',token,enabled},location.origin);
    function publish(snapshot){const summary={code:snapshot?.code??'waiting',inventory:snapshot?.inventory??null,equipped:snapshot?.equipped??[],board:snapshot?.board?.map(({rect,...unit})=>unit)??null,boardMode:snapshot?.boardMode??null,level:snapshot?.level??null,capacity:snapshot?.capacity??null,teamSize:snapshot?.teamSize??null,stage:snapshot?.stage??null,portals:(snapshot?.portals??[]).map(p=>({key:p.key,types:p.types})),focus,diagnostics:{...nativeDiagnostics,hostVersion:VERSION,bridge,badges:shopCards.size,markers:markers.size,blocked:!!ui?.blocks().length}};const key=JSON.stringify(summary);if(key!==lastSummary){lastSummary=key;onStatus(summary);}}
    function diagnosticFields(value){const output={};for(const key of ['nativeVersion','scene','global','canvas','ownBoard','shop','domSlots','nativeSlots','portalObjects','symbolObjects','portalsRead','code','read']){const v=value?.[key];if(typeof v==='boolean'||Number.isInteger(v)&&v>=0&&v<=10000||typeof v==='string'&&/^[a-zA-Z0-9.:-]{1,40}$/.test(v))output[key]=v;}return output;}
    function clearChoices(){for(const [card,note]of choices){card.classList.remove('pch-item-choice','pch-item-choice-best');note.remove();}choices.clear();}
    function clearMarkers(){for(const m of markers.values())m.el.remove();markers.clear();layer?.remove();layer=null;shadow=null;hint=null;}
    function publishShop(status){const key=JSON.stringify(status);if(key!==lastShopStatus){lastShopStatus=key;onShopStatus(status);}}
    function clearShop(){for(const card of shopCards){card.classList.remove('pch-shop-target');card.style.removeProperty('--pch-native-buy-logo');card.style.removeProperty('--pch-native-buy-badge');}shopCards.clear();document.documentElement.removeAttribute('data-pch-shop-native');}
    function drawShop(){
      if(!config||!shopModel||document.hidden){clearShop();publishShop({code:config?'waiting':'off'});return;}
      const shop=latest?.shop;if(!shop){clearShop();publishShop({code:'waiting'});return;}
      const cards=[...document.querySelectorAll('.game-pokemons-store > .game-pokemon-portrait')];
      if(cards.length!==shop.slots){clearShop();publishShop({code:'waiting'});return;}
      if(!document.documentElement.hasAttribute('data-pch-shop-native'))document.documentElement.setAttribute('data-pch-shop-native','active');
      const wanted=new Set();
      for(const offer of shopModel.recommendedShopOffers(config,shop)){
        const card=cards[offer.index];if(!card||card.classList.contains('empty')||card.getAttribute('data-tooltip-id')!==`tooltip-shop-${offer.index}`)continue;
        wanted.add(card);if(!card.classList.contains('pch-shop-target')){card.classList.add('pch-shop-target');card.style.setProperty('--pch-native-buy-logo',`url("${resource('overlay/assets/brand/logo.png')}")`);card.style.setProperty('--pch-native-buy-badge',`url("${resource('assets/shop-buy.svg')}")`);}shopCards.add(card);
      }
      for(const card of shopCards)if(!wanted.has(card)){card.classList.remove('pch-shop-target');card.style.removeProperty('--pch-native-buy-logo');card.style.removeProperty('--pch-native-buy-badge');shopCards.delete(card);}
      publishShop({code:'connected',count:wanted.size,offers:shop.offers.length,targets:shopModel.shopTargets(config).size});
    }
    function clear(){clearMarkers();clearChoices();clearShop();}
    function mount(){
      // Position and appearance travel with each element. A rejected/removed style
      // sheet must never turn markers into ordinary text at the page's top left.
      if(!layer){layer=document.createElement('div');layer.id='pokechess-item-markers';layer.style.cssText='position:fixed;inset:0;z-index:2147482990;pointer-events:none;';shadow=layer.attachShadow({mode:'closed'});}
      const parent=document.fullscreenElement??document.documentElement;if(layer.parentNode!==parent)parent.append(layer);
    }
    function describe(goal,kind,item,rank){
      const name=catalog.get(goal.id)?.name??goal.id;
      if(kind==='carousel'&&item===goal.id)return `Equipamento da build para ${goal.recipient}.`;
      if(kind==='carousel')return advice.known?(rank?.completes?`Pegue e junte com ${rank.allocated.map(id=>catalog.get(id)?.name??id).join(' + ')} da reserva para montar ${name}.`:`Usado para montar ${name}.`):`Receita da build: ${name}. Reserva ainda não lida.`;
      if(goal.status==='available')return goal.holder?.source==='live'?`Equipamento pronto para usar agora em ${goal.holder.name}.`:'Equipamento pronto na reserva.';
      if(goal.status==='craft'){const number=model.recipeQueue(advice).find(q=>q.goal===goal)?.number;return `Receita ${number??''}${number===1?' · monte primeiro':''}: combine ${goal.recipe.map(id=>catalog.get(id)?.name??id).join(' + ')} para montar ${name}.`;}
      return `Junte com ${goal.missing.map(id=>catalog.get(id)?.name??id).join(' + ')} para montar ${name}.`;
    }
    function drawHint(){
      let selected=null;
      if(pointer)for(const m of markers.values()){const r=m.source.rect;if(pointer.x>=r.x&&pointer.x<=r.x+r.width&&pointer.y>=r.y&&pointer.y<=r.y+r.height){selected=m;break;}}
      if(!selected){hint?.remove();hint=null;return;}
      const {source,goal,portal,rank}=selected,nextFocus=portal?{kind:'portal',key:portal.key}:{item:source.item,kind:source.kind,goal:advice.goals.indexOf(goal)};
      if(JSON.stringify(focus)!==JSON.stringify(nextFocus)){focus=nextFocus;publish(latest);}
      if(!hint){hint=document.createElement('div');hint.className='hint';hint.style.cssText='position:fixed;box-sizing:border-box;width:280px;padding:12px;background:#1b2030;color:#f1f4fb;border:1px solid #e8c36d;border-radius:8px;font:12px/1.5 Arial,sans-serif;pointer-events:none;box-shadow:0 3px 6px #0008;';hint.setAttribute('role','tooltip');shadow.append(hint);}
      const content=JSON.stringify(portal?[portal.types,portal.targets,portal.support,latest.stage]:[source.item,goal.id,goal.recipient,goal.status,goal.missing,rank?.allocated,rank?.missing,source.kind,goal.holder,goal.transferTo,advice.source,model.recipeQueue(advice).find(q=>q.goal===goal)?.number]);
      if(hint.dataset.content!==content){
        hint.dataset.content=content;hint.replaceChildren();const title=document.createElement('strong');
        title.textContent=portal?'Portal sugerido':`${catalog.get(source.item)?.name??source.item} · ${source.kind==='stash'?'sua reserva':'carrossel'}`;hint.append(title);
        const text=document.createElement('p');text.textContent=portal?(portal.targets.length?`Favorece opções para ${portal.targets.map(t=>t.label??t.name).join(', ')}.`:'Afinidade com os tipos da equipe final.') : describe(goal,source.kind,source.item,rank);hint.append(text);
        if(portal?.support?.length){const support=document.createElement('p');support.textContent=(choiceModel.fieldSynergies(config,latest).source==='guide'?'Tipos do guia: ':'Apoia os tipos do campo: ')+portal.support.map(s=>`${synergies.get(s.id)?.name??s.id} ${s.count}${s.next?'/'+s.next:''}`).join(', ')+'. Não confirma ativação: depende do Pokémon sorteado.';hint.append(support);}
        const recipe=document.createElement('div');recipe.className='recipe';
        if(portal){for(const type of portal.types){const img=document.createElement('img'),s=synergies.get(type);if(s?.image){img.src=resource('overlay/'+s.image);img.alt=s.name;recipe.append(img);}}}
        else for(const [i,id]of [...goal.recipe,goal.id].entries()){if(i){const sign=document.createElement('span');sign.textContent=i===goal.recipe.length?'=':'+';recipe.append(sign);}const item=catalog.get(id);if(item){const img=document.createElement('img');img.src=resource('overlay/'+item.image);img.alt=item.name;recipe.append(img);}}
        hint.append(recipe);if(!portal){const now=document.createElement('p');now.textContent=goal.holder?(goal.holder.source==='guide'?'Pelo guia, confirme no campo: ':'Segura agora no seu campo: ')+goal.holder.name+(goal.holder.temporary?' · provisório.':'.')+' '+goal.holder.reason:advice.source==='live'?'Agora: sem portador elegível com vaga no campo. Guarde na reserva.':'Agora: campo não lido; nenhum portador confirmado.';hint.append(now);if(source.kind==='stash'&&source.item!==goal.id){const combine=document.createElement('p');combine.textContent='Monte a receita na reserva antes de equipar.';hint.append(combine);}}const target=document.createElement('small');target.textContent=portal?(portal.stageKnown?`Etapa ${latest.stage}. Tipos orientam o sorteio; não garantem o Pokémon.`:'Etapa não identificada: somente afinidade de tipos.'):'Destino final: '+goal.recipient;hint.append(target);
        title.style.cssText='display:block;margin:0 0 7px;color:#ffe09b;';target.style.cssText='font-size:11px;color:#bdcbe0;';recipe.style.cssText='display:flex;align-items:center;gap:7px;margin:7px 0;';
        for(const p of hint.querySelectorAll('p'))p.style.cssText='display:block;margin:0 0 7px;';
        for(const img of recipe.querySelectorAll('img'))img.style.cssText='width:26px;height:26px;object-fit:contain;';
      }
      const blockers=[...(ui?.widgets?.()??[]),...[...document.querySelectorAll('#game .item-detail-tooltip, #game .game-pokemon-detail-tooltip, #pokechess-helper-extension')].flatMap(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none'?[{x:r.left,y:r.top,width:r.width,height:r.height}]:[];})];
      const r=source.rect,h=hint.offsetHeight,w=280;
      const candidates=[{x:r.x+r.width+12,y:r.y},{x:r.x-w-12,y:r.y},{x:r.x+r.width+12,y:r.y+r.height+14},...blockers.map(b=>({x:r.x+r.width+12,y:b.y+b.height+10}))];
      const box=candidates.map(p=>({...p,width:w,height:h})).find(b=>b.x>=8&&b.y>=8&&b.x+w<=innerWidth-8&&b.y+h<=innerHeight-8&&!blockers.some(p=>ui?.overlaps(b,p,6)));
      hint.style.visibility=box?'visible':'hidden';if(box){hint.style.left=box.x+'px';hint.style.top=box.y+'px';}
    }
    function decorateChoices(){
      if(latest?.code==='scouting'||latest?.code==='unsupported'){clearChoices();return;}
      const cards=[];
      let rewardIndex=0;
      for(const card of document.querySelectorAll('.game-choice-items-list > .my-box.active.clickable, .game-choice-pokemons-list > .my-box.active.clickable')){
        const mixed=card.parentElement.classList.contains('game-choice-pokemons-list'),img=card.querySelector(mixed?':scope > .choice-additional-item > img':':scope > img');
        const index=mixed?rewardIndex++:null,pokemonWanted=mixed&&!!card.querySelector('.game-pokemon-portrait.planned'),reward=mixed?latest?.rewards?.find(r=>r.index===index):null,types=[];let id;
        if(mixed)for(const icon of card.querySelectorAll('.game-pokemon-portrait-types img'))try{const url=new URL(icon.src,document.baseURI),type=/^\/assets\/types\/([A-Z][A-Z0-9_]*)\.(?:svg|png)$/.exec(url.pathname)?.[1];if(url.origin===location.origin&&synergyIds.has(type)&&!types.includes(type))types.push(type);}catch{/* Only native type icons. */}
        try{if(img){const url=new URL(img.src,document.baseURI);if(url.origin===location.origin)id=/^\/assets\/item\/([A-Z][A-Z0-9_]*)\.png$/.exec(url.pathname)?.[1];}}catch{/* Unknown URLs are not offers. */}
        if(id&&itemIds.has(id)||pokemonWanted||reward||types.length)cards.push({card,id,mixed,pokemonWanted,pokemon:reward?.pokemon,types});
      }
      const offers=cards.map(c=>({...c,item:c.id})),wandRanks=new Map(choiceModel.rankWandRewards(config,latest,offers.filter(c=>!c.mixed)).map(c=>[c.card,c])),itemRanks=new Map(model.rewardChoices(advice,offers).map(c=>[c.source.card,c])),equipmentRanks=new Map(holderModel.rankEquipmentRewards(config,latest,offers).map(c=>[c.card,c])),pokemonRanks=new Map(choiceModel.rankPokemonRewards(config,latest,cards.filter(c=>c.mixed)).map(c=>[c.card,c]));
      const ranked=cards.map(source=>({source,wand:wandRanks.get(source.card),rank:itemRanks.get(source.card)?.rank,equipment:equipmentRanks.get(source.card),pokemon:pokemonRanks.get(source.card),score:(wandRanks.get(source.card)?.score??0)+(pokemonRanks.get(source.card)?.score??0)+(itemRanks.get(source.card)?.rank?.score??equipmentRanks.get(source.card)?.score??0)})).filter(c=>c.wand||c.rank||c.pokemon||c.equipment).sort((a,b)=>b.score-a.score||(advice.known?(a.rank?.goalIndex??Infinity)-(b.rank?.goalIndex??Infinity):0)),wanted=new Set();
      const bestChoice=ranked.find(c=>c.wand?c.wand.primary:c.pokemon?.score>0||!c.equipment?.covered&&!c.equipment?.noFit&&(advice.known||!!c.equipment));
      for(const entry of ranked){const {source:{card,mixed},rank,pokemon,equipment,wand}=entry,best=entry===bestChoice;wanted.add(card);let note=choices.get(card);if(!note){note=document.createElement('small');note.className='pch-item-choice-note';card.append(note);choices.set(card,note);}card.classList.add('pch-item-choice');card.classList.toggle('pch-item-choice-best',best);
        const reasons=[];if(wand){reasons.push(wand.reason);if(wand.beneficiaries.length)reasons.push((wand.source==='plan'?'Na comp: ':wand.source==='plan+live'?'Comp e campo: ':wand.source==='plan+guide'?'Comp e guia: ':wand.source==='guide'?'Pelo guia, se entrar: ':'No campo: ')+wand.beneficiaries.slice(0,3).map(p=>p.name).join(', '));if(wand.activeNow===false&&wand.beneficiaries.length)reasons.push('Sem Fada em campo agora');}if(pokemon?.wanted)reasons.push('Da equipe final');
        if(pokemon?.gains.length)reasons.push((pokemon.source==='guide'?'Pelo guia: ':'Se entrar em campo: ')+pokemon.gains.map(g=>`${synergies.get(g.id)?.name??g.id} ${g.from} → ${g.to}`).join(', '));
        else if(pokemon?.fit)reasons.push('Tipos da comp final');
        if(rank){const completes=advice.known&&rank.completes&&rank.goal.id!==entry.source.id;reasons.push(`${mixed?'Item: ':''}${completes?'completa ':''}${catalog.get(rank.goal.id)?.name??rank.goal.id} para ${rank.goal.recipient}`);if(completes&&rank.allocated.length)reasons.push('Na reserva: '+rank.allocated.map(id=>catalog.get(id)?.name??id).join(' + '));}
        if(equipment){
          if(equipment.covered)reasons.push('Já coberto na build');
          else if(equipment.noFit)reasons.push('Sem encaixe seguro com vaga na build · guarde para avaliar depois');
          else{
            if(!rank)reasons.push(`Fora da build · por atributos, para ${equipment.recipient.name}`);
            else if(equipment.exact)reasons.push('Item da build');
            const h=equipment.holder;
            reasons.push(h?(h.source==='live'?'Agora: ':'Pelo guia, se estiver em campo: ')+h.name+(h.temporary?' (provisório)':''):equipment.source==='live'?'Guarde: sem portador com vaga no campo':'Guarde até ter um portador com vaga');
          }
        }
        const text=(best?'Sugestão · ':wand?.source==='none'?'Sem encaixe · ':'Alternativa · ')+reasons.join(' · ')+(!advice.known&&rank?' · reserva não lida':'');if(note.textContent!==text)note.textContent=text;}
      for(const [card,note]of choices)if(!wanted.has(card)){card.classList.remove('pch-item-choice','pch-item-choice-best');note.remove();choices.delete(card);}
    }
    function draw(){
      drawShop();
      if(!config||!advice||document.hidden){clear();return;}
      decorateChoices();
      if(ui?.blocks().length){clearMarkers();return;}
      const active=new Set(),allocations=new Map(),queue=model.recipeQueue(advice),numbers=new Map(queue.map(q=>[q.goal,q.number]));
      for(const g of [...advice.goals].sort((a,b)=>(numbers.get(a)??0)-(numbers.get(b)??0)))for(const id of g.allocated){if(!allocations.has(id))allocations.set(id,[]);allocations.get(id).push(g);}
      const carousel=model.carouselItemChoices(advice,(latest?.sources??[]).filter(s=>s.kind==='carousel'));
      const choices=new Map(carousel.map(c=>[c.source.key,c]));
      function marker(source,{goal=null,portal=null,rank=null,label,alternative=false}){
        if((ui?.widgets?.()??[]).some(b=>ui.overlaps(source.rect,b,20)))return;
        mount();active.add(source.key);let m=markers.get(source.key);if(!m){const el=document.createElement('div'),badge=document.createElement('div'),note=document.createElement('span');el.setAttribute('aria-hidden','true');badge.style.cssText=`position:absolute;left:-9px;top:-10px;width:22px;height:25px;background-image:url("${resource('overlay/assets/brand/logo.png')}"),url("${resource('assets/shop-buy.svg')}");background-position:center 42%,center;background-size:53% auto,contain;background-repeat:no-repeat;filter:drop-shadow(0 2px 2px #000a);`;el.append(badge,note);shadow.append(el);m={el,badge,note};markers.set(source.key,m);}Object.assign(m,{source,goal,portal,rank});m.el.className='mark'+(alternative?' alternative':'');
        const {x,y,width,height}=source.rect;m.el.style.cssText=`position:absolute;box-sizing:border-box;border:${alternative?'1px solid #8b9db3':'2px solid #ffd45b'};border-radius:8px;box-shadow:${alternative?'none':'0 0 0 2px #432e13b3'};pointer-events:none;left:${x-3}px;top:${y-3}px;width:${width+6}px;height:${height+6}px;`;
        m.badge.style.display=alternative?'none':'block';m.note.style.cssText=`position:absolute;left:50%;bottom:-12px;transform:translateX(-50%);white-space:nowrap;max-width:84px;overflow:hidden;text-overflow:ellipsis;background:${alternative?'#d7e1ed':'#ffd45b'};color:#241d0b;border-radius:5px;padding:1px 5px;font:800 10px/14px Arial,sans-serif;box-shadow:0 2px 4px #0008;`;m.note.textContent=label;
      }
      for(const source of latest?.sources??[]){
        const choice=choices.get(source.key),goal=source.kind==='stash'?allocations.get(source.item)?.shift():choice?.rank.goal;if(!goal)continue;
        marker(source,{goal,rank:choice?.rank,label:source.kind==='stash'?(numbers.has(goal)?`#${numbers.get(goal)} · ${goal.status==='craft'?'Montar':'Guardar'}`:(goal.holder?.source==='guide'?'Guia: ':'')+(goal.holder?.name??goal.recipient)):choice.primary?(choice.rank.completes&&source.item!==goal.id?'Completa':'Prioridade'):advice.known?'Alternativa':'Da build',alternative:source.kind==='carousel'&&!choice.primary});
      }
      const field=choiceModel.fieldSynergies(config,latest),portal=portalModel.rankPortalOffers(config.portal,latest?.portals,latest?.stage,field.current)[0];
      if(portal)marker({...portal,kind:'portal'},{portal,label:'Portal sugerido'});
      for(const [key,m]of markers)if(!active.has(key)){m.el.remove();markers.delete(key);}
      drawHint();
    }
    function refresh(){
      if(!config||!model)return;const input=JSON.stringify([latest?.code,latest?.inventory,latest?.equipped,latest?.board?.map(({rect,...unit})=>unit),latest?.boardMode]);
      if(input!==lastInput){lastInput=input;focus=null;advice=holderModel.holderAdvice(config.plan,config.items,config.pokemons,latest,{guide:config.guide,synergyGivenByItem:config.synergyGivenByItem});}
      draw();publish(latest);
    }
    window.addEventListener('message',event=>{
      const m=event.data;if(!config||!model||event.source!==window||event.origin!==location.origin||m?.channel!==CHANNEL||m.type!=='snapshot'||m.token!==token)return;
      lastReceived=Date.now();bridge='received';nativeDiagnostics=diagnosticFields(m.snapshot?.diagnostics);
      latest=model.validItemSnapshot(m.snapshot,itemIds,pokemonIds,synergyIds);nativeDiagnostics.validation=latest?'ok':'rejected';
      // A catalog mismatch in the reserve must not discard independently valid
      // public carousel offers. Keep their own strict validator and no inventory.
      if(!latest&&m.snapshot?.code==='connected'){latest=model.validItemSnapshot({...m.snapshot,code:'carousel',inventory:null,equipped:[],sources:(Array.isArray(m.snapshot.sources)?m.snapshot.sources:[]).filter(s=>s?.kind==='carousel'),board:null,boardMode:null,level:null,capacity:null,teamSize:null,rewards:[]},itemIds,pokemonIds,synergyIds);if(latest)nativeDiagnostics.validation='partial';}
      latest??={code:'unsupported',inventory:null,equipped:[],sources:[]};latest.shop=shopModel.validShopSnapshot(m.snapshot?.shop,pokemonIds);if(m.snapshot?.shop&&!latest.shop)nativeDiagnostics.shop='catalog-rejected';refresh();
    });
    document.addEventListener('pointermove',event=>{if(!config)return;pointer={x:event.clientX,y:event.clientY};if(!pointerTick)pointerTick=requestAnimationFrame(()=>{pointerTick=0;if(!ui?.blocks().length)drawHint();});},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){pointer=null;clear();watch(false);}else if(config){latest=null;lastInput='';watch(true);refresh();}});
    ui?.subscribe(()=>{pointer=null;focus=null;refresh();});
    function heartbeat(){clearTimeout(timer);if(!config)return;if(!document.hidden){if(Date.now()-lastReceived>2000){latest=null;lastInput='';bridge=lastReceived?'stale':'waiting';refresh();}watch(true);}timer=setTimeout(heartbeat,2000);}
    return {sync(next){config=next;bridge=next?'waiting':'off';nativeDiagnostics={};lastReceived=0;latest=null;advice=null;focus=null;pointer=null;lastInput='';lastSummary='';clear();if(!config){clearTimeout(timer);watch(false);publish({code:'off'});publishShop({code:'off'});return;}catalog=new Map(config.items.map(i=>[i.id,i]));itemIds=new Set(catalog.keys());pokemonIds=new Set(config.pokemons.map(p=>p.id));synergies=new Map((config.synergies??[]).map(s=>[s.id,s]));synergyIds=new Set(synergies.keys());heartbeat();void load;refresh();},publish(){if(lastSummary)onStatus(JSON.parse(lastSummary));}};
  }};
})();
