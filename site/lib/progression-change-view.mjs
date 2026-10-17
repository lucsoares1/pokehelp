import {escapeHtml as e} from './content.mjs';
import {unitMedallion} from './view-primitives.mjs';
import {uiIcon} from './ui-icons.mjs';

// New board slots are visible in the lineup; only removals need explicit instructions.
export function progressionChangesView(changes,{compact=false}={}){
  if(!changes?.replacements.length&&!changes?.removals.length)return '';
  const piece=(p,mode)=>`<span class="progression-token is-${mode}" title="${e(p.name)}">${unitMedallion(p)}<span>${mode==='out'?'<small>Sai</small>':mode==='in'?'<small>Entra</small>':''}<b>${e(p.name)}</b></span></span>`;
  return `<section class="progression-changes ${compact?'is-compact':''}" aria-label="Mudanças desde o nível anterior"><h4>Trocas e evoluções</h4><div>${changes.replacements.map(p=>`<div class="progression-change ${p.kind==='evolution'?'is-evolution':''}" data-change-from="${e(p.from.id)}" data-change-to="${e(p.to.id)}">${p.kind==='evolution'?`<span class="progression-evolution-label">${uiIcon('sparkles')}Evoluir <small>· após completar a receita</small></span>${piece(p.from,'evolution')}${uiIcon('chevrons-right','progression-evolution-arrow')}${piece(p.to,'evolution')}`:`${piece(p.from,'out')}${piece(p.to,'in')}`}</div>`).join('')}${changes.removals.map(p=>`<div class="progression-change is-removal">${piece(p,'out')}<p>Ajuste à equipe final.</p></div>`).join('')}</div></section>`;
}
