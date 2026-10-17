# Registro de decisões

## D067 — Layout da home definido antes do primeiro conteúdo

Usuário relatou flash do aside “Dados do jogo / Guia rápido” ao abrir ou recarregar a página. A classe is-home só era aplicada por setVisible depois de loadGameData/report, deixando o primeiro desenho com grid e coluna de 334 px. index.html agora entrega o body com o estado padrão da home e ajusta a classe por hash em um script síncrono antes do conteúdo. CSS, renderização de rotas, navegação e painéis das demais telas preservados; não há ocultação da página inteira, timeout ou requisição adicional.

QA no navegador com main.mjs deliberadamente indisponível: antes, aside=grid e colunas 831px/334px; depois, aside=none e layout=block ainda com “Preparando seu guia…”. Abertura direta em #compositions mantém o grid, enquanto raiz e #home/explore iniciam sem aside. npm run check: 96 arquivos; npm test: 182/182. Sem alteração da extensão ou snapshot mecânico.

## D066 — Build estático reproduzível para Vercel e origem pública do Helper

Usuário conectou o GitHub à Vercel e informou 404 em https://pokehelp-one.vercel.app/. Repositório não tinha build/output configurados e os snapshots/imagens gerados estavam ignorados. vercel.json publica somente dist, gerado por npm run build. Sem servidor Node na produção, rewrite amplo para HTML ou importação de dados ao vivo em cada deploy. Configuração e Node 24 conferidos na documentação oficial da Vercel: https://vercel.com/docs/project-configuration/vercel-json e https://vercel.com/docs/functions/runtimes/node-js/node-js-versions.

Pacote gzip JSON versionado contém o snapshot público ativo 6.11.1-1522996091db4308, arquivos de dados, imagens e licença. Preparação explícita com deploy:snapshot valida o manifesto já revisado; restauração verifica caminhos, duplicatas, tamanho/hash por arquivo e manifesto. Build cria dist isolado e gera o ZIP da extensão com a mesma revisão, sem alterar site/data/current.json local. Cache, fontes brutas, outras releases e servidor local não são publicados. Nenhuma nova dependência.

Extensão 0.18.1 aceita somente o domínio público exato, mantendo origens locais. Origem importada preservada para retorno; padrão de nova instalação passa ao site público. Manifesto/ponte/protocolo e aviso de versão do site ajustados. Testes incluem restauração sem fontes locais, corrupção/caminho indevido e ponte pública/origens falsas. Nenhuma permissão ampla em vercel.app ou alteração em ações do jogo.
## D065 — Avaliação imediata do campo separada do caminho da comp

Pedido humano autoriza manter Entra/Sai do planejamento e acrescentar aviso de melhor opção com base no campo/banco reais. O cálculo anterior misturava força/sinergias com bônus de cobertura da comp/guia, podendo esconder reforços disponíveis fora da meta. board-model agora mantém liveSuggestion e planSuggestion: o primeiro não usa cobertura/afinidade do plano, o segundo mantém famílias e provisórios por nível. Sugestão principal prefere melhora imediata clara; limiar evita pequenas oscilações. Sem novos dados ou permissões, somente formação própria já lida.

Força estimada usa estrelas/atributos/itens e patamares reais com as regras canônicas de família/itens/Dragão/Protean. Contribuição de curto alcance é ponderada por resistência base para não promover uma peça fraca só por ser melee. Guardas de itens/estrelas/capacidade/fase continuam comuns. Cobertura do plano só participa da avaliação planejada e do aviso de desvio temporário, nunca da escolha imediata. Sem previsão de combate nem garantia de vitória. Campo/banco não lidos não viram lineup fictício.

UI identifica “Melhor opção agora” e “Caminho da comp”, motivos e ganhos/perdas. Opções diferentes deixam o guia em disclosure, preservado entre atualizações; mesma troca é apresentada uma vez. Aviso recolhido prioriza a imediata. Extensão 0.18.0, dist/ZIP atualizados; 178/178 testes, sintaxe de 92 arquivos. Oito regressões adicionais incluem independência de comp/guia e paridade empacotada com espécies reais. Validação em partida real pendente; nenhuma ação automática ou alteração de snapshot.

## D064 — Ofertas de componentes respeitam a reserva antes das alocações parciais

Pedido humano: corrigir prioridades de carrossel que acumulam componentes futuros embora uma oferta possa completar receita da comp com a reserva. Causa reproduzida: itemAdvice alocava componentes compartilhados em ordem de plano; rankItemOffers consultava somente os faltantes dessa alocação, ocultando receitas alternativas possíveis. Nova comparação preserva equipamentos cobertos e receitas completas, mas permite redistribuir reservas parciais por oferta mutuamente exclusiva. Componentes já suficientes não geram procura de cópia inútil. Ordem: equipamento pronto pendente, componente que fecha receita, progresso parcial, componente futuro; empate pela ordem do plano.

Ranking mantém identidade do destino e retorna componentes/faltantes específicos da oferta, sem mutar fila/inventário. Carousel, rewardChoices e menus nativos compartilham a lógica; texto “Completa”, tooltip e inspeção do painel usam esses dados. Reserva desconhecida não gera conclusão de montagem. Sem nova leitura, permissão, dependência ou ação automática. Extensão 0.17.1, dist/ZIP reconstruídos, snapshot preservado. Validação: 170/170 testes, sintaxe de 92 arquivos; seis regressões incluem realocação, preservação de receitas completas, cópias, atualização da reserva, inspeção e catálogo real/pacote. Não testado numa partida real nesta etapa.

## D044 — Itens em portadores temporários do campo próprio

Pedido humano autoriza ampliar a leitura nativa da própria formação para recomendar itens em provisórios durante início/meio, com o guia selecionado como fallback. Autoriza nome/instância/posição/estrelas/equipamentos próprios, sob guardas de dono existentes; sem leitura de adversário/estado privado de sala/rede, captura, ações automáticas ou venda/movimento de peças. Preferir campo real, diferenciar banco e não presumir lineup do guia como posse.

Reusar board.player.board já restrito ao próprio jogador para equipamentos; novo payload mínimo por instância, coordenadas de preparação (y=0 é banco; 1–3 campo), estrelas/itens e geometria opcional de sprite próprio fora da batalha. Consultadas fontes fixadas 07367c341fe928763da2b565c2eee010433e4fc1: BoardManager (D039), PokemonSprite blob 8c7b7157fcc9fde723eeed3d875c1bdd395350d5, utils/board.ts e comandos/modelo já importados. Venda devolve itens; só RemovableItems saem automaticamente ao voltar ao banco (salvo regras especiais). Não sugerir venda de uma família da equipe final para transferir equipamento. Itens completos únicos/máximo 3, impedimentos de portar e tipo já nativo respeitados. Componentes ficam na reserva até a receita estar completa para não montar equipamento errado no portador.

