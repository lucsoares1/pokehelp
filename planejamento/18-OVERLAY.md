# Overlay — importação de composição

## D044 — Portadores agora e destino definitivo (0.11.0)

Fonte preferida é formação própria nativa, com instância/posição/estrelas/itens e separação do banco. Sugestões por atributos/alcance/perfil da habilidade respeitam três slots/duplicatas/impedimentos. Etiquetas e painel mostram portador agora, final depois e motivo. Item completo em trânsito é abatido uma vez, sem nova compra. Transferência aparece só como orientação, nunca ação ou confirmação; vender provisório apenas após reposição, removíveis pelo banco. Outra família final fica protegida de venda.

Fallback é o mesmo guia do nível selecionado, explicitamente condicional; campo vazio/só banco é autoritativo. Reserva lida continua guiando somente equipamentos disponíveis/completos, sem inventar posse do campo. Montar na reserva antes de equipar; componentes não ganham recomendação de uso direto. Novo holder-model compartilhado pelo controlador/painel, sem nova permissão, estado privado de sala ou backend de partida. Ver D044/22 para fonte, 117 testes/QA simulado e pendência de validação real no Brave.

## D043 — Prioridade única e portais (0.10.0)

Itens: uma oferta Prioridade com logo dourada; demais úteis recebem Alternativa discreta sem insígnia. Sem reserva, Da build. Mesmo critério na escolha HTML, incluindo duplicatas. Resolve a ambiguidade dos vários Pegar; não significa que todos os componentes eram irrelevantes.

Portais: reconhecer símbolos/sprite públicos do minigame próprio e etapa no DOM visível. Uma sugestão considera tipos nativos dos alvos pendentes da obtenção: iniciais (0), Únicos (10), Lendários (20). Usa forma base obtida antes da evolução; itens que dão tipo não entram. Sem etapa/alvo, afinidade geral explicitada. Badge/tooltip e painel mostram tipos/nomes favorecidos, sem prometer oferta/chance. Prontos retiram alvo; entrada do próprio avatar encerra marca; símbolo retirado por outro invalida portal. Região/regras alteram ofertas; não há simulação disso. Sem leitura de room.state, backend novo, credenciais, automação ou permissão extra. Menus D042 preservados. 107 testes e QA simulado em 22; confirmação real no Brave pendente.

## D042 — Receitas e menus nativos (0.9.0)

Carrossel livre público independe da reserva, mas exige minigame do próprio uid e jogador não espectador. Sem reserva validada, somente referência Da build; nunca assumir inventário vazio. Reserva/equipados continuam restritos ao próprio jogador. GameDialog é entrada adicional da referência Phaser nativa. Escolha de itens prioriza progresso de receita comprovado e diferencia alternativas, sem decisão automática.

Etiqueta na reserva mostra destinatário. Ao apontar, tooltip explica combinação/resultado/destino e o painel repete o detalhe; não captura clique/arrasto. Menus visíveis ocultam painel e marcadores do campo temporariamente, preservando a seleção e posição. Recomendações dos cartões de item permanecem. Botão Mostrar/Esconder protegido de colisão, inclusive quando o conteúdo do menu estiver escondido. Isto substitui rótulos e acoplamento anteriores de D039. Ver D042/22 para fontes, 100 testes e QA local; Brave real pendente.

## D041 — Recuperação dos destaques (0.8.1)

Plano reapresentado após montagem/remontagem e atualização estrutural/estilo da loja, com 250 ms para o assinante do jogo estar pronto. Relay MAIN da notificação nativa complementa o evento isolado. Não confundir preferência gravada com destaque observado. Botão Reverificar loja repete a notificação somente com integração ativa e validando propriedade/conflitos; não sobrescreve edição nativa. Versão visível ao lado do botão. Regressão Goomy/comp 6 nível 2 e limites de validação real em 22/D041.

## D039 — Itens para a build (0.8.0)

Controle compartilhado Destacar Pokémon e itens. Itens livres do carrossel indicam Pegar; reserva indica Guardar (componente parcial), Montar (receita completa) ou Equipar (equipamento pronto). Contorno dourado/insígnia própria sem capturar ponteiro. Escolhas de itens HTML mostram a receita e destinatário. Painel recolhível Receitas e destinos explica componentes faltantes e equipamentos já resolvidos.

