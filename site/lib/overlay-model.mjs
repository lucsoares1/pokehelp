import {variantsFor,suggestFormation,teamSynergies,compositionTitle,compositionHref,compositionSelectionName} from './composition-model.mjs';
import {targetList,acquisitionLabel} from './leveling-model.mjs';

export const OVERLAY_KEY='pokechess-overlay-v1';
export const selectionKey=s=>s?`${s.compId}@${s.snapshotId}~${s.variantIndex}`:'';
export const emptyOverlayState=()=>({schemaVersion:1,selection:null,obtained:[],visible:false,minimized:false,position:null,guideLevel:2});
export function parseOverlayState(raw){
  const blank=emptyOverlayState();
  try{
    if(typeof raw!=='string'||raw.length>10000)return blank;
    const v=JSON.parse(raw);if(v?.schemaVersion!==1)return blank;
    const s=v.selection,token=value=>typeof value==='string'&&/^[\w.-]{1,100}$/.test(value);
    if(s&&(!token(s.compId)||!token(s.snapshotId)||!Number.isInteger(s.variantIndex)||s.variantIndex<0||s.variantIndex>500))return blank;
    return {...blank,selection:s?{compId:s.compId,snapshotId:s.snapshotId,variantIndex:s.variantIndex}:null,
      obtained:Array.isArray(v.obtained)?[...new Set(v.obtained.filter(i=>Number.isInteger(i)&&i>=0&&i<24))]:[],
      visible:v.visible===true,minimized:v.minimized===true,guideLevel:Number.isInteger(v.guideLevel)&&v.guideLevel>=2&&v.guideLevel<=9?v.guideLevel:2,
      position:v.position&&Number.isFinite(v.position.x)&&Number.isFinite(v.position.y)?{x:v.position.x,y:v.position.y}:null};
  }catch{return blank;}
}
export function clampOverlayPosition(position,width,height,viewportWidth,viewportHeight){
  return {x:Math.max(8,Math.min(position.x,Math.max(8,viewportWidth-width-8))),y:Math.max(8,Math.min(position.y,Math.max(8,viewportHeight-height-8)))};
}

// A versioned plan for the overlay. It contains no live game state or browser DOM.
export function createOverlayPlan(comp,data,variantIndex,progression=null){
  const variants=variantsFor(comp),team=variants.find(v=>v.index===Number(variantIndex));
  if(!team)throw new Error('Esta variação não está disponível. Escolha outra equipe.');
  const selection={compId:comp.id,snapshotId:data.manifest.id,variantIndex:team.index};
  const item=id=>{const i=data.maps.items.get(id);if(!i)throw new Error('Item não encontrado nesta versão.');return {id:i.id,name:i.name,image:i.image,description:i.description,components:i.components.map(id=>data.maps.items.get(id)?.name??id)};};
  const units=team.members.map((m,slot)=>{
    const p=data.maps.pokemons.get(m.id);if(!p)throw new Error('Pokémon não encontrado nesta versão.');
    return {slot,id:p.id,name:p.name,image:p.image,rarity:p.rarity,rarityLabel:p.rarityLabel,stars:p.stars,items:m.items.map(item)};
  });
  const formation=suggestFormation(team,data),components=new Map();
  for(const m of team.members)for(const id of m.items)for(const c of data.maps.items.get(id)?.components??[])components.set(c,(components.get(c)??0)+1);
  const targets=progression?targetList(team,data,progression).map(t=>({slot:t.index,target:t.target.name,method:t.route.method,base:t.base?{id:t.base.id,name:t.base.name,image:t.base.image,copies:t.route.copies}:null,note:acquisitionLabel(t,progression)})):[];
  return {schemaVersion:1,selection,title:compositionTitle(comp,data),variantLabel:team.label,gameVersion:data.manifest.gameVersion??data.manifest.id.split('-')[0],
    href:compositionHref(comp,team.index),units,
    formation:{columns:formation.columns,rows:formation.rows,units:formation.units.map(u=>({slot:u.index,row:u.row,col:u.col,range:u.range}))},
    synergies:teamSynergies(team,data).filter(s=>s.active).map(s=>({id:s.id,name:s.synergy?.name??s.id,image:s.synergy?.image,count:s.count})),
    components:[...components].map(([id,count])=>({...item(id),count})),targets,
    variants:variants.map(v=>({index:v.index,label:v.label,names:compositionSelectionName(v,data)}))};
}
