import { asset, championImage, itemImage } from './data.js';
import { compositionDetails } from './composition-details.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external = href => `href="${escape(href.startsWith('/')?'https://mobalytics.gg'+href:href)}" target="_blank" rel="noopener noreferrer"`;
const image = (src, alt='', className='') => `<img src="${escape(src)}" alt="${escape(alt)}" class="${className}" loading="lazy">`;
const systemIcon = (name, className='') => image(asset(`common/icons/system-icons/${name}.svg`),'',`comp-icon ${className}`);
const stars = count => count ? `<span class="unit-stars" aria-label="${count} stars">${Array.from({length:count},()=>image(asset('common/icons/star.svg'))).join('')}</span>` : '';
const label = id => id.replaceAll('-',' ').replaceAll('_',' ');

function portrait(unit, count=0, className='roster-unit') {
  return `<a ${external(`/tft/champions/${unit.id}`)} class="${className}" title="${escape(unit.name)}" style="--unit-border:${unit.border}">${stars(count)}${image(championImage(unit.id),unit.name,'roster-portrait')}<span class="roster-items">${unit.items.map(id=>image(itemImage(id),label(id),'roster-item')).join('')}</span><span class="roster-name">${escape(unit.name)}</span></a>`;
}

function formation(comp, detail, index) {
  const polygon='0,24 42,0 84,24 84,72 42,96 0,72';
  return `<div class="formation-board" role="img" aria-label="Recommended formation for ${escape(comp.name)}">${Array.from({length:4},(_,row)=>`<div class="formation-row">${Array.from({length:7},(_,col)=>{
    const cell=detail.board.find(c=>c[0]===row&&c[1]===col);
    const unit=cell&&comp.units.find(u=>u.id===cell[2]);
    const name=unit?.name||label(cell?.[2]||'Empty');
    const src=cell&&(['tree','lifebloom'].includes(cell[2])?asset(`tft/images/summoned-units/set18/${cell[2]}.png`):championImage(cell[2]));
    const clip=`hex-${index}-${row}-${col}`;
    return `<div class="formation-cell" title="Row ${row+1}, column ${col+1}: ${escape(name)}${cell?.[3]?', 3 stars':''}">${stars(cell?.[3])}<svg viewBox="0 0 84 96" aria-hidden="true"><defs><clipPath id="${clip}"><polygon points="${polygon}"/></clipPath></defs><polygon points="${polygon}" fill="#12121f"/>${cell?`<image href="${escape(src)}" width="100" height="100" x="-4" y="-2" clip-path="url(#${clip})"/>`:''}<polygon points="${polygon}" fill="none" stroke="${unit?.border||'#39394c'}" stroke-width="4"/></svg></div>`;
  }).join('')}</div>`).join('')}</div>`;
}

function detailMarkup(comp, detail, index) {
  const url=`https://mobalytics.gg/tft/comps-guide/${comp.slug}`;
  const core=comp.units.find(u=>u.id===detail.core);
  return `<div class="composition-reveal" id="comp-detail-${index}" hidden inert><div class="composition-detail" role="region" aria-label="${escape(comp.name)} details" style="--detail-background:url('${asset(`tft/images/champions/page-background/set18/${comp.background}.png`)}')">
    <div class="detail-intro"><div class="general-info"><h3>General info</h3><p>${escape(detail.info)}</p></div><div class="detail-actions"><a ${external(url)} class="detail-button">Open guide</a><a ${external(detail.builder)} class="detail-button">Open in Builder</a><button class="share-comp" data-share="${index}" aria-label="Copy link to ${escape(comp.name)}" title="Share composition">${systemIcon('16-share')}</button></div></div>
    <div class="detail-grid"><div class="detail-left"><section class="synergy-section"><h3>Full Synergy List</h3><div class="synergy-badges">${detail.synergies.map(([id,count,badge])=>`<span class="synergy-badge" title="${escape(label(id))}: ${count}" aria-label="${escape(label(id))}: ${count}">${image(asset(`tft/images/synergies-badges/${badge}.png`),'','synergy-shape')}${image(asset(`common/icons/tft-synergies-set18/24-${id}.svg`),'','synergy-symbol')}<b>${count}</b></span>`).join('')}</div></section>
    <section class="carousel-section"><h3>Carousel Priority</h3><div class="carousel-items">${detail.carousel.map((id,i)=>`<span class="carousel-entry">${image(itemImage(id),label(id),'carousel-item')}${i<detail.carousel.length-1?systemIcon('right-arrow'):''}</span>`).join('')}</div></section>
    <section class="core-section"><h3>Core Champions</h3>${portrait({...core,items:[]},0,'core-unit')}</section></div>
    <section class="augment-section"><h3>Augments</h3><div class="augment-columns">${detail.augments.map((column,tier)=>`<div class="augment-column tier-${tier+1}"><span class="augment-tier">Tier ${tier+1}</span>${column.map(id=>`<span class="augment-image" title="${escape(label(id))}">${image(asset(`tft/images/hextech-augments/set18/${id}.webp`),label(id))}</span>`).join('')}</div>`).join('')}</div></section>
    <section class="formation-section"><h3>Formation</h3>${formation(comp,detail,index)}</section></div>
    <section class="levelling-section"><h3>Levelling guide</h3><div class="levelling-steps">${detail.levels.map(([level,stage,gold,note],i)=>`<div class="levelling-step ${note&&note!=='DO NOT buy XP'?'is-highlighted':''}"><div class="level-information"><span class="level-number">${image(asset('common/icons/specific-icons/double-arrow-up.svg'))}<b>${level}</b></span><span class="level-economy"><span>${stage}</span><span>${gold}${image(asset('common/icons/tft-system/coin.svg'))}</span></span>${i<detail.levels.length-1?systemIcon('right-arrow','level-next'):''}</div>${note?`<span class="level-note">${escape(note)}</span>`:''}</div>`).join('')}</div></section>
  </div></div>`;
}

