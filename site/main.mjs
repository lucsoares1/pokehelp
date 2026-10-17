import {loadGameData} from './lib/data-client.mjs';
import {wireShell} from './lib/shell.mjs';
import {escapeHtml as e,normalizeSearch,formatNumber as n} from './lib/content.mjs';
import {img,system,pokemonCard,pokemonDetail,itemCard,itemDetail,compositionCard,compositionDetail,compositionUnitDetail,compositionTitle,provenance,pokemonPortrait} from './lib/views.mjs';
import {selectedVariant,variantsFor,compositionHref,parseCompositionKey} from './lib/composition-model.mjs';
import {wireLevelingGuides,restoreLevelingGuide} from './lib/leveling-controller.mjs';
import {filterCompositions} from './lib/composition-filters.mjs';
import {homePaths,HOME_ROLES,selectHomePokemons,homePokemonCard} from './lib/home-view.mjs';
import {wireHomeVideo} from './lib/home-video.mjs';
import {wirePatchNews} from './lib/patch-news.mjs';
import {wireGameOverlay} from './lib/game-overlay-bridge.mjs';

const $=selector=>document.querySelector(selector);
const links=[['Início','home','dashboard'],['Pokémon','pokemons','champions'],['Itens','items','guides'],['Sinergias','synergies','meta-tier-list'],['Composições','compositions','team-comps'],['Salvas','saved','team-builder'],['Fontes','sources','profile']];
$('#game-navigation').innerHTML=links.map(([name,path,icon])=>`<a class="game-link" href="#${path}">${img(`assets/common/icons/side-menu-icon/${icon}.svg`)}<span>${name}</span></a>`).join('');
$('#sidebar-navigation').innerHTML=links.map(([name,path,icon])=>`<a class="side-link" href="#${path}" title="${name}"><span class="side-icon" style="--icon:url('assets/common/icons/side-menu-icon/${icon}.svg')"></span><span class="nav-label">${name}</span></a>`).join('');
$('#more-games').innerHTML='<a href="https://pokemon-auto-chess.com/" target="_blank" rel="noopener noreferrer">Abrir Pokémon Auto Chess ↗</a><a href="#sources">Fontes e créditos</a>';
$('#footer-groups').innerHTML=[['Explorar',links.slice(0,5)],['Seu jogo',[['Composições salvas','saved'],['Itens e receitas','items']]],['Aprender',[['Pokédex','pokemons'],['Sinergias','synergies']]],['Dados',[['Versão e atualização','sources'],['Relatórios','compositions']]],['PokeChess Helper',[['Fontes e créditos','sources']]]].map(([name,entries])=>`<div class="footer-group"><h3>${name}</h3>${entries.map(([label,route])=>`<a href="#${route}">${label}</a>`).join('')}</div>`).join('');
wireShell();
const homeVideo=wireHomeVideo($('#home-video'));
const patchNews=wirePatchNews($('#home-patch'),$('#patch-dialog'));

let data,report,tier,route='home',query='',limit=32,requestId=0,previousView='home';
let homeFavorites=[];try{const f=JSON.parse(localStorage.getItem('pokechess-favorite-pokemon-v1')??'[]');if(Array.isArray(f))homeFavorites=f.filter(id=>typeof id==='string'&&/^[A-Z][A-Z0-9_]*$/.test(id)).slice(0,2000);}catch{}
const homeFilters={search:'',role:'',range:'',synergy:''};
const compositionContexts=new Map(),variantSelections=new Map();
let saved=[];try{const value=JSON.parse(localStorage.getItem('pokechess-saved-comps-v1')||'[]');if(Array.isArray(value))saved=value.filter(v=>typeof v==='string');}catch{/* Persistência opcional. */}
const dialog=$('#entity-dialog'), status=$('#search-status');
const statusMessage=message=>{status.textContent=message;};
const helperOverlay=wireGameOverlay({announce:statusMessage});
wireLevelingGuides($('#composition-list'),compositionContext,statusMessage);
function message(error){const text=error instanceof ReferenceError||error instanceof TypeError?'Não foi possível exibir esta tela. Tente recarregar a página.':error.message;$('#data-error').hidden=false;$('#data-error').textContent=text;statusMessage(text);console.error(error);}

