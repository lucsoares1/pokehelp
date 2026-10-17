import {loadGameData} from './data-client.mjs';
import {createOverlayPlan,emptyOverlayState,parseOverlayState,selectionKey,clampOverlayPosition,OVERLAY_KEY} from './overlay-model.mjs';
import {overlayView} from './overlay-view.mjs';
import {createOverlayGuide} from './overlay-guide.mjs';

export function wireOverlay(root,{announce=()=>{},onSelect=async()=>{},onAction=()=>{}}={}){
  let state;try{state=parseOverlayState(localStorage.getItem(OVERLAY_KEY));}catch{state=emptyOverlayState();}
  let context=null,plan=null,error='',generation=0,drag=null;
  const snapshots=new Map();
  function save(){try{localStorage.setItem(OVERLAY_KEY,JSON.stringify(state));}catch{announce('O painel funciona nesta aba, mas o navegador não permitiu salvar a seleção.');}}
  function position(){if(!state.position||root.hidden)return;const r=root.getBoundingClientRect(),p=clampOverlayPosition(state.position,r.width,r.height,document.documentElement.clientWidth,document.documentElement.clientHeight);root.style.left=p.x+'px';root.style.top=p.y+'px';root.style.right='auto';root.style.bottom='auto';}
  function render(){
    const focus=document.activeElement,slot=focus?.getAttribute('data-ov-obtained'),variant=focus?.hasAttribute('data-ov-variant'),level=focus?.getAttribute('data-ov-level'),open=root.querySelector('.ov-shopping')?.open,scroll=root.querySelector('.ov-roster')?.scrollLeft??0;
    const scrollY=root.querySelector('.ov-body')?.scrollTop??0;
    const guide=context&&plan?createOverlayGuide(plan,context.data,context.progression,state):null;
    root.hidden=!state.visible;root.innerHTML=overlayView(plan,state,{error,guide});
    const details=root.querySelector('.ov-shopping'),roster=root.querySelector('.ov-roster');if(details)details.open=!!open;if(roster)roster.scrollLeft=scroll;
    const body=root.querySelector('.ov-body');if(body)body.scrollTop=scrollY;
    if(!state.position){root.style.left='';root.style.top='';root.style.right='';root.style.bottom='';}position();
    if(slot!=null)root.querySelector(`[data-ov-obtained="${slot}"]`)?.focus({preventScroll:true});else if(variant)root.querySelector('[data-ov-variant]')?.focus({preventScroll:true});else if(level!=null)root.querySelector(`[data-ov-level="${level}"]`)?.focus({preventScroll:true});
  }
  async function resolve(selection,preferred){
    let data=preferred?.manifest.id===selection.snapshotId?preferred:null;
    if(!data){if(!snapshots.has(selection.snapshotId))snapshots.set(selection.snapshotId,loadGameData(selection.snapshotId).catch(e=>{snapshots.delete(selection.snapshotId);throw e;}));data=await snapshots.get(selection.snapshotId);}
    const comp=data.compositions.find(c=>c.id===selection.compId);if(!comp)throw new Error('Composição indisponível neste snapshot. Importe outra equipe.');
    const progression=await data.progression().catch(()=>null);
    return {comp,data,progression,plan:createOverlayPlan(comp,data,selection.variantIndex,progression)};
  }
  async function restore(preferred){const token=++generation;if(!state.selection){render();return;}try{const next=await resolve(state.selection,preferred);if(token!==generation)return;context=next;plan=next.plan;error='';state.obtained=state.obtained.filter(i=>i<plan.units.length);}catch(e){if(token!==generation)return;error=e.message;plan=null;}render();}
  async function importTeam(comp,data,index){
    const token=++generation,selection={compId:comp.id,snapshotId:data.manifest.id,variantIndex:index},next=await resolve(selection,data);if(token!==generation)return;
    const same=selectionKey(state.selection)===selectionKey(selection);context=next;plan=next.plan;error='';state={...state,selection,obtained:same?state.obtained:[],visible:true,minimized:false};save();render();root.focus({preventScroll:true});announce(`${plan.title}, ${plan.variantLabel}, aberta no overlay do Helper.`);await onSelect(selection);
  }
  async function applyRemote(remote){
    const next=parseOverlayState(JSON.stringify({...remote,schemaVersion:1,visible:state.visible,minimized:state.minimized,position:state.position}));if(!next.selection)return;
    const changed=selectionKey(next.selection)!==selectionKey(state.selection);state={...next,visible:changed?true:state.visible};save();if(changed||!plan)await restore(context?.data);else render();
  }
  function show(){state.visible=true;save();render();root.focus({preventScroll:true});}
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-ov-level')&&plan){state.guideLevel=Number(button.dataset.ovLevel);save();render();root.querySelector(`[data-ov-level="${state.guideLevel}"]`)?.focus({preventScroll:true});onAction({action:'level',level:state.guideLevel,selection:state.selection});return;}
    if(button.hasAttribute('data-ov-close')){state.visible=false;save();render();document.querySelector('[data-overlay-toggle]')?.focus({preventScroll:true});return;}
    if(button.hasAttribute('data-ov-minimize')){state.minimized=!state.minimized;save();render();root.querySelector('[data-ov-minimize]')?.focus({preventScroll:true});return;}
    if(button.hasAttribute('data-ov-reset')){state.obtained=[];save();render();onAction({action:'reset',selection:state.selection});announce('Marcações zeradas no Helper.');return;}
    if(button.hasAttribute('data-ov-obtained')&&plan){const slot=Number(button.dataset.ovObtained);if(!plan.units[slot])return;state.obtained=state.obtained.includes(slot)?state.obtained.filter(i=>i!==slot):[...state.obtained,slot];save();render();onAction({action:'toggle',slot,selection:state.selection});}
  });
  root.addEventListener('change',event=>{if(event.target.hasAttribute('data-ov-variant')&&context)void importTeam(context.comp,context.data,Number(event.target.value)).catch(e=>announce(e.message));});
  window.addEventListener('storage',event=>{if(event.key!==OVERLAY_KEY&&event.key!==null)return;const next=parseOverlayState(event.newValue),same=selectionKey(next.selection)===selectionKey(state.selection);state=next;if(same)render();else void restore(context?.data);});
  function move(x,y){const r=root.getBoundingClientRect();state.position=clampOverlayPosition({x,y},r.width,r.height,document.documentElement.clientWidth,document.documentElement.clientHeight);position();}
  root.addEventListener('pointerdown',event=>{if(event.button!==0||!event.target.closest('[data-ov-drag]'))return;const r=root.getBoundingClientRect();drag={x:event.clientX-r.left,y:event.clientY-r.top};root.setPointerCapture(event.pointerId);event.preventDefault();});
  root.addEventListener('pointermove',event=>{if(drag)move(event.clientX-drag.x,event.clientY-drag.y);});
  const end=()=>{if(drag){drag=null;save();}};root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
  root.addEventListener('keydown',event=>{if(!event.target.hasAttribute('data-ov-drag')||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const r=root.getBoundingClientRect(),s=event.shiftKey?32:16;move(r.left+(event.key==='ArrowLeft'?-s:event.key==='ArrowRight'?s:0),r.top+(event.key==='ArrowUp'?-s:event.key==='ArrowDown'?s:0));save();});
  window.addEventListener('resize',position);render();
  return {show,restore,importTeam,applyRemote,getState:()=>structuredClone(state)};
}
