
const sections=[['now','Agora'],['team','Equipe'],['items','Itens'],['guide','Guia']];
export function createPanelLayout(root){
  let selected='now';
  const scrolls=new Map();
  function activate(id,{focus=false}={}){
    const body=root.querySelector('.ov-body');if(!body)return;
    scrolls.set(selected,body.scrollTop);selected=id;
    root.querySelectorAll('[data-ov-tab]').forEach(b=>{const active=b.dataset.ovTab===id;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active&&focus)b.focus();});
    root.querySelectorAll('[data-ov-page]').forEach(p=>p.hidden=p.dataset.ovPage!==id);
    const options=root.querySelector('[data-ov-options]');options?.setAttribute('aria-expanded',String(id==='options'));
    body.scrollTop=scrolls.get(id)??0;
  }
  function mount(){
    const body=root.querySelector('.ov-body');if(!body)return;
    root.classList.add('ov-organized');
    const nav=document.createElement('nav');nav.className='ov-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Seções do overlay');nav.hidden=body.hidden;
    nav.innerHTML=sections.map(([id,label])=>`<button type="button" role="tab" id="ov-tab-${id}" data-ov-tab="${id}" aria-controls="ov-page-${id}">${label}</button>`).join('');body.before(nav);
    const pages={};
    for(const [id,label] of [...sections,['options','Opções']]){const page=document.createElement('section');page.id='ov-page-'+id;page.dataset.ovPage=id;page.setAttribute('role',id==='options'?'region':'tabpanel');page.setAttribute(id==='options'?'aria-label':'aria-labelledby',id==='options'?label:'ov-tab-'+id);pages[id]=page;}
    const move=(selector,page)=>{const node=body.querySelector(selector);if(node)pages[page].append(node);};
    move('.ov-variant-row','team');move('.ov-content','team');move('.ov-footer','team');
    move('.ov-leveling','guide');move('.ov-shopping','guide');move('.ov-shop-assist','options');move('[data-ov-item-assist]','items');
    pages.now.innerHTML='<h2 class="sr-only">Sua próxima decisão</h2><div data-ov-portal-slot></div><section class="ov-board-assist" data-ov-board-assist aria-label="Verificador de campo e banco" tabindex="-1"></section><section class="ov-next-item" data-ov-next-item></section>';
    pages.team.insertAdjacentHTML('afterbegin','<div class="ov-page-heading"><h2>Plano da equipe</h2><p>Marque as peças prontas nos retratos acima.</p></div>');
    pages.items.insertAdjacentHTML('afterbegin','<div class="ov-page-heading"><h2>Itens e portadores</h2><p>Monte por prioridade e confira quem segura cada equipamento.</p></div>');
    pages.options.insertAdjacentHTML('afterbegin','<div class="ov-page-heading"><h2>Opções</h2><p>Controle os destaques e a conexão com o jogo.</p></div>');
    const advanced=document.createElement('details');advanced.className='ov-advanced';advanced.dataset.ovAdvanced='';advanced.innerHTML='<summary>Suporte e informações técnicas</summary><div data-ov-diagnostics-slot></div>';pages.options.append(advanced);
    Object.values(pages).forEach(p=>body.append(p));
    const options=document.createElement('button');options.type='button';options.dataset.ovOptions='';options.setAttribute('aria-label','Opções do overlay');options.setAttribute('title','Opções');options.setAttribute('aria-controls','ov-page-options');options.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--surface)"/><circle cx="15" cy="17" r="3" fill="var(--surface)"/></svg>' ;root.querySelector('.ov-actions')?.prepend(options);
    const version=root.querySelector('[data-ov-extension-version]');if(version)advanced.append(version);
    activate(selected);
  }
  root.addEventListener('click',event=>{const tab=event.target.closest('[data-ov-tab],[data-ov-go],[data-ov-options]');if(!tab)return;activate(tab.hasAttribute('data-ov-options')?(selected==='options'?'now':'options'):(tab.dataset.ovTab??tab.dataset.ovGo));});
  root.addEventListener('keydown',event=>{const tab=event.target.closest('[data-ov-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const ids=sections.map(([id])=>id),index=ids.indexOf(tab.dataset.ovTab);activate(ids[event.key==='Home'?0:event.key==='End'?ids.length-1:(index+(event.key==='ArrowRight'?1:-1)+ids.length)%ids.length],{focus:true});});
  return {mount,activate};
}

export function refreshDecisionSummary(root){
  const items=root.querySelector('[data-ov-item-assist]'),portalSlot=root.querySelector('[data-ov-portal-slot]'),next=root.querySelector('[data-ov-next-item]');if(!items||!portalSlot||!next)return;
  portalSlot.replaceChildren();const portal=items.querySelector('[data-portal-advice]');if(portal)portalSlot.append(portal);
  const first=items.querySelector('[data-craft-queue] li');next.replaceChildren();
  const heading=document.createElement('h3');heading.textContent=first?'Próximo item a montar':'Acompanhe seus itens';next.append(heading);
  if(first){const preview=first.cloneNode(true);preview.querySelector('.ov-item-parts')?.remove();const list=document.createElement('ol');list.append(preview);next.append(list);}else{const text=document.createElement('p');text.textContent=items.querySelector('.ov-item-status')?.textContent??'Confira as receitas na aba Itens.';next.append(text);}
  const button=document.createElement('button');button.type='button';button.dataset.ovGo='items';button.textContent='Ver receitas e portadores';next.append(button);
  for(const [selector,label] of [['[data-craft-queue] ol','Outras prioridades'],['.ov-holder-list','Outros portadores']]){
    const list=items.querySelector(selector);if(!list||list.children.length<=2)continue;
    const details=document.createElement('details');details.className='ov-more-items';details.dataset.ovDisclosure=label;details.innerHTML=`<summary>${label} (${list.children.length-2})</summary>`;
    const rest=list.cloneNode(false);while(list.children.length>2)rest.append(list.children[2]);details.append(rest);list.after(details);
  }
  const help=document.createElement('details');help.className='ov-more-items';help.dataset.ovDisclosure='help';help.innerHTML='<summary>Como usar as indicações</summary>';
  for(const node of items.querySelectorAll(':scope>.ov-item-help,:scope>small'))help.append(node);items.append(help);
}
