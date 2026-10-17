export function wireShell() {
  const $=selector=>document.querySelector(selector);
  const sidebar=$('#sidebar'),toggle=$('#sidebar-toggle'),pin=$('#pin-sidebar');
  const mobile=matchMedia('(max-width:699px)');
  function sync(){const closed=mobile.matches&&!sidebar.classList.contains('is-open');sidebar.inert=closed;if(closed)sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');if(!mobile.matches){sidebar.classList.remove('is-open');$('#menu-backdrop').hidden=true;$('#mobile-menu-button').setAttribute('aria-expanded','false');}}
  function setPinned(value){sidebar.classList.toggle('is-pinned',value);document.body.classList.toggle('sidebar-pinned',value);toggle.setAttribute('aria-expanded',String(value));toggle.setAttribute('aria-label',value?'Recolher navegação':'Expandir navegação');pin.checked=value;}
  function menu(open){sidebar.classList.toggle('is-open',open);$('#menu-backdrop').hidden=!open;$('#mobile-menu-button').setAttribute('aria-expanded',String(open));$('#mobile-menu-button').setAttribute('aria-label',open?'Fechar navegação':'Abrir navegação');sync();if(open)sidebar.querySelector('a')?.focus();else $('#mobile-menu-button').focus();}
  sync();mobile.addEventListener('change',sync);
  toggle.addEventListener('click',()=>setPinned(!sidebar.classList.contains('is-pinned')));pin.addEventListener('change',()=>setPinned(pin.checked));
  $('#mobile-menu-button').addEventListener('click',()=>menu(!sidebar.classList.contains('is-open')));$('#menu-backdrop').addEventListener('click',()=>menu(false));
  sidebar.addEventListener('click',e=>{if(e.target.closest('a')&&sidebar.classList.contains('is-open'))menu(false);});
  const dropdowns=[['#more-games-button','#more-games'],['#set-button','#set-menu'],['#settings-button','#settings-menu']];
  const close=(except)=>dropdowns.forEach(([button,panel])=>{if(panel!==except){$(panel).hidden=true;$(button).setAttribute('aria-expanded','false');}});
  dropdowns.forEach(([button,panel])=>$(button).addEventListener('click',()=>{const open=$(panel).hidden;close(panel);$(panel).hidden=!open;$(button).setAttribute('aria-expanded',String(open));}));
  dropdowns.forEach(([,panel])=>$(panel).addEventListener('click',event=>{if(event.target.closest('a[href]'))close();}));
  document.addEventListener('click',e=>{if(!dropdowns.some(([b,p])=>$(b).contains(e.target)||$(p).contains(e.target)))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const active=dropdowns.find(([,p])=>!$(p).hidden);close();if(active)$(active[0]).focus();if(sidebar.classList.contains('is-open'))menu(false);if($('.page-search').classList.contains('is-mobile-open')){$('.page-search').classList.remove('is-mobile-open');$('#mobile-search-button').focus();}}});
  function panels(hidden){document.body.classList.toggle('hide-ad-spaces',hidden);$('#hide-ad-spaces').checked=hidden;}
  $('#hide-ad-spaces').addEventListener('change',e=>panels(e.target.checked));document.querySelectorAll('[data-hide-ads]').forEach(b=>b.addEventListener('click',()=>panels(true)));
  $('#mobile-search-button').addEventListener('click',()=>{$('.page-search').classList.toggle('is-mobile-open');if($('.page-search').classList.contains('is-mobile-open'))$('#page-search').focus();});
  document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&!e.target.src.endsWith('unavailable.svg')){if(e.target.dataset.portrait){const portrait=e.target.dataset.portrait;delete e.target.dataset.portrait;e.target.classList.add('is-portrait');e.target.src=portrait;}else{e.target.src='assets/pac/unavailable.svg';e.target.title='Imagem indisponível na origem';}}},true);
}
