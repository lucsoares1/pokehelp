// Fixed fields only. Never print native objects, player IDs, room or account data.
export function readDiagnostics(status,panelVersion){
  const d=status?.diagnostics??{},yes=v=>v===true?'sim':v===false?'não':'?',safe=v=>typeof v==='string'&&/^[\w.:-]{1,40}$/.test(v)?v:'?',n=v=>Number.isInteger(v)&&v>=0&&v<=10000?v:'?';
  const mismatch=d.hostVersion&&d.hostVersion!==panelVersion||d.nativeVersion&&d.nativeVersion!==panelVersion;
  const summary=mismatch?'Versões diferentes: recarregue a extensão e a página do jogo.':d.context==='timeout'?'O serviço da extensão não respondeu ao plano.':d.context==='error'?'Falha ao obter o plano da extensão.':d.bridge==='module-error'?'Falha ao carregar os módulos do leitor.':d.bridge==='stale'?'A leitura nativa parou de responder.':d.bridge!=='received'?'Aguardando comunicação com o leitor nativo.':d.scene==='waiting'?'Leitor ativo; procurando a cena do jogo.':d.validation==='rejected'?'Leitura recebida, mas incompatível com o catálogo.':d.validation==='partial'?'Carrossel lido; reserva ou campo incompatível com o catálogo.':'Comunicação nativa ativa.';
  return {summary,text:[
    `Painel ${safe(panelVersion)} · página ${safe(d.hostVersion)} · leitor ${safe(d.nativeVersion)}`,
    `Plano: ${safe(d.context)} · módulos: ${yes(d.reader)} · ponte: ${safe(d.bridge)}`,
    `Cena: ${safe(d.scene)} · canvas: ${yes(d.canvas)} · global de debug: ${yes(d.global)}`,
    `Campo próprio: ${yes(d.ownBoard)} · leitura: ${safe(d.code)} · validação: ${safe(d.validation)}`,
    `Loja: ${safe(d.shop)} · slots nativos/DOM: ${n(d.nativeSlots)}/${n(d.domSlots)} · badges: ${n(d.badges)}`,
    `Planejador do jogo: ${safe(d.planner)} · alvos da comp: ${n(d.shopTargets)} · ofertas recomendadas: ${n(d.shopMatches)}`,
    `Portais: ${n(d.portalsRead)}/${n(d.portalObjects)} · símbolos: ${n(d.symbolObjects)} · marcas: ${n(d.markers)}`,
    `Menu bloqueando marcas: ${yes(d.blocked)}`,
    ...(d.read==='exception'?['Erro ao ler o contrato nativo.']:[])
  ].join('\n')};
}
