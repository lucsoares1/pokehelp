# Escopo completo e páginas

## Compromisso de escopo

Todas as funcionalidades abaixo integram o produto planejado. A divisão em etapas organiza a entrega e não elimina funcionalidades. Recursos cuja fonte ainda precisa de investigação devem aparecer no planejamento com essa condição; não devem ser apresentados como implementados.

| Página / área | Funcionalidades obrigatórias | Dependência |
| --- | --- | --- |
| Início | Busca, atalhos para aprender, Pokémon, itens, comps e patch vigente | Catálogos e status dos dados |
| Pokémon | Lista pesquisável, retratos, filtros de sinergia, raridade, alcance e funções | Cadastro versionado e curadoria |
| Ficha do Pokémon | Atributos, habilidade, passiva, evolução, funções, posição sugerida, builds, stats e comps relacionadas | Catálogo + análise + relatórios |
| Itens | Lista, categorias, ícones, componentes, receitas e filtros | Cadastro de itens e receitas |
| Ficha do item | Efeito explicado, atributos, restrições, usuários populares, recomendações e histórico | Mecânica + relatório de itens |
| Sinergias | Pokémon integrantes, patamares, efeitos, exemplos e combinações | Cadastro e regras por versão |
| Meta comps | Ordenação por colocação média, vitória e popularidade; filtro por Pokémon; tamanho da amostra | Relatório de composições |
| Ficha da comp | Sinergias, peças frequentes, itens, prioridade no carrossel, exemplos, guia e montador | Relatório + receitas + curadoria |
| Relatório Pokémon | Uso, colocação média, itens associados, faixas de ranking e evolução no tempo | Relatório Pokémon |
| Relatório de itens | Uso, colocação média, usuários populares, categorias e gráficos históricos | Relatório de itens |
| Montador de equipes | Tabuleiro, banco de peças, itens, sinergias, posicionamento, salvar e compartilhar | Catálogo e regras do tabuleiro |
| Aprenda | Guias iniciais, funções, dano, PP/AP, economia, posicionamento, equipamentos e glossário | Mecânica verificada e curadoria |
| Patches | Resumo, mudanças por Pokémon/item/sinergia e efeitos sobre guias | Notas oficiais e versões |
| Fontes e créditos | Origem dos dados, atualização, atribuição das imagens e caráter de projeto de fã | Proveniência e direitos |

## Relatórios complementares das telas de referência

As imagens também mostram Mapa de Grupo, Hierarquia dos grupos, Relatório de Região, Player Report e Game Activity. Incluir essas áreas no planejamento completo, com a seguinte classificação:

- Mapa de grupos: visualização dos agrupamentos de comps; o payload de comps contém coordenadas e contornos. Validar interpretação e escala.
- Hierarquia de grupos: há rota de dendrograma no código; validar o payload e a disponibilidade publicada antes de implementar.
- Regiões: há rota de estatísticas de regiões no código; validar dados, nomes e semântica.
- Distribuição de ranking de jogadores: verificar os dados agregados da rota correspondente. “Player Report” não implica autorização nem existência de uma busca individual de qualquer jogador.
- Atividade de partidas: verificar a rota agregada e distinguir jogadores, partidas, sessões e intervalos.

Esses complementos não receberam a mesma prova de conteúdo e números dos relatórios principais. São itens de entrega condicionados à validação da fonte; ver [pendências](21-PENDENCIAS-E-RISCOS.md).

## Regras de navegação

Pokémon, item e composição devem ligar entre si. O visitante deve conseguir abrir um item de uma comp e ver sua receita sem perder o contexto da equipe. Filtros e ordenações devem ser reproduzíveis por URL quando fizer sentido. Uma página sem estatísticas continua apresentando os dados mecânicos disponíveis e informa claramente a ausência do relatório.
