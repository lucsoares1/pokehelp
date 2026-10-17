const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function recipeTooltip(item,items){
  const catalog=new Map(items.map(i=>[i.id,i]));
  const parts=(item.components??[]).map(id=>catalog.get(id));
  const picture=i=>`<img src="${escape(i.image)}" alt=""><span>${escape(i.name)}</span>`;
  return `<div class="ov-tooltip-equipment">${picture(item)}</div>${parts.length&&parts.every(Boolean)?`<p>Componentes da receita</p><div class="ov-tooltip-parts">${parts.map((part,index)=>`${index?'<b aria-hidden="true">+</b>':''}<div>${picture(part)}</div>`).join('')}</div>`:parts.length?'<p>Receita de componentes indisponível.</p>':'<p>Este item não possui receita de componentes.</p>'}`;
}
export function createItemTooltips(root,items){
  const catalog=new Map(items.map(i=>[i.image,i]));let target=null;
  const tooltip=document.createElement('div');tooltip.id='ov-recipe-tooltip';tooltip.className='ov-recipe-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;document.body.append(tooltip);
  function hide(){target?.removeAttribute('aria-describedby');target=null;tooltip.hidden=true;}
  function place(){if(!target)return;const r=target.getBoundingClientRect(),width=tooltip.offsetWidth,height=tooltip.offsetHeight;tooltip.style.left=Math.max(8,Math.min(innerWidth-width-8,r.left+r.width/2-width/2))+'px';tooltip.style.top=Math.max(8,r.top-height-9>=8?r.top-height-9:Math.min(innerHeight-height-8,r.bottom+9))+'px';}
  function show(node){if(!node)return;const img=node.querySelector('img'),item=catalog.get(img?.getAttribute('src'));if(!item)return;hide();target=node;target.setAttribute('aria-describedby',tooltip.id);tooltip.innerHTML=recipeTooltip(item,items);tooltip.hidden=false;place();}
  const trigger=event=>event.target.closest?.('.ov-items>span,.ov-board-items>span');
  root.addEventListener('pointerover',event=>{const node=trigger(event);if(node&&node!==target)show(node);});
  root.addEventListener('pointerout',event=>{if(target&&!target.contains(event.relatedTarget)&&!tooltip.contains(event.relatedTarget))hide();});
  root.addEventListener('focusin',event=>show(trigger(event)));
  root.addEventListener('focusout',()=>hide());
  root.addEventListener('click',event=>{if(trigger(event)){event.preventDefault();event.stopImmediatePropagation();}else hide();},true);
  root.addEventListener('keydown',event=>{if(event.key==='Escape')hide();if(trigger(event)&&['Enter',' '].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();show(trigger(event));}},true);
  root.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
  tooltip.addEventListener('pointerleave',event=>{if(!target?.contains(event.relatedTarget))hide();});
  function refresh(){hide();root.querySelectorAll('.ov-items>span,.ov-board-items>span').forEach(node=>{const item=catalog.get(node.querySelector('img')?.getAttribute('src'));if(!item)return;node.removeAttribute('title');node.tabIndex=0;node.setAttribute('role','img');node.setAttribute('aria-label',item.name+' · ver componentes');node.classList.add('ov-recipe-trigger');});}
  return {refresh,hide};
}
