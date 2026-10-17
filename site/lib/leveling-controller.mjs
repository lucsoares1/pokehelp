import {selectedVariant} from './composition-model.mjs';
import {levelingGuide,xpCostText} from './leveling-view.mjs';

const preferences=new Map(),loaded=new WeakMap();
const keyFor=article=>`${article.id}@${article.dataset.snapshot}~${article.dataset.variant}`;
function preferencesFor(article){const key=keyFor(article);if(!preferences.has(key))preferences.set(key,{open:true,level:2,focusId:null,obtained:[]});return preferences.get(key);}

export function restoreLevelingGuide(article,force=false){
  const details=article.querySelector('.leveling-guide');if(details&&(force||preferencesFor(article).open))details.open=true;
}

export function wireLevelingGuides(list,contextFor,announce){
  const render=details=>{
    const article=details.closest('.composition'),context=contextFor(article),rules=loaded.get(details),settings=preferencesFor(article);
    const team=selectedVariant(context.comp,article.dataset.variant);
    details.querySelector('.leveling-guide-content').innerHTML=levelingGuide(team,context.data,rules,settings);
  };
  async function hydrate(details){
    if(loaded.has(details)){render(details);return;}
    const article=details.closest('.composition'),context=contextFor(article),content=details.querySelector('.leveling-guide-content');
    if(!context)return;
    content.setAttribute('aria-busy','true');content.innerHTML='<p class="source-note" role="status">Carregando chances, evoluções e plano por nível…</p>';
    try{
      const rules=await context.data.progression();
      if(!details.isConnected)return;
      loaded.set(details,rules);render(details);
    }catch{
      if(details.isConnected)content.innerHTML='<p class="source-note">Não foi possível carregar o guia.</p><button class="detail-button" data-guide-retry>Tentar novamente</button>';
    }finally{content.removeAttribute('aria-busy');}
  }
  list.addEventListener('toggle',event=>{
    const details=event.target;if(!details.matches('.leveling-guide'))return;
    preferencesFor(details.closest('.composition')).open=details.open;if(details.open)hydrate(details);
  },true);
  list.addEventListener('click',event=>{
    const retry=event.target.closest('[data-guide-retry]');if(retry){hydrate(retry.closest('.leveling-guide'));return;}
    const button=event.target.closest('[data-guide-level]');if(!button)return;
    const details=button.closest('.leveling-guide'),settings=preferencesFor(details.closest('.composition'));
    settings.level=Number(button.dataset.guideLevel);render(details);
    details.querySelector(`[data-guide-level="${settings.level}"]`).focus();announce(`Guia atualizado para o nível ${settings.level}.`);
  });
  list.addEventListener('change',event=>{
    const control=event.target,details=control.closest('.leveling-guide');if(!details)return;
    const settings=preferencesFor(details.closest('.composition'));
    if(control.matches('[data-guide-focus]')){settings.focusId=control.value;render(details);details.querySelector('[data-guide-focus]').focus();}
    if(control.matches('[data-guide-obtained]')){
      const index=Number(control.dataset.guideObtained);settings.obtained=settings.obtained.filter(n=>n!==index);if(control.checked)settings.obtained.push(index);
      const targetDetails=control.closest('.guide-targets').open;render(details);details.querySelector('.guide-targets').open=targetDetails;details.querySelector(`[data-guide-obtained="${index}"]`).focus();
    }
  });
  list.addEventListener('input',event=>{
    if(!event.target.matches('[data-guide-xp]'))return;
    const details=event.target.closest('.leveling-guide'),settings=preferencesFor(details.closest('.composition')),rules=loaded.get(details);
    const input=event.target,value=Math.max(0,Math.min(Number(input.max),Number(input.value)||0));
    if(input.value!==''&&Number(input.value)!==value)input.value=String(value);
    details.querySelector('.guide-xp-result').textContent=xpCostText(rules,settings.level,value);
  });
}
