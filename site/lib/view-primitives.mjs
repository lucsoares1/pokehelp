import {escapeHtml as e,percent} from './content.mjs';
export const img=(src,alt='',cls='')=>`<img src="${e(src)}" alt="${e(alt)}" class="${cls}" loading="lazy">`;
export const system=name=>img(`assets/common/icons/system-icons/${name}.svg`,'','comp-icon');
export const colors={COMMON:'#afafaf',UNCOMMON:'#1bc660',RARE:'#0b6cc3',EPIC:'#f947c6',ULTRA:'#f2bf43',UNIQUE:'#fe8900',LEGENDARY:'#fe8900',HATCH:'#e9b4f6',SPECIAL:'#b0b0c3'};
export const link=(type,id)=>`#${type}/${encodeURIComponent(id)}`;
export function unitMedallion(p,{stars=true}={}) {
  return `<span class="unit-medallion" style="--unit-border:${colors[p.rarity]??'#b0b0c3'}"><span class="unit-medallion-frame">${img(p.image,'','unit-medallion-image')}</span>${stars?`<span class="medallion-stars" aria-label="${p.stars} ${p.stars===1?'estrela':'estrelas'}">${'★'.repeat(p.stars)}</span>`:''}</span>`;
}
export function itemLinks(ids,data,cls='item-image') {
  const compact=['pac-board-item','roster-item','loadout-item'].includes(cls);
  return ids.map(id=>{const item=data.maps.items.get(id);if(!item)return '';const icon=img(item.image,item.name,cls);return `<a href="${link('item',id)}" title="${e(item.name)}"${compact?' class="equipment-link"':''}>${compact?`<span class="equipment-frame">${icon}</span>`:icon}</a>`;}).join('');
}
export function pokemonPortrait(id,data,{items=[],frequency=null}={}) {
  const p=data.maps.pokemons.get(id);if(!p)return '';
  return `<div class="roster-unit" style="--unit-border:${colors[p.rarity]??'#b0b0c3'}"><a href="${link('pokemon',id)}" title="${e(p.name)}" aria-label="Ver ficha de ${e(p.name)}">${unitMedallion(p)}</a><span class="roster-items">${itemLinks(items,data,'roster-item')}</span><span class="roster-name">${e(p.name)}</span>${frequency==null?'':`<span class="member-frequency">${percent(frequency)}</span>`}</div>`;
}

