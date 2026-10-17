# Fontes, contratos e evidências

## Fontes primárias

- Jogo: <https://pokemon-auto-chess.com/>
- Repositório oficial: <https://github.com/keldaanCommunity/pokemonAutoChess>
- Rotas do servidor: <https://github.com/keldaanCommunity/pokemonAutoChess/blob/master/app/app.config.ts>

Consulta realizada em 15/10/2026 nesta conversa. O banco operacional usa MongoDB e seu acesso direto depende dos mantenedores. O Helper pode iniciar com fontes públicas, sem acesso ao banco de produção e sem credenciais do jogo.

Atualização de implementação: fontes públicas integradas ao importador local, com revisão `prod` fixada, proveniência, hashes e validação contra os IDs publicados. O enum completo e as classes são necessários: o CSV da revisão omite nove registros e tem 39 divergências de atributos. Detalhes e comandos em [15](15-AMBIENTE-E-IMPORTACAO.md). Evidências abaixo preservam a pesquisa inicial e não substituem o manifesto da coleta ativa.

## Rotas efetivamente consultadas

As rotas abaixo retornaram HTTP 200 com JSON sem autenticação nos testes da conversa. A verificação é pontual; não estabelece disponibilidade permanente nem contrato formal para terceiros.

| URL | Conteúdo observado | Cuidados |
| --- | --- | --- |
| <https://pokemon-auto-chess.com/status> | Versão publicada; última consulta retornou `6.11.1` | Não confundir com versão de package.json no master |
| <https://pokemon-auto-chess.com/pokemons> | Enum / identificadores | Não contém ficha completa de atributos |
| <https://pokemon-auto-chess.com/items> | Enum / identificadores de itens | Não contém todos os efeitos e receitas |
| <https://pokemon-auto-chess.com/types-trigger> | Patamares de sinergias | Regras descritivas vêm de outras fontes |
| <https://pokemon-auto-chess.com/meta/metadata> | `created_at`, `count`, `time_limit` | Preservar interpretação e timezone da fonte |
| <https://pokemon-auto-chess.com/meta-v2> | Comps agrupadas, contagens, frequência, vitória, média, equipes e coordenadas | Grupo estatístico não equivale a guia editorial |
| <https://pokemon-auto-chess.com/meta/items> | Itens por `tier`, `rank`, `count`, `pokemons` e séries históricas | Usuários populares são Pokémon, não contas humanas |
| <https://pokemon-auto-chess.com/meta/pokemons> | Pokémon por `tier`, `rank`, `count`, `items`, `item_count` e séries históricas | Não inventar métricas por combinação que não estão no payload |

Foram observadas 11 faixas identificadas por nomes como `LEVEL_BALL`, `NET_BALL`, `POKE_BALL` e `MASTER_BALL`. Importar a lista real e conferir os limites de Elo no código da versão; não deduzir que são faixas mutuamente exclusivas.

## Formatos e volume

- `meta-v2`: array; campos observados `cluster_id`, `count`, `ratio`, `winrate`, `mean_rank`, `synergies`, `mean_team`, `mean_items`, `top_teams`, `hull`, `x`, `y`, `generated_at`.
- `mean_team.pokemons`: mapa de ID para frequência, média de itens e itens associados.
- `mean_items`: lista de item e frequência. `top_teams`: exemplos com colocação, Elo, Pokémon e itens.
- Relatórios de itens/Pokémon: array por `tier`, com mapa de entidades dentro de cada entrada. `rank` representa colocação média no contexto observado, não posição numa tier list.
- Frequência de Pokémon/itens em comps apareceu como fração: `0.78` corresponde a 78%. `winrate` apareceu em escala percentual: `40.36697` corresponde a 40,37%. Validar cada campo antes de formatar.
- Respostas observadas: aproximadamente 31 MB para Pokémon, 6,4 MB para itens e 623 KB para comps. Valores variam e não são limites garantidos.
- Cabeçalhos observados incluíram CORS `*` e cache longo. Uma data de coleta recente não prova geração recente. O código e o servidor publicado apresentaram políticas de cache diferentes.

## Arquivos do repositório

| Arquivo / pasta no repositório oficial | Uso |
| --- | --- |
| `app/models/precomputed/pokemons-data.csv` | Atributos, alcance, habilidades, famílias, sinergias e formas |
| `app/models/colyseus-models/pokemon.ts` e fábrica de Pokémon | Mecânica e propriedades não presentes no CSV |
| `app/config/game/items.ts` | Atributos concedidos por itens |
| `app/types/enum/Item.ts` | Identificadores, categorias, receitas e componentes |
| `app/core/abilities/` e `app/core/effects/` | Implementação de habilidades, passivas e efeitos |
| `app/public/dist/client/locales/pt/translation.json` | Descrições e nomes em português |
| `app/public/dist/client/locales/en/translation.json` | Referência de texto e fallback |
| `app/public/dist/client/changelog/` | Notas completas e correções |
| `app/public/dist/client/changelog/summary/` | Resumo, título e data do patch |
| `app/config/game/patches.ts` | Lista de patches apresentados pelo projeto |

O CSV consultado tinha 1.179 entradas; um relatório Pokémon tinha 1.185 chaves na faixa consultada. Não presumir que todas são unidades disponíveis na mesma versão. Auditar formas, entidades especiais, diferenças de release e sentinelas.

## Endpoints encontrados no código, ainda sem validação equivalente

`/pokemons-index`, `/types`, `/meta/regions`, `/dendrogram`, `/meta/player-rank-distribution` e `/meta/game-activity`. A existência no código não comprova retorno utilizável em produção. Não tratar rotas administrativas como públicas; `/meta/types` aparecia com exigência de administrador no código consultado.

## Evidências reproduzidas das imagens do proprietário

| Consulta | Resultado da API que correspondeu à imagem |
| --- | --- |
| Comp `121` | 109 ocorrências; média 2,14679; vitória 40,36697%; Wild 9 / Dark 3; Mightyena com frequência 0,78 |
| Comp `119` | 86 ocorrências; média 2,80233; vitória 37,2093%; Ground 6 / Rock 4 / Dragon 3 entre as sinergias |
| Soul Dew, `LEVEL_BALL` | 72.192 ocorrências; média 4,22; Volcanion, Drizzile e Carnivine |
| Muscle Band, `LEVEL_BALL` | 65.989 ocorrências; média 4,14; Gyarados, Dudunsparce e Great Tusk |
| Shell Bell, `LEVEL_BALL` | 61.012 ocorrências; média 4,13; mesmos três usuários populares acima |

São fotografias da consulta, não valores permanentes nem mocks para alimentar o site. O rodapé das imagens informa relatório de 100.000 partidas, gerado em 14/10/2026, com início do período em 29/09/2026. Os horários da fonte não devem receber timezone inventado. Os arquivos temporários anexados na conversa são referências de pesquisa, não dependências do projeto.
