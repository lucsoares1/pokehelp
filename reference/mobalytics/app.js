import { asset, champions, compositions, footerGroups, games, icon, itemImage, moreGames, navigation } from './data.js';

import { compositionMarkup, wireCompositionDetails } from './composition-view.js';

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external = href => `href="${escape(href.startsWith('/') ? 'https://mobalytics.gg'+href : href)}" target="_blank" rel="noopener noreferrer"`;
const img = (src, alt='', classes='', extra='') => `<img src="${escape(src)}" alt="${escape(alt)}" class="${classes}" loading="lazy" ${extra}>`;

function gameMarkup([label,id,href,badge]) { return `<a ${external(href)} class="game-link ${id==='tft'?'active':''}">${img(asset(`common/icons/ngf-games/${id}.svg`))}<span>${escape(label)}</span>${badge?`<span class="new-label">${escape(badge)}</span>`:''}</a>`; }
$('#game-navigation').innerHTML = games.map(gameMarkup).join('');
$('#more-games').innerHTML = moreGames.map(gameMarkup).join('');
$('#sidebar-navigation').innerHTML = navigation.map(entry=>`<a ${entry.href.startsWith('#')?`href="${entry.href}"`:external(entry.href)} class="side-link ${entry.current?'current':''}" ${entry.current?'aria-current="page"':''} title="${escape(entry.label)}"><span class="side-icon" style="--icon:url('${icon(entry.icon)}')" aria-hidden="true"></span><span class="nav-label">${escape(entry.label)}</span></a>`).join('');

function championMarkup(champion) {
  const search = `${champion.name} ${champion.traits.map(t=>t[0]).join(' ')} ${champion.items.join(' ')}`.toLowerCase();
  return `<a ${external(`/tft/champions/${champion.id}`)} class="champion-card" data-search="${escape(search)}" aria-label="${escape(champion.name)}, 5 gold. Open on Mobalytics">
    ${img(asset(`tft/images/champions/thumbnail/set18/${champion.id}.png`),champion.name,'champion-portrait')}
    <span class="champion-shade"></span>${img(asset('tft/images/rarity/cost-5.png'),'','cost-crown')}
    <div class="champion-traits">${champion.traits.map(([name,id])=>`<span class="trait-line">${img(asset(`common/icons/tft-synergies-set18/24-${id}.svg`))}${escape(name)}</span>`).join('')}</div>
    <div class="champion-items">${champion.items.map(id=>img(itemImage(id),id.replaceAll('-',' '),'item-image')).join('')}</div>
    <div class="champion-footer"><span>${escape(champion.name)}</span><span class="champion-price">${img(asset('common/icons/tft-system/coin.svg'))}5</span></div></a>`;
}
$('#champion-grid').innerHTML = champions.map(championMarkup).join('');

$('#composition-list').innerHTML = compositions.map(compositionMarkup).join('');
$('#footer-groups').innerHTML = footerGroups.map(([name,links])=>`<div class="footer-group"><h3>${escape(name)}</h3>${links.map(([label,url])=>`<a ${external(url)}>${escape(label)}</a>`).join('')}</div>`).join('');

const sidebar=$('#sidebar'), toggle=$('#sidebar-toggle'), pin=$('#pin-sidebar');
const mobileViewport=matchMedia('(max-width: 699px)');
function syncMobileNavigation(){const mobile=mobileViewport.matches;const open=sidebar.classList.contains('is-open');sidebar.inert=mobile&&!open;if(mobile&&!open)sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');if(!mobile){sidebar.classList.remove('is-open');$('#menu-backdrop').hidden=true;$('#mobile-menu-button').setAttribute('aria-expanded','false');}}
mobileViewport.addEventListener('change',syncMobileNavigation);
syncMobileNavigation();
function setPinned(value){sidebar.classList.toggle('is-pinned',value);document.body.classList.toggle('sidebar-pinned',value);toggle.setAttribute('aria-expanded',String(value));toggle.setAttribute('aria-label',value?'Collapse navigation':'Expand navigation');pin.checked=value;}
toggle.addEventListener('click',()=>setPinned(!sidebar.classList.contains('is-pinned')));
pin.addEventListener('change',()=>setPinned(pin.checked));
function setMobileMenu(value){sidebar.classList.toggle('is-open',value);$('#menu-backdrop').hidden=!value;$('#mobile-menu-button').setAttribute('aria-expanded',String(value));$('#mobile-menu-button').setAttribute('aria-label',value?'Close navigation':'Open navigation');syncMobileNavigation();if(value)sidebar.querySelector('a').focus();else $('#mobile-menu-button').focus();}
$('#mobile-menu-button').addEventListener('click',()=>setMobileMenu(!sidebar.classList.contains('is-open')));
$('#menu-backdrop').addEventListener('click',()=>setMobileMenu(false));
sidebar.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{if(sidebar.classList.contains('is-open'))setMobileMenu(false);}));