Planejar destinatário agora e definitivo separadamente. Equipamento completo em provisório conhecido conta como em trânsito, sem nova compra; conservar seu portador até haver substituto, mostrar transferência manual para a família definitiva quando possível. Propostas concorrem pelos espaços livres por instância, sem reutilizar cópias. Afinidade explicada por atributos/alcance e indicadores estáticos da habilidade; é heurística, não simulação de combate ou melhor estratégia. Fonte principal: campo próprio atualizado; fallback explicitamente condicional pelo mesmo guia do nível. Presença de campo vazio/banco não autoriza inventar provisório do guia como campo real. Extensão 0.11.0; 117 testes e QA simulado aprovados, confirmação real pendente. Ver 22 para versão/testes/limites finais.

## D043 — Prioridade única de itens e orientação de portais

Pedido humano: todos os itens apareciam como Pegar; identificar os portais por tipos e indicar qual buscar pela comp. Autorizada extensão local da assistência para portais/símbolos públicos renderizados e leitura da etapa no texto visível da interface. Não autoriza ler estado de sala/rede, prever oferta exata ou selecionar/mover/comprar automaticamente.

Fonte oficial fixada 07367c341fe928763da2b565c2eee010433e4fc1: mini-game.ts blob 3a10e533faf39123778cbe81ad61eb905619fe21; portal cliente 8d95e53275578616a45b3d1481b036ec4fb17f5a; portal modelo e81057706fe7690948d8305917ad30bc29bc2c16; game-stage-info 6878be0a7df4de30eaee13eb7c148ccbb2195a34. Arquivos em .cache/research/d043; shop/pools/stages já verificados na importação. Etapas 0/10/20 geram iniciais/Únicos/Lendários. Símbolos filtram candidatos por tipo para cada opção, com sorteio, filtros regionais/famílias e exceções; não concedem Pokémon específico nem juntam tipos em uma evolução. Portal também troca a região/mapa; recomendação atual será por tipos/alvos, sem fingir conhecer o resultado regional.

0.9.0 local já separava principal/alternativas; screenshot humano com Pegar em todas não comprova versão instalada ou causa. Muitos componentes podem pertencer às receitas da build. Refinar para uma única insígnia dourada por oferta prioritária, alternativas discretas sem logo dourada, explicação do motivo. Portais terão no máximo uma indicação principal, por alvos pendentes compatíveis com a etapa e tipos nativos da forma de obtenção, nunca pelos tipos concedidos pelos equipamentos. Sem etapa conhecida, somente afinidade geral explicitada; sem garantia/chance numérica inventada. Marcas de pronto retiram os alvos. Leitura limitada a manager.uid próprio, não espectador, avatar próprio visível/escala não zerada, sprites/símbolos visíveis; símbolos retirados ao reivindicar o portal interrompem indicação. Reusar proteção de menus e geometria de D042. Extensão 0.10.0; 107 testes e QA local aprovados. Ver 22 para verificação e limites finais.

## D042 — Carrossel independente, receitas na reserva e menus sem obstrução

Pedido humano com cinco imagens: carrossel intermitente, escolhas de itens com indicação mais útil, reserva explicando combinação/destinatário e badges/painel por cima dos menus. Autoriza corrigir/refinar esses fluxos locais. Não autoriza ações automáticas de jogo ou acesso a outro inventário.

Leitor do carrossel deixa de depender da validação de itemsContainer/board.player. Exige cena ativa, uid, !spectate, minigameManager.uid == scene.uid, item livre branco e sprite visível/posição válida. Se a reserva própria não puder ser lida mas houver ofertas livres, snapshot carousel contém somente essas ofertas, inventory null/equipped vazio. Nenhuma leitura de conteúdo do campo alheio. Reserva continua exigindo ambos os identificadores próprios. UI distingue referência da build sem reserva de indicação baseada em posse. GameDialog nativo é outra entrada de descoberta por DOMElement.phaser; não cria detalhes nem acessa rede/módulos globais. Fontes verificadas em .cache/research/d042; GameDialog SHA 08a33cb0747aa452f0348b20f823ed8fc9d36935.

PCHGameUI observa bloqueios visíveis: painel de .game-choice, dialog aberto, role dialog aria-modal e modal.show. Respeita display/visibility/hidden e viewport. Marcadores/hints do canvas somem durante menus, enquanto recomendações nos próprios cartões de itens continuam. Painel do Helper fica invisível/inert temporariamente e retorna sem mudar seleção/posição/recolhimento ou gravar preferência de fechar. Não muda z-index/estilo/ações nativas nem interfere no ponteiro. Ao esconder a escolha, restaura o overlay quando não conflita com o botão Mostrar/Esconder; fechar libera novamente. Badges e tooltip também evitam esse controle.

Reserva: etiqueta com destinatário e explicação ao apontar, incluindo receita e falta/ação. Tooltip próprio pointer-events none evita caixas dos detalhes nativos/painel; sem espaço, detalhe permanece acessível no painel. Item inspecionado aparece também no overlay com receita/destino. Escolha prioriza equipamento pronto pendente e depois último componente faltante; desempate determinístico da ordem da oferta/build, sem afirmar melhor estratégia. Alternativas da build têm indicação discreta; ausência de reserva nunca afirma receita completa. Cópias e equipamentos resolvidos continuam abatidos pelo mesmo alocador. Extensão 0.9.0, critérios/evidências em 22.

## D041 — Reapresentar o plano quando a loja monta/atualiza

Humano mostrou Goomy sem badge/contorno apesar da base do nível 2 e confirmou o controle marcado. Conserto local autorizado. Brave não aparece no inventário conectado; a causa específica dessa instalação não foi observada diretamente, e a resposta humana não incluiu a mensagem de diagnóstico. Não declarar confirmação no jogo real.

Revisão encontrou lacuna verificável: sync/refresh considerava suficiente a preferência já escrita; se o assinante React da loja perdeu o primeiro evento (montagem/remontagem posterior), não havia replay até uma nova seleção/nível. GameStore oficial da revisão fixa lê a preferência em useState e assina storage no useEffect; contrato consultado no arquivo verificado de D032. Layout/plano corretos não comprovam classe planned aplicada no navegador.

Extensão 0.8.1 adiciona announce, que revalida propriedade/backup/conflito antes de notificar sem reescrever o plano quando já coincide. Host reavisa após 250 ms de montagem/substituição da loja ou alteração estrutural/estilo de ofertas. Classe planned não causa novo replay, evitando loop. Sincronização do plano também agenda reapresentação; fechar/desligar cancela ou invalida a pendência. Evento MAIN por relay restrito a origem/janela/chave team_planner garante notificação no contexto da página; não lê objetos, armazenamento, rede, credenciais ou controla partida. Origem exata/top frame, mensagens coalescidas por tarefa.

