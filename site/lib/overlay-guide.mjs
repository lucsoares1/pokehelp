import {planLevel} from './leveling-model.mjs';

// Uses the same mechanics and suggestions as the full composition guide.
export function createOverlayGuide(plan,data,rules,state){
  if(!plan||!rules)return null;
  const team={members:plan.units.map(p=>({id:p.id,items:p.items.map(i=>i.id)}))};
  const step=planLevel(team,data,rules,{level:state.guideLevel??2,obtained:state.obtained});
  const portrait=id=>{const p=data.maps.pokemons.get(id);return {id:p.id,name:p.name,image:p.image,rarity:p.rarity,rarityLabel:p.rarityLabel,stars:p.stars};};
  return {level:step.level,levels:Array.from({length:rules.experience.maxLevel-rules.experience.initialLevel+1},(_,i)=>i+rules.experience.initialLevel),
    action:step.action,focus:step.focus?{name:step.focus.base.name,target:step.focus.target.name,copies:step.focus.route.copies,rarity:step.focus.base.rarityLabel,chance:step.chance,done:step.focusDone}:null,
    strategy:step.window,version:rules.version,best:step.best,title:step.title,finalGoal:step.finalGoal,freeSlots:step.freeSlots,synergyGoal:step.synergyGoal,
    synergies:step.synergies.map(s=>({id:s.id,name:s.synergy?.name??s.id,image:s.synergy?.image,count:s.count,active:s.active,next:s.next,thresholds:s.synergy?.thresholds??[]})),
    transitions:step.transitions,changes:step.changes,bench:step.bench.map(m=>portrait(m.id)),reserves:step.reserves,pendingSpecial:step.pendingSpecial,
    lineup:step.lineup.map(m=>({...portrait(m.id),temporary:m.temporary,obtained:m.obtained,stage:m.stage,conditional:m.conditional,condition:m.condition,target:m.targetId?data.maps.pokemons.get(m.targetId)?.name:null})),
    reserve:step.reserve,rerollGold:rules.economy.rerollGold,interestCap:rules.economy.baseInterestCap,xp:step.xp,overCapacity:step.overCapacity};
}
