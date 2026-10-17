import {createPanelLayout,refreshDecisionSummary} from './panel-layout.mjs';
import {createItemTooltips} from './item-tooltip.mjs';
import {overlayView} from './lib/overlay-view.mjs';
import {createOverlayGuide} from './lib/overlay-guide.mjs';
import {STATE_KEY,referenceKey,normalizeState,GAME_ORIGIN,EXTENSION_VERSION} from '../protocol.mjs';
import {itemAdviceView} from '../item-view.mjs';
import {readDiagnostics} from '../diagnostic-view.mjs';
import {boardAdvice} from '../board-model.mjs';
import {boardAdviceView,boardAlertView} from '../board-view.mjs';
const root=document.querySelector('#helper-overlay'),status=document.querySelector('#status');
const send=m=>parent.postMessage({channel:'PCH_OVERLAY_FRAME',...m},GAME_ORIGIN);
const bundle=await fetch('plans.json').then(r=>{if(!r.ok)throw new Error('Dados da extensão indisponíveis.');return r.json();});
const layout=createPanelLayout(root),tooltips=createItemTooltips(root,bundle.guide.items);
let state,drag=false;
let shopStatus={code:'loading'};
let itemStatus={code:'waiting'};
let lastBoardAlert=false;
function showBoardStatus(){
  if(!state)return;
  const items=root.querySelector('[data-ov-item-assist]'),body=root.querySelector('.ov-body');if(!items||!body)return;
  let output=root.querySelector('[data-ov-board-assist]');if(!output){output=document.createElement('section');output.className='ov-board-assist';output.dataset.ovBoardAssist='';output.setAttribute('aria-label','Verificador de campo e banco');output.tabIndex=-1;items.before(output);}
  let alert=root.querySelector('[data-ov-board-alert]');if(!alert){alert=document.createElement('div');alert.className='ov-board-alert';alert.dataset.ovBoardAlert='';body.before(alert);}
  const plan=state.selection?bundle.plans[referenceKey(state.selection)]:null,snapshot=state.shopEnabled&&!state.closed?itemStatus:{code:'off'};
  const guideLevel=Number.isInteger(snapshot.level)?Math.max(2,Math.min(bundle.guide.rules.experience.maxLevel,snapshot.level)):state.guideLevel;
  const advice=boardAdvice(plan,bundle.guide.pokemons,snapshot,{guide:createOverlayGuide(plan,guideData,bundle.guide.rules,{...state,guideLevel}),items:bundle.guide.items,synergies:bundle.guide.synergies,teamRules:bundle.guide.teamRules});
  const open=output.querySelector('[data-board-roster]')?.open,planOpen=output.querySelector('[data-board-plan]')?.open;output.innerHTML=boardAdviceView(advice,bundle.guide.synergies);const roster=output.querySelector('[data-board-roster]'),notes=output.querySelectorAll(':scope>small.ov-board-note');if(roster)notes.forEach(note=>roster.append(note));if(open&&roster)roster.open=true;if(planOpen&&output.querySelector('[data-board-plan]'))output.querySelector('[data-board-plan]').open=true;
  const active=!!(state.minimized&&!state.closed&&state.shopEnabled&&advice.suggestion);alert.hidden=!active;alert.innerHTML=active?boardAlertView(advice):'';
  if(active!==lastBoardAlert){lastBoardAlert=active;send({type:'board-alert',active});}
}
function showReadDiagnostics(){
  const section=root.querySelector('[data-ov-diagnostics-slot]');if(!section)return;
  let details=section.querySelector('[data-read-diagnostics]');
  if(!details){details=document.createElement('details');details.dataset.readDiagnostics='';details.className='ov-read-diagnostics';const title=document.createElement('summary');title.textContent='Diagnóstico da leitura';details.append(title,document.createElement('p'),document.createElement('pre'));section.append(details);}
  const view=readDiagnostics(itemStatus,EXTENSION_VERSION);details.querySelector('p').textContent=view.summary;details.querySelector('pre').textContent=view.text;
}
function showItemStatus(){const output=root.querySelector('[data-ov-item-assist]');if(!output||!state)return;const plan=state.selection?bundle.plans[referenceKey(state.selection)]:null;const expanded=new Set([...output.querySelectorAll('[data-ov-disclosure][open]')].map(d=>d.dataset.ovDisclosure));const open=output.querySelector('[data-item-recipes]')?.open;output.innerHTML=itemAdviceView(plan,bundle.guide.items,bundle.guide.pokemons,itemStatus,{rules:bundle.guide.rules,obtained:state.obtained,synergies:bundle.guide.synergies,guide:createOverlayGuide(plan,guideData,bundle.guide.rules,state),synergyGivenByItem:bundle.guide.teamRules.synergyGivenByItem});if(open&&output.querySelector('[data-item-recipes]'))output.querySelector('[data-item-recipes]').open=true;refreshDecisionSummary(root);output.querySelectorAll('[data-ov-disclosure]').forEach(d=>d.open=expanded.has(d.dataset.ovDisclosure));}
window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==GAME_ORIGIN||event.data?.channel!=='PCH_OVERLAY_FRAME'||event.data.type!=='item-status')return;itemStatus=event.data.status??{};showItemStatus();showBoardStatus();showReadDiagnostics();});
const shopMessages={off:'Destaques de Pokémon desligados. Planejador anterior preservado.',conflict:'Edição do planejador preservada. Aguardando leitura nativa da loja para os destaques.',incompatible:'Planejador preservado. Aguardando leitura nativa da loja para os destaques.',error:'Não foi possível sincronizar o planejador. Aguardando leitura nativa da loja.',timeout:'O planejador não respondeu. Aguardando leitura nativa; use Reverificar loja para tentar novamente.',loading:'Conectando à loja do jogo…'};
function showShopStatus(){const output=root.querySelector('[data-ov-shop-status]');if(!output)return;const s=shopStatus;output.textContent=s.code==='synced'?(s.targets===0?'Todas as peças foram marcadas como prontas.':s.source==='native'?`Loja lida: ${s.offers} oferta(s), ${s.count} recomendada(s).`:s.shopPresent?(s.count?`${s.count} oferta(s) indicada(s) destacada(s) na loja.`:'Planejador atualizado; aguardando leitura nativa das ofertas.'):'Plano preparado. Aguardando a loja da partida.'):(shopMessages[s.code]??'Aguardando conexão com a loja.');}
window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==GAME_ORIGIN||event.data?.channel!=='PCH_OVERLAY_FRAME'||event.data.type!=='shop-status')return;shopStatus=event.data.status??{};showShopStatus();});
const guideData={...bundle.guide,maps:{pokemons:new Map(bundle.guide.pokemons.map(p=>[p.id,p])),synergies:new Map(bundle.guide.synergies.map(s=>[s.id,s])),items:new Map(bundle.guide.items.map(i=>[i.id,i]))}};
function render(next){
  state=normalizeState(next,bundle.plans);const plan=state.selection?bundle.plans[referenceKey(state.selection)]:null;
  const advancedOpen=root.querySelector('[data-ov-advanced]')?.open;
  const itemOpen=root.querySelector('[data-item-recipes]')?.open,diagnosticsOpen=root.querySelector('[data-read-diagnostics]')?.open,boardOpen=root.querySelector('[data-board-roster]')?.open,boardPlanOpen=root.querySelector('[data-board-plan]')?.open;
  const focus=root.ownerDocument.activeElement,shopFocus=focus?.hasAttribute('data-ov-shop'),slot=focus?.getAttribute('data-ov-obtained'),variant=focus?.hasAttribute('data-ov-variant'),level=focus?.getAttribute('data-ov-level'),open=root.querySelector('.ov-shopping')?.open,scroll=root.querySelector('.ov-roster')?.scrollLeft??0;
  document.documentElement.dataset.theme=state.theme;
  const scrollY=root.querySelector('.ov-body')?.scrollTop??0;
  root.innerHTML=overlayView(plan,{...state,visible:true},{scope:'game',guide:createOverlayGuide(plan,guideData,bundle.guide.rules,state)});
  layout.mount();tooltips.refresh();if(advancedOpen&&root.querySelector('[data-ov-advanced]'))root.querySelector('[data-ov-advanced]').open=true;
  const version=root.querySelector('[data-ov-extension-version]');if(version)version.textContent='Extensão '+EXTENSION_VERSION;
  root.querySelector('[data-ov-window]')?.remove();root.querySelector('.ov-footer a[href="overlay.html"]')?.remove();
  root.querySelector('.ov-empty a')?.setAttribute('href',state.helperOrigin+'/#compositions');
  const link=root.querySelector('.ov-footer a');if(link&&plan)link.href=state.helperOrigin+'/'+plan.href;
  root.querySelectorAll('a').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});
  const details=root.querySelector('.ov-shopping');if(details)details.open=!!open;
  const roster=root.querySelector('.ov-roster');if(roster)roster.scrollLeft=scroll;
  const body=root.querySelector('.ov-body');if(body)body.scrollTop=scrollY;
  if(slot!=null)root.querySelector(`[data-ov-obtained="${slot}"]`)?.focus({preventScroll:true});else if(variant)root.querySelector('[data-ov-variant]')?.focus({preventScroll:true});else if(level!=null)root.querySelector(`[data-ov-level="${level}"]`)?.focus({preventScroll:true});
  if(shopFocus)root.querySelector('[data-ov-shop]')?.focus({preventScroll:true});
  showShopStatus();showItemStatus();showBoardStatus();showReadDiagnostics();if(boardOpen&&root.querySelector('[data-board-roster]'))root.querySelector('[data-board-roster]').open=true;if(boardPlanOpen&&root.querySelector('[data-board-plan]'))root.querySelector('[data-board-plan]').open=true;if(diagnosticsOpen)root.querySelector('[data-read-diagnostics]').open=true;if(itemOpen)root.querySelector('[data-item-recipes]').open=true;send({type:'ready'});
}
async function action(payload){try{const result=await chrome.runtime.sendMessage({type:'PCH_PATCH',...payload});if(!result?.ok)throw new Error(result?.error||'Não foi possível atualizar.');render(result.state);status.textContent='Overlay atualizado.';}catch(e){status.textContent=e.message;}}
root.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-ov-options')&&state.minimized)void action({action:'minimize'});
  if(b.hasAttribute('data-board-expand'))void (async()=>{if(state.minimized)await action({action:'minimize'});layout.activate('now');const section=root.querySelector('[data-ov-board-assist]');section?.scrollIntoView({block:'nearest'});section?.focus({preventScroll:true});})();
  if(b.hasAttribute('data-ov-shop-retry')){send({type:'retry-shop'});status.textContent='Reverificando a loja do jogo.';}
  if(b.hasAttribute('data-ov-obtained'))void action({action:'toggle',slot:Number(b.dataset.ovObtained)});
  if(b.hasAttribute('data-ov-reset'))void action({action:'reset'});
  if(b.hasAttribute('data-ov-minimize'))void action({action:'minimize'});
  if(b.hasAttribute('data-ov-close'))void action({action:'close'});
  if(b.hasAttribute('data-ov-level')){void action({action:'level',level:Number(b.dataset.ovLevel)});}
});
root.addEventListener('change',event=>{if(event.target.hasAttribute('data-ov-variant'))void action({action:'variant',index:Number(event.target.value)});if(event.target.hasAttribute('data-ov-shop'))void action({action:'shop',enabled:event.target.checked});});
root.addEventListener('pointerdown',event=>{if(event.button!==0||!event.target.closest('[data-ov-drag]'))return;drag=true;root.setPointerCapture(event.pointerId);event.preventDefault();send({type:'start',x:event.screenX,y:event.screenY});});
root.addEventListener('pointermove',event=>{if(drag)send({type:'move',x:event.screenX,y:event.screenY});});
function end(){if(drag){drag=false;send({type:'end'});}}root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
root.addEventListener('keydown',event=>{if(event.target.hasAttribute('data-ov-drag')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();send({type:'key',key:event.key,shift:event.shiftKey});}});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[STATE_KEY])render(changes[STATE_KEY].newValue);});
const result=await chrome.runtime.sendMessage({type:'PCH_STATE'});if(result?.ok)render(result.state);