Botão Reverificar loja no painel revalida/notifica sem despausar conflito nem alterar estado da comp. Versão da extensão visível ao lado. Compra/posse/nível continuam manuais; nada de OCR ou reconhecimento de pixels/base64. Proteções anteriores mantidas. Regressão comp 6/variação 0 nível 2 deve reconhecer Goomy pela família de Sligoo; inclui Poliwag provisório. Testes/QA e limites em 22.

## D040 — Cards compactos com referência de cartas Pokémon

Proprietário rejeitou a elipse cinza e pediu referência das cartas Mewtwo/Raichu, adaptada ao Auto Chess e sem aumentar a altura. Autoriza reformular somente cards de Pokémon da home/catálogo; preserva dados, navegação, filtros e integração do overlay. Usuário já autorizou borda/arte/fundos próprios por essas referências; não requer outra aprovação visual.

Direção: moldura metálica dourada, cabeçalho com nome/estrelas/ícone de tipo, janela retangular com luz por sinergia primária, arte integral ou retrato próprio em pixel art em moldura retangular. Código PAC é o índice real do catálogo, sem inventar numeração/atributos do TCG. Corpo compacto mostra raridade, alcance por extenso, sinergias e itens populares. Arte/identidades e links existentes preservados. Efeito de reflexo/elevação somente em hover/foco, sem movimento contínuo, com redução de movimento. Paleta clara/escura consistente. Cores por tipo são apresentação, sem mudar regras do jogo.

Reusa o mesmo pokemonCard em todas as grades. Ajustes locais em views/presentation/theme; nenhuma importação, dependência ou alteração de recursos do jogo. Ver resultado e testes em 22.

## D039 — Itens da reserva e do carrossel, leitura local

Autorização mais recente: marcar itens importantes da própria reserva e do carrossel para montar equipamentos da composição selecionada. Supera o limite anterior de não ler inventário apenas para esse propósito; não autoriza outras contas/dados, conexão privada, compra, movimentação ou montagem automática.

Pesquisa na revisão fixa 07367c341fe928763da2b565c2eee010433e4fc1: ItemDetail estende Phaser.DOMElement, com nó .item-detail-tooltip; Phaser 4.2.1 atribui node.phaser ao objeto. A referência scene fornece itemsContainer, board.player e minigameManager.items. Fonte Phaser: https://github.com/phaserjs/phaser/blob/v4.2.1/src/gameobjects/domelement/DOMElement.js. Fontes do jogo e hashes em 22; cópias de pesquisa em .cache/research/d039. Não há endpoint público de inventário identificado; backend não é necessário.

Leitor MAIN de escopo exato usa somente essa ligação, própria reserva/equipamentos e itens livres visíveis do carrossel. Guards !spectate, itemsContainer.playerId == uid e board.player.id == uid antes de ler conteúdo; não transmite IDs pessoais. Oferta livre usa strokeColor branco nativo; verde/vermelho são preservados. Bounds do sprite projetados pela matriz da câmera, scroll e escala CSS do canvas, sem ler pixels. Sem interceptar rede, React, autenticação ou emitir comandos. Contrato incompatível falha sem presumir posse. Se nenhum detalhe foi criado, pede abrir detalhes de item/Pokémon no próprio jogo; não promete conexão automática desde o lobby.

Snapshots mínimos em memória entre MAIN/isolated/painel, mesma janela/origem e token de correlação; IDs/limites/coordenadas validados. Token não é autenticação contra o próprio site. Cadência 150 ms enquanto ativo e visível; heartbeat expira em 5 s. Fechar/desligar remove marcações; recolher mantém. Permissões existentes preservadas. Inventário não vai ao worker, backend, logs nem storage; worker fornece apenas plano/catálogos estáticos.

Alocação usa todos os equipamentos da comp final, independentemente das marcas manuais de Pokémon pronto. Abate cópias equipadas somente na família destinatária; não presume remover itens de outras famílias. Depois abate equipamentos prontos na reserva, receitas completas e componentes parciais, sem reutilizar cópias. Ordem determinística da build é sugestão, não otimização estratégica. Carrossel indica componentes faltantes/equipamentos pendentes; reserva indica Guardar/Montar/Equipar. Escolhas HTML de itens recebem contorno/receita/destino; sem reserva conectada dizem Da build, sem alegar falta. Recursos de receitas completos empacotados localmente. Nenhuma alteração ao motor, seleção ou ponteiro dos itens.

Guia compacto no mesmo overlay mostra conexão, receitas, peças destinatárias, falta, pronto para montar/equipar. Nível e progresso de Pokémon continuam manuais. Conflito do planejador pausa só os destaques de Pokémon; itens continuam seguindo a comp selecionada, explicitado na mensagem. Extensão 0.8.0. Evidências e limites em 22.

## D038 — Provisórios por nível e contorno amarelo

Pedido humano: provisórios também recebem badge até o momento de troca pela comp final; restaurar contorno amarelo. Implementação local autorizada. O gatilho é o nível escolhido no guia já existente, atualizado pelo usuário; não há leitura de nível real/inventário/eventos. Interface explicita essa dependência.

Lista de compras = vagas finais ainda não marcadas prontas + provisórios temporários da lineup do nível atual. Recalculada do zero a cada mudança de nível, marcas ou variação; não acumula níveis anteriores. O motor é createOverlayGuide/planLevel compartilhado com o painel, preservando raridades, sinergias, condicionais e regras anteriores. Famílias finais continuam procuradas nos níveis iniciais; jogo marca ofertas reais da mesma família. Provisório que deixa a lineup deixa o plano nativo e perde badge/contorno, exceto se sua família ainda for alvo por outro motivo legítimo. Evoluções da mesma família continuam correspondendo à lógica nativa.

shop-context.mjs prepara o catálogo compacto uma vez no worker; build ajusta o import para os módulos locais do pacote. shop-model.mjs preserva posições/itens das vagas finais e aloca provisórios sem itens em casas livres. A união é uma lista de compras, não uma equipe simultânea de campo; o planejador nativo pode conter mais peças que o nível, enquanto o campo correto continua no guia. Limite de 24 casas e ausência de colisões verificados. Estado/ACL/backup/conflito/restauração preservados. Fingerprint do host passa a incluir guideLevel, corrigindo ausência anterior de atualização quando só o nível mudava.

Contorno amarelo de 3 px acompanha exatamente os mesmos cartões planned da badge, apenas com integração ativa; ambos somem juntos. Mesma insígnia pequena dourada para finais/provisórios, sem nova cor ou permissão. Versão 0.7.0; evidências em 22.

## D037 — Segunda redução da badge

Pedido humano: diminuir mais. Desktop 36 × 41 px, offsets left -8/top -11; viewport estreita 30 × 34 px, left -6/top -9; sombra reduzida. Preserva hexágono, marca, relevo e funcionamento. Extensão 0.6.5.

