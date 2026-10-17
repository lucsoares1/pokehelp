// Dados do painel público da página de referência, conferidos em 15/10/2026.
// Posições: linha, coluna (0–3, 0–6), campeão, estrelas. Sem dados de Pokémon.
export const compositionDetails = [
  {
    info: 'Build around Aphelios as your ranged carry and Nidalee as a second damage threat. Amumu and Ancient Sentinel hold the frontline. Reach level 8 and upgrade your four-cost carries and tank to stabilize the board.',
    synergies: [['attuned',1,'ORANGE'],['caustic',1,'ORANGE'],['lunar',3,'SILVER'],['vanguard',2,'BRONZE'],['invoker',2,'BRONZE'],['inferno',2,'BRONZE'],['juggernaut',2,'BRONZE'],['primal',2,'BRONZE'],['adaptor',2,'BRONZE'],['rapidfire',2,'BRONZE']],
    augments: [['tft_augment_cognitivetaxplus','focused-fire','slightly-magic-roll'],['big-grab-bag','slammin','epic-rolldown'],['tft_augment_thebaronslair','bladeoverflow_iii','bronzeforlife_iii']],
    carousel: ['bf-sword','chain-vest','giants-belt','recurve-bow','negatron-cloak'], core: 'aphelios',
    board: [[0,3,'sentinel'],[0,4,'amumu'],[1,2,'vi'],[1,3,'diana'],[2,6,'nidalee'],[3,0,'alune'],[3,1,'varus'],[3,5,'kogmaw'],[3,6,'aphelios']],
    levels: [[4,'2-1','5+'],[5,'2-5','10+'],[6,'3-2','30+'],[7,'4-1','50+'],[8,'4-2','30+','Reroll for carries'],[9,'5-5','20+']],
    builder: '/tft/comp-builder?map=IzAMFZS0DM%2F4kAs1QCYCGaBGaAcaAnAMzarzxoAmoApuRTOOGgOypohqgbiGjEGFcFWL9ojGADYqwAMZD4rMFI7FgMYFQB0QA%3D%3D%3D~EwDiA%3D%3D%3D~', stars: []
  },
  {
    // Texto também presente na imagem fornecida pelo proprietário.
    info: "In this comp we're going to be playing around the Dark Ritual augment! This converts you cashout to AP for your Coven units. Elise, Cassiopeia and Morgana are the main carries. You can still play this board with a Coven opener and without the Dark Ritual augment but it wont be as strong.",
    synergies: [['attuned',1,'ORANGE'],['vanguard',4,'SILVER'],['coven',3,'BRONZE'],['invoker',2,'BRONZE'],['lunar',2,'BRONZE'],['spellweaver',2,'BRONZE']],
    augments: [['tft_augment_expedition','pandorasbench1','building-an-army-i'],['dark-ritual','coven-acolyte','solo-plate'],['worth-the-wait-ii','goldenticket','tft_augment_thebaronslair']],
    carousel: ['tear-of-the-goddess','needlessly-large-rod','recurve-bow','negatron-cloak','chain-vest'], core: 'elise',
    board: [[0,4,'elise',3],[1,3,'sentinel'],[1,4,'hecarim'],[2,3,'diana'],[2,4,'morgana'],[2,5,'morgana'],[3,5,'alune'],[3,6,'cassiopeia',3]],
    levels: [[3,'2-1','10+','DO NOT buy XP'],[4,'2-3','20+'],[5,'3-1','30+'],[6,'3-2','30+','Slowroll for carries'],[7,'4-7','50+'],[8,'5-7','20+'],[9,'6-5','20+']],
    builder: '/tft/comp-builder?map=IwdmAZMgmAWYAm0CG0HgKxXAMz%2FgZmGCyn31gE5wBTbcvWJUyYANmACMSNhoXwoCCTboC9BiHEBjbH2CVQAOiA%3D%3D~KxA%3D~', stars: ['cassiopeia','elise']
  },
  {
    info: "Slow roll at level 7 for Kha'Zix, Hecarim and Diana. Kha'Zix develops through takedowns and upgrades, so finding him early helps. Hecarim tanks while Diana provides another frontline threat; choose your later backline carry to suit your items.",
    synergies: [['attuned',1,'ORANGE'],['flora-fatalis',2,'GOLD'],['rival',1,'GOLD'],['lunar',3,'SILVER'],['elderwood',3,'BRONZE'],['vanguard',2,'BRONZE'],['defender',2,'BRONZE'],['spellweaver',2,'BRONZE'],['executioner',2,'BRONZE']],
    augments: [['building-an-army-i','small-grab-bag','pandorasbench1'],['big-grab-bag','heroic-grab-bag','tft_augment_grouphug2'],['goldenticket','retribution','tft_augment_goldengamble']],
    carousel: ['needlessly-large-rod','tear-of-the-goddess','sparring-gloves','chain-vest','giants-belt'], core: 'khazix',
    board: [[0,1,'khazix',3],[0,2,'hecarim',3],[0,6,'tree'],[1,1,'diana',3],[1,2,'fiddlesticks'],[2,2,'ornn'],[3,0,'ezreal'],[3,1,'aphelios'],[3,2,'alune'],[3,3,'soraka'],[3,6,'lifebloom']],
    levels: [[4,'2-1','5+'],[5,'2-5','10+'],[6,'3-2','30+'],[7,'3-7','50+','Slowroll for carries'],[8,'5-5','20+'],[9,'6-2','10+']],
    builder: '/tft/comp-builder?map=AwIwjAhs3GCmZFmAMzAVhsAHAZgEwT7b4DswcWSAxsvgJxj5YqtsAs6xLbr6jyFvgAmTdMOAA2Hr0nJcMtpPS52i1gDpgpdpN68w1TvrZA%3D%3D~ExA%3D~', stars: ['diana','hecarim','khazix']
  },
  {
    info: 'Upgrade Pebbles, Cinderling and Krug to form your Riftbeast core. Use the special Riftbeast shops alongside natural shop upgrades, then invest in levels. Adjust your rolling pace to the copies you find and your progress toward five Riftbeasts.',
    synergies: [['emerald-aspect',1,'ORANGE'],['apex-predator',1,'ORANGE'],['riftbeast',7,'GOLD'],['brawler',2,'BRONZE'],['vanguard',2,'BRONZE'],['invoker',2,'BRONZE']],
    augments: [['building-an-army-i','tft_augment_feelinglucky','missed-connections-i'],['omega-riftbeast','heroic-grab-bag','verticality-ii'],['tft_augment_thebaronslair','buriedtreasures3','verticality-iii']],
    carousel: ['sparring-gloves','tear-of-the-goddess','giants-belt','recurve-bow','chain-vest'], core: 'sentry',
    board: [[0,4,'krug',3],[2,1,'sentinel'],[2,2,'taric'],[2,3,'scuttlecrab',3],[2,4,'gnar'],[2,5,'elder-dragon'],[3,5,'cinderling',3],[3,6,'sentry',3]],
    levels: [[3,'2-1','10+','DO NOT buy XP'],[4,'2-3','20+'],[5,'3-2','50+','Slowroll for carries'],[6,'3-7','50+'],[7,'4-5','50+'],[8,'5-2','30+'],[9,'6-2','20+']],
    builder: '/tft/comp-builder?map=IwdmBMAZs4EMBMiAcAWYkCsNIDN8GqYDM2MBhARgrjhfquMMXfZsyDpFHMLgGy0o5OJFG4QxBAE4cwAKYZccAHRA~EwDiA%3D%3D%3D~', stars: ['krug','cinderling','sentry','scuttlecrab']
  },
  {
    info: 'Play toward level 9 for Draven, the Elder Dragon and a legendary frontline. Preserve Health and build your economy with a strong early and mid game board. Stabilize at level 8 when needed, then roll for your five-cost upgrades at level 9.',
    synergies: [['emerald-aspect',1,'ORANGE'],['old-growth',1,'ORANGE'],['apex-predator',1,'ORANGE'],['greenfather',1,'ORANGE'],['bounty-seeker',1,'ORANGE'],['riftbeast',3,'BRONZE'],['vanguard',2,'BRONZE'],['inferno',2,'BRONZE'],['juggernaut',2,'BRONZE']],
    augments: [['tft_augment_cognitivetaxplus','lategamespecialist1','tft_augment_cognitivetaxplus'],['birthday-reunion','epoch','late-game-scaling'],['upward-mobility','levelup','bladeoverflow_iii']],
    carousel: ['bf-sword','sparring-gloves','chain-vest','recurve-bow','giants-belt'], core: 'elder-dragon',
    board: [[0,1,'taric'],[0,2,'sentinel'],[0,3,'amumu'],[0,4,'kennen'],[0,5,'maokai'],[1,5,'elder-dragon'],[3,4,'ivern'],[3,6,'draven']],
    levels: [[4,'2-1','5+'],[5,'2-5','10+'],[6,'3-2','30+'],[7,'4-1','50+'],[8,'4-2','30+','Stabilize board'],[9,'5-2','20+','Roll for 5-costs']],
    builder: '/tft/comp-builder?map=AwTgzArM3AZvDgBNhRghBGTwAsM4NZMJMQDgBjDMgJjANoA5aBDTXSMAdgtbmQA2EJkEEisbjliNBtJJiQA6IA%3D%3D~IwZiA%3D%3D%3D~', stars: []
  }
];
