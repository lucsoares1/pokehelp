import {escapeHtml as e} from './content.mjs';
import {pokemonArtImage} from './presentation.mjs';

// Exact normal forms. HOME renders are presentation assets, not gameplay data.
export const cardArtwork={
  "GYARADOS": {
    "src": "assets/presentation/home-renders/130.png"
  },
  "UMBREON": {
    "src": "assets/presentation/home-renders/197.png"
  },
  "LICKILICKY": {
    "src": "assets/presentation/home-renders/463.png"
  },
  "CARNIVINE": {
    "src": "assets/presentation/home-renders/455.png"
  },
  "GARCHOMP": {
    "src": "assets/presentation/home-renders/445.png"
  },
  "LUCARIO": {
    "src": "assets/presentation/home-renders/448.png"
  },
  "SPIRITOMB": {
    "src": "assets/presentation/home-renders/442.png"
  },
  "TYRANITAR": {
    "src": "assets/presentation/home-renders/248.png"
  }
};
export const hasCardArtwork=p=>Object.hasOwn(cardArtwork,p.id);
export function pokemonCardArtImage(p,cls=''){
  const art=cardArtwork[p.id];
  return art?`<img src="${e(art.src)}" alt="${e(p.name)}" class="${cls} is-home-render" data-portrait="${e(p.image)}" width="512" height="512" loading="lazy" decoding="async">`:pokemonArtImage(p,cls);
}