Abra os detalhes nativos de um item ou Pokémon para estabelecer a referência ao Phaser. Reader somente local, sem captura/OCR/rede: própria reserva, itens equipados da própria equipe e sprites visíveis/livres do carrossel. Ao olhar outro campo/espectar, pausa/limpa. IDs inesperados/contrato incompatível também limpam. Sem referência, reserva é desconhecida, nunca considerada vazia. Não detecta nível real nem compra/monta/equipa sozinho. Recursos e dados ficam na extensão, sem backend novo. Critérios/limites completos em D039 e validação em 22.

## D038 — Destaques dos provisórios atuais

Vigente na extensão 0.7.0: finais não marcados prontos + temporários da lineup do nível selecionado. Não acumular provisórios anteriores. Atualiza a cada nível/marca/variação e informa nível no painel. Nível real não é lido; usuário escolhe no guia. Lista de compras nativa pode ter mais peças que o campo atual; guia continua referência de formação. Badge e contorno amarelo 3 px compartilham planned/flag e somem juntos. Contexto de cálculo compartilhado com createOverlayGuide, sem nova fonte estratégica. Backup/conflitos/restauração preservados.

D037: tamanho vigente 36 × 41 px (30 × 34 px em viewport estreita), mesma logo/relevo/canto esquerdo. Extensão 0.6.5.

D036: tamanho vigente 46 × 52 px (38 × 43 px em viewport estreita), cerca de 20% menor. Mantém canto esquerdo, logo/relevo e mecânica de D035. Extensão 0.6.4.

D035: posição vigente da insígnia é canto superior esquerdo, encaixada na borda do retrato (top -18/left -14 px no desktop). Preserva a coluna de sinergias à direita. Extensão 0.6.3; folga do painel 32/24 px, sem mudança mecânica.

D034: insígnia vigente usa logo original em hexágono dourado com relevo 3D, 58 × 66 px (48 × 54 px em viewport estreita). Substitui carrinho de D033. Extensão 0.6.2; painel com folga para as insígnias, mecanismo de D032 mantido.

D033: apresentação vigente é apenas o medalhão de compra com carrinho, sem DA SUA COMP/COMP nem moldura adicional. Extensão 0.6.1. Mecanismo/controles/limites de D032 mantidos.

## D032 — Conexão nativa com os destaques da loja

Pedido de 16/10/2026 autoriza assistência de compras pela comp selecionada, sem captura de tela. Extensão 0.6.0 usa team_planner no armazenamento local da origem do jogo. O jogo compara a oferta real com a família do alvo e fornece a classe planned, inclusive quando o retrato exibe uma evolução futura. O Helper apenas estiliza esses cartões na loja e observa sua contagem; não identifica Pokémon por retrato, nem acessa Redux/objetos ocultos/reconexão/WebSockets.

Controle no painel do jogo: Destacar minha comp na loja. Importação explícita ativa; estado anterior sem campo shopEnabled começa desligado. Variações e marcas prontas atualizam os alvos da equipe final. Provisórios de níveis não são pedidos de compra. Todas as vagas prontas geram plano vazio. Não há reconhecimento automático de inventário/cópias nem compra automática.

Backup durável antes de escrever: somente team_planner e pokechess-native-planner-v1. Restauração exata ao desligar/fechar; conflitos com edição nativa suspendem sem apagar a edição. Desligar/ligar cria um novo backup da edição mais recente. Recolher mantém ativo. Reload/múltiplas abas compartilham origem e estado, preservando o primeiro backup. Desativar/remover a extensão não executa callbacks: desligar antes; reativar permite recuperar o backup.

Badges douradas DA SUA COMP acima dos cartões, sem cobrir custo/sinergias e sem capturar ponteiro; versão compacta COMP em viewport estreita. Ícone giratório nativo ocultado somente durante a personalização ativa. Sem animação contínua nova. Painel sem posição personalizada fica acima da loja; corpo mantém rolagem/altura limitada. Diagnóstico diferencia preferência escrita de marcações observadas; zero marcações não comprova compatibilidade com uma versão futura.

Não é necessário um backend com acesso ao navegador. Toda a assistência fica na extensão; nenhuma credencial é consultada e nenhuma lista de ofertas ou inventário é enviada ao Helper/servidor. Diagnóstico de conexão agrega somente estado/contagens. Fonte/justificativa em D032; verificação e limites em 22.

## Atualização vigente — D031, extensão 0.5.0

Evoluções têm apresentação própria; trocas com faixas vermelha/verde, nomes e retratos compactos. Controles e indicadores usam SVGs Lucide locais, com rótulos acessíveis. Máscaras CSS seguem o tema. Build inclui módulo ui-icons, oito SVGs, fontes/hashes e licença.

