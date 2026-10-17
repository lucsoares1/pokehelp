// Snapshot visual da única página de referência, consultada em 15/10/2026.
// Estes dados são TFT/Mobalytics; não são dados do Pokémon Auto Chess.
export const source = 'https://mobalytics.gg/tft?int_source=homepage&int_medium=mainbutton';
export const asset = path => `assets/${path}`;
export const icon = name => asset(`common/icons/side-menu-icon/${name}.svg`);
export const itemImage = id => asset(`tft/images/game-items/set18/${id}.png`);
export const championImage = id => asset(`tft/images/champions/icons/set18/${id}.png`);

export const games = [
  ['LoL', 'lol', '/lol'], ['TFT', 'tft', '/tft'], ['Diablo 4', 'diablo-4', '/diablo-4'],
  ['PoE 2', 'poe-2', '/poe-2'], ['PoE', 'poe', '/poe'], ['WoW Forever', 'wowfor', '/wow-forever', 'New'],
  ['Destiny 2', 'destiny-2', '/destiny-2'], ['Marathon', 'marathon', '/marathon'],
];
export const moreGames = [
  ['STS 2','slay-the-spire-2','/slay-the-spire-2'], ['Deadlock','deadlock','/deadlock'],
  ['Overwatch','ovw','/overwatch'], ['Borderlands 4','boderlands-4','/borderlands-4'],
  ['VAL','valorant','/valorant'], ['NTE','neverness-to-everness','/neverness-to-everness'],
  ['Endfield','arknights-endfield','/endfield'], ['Nightreign','elden-ring-nightreign','/elden-ring-nightreign'],
  ['Hades 2','hades-2','/hades-2'], ['Marvel Rivals','marvel-rivals','/marvel-rivals'],
];
export const navigation = [
  { label:'Home', icon:'dashboard', href:'#home', current:true },
  { label:'Summoner', icon:'profile', href:'https://mobalytics.gg/tft/profile' },
  { label:'Team Comps', icon:'team-comps', href:'#compositions' },
  { label:'Database', icon:'champions', href:'#champions' },
  { label:'Stats', icon:'meta-tier-list', href:'https://mobalytics.gg/tft/tier-list' },
  { label:'Team Builder', icon:'team-builder', href:'https://mobalytics.gg/tft/comp-builder' },
  { label:'Guides', icon:'guides', href:'https://mobalytics.gg/tft/guides' },
];
export const champions = [
  {id:'ashe', name:'Ashe', traits:[['Blossom','blossom'],['Hunter','hunter']], items:['redbuff','last-whisper','spear-of-shojin2']},
  {id:'draven', name:'Draven', traits:[['Bounty Seeker','bounty-seeker']], items:['krakensfury','guinsoos-rageblade','deathblade']},
  {id:'taric', name:'Taric', traits:[['Emerald Aspect','emerald-aspect'],['Vanguard','vanguard']], items:['warmogs-armor','gargoyle-stoneplate','steadfast-hammer']},
  {id:'elder-dragon', name:'The Elder Dragon', traits:[['Riftbeast','riftbeast'],['Apex Predator','apex-predator']], items:['infinity-edge','guardbreaker','deathblade']},
  {id:'kennen', name:'Kennen', traits:[['Inferno','inferno'],['Executioner','executioner']], items:['edge-of-night','jeweled-gauntlet','hand-of-justice']},
  {id:'ivern', name:'Ivern', traits:[['Greenfather','greenfather']], items:['spear-of-shojin2','blue-buff2','adaptive-helm']},
  {id:'gnar', name:'Gnar', traits:[['Elderwood','elderwood'],['Sprykin','sprykin'],['Brawler','brawler']], items:['bloodthirster',"sterak's-gage",'titans-resolve']},
  {id:'lux', name:'Lux', traits:[['Avatar','avatar']], items:['spear-of-shojin2','jeweled-gauntlet','rabadons-deathcap']},
];

