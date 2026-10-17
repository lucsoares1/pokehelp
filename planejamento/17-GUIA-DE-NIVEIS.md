# Guia de níveis para iniciantes

## Obtenção especial — vigente D031

Latios e Latias são uma dupla de Únicos na seleção do portal da etapa 10. Etapa da partida não é nível do jogador; é possível já ter a dupla no nível 6, se oferecida/escolhida. Não usa a probabilidade Ultra da loja comum. Regras verificadas na revisão fixada, com links em D031. Não transportar a regra de dourados de TFT para o PAC.

O guia não conhece a etapa, ofertas ou inventário. Bases intermediárias 2–8 só incluem métodos unique/legendary/egg/special/review quando a forma é marcada como pronta. Demais vagas recebem provisórios de sinergia. Na ficha, use Já tenho; no overlay, clique na peça da equipe final para marcá-la. O último nível continua como meta final completa e condicional, não confirmação de posse. Isso substitui os marcos automáticos de nível 6/8 mencionados em D029.

Evolução mostra Evoluir e requisito de receita; substituição mostra Sai/Entra em faixas com retratos. Adições sem saída continuam sem aviso. SVGs e componentes são compartilhados entre ficha e overlay.

## Continuidade e trocas — vigente D030

Níveis 2–8 devem preencher todas as vagas. O limite de membros do relatório não limita a montagem intermediária; famílias repetidas não consomem a lista curta de provisórios. Campo anterior é ponto de partida, com continuidade por família e trocas de provisórios limitadas a uma por nível quando fecham novo patamar relevante. Evoluções e entradas de peças finais podem gerar outras trocas, sempre indicadas.

Toda substituição tem retratos e nomes Sai → Entra, incluindo saída de uma peça da comp e troca entre provisórios. Evoluções pareadas antes das demais trocas; cópias duplicadas contadas individualmente. Adição sem saída não aparece na lista. No exemplo Dragão 6~0, nível 5 mostra cinco peças e nenhuma troca; nível 6 mostra Totodile → Latios e Turtwig → Latias. Condições de obtenção permanecem obrigatórias. Último nível preserva a referência final e a indicação de capacidade de D029.

## Comportamento vigente — D029, 16/10/2026

O guia agora descreve metas de campo, em vez de manter todas as iniciais até a marcação. No nível 9, objetivo idêntico à variação selecionada, com equipamentos para contagem das sinergias; uma equipe de oito deixa uma vaga flexível. Dez peças exigem capacidade extra explicitada. Cada forma pode exigir cópias, região, seleção adicional ou evento; isso aparece no próprio guia. Apenas marcas manuais significam posse.

Nos níveis 2–8, o planejador combina linhagens finais elegíveis com pontes de sinergia, usa patamares oficiais (Água 3/6/9) e preserva continuidade quando não perde benefícios relevantes. Exemplo da composição 54~4: no nível 5, Bunnelby/Trapinch/Turtwig/Sentret + Aron formam Terra 4/Monstro 2; no 6 entram evoluções condicionadas às cópias, alcançando Terra 6/Normal 3/Inseto 2. No 8, Venipede pode completar Inseto 4 enquanto Mudbray fica na orientação de reserva; no 9, troca por Mudsdale e Dunsparce por Dudunsparce se as condições estiverem completas. Gible permanece Gible, conforme a variação, sem evoluir além do objetivo.

As chances informam a raridade, não a peça. Raros têm máximo de 35% no 7, 8 e 9; não existe janela expirada automaticamente no 8/9. Regras de entrada, coleta editorial, pontuação e condições documentadas em D029. Sem conhecimento de PV/ouro/etapa/ofertas reais, concorrentes ou histórico de compras. Modelos não prometem rota vencedora. Esta seção substitui os critérios antigos de manter apenas iniciais e excluir especiais até marcação, descritos abaixo como histórico.

Implementado localmente em 15/10/2026, após a solicitação de explicar o caminho até cada composição, considerando loja, raridades, evoluções, XP, fast level e slow roll.

## O que existe na fonte

A revisão `07367c341fe928763da2b565c2eee010433e4fc1` contém probabilidades por nível, custos, experiência, juros, escolhas especiais e regras de evolução. Os relatórios de meta importados contêm equipes finais, sem sequência de compras/níveis de cada jogador. O código dos bots usa cenários com etapas; isso também não prova a rota real ou ideal de um jogador.

Fontes primárias arquivadas no cache de coleta e referenciadas no manifesto:

- [Loja: chances, seis espaços e custos por raridade](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/config/game/shop.ts).
- [Tabela de XP e limite padrão](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/config/game/experience.ts).
- [Compra de XP e nível inicial](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/models/colyseus-models/experience-manager.ts).
- [Reroll, renda, juros e XP passivo](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/rooms/commands/game-commands.ts).
- [Seleção da loja, regionais, adicionais e obtenções especiais](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/models/shop.ts).
- [Etapas de escolhas](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/config/game/stages.ts).
- [Pools únicos e lendários](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/config/game/pools.ts).
- [Classes e regras de evolução](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/models/colyseus-models/pokemon.ts).

## Regras confirmadas da versão

Nível inicial 2; máximo padrão 9. A tabela também declara nível 10, que não é oferecido como nível padrão no guia. Uma compra concede 4 XP por 4 de ouro. Há 2 XP passivo na distribuição de renda. Reroll pago custa 1 de ouro; existem efeitos que concedem rerolls gratuitos. Renda base 5 e juros base +1 a cada 10 de ouro, até +5 em 50; itens/regras especiais podem modificar a economia.