## D036 — Redução da insígnia

Pedido humano: deixar um pouco menor após a prévia da loja. Reduzida de 58 × 66 para 46 × 52 px; viewport estreita de 48 × 54 para 38 × 43 px. Offsets proporcionais -11/-14 px no desktop, -8/-11 px em viewport estreita, sombra levemente reduzida. Logo/relevo/canto esquerdo e reconhecimento mantidos. Extensão 0.6.4.

## D035 — Badge presa ao cartão e exemplo na loja

Pedido humano: mostrar exemplo na tela da loja e corrigir posição muito alta. Insígnia move para canto superior esquerdo, top -18 px/left -14 px no desktop, top -14 px/left -10 px em viewport estreita. Preserva tamanho/relevo/logo de D034; parte da badge sobrepõe o retrato. Direita contém sinergias nativas, razão para mudar o canto. Folga padrão do painel ajustada para 32/24 px acima da loja. Sem alterar preços, sinergias, reconhecimento ou cliques. Extensão 0.6.3 e prévia ilustrativa explicitamente identificada como loja simulada.

## D034 — Insígnia hexagonal com a marca

Pedido humano substitui carrinho pequeno por insígnia maior com nossa logo e efeito 3D. Moldura vetorial própria em hexágono com degradê metálico, bisel, lateral extrudada e sombra estática. Logo original assets/logo.png reutilizada sem edição pelo mesmo arquivo já empacotado em overlay/assets/brand/logo.png; sem imagem duplicada ou dependência nova. Duas camadas CSS mantêm a marca separada da moldura. Dimensão 58 × 66 px, reduzida a 48 × 54 px em viewport estreita. Sem texto, animação ou captura de ponteiro. Posição padrão do painel deixa espaço para a insígnia acima das ofertas. Extensão 0.6.2; protocolo/mecânicas de reconhecimento de D032 preservados.

## D033 — Insígnia visual de compra

Pedido humano: substituir a badge textual por apenas uma insígnia indicando compra. SVG próprio local com medalhão dourado e carrinho, 28 px (24 px em viewport estreita), sem faixa/texto ou contorno extra do cartão. Posição junto do canto superior direito; sem capturar cliques ou nova animação. Recurso exposto pela extensão apenas ao domínio do jogo; URL resolvida por chrome.runtime.getURL, sem código/serviço externo. Extensão 0.6.1; mecanismo nativo, backup, marcas e permissões de D032 preservados.

## D032 — Destaques da loja pelo planejador nativo

Em 16/10/2026, o proprietário autorizou investigar a aba e implementar badges nas ofertas correspondentes à comp escolhida, sem leitura de tela. O backend do Helper não tem acesso ao estado de outra origem; a extensão já instalada será a ponte local. Não é necessário interceptar sockets ou executar compras.

Pesquisa verificou blobs Git/SHA-1 na revisão 07367c341fe928763da2b565c2eee010433e4fc1: game-store.tsx lê team_planner e usa isSameFamily para atribuir planned aos retratos da loja; pages/utils/store.ts armazena {expirationDate,value} e notifica por StorageEvent; app/types/models/bot-v2.ts define name/x/y/items. A API é interna e pode mudar: status deve distinguir preferência sincronizada, loja ausente e marcações efetivamente observadas.

Decisão: integrar somente essa preferência local, com backup durável anterior e restauração ao desligar. Alterações manuais no planejador do jogo suspendem a integração; nunca sobrescrevê-las automaticamente. Badges CSS apenas nos cartões planned dentro da loja enquanto o Helper possuir o valor atual. Famílias da variação final, excluindo vagas marcadas manualmente como prontas; provisórios do guia não são alvos. Sem leitura de credenciais/reconexão, inventário oculto ou envio externo de dados da partida. Sem compras/cliques automáticos. Preferência desligável no painel; importação explícita ativa o recurso, estado antigo migra desligado. Fechar desliga/restaura; recolher mantém ativo. Backup permanece para recuperação após reload; múltiplas abas compartilham a preferência nativa.

Fontes: [loja](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/public/src/pages/component/game/game-store.tsx), [armazenamento](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/public/src/pages/utils/store.ts), [formato](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/types/models/bot-v2.ts). Implementação local concluída na extensão 0.6.0; testes/QA e limites em 22. Execução real no jogo ainda pendente.

## D031 — Evolução própria, controles SVG e aquisição especial confirmada

Em 16/10/2026, proprietário pediu diferenciar evolução de substituição, reduzir largura dos avisos com faixas vermelha/verde, importar ícones para os controles e verificar dois dourados (Latios/Latias) no nível 6. Autorizado refinamento local e correção geral de obtenção.

Pesquisa na revisão fixada 07367c341fe928763da2b565c2eee010433e4fc1: pools.ts inclui PkmDuo.LATIOS_LATIAS em UniquePool; Pokemon.ts mapeia a dupla para os dois Pokémon; shop.ts seleciona UniquePool no segundo portal e stages.ts o situa na etapa 10. Eles são UNIQUE, com três estrelas de catálogo e uma cópia na rota inicial, não ULTRA da tabela comum. Pode ser possível já ter recebido a dupla enquanto o jogador está no nível 6; etapa e nível são independentes. Isso não prova posse nem probabilidade de oferta numa partida específica. Portais lendários são na etapa 20. A regra antiga que incluía únicos no nível 6 e lendários no 8 era uma heurística indevida para a base, mesmo com aviso condicional.

Decisão geral: antes do objetivo final, rotas cujo método não é shop só entram se o usuário confirmar a forma pronta. Abrange únicos, lendários, ovos, especiais e rotas em revisão, sem exceção codificada para Latios. Portal não é desbloqueio por XP. Mensagem visível e lista de obtenções explicam marcar na equipe do overlay ou Já tenho na ficha. Marcações continuam locais/manuais, não uma leitura do jogo. No nível 9, referência final completa preservada com condições; não se declara inventário obtido. Mantidos critérios de raridade para loja comum e provisórios para preencher vagas.

Apresentação: evolução com rótulo Evoluir, receita e SVG; não usa Sai/Entra. Substituições com retratos de 27 px e nomes pequenos dentro das faixas vermelha/verde em chevron; sem seta textual central. SVGs Lucide 1.57.0 locais via máscara CSS/currentColor para abrir link, recolher/expandir, fechar, direção e confirmação. Sem fontes de ícones nem código remoto. tools/cache-ui-icons.mjs fixa versão, valida SVGs e registra origem/hashes/licença ISC com atribuições Feather. Site e ZIP incluem licença/créditos. Sem dependência npm nova.

Extensão 0.5.0; permissões, estado e snapshot mecânico preservados. Testes/QA/limites em 22. Fontes primárias: [pools](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/config/game/pools.ts), [duplas](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/types/enum/Pokemon.ts), [seleção](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/models/shop.ts), [etapas](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/config/game/stages.ts).