const dropdowns=[['#more-games-button','#more-games'],['#set-button','#set-menu'],['#settings-button','#settings-menu']];
function closeDropdowns(except){dropdowns.forEach(([button,panel])=>{if(panel!==except){$(panel).hidden=true;$(button).setAttribute('aria-expanded','false');}});}
dropdowns.forEach(([button,panel])=>$(button).addEventListener('click',()=>{const open=$(panel).hidden;closeDropdowns(panel);$(panel).hidden=!open;$(button).setAttribute('aria-expanded',String(open));}));
document.addEventListener('click',event=>{if(!dropdowns.some(([button,panel])=>$(button).contains(event.target)||$(panel).contains(event.target)))closeDropdowns();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const activeDropdown=dropdowns.find(([,panel])=>!$(panel).hidden);closeDropdowns();if(activeDropdown)$(activeDropdown[0]).focus();if(sidebar.classList.contains('is-open'))setMobileMenu(false);if($('.page-search').classList.contains('is-mobile-open')){$('.page-search').classList.remove('is-mobile-open');$('#mobile-search-button').focus();}}});

function hideAdSpaces(value){document.body.classList.toggle('hide-ad-spaces',value);$('#hide-ad-spaces').checked=value;}
document.querySelectorAll('[data-hide-ads]').forEach(button=>button.addEventListener('click',()=>hideAdSpaces(true)));
$('#hide-ad-spaces').addEventListener('change',event=>hideAdSpaces(event.target.checked));

const search=$('#page-search'), searchForm=$('.page-search');
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function filterPage(){const query=normalize(search.value);let foundChampions=0,foundComps=0;document.querySelectorAll('.champion-card').forEach(card=>{card.hidden=!normalize(card.dataset.search).includes(query);if(!card.hidden)foundChampions++;});document.querySelectorAll('.composition').forEach(card=>{card.hidden=!normalize(card.dataset.search).includes(query);if(!card.hidden)foundComps++;});$('#champions-empty').hidden=foundChampions>0;$('#compositions-empty').hidden=foundComps>0;$('.clear-search').hidden=query.length===0;$('#search-status').textContent=query?`${foundChampions} champions and ${foundComps} comps match your search.`:'';}
search.addEventListener('input',filterPage);
searchForm.addEventListener('submit',event=>{event.preventDefault();filterPage();$('#champions').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
searchForm.addEventListener('reset',()=>{search.value='';filterPage();search.focus();});
$('#mobile-search-button').addEventListener('click',()=>{searchForm.classList.toggle('is-mobile-open');if(searchForm.classList.contains('is-mobile-open'))search.focus();});

let saved=[];try{const value=JSON.parse(localStorage.getItem('pokechess-reference-saved')||'[]');if(Array.isArray(value))saved=value.filter(v=>typeof v==='string');}catch{/* Local saving is optional when storage is unavailable. */}
document.querySelectorAll('[data-save]').forEach(button=>{const comp=compositions[Number(button.dataset.save)];const refresh=()=>{const isSaved=saved.includes(comp.slug);button.setAttribute('aria-pressed',String(isSaved));button.setAttribute('aria-label',`${isSaved?'Unsave':'Save'} ${comp.name} locally`);};refresh();button.addEventListener('click',()=>{const next=saved.includes(comp.slug)?saved.filter(id=>id!==comp.slug):[...saved,comp.slug];try{localStorage.setItem('pokechess-reference-saved',JSON.stringify(next));saved=next;refresh();$('#search-status').textContent=`${comp.name} ${saved.includes(comp.slug)?'saved':'removed'} locally.`;}catch{$('#search-status').textContent='Local storage is unavailable. The composition could not be saved.';}});});
wireCompositionDetails(compositions,$('#search-status'));

document.querySelectorAll('img').forEach(image=>image.addEventListener('error',()=>{image.classList.add('image-unavailable');image.title=image.alt?`${image.alt} — image unavailable`:'Image unavailable';},{once:true}));