export function compositionMarkup(comp,index) {
  const detail=compositionDetails[index];
  const search=`${comp.name} ${comp.style} ${comp.units.map(u=>u.name).join(' ')}`.toLowerCase();
  return `<article class="composition" data-search="${escape(search)}"><div class="composition-header" style="background-image:url('${asset(`tft/images/champions/team-comp-images/set18/${comp.background}.png`)}')"><div class="composition-label"><div><a ${external(`/tft/comps-guide/${comp.slug}`)} class="composition-title">${escape(comp.name)}${systemIcon('right-line-arrow','details-arrow')}</a><div class="composition-tags"><span>18.4</span><span>${escape(comp.style)}</span><span class="difficulty ${comp.difficulty.toLowerCase()}">${comp.difficulty}</span></div></div>${image(asset('common/icons/hex-tiers/S.svg'),'S tier','comp-tier')}</div><div class="composition-roster">${comp.units.map(u=>portrait(u,detail.stars.includes(u.id)?3:0)).join('')}</div><div class="composition-controls"><button class="save-composition" data-save="${index}" aria-label="Save ${escape(comp.name)} locally" aria-pressed="false" title="Save composition locally">${systemIcon('import-to-overlay','import-icon')}${systemIcon('check','saved-icon')}</button><button class="expand-composition" data-expand="${index}" aria-label="Open details for ${escape(comp.name)}" aria-expanded="false" aria-controls="comp-detail-${index}">${systemIcon('down-arrow')}</button></div></div>${detailMarkup(comp,detail,index)}</article>`;
}

export function wireCompositionDetails(compositions, status) {
  document.querySelectorAll('[data-expand]').forEach(button=>button.addEventListener('click',()=>{
    const panel=document.getElementById(button.getAttribute('aria-controls'));
    const open=button.getAttribute('aria-expanded')!=='true';
    const article=button.closest('.composition');
    const from=panel.hidden?0:panel.getBoundingClientRect().height;
    panel.getAnimations().forEach(animation=>animation.cancel());
    panel.hidden=false;
    panel.inert=!open;
    button.setAttribute('aria-expanded',String(open));
    button.setAttribute('aria-label',`${open?'Close':'Open'} details for ${compositions[Number(button.dataset.expand)].name}`);
    article.classList.toggle('is-expanded',open);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){panel.hidden=!open;return;}
    const animation=panel.animate([{height:`${from}px`,opacity:open?0:1},{height:`${open?panel.scrollHeight:0}px`,opacity:open?1:0}],{duration:220,easing:'ease-out'});
    animation.onfinish=()=>{panel.hidden=!open;};
  }));
  document.querySelectorAll('[data-share]').forEach(button=>button.addEventListener('click',async()=>{
    const comp=compositions[Number(button.dataset.share)];
    try{await navigator.clipboard.writeText(`https://mobalytics.gg/tft/comps-guide/${comp.slug}`);status.textContent=`Link to ${comp.name} copied.`;button.classList.add('is-copied');setTimeout(()=>button.classList.remove('is-copied'),1500);}catch{status.textContent='Could not copy the link. Use Open guide to access the composition.';}
  }));
}