## D030 — Campo intermediário completo e substituições explícitas

Em 16/10/2026, proprietário relatou campo 4/5 e excesso de mudanças sem instruções completas; pediu mostrar saída/entrada de cada substituição, inclusive provisório por provisório, sem anunciar adição em vaga nova. Autorizada correção local do planejador e apresentação no Helper/overlay.

Decisão: níveis de montagem 2–8 usam todas as vagas, independentemente do tamanho do exemplo final. Lista curta de provisórios passa a contar famílias distintas antes do corte de 12 e preserva candidatos do nível anterior. Último nível mantém a referência exata e vagas flexíveis explícitas de D029. Seed do campo anterior, continuidade por família (32 pontos em vez de 12 por ID) e no máximo uma reorganização de provisório para provisório por nível, exigindo patamar relevante novo. Evoluções e entrada de famílias finais continuam possíveis; cada mudança é explicada.

Diff separado em lineupChanges: consome cada cópia uma vez, preserva IDs que só mudam de rótulo, pareia primeiro evoluções do mesmo alvo, depois famílias e demais saídas/entradas. Corrige o pareamento anterior que só procurava saída provisória e podia ignorar a remoção de um alvo. Evolução só recebe esse rótulo ao manter alvo/família; trocas de ramo são substituições. Remoções sem entrada também são mostradas. Entradas isoladas ficam no campo e não geram seção de trocas.

Renderer compartilhado progression-change-view.mjs mostra retratos/nomes com Sai → Entra, receita para evolução e linhas responsivas em duas colunas ou uma. Mantidos tokens, campo final, corpo rolável, permissões e estado. Extensão 0.4.1 inclui o módulo novo. Evidências e limites em 22.

## D029 — Progressão orientada à equipe final

Em 16/10/2026, o proprietário mostrou o nível 9 com iniciais/provisórios sem ligação suficiente à equipe escolhida e pediu progressão por raridade e sinergia. O erro vinha de um modelo que mantinha toda forma inicial até marcação manual e excluía adicionais/especiais indefinidamente.

Decisão: separar meta de montagem de inventário. O último nível usa as formas e itens exatos da variação, inclusive duplicatas; equipes com menos de nove não recebem uma peça aleatória. Para dez peças, nove vagas de campo e a peça que exige capacidade extra permanecem explícitas, sem remover membro da referência. As marcas manuais continuam sendo a única confirmação de posse.

Planejador puro em site/lib/progression-planner.mjs, compartilhado pelo guia completo e overlay. Até o nível 8, candidatos são as formas da linhagem final elegíveis, limitadas ao alvo selecionado. Famílias de loja entram a partir de 10% de raridade (Ultra 5%). Metas por cópias usam uma heurística editorial de oportunidade acumulada/janela, sem previsão de sorte: primeira evolução por três cópias requer ao menos um nível de janela e soma de chances ≥0,45; evolução por nove requer três níveis e soma ≥1. Isso não é probabilidade de conseguir cópias. Receitas/condições continuam obrigatórias. Únicos, ovos/especiais entram como planos condicionais no 6, lendários no 8 e rotas em revisão no 9; esses marcos são editoriais, nunca desbloqueio por nível. Etapas 10/20 são explicitamente distintas de níveis.

Seleção gulosa limitada com uma passagem de trocas: prioriza peças prontas/famílias finais, patamares reais da principal e secundárias e continuidade. Até 12 provisórios da principal/secundárias, disponíveis e sem condição regional/adicional, são avaliados; evita campo inicial vazio em comps especiais. Não é otimização de força ou simulação. Famílias finais temporariamente fora do campo aparecem como reserva para a troca. Contagem reutiliza teamSynergies: família, itens, Dragão e Protean. Sem itens finais até o último nível; com os itens exatos no objetivo final. Picos da loja são calculados da tabela, incluindo empate de raros no 7/8/9.

Impacto visual: metas, sinergias ativas/inativas, próximo patamar, reservas, trocas e condições no mesmo guia. Conservados retratos, altura limitada, rolagem interna, temas e marcações. Extensão 0.4.0 inclui contador/planejador, passivas, itens mínimos, regras e todas as imagens de sinergia. Sem permissões novas, leitura de loja ou alterações no jogo. Verificações/limites em 22.

Decisões de 15/10/2026, fundamentadas nesta conversa. Alterações posteriores devem registrar motivo e impacto.

## D028 — Campo legível, guia de níveis e rolagem com altura limitada

Pedido humano aponta retratos pequenos, itens ausentes no campo, guia de níveis ausente e painel crescendo sem rolar. Removido limite de 32 px; retrato ocupa a casa, equipamentos integrais junto à base, com espaços entre fileiras. O renderer compartilha as mesmas associações de itens da faixa superior.

Painel vira coluna flex com cabeçalho/equipe fixos e corpo com rolagem própria. No jogo, host expandido limitado a 640 px/viewport, recolhido a 150 px; mensagens de tamanho do conteúdo deixam de controlar sua altura. Iframe ocupa o host e não expande o documento. Evita a realimentação entre scrollHeight e tamanho da janela anterior.

Guia compacto usa planLevel existente, níveis 2–9, formas iniciais/provisórios/prontos, ações, chances, cópias, juros e custo de XP a partir de zero. Não é trajetória observada de jogadores. Catálogo compacto/regras empacotados uma vez para recalcular a orientação conforme nível/marcas sem copiar regras. Nível selecionado sincroniza pela referência exata da equipe; estado de schema 1 anterior migra com nível 2 padrão. Extensão 0.3.0, sem ampliar permissões. Verificação e limites em 22.

## D027 — Mostrar no Helper e no jogo, com recuperação e diagnóstico

O proprietário esclareceu que deseja o painel em ambos os sites, inclusive na tela de salas do jogo. Restaurado controlador local, sem PiP, e envio à extensão independente: ausência/falha da extensão não impede o uso do painel do Helper. Preferência anterior recuperada; conexão inicial acompanha estado da extensão ou publica a seleção local se a extensão ainda estiver vazia. Variação e marcas acompanham a seleção exata; fechar/recolher no Helper não fecha o painel do jogo.

Versão 0.2.0 da extensão mantém o domínio exato e acrescenta host_permission somente para esse domínio, necessária para consultar/enviar mensagens às suas abas no diagnóstico, sem permissão tabs ampla. Status diferencia equipe salva, content script conectado e iframe carregado. No jogo, um atalho compacto permite escolher equipe ou reabrir, inclusive no lobby; falha de carregamento oferece tentativa manual. Não supor que ausência do painel seja falta de instalação: humano confirmou instalação de 0.1.0, versão efetivamente carregada não foi inspecionada. Validação local e limites em 22.

## D026 — Overlay restrito à página do jogo por extensão

