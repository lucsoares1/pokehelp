# PokeChess Helper — aplicação local

Interface adaptada para Pokémon Auto Chess mantendo a paleta, tipografia, grades, cabeçalhos, aside e animações da base visual aprovada. O código TFT anterior está em [reference/](../reference/README.md), fora da aplicação ativa.

## Rodar

Na raiz: `npm ci --ignore-scripts`, `npm run data:import` e `npm run dev`. Abrir `http://127.0.0.1:4173/`. Node.js 24+. O servidor escuta somente loopback. O processo de prévia pode ser encerrado pelo ambiente; executar o comando novamente o reabre.

## Navegação disponível

- Início: boas-vindas, prévia interativa de três Pokémon, caminhos para aprender, oito perfis com orientação editorial e cinco comps do relatório. Troca da prévia por botão/teclado; movimento reduzido respeitado.
- Pokémon: catálogo pesquisável, paginação, filtros por alcance, sinergia, função e categoria de entidade.
- Fichas: habilidade, passiva, atributos, alcance base, função/posição quando revisadas, família e itens populares.
- Itens: categorias, ordenação por uso ou colocação média, efeitos, atributos, receitas e navegação inversa por componentes.
- Sinergias: descrição, patamares e integrantes.
- Composições: 130 grupos importados, membros/frequências, itens e exemplos de equipes, com abertura animada.
- Salvas: persistência local; links de comps incluem snapshot para não confundir clusters de relatórios diferentes.
- Fontes: versão, proveniência, coleta, geração, créditos, limitações e relatório de qualidade.

Busca global pelo cabeçalho; fichas abrem como diálogo acessível e possuem links diretos por hash. Faixas de Elo se aplicam a Pokémon/itens. A fonte não declara faixa, modo ou versão das partidas das comps. Posições são sugestões identificadas do Helper, baseadas em alcance com itens e resistência base, em campo 8 × 3. Não são posições observadas nas partidas.

Cada composição exibe uma equipe por vez. “Ver variações” permite trocar o campo, as sinergias e os itens no mesmo painel. Clicar em uma peça mostra habilidade, papel editorial disponível e receitas dos itens usados. Links `#comp/GRUPO@SNAPSHOT~INDICE` preservam a variação. Detalhes em [planejamento/16](../planejamento/16-COMPOSICOES-E-VARIACOES.md).

Lista e salvas permitem filtrar por sinergia principal/ativa e Pokémon na equipe/em destaque, além de ordenar por média, vitória ou ocorrências. Filtros combinados selecionam equipes reais compatíveis e limitam suas variações. “Em destaque” significa a peça mais equipada do exemplo, sem afirmar que seja o carry. Cabeçalhos usam colunas fixas para manter retratos e nomes alinhados. Logo fornecida em `../assets/logo.png`, com cópia pública em `assets/brand/logo.png`.

O guia “Seu caminho até esta equipe” abre junto do detalhe, abaixo da formação final, sem ocultá-la. Retratos hexagonais, molduras por raridade e estrelas compartilham o estilo da comp. Inclui níveis 2–9, foco de cópias, formas iniciais e provisórias, evoluções, obtenções especiais, chances e XP. Marcar “Já tenho” ajusta o exemplo; estado por variação em memória até recarregar. O guia lê `catalog/progression.json` sob demanda. Estratégias são sugestões, sem histórico de compras por jogador; regras especiais exigem adaptação. Ver [planejamento/17](../planejamento/17-GUIA-DE-NIVEIS.md).

## Código

`main.mjs` coordena a interface; `lib/data-client.mjs` lê snapshots; `lib/views.mjs` renderiza fichas/catálogos; `lib/composition-model.mjs` calcula sinergias e sugestões; `lib/composition-view.mjs` renderiza comps; `lib/view-primitives.mjs` compartilha retratos/itens; `lib/shell.mjs` controla menu e preferências; `lib/content.mjs` concentra texto e formatação. CSS existente preserva a referência, com o detalhe em `composition-teams.css`. O servidor não precisa de dependências externas.

`lib/home-view.mjs` apresenta a prévia e caminhos da home; `home.css` isola seu layout e movimento. O link de entidades é compartilhado e importado explicitamente nas views; a suíte renderiza todos os cards para evitar regressão de referências ausentes.

