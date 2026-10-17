import {itemAdvice} from './item-model.mjs';

const AP=new Set(['CHOICE_SPECS','SOUL_DEW','REAPER_CLOTH','POKEMONOMICON','LUCKY_RIBBON']);
const MANA=new Set(['AQUA_EGG','DEEP_SEA_TOOTH','EFFICIENT_BANDANNA']);
const TANK=new Set(['MUSCLE_BAND','STICKY_BARB','POWER_LENS','ABILITY_SHIELD','HEAVY_DUTY_BOOTS','GREEN_ORB','STAR_DUST','SMOKE_BALL','KINGS_ROCK','SHINY_CHARM','ASSAULT_VEST','POKE_DOLL','MAX_REVIVE','ROCKY_HELMET','COVER_BAND','TWIST_BAND','EXPLOSIVE_BAND']);
const ATTACK=new Set(['UPGRADE','BLUE_ORB','SCOPE_LENS','XRAY_VISION','RAZOR_FANG','PROTECTIVE_PADS','LOADED_DICE','PUNCHING_GLOVE','WIDE_LENS','RAZOR_CLAW','RED_ORB','BLACK_BELT','MACH_RIBBON','NULLIFY_BANDANNA','GRACIDEA_FLOWER','BIG_EATER_BELT']);
// These passives cannot hold items in the pinned 6.11.1 classes.
const NO_ITEMS=new Set(['EGG','UNOWN','COMFEY','COMMANDER','INANIMATE']);
export function itemRole(item){
  if(AP.has(item.id))return 'ability';if(MANA.has(item.id))return 'mana';if(TANK.has(item.id))return 'tank';if(ATTACK.has(item.id))return 'attack';
  if(item.id==='SHELL_BELL')return 'damage';if(['FLAME_ORB','WONDER_BOX'].includes(item.id))return 'reserved';
  const s=item.stats??{};if(s.AP>0)return 'ability';if(s.PP>0)return 'mana';if(s.ATK>0||s.SPEED>0||s.CRIT_CHANCE>0)return 'attack';if(s.HP>0||s.DEF>0||s.SPE_DEF>0||s.SHIELD>0)return 'tank';return 'utility';
}
function strength(p,u,role){
  const s=p.stats;if(!s)return 0;
  const a=p.abilityProfile??{},casts=s.maxPP>0&&p.abilityId!=='DEFAULT'&&p.abilityId!=='SPLASH';
  if(p.abilityId==='SPLASH')return 0;
  const attack=(s.atk??0)*(s.speed??0)/40+(s.range??1)*2;
  const ability=casts&&a.scalesAP?15+(a.specialDamage?20:0)+(a.healing?8:0)+(s.range>=2?5:0):0;
  const tank=(s.hp??0)/8+((s.def??0)+(s.speDef??0))*2+(u.y===3?10:0);
  const score=({ability,mana:casts?25+(a.specialDamage?12:0)+(a.scalesAP?5:0):0,tank,attack,damage:Math.max(attack,ability),utility:Math.max(attack,tank)/2,reserved:0})[role]??0;
  return score>0?score+u.stars*4:0;
}