Pedido humano: não mostrar o painel sobre outras abas, somente em Pokémon Auto Chess. Uma janela PiP pertence ao navegador e não representa esse escopo; fluxo ativo passa a extensão MV3 com content script na origem HTTPS exata e iframe próprio. Helper local é somente emissor da seleção, com confirmação explícita da extensão. Controlador PiP removido e URL antiga redirecionada. Não usar iframe do servidor local dentro do jogo ou ampliar acesso a todos os sites.

Pacote gerado reutiliza os planos/estilos/imagens versionados, sem execução remota ou leitura da loja. Ponte restrita a localhost/127.0.0.1 porta 4173, servidor valida mensagens, storage mantém estado local. Nenhuma instalação automática: controle do Brave interrompido por não confirmar URL. Etapa de código/empacotamento verificada; ativação e execução real dependem da instalação no navegador. Evidências/limites em 18 e 22; instruções em extension/README.md.

## D025 — Importação exata para overlay local, antes da integração com o jogo

Pedido humano autoriza a primeira etapa do overlay e o uso do botão amarelo para importar a composição escolhida. O botão passa a carregar a variação exibida; favoritas têm ação independente no detalhe. Plano versionado inclui snapshot/índice original, equipe com equipamentos, componentes, sinergias, formação sugerida e rotas de obtenção. Modelos mecânicos existentes são reutilizados, sem copiar regras ou alterar snapshots.

Painel compacto com identidade atual, posição/expansão e marcas manuais persistidas localmente por vaga. Página independente sincroniza pela mesma origem; Document PiP é progressivo, dependente do navegador e da aba original, com alternativa por janela comum. Não foi implantada detecção de loja/injeção/extensão nem automação da partida. Nenhuma garantia de janela comum sempre por cima. Evidências, contrato e limites em [18 — Overlay](18-OVERLAY.md) e status 22.

## D001 — Produto próprio e limpeza do conteúdo anterior

O proprietário informou que o projeto anterior não existe mais e autorizou excluir tudo desta pasta, deixando somente o planejamento Markdown. O PokeChess Helper não herda contas, recursos, credenciais ou autorizações daquele projeto. Remover inclusive o `AGENTS.md` antigo, README, manifests, lockfile e arquivos de deploy. Esta decisão prevalece sobre a instrução anterior de preservação do conteúdo local.

Impacto: o projeto começa documentalmente, sem stack implementada. A cópia de recuperação do conteúdo anterior fica fora da pasta de trabalho; não é dependência do novo produto. Nenhum recurso externo é excluído por esta autorização local.

## D002 — Escopo completo com implementação em etapas

Todas as funcionalidades conversadas entram no planejamento: catálogo explicativo, funções, itens/receitas, recomendações, sinergias, meta comps, relatórios, históricos, imagens, patches, guias e montador. As demais abas das imagens ficam mapeadas como relatórios complementares com validação de fonte pendente.

Impacto: etapa inicial menor não significa exclusão de funcionalidades; a entrega completa exige resolver as dependências declaradas.

## D003 — Fontes públicas, sem acesso direto ao banco operacional

Começar por código, arquivos e endpoints públicos. Foi comprovada correspondência numérica de composições e itens com as imagens do proprietário.

Impacto: não depender de credenciais MongoDB do jogo. Tratar endpoints como integração externa sujeita a mudanças e alinhar uso recorrente com os mantenedores.

## D004 — Versão publicada separada do master

O servidor informou 6.11.1 enquanto o master já contém conteúdo de 6.12. A revisão compatível deve ser identificada antes de publicar catálogo e regras.

Impacto: os 1.179 registros do CSV não são o total comprovado de unidades da release. Comparar fontes e preservar proveniência; não misturar dados futuros.

## D005 — Separar mecânica, estatística e curadoria

Funções como tanque/carry e recomendações precisam de justificativa. Uso frequente não equivale a melhor escolha universal; exemplos estatísticos não comprovam posicionamento ou causalidade.

Impacto: armazenar natureza e evidência de cada recomendação. Revisar guias após patches.

## D006 — Normalizar e cachear relatórios

O relatório Pokémon observado tem aproximadamente 31 MB. O navegador não deve baixá-lo integralmente em cada consulta.

Impacto: implementar uma camada de coleta, validação e distribuição de recortes, com último snapshot válido e transparência de atualização.

## D007 — Usar imagens existentes com proveniência

PNGs de Pokémon e itens foram acessados no site publicado. Reutilização deve preservar identificação, qualidade e créditos aplicáveis.

Impacto: criar manifesto de assets e verificar direitos; não gerar substitutos artificiais dos ícones existentes.

## D008 — Experiência inicial pública

A função principal é consultar e montar equipes; não há necessidade demonstrada de login para isso.

Impacto: começar com acesso público e salvamento local/compartilhamento estruturado. Contas e outras funcionalidades novas exigem especificação própria.

## D009 — Cópia local de uma página do Mobalytics e seu aside

O proprietário pediu a página `https://mobalytics.gg/tft?int_source=homepage&int_medium=mainbutton` e acrescentou expressamente o menu lateral esquerdo. Esta entrega preserva o visual e o conteúdo de TFT para servir de base editável. É uma exceção específica à orientação anterior de não copiar a interface de referência; não altera a identidade final planejada para o PokeChess.

Impacto: criar `site/` com HTML/CSS/JavaScript sem dependências de terceiros, uma única página, assets locais e servidor loopback. Outros destinos continuam como links externos, sem implementar suas páginas. Anúncios ficam como espaços estáticos e não há réplica de autenticação, backend ou rastreamento. A adaptação de conteúdo para Pokémon é posterior. A solicitação substitui o limite documental de manter apenas a pasta Markdown; não implica deploy externo.

## D010 — Adaptação ao domínio com preservação do visual

O proprietário autorizou preparar a integração dinâmica e transformar a base em PokeChess Helper, mantendo o visual. Permanecem HTML/CSS e módulos JavaScript nativos; não há benefício demonstrado em migrar o layout aprovado para outro framework nesta etapa. Acrescentado TypeScript 5.9.3 como parser AST de desenvolvimento, com lockfile, testes e validação de contratos. O código remoto não é executado.

Impacto: aplicação ativa em `site/main.mjs` e `site/lib/`; coleta/normalização separadas em `tools/`; módulos TFT arquivados fora da raiz pública. A autorização cobre ambiente e conteúdo locais, sem deploy, banco externo, agendamento ou custos novos.

## D011 — Cruzar enum, classes e CSV da revisão prod

Fixada a revisão `07367c341fe928763da2b565c2eee010433e4fc1`, com versão declarada 6.11.1, igual a `/status`. O servidor não expõe o SHA do deploy; não tratá-lo como comprovado. A validação cruza os endpoints publicados em ambas as direções para IDs/índices e itens, além dos patamares de sinergia.