Dados gerados em `data/releases/`; recursos do jogo em `assets/pac/<revisão>/`. `data/current.json` seleciona o snapshot ativo. O manifesto de cada snapshot contém hashes, fontes e qualidade. `assets-manifest.json` na raiz de `site/` é o manifesto histórico dos recursos da interface de referência, separado do manifesto do jogo.

## Importar e verificar

Na raiz: `npm run data:import`, `npm run data:validate`, `npm run check` e `npm test`. O importador usa TypeScript 5.9.3 para interpretar declarações estáticas, sem executar código remoto. Instruções completas em [planejamento/15](../planejamento/15-AMBIENTE-E-IMPORTACAO.md).

## Conteúdo e créditos

Dados reais das fontes públicas; revisão declarada 6.11.1. O commit do deploy do servidor não é exposto. A curadoria inicial de funções cobre oito perfis; traduções e orientações restantes continuam em revisão. Os oito retratos de variantes Floette/Flabébé seguem o mapa oficial de imagens compartilhadas; o snapshot atual tem zero imagens ausentes.

Pokémon Auto Chess é um projeto de fã; Pokémon e imagens conservam direitos dos respectivos titulares. Licença e créditos disponíveis são preservados no snapshot. Referência de layout: Mobalytics. Implementação local; condições de distribuição/publicação ainda precisam de revisão própria.

## Apresentação atual (D020)

Home/Pokédex usam tema claro, vermelho e Nunito local, banner em degradê e cards com ilustrações transparentes. `theme.css` contém tipografia/tema/cards; `home.css`, layout e movimento. `lib/presentation.mjs` mapeia oito identidades exatas e mantém o retrato do jogo para demais formas. Falha na ilustração volta ao retrato original. Composições preservam seus retratos táticos.

`npm run assets:presentation` recupera oito PNGs do PokeAPI/sprites fixado, duas fontes e licença. Manifesto separado em `assets/presentation/manifest.json`, com fontes, créditos, hashes e tamanho; 1,16 MB em disco no total, imagens sob demanda. Nenhuma alteração no snapshot do jogo. Nunito: SIL OFL 1.1, em `assets/fonts/Nunito-OFL.txt`. A página Fontes oferece esses créditos.

## Tema claro/escuro (D021)

Escuro por padrão, alternância na toolbar e no cabeçalho mobile. theme.js carrega no head antes do CSS para aplicar pokechess-theme-v1 sem flash de tema incorreto; funciona sem localStorage e acompanha mudanças entre abas. data-theme na raiz seleciona a paleta global em theme.css. Cores neutras dos demais estilos usam os mesmos tokens; menus, fichas e comps não forçam tema pela rota. Os controles são switches acessíveis por teclado. Testes em tests/theme.test.mjs.

## Vídeo local do banner (D022)

Fonte original: ../assets/videobanner.mp4, preservada. Versão web em assets/presentation/banner.mp4: H.264 1280 × 720, 24 fps, 47 s, sem faixa de áudio, 8,76 MB. Manifesto de mídia separado: assets/presentation/banner.json. Sem iframe/API do YouTube. Autoplay/muted/playsinline/loop e botão de pausa, divisão diagonal responsiva.

Para regenerar: definir FFMPEG_PATH com o executável FFmpeg e executar npm run assets:banner. Neste ambiente, alternativa instalada com Python: python -m pip install --target .cache/media-tools imageio-ffmpeg==0.6.0; o script encontra o binário Windows desse pacote. Ferramenta só de desenvolvimento, sem dependência de runtime. Fonte original precisa existir; nunca é sobrescrita. O servidor fornece MP4 por stream, aceita ranges simples e HEAD. Testes em tests/home-video.test.mjs e tests/video-server.test.mjs.

D023: botão de pausa removido por solicitação do proprietário. O vídeo segue mudo em autoplay/loop, suspenso fora de exibição. Reprodução manual só aparece como recuperação quando o navegador bloquear autoplay. Textura própria em assets/presentation/banner-pattern.svg; espaçamento responsivo em home.css desloca o conteúdo do banner para a direita no desktop.

## Campo, guia de níveis e rolagem — D028

Extensão atual 0.3.0: retratos/itens no campo, guia compacto por nível e rolagem interna. O guia usa lib/overlay-guide.mjs e o mesmo planLevel do detalhamento; pacote inclui catálogo compacto/regras uma vez. Marcas e nível escolhido recalculam a orientação. Painel não cresce conforme os detalhes abrem: cabeçalho/equipe fixos e corpo rolável; iframe limitado ao viewport/640 px. Reconstruir/recarregar extensão e abas ao atualizar. Testes 60/60 e verificação do pacote em fixture iframe local; ver planejamento/22 para evidências/limites.