Únicos/lendários/ovos/especiais não entram automaticamente nas bases pelo nível. Marque a forma pronta na equipe superior quando a obtiver; modelo inclui a peça e recalcula o campo. Latios/Latias podem ser recebidos como dupla Único no portal da etapa 10, independentemente do nível atual. O objetivo final continua completo e condicional. Não há leitura de etapa/inventário nem novas permissões. Instruções e método em 17/D031.

## Atualização vigente — D030, extensão 0.4.1

Guia preenche as vagas dos níveis de montagem 2–8, preserva mais o campo anterior e exibe cada substituição com retratos Sai → Entra. Troca de provisório por provisório incluída; adição em vaga nova não gera aviso. Modelo e renderer compartilhados com a ficha. Mantidas as condições de aquisição, meta final, estado, altura/rolagem e permissões. Pacote recompilado em dist/ZIP. Atualizar a pasta instalada e recarregar para aplicar.

## Situação vigente — D029, extensão 0.4.0

Guia agora converge à equipe final da variação e compartilha o planejador com a ficha completa. Mostra meta de campo, sinergias por nível/próximo patamar, trocas, condições e famílias a guardar em reserva. Metas não contam como posse. Regras completas em 17 e D029. Preservados altura/scroll, equipamentos no campo, referência exata, marcas e origens restritas de D027/D028.

Pacote inclui catálogo compacto com passivas, sinergias, nomes de itens, teamRules e progression; imagens de todos os tipos também são auditadas, incluindo Bebê quando aparece apenas numa base intermediária. Versão 0.4.0 em dist/ZIP; recarregar na pasta instalada ou substituir a cópia extraída antes. Verificação real no Brave/jogo continua pendente, sem confundir fixture com execução da extensão instalada.

## Situação vigente — D028

Campo com retratos que ocupam as casas e itens diretamente sob cada peça; faixa superior continua disponível. Corpo do painel tem rolagem interna, cabeçalho/equipe permanecem no lugar. Extensão 0.3.0 limita o quadro a 640 px/viewport e ignora mensagens antigas de tamanho; expansão de conteúdo não aumenta a janela. Recolhida: 150 px; atalho: 46 px. Sem janela global.

Guia compacto com níveis 2–9, orientação de compras/XP/reroll, cópias, chances e campo inicial/provisórios. Usa `lib/overlay-guide.mjs` sobre `planLevel` já existente, sem duplicar regras. Custo de XP é identificado como partindo de zero e orienta descontar XP atual/passivo. Sugestões continuam distintas de trajetórias observadas. Marcas de peças prontas alteram base e orientação; nível escolhido persiste em guideLevel com fallback 2 e sincronização guardada pela seleção.

O pacote contém `guide.pokemons` compacto e `guide.rules` compartilhados, uma única vez, para montar a orientação no runtime, com imagens de provisórios incluídas. Renderer recebe guia calculado e associa equipamentos por vaga; nenhuma estatística do jogo é modificada. Build 0.3.0: 778 equipes/1.352 imagens/4,54 MB. Testes e validação de rolagem em iframe local documentados em 22; execução real da atualização no jogo ainda pendente. Recarregar extensão/abas para aplicar.

## Situação vigente — D027, substitui somente-jogo de D026

Overlay aparece no Helper pela própria aplicação e no domínio do jogo pela extensão 0.2.0, incluindo lobby/salas. No Helper funciona sem extensão, restaura seleção em pokechess-overlay-v1 e oferece equipe/campo/marcas/movimento/recolhimento. Amarelo abre localmente e publica a mesma referência à extensão; botão Overlay reabre localmente. Não usa janela global/PiP.

Inicialização lê a seleção da extensão quando disponível; caso esteja vazia, envia a seleção local. Eventos da ponte acompanham seleção/marcas; alterações do Helper exigem referência igual à da extensão para não marcar outra comp por acidente. Fechar/minimizar o Helper é independente do jogo. Uma extensão antiga ainda permite importação, mas a UI solicita atualizar para obter diagnóstico/sincronização novos.

No jogo, atalho compacto aparece sem equipe e após fechar. Ele abre o Helper para escolher comp ou reabre a equipe existente. Falha de carga do iframe oferece tentativa manual. Diagnóstico consulta somente abas HTTPS do domínio exato; host_permissions contém apenas esse domínio, sem tabs ampla. Abas sem script respondendo solicitam recarga; resposta do script não é confundida com iframe pronto. Nenhum elemento da loja/variável interna é lido.

