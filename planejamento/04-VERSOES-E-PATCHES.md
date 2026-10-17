# Versões e patches

## Estado observado em 15/10/2026

Atualização posterior: o importador fixou `07367c341fe928763da2b565c2eee010433e4fc1` do ramo `prod`, cujo `package.json` declara 6.11.1, igual ao servidor. IDs/índices, itens e patamares de sinergias coincidem com os endpoints. Isso resolve a escolha de uma revisão declaradamente compatível para o ambiente local; a igualdade com o SHA do deploy não é demonstrada porque o servidor não o expõe. Ver [15](15-AMBIENTE-E-IMPORTACAO.md). A conclusão inicial abaixo descreve o estágio anterior da pesquisa.

- O [servidor publicado](https://pokemon-auto-chess.com/status) informou `6.11.1`.
- O [resumo de Stadium](https://pokemon-auto-chess.com/changelog/summary/summary-6.11.md) informa 16/08/2026 para o patch principal 6.11. Não atribuir automaticamente essa data ao midpatch 6.11.1.
- As [notas 6.11](https://pokemon-auto-chess.com/changelog/patch-6.11.md) e [6.11.1](https://pokemon-auto-chess.com/changelog/patch-6.11.1.md) estão disponíveis no site publicado.
- O `master` já contém arquivo de 6.12 e alterações associadas, mas a lista de patches consultada termina em 6.11 + 6.11.1. O arquivo de 6.12 no site publicado retornou 404 no teste.
- `package.json` no master informou 6.11; isso não identifica sozinho o subpatch publicado.

Conclusão: consultar e fixar uma revisão compatível com a release. Não importar o master indiscriminadamente nem presumir que a tag 6.11 contém todas as correções de 6.11.1. O commit exato correspondente ao servidor continua pendente.

## Correção da pesquisa inicial

O CSV com 1.179 entradas é um snapshot do master, não uma prova de catálogo integral da versão publicada. Totodile aparece com `BITE` nesse CSV; a troca de `CRUNCH` para `BITE` está nas notas de 6.12. Bombirdier também aparece nos dados de desenvolvimento e nas notas de 6.12. Não expor conteúdo futuro como vigente.

## Conteúdo do patch fornecido pelo proprietário

O texto corresponde ao resumo, às notas completas de 6.11 e às correções de 6.11.1. Ele deve orientar a seção de mudanças e a revisão dos guias. Não substitui o cadastro completo: patch notes são alterações sobre um estado anterior.

Exemplos confirmados nas fontes consultadas:

- Double Up e evento Poképals; manter modo de jogo identificado e não misturar seus resultados com partidas regulares sem evidência.
- Novos Pokémon: Passimian, quatro Oricorio, Galarian Meowth, Perrserker e Pikachu Libre.
- Star Piece aumenta uma estrela e exige suportar diferentes patamares de habilidade; não fixar toda habilidade em três valores.
- Gyarados usa Dragon Rage; ajustes de Defesa 6 / Defesa Especial 5. A redução de AP citada nas notas se refere ao encontro PvE de estágio 9.
- Porygon: defesas 8/12/12; Phanpy/Donphan: ataque 6/14 e vida 80/200; Rufflet/Taillow: 80 PP; Chimecho: 75 PP.
- Reworks de Bug 8, Zoroark, Falinks, itens Fairy, Razor Fang e outras mecânicas exigem revisão das recomendações.
- Recorder e replays são recursos do jogo. Acesso do Helper a replays não foi demonstrado.

## Texto riscado e valores antigos

O texto colado perdeu o tachado de algumas substituições. Preservar o Markdown original ou estruturar explicitamente `antes` e `depois`:

| Mudança | Regra resultante descrita nas notas |
| --- | --- |
| Monster 8 | Limite passa de 10% da vida máxima para 10 PV |
| Razor Fang | Todos os ataques aplicam redução de armadura, não apenas críticos |
| Grass 9 | Ganho de 50 AP ao consumir berry |
| Nullify Bandanna | Conversão de AP em Ataque, na proporção 5:1 |
| Falinks | Remover o texto antigo de bônus fixos ao apresentar a nova regra |

## Política do produto

Cada catálogo, guia e recomendação informa versão e revisão. Um relatório informa geração, janela e versão quando conhecida. Se a versão das partidas não vier na origem, registrar `versão não informada pela fonte`; não inferir somente da data. Após um patch, marcar guias afetados como pendentes de revisão. Dados de desenvolvimento ficam fora do catálogo vigente; eventual consulta histórica deve ter indicação explícita.