## Overlay no Helper e no jogo (D027)

Fluxo vigente: o amarelo abre a variação no painel do Helper imediatamente e envia a referência à extensão. Botão Overlay reabre no Helper, que funciona mesmo sem extensão. Restaura estado salvo; ao conectar, acompanha a seleção da extensão ou publica a local se a extensão estiver vazia. Marcas manuais sincronizam pela referência exata; fechar/recolher são independentes. Não há PiP global.

Extensão 0.2.0: atalho PokeChess no lobby e nas demais páginas do domínio exato do jogo, mesmo antes de escolher equipe ou após fechar. Verificar conexão mostra ausência da aba, script sem resposta ou painel carregado. Host permission apenas desse domínio permite consultar suas abas, sem tabs ampla ou histórico. Se já usa extension/dist, clique Recarregar na extensão e recarregue Helper/jogo fora de partida; se usa ZIP extraído em outra pasta, substitua pelos arquivos novos. [Atualização e instalação](../extension/README.md).

Verificação local: 58 testes, importação/persistência/controles/variações/mobile no Helper. A ferramenta bloqueou inspeção do Brave por não determinar URL; execução real no jogo continua pendente, embora humano confirme extensão instalada.

## Histórico — somente jogo (D026, substituído)

Fluxo ativo usa extensão MV3 local, somente em `https://pokemon-auto-chess.com/*`. O botão amarelo envia a equipe escolhida para a extensão; sem conexão mostra instruções, sem confirmar importação. Não há painel flutuante no Helper ou PiP. `overlay.html` redireciona à configuração. [Instalação no Brave/Chrome/Edge](../extension/README.md).

`npm run extension:build` na raiz gera `extension/dist` e `site/downloads/pokechess-overlay.zip`, com 778 equipes/imagens locais e hashes. Carregar pasta dist sem compactação no navegador, recarregar Helper e jogo fora de partida, importar. Ponte configurada para raiz/index.html de localhost/127.0.0.1 porta 4173, mesmo perfil; origem publicada futura exige revisão. Pacote usa snapshot fixado: mudança de snapshot exige reconstruir/recarregar. Execução real aguarda ativação manual; testes locais 56/56 não substituem validação no jogo. Nenhuma leitura de loja ou compra automática.

## Histórico do overlay local (D025, substituído)

O botão amarelo da composição importa a variação exibida para um painel com Pokémon/itens, componentes contados, sinergias, formação sugerida e lista de obtenção. Salvar fica separado no detalhamento. Clique em uma peça para marcar como pronta; recolha/mova o painel pelo cabeçalho. O botão Overlay na toolbar/mobile reabre a seleção.

Estado normalizado em `pokechess-overlay-v1`: referência ao snapshot/variação, vagas prontas e preferências. Outra equipe zera marcas; a mesma preserva. Página `overlay.html` acompanha seleção/marcas entre abas da mesma origem/perfil. Botão ↗ solicita Document PiP quando disponível; alternativa por janela comum/link no rodapé. PiP depende do navegador/aba original; janela comum não garante ficar sempre por cima. Não há extensão/executável, detecção de loja, injeção ou compra automática. Contrato e verificação em [planejamento/18](../planejamento/18-OVERLAY.md); testes em `tests/overlay.test.mjs`.

## Novidades do patch (D024)

Banner após as comps, exclusivo da home, e modal nativo com destaques, novos Pokémon, balanceamento e correções. Imagem do proprietário: ../assets/banner2.jpg, preservada e copiada para assets/presentation/patch-stadium.jpg. Conteúdo em data/patches/latest.json; renderer/controlador em lib/patch-news.mjs, estilos em patch-news.css. Modal fecha por botão/Escape/backdrop e restaura foco.

Para um novo patch, conferir a versão publicada em /status, revisar latest.json com notas oficiais da revisão correta, atualizar versão principal/correção, revisão, data de conferência e fontes, e copiar a arte correspondente. Não altera snapshots do jogo. O rótulo Versão atual depende de coincidir com o catálogo. Não há agendamento ou scraping em runtime; notas e imagens são locais. Testes em tests/patch-news.test.mjs.
