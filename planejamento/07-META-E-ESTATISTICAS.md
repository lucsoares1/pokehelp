# Meta, composições e estatísticas

## Composições

Exibir sinergias principais, colocação média, taxa de vitória da fonte, contagem, popularidade quando sua definição estiver validada, Pokémon frequentes, itens populares e exemplos de equipes. Permitir ordenação independente por desempenho e popularidade, filtro por Pokémon, seleção de modo quando disponível e indicação da janela dos dados.

O modelo deve suportar mapa de grupos com coordenadas/contornos e hierarquia por dendrograma, após validação das respectivas fontes. Esses gráficos são formas de explorar relações entre equipes; não significam um ranking de força por distância visual.

Uma comp estatística agrupa equipes semelhantes. Não interpretar todos os Pokémon frequentes do grupo como uma única equipe que deve ser usada inteira. A ficha pode combinar o retrato estatístico com um guia curado, mantendo a distinção.

## Itens e Pokémon

- Ranking de itens por popularidade ou colocação média; filtros de categoria e faixa de ranking.
- Usuários populares do item significam Pokémon que o utilizam, não jogadores humanos.
- Ranking de Pokémon por uso ou colocação média; itens associados e média de equipamentos conforme a fonte.
- Gráficos de dispersão: contagem × colocação média; rótulos e alternativa em tabela.
- Séries de popularidade e colocação média; variações somente entre pontos comparáveis.
- Links recíprocos entre rankings, fichas e composições.

## Prioridade no carrossel

O componente público `app/public/src/pages/component/meta-report/team-comp.tsx` calcula componentes a partir dos itens populares da comp e de suas receitas, somando as frequências. Esse cálculo é reproduzível com as fontes correspondentes à versão.

Apresentar como prioridade derivada dos itens observados, não como escolha ótima universal. Conferir quais componentes podem aparecer no carrossel e tratar itens sem receita conforme sua categoria. Não atribuir ao endpoint uma prioridade pronta quando ela é calculada pela interface.

## Interpretação responsável

1. Menor colocação média indica melhor colocação observada, não uma posição maior na classificação.
2. Popularidade mede uso; não comprova força. Contagem absoluta e taxa de presença são medidas diferentes.
3. O campo `winrate` deve ter sua definição confirmada na geração dos relatórios antes de receber rótulos como “Top 1” ou “Top 4”.
4. Não somar faixas nem usá-las como categorias exclusivas sem verificar filtros e sobreposição.
5. Exibir amostra. A regra de “amostra pequena” deve ser documentada e configurável; não inventar precisão estatística.
6. Patch novo, modo diferente e janela móvel podem alterar a comparação. Informar incompatibilidade ou indisponibilidade.
7. Não afirmar causalidade: bons resultados com um item podem refletir força da unidade ou circunstâncias da partida.
8. Não atribuir win rate, colocação ou tamanho de amostra a combinações específicas sem esses dados.

Tier lists editoriais ou calculadas devem explicar metodologia, versão e revisão. Não rotular a lista ordenada por popularidade como “itens mais fortes”.

## Atualização e limites

Mostrar geração, coleta, período e estado dos dados. Não prometer tempo real: os relatórios consultados são snapshots. Sem novo snapshot válido, manter o último válido com aviso de desatualização. Sem dado anterior, mostrar indisponibilidade real, sem preencher gráficos com números inventados.

Relatórios complementares de regiões, distribuição de ranking e atividade entram após validação dos contratos. Não prometer histórico individual, partidas privadas ou dados pessoais a partir dessas rotas agregadas.