| Nível | Comum | Incomum | Raro | Épico | Ultra |
| --- | --- | --- | --- | --- | --- |
| 2 | 100% | 0% | 0% | 0% | 0% |
| 3 | 70% | 30% | 0% | 0% | 0% |
| 4 | 50% | 40% | 10% | 0% | 0% |
| 5 | 36% | 42% | 20% | 2% | 0% |
| 6 | 25% | 40% | 30% | 5% | 0% |
| 7 | 16% | 33% | 35% | 15% | 1% |
| 8 | 11% | 27% | 35% | 22% | 5% |
| 9 | 5% | 20% | 35% | 30% | 10% |

São probabilidades da categoria em um espaço comum, não chances de uma espécie. Estoque disponível, competição, famílias concluídas, regionais, adicionais, encontros Selvagens e outros efeitos alteram os encontros. Não calcular chance exata de uma espécie sem conhecer os pools da partida.

Escolhas de únicos na etapa 10 e lendários na 20 são eventos por etapa, independentemente do nível do jogador. Não mandar procurar essas categorias na tabela comum. Há outras formas de obtenção por efeitos. Formas finais normalmente são evoluções; não sugerir que subir o nível evolui uma peça. Exceções de quantidade importadas: Rhydon pede três Rhyhorn; Gyarados pede oito Magikarp, não nove por regra genérica.

## Interface entregue

Em cada variação: “Seu caminho até esta equipe / Guia de níveis”, aberto por padrão, integrado abaixo do campo final. Alterar nível ou alvo atualiza somente a progressão; formação, sinergias e itens finais continuam disponíveis na mesma ficha. O guia pode ser recolhido. A solicitação posterior do proprietário substituiu o comportamento anterior que escondia o campo (D015).

O visitante escolhe um nível entre 2 e 9 e um alvo de cópias da loja. Vê ação sugerida, chance da raridade, exemplo de campo em montagem, peças provisórias, próximos alvos e calculadora de XP. Retratos hexagonais compartilham as molduras por raridade da equipe final. Explicações de economia, receitas, tabela completa e metodologia ficam recolhidas.

“Já tenho” informa que aquela forma final foi obtida. O exemplo passa a utilizá-la, inclusive uma peça especial obtida por outra fonte; o guia para de orientar gasto em cópias de um alvo marcado pronto. Estado permanece em memória por grupo/snapshot/variação durante a navegação, inclusive ao abrir e fechar uma ficha. Recarregar a página limpa o estado; não há leitura automática da partida, login ou armazenamento remoto.

## Sugestões editoriais e limites

As janelas padrão são sugestões do Helper, não estatísticas extraídas de partidas: comuns até o 4, incomuns no 5, raros no 7, épicos com preparação para o 8 e Ultras no 8–9 (alvo 9). O guia explica o motivo, oferece troca do alvo e condiciona poupança à estabilidade do campo. Não promete que uma comp inteira deve sempre seguir fast 8/9, nem fixa rodada ou limite de PV sem evidência.

Para comuns cedo, a orientação é uma busca curta apenas se faltarem poucas cópias, antes de comprar XP e preservando o próximo múltiplo de dez. Não exige juntar 50 no nível 4, pois o XP passivo faz o nível subir naturalmente. A explicação de slow roll com reserva de 50 é uma referência de economia padrão para janelas em que já exista essa reserva.

O exemplo de montagem usa formas iniciais não condicionais da equipe e provisórios com tipos em comum. Uma família passa a ser sugerida quando sua raridade já alcançou 10% em algum nível até o selecionado, ou 5% para Ultra. Isso evita cobrar Ultra a 1% ou Épico a 2%. A forma não vira evolução só porque o jogador selecionou um nível alto; precisa ser marcada pronta. Provisórios não recebem os itens do exemplo final.

Regionais/adicionais não são presumidos liberados. Únicos, lendários, ovos, especiais e formas com rota não resolvida não surgem automaticamente no campo: o jogador pode marcar uma peça já obtida. O guia não garante a oferta de uma escolha especial, nem a condição exata de cada transformação dinâmica. Há **78 registros com rota em revisão** e **três rotas com listas de itens condicionais não resolvidas**, registradas em `quality.json`; rótulos explícitos evitam receitas inventadas. Funções editoriais amplas e revisão por jogador experiente continuam pendentes.

Exemplos com dez peças recebem aviso de capacidade: o guia respeita nove vagas no modo padrão. Modos especiais, Double Up, efeitos de capacidade, regras de Scribble, economia modificada e estado real do jogador exigem adaptação. A calculadora estima apenas o próximo nível pelo XP informado e compras inteiras, sem prever futuras rodadas.

## Arquitetura e verificação

`tools/lib/progression.mjs` extrai/valida regras e constrói rotas de evolução declarativas. `pokemonClassData` lê propriedades das regras, sem executar condições ou callbacks. `Object.freeze` é interpretado somente como invólucro de dados. Pools de escolhas são lidos como listas estáticas, sem instanciar o código remoto. Mudanças incompatíveis de formato ou patch interrompem a importação até revisão.

Arquivo `catalog/progression.json` versionado e validado por hash, carregado só quando um guia é aberto. `site/lib/leveling-model.mjs` calcula sugestões; `leveling-view.mjs` renderiza; `leveling-controller.mjs` coordena estado e leitura. CSS próprio reutiliza paleta, fontes e controles aprovados. Snapshots históricos anteriores exibem indisponibilidade do guia, sem misturar regras novas com catálogo antigo.

Comandos: `npm run data:import`, `npm run data:validate`, `npm run check`, `npm test`. Foram 29 testes aprovados, incluindo regras numéricas, evolução por oito cópias, escolhas especiais, famílias, limitação de nível/capacidade, ausência de evolução automática, importação sem execução de callbacks e preservação dos testes anteriores. Verificações de navegador e snapshot atual no [status](22-STATUS-DO-PROJETO.md).