Build atualizado: extension/dist e ZIP no site, versão 0.2.0, mesma fonte/snapshot. Humano confirmou instalação anterior; recarga da extensão e validação real dessa versão ainda necessárias. Controle do Brave foi interrompido por não confirmar URL, mesmo com barra de endereço visível informada. Evidências locais: 58 testes/52 arquivos, importação/persistência/variações/controles e mobile no IAB; ver 22. Instruções de atualização em extension/README.md.

## Situação vigente — D026

O proprietário pediu que o overlay apareça exclusivamente no site do jogo e desapareça ao trocar de aba. O painel local/PiP descrito na entrega histórica abaixo foi substituído no fluxo ativo por uma extensão Manifest V3. `site/overlay.html` agora redireciona para a configuração; controlador PiP removido. Renderer, plano e estilos continuam compartilhados.

Fontes em `extension/`; gerar com `npm run extension:build`. Pasta pronta `extension/dist`, ZIP local `site/downloads/pokechess-overlay.zip` (4,09 MB). Pacote contém 778 planos e 1.125 imagens referenciadas, Nunito/CSS e manifesto de hashes. O snapshot permanece `6.11.1-1522996091db4308`; atualizar fontes requer reconstruir/recarregar a extensão. Nenhuma dependência adicional, vídeo ou credencial entra no ZIP.

`game.js` monta apenas seu próprio host/iframe na origem HTTPS exata do jogo, documento principal. Faz parte da aba: outras páginas não recebem o painel. Todas as abas do jogo no mesmo perfil compartilham a seleção; não é uma janela global. O iframe usa código/imagens empacotados, com isolamento de CSS, sem acessar objetos internos/loja. Pode recolher, mover, marcar peças, trocar variação, fechar e reabrir pelo ícone da extensão. Fullscreen usa o evento padrão para recolocar o host. Não há leitura da loja, compras ou automação da partida.

A ponte do Helper roda apenas na raiz/index.html de `127.0.0.1:4173`/`localhost:4173`, sem painel. Envia somente snapshot/comp/índice e tema. Background valida remetente/quadros/mensagens e existência da equipe no pacote, serializa escritas e só confirma importação após persistência. Dados de seleção/marcas/preferências ficam em chrome.storage.local. Permissão de API somente storage; sem all_urls/cookies/history/scripting/código remoto. O site do jogo recebe somente seus recursos públicos pelo manifesto. Futuro domínio publicado do Helper precisará de revisão explícita das origens.

Sem extensão, o Helper mostra configuração/download/instruções e não finge que importou. Sem equipe importada, a extensão não cobre o jogo com painel vazio. Depois de importar, o painel não depende de manter o servidor do Helper aberto. [Instalação completa](../extension/README.md).

Verificação local: `npm run extension:build`; `npm run check` aprovou 51 arquivos; `npm test` passou 56/56. Sete testes novos cobrem origens/quadros exatos, rejeição de referência desconhecida, confirmações/persistência, duplicatas, ações/posição, ausência de acesso amplo, ponte sem extensão/respostas forjadas, montagem restrita do host, recursos e hashes do ZIP. Testes com DOM/API simulados não substituem execução real da extensão.

Ativação e teste no Brave pendentes. Computer Use listou o Brave com Pokémon Auto Chess; a captura seguinte foi interrompida porque não conseguiu confirmar a URL aberta para aplicar a política. Nenhuma extensão foi instalada, configuração de segurança alterada ou partida recarregada. Não afirmar funcionamento real dentro do jogo antes de carregar a extensão e verificar importação/troca de abas/retorno, console/CSP e movimento/reabertura. O limite de D025 foi substituído pelo pedido humano para exibição na aba do jogo; detecção de loja permanece futura.

## Histórico — primeira entrega D025, substituída por D026

Entrega D025, 15/10/2026. Pedido humano: preparar o botão amarelo para importar a composição em um overlay com a identidade do Helper, antes de integrar o jogo e detectar ofertas da loja.

## Fluxo entregue

O botão amarelo importa a equipe atualmente exibida, incluindo o índice original da variação e o snapshot. O painel abre sobre o Helper; o botão Overlay na navegação permite reabri-lo. Salvar composição é uma ação independente no detalhamento e continua usando a lista de favoritas existente.

Faixa de Pokémon com estrelas e equipamentos, seletor compacto de variações, componentes com quantidades, sinergias ativas e campo sugerido 8 × 3. Clicar em uma peça marca/desmarca sua vaga como pronta; duplicatas continuam independentes. Zerar marcas recomeça a conferência. A lista recolhida explica formas iniciais, total de cópias e obtenções especiais, regionais e adicionais. Componentes representam as receitas desta equipe; a ordem não afirma prioridade ou melhor item.