O CSV omite nove registros e diverge das classes em 39 atributos. O catálogo usa o enum completo, índices/famílias e declarações das classes; o CSV é apoio e auditoria. Isso inclui as novidades 6.11 sem importar master/6.12. Catálogo resultante: 1.184 registros, com categoria separada para ovo, invocações e sentinela.

## D012 — Snapshots completos e semântica preservada

Relatórios brutos são arquivados fora do site; o navegador recebe índices, fichas e recortes de faixa. Histórico não é baixado ao abrir a página. O ponteiro muda atomicamente depois de validação e preparo dos recursos; falha conserva o anterior. Fontes/código/curadoria iguais geram o mesmo identificador de snapshot, que é verificado e reutilizado.

Colocações inválidas e IDs desconhecidos são registrados em qualidade e não fabricam desempenho. Vitória usa 0–100; frequências usam 0–1; denominador de ratio permanece sem interpretação inventada. Comps não recebem posicionamento, modo, versão ou Elo ausentes na fonte. Salvos e links incluem o snapshot. Funções editoriais são versionadas separadamente; oito perfis iniciais, demais em revisão.

## D013 — Uma equipe por detalhe e variações recolhidas

O proprietário pediu substituir o resumo de várias equipes por um detalhe semelhante à referência: Pokémon no campo, sinergias e itens individuais, com variações acessíveis sem uma página interminável. Cada linha mantém seu grupo; detalhe e cabeçalho usam uma equipe observada por vez. Variações ficam no seletor recolhível e têm links com índice original e snapshot. Abrir outra composição recolhe a anterior.

Campo do PAC: 8 × 3 casas quadradas. O Helper gera sugestão local identificada, por alcance com itens e resistência base. A autorização supera a interface anterior sem campo, sem mudar os dados da fonte. Não inventar posição observada ou taxa de vitória por variação. Sinergias consideram famílias, itens, Dragão e Protean da revisão fixada; bônus externos e regras especiais desconhecidas continuam como limitação.

Impacto: modelo/renderização separados, regras no snapshot, passivas no índice e habilidades sob demanda. Dois exemplos vazios entre 780 ficam fora do seletor, sem apagar a fonte. Ver [16](16-COMPOSICOES-E-VARIACOES.md).

## D014 — Progressão baseada em regras, com sugestão editorial explícita

O proprietário pediu um leveling guide para iniciantes, mostrando como chegar à comp final e quando comprar XP ou procurar cópias. A fonte permite extrair probabilidades, XP, economia, evoluções e escolhas especiais; os relatórios não fornecem a trajetória de compras por jogador. Portanto não apresentar a sugestão como rota comprovada ou guia oficial do meta.

Cada variação recebe guia recolhível por níveis 2–9, alvo de cópias, campo em montagem, receitas e calculadora de XP. Evoluções dependem de cópias/condições, não do nível. Regionais, adicionais e peças especiais não são presumidos disponíveis; famílias não resolvidas ficam em revisão. Rhyhorn é Ultra; Gyarados usa oito Magikarp. Nenhuma regra de TFT é transportada automaticamente.

Regras extraídas via AST/leitura estática, arquivo de progressão por snapshot carregado sob demanda. Janelas de reroll/economia/provisórios são política do Helper, identificada e condicional à partida. Mudança de patch exige revisão explícita dessa política. Não há simulação de probabilidade exata por espécie, leitura da partida, deploy ou serviços externos novos. Detalhes em [17](17-GUIA-DE-NIVEIS.md).

## D015 — Guia integrado e identidade visual das composições

O proprietário rejeitou o guia que escondia a formação e pediu mais personalidade conforme a nova imagem anexada. Autorização supera a preservação estrita do visual neste painel. Campo, itens, sinergias e guia permanecem na mesma ficha; progressão abre por padrão, com economia e detalhes longos recolhidos. Inspeção abre ao selecionar uma unidade. Variações continuam compactas e substituem a equipe atual.

Retratos compartilham um componente de medalhão hexagonal com moldura por raridade, estrelas de catálogo e itens. Lateral destaca a identidade da equipe, campo ganha espaço e superfícies mais escuras. As coordenadas continuam 8 × 3, sem deslocamento das linhas ou alteração das regras por causa da silhueta hexagonal. Navegação, fontes, snapshots e funções de sugestão preservados. Sem novas dependências ou chamadas externas. Validação de navegador e comandos no status 22.

## D016 — Equipamentos legíveis junto dos retratos

O proprietário pediu aproximar os itens de cada Pokémon da nova referência. O recorte hexagonal agora pertence à moldura, preservando a imagem completa do item com `object-fit: contain`. Campo e faixa de equipamentos usam ícones de 24 px (23 px na faixa compacta), sobrepostos à base do medalhão; cabeçalho usa 18 px. A faixa mostra a equipe inteira, cada peça com seus próprios equipamentos e indicação quando não há itens.

Campo mantém largura mínima de 552 px dentro de uma área com rolagem horizontal para evitar itens de 10 px no celular. Documento não ganha overflow; área é focável e pode ser rolada por teclado. Cabeçalho compacto também permite rolagem. Cliques continuam abrindo fichas de efeitos/receitas; hover e foco destacam os itens, com redução de movimento respeitada. Não altera itens das equipes, formação, dados ou snapshots.

## D017 — Alinhamento, logo e filtros das composições

O proprietário autorizou corrigir o alinhamento das imagens, atualizar as duas logos da navbar a partir de `assets/` e filtrar comps por sinergia/Pokémon principal. O cabeçalho usa dez colunas fixas com retratos de 46 px, trilhas iguais para nomes e posições fixas para itens. Equipes menores deixam as colunas restantes vazias, sem redistribuir os membros. Em telas estreitas a faixa rola horizontalmente. O arquivo fornecido `assets/logo.png` foi copiado sem edição para `site/assets/brand/logo.png` e usado nas duas pontas da navbar e na marca mobile.

Filtros na lista de composições e salvas: sinergia principal (maior contagem do grupo, incluindo empates) ou ativa na equipe calculada pelas regras importadas; Pokémon por nome/ID, em qualquer posição ou como peça em destaque. Destaque é o membro com mais itens, desempate pela ordem do exemplo; não representa avaliação de carry ou trajetória vencedora. Combinações precisam corresponder à mesma equipe observada. Cabeçalho, detalhe e seletor de variações mostram somente equipes compatíveis. Links diretos abrem o exemplo original independentemente dos filtros da lista.

Ordenação por ordem original, colocação média, vitória ou ocorrências usa métricas do grupo. Numeração conserva a posição original no relatório. Contador, estado vazio e limpeza dos filtros incluídos. Estado dos controles persiste na navegação em memória; não há gravação remota, mudanças de catálogo ou importação nova.

## D018 — Respeitar os retratos compartilhados oficiais de Floette/Flabébé