const names = {amumu:'Amumu',aphelios:'Aphelios',nidalee:'Nidalee',alune:'Alune',sentinel:'Ancient Sentinel',diana:'Diana',kogmaw:"Kog'Maw",vi:'Vi',varus:'Varus',morgana:'Morgana',cassiopeia:'Cassiopeia',elise:'Elise',hecarim:'Hecarim',ezreal:'Ezreal',khazix:"Kha'Zix",soraka:'Soraka',fiddlesticks:'Fiddlesticks',ornn:'Ornn','elder-dragon':'The Elder Dragon',krug:'Krug',cinderling:'Cinderling',sentry:'Pebbles',gnar:'Gnar',taric:'Taric',scuttlecrab:'Scuttlecrab',draven:'Draven',maokai:'Maokai',kennen:'Kennen',ivern:'Ivern'};
const border = {amumu:'#f947c6',aphelios:'#f947c6',nidalee:'#f947c6',alune:'#fe8900',sentinel:'#f947c6',diana:'#0b6cc3',kogmaw:'#0b6cc3',vi:'#0b6cc3',varus:'#afafaf',morgana:'#f947c6',cassiopeia:'#0b6cc3',elise:'#1bc660',hecarim:'#0b6cc3',ezreal:'#f947c6',khazix:'#0b6cc3',soraka:'#f947c6',fiddlesticks:'#0b6cc3',ornn:'#afafaf','elder-dragon':'#fe8900',krug:'#0b6cc3',cinderling:'#afafaf',sentry:'#afafaf',gnar:'#fe8900',taric:'#fe8900',scuttlecrab:'#1bc660',draven:'#fe8900',maokai:'#fe8900',kennen:'#fe8900',ivern:'#fe8900'};
const unit = (id, items=[]) => ({id, name:names[id], border:border[id], items});
export const compositions = [
  {name:'Moonlit Hunt',slug:'moonlit-hunt-3JBJHbLQQVkdfm6vFl6EPiJcEKw',style:'Fast 8',difficulty:'Medium',background:'aphelios',units:[unit('amumu',['gargoyle-stoneplate','bramble-vest','warmogs-armor']),unit('aphelios',['giant-slayer','deathblade','guinsoos-rageblade']),unit('nidalee',["sterak's-gage",'spear-of-shojin2','infinity-edge']),...['alune','sentinel','diana','kogmaw','vi','varus'].map(id=>unit(id))]},
  {name:'Dark Ritual',slug:'dark-ritual-3KZ1gNvZRg3iV7qqfua7YzBR5IM',style:'Level 6 Slow Roll',difficulty:'Medium',background:'elise',units:[unit('morgana',['voidstaff','morellonomicon','adaptive-helm']),unit('morgana',['archangels-staff','jeweled-gauntlet','adaptive-helm']),unit('cassiopeia',['spear-of-shojin2','hextech-gunblade','archangels-staff']),unit('elise',['titans-resolve','guinsoos-rageblade','gargoyle-stoneplate']),...['alune','sentinel','diana','hecarim'].map(id=>unit(id))]},
  {name:'Moonlight Mantis',slug:'moonlight-mantis-3J97BdQFVwSHCHZqKyqpNU6Jr19',style:'Level 7 Slow Roll',difficulty:'Medium',background:'khazix',units:[unit('ezreal',['last-whisper','redbuff','spear-of-shojin2']),unit('diana',['hand-of-justice','ionic-spark','jeweled-gauntlet']),unit('hecarim',['fimbulwinter','gargoyle-stoneplate','warmogs-armor']),unit('khazix',['rabadons-deathcap','hand-of-justice','hand-of-justice']),...['alune','aphelios','soraka','fiddlesticks','ornn'].map(id=>unit(id))]},
  {name:'Riftbeast Reroll',slug:'riftbeast-reroll-3HF3zdBtCA0c8SV4vflw85oZehT',style:'Level 5 Slow Roll',difficulty:'Easy',background:'sentry',units:[unit('elder-dragon',['guardbreaker','infinity-edge','deathblade']),unit('krug',['crownguard','gargoyle-stoneplate','warmogs-armor']),unit('cinderling',['blue-buff2','infinity-edge','last-whisper']),unit('sentry',['rabadons-deathcap','jeweled-gauntlet','blue-buff2']),...['gnar','taric','sentinel','scuttlecrab'].map(id=>unit(id))]},
  {name:'AD Exodia',slug:'ad-fast-9-3HIz3Cx7oNI4RGtlcnOVu0H4xFh',style:'Fast 9',difficulty:'Hard',background:'elder-dragon',units:[unit('draven',['krakensfury','redbuff','guinsoos-rageblade']),unit('maokai',['warmogs-armor','gargoyle-stoneplate','spiritvisage']),unit('elder-dragon',['infinity-edge','last-whisper','guardbreaker']),unit('kennen',['thiefs-gloves']),...['ivern','taric','amumu','sentinel'].map(id=>unit(id))]},
];

export const footerGroups = [
  ['League of Legends', [['In-game Overlay','/lol/glp/app-download'],['GPI','/lol/gpi/'],['Personal Match History','/lol/profile/'],['Summoner Search','/lol/summoner-search'],['LoL Champions','/lol/champions'],['LoL Tier List','/lol/tier-list']]],
  ['Teamfight Tactics', [['In-game Overlay','/tft/glp/app-download'],['Meta Team Comps','/tft/team-comps'],['Team Comps Builder','/tft/comp-builder'],['Personal Match History','/tft/profile/'],['Augments','/tft/hextech-augments'],['TFT Champions','/tft/champions'],['TFT Tier List','/tft/tier-list/']]],
  ['Valorant', [['Map Guides & Tips','/valorant/map/ascent'],['Agents','/valorant/agents'],['Personal Match History','/valorant/profile'],['Player Search','/valorant/search'],['Leaderboards','/valorant/leaderboard'],['Master Class','/valorant/lesson']]],
  ['Resources', [['Blog','/blog/'],['Infographics','/guides-and-infographics/'],['Videos','https://www.youtube.com/channel/UCGCpa--gJo5Dzi0oxNgUPrw'],['About GPI','/gpi/'],['Research','/lol-ladder-research/'],['FAQ','https://support.mobalytics.gg/hc/en-us']]],
  ['Other', [['Twitch Extension','/twitch-extension/'],['Proving Grounds','https://pg.mobalytics.gg/'],['Founders Wall','/founders-wall/'],['Wild Rift','/blog/wild-rift/']]],
];