function setVisible(view){
  $('#home').hidden=view!=='home';$('#home-start').hidden=view!=='home';document.body.classList.toggle('is-home',view==='home');
  homeVideo.setActive(view==='home');
  patchNews.setActive(view==='home',data);
  document.body.classList.toggle('is-pokedex',view==='pokemons');
  $('#champions').hidden=!['home','pokemons','search'].includes(view);
  $('#compositions').hidden=!['home','compositions','saved','comp','search'].includes(view);
  $('#catalog-section').hidden=!['items','synergies','sources','search'].includes(view);
  $('#catalog-filters').hidden=view!=='pokemons';$('#home-discovery-controls').hidden=view!=='home';
  $('#composition-filters').hidden=!['compositions','saved'].includes(view);
  $('#game-overlay-connection').hidden=!['compositions','saved','comp'].includes(view);
  $('.report-filter').hidden=!['home','pokemons','items','search'].includes(view);
  if(view==='home')$('#home-extra-filters').append($('.report-filter'));
  else if(view==='items')$('#item-filters').after($('.report-filter'));
  else $('#pokemon-count').before($('.report-filter'));
  document.querySelectorAll('.side-link,.game-link').forEach(a=>{const current=a.hash==='#'+(view==='comp'?'compositions':view);a.classList.toggle(a.classList.contains('side-link')?'current':'active',current);if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
const matches=(...values)=>normalizeSearch(values.flat().join(' ')).includes(query);
const pageTitle=text=>{document.title=`${text} — PokeChess Helper`;};
function renderHome(){
  $('#home-start > .home-night-scene')?.remove();
  $('#home-paths').innerHTML=homePaths(data);
  const scene=$('#home-paths .home-night-scene');if(scene)$('#home-start').prepend(scene);
}

function renderPokemons(view){
  if(view==='home'){const list=selectHomePokemons(data,report,{...homeFilters,favorites:homeFavorites}),shown=list.slice(0,8);$('#champion-grid').innerHTML=shown.map(p=>homePokemonCard(p,data,report,homeFavorites.includes(p.id))).join('');$('#champions-empty').hidden=list.length>0;$('#champions-empty').textContent=homeFilters.role==='favorites'?'Você ainda não favoritou Pokémon nesta seleção. Use a estrela nos cards.':'Nenhum Pokémon encontrado. Tente outro nome ou limpe os filtros.';$('#pokemon-count').textContent=`${shown.length} Pokémon${list.length>8?' de '+n(list.length)+' nesta seleção':''} · itens populares na faixa ${tier.replaceAll('_',' ')}`;$('#more-pokemon').hidden=true;return;} 
  const kind=view==='pokemons'?$('#kind-filter').value:view==='search'?'':'pokemon';
  const range=view==='pokemons'?$('#range-filter').value:'',synergy=view==='pokemons'?$('#synergy-filter').value:'',role=view==='pokemons'?$('#role-filter').value:'';
  const filtered=data.pokemons.filter(p=>(!kind||p.kind===kind)&&matches(p.name,p.id,p.types.map(id=>data.maps.synergies.get(id)?.name??id),p.role?.primary??'',p.family)&&(!range||p.range.kind===range)&&(!synergy||p.types.includes(synergy))&&(!role||(role==='pending'?!p.role:p.role?.primary===role)));
  const list=filtered.sort((a,b)=>(report.pokemons[b.id]?.available?report.pokemons[b.id].count:0)-(report.pokemons[a.id]?.available?report.pokemons[a.id].count:0));
  const shown=view==='home'&&!query?list.filter(p=>p.role).slice(0,8):list.slice(0,limit);
  $('#champion-grid').innerHTML=shown.map(p=>pokemonCard(p,data,report)).join('');
  $('#champions-empty').hidden=list.length>0;
  $('#pokemon-count').textContent=`${n(list.length)} registros · itens populares na faixa selecionada`;
  $('#more-pokemon').hidden=view==='home'||list.length<=limit;
}
function renderComps(view,id,variant=null){
  $('#report-status').textContent=`Relatório: ${data.manifest.report.generatedAt.split('T')[0]} · ${n(data.manifest.report.count)} partidas · versão das partidas não informada`;
  const candidates=data.compositions.filter(c=>(view!=='saved'||saved.includes(c.id+'@'+data.manifest.id))&&(view!=='comp'||c.id===id)&&(view==='comp'||matches(compositionTitle(c,data),c.members.map(p=>data.maps.pokemons.get(p.id)?.name??p.id))));
  const filters=['compositions','saved'].includes(view)?{synergy:$('#comp-synergy').value,synergyScope:$('#comp-synergy-scope').value,pokemon:$('#comp-pokemon').value,pokemonScope:$('#comp-pokemon-scope').value,sort:$('#comp-sort').value}:{};
  const list=filterCompositions(candidates,data,filters);
  $('#comp-filter-results').textContent=`${n(list.length)} composições · ${n(list.reduce((sum,entry)=>sum+entry.variants.length,0))} equipes compatíveis`;
  compositionContexts.clear();
  $('#composition-list').innerHTML=list.slice(0,view==='home'&&!query?5:limit).map(({comp:c,variants})=>{
    const key=c.id+'@'+data.manifest.id,allowedIndices=variants.map(v=>v.index);compositionContexts.set(key,{comp:c,data,allowedIndices});
    if(view==='comp'&&variant!=null)variantSelections.set(key,variant);
    const wanted=variantSelections.get(key),selection=variants.find(v=>v.index===wanted)??variants[0];
    return compositionCard(c,data.compositions.indexOf(c),data,saved.includes(key),selection?.index,allowedIndices);
  }).join('');
  if(view==='saved'){
    const archived=saved.filter(key=>!key.endsWith('@'+data.manifest.id));
    if(archived.length)$('#composition-list').insertAdjacentHTML('beforeend',`<div class="sources-content"><h3>Salvas de relatórios anteriores</h3>${archived.map(key=>`<p><a href="#comp/${e(key)}">Composição ${e(key.split('@')[0])} · ${e(key.split('@')[1])}</a></p>`).join('')}</div>`);
  }
  $('#compositions-empty').hidden=list.length>0;
  $('#compositions-empty').textContent='Nenhuma composição encontrada. Tente outra sinergia, Pokémon ou limpe os filtros e a busca.';
  $('#more-comps').hidden=view==='home'||list.length<=limit;
  $('#composition-heading').innerHTML=view==='saved'?'Suas composições <span>salvas</span>':'Composições <span>do meta</span>';
}
function renderCatalog(view){
  const heading=$('#catalog-heading'),content=$('#catalog-content');
  if(view==='items'){
    heading.innerHTML='Itens e <span>receitas</span>';
    const category=$('#item-category').value;
    const list=data.items.filter(item=>matches(item.name,item.id,item.description)&&(!category||(category==='unholdable'?!item.holdable:item.categories.includes(category))));
    list.sort((a,b)=>$('#item-sort').value==='place'?(report.items[a.id]?.meanPlace??Infinity)-(report.items[b.id]?.meanPlace??Infinity):(report.items[b.id]?.available?report.items[b.id].count:0)-(report.items[a.id]?.available?report.items[a.id].count:0));
    content.className='champion-grid';content.innerHTML=list.slice(0,limit).map(item=>itemCard(item,report)).join('');
    $('#catalog-empty').hidden=list.length>0;$('#catalog-more').hidden=list.length<=limit;$('#item-filters').hidden=false;
  }else if(view==='synergies'){
    heading.innerHTML='Sinergias <span>do jogo</span>';content.className='synergy-grid';
    const list=data.synergies.filter(s=>matches(s.name,s.id,s.description));
    content.innerHTML=list.map(s=>`<a class="synergy-card" href="#synergy/${e(s.id)}">${img(s.image,s.name)}<h3>${e(s.name)}</h3><p>${s.thresholds.join(' / ')}</p><small>${n(s.members.length)} integrantes e formas</small></a>`).join('');
    $('#catalog-empty').hidden=list.length>0;$('#catalog-more').hidden=true;$('#item-filters').hidden=true;
  }else{
    heading.innerHTML='Fontes e <span>atualização</span>';content.className='sources-content';$('#catalog-empty').hidden=true;$('#catalog-more').hidden=true;$('#item-filters').hidden=true;
    content.innerHTML=`<p>Catálogo <b>${e(data.manifest.gameVersion)}</b> · revisão <code>${e(data.manifest.revision)}</code> do ramo prod. A versão do código foi comparada com o servidor; o servidor não expõe seu commit de deploy.</p><p>Importado em ${e(data.manifest.createdAt)}. Relatório gerado em ${e(data.manifest.report.generatedAt)}, com início em ${e(data.manifest.report.periodStart)} e ${n(data.manifest.report.count)} partidas na metadata. Datas do relatório sem fuso informado.</p><p>Modo e versão das partidas não são declarados nos relatórios; não foram deduzidos pela data. A faixa selecionada aplica-se aos relatórios de Pokémon e itens. Comps são grupos estatísticos sem faixa declarada.</p><p>Alcance base até 1 é classificado como corpo a corpo; acima de 1, à distância. Funções táticas têm revisão editorial própria. ${n(data.pokemons.filter(p=>p.role).length)} registros têm função revisada nesta versão; os demais estão em revisão.</p><p><a href="https://github.com/keldaanCommunity/pokemonAutoChess/tree/${e(data.manifest.revision)}" target="_blank" rel="noopener noreferrer">Código da revisão ↗</a> · <a href="https://pokemon-auto-chess.com/" target="_blank" rel="noopener noreferrer">Pokémon Auto Chess ↗</a> · <a href="${e(data.pointer.base)}manifest.json">Manifesto de fontes</a> · <a href="${e(data.pointer.base)}quality.json">Relatório de qualidade</a> · <a href="${e(data.pointer.base)}credits.json">Créditos dos recursos</a> · <a href="${e(data.pointer.base)}SOURCE-LICENSE.txt">Licença do código de origem</a></p><p>Projeto de fã independente. Pokémon e recursos associados pertencem aos seus respectivos titulares. Os nomes, retratos e descrições vêm do projeto Pokémon Auto Chess. Composições usam a referência estrutural Mobalytics. A home tem identidade própria inspirada nos jogos Pokémon. Ilustrações: Nintendo / Creatures / GAME FREAK, distribuídas pelo PokeAPI/sprites. Renders 3D da vitrine: Pokémon HOME, distribuídos pelo <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener noreferrer">PokeAPI/sprites</a>, com <a href="assets/presentation/home-renders/manifest.json">fontes, resolução e hashes dos PNGs originais</a>. <a href="assets/presentation/manifest.json">Fontes das ilustrações e da tipografia</a> · <a href="assets/presentation/banner.json">Créditos do vídeo</a> · Nunito, <a href="assets/fonts/Nunito-OFL.txt">licença SIL OFL 1.1</a>. Ícones de interface: Lucide 1.57.0, <a href="assets/icons/lucide/LICENSE">licença ISC e atribuições Feather</a>, <a href="assets/icons/lucide/SOURCE.json">fontes e hashes</a>.</p>`;
  }
}
async function showEntity(kind,id,token){
  let html;
  if(kind==='pokemon')html=pokemonDetail(await data.pokemon(id),data,report);
  else if(kind==='item'){const item=data.maps.items.get(id);if(!item)throw new Error('Item não encontrado');html=itemDetail(item,data,report);}
  else {const s=data.maps.synergies.get(id);if(!s)throw new Error('Sinergia não encontrada');html=`<div class="entity-heading">${img(s.image,s.name,'entity-portrait')}<h2 id="entity-title">${e(s.name)}</h2></div><p class="mechanic-text">${e(s.description)}</p><h3>Patamares: ${s.thresholds.join(' / ')}</h3><div class="related-pokemon">${s.members.map(id=>{const p=data.maps.pokemons.get(id);return `<a href="#pokemon/${e(id)}">${img(p.image,p.name)}${e(p.name)}</a>`;}).join('')}</div>${provenance(data)}`;}
  if(token!==requestId)return;
  $('#entity-content').innerHTML=html;
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;$('#close-entity').focus();
  pageTitle($('#entity-title').textContent);
}
function render(){
  if(!data||!report)return;
  const [view,id]=(location.hash.slice(1)||'home').split('/');
  route=view;
  if(['pokemon','item','synergy'].includes(view))return;
  setVisible(view);
  if(view==='home')renderHome();
  if(['home','pokemons','search'].includes(view))renderPokemons(view);
  if(['home','compositions','saved','comp','search'].includes(view)){const parsed=parseCompositionKey(id);renderComps(view,parsed.id,parsed.variant);}
  if(['items','synergies','sources','search'].includes(view))renderCatalog(view==='search'?'items':view);
  pageTitle(links.find(([,path])=>path===view)?.[0]??'Composições');
}
async function navigate(){
  if(!data||!report)return;
  const token=++requestId;const [view,id]=(location.hash.slice(1)||'home').split('/');
  $('#data-error').hidden=true;
  try{
    if(['pokemon','item','synergy'].includes(view)){await showEntity(view,id,token);return;}
    if(dialog.open)dialog.close();
    if(![...links.map(([,path])=>path),'comp','search'].includes(view))throw new Error('Página não encontrada. Use a navegação para continuar.');
    previousView=location.hash.slice(1)||'home';limit=32;render();
    if(view==='home')$(id==='explore'?'#home-start':'#home').scrollIntoView({block:'start'});
    else document.querySelector(['pokemons','search'].includes(view)?'#champions':['compositions','saved','comp'].includes(view)?'#compositions':'#catalog-section').scrollIntoView({block:'start'});
    if(view==='comp'){
      const {id:clusterId,snapshotId,variant}=parseCompositionKey(id);
      if(snapshotId&&snapshotId!==data.manifest.id){
        const historical=await loadGameData(snapshotId);if(token!==requestId)return;
        const comp=historical.compositions.find(c=>c.id===clusterId);if(!comp)throw new Error('Composição não encontrada no relatório histórico');
        const key=clusterId+'@'+snapshotId;compositionContexts.clear();compositionContexts.set(key,{comp,data:historical});
        if(variant!=null)variantSelections.set(key,variant);
        $('#composition-list').innerHTML=compositionCard(comp,historical.compositions.indexOf(comp),historical,saved.includes(key),variantSelections.get(key));
        $('#compositions-empty').hidden=true;
        $('#report-status').textContent=`Relatório histórico ${snapshotId}. As fichas de Pokémon e itens abrem o catálogo atual.`;
      }else $('#report-status').textContent=`Relatório: ${data.manifest.report.generatedAt.split('T')[0]} · ${n(data.manifest.report.count)} partidas · versão das partidas não informada`;
      const button=document.querySelector(`[data-expand="${CSS.escape(clusterId??'')}"]`);if(button)expand(button,true);else throw new Error('Composição não encontrada neste snapshot');
    }
  }catch(error){message(error);}
}
window.addEventListener('hashchange',navigate);
function closeEntity(){if(dialog.open)dialog.close();location.hash='#'+previousView;}
$('#close-entity').addEventListener('click',closeEntity);dialog.addEventListener('cancel',event=>{event.preventDefault();closeEntity();});
$('#page-search').addEventListener('input',event=>{query=normalizeSearch(event.target.value);limit=32;$('.clear-search').hidden=!query;if(query&&['home','sources'].includes(route))location.hash='#search';else render();});
$('.page-search').addEventListener('submit',event=>{event.preventDefault();if(query)location.hash='#search';else render();});
$('.page-search').addEventListener('reset',()=>{$('#page-search').value='';query='';$('.clear-search').hidden=true;render();});
for(const id of ['kind-filter','range-filter','synergy-filter','role-filter','item-category','item-sort'])$('#'+id).addEventListener('change',()=>{limit=32;render();});
$('#home-role-filters').innerHTML=HOME_ROLES.map(([id,label])=>`<button type="button" data-home-role="${id}" aria-pressed="${id===''}">${label}</button>`).join('');
$('#home-role-filters').addEventListener('click',event=>{const b=event.target.closest('[data-home-role]');if(!b)return;homeFilters.role=b.dataset.homeRole;$('#home-role-filters').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(data&&report)renderPokemons('home');});
$('#home-pokemon-search').addEventListener('input',event=>{homeFilters.search=event.target.value;if(data&&report)renderPokemons('home');});
for(const [id,key]of [['home-range-filter','range'],['home-synergy-filter','synergy']])$('#'+id).addEventListener('change',event=>{homeFilters[key]=event.target.value;if(data&&report)renderPokemons('home');});
$('#home-more-filters').addEventListener('click',event=>{const b=event.currentTarget,open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#home-extra-filters').hidden=!open;});
$('#home-clear-filters').addEventListener('click',()=>{Object.assign(homeFilters,{search:'',role:'',range:'',synergy:''});$('#home-pokemon-search').value='';$('#home-range-filter').value='';$('#home-synergy-filter').value='';$('#home-role-filters').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.homeRole==='')));if(data&&report)renderPokemons('home');});
$('#champion-grid').addEventListener('click',event=>{const b=event.target.closest('[data-home-favorite]');if(!b)return;const id=b.dataset.homeFavorite;if(!data?.maps.pokemons.has(id))return;const previous=homeFavorites;homeFavorites=homeFavorites.includes(id)?homeFavorites.filter(p=>p!==id):[...homeFavorites,id];try{localStorage.setItem('pokechess-favorite-pokemon-v1',JSON.stringify(homeFavorites));}catch{homeFavorites=previous;statusMessage('Não foi possível salvar o favorito neste navegador.');return;}renderPokemons('home');($('#champion-grid').querySelector(`[data-home-favorite="${CSS.escape(id)}"]`)??$('#home-role-filters [data-home-role="favorites"]'))?.focus({preventScroll:true});statusMessage(homeFavorites.includes(id)?'Pokémon adicionado aos favoritos.':'Pokémon removido dos favoritos.');});
$('#composition-filters').addEventListener('submit',event=>event.preventDefault());
for(const id of ['comp-synergy','comp-synergy-scope','comp-pokemon-scope','comp-sort'])$('#'+id).addEventListener('change',()=>{limit=32;render();});
let compSearchTimer;
$('#comp-pokemon').addEventListener('input',()=>{clearTimeout(compSearchTimer);compSearchTimer=setTimeout(()=>{limit=32;render();},160);});
$('#composition-filters').addEventListener('reset',event=>{event.preventDefault();clearTimeout(compSearchTimer);$('#comp-synergy').value='';$('#comp-synergy-scope').value='primary';$('#comp-pokemon').value='';$('#comp-pokemon-scope').value='any';$('#comp-sort').value='report';limit=32;render();statusMessage('Filtros de composições limpos.');});
for(const id of ['more-pokemon','more-comps','catalog-more'])$('#'+id).addEventListener('click',()=>{limit+=32;render();});
$('#tier-filter').addEventListener('change',async event=>{const requested=event.target.value;try{const next=await data.report(requested);if($('#tier-filter').value!==requested)return;tier=requested;report=next;if(route==='home')renderPokemons('home');else await navigate();statusMessage('Faixa atualizada para Pokémon e itens.');}catch(error){event.target.value=tier;message(error);}});

function expand(button,open=button.getAttribute('aria-expanded')!=='true'){
  if(open){for(const other of document.querySelectorAll('[data-expand][aria-expanded=true]'))if(other!==button)expand(other,false);}
  const panel=document.getElementById(button.getAttribute('aria-controls'));const from=panel.hidden?0:panel.getBoundingClientRect().height;
  panel.getAnimations().forEach(a=>a.cancel());panel.hidden=false;panel.inert=!open;
  button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',`${open?'Fechar':'Abrir'} detalhes da composição`);
  if(open){const article=button.closest('.composition');hydrateTeamUnit(article,Number(article.querySelector('[data-selected-unit]')?.dataset.selectedUnit??0));restoreLevelingGuide(article);}
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){panel.hidden=!open;return;}
  const animation=panel.animate([{height:`${from}px`},{height:`${open?panel.scrollHeight:0}px`}],{duration:220,easing:'ease-out'});animation.onfinish=()=>{panel.hidden=!open;};
}
function compositionContext(article){return compositionContexts.get(article.id.replace('cluster-','')+'@'+article.dataset.snapshot);}
async function hydrateTeamUnit(article,index){
  const context=compositionContext(article),content=article.querySelector('.team-unit-content');if(!context||!content)return;
  const team=selectedVariant(context.comp,article.dataset.variant),member=team?.members[index];if(!member)return;
  content.dataset.selectedUnit=String(index);content.setAttribute('aria-busy','true');
  article.querySelectorAll('.pac-board-unit').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.unit)===index)));
  content.innerHTML=compositionUnitDetail(member,context.data.maps.pokemons.get(member.id),context.data);
  try{
    const p=await context.data.pokemon(member.id);
    if(!content.isConnected||content.dataset.selectedUnit!==String(index)||article.dataset.variant!==String(team.index))return;
    content.innerHTML=compositionUnitDetail(member,p,context.data);
  }catch{if(content.isConnected&&content.dataset.selectedUnit===String(index))content.insertAdjacentHTML('beforeend','<p class="source-note">Não foi possível carregar a habilidade. Selecione a peça novamente para tentar.</p>');}
  finally{if(content.dataset.selectedUnit===String(index))content.removeAttribute('aria-busy');}
}
$('#composition-list').addEventListener('click',async event=>{
  const article=event.target.closest('.composition');
  const variations=event.target.closest('[data-variations]');if(variations){const open=variations.getAttribute('aria-expanded')!=='true';variations.setAttribute('aria-expanded',String(open));document.getElementById(variations.getAttribute('aria-controls')).hidden=!open;return;}
  const option=event.target.closest('[data-select-variant]');if(option){
    const guideOpen=article.querySelector('.leveling-guide')?.open;
    const context=compositionContext(article);if(!context)return;
    const team=selectedVariant(context.comp,option.dataset.selectVariant),key=context.comp.id+'@'+article.dataset.snapshot;
    variantSelections.set(key,team.index);article.dataset.variant=String(team.index);
    article.querySelector('.composition-roster').innerHTML=team.members.map(p=>pokemonPortrait(p.id,context.data,p)).join('');
    article.querySelector('.composition-team-label').textContent=`${team.label} · ${team.members.length} Pokémon · ${context.allowedIndices?.length??variantsFor(context.comp).length} opções`;
    article.querySelector('.composition-title').href=compositionHref(context.comp,team.index);
    article.querySelector('.composition-reveal').innerHTML=compositionDetail(context.comp,context.data,team.index,context.allowedIndices,saved.includes(key));
    restoreLevelingGuide(article,guideOpen);
    if(route==='comp'){history.replaceState(null,'',compositionHref(context.comp,team.index));previousView=location.hash.slice(1);}
    article.querySelector('[data-variations]').focus();
    hydrateTeamUnit(article,Number(article.querySelector('[data-selected-unit]').dataset.selectedUnit));
    statusMessage(`${team.label} selecionada. Campo, sinergias e equipamentos atualizados.`);return;
  }
  const importButton=event.target.closest('[data-import-overlay]');if(importButton){
    const context=compositionContext(article);if(!context)return;
    const index=Number(article.dataset.variant);importButton.disabled=true;importButton.setAttribute('aria-busy','true');
    try{await helperOverlay.importTeam(context.comp,context.data,index);}catch(e){statusMessage(e.message);}
    finally{importButton.disabled=false;importButton.removeAttribute('aria-busy');}return;
  }
  const unit=event.target.closest('[data-unit]');if(unit){hydrateTeamUnit(article,Number(unit.dataset.unit));const inspector=article.querySelector('.team-inspector');inspector.open=true;inspector.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});return;}
  const expandButton=event.target.closest('[data-expand]');if(expandButton){expand(expandButton);return;}
  const save=event.target.closest('[data-save]');if(save){const key=save.dataset.save+'@'+save.closest('.composition').dataset.snapshot;const next=saved.includes(key)?saved.filter(id=>id!==key):[...saved,key];try{localStorage.setItem('pokechess-saved-comps-v1',JSON.stringify(next));saved=next;save.setAttribute('aria-pressed',String(saved.includes(key)));save.setAttribute('aria-label',saved.includes(key)?'Remover composição salva':'Salvar composição');save.textContent=saved.includes(key)?'Salva ✓':'Salvar';statusMessage(saved.includes(key)?'Composição salva neste navegador.':'Composição removida das salvas.');}catch{statusMessage('Não foi possível salvar neste navegador.');}return;}
  const share=event.target.closest('[data-share]');if(share){try{const url=new URL(location.href);url.hash=compositionHref(compositionContext(article).comp,Number(article.dataset.variant));await navigator.clipboard.writeText(url.href);statusMessage('Link desta variação copiado.');}catch{statusMessage('Não foi possível copiar o link. Abra esta equipe e copie o endereço.');}}
});

