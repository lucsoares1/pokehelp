import {img,itemLinks} from './view-primitives.mjs';
import {cardTypeColors} from './presentation.mjs';
import {pokemonCardArtImage,hasCardArtwork} from './card-artwork.mjs';
import {escapeHtml as e,normalizeSearch} from './content.mjs';

export function homePaths(data){
  const i=data.maps.items.get('SOUL_DEW');
  return `<a href="#pokemons" class="home-path"><span class="home-path-art"><span class="home-pokeball" aria-hidden="true"></span></span><span><b>Conheça os Pokémon</b><small>Veja habilidades, funções e descubra novas combinações.</small></span><span class="home-path-arrow" aria-hidden="true">›</span></a><a href="#compositions" class="home-path"><span class="home-path-art is-orb">${i?img(i.image):''}</span><span><b>Encontre sua composição</b><small>Combine Pokémon, itens e sinergias com um guia por nível.</small></span><span class="home-path-arrow" aria-hidden="true">›</span></a><a href="#items" class="home-path"><span class="home-path-art is-chart" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 24V14h4v10zm7 0V6h4v18zm7 0V10h4v14z" fill="currentColor"/></svg></span><span><b>Domine os itens</b><small>Entenda os efeitos, monte receitas e encontre os portadores.</small></span><span class="home-path-arrow" aria-hidden="true">›</span></a>`;
}

export const HOME_ROLES=[['','Todos'],['resistant','Resistentes'],['ability','Habilidade'],['support','Suporte'],['control','Controle'],['favorites','Favoritos']];
export function selectHomePokemons(data,report,{search='',role='',range='',synergy='',favorites=[]}={}){
  const query=normalizeSearch(search),saved=new Set(favorites);
  const roles={resistant:'Lutador resistente',ability:'Carry de habilidade',support:'Suporte',control:'Controle'};
  const filtered=data.pokemons.filter(p=>p.kind==='pokemon'&&(!query&&!role&&!range&&!synergy?hasCardArtwork(p):true)&&(!query||normalizeSearch([p.name,p.id,p.family,p.role?.primary,...p.types.map(id=>data.maps.synergies.get(id)?.name??id)].join(' ')).includes(query))&&(!role||(role==='favorites'?saved.has(p.id):p.role?.primary===roles[role]))&&(!range||p.range.kind===range)&&(!synergy||p.types.includes(synergy)));
  return filtered.sort((a,b)=>Number(hasCardArtwork(b))-Number(hasCardArtwork(a))||(report.pokemons[b.id]?.count??0)-(report.pokemons[a.id]?.count??0));
}
const star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/></svg>';
export function homePokemonCard(p,data,report,favorite=false){
  const popular=report.pokemons[p.id]?.items??[],color=cardTypeColors[p.types[0]]??'#87b8c8';
  return `<article class="discovery-card" style="--discovery-energy:${color}"><a class="discovery-card-main" href="#pokemon/${e(p.id)}" aria-label="Conhecer ${e(p.name)}"><div class="discovery-stage">${p.index?`<span class="discovery-stage-code" aria-hidden="true">Nº ${e(p.index)}</span>`:''}${pokemonCardArtImage(p,'discovery-art')}</div><div class="discovery-card-copy"><h3>${e(p.name)}</h3><div class="discovery-types">${p.types.map(id=>{const t=data.maps.synergies.get(id);return t?`<span>${img(t.image)}${e(t.name)}</span>`:'';}).join('')}</div><span class="discovery-role">${e(p.role?.primary??p.range.label)}</span></div></a><button type="button" class="discovery-favorite" data-home-favorite="${e(p.id)}" aria-pressed="${favorite}" aria-label="${favorite?'Remover':'Adicionar'} ${e(p.name)} ${favorite?'dos':'aos'} favoritos">${star}</button><footer class="discovery-card-footer"><span>Itens populares</span><div>${itemLinks(popular.slice(0,3),data,'discovery-item')||'<small>Sem dados</small>'}</div><a class="discovery-card-open" href="#pokemon/${e(p.id)}" aria-label="Abrir ficha de ${e(p.name)}"><span aria-hidden="true">+</span></a></footer></article>`;
}
