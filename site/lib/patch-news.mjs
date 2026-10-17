import {escapeHtml as e} from './content.mjs';

export function patchBanner(notes,currentVersion){
  return `<div class="patch-news-copy"><span class="patch-news-kicker">${currentVersion===notes.version?'Versão atual':'Atualização'} · ${e(notes.version)}</span><h2 id="patch-news-title">Patch ${e(notes.baseVersion)}:<br><em>${e(notes.title)}</em></h2><p>${e(notes.description)}</p><button class="patch-news-button" type="button" data-patch-open aria-haspopup="dialog" aria-controls="patch-dialog">Ver novidades do patch <span aria-hidden="true">↗</span></button></div><div class="patch-news-art"><img src="${e(notes.image)}" alt="Pokémon reunidos no estádio do patch Stadium" width="1024" height="434" loading="lazy" decoding="async"></div>`;
}

export function patchContent(notes,data){
  const list=items=>`<ul>${items.map(text=>`<li>${e(text)}</li>`).join('')}</ul>`;
  return `<div class="patch-modal-art"><img src="${e(notes.image)}" alt="Ilustração do patch Stadium" width="1024" height="434" loading="lazy"></div><div class="patch-modal-content"><p class="patch-modal-version">Patch ${e(notes.baseVersion)} · atualização ${e(notes.version)}</p><h3 class="patch-modal-title">${e(notes.title)}: entre em campo</h3><p class="patch-modal-intro">Resumo em português das novidades do 6.11 e dos ajustes do 6.11.1. As alterações de cada versão estão identificadas abaixo.</p><section aria-labelledby="patch-highlights-title"><h3 id="patch-highlights-title">O que chegou no ${e(notes.baseVersion)}</h3><div class="patch-highlights">${notes.highlights.map(h=>`<article><h4>${e(h.title)}</h4><p>${e(h.text)}</p></article>`).join('')}</div></section><section aria-labelledby="patch-newcomers-title"><h3 id="patch-newcomers-title">Os novos nomes do Stadium</h3><div class="patch-newcomers">${notes.newcomers.map(id=>{const p=data.maps.pokemons.get(id);return p?`<div><img src="${e(p.image)}" alt="" width="48" height="48" loading="lazy"><span>${e(p.name)}</span></div>`:'';}).join('')}</div></section><section class="patch-midpatch" aria-labelledby="patch-balance-title"><div class="patch-section-heading"><h3 id="patch-balance-title">O que mudou no ${e(notes.version)}</h3><span>Balanceamento</span></div><dl class="patch-balance">${notes.balance.map(b=>`<div><dt>${e(b.name)}</dt><dd>${e(b.change)}</dd></div>`).join('')}</dl><details class="patch-extra"><summary>Ajustes no Double Up</summary>${list(notes.doubleUp)}</details><details class="patch-extra"><summary>Correções e melhorias</summary>${list(notes.fixes)}</details></section><footer class="patch-sources"><p>Quer consultar cada alteração?</p><div>${notes.sources.map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.label)} ↗</a>`).join('')}</div><small>Resumo editorial do PokeChess Helper · conferido em ${e(notes.reviewedAt.split('-').reverse().join('/'))}. ${e(notes.credit)}</small></footer></div>`;
}

export function wirePatchNews(section,dialog){
  let active=false,notes=null,loading=null,data;
  const body=dialog.querySelector('[data-patch-content]');
  async function load(){
    if(notes||loading)return loading;
    section.innerHTML='<p class="patch-news-loading" role="status">Carregando as novidades do patch…</p>';
    loading=(async()=>{
      try{
        const response=await fetch('data/patches/latest.json',{cache:'no-cache',signal:AbortSignal.timeout(10000)});
        if(!response.ok)throw new Error('Patch unavailable');
        const value=await response.json();if(value.schemaVersion!==1)throw new Error('Patch schema unsupported');
        notes=value;section.innerHTML=patchBanner(notes,data.manifest.gameVersion);
      }catch{section.innerHTML='<p class="patch-news-loading">Não foi possível carregar as novidades. <button type="button" data-patch-retry>Tentar novamente</button></p>';}
      finally{loading=null;}
    })();
    return loading;
  }
  section.addEventListener('click',event=>{
    if(event.target.closest('[data-patch-retry]'))void load();
    if(event.target.closest('[data-patch-open]')&&notes){body.innerHTML=patchContent(notes,data);dialog.showModal();body.scrollTop=0;}
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  return {setActive(value,context){active=value;data=context;section.hidden=!active;if(!active&&dialog.open)dialog.close();if(active)void load();}};
}