O proprietário apontou a Floette Amarela sem imagem. A investigação encontrou o mapa `PORTRAITS_FALLBACKS` no [utilitário oficial de avatares da revisão fixa](https://github.com/keldaanCommunity/pokemonAutoChess/blob/07367c341fe928763da2b565c2eee010433e4fc1/app/utils/avatar.ts). O jogo direciona `0669-0001` até `0669-0004` para `0669`, e `0670-0001` até `0670-0004` para `0670`. A documentação anterior interpretava os 404 individuais como ausência visual sem considerar essa regra.

O importador agora arquiva a fonte e interpreta somente o objeto estático, sem executar o módulo remoto. Valida índices, destinos e ausência de encadeamentos; caminho remoto é resolvido antes do cache negativo. Mantém identidade/nome/atributos das variantes e registra `portraitFallback` e URL de origem em `assets.json`. Não há recoloração ou imagem inventada. Nova publicação por snapshot, preservando os anteriores; composições e metadados do relatório comparados e iguais ao snapshot anterior. O mapa oficial remove as oito ausências, totalizando 1.573 recursos disponíveis.

## D019 — Home acolhedora e correção da renderização de Pokémon

O proprietário pediu melhorar a apresentação da home, dar mais boas-vindas/animação e corrigir “link is not defined”. Causa: `pokemonCard` em `views.mjs` usava `link` sem importá-lo após a separação dos componentes. A função foi exportada do módulo compartilhado e importada explicitamente; novo teste renderiza os 1.184 registros e verifica seus links. A falha não era ausência do catálogo. Erros internos de referência/tipo agora exibem mensagem de recuperação e são registrados no console; não são confundidos com catálogo não carregado.

Home passa a ocupar a largura disponível, com título de boas-vindas, chamadas para comps/Pokémon e prévia interativa de Gyarados, Volcanion e Umbreon. Explicações são as funções editoriais já versionadas e itens populares são da faixa selecionada. Troca por botão/teclado, sem rotação automática; estado da escolha persiste em memória na navegação. Três caminhos de aprendizado levam aos catálogos e comps. Banners repetidos e painéis laterais redundantes foram removidos da home; demais telas conservam seu layout.

Paleta, fontes, menu e logos mantidos. Entrada curta, transição da prévia e feedback em hover/foco; conteúdo permanece visível sem animação e `prefers-reduced-motion` remove movimentos. Não há nova dependência, dado inventado, importação ou snapshot novo. Código em `home-view.mjs`/`home.css`; evidências no status 22.

## D020 — Identidade Pokémon/Nintendo na home e cards

O pedido humano mais recente autoriza reformulação visual, degradê, fonte primária diferente e animações leves. Home/Pokédex passam a branco e cinza frio, ações vermelhas, banner vermelho/coral/rosa e Nunito arredondada. A referência Mobalytics fica como histórico estrutural das comps. A marca permanece projeto de fã independente.

Cards usam ilustrações transparentes para oito identidades exatas; outras formas preservam seus retratos próprios, em recorte circular. Nenhuma forma é substituída por outra espécie/forma. Erro da ilustração retorna ao retrato do jogo. Recursos de apresentação têm manifesto próprio com hashes/créditos, sem alterar snapshots mecânicos; PokeAPI/sprites fixado em ba403973fdf9d0ac59175813861e6a1f8ed5020c. Nunito local sob SIL OFL 1.1. Comando de recuperação: npm run assets:presentation.

CSS isolado em home.css/theme.css, prévias e cards compartilham lib/presentation.mjs. Animações curtas por contexto, sem loops ou dependências. Overflow clip impede o foco de rolar o conteúdo dentro do banner. Validação e limites registrados em 22. Sem publicação externa ou novas contas.

## D021 — Tema global com preferência local

Pedido humano autoriza seletor claro/escuro e exige escuro padrão. O tema deixa de depender da rota. Paleta central em theme.css, aplicada ao shell, menus, fichas, catálogo e detalhes das comps/guias. Assets, cores de raridade e medalhas são semânticos, não superfícies neutras.

site/theme.js aplica preferência antes do CSS, padrão escuro sem seguir o sistema; persistência opcional em pokechess-theme-v1, normalização restrita, sincronização por storage. Switch nativo com aria-checked e rótulo estável Tema claro, na toolbar e no cabeçalho mobile. Sem biblioteca, backend ou dados do usuário transmitidos. Detalhes dos testes em 22.

## D022 — Vídeo local no banner, com divisão diagonal

O proprietário solicitou trecho 0–47 s em loop e depois informou o MP4 em assets, exigindo diagonal e autoplay sem áudio. A origem vigente é o arquivo local, preservado. Derivado H.264 1280 × 720, 47 s, sem áudio, faststart e taxa limitada; manifesto de mídia separado do snapshot. A incorporação YouTube intermediária foi substituída integralmente.

Vídeo nativo preenche a metade direita, corte diagonal por clip-path; mobile empilha com borda inclinada. Autoplay silencioso também no mobile, playsinline, loop nativo do arquivo fisicamente cortado. Pausa acessível, conservação de pausa manual e suspensão fora de exibição. O pedido explícito de autoplay prevalece sobre a escolha anterior de bloquear autoplay por movimento reduzido; o botão de pausa permanece disponível. Sem cronômetros de loop, iframe ou dependência de reprodução externa. Servidor local passa a suportar MIME MP4, stream e intervalos HTTP. Resultados em 22.

## D023 — Textura e alinhamento do banner sem controle de pausa

Pedido explícito do proprietário remove o botão de pausa adicionado em D022. Retirada a interface e sua alternância manual; mantida suspensão técnica fora de exibição. Botão de reprodução aparece somente como recuperação se autoplay for bloqueado. Textura triangular vetorial própria, sem nova biblioteca ou animação, sobre o degradê vermelho. Recuo maior do conteúdo no desktop, adaptado por breakpoint; diagonal, vídeo, fontes e temas preservados. Evidências em 22.

## D024 — Destaque de patch e modal de novidades

A terceira dobra foi interpretada como a área posterior às composições na home. Banner reaproveita proporção, textura e diagonal, com azul inspirado na arte Stadium, texto à esquerda e banner2.jpg à direita. Modal nativo explícito no pedido, resumo em português separado entre 6.11 e 6.11.1; conteúdo completo preservado nas fontes oficiais vinculadas.

Imagem local fornecida pelo proprietário, original preservado. Conteúdo editorial versionado em site/data/patches/latest.json, separado do snapshot do catálogo. /status confirmou 6.11.1; não considerar master como patch publicado. Rótulo Versão atual condicionado à versão do catálogo. Atualizações futuras exigem revisar o JSON e conferir o servidor, sem agendamento automático. Modal tem rolagem interna, fechamento nativo/Escape, retorno de foco e tema global. Verificação em 22.