export function holderAdvice(plan,items,pokemons,snapshot,{guide=null,synergyGivenByItem={}}={}){
  const advice=itemAdvice(plan,items,pokemons,snapshot),catalog=new Map(pokemons.map(p=>[p.id,p])),equipment=new Map(items.map(i=>[i.id,i]));
  const live=snapshot?.code==='connected'&&Array.isArray(snapshot.board),disabled=snapshot?.code==='off';
  const units=live?snapshot.board:(disabled?[]:(guide?.lineup??[]).map((p,i)=>({key:'guide:'+i,pokemon:p.id,stars:p.stars??1,x:i%8,y:catalog.get(p.id)?.stats?.range===1?3:1,items:[]})));
  const source=live?'live':disabled?'off':guide?'guide':'unavailable',families=new Set((plan?.units??[]).map(u=>catalog.get(u.id)?.family??u.id));
  const occupied=new Map(units.map(u=>[u.key,u.items.length])),planned=new Map(units.map(u=>[u.key,new Set(u.items)]));
  const holder=(u,g,reason)=>{const p=catalog.get(u.pokemon);return {key:u.key,id:u.pokemon,name:p.name,image:p.image,x:u.x,y:u.y,source,temporary:(p.family??p.id)!==g.family,reason};};
  function legal(u,g){
    const p=catalog.get(u.pokemon),item=equipment.get(g.id);if(!p||p.kind!=='pokemon'||item?.categories?.includes('component')||NO_ITEMS.has(p.passiveId)||u.y===0||occupied.get(u.key)>=3||planned.get(u.key)?.has(g.id)||item?.holdable!==true||item.consumable)return false;
    if(['POKEMONOMICON','REAPER_CLOTH'].includes(g.id)&&!p.abilityProfile?.specialDamage&&u.pokemon!==g.pokemon)return false;
    if(g.id==='NULLIFY_BANDANNA'&&p.abilityProfile?.specialDamage&&u.pokemon!==g.pokemon)return false;
    const granted=synergyGivenByItem[g.id];if(granted&&p.types?.includes(granted))return false;
    // A temporary must be sellable without sacrificing a family in the final comp.
    if((p.family??p.id)!==g.family&&families.has(p.family??p.id))return false;
    return true;
  }
  const order={available:0,craft:1,held:2,unknown:3,missing:4,equipped:5};
  for(const g of [...advice.goals].sort((a,b)=>order[a.status]-order[b.status])){
    if(g.status==='equipped')continue;
    const item=equipment.get(g.id),role=itemRole(item);g.role=role;
    const candidates=units.filter(u=>legal(u,g)).map(u=>{const p=catalog.get(u.pokemon),fit=strength(p,u,role),same=(p.family??p.id)===g.family;return {u,score:fit>0||u.pokemon===g.pokemon?Math.max(1,fit)+(same?100:0)+(u.pokemon===g.pokemon?1000:0):0};}).filter(c=>c.score>0).sort((a,b)=>b.score-a.score||a.u.key.localeCompare(b.u.key));
    if(g.status==='held'){
      const held=g.heldOn,p=catalog.get(held.pokemon);g.holder={key:held.key,id:held.pokemon,name:p?.name??held.pokemon,image:p?.image,x:held.x,y:held.y,source:'live',temporary:!g.protectedHolder,protected:!!g.protectedHolder,reason:g.protectedHolder?'Item em outra peça da comp; precisa de uma retirada segura.':held.y===0?'O item está em uma peça no banco.':'Este provisório já está segurando o equipamento.'};
      const final=candidates.find(c=>(catalog.get(c.u.pokemon)?.family??c.u.pokemon)===g.family);
      if(final&&(!g.protectedHolder||item.removable)){g.transferTo=holder(final.u,g,'A família de destino já está no campo.');occupied.set(final.u.key,occupied.get(final.u.key)+1);planned.get(final.u.key).add(g.id);}
      continue;
    }
    const best=candidates[0];if(!best)continue;
    const reason=({ability:'Habilidade com escala de AP; aproveita poder de habilidade.',mana:'Usa habilidade com PP; aproveita geração de PP.',tank:'Perfil resistente; aproveita defesa e sobrevivência.',attack:'Perfil de ataques; aproveita ataque e velocidade.',damage:'Aproveita o dano do portador.',utility:'Portador com espaço para este efeito.'})[role];
    g.holder=holder(best.u,g,reason??'Destinatário da equipe final.');occupied.set(best.u.key,occupied.get(best.u.key)+1);planned.get(best.u.key).add(g.id);
  }
  return {...advice,source,boardMode:snapshot?.boardMode??null,units,guideLevel:guide?.level??null};
}

