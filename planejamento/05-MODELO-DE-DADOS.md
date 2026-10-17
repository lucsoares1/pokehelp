# Modelo de dados conceitual

Este modelo orienta os contratos internos. Não define um banco ou fornecedor obrigatório. Arquivos estruturados e snapshots podem atender à primeira implementação.

| Entidade | Campos essenciais |
| --- | --- |
| GameVersion | Identificador da versão, modo suportado, revisão de fonte e estado publicado/desenvolvimento |
| SourceSnapshot | Origem, URL, hash, coleta, geração, período, versão declarada, versão verificada, schema e validação |
| Pokemon | ID canônico, índice textual, nome, forma, família, evolução, raridade, estrelas, sinergias e disponibilidade |
| PokemonStats | Versão, Pokémon, vida, ataque, velocidade, defesas, alcance e PP máximo; unidades da fonte |
| Ability / Passive | ID, descrição localizada, valores por patamar, escalas, alvos, duração, restrições e referência de implementação |
| RoleAssignment | Pokémon, função, versão, justificativa, condições e revisão editorial |
| Item | ID, categoria, atributos, efeito, componentes, restrições, variantes e referências de imagem |
| Synergy | ID, nome, membros por versão, patamares, efeitos e regras de contagem |
| CompositionSnapshot | ID local, ID do cluster na origem, snapshot, modo, contagem, frequência, média, vitória e sinergias |
| CompositionMember | Comp, Pokémon, frequência, média de itens e itens associados |
| CompositionExample | Comp, colocação, Elo quando fornecido, peças e equipamentos |
| ItemReport / PokemonReport | Snapshot, entidade, faixa, contagem, colocação média, associações e históricos |
| Guide / Build | ID estável, título, versão, modo, dificuldade, peças, itens, posição, alternativas, justificativas e revisão |
| TeamPlan | Versão, modo, células, Pokémon, equipamentos e metadados para salvar/compartilhar |
| Asset | ID, entidade, tipo, variante, origem, revisão, dimensões, licença, autor e crédito quando conhecidos |

## Identidade e relações

- Preservar IDs internos do jogo. Nome traduzido serve à exibição, não como chave.
- Índices como `0006` e formas como `0025-0006` são strings; preservar zeros e estrutura.
- Cluster ID pode mudar entre relatórios. A chave deve incluir o snapshot; um guia curado possui identidade independente.
- Relações Pokémon ↔ item podem ser mecânicas, estatísticas ou editoriais. Guardar o tipo da relação e não fundir as três como “melhor item”.
- Itens associados a um Pokémon no relatório não comprovam taxa de vitória de um conjunto completo de três itens.
- Formas, invocações, NPCs e unidades especiais precisam de categoria própria. Filtrar o catálogo público de forma explícita, sem excluir registros desconhecidos silenciosamente.

## Semântica e apresentação

`null` ou campo ausente não equivale a zero. Guardar valores originais antes de arredondar. Formatar porcentagens segundo a escala de cada campo. Contagem é a contagem da fonte; validar se representa usos, equipes ou partidas antes de nomeá-la na interface. Não dividir qualquer contagem pelo total geral para fabricar pick rate.

PP é o recurso do jogo; AP é Poder de Habilidade. Não renomear automaticamente velocidade como ataques por segundo. Preservar unidade, fórmula e contexto de cada atributo. Valores por estrela e por evolução não devem ser confundidos.

Datas sem offset permanecem com timezone não especificado até confirmação. Séries históricas preservam a data de cada ponto e a janela de agregação; variação entre janelas móveis não deve ser apresentada como resultado de um único dia.