try{
  data=await loadGameData();void helperOverlay.restore(data);tier=data.manifest.defaultTier;report=await data.report(tier);
  if(data.manifest.presentation?.poster){$('#home').style.setProperty('--patch-art',`url('${data.manifest.presentation.poster}')`);$('#set-button').style.backgroundImage=`linear-gradient(#24243599,#24243599),url('${data.manifest.presentation.poster}')`;}
  $('#version-label').textContent=data.manifest.gameVersion;
  $('#set-menu').innerHTML=`<strong>Pokémon Auto Chess ${e(data.manifest.gameVersion)}</strong><span>Revisão ${e(data.manifest.revision.slice(0,12))}</span><a href="#sources">Fontes e atualização</a>`;
  $('#tier-filter').innerHTML=Object.entries(data.manifest.tiers).map(([id,elo])=>`<option value="${e(id)}">${e(id.replaceAll('_',' '))} · Elo ≥ ${elo}</option>`).join('');$('#tier-filter').value=tier;
  $('#home-synergy-filter').innerHTML='<option value="">Todas as sinergias</option>'+data.synergies.map(s=>`<option value="${e(s.id)}">${e(s.name)}</option>`).join('');
  $('#synergy-filter').innerHTML='<option value="">Todas as sinergias</option>'+data.synergies.map(s=>`<option value="${e(s.id)}">${e(s.name)}</option>`).join('');
  $('#comp-synergy').innerHTML='<option value="">Todas as sinergias</option>'+data.synergies.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(s=>`<option value="${e(s.id)}">${e(s.name)}</option>`).join('');
  const observed=new Set(data.compositions.flatMap(c=>c.examples.flatMap(t=>t.members.map(m=>m.id))));
  $('#comp-pokemon-options').innerHTML=[...new Set([...observed].map(id=>data.maps.pokemons.get(id)?.name).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')).map(name=>`<option value="${e(name)}"></option>`).join('');
  $('#role-filter').innerHTML='<option value="">Todas as funções</option><option value="pending">Em revisão</option>'+[...new Set(data.pokemons.flatMap(p=>p.role?[p.role.primary]:[]))].map(role=>`<option>${e(role)}</option>`).join('');
  $('#data-status').textContent=`Catálogo ${data.manifest.gameVersion} · ${n(data.pokemons.filter(p=>p.kind==='pokemon').length)} Pokémon e formas · ${n(data.items.length)} itens`;
  $('#report-status').textContent=`Relatório: ${data.manifest.report.generatedAt.split('T')[0]} · ${n(data.manifest.report.count)} partidas · versão das partidas não informada`;
  render();await navigate();
}catch(error){message(error);$('#data-status').textContent=data?'Não foi possível exibir esta tela.':'Catálogo indisponível no momento.';}
