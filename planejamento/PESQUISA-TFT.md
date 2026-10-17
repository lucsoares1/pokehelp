# Viabilidade de uma versão para Teamfight Tactics

Pesquisa em 16/10/2026. Documentação e repositórios consultados; nenhum leitor instalado ou validado em uma partida. O site e a extensão atuais não foram modificados por esta pesquisa.

## Conclusão

Há um caminho técnico documentado: aplicativo desktop com Overwolf Game Events Provider. Há eventos para loja, campo, banco e carrossel; este último inclui campeões e itens. A API pública da Riot e o catálogo estático não substituem esse leitor.

Disponibilidade de um dado na API não autoriza qualquer uso no produto. A política publicada pela Riot restringe orientação adaptativa durante a partida. O sistema que decide trocas, compras e escolhas com base no estado atual não deve ser apresentado como aprovado. Guias estáticos e análise após a partida têm um enquadramento diferente. É necessário registrar o produto e resolver o escopo com os fornecedores antes da integração ao vivo.

## Bases encontradas

| Base | Licença do código verificada | Papel / limite |
| --- | --- | --- |
| [overwolf/events-sample-app](https://github.com/overwolf/events-sample-app) | MIT, conforme LICENSE.md | Exemplo oficial TypeScript; ponto inicial recomendado para experimentar os eventos após obter acesso. O runtime/GEP continua sendo uma dependência da plataforma. |
| [ndh0408/tft-advisor](https://github.com/ndh0408/tft-advisor) | MIT | Referência de arquitetura. As afirmações do README sobre conformidade e funcionamento não foram tomadas como aprovação da Riot ou validação nossa. |
| [jfd02/TFT-OCR-BOT](https://github.com/jfd02/TFT-OCR-BOT) | GPL-3.0 | Referência para OCR e regiões de tela. Inclui automação; não adotar o bot como aplicação. Arquivado em abril de 2026; último push de código registrado em abril de 2024. README exige inglês e 1920 × 1080 sem bordas. |
| [CommunityDragon/CDTB](https://github.com/CommunityDragon/CDTB) | LGPL-3.0 | Ferramentas para extrair dados estáticos. Código e direitos dos recursos do jogo são assuntos distintos. Não é leitor de uma partida. |
| [Pupix/lcu-connector](https://github.com/Pupix/lcu-connector) | MIT | Conexão com o cliente local. Não comprova acesso a loja/tabuleiro/carrossel do TFT. A Riot não oferece suporte oficial à LCU para terceiros. |

O exemplo oficial novo é `events-sample-app`, no singular. O repositório antigo `events-sample-apps`, no plural, também existe; não confundir os dois.

## Limites que precisam de um teste real

- Os exemplos de carrossel consultados não documentam coordenadas de tela. Identificar uma oferta e desenhar uma badge exatamente sobre uma unidade que gira são tarefas diferentes.
- A leitura deve ser validada no patch, modo, idioma, resolução e escala de interface usados pelo jogador.
- Falta de um evento precisa aparecer como estado desconhecido; não significa loja/banco vazio.
- Conferir a saúde das features a cada atualização. Não tratar a presença de uma feature na documentação como garantia de disponibilidade em toda partida.
- O caminho OCR exige calibração e atualização de modelos/referências. Ler pixels também não dispensa as regras do jogo.
- A documentação do Overwolf contém uma advertência específica sobre dados de aprimoramentos; não incluir essa integração sem esclarecer o uso permitido.

## Proposta para este projeto

Reutilizar a identidade visual, navegação, fichas, receitas, favoritos e apresentação dos guias. Criar um catálogo e regras próprios do TFT; os cálculos de famílias/evoluções do Pokémon Auto Chess não são transferíveis diretamente.

Separar três contratos: dados estáticos por patch, estado observado e apresentação. O adaptador do TFT pode produzir snapshots para a mesma família de componentes visuais, mantendo a origem e a validade de cada leitura. Usar fixtures/replays de eventos para desenvolver a interface antes da conexão real. Isso é uma proposta de arquitetura, não uma funcionalidade implementada.

Para a via Overwolf, solicitar aprovação do produto público e whitelisting primeiro. A documentação atual informa que projetos privados e pontes sem interface pública não são aprovados. Nenhuma proposta foi enviada nesta pesquisa.

O primeiro experimento, depois de resolver o acesso e o escopo permitido, deve registrar os eventos e comparar os dados com uma partida. Só então decidir quais destaques conseguimos posicionar com precisão. Não começar prometendo recomendações adaptativas aprovadas ou cobertura completa do carrossel.

## Fontes primárias

- [Política de TFT da Riot](https://developer.riotgames.com/docs/tft)
- [Game Events de TFT — Overwolf](https://dev.overwolf.com/ow-native/live-game-data-gep/supported-games/teamfight-tactics/)
- [GEP no Electron](https://dev.overwolf.com/ow-electron/reference/Overwolf-electron-APIs/gep/Overview/)
- [Aprovação e classificação de apps Overwolf](https://dev.overwolf.com/ow-electron/getting-started/project-roadmap/)
- [Licença do exemplo oficial](https://github.com/overwolf/events-sample-app/blob/main/LICENSE.md)
- [Dados e recursos do CommunityDragon](https://github.com/CommunityDragon/Docs/blob/master/assets.md)
- [LCU e Game Client API — Riot](https://developer.riotgames.com/docs/lol#league-client-api)

Metadados e licenças verificados também pela API pública do GitHub; cópias da pesquisa em `.cache/research/tft-feasibility/`.