Cabeçalho permite mover o painel com ponteiro ou setas, recolher mantendo a equipe visível e fechar. Posição é limitada à área útil, incluindo a largura da barra de rolagem. Telas estreitas empilham orientações/campo, com rolagem interna da equipe. Temas seguem a preferência global.

## Arquitetura e persistência

- `site/lib/overlay-model.mjs`: plano independente da interface, schema 1, referência `compId@snapshotId~variantIndex`, equipe, formação, receitas, sinergias e alvos de obtenção. Reutiliza os modelos de composição/progressão existentes.
- `site/lib/overlay-view.mjs`: apresentação escapada, sem ler o jogo ou executar conteúdo de fontes.
- `site/lib/overlay-controller.mjs`: importação, restauração, ações manuais, movimento, janelas e sincronização por storage. Tokens descartam respostas assíncronas antigas. Falhas de referência não escolhem outra equipe silenciosamente.
- `site/overlay.html`/`overlay.mjs`: visualização independente da mesma seleção.
- `site/overlay.css`: estilos locais com os tokens existentes, sem nova dependência.

`pokechess-overlay-v1` guarda somente referência, vagas prontas e preferências de exibição/posição. Dados mecânicos continuam nos snapshots imutáveis. Importar outra seleção zera as marcas; importar a mesma preserva-as. Armazenamento indisponível mantém o painel nesta sessão e informa a limitação. Janela separada requer armazenamento para recuperar a seleção. Não existe conta, upload ou transmissão de dados pessoais.

## Janelas e limites atuais

Quando disponível, o botão de janela solicita Document Picture in Picture mediante clique, copia os estilos e acompanha o tema. Ao fechar a janela, o painel retorna ao Helper; a janela PiP depende da aba original permanecer aberta. Prazo de quatro segundos e alternativa visível evitam deixar a solicitação pendente indefinidamente.

O link Janela separada e a página `overlay.html` permitem consultar a mesma equipe em outra janela/aba, sincronizando seleção e marcas na mesma origem/perfil. Uma janela comum não recebe garantia de ficar sempre sobre outros aplicativos. Pop-ups e PiP dependem do navegador. No ambiente IAB, a solicitação PiP foi aceita e a interface retornou ao site; a permanência sobre o jogo no Windows não foi validada. A página independente e a sincronização foram verificadas em abas reais.

O painel não lê a loja, não marca ofertas automaticamente, não insere código no jogo, não compra peças e não acessa estado privado da partida. A integração futura precisa de um adaptador separado para ofertas observadas, mantendo o plano de composição como contrato e a origem do estado explícita. Extensão/aplicativo nativo, permissões, compatibilidade e regras públicas do jogo ainda precisam de investigação própria. Não foi instalada extensão nem criado executável nesta entrega.

Formação continua sendo sugestão do Helper, sem simulação de habilidade/adversário. Equipes/equipamentos são exemplos reais, sem transformar popularidade em recomendação comprovada. Obtenções especiais como Gyarados não viram indicação de reroll da loja comum.

## Verificação

`npm run check`: 44 arquivos válidos. `npm test`: 49/49, incluindo seis testes do overlay cobrindo as 778 equipes utilizáveis, índices/snapshots, todos os itens/posições, duplicatas, receitas, obtenções especiais, normalização de estado, limites de posição e escape de conteúdo. Uma suposição inicial no teste classificava Gyarados como loja; corrigida conforme a rota especial já importada, preservando oito Magikarp.

Navegador: botão importou a variação 2 de Selvagem com oito peças/equipamentos exatos; troca de variação no painel atualiza equipe/campo/sinergias. Favoritar e desfavoritar funcionam separadamente. Marca de Absol persistiu após recarregar e sincronizou entre duas abas; troca de equipe zerou marcas. Recolher, reabrir, mover 16 px por seta e zerar marcas conferidos. Lista de obtenção diferencia Absol/Arceus das bases da loja e preserva sua expansão ao marcar.

Capturas em escuro/claro, celular 390 × 844, tablet 768 × 1024 e janela 620 × 520; nenhum overflow horizontal do documento após correção dos limites pela área útil. Equipe pode rolar horizontalmente em celular. Nenhum erro/aviso de console observado. Marcações e favorita de teste removidas; snapshot do jogo preservado.
