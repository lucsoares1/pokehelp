import {progressionStep,bestShopLevels} from './progression-planner.mjs';
// Suggestions derived from mechanics. These are not observed player histories.
export const searchWindows={
  COMMON:{level:4,label:'Reroll cedo',reason:'Comuns ficam menos frequentes ao subir. Evite comprar XP só por hábito antes de completar as cópias importantes.'},
  UNCOMMON:{level:5,label:'Slow roll no 5',reason:'O nível 5 tem a maior chance de incomuns nas regras padrão. Se estiver estável, procure cópias preservando os juros.'},
  RARE:{level:7,label:'Estabilizar e buscar no 7',reason:'Raros atingem 35% no nível 7 e mantêm essa chance no 8 e 9. Subir depois aumenta vagas, sem aumentar essa porcentagem.'},
  EPIC:{level:8,label:'Preparar nível 8',reason:'Épicos ficam mais frequentes no fim. Com equipe estável, poupe para o 8; o 9 melhora a chance, mas custa mais XP.'},
  ULTRA:{level:9,label:'Buscar no fim: 8–9',reason:'Ultras são raros mesmo no fim. O nível 9 aumenta a chance; estabilize com peças provisórias antes de investir tanto em XP.'}
};

export function rarityChance(rules,rarity,level){const index=rules.shop.rarities.indexOf(rarity);return index<0?null:rules.shop.rates[level]?.[index]??0;}
export function xpCost(rules,level,xp=0){
  if(level>=rules.experience.maxLevel)return {xp:0,clicks:0,gold:0,max:true};
  const needed=Math.max(0,rules.experience.thresholds[level]-Math.max(0,Number(xp)||0));
  const clicks=Math.ceil(needed/rules.experience.purchaseXp);return {xp:needed,clicks,gold:clicks*rules.experience.purchaseGold,max:false};
}

export function targetList(team,data,rules){
  return team.members.map((member,index)=>{
    const target=data.maps.pokemons.get(member.id),route=rules.acquisition[member.id]??{method:'review',baseId:null,path:[],steps:[],copies:null,conditional:true};
    const base=data.maps.pokemons.get(route.baseId);
    return {member,index,target,route,base,window:searchWindows[route.rarity]??null};
  });
}

export function acquisitionLabel(entry,rules){
  const {route}=entry;
  if(route.method==='unique')return `Escolha única: etapa ${rules.events.portals[1]}. Outras obtenções dependem de efeitos.`;
  if(route.method==='legendary')return `Escolha lendária: etapa ${rules.events.portals[2]}. Não entra na tabela da loja comum.`;
  if(route.method==='egg')return 'Ovo/eclosão. Não procure este alvo no reroll comum.';
  if(route.method==='special')return 'Obtenção especial. Confira habilidade, passiva e condições da família.';
  if(route.method==='review')return 'Rota de obtenção em revisão; não há uma receita automática confirmada.';
  return [route.regional?'Precisa estar liberado na região.':'',route.additional?`Depende de seleção adicional (etapas ${rules.events.additionalPicks.join(', ')}).`:'',entry.base?.types.includes('WILD')?'Selvagem: também depende das regras de encontro desse tipo.':''].filter(Boolean).join(' ')||'Forma inicial da loja comum.';
}

export function planLevel(team,data,rules,{level=2,focusId=null,obtained=[]}={}){
  level=Math.min(rules.experience.maxLevel,Math.max(rules.experience.initialLevel,Number(level)||2));
  const targets=targetList(team,data,rules),owned=new Set(obtained.map(Number));
  const shopTargets=targets.filter(t=>t.route.method==='shop'&&t.base);
  const focus=shopTargets.find(t=>t.target.id===focusId)??shopTargets.slice().sort((a,b)=>b.member.items.length-a.member.items.length||a.index-b.index)[0]??null;
  const step=progressionStep(team,data,rules,targets,level,owned,focus);
  const focusDone=focus&&targets.filter(t=>t.target.id===focus.target.id).every(t=>owned.has(t.index));
  const chance=focus?rarityChance(rules,focus.route.rarity,level):null;
  let action;
  if(!focus)action='Esta equipe depende de obtenções especiais. Monte uma base forte e use novas vagas; reroll comum não garante os alvos finais.';
  else if(focusDone)action='Você marcou o alvo como pronto. Pare de gastar para buscá-lo; complete as outras peças ou compre XP para uma nova vaga.';
  else if(chance===0)action=`A raridade de ${focus.base.name} ainda tem 0% neste nível. Monte uma base provisória e suba antes de gastar ouro buscando essa família.`;
  else if(focus.route.rarity==='COMMON'&&level<=focus.window.level)action=`Compre ${focus.base.name} quando aparecer. Se faltam poucas cópias para a evolução, faça uma busca curta antes de comprar XP, preservando o próximo patamar de juros (múltiplo de ${rules.economy.goldPerInterest}). Não espere ter ${rules.economy.baseInterestCap*rules.economy.goldPerInterest} ouro parado neste nível: o XP passivo faz você subir naturalmente.`;
  else if(level<focus.window.level)action=`Compre ${focus.base.name} quando aparecer. Priorize uma equipe que aguente as lutas e prepare o nível ${focus.window.level}; não esgote o ouro em uma busca pouco eficiente.`;
  else if(level===focus.window.level)action=`Se a equipe estiver estável, procure ${focus.base.name} usando o ouro acima da reserva de juros e separando dinheiro para comprar as cópias. Se estiver perdendo muita vida, gaste para fortalecer agora.`;
  else action=`Compre ${focus.base.name} e complete as evoluções da comp. ${focus.route.rarity==='RARE'?'Raros continuam em 35% nos níveis 7, 8 e 9. ':''}Suba apenas se a nova vaga ou a chance de outra família importante justificar o custo.`;
  const best=focus?bestShopLevels(rules,focus.route.rarity):null;
  if(step.finalGoal&&!focusDone)action='Seu objetivo é a equipe final abaixo, com as mesmas formas da variação escolhida. Complete cópias e condições pendentes; mantenha os provisórios até conseguir substituí-los. Nível 9 é o máximo padrão: não compre mais XP.';
  if(step.finalGoal&&focusDone)action='Você marcou o alvo como pronto. Pare de gastar para buscá-lo; finalize as outras famílias e condições da equipe abaixo. Nível máximo padrão: não compre mais XP.';
  if(level<rules.experience.maxLevel&&focus&&(focus.route.additional||focus.route.regional))action+=' Antes de dar reroll, confirme que essa família está liberada na partida.';
  if(level<rules.experience.maxLevel&&step.lineup.some(m=>m.needsEvolution))action+=' As evoluções abaixo são metas: só faça a troca quando completar a receita.';
  return {level,targets,focus,focusDone,chance,...step,best,action,window:focus?.window??null,reserve:rules.economy.baseInterestCap*rules.economy.goldPerInterest,xp:xpCost(rules,level),overCapacity:Math.max(0,team.members.length-rules.experience.maxLevel)};
}
