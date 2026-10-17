# Composições, variações e formação

Implementado localmente em 15/10/2026, a pedido do proprietário. Mantém a estrutura visual da referência Mobalytics, com os conceitos de Pokémon Auto Chess.

## Fluxo

Filtros da lista (D017): sinergia principal do grupo ou ativa na equipe, Pokémon por nome com sugestões, presença na equipe ou em destaque e ordenação por média/vitória/ocorrências. “Em destaque” usa a mesma peça mais equipada da identidade do detalhe, com desempate pela ordem original. Condições são combinadas na mesma equipe real; a linha abre uma variação compatível e seu seletor inclui somente opções compatíveis. Limpar restaura os 130 grupos. Links diretos independem dos filtros; controles são mantidos em memória durante a navegação.

Cada linha representa um grupo. O cabeçalho mostra uma equipe real, em vez de juntar Pokémon frequentes que podem não ter jogado juntos. Abrir a linha exibe somente a equipe selecionada; abrir outra recolhe a anterior.

“Ver variações” abre uma grade compacta com retratos, colocação e Elo. A escolha substitui o cabeçalho, campo, sinergias, equipamentos e explicação da peça; o seletor se recolhe. Há 780 exemplos brutos, dos quais dois não contêm membros: as 778 equipes utilizáveis aparecem nos seletores dos 130 grupos. Exemplos vazios continuam preservados no snapshot.

A opção “Principal” é o exemplo com maior média das frequências dos seus membros no grupo. É uma escolha de apresentação, não uma promessa de melhor equipe. Os índices originais são preservados nos links, independentemente dessa ordenação.

Links `#comp/GRUPO@SNAPSHOT~INDICE` abrem uma variação específica. Links antigos sem índice continuam válidos. Salvar continua guardando o grupo e o snapshot; a seleção da variação permanece na sessão de navegação e nos links diretos. Não há salvamento individual de variações nesta etapa.

## Painel

- Visão geral: número de peças, melee/ranged, colocação e Elo do exemplo.
- Sinergias: totais e patamares ativos; incompletas ficam recolhidas.
- Componentes: receitas dos itens efetivamente usados, sem prioridades inventadas.
- Pokémon e equipamentos: faixa com a equipe completa, itens reais sobrepostos à base de cada retrato e indicação de peças sem equipamentos. Ícones de 24 px, 23 px na faixa compacta, preservando a imagem integral dentro de moldura separada (D016).
- Campo: 8 colunas × 3 fileiras, com retratos hexagonais, molduras por raridade, estrelas de catálogo, nomes e itens. A silhueta visual não muda coordenadas ou regras do campo.
- Em telas estreitas, o campo conserva no mínimo 552 px e rola dentro do painel, mantendo os equipamentos de 24 px legíveis. Área focável com setas do teclado; documento sem rolagem horizontal.
- Inspeção: clicar em uma peça do campo ou da lista mostra alcance, habilidade, função editorial quando disponível, equipamentos usados e receitas. Habilidade carregada sob demanda; ficha completa acessível.
- Metodologia: recolhida, distingue métricas do grupo, fatos do exemplo e sugestões.

Desktop: identidade da equipe e sinergias à esquerda; equipamentos e campo maior à direita. A inspeção fica recolhida e abre ao clicar em uma peça. Guia de níveis integrado abaixo, aberto por padrão, sem ocultar o campo. Celular: identidade/sinergias compactas, equipamentos, campo e progressão na mesma ficha. Um detalhe por vez e variações recolhidas evitam empilhar equipes. Refinamento visual autorizado pela nova referência do proprietário (D015).

## Mecânica e sugestão

O relatório não informa posições. O Helper gera uma **sugestão inicial**, identificada ao lado do campo. Alcance 1 prefere a frente, 2 o meio, 3+ o fundo. Considera bônus de alcance dos itens e ordena unidades por resistência base aproximada (`PV × (2 + Defesa + Defesa especial)`). Isso não atribui automaticamente função tanque/carry. Não simula habilidades, auras, saltos ou adversários. As posições são sugestões locais e não entram no registro estatístico importado.

As sinergias são calculadas para a equipe selecionada, agrupando tipos por família e adicionando tipos dos itens. Inclui duplicação do segundo tipo por Dragão e passivas `PROTEAN2/PROTEAN3` da implementação fixada. Gemas consumidas, bônus externos e regras especiais desconhecidas podem alterar os totais reais; limitação explícita na interface. Snapshots antigos sem essas regras exibem indicação de cálculo parcial.

Fontes primárias na revisão `07367c341fe928763da2b565c2eee010433e4fc1`:

- [Campo e ordem por alcance](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/utils/board.ts).
- [Famílias, Dragão e tipos dinâmicos](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/models/colyseus-models/synergies.ts).
- [Tipos concedidos pelos itens](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/types/enum/Item.ts).

## Código e atualização

`site/lib/composition-model.mjs`: seleção, sinergias e sugestões em funções independentes do DOM. `composition-view.mjs`: painel. `view-primitives.mjs`: retratos/itens compartilhados. `composition-teams.css`: layout. `main.mjs`: expansão, seleção, carregamento e links.

O importador extrai `SynergyGivenByItem` via AST restrito e publica `catalog/team-rules.json` com revisão, versão, campo e ordem das sinergias. Índice compacto Pokémon inclui `passiveId`. Código de mecânicas é arquivado como auditoria, sem execução remota. Mudança de patch exige revisar os contratos e o algoritmo local.

Verificação: `npm run check`, `npm test`, `npm run data:validate`. Suíte cobre as 130 comps e 778 variações válidas, posições sem colisão para todos os 780 exemplos brutos, Lentes Amplas, famílias, itens de tipos, Dragão, Arceus e links. Ver [status](22-STATUS-DO-PROJETO.md).
