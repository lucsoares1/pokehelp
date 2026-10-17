// Exact identities only: other forms keep their own game portrait.
export const artworkById={GYARADOS:130,VOLCANION:721,UMBREON:197,LICKILICKY:463,MIGHTYENA:262,CARNIVINE:455,GREAT_TUSK:984,RAMPARDOS:409};
export function pokemonArt(p){return Object.hasOwn(artworkById,p.id)?`assets/presentation/pokemon/${artworkById[p.id]}.png`:p.image;}
export const hasArtwork=p=>Object.hasOwn(artworkById,p.id);
export function pokemonArtImage(p,cls=''){
  return `<img src="${e(pokemonArt(p))}" alt="${e(p.name)}" class="${cls}${hasArtwork(p)?'':' is-portrait'}" ${hasArtwork(p)?`data-portrait="${e(p.image)}"`:''} loading="lazy" decoding="async">`;
}
export const typeTints={WATER:'#e9f5fc',FIRE:'#fff0e8',DARK:'#eeeafa',WILD:'#f8eee4',MONSTER:'#eff5e7',GROUND:'#f6eddf',FOSSIL:'#e9f1f6'};
// Visual energy colors only; rarity and synergy rules still come from the catalog.
export const cardTypeColors={NORMAL:'#b8b7a8',FLYING:'#90b4d8',FIELD:'#c6a373',DARK:'#9488b6',GROUND:'#c3a06a',PSYCHIC:'#d989bc',GRASS:'#89bd67',BUG:'#b4bf57',WATER:'#65b5d9',AQUATIC:'#5fc5bd',POISON:'#b38bcb',FAIRY:'#e7a5cb',FIGHTING:'#db9676',FIRE:'#e79a60',GHOST:'#a299d3',ROCK:'#b6a779',MONSTER:'#9dba73',AMORPHOUS:'#b89bd0',WILD:'#d48a78',SOUND:'#a9add7',FLORA:'#b2c77c',STEEL:'#93bcc0',ELECTRIC:'#e6ca6c',ICE:'#88cddc',BABY:'#ebbdca',HUMAN:'#dfab88',DRAGON:'#87b8c8',LIGHT:'#e2d594',GOURMET:'#d6a58b',FOSSIL:'#a5b5c3',ARTIFICIAL:'#98b7c6'};
import {escapeHtml as e} from './content.mjs';
