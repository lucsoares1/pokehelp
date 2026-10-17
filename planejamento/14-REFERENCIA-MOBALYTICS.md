# Página de referência — Mobalytics TFT

## Solicitação

Registro histórico da preparação visual. A autorização posterior adaptou a aplicação para Pokémon preservando o visual; o código ativo e os comandos atuais estão em [15](15-AMBIENTE-E-IMPORTACAO.md). Os módulos de conteúdo TFT foram arquivados em `reference/`, fora do site ativo. As contagens e instruções abaixo descrevem a etapa visual anterior.

Em 15/10/2026, o proprietário pediu uma cópia somente da [página inicial de TFT do Mobalytics](https://mobalytics.gg/tft?int_source=homepage&int_medium=mainbutton), incluindo expressamente o aside esquerdo, para construir o PokeChess Helper a partir dela.

Foi criada uma reimplementação visual local e editável em [site/](../site/README.md). O conteúdo ainda é TFT, conforme a referência; os catálogos, estatísticas e guias reais de Pokémon não foram integrados nesta entrega.

## O que está incluído

- Barra de jogos, toolbar de TFT, seletor de set e menu de opções.
- Aside esquerdo: Home, Summoner, Team Comps, Database, Stats, Team Builder e Guides.
- Expansão por hover/foco, opção de fixar e menu adaptado ao celular.
- Hero, banner do companion, oito cards de campeões e cinco linhas de composições.
- Ícones e equipamentos observados nos cards; rodapé com grupos de links e atribuição local.
- Busca local por campeões, itens/traits associados e composições; estados vazios.
- Painel completo das cinco comps: resumo, sinergias, augments, prioridade de itens, campeão principal, formação e guia de níveis.
- Ícones SVG originais dos controles, estrelas dos campeões, bordas por raridade e salvamento no navegador, sem importação para o jogo.
- Abertura/fechamento animados, com suporte a teclado e redução de movimento; compartilhamento por cópia de link.
- Espaços publicitários estáticos que podem ser ocultados localmente.

Home, Database e Team Comps no aside levam a seções da própria página. Destinos que precisariam de outras páginas abrem o Mobalytics em nova aba; não foram copiados. O campo mantém o visual do original, mas sua busca é somente local. Não há login ou consulta de contas de jogadores.

## Arquitetura e recursos

Uma página HTML, CSS e módulos JavaScript nativos, sem instalação de dependências. `data.js` separa conteúdo da estrutura; `styles.css` reúne o tema; `app.js` implementa as interações gerais. `composition-details.js`, `composition-view.js` e `compositions.css` concentram os painéis de composições. O servidor estático usa somente bibliotecas nativas do Node e escuta `127.0.0.1`.

Foram reunidos 217 arquivos de imagem/ícones/fontes, totalizando 4.175.530 bytes na verificação. A obtenção ficou limitada aos recursos da página/menu, cards e painéis expandidos. `assets-manifest.json` registra URL, caminho, tamanho e SHA-256. O preparador preserva o manifesto existente ao acrescentar recursos. Nenhum script do original, iframe publicitário ou serviço de backend foi incorporado.

Os títulos usam Oswald e a interface usa Roboto, conforme observado no site. Paleta e proporções foram documentadas em [DESIGN.md](../DESIGN.md). Atribuição e limites de publicação constam em [site/README.md](../site/README.md).

## Executar e verificar

Na raiz: `node site/server.mjs`. Abrir `http://127.0.0.1:4173/` ou `/tft`. Para encerrar, usar Ctrl+C no terminal do servidor. O processo de preview iniciado pelo agente pode ser encerrado pelo ambiente; o comando permite reabri-lo.

Sintaxe: executar `npm.cmd run check` dentro de `site/`. Não há etapa de build ou dependências a instalar. A validação visual desta entrega incluiu 1440×1000, 768×1024 e 390×844, sem overflow horizontal observado.

Na correção solicitada por imagens, os detalhes completos foram comparados ao original em 1440×1100. Dark Ritual mede 726 px de altura no painel local e 725 px no original nessa comparação. As cinco comps abrem sete seções, nove augments e 28 casas de formação; os guias têm seis ou sete passos conforme a comp. Também foram conferidos fechamento por teclado, layout em 768×1024 e 390×844, salvamento após reload e cópia do link. Os 217 assets responderam HTTP 200 e seus hashes conferiram. Essas verificações não afirmam equivalência pixel a pixel em todas as larguras.

## Próxima adaptação

Quando solicitado, trocar marca/textos/dados de TFT pelos do PokeChess mantendo os componentes aprovados. Resolver versionamento, direitos dos assets e contratos dos relatórios conforme os documentos 03, 04, 09 e 21. Antes de publicação externa, remover ou substituir o conteúdo de referência e revisar as condições aplicáveis; este trabalho não publicou um clone online.
