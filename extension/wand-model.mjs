// Fit heuristic for the pinned 6.11.1 wand effects, not a combat simulation.
// Source: app/core/effects/synergies.ts and catalog item descriptions.
const WANDS=new Set(['CONFUSE','PETRIFY','SLOW','SLUMBER','BLAST','HP_SWAP','SPIRIT','LONG','GUIDING','SURROUND','POUNCE','TWO_EDGED','WARP','SWITCHER','WHIRLWIND','TUNNEL'].map(id=>id+'_WAND'));
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export function rankWandRewards(context,snapshot,offers){
  const pokemons=new Map((context.pokemons??[]).map(p=>[p.id,p])),items=new Map((context.items??[]).map(i=>[i.id,i]));
  const granted=context.synergyGivenByItem??context.teamRules?.synergyGivenByItem??{};
  const live=snapshot?.code==='connected'&&Array.isArray(snapshot.board);
  const final=(context.plan?.units??[]).map(u=>({id:u.id,items:(u.items??[]).map(i=>typeof i==='string'?i:i.id)}));
  const field=live?snapshot.board.filter(u=>u.y>0&&u.canPlace!==false).map(u=>({id:u.pokemon,items:u.items??[]})):(context.guide?.lineup??[]).map(u=>({id:u.id,items:[]}));
  function profile(unit){
    const p=pokemons.get(unit.id);if(!p||p.kind!=='pokemon')return null;
    const equipment=unit.items.map(id=>items.get(id)).filter(Boolean),stat=id=>equipment.reduce((n,i)=>n+(Number(i.stats?.[id])||0),0),s=p.stats??{};
    const range=Math.max(1,(s.range??1)+stat('RANGE')),casts=(s.maxPP??0)>0&&!!p.abilityId&&!['DEFAULT','SPLASH'].includes(p.abilityId)&&!unit.items.includes('NULLIFY_BANDANNA');
    return {id:p.id,name:p.name,fairy:(p.types??[]).includes('FAIRY')||unit.items.some(id=>granted[id]==='FAIRY'),range,melee:range===1,
      attacks:clamp(((s.atk??0)+stat('ATK'))*((s.speed??0)+stat('SPEED'))/3000,0,2),
      caster:casts?clamp(60/s.maxPP,0,2):0,special:!!p.abilityProfile?.specialDamage,
      tank:clamp(((s.hp??0)+stat('HP'))/350+((s.def??0)+(s.speDef??0)+stat('DEF')+stat('SPE_DEF'))/80),
      crit:clamp(stat('CRIT_CHANCE')/50),protected:unit.items.includes('PROTECTIVE_PADS')};
  }
  const planned=final.map(profile).filter(Boolean),current=field.map(profile).filter(Boolean),plannedFairies=planned.filter(p=>p.fairy),currentFairies=current.filter(p=>p.fairy);
  const groups=[];if(plannedFairies.length)groups.push({units:plannedFairies,weight:currentFairies.length?.7:1});if(currentFairies.length)groups.push({units:currentFairies,weight:plannedFairies.length?.3:1});
  const team=planned.length?planned:current,special=team.filter(p=>p.special).length/Math.max(1,team.length);
  const source=plannedFairies.length?(currentFairies.length?(live?'plan+live':'plan+guide'):'plan'):(currentFairies.length?(live?'live':'guide'):'none');
  const reasons={
    LONG_WAND:'Alcance e crítico por distância para as Fadas de ataque à distância.',
    SPIRIT_WAND:'PP adicional e efeito que cresce com os usos de habilidade das Fadas.',
    HP_SWAP_WAND:'Roubo de PV máximo para sustentar as Fadas durante a luta.',
    CONFUSE_WAND:'Confusão e redução de Defesa Especial apoiam o dano especial da comp.',
    PETRIFY_WAND:'Trava e redução de Defesa apoiam os ataques da comp.',
    SLOW_WAND:'Paralisia e redução de velocidade oferecem controle nos ataques das Fadas.',
    SLUMBER_WAND:'Sono e redução de ataque ajudam a proteger sua equipe.',
    BLAST_WAND:'Reforça o efeito dos ataques críticos das Fadas.',
    GUIDING_WAND:'Ajuda a finalizar inimigos com pouca vida.',
    SURROUND_WAND:'Favorece Fadas corpo a corpo cercadas por inimigos.',
    POUNCE_WAND:'Retaliação favorece Fadas que recebem ataques corpo a corpo.',
    TWO_EDGED_WAND:'Mais dano por ataque, com risco de dano de recuo; Almofadas Protetivas evitam esse recuo.',
    WARP_WAND:'Reposiciona o alvo para longe; pode afastá-lo das suas peças corpo a corpo.',
    SWITCHER_WAND:'Troca a posição do alvo; efeito de controle que pode alterar seu foco.',
    WHIRLWIND_WAND:'Desloca inimigos na linha do ataque; pode afastá-los da sua linha de frente.',
    TUNNEL_WAND:'Pode atingir inimigos na linha atrás do alvo.'
  };
  function fit(id,p){switch(id){
    case 'LONG_WAND':return p.melee?0:95+p.range*7+p.attacks*10;
    case 'SPIRIT_WAND':return p.caster?40+p.caster*90:15;
    case 'HP_SWAP_WAND':return 65+Number(p.melee)*35+p.tank*45+p.attacks*15;
    case 'CONFUSE_WAND':return 60+special*45+p.attacks*12;
    case 'PETRIFY_WAND':return 60+(1-special)*45+p.attacks*12;
    case 'SLOW_WAND':return 80+p.attacks*15;
    case 'SLUMBER_WAND':return 75+Number(p.melee)*10+p.attacks*15;
    case 'BLAST_WAND':return 55+p.crit*70+p.attacks*25;
    case 'GUIDING_WAND':return 65+p.attacks*25;
    case 'SURROUND_WAND':return p.melee?95+p.tank*30+p.attacks*15:20;
    case 'POUNCE_WAND':return p.melee?100+p.tank*45:25;
    case 'TWO_EDGED_WAND':return 65+p.attacks*30+(p.protected?65: -35*(1-p.tank));
    case 'WARP_WAND':case 'WHIRLWIND_WAND':return p.melee?35:65+p.attacks*10;
    case 'SWITCHER_WAND':return 55+p.attacks*12;
    case 'TUNNEL_WAND':return 60+p.attacks*20;
    default:return 0;
  }}
  const beneficiaries=[...new Map([...plannedFairies,...currentFairies].map(p=>[p.id,{id:p.id,name:p.name}])).values()];
  const ranks=offers.flatMap((offer,order)=>{
    if(!WANDS.has(offer.item)||!items.has(offer.item))return [];
    const score=groups.reduce((sum,g)=>sum+g.weight*g.units.reduce((n,p)=>n+fit(offer.item,p),0)/g.units.length,0);
    return [{...offer,order,score,source,beneficiaries,activeNow:live?currentFairies.length>0:null,reason:groups.length?reasons[offer.item]:'Sem Fada identificada no campo ou na comp final; nenhum benefício confirmado.'}];
  }).sort((a,b)=>b.score-a.score||a.order-b.order);
  return ranks.map((r,index)=>({...r,primary:index===0&&r.score>0}));
}