// Finished reward items can be useful even when none is an exact build item.
// This is a fit heuristic, not a prediction of opponents or combat outcomes.
export function rankEquipmentRewards(context,snapshot,offers){
  const {plan,items=[],pokemons=[],guide,synergyGivenByItem={}}=context,catalog=new Map(pokemons.map(p=>[p.id,p])),equipment=new Map(items.map(i=>[i.id,i])),advice=itemAdvice(plan,items,pokemons,snapshot);
  const live=snapshot?.code==='connected'&&Array.isArray(snapshot.board),source=live?'live':guide?'guide':'plan',families=new Set((plan?.units??[]).map(u=>catalog.get(u.id)?.family??u.id));
  const current=live?snapshot.board:(guide?.lineup??[]).map((u,i)=>({key:'guide:'+i,pokemon:u.id,stars:u.stars??1,x:i%8,y:catalog.get(u.id)?.stats?.range===1?3:1,items:[]}));
  function fit(item,p,u,exact=false){
    if(!p||p.kind!=='pokemon'||NO_ITEMS.has(p.passiveId)||u.y<=0||u.items.length>=3||u.items.includes(item.id))return 0;
    if(['POKEMONOMICON','REAPER_CLOTH'].includes(item.id)&&!p.abilityProfile?.specialDamage&&!exact)return 0;
    if(item.id==='NULLIFY_BANDANNA'&&p.abilityProfile?.specialDamage&&!exact)return 0;
    const type=synergyGivenByItem[item.id];if(type&&p.types?.includes(type))return 0;
    return strength(p,u,itemRole(item))||(exact?1:0);
  }
  return offers.flatMap((offer,order)=>{
    const item=equipment.get(offer.item);if(!item||item.holdable!==true||item.consumable||item.categories?.includes('component')||itemRole(item)==='reserved')return [];
    const goals=advice.goals.filter(g=>g.id===item.id),pending=goals.find(g=>['unknown','missing'].includes(g.status)),covered=goals.length>0&&!pending;
    const targets=(plan?.units??[]).flatMap(u=>{
      const p=catalog.get(u.id),position=plan.formation?.units.find(pos=>pos.slot===u.slot),unit={key:'final:'+u.slot,pokemon:u.id,stars:p?.stars??1,x:position?.col??0,y:position?3-position.row:p?.stats?.range===1?3:1,items:u.items.map(i=>i.id)};
      // Exact missing goals have a reserved build slot. Alternatives only go to
      // final units with room in the plan, without replacing their build items.
      if(pending&&u.id!==pending.pokemon)return [];
      if(pending)unit.items=unit.items.filter(id=>id!==item.id);
      const score=fit(item,p,unit,!!pending);return score>0?[{unit,p,score}]:[];
    }).sort((a,b)=>b.score-a.score||a.unit.key.localeCompare(b.unit.key));
    const target=targets[0];if(!target&&!covered)return [{...offer,order,item:item.id,exact:false,covered:false,noFit:true,recipient:null,holder:null,source,score:0}];
    const family=target?.p.family??target?.p.id;
    const candidates=current.flatMap(u=>{
      const p=catalog.get(u.pokemon),same=(p?.family??p?.id)===family;
      if(!same&&families.has(p?.family??p?.id))return [];
      const score=fit(item,p,u,pending?.pokemon===p?.id);return score>0?[{u,p,score:score+(same?1000:0)}]:[];
    }).sort((a,b)=>b.score-a.score||a.u.key.localeCompare(b.u.key));
    const chosen=candidates[0],holder=chosen?{name:chosen.p.name,id:chosen.p.id,temporary:(chosen.p.family??chosen.p.id)!==family,source:live?'live':'guide'}:null;
    const duplicate=advice.known&&(snapshot.inventory.includes(item.id)||(snapshot.equipped??[]).some(u=>u.items.includes(item.id)));
    return [{...offer,order,item:item.id,exact:!!pending,covered,recipient:target?{id:target.p.id,name:target.p.name}:null,holder,source,score:covered?0:pending?400:40+Math.min(120,Math.round(target.score/3))-(duplicate?25:0)}];
  }).sort((a,b)=>b.score-a.score||a.order-b.order);
}
