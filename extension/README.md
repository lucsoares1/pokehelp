# PokeChess Helper — extensão local

## Atualização 0.18.1 — site publicado na Vercel

A ponte do Helper aceita também https://pokehelp-one.vercel.app, somente a origem HTTPS exata e os caminhos raiz/index.html, além dos dois endereços locais. Outros projetos Vercel e subdomínios parecidos continuam rejeitados. Importar uma equipe pelo site público grava essa origem para os links de retorno; novas instalações abrem o site público por padrão. Recarregue a extensão e as páginas para aplicar.

O build de publicação inclui o ZIP e usa o mesmo snapshot revisado do site. O diagnóstico do site reconhece a versão 0.18.1 e recupera o estado da composição das versões atuais. As recomendações de itens e campo/banco de 0.18.0 permanecem. Verificação local: 182 testes aprovados e sintaxe de 96 arquivos; validação de publicação descrita no status do projeto.

## Atualização 0.18.0 — melhor campo agora e caminho da comp

O aviso Banco → campo passa a separar duas avaliações. “Melhor opção agora” compara as instâncias reais em campo e no banco sem bônus por pertencer à comp ou ao guia: estrelas, atributos base, equipamentos, patamares de sinergia e opção de curto alcance ponderada pela resistência base. Assim, um reforço fora da comp pode substituir uma peça atual. A sugestão informa motivo, ganhos/perdas e quando o reforço se afasta do planejamento. É uma estimativa conservadora, sem simulação de combate ou comparação com adversários.

“Caminho da comp” mantém destinos e provisórios por nível. Quando as avaliações divergem, a opção do guia fica em “Caminho da comp · outra opção”; quando concordam, aparece uma só troca. O aviso recolhido prioriza a avaliação imediata e identifica sua origem. Receitas, carrossel e guia estático continuam disponíveis. As duas avaliações respeitam vagas, itens equipados, estrelas, fases e leitura válida; não movem peças nem presumem transferência de equipamentos. A alternativa aberta permanece aberta quando a leitura atualiza.

Verificação: 178 testes aprovados, 92 arquivos JavaScript com sintaxe válida, pacote/ZIP 0.18.0 reconstruídos. Oito regressões novas cobrem reforço fora da comp, avaliações divergentes/concordantes, independência do guia, sinergias reais, atributos, duplicatas e paridade do pacote com catálogo real (Raticate entrando por Magikarp). Testado localmente; validação numa partida real permanece pendente. Recarregue extensão e jogo; se usa outra pasta extraída, substitua os arquivos pelo ZIP atualizado primeiro.

## Atualização 0.17.1 — carrossel considera receitas possíveis com a reserva

Cada oferta é comparada com os componentes livres da reserva, permitindo realocar componentes separados para receitas ainda incompletas. Completar um equipamento da comp tem prioridade sobre guardar outro componente para depois; receitas já completas ficam protegidas. Equipamentos já disponíveis, equipados ou em trânsito continuam descontados, e componentes repetidos respeitam a quantidade real. Em empate, mantém a ordem dos destinos da comp.

O carrossel mostra “Completa” na prioridade que fecha uma receita; o tooltip informa o componente da reserva e o equipamento de destino. Menus de itens usam o mesmo cálculo. Sem reserva lida, permanece apenas afinidade da build, sem afirmar que a receita fecha. A comparação de ofertas não altera a fila de montagem nem o inventário.

Verificação: 170 testes aprovados, 92 arquivos JavaScript com sintaxe válida, pacote e ZIP 0.17.1 reconstruídos. Regressão real: NEVER_MELT_ICE separado para WIDE_LENS pode combinar com HEART_SCALE oferecida para fechar POKE_DOLL. Testado com dados/cenas simulados e catálogo empacotado; não validado nesta etapa numa partida real. Recarregue a extensão e depois a aba do jogo; se usa outra pasta extraída, substitua os arquivos pelo ZIP atualizado primeiro.

## Atualização 0.17.0 — escolha de varinhas de Fada

As 16 varinhas da versão 6.11.1 entram na recomendação das ofertas nativas. Uma recebe destaque dourado e as demais ficam como alternativas, com motivo e Fadas consideradas. Heurística combina comp final (prioridade de longo prazo) e campo próprio lido: alcance e itens, frequência estimada pelo custo de PP, ataques, crítico e resistência. Tipo Fada concedido por item é considerado. Sem campo lido, o guia é identificado como condicional; banco não confirma benefício ativo. Sem Fada na comp/campo/guia, opções ficam neutras com aviso de ausência de encaixe.

Varinhas são efeitos guardados pelo jogador, não equipamentos para um portador ou receitas da reserva. O fluxo existente de itens permanece separado. Risco de recuo da Two-Edged Wand fica explícito. Não prevê adversários, posicionamento inimigo ou resultado de combate; pesos são sugestões de encaixe. Fonte oficial fixada: https://raw.githubusercontent.com/keldaanCommunity/pokemonAutoChess/07367c341fe928763da2b565c2eee010433e4fc1/app/core/effects/synergies.ts e descrições do catálogo local.

160 testes aprovados e 90 arquivos JavaScript com sintaxe válida. QA local com as três varinhas do screenshot, Gardevoir/Togekiss em campo e comp Humanóide/Psíquico: uma recomendação, alternativas, atualização ao ir ao banco, recuperação após esconder/mostrar o menu e limpeza ao fechá-lo. Captura .cache/verification/wands-d053-choice.jpg. Pacote/ZIP 0.17.0 gerado; recarregue a extensão e a aba do jogo para usar. Validação em partida real permanece pendente.

## Atualização 0.16.0 — overlay organizado por tarefa

Abas Agora, Equipe, Itens e Guia separam decisões imediatas, formação, receitas/portadores e progressão. Agora resume campo/banco, portal quando disponível e próxima receita. Itens mostra duas prioridades e portadores por vez; demais opções e instruções ficam recolhidas. Opções no cabeçalho reúne controle de destaques e reconexão; versão e diagnóstico ficam em Suporte e informações técnicas, fechado por padrão.

Itens dos Pokémon no resumo superior e na formação mostram tooltip visual de componentes ao passar o mouse ou focar pelo teclado. Receitas vêm do catálogo, preservando componentes repetidos; interagir com o item não marca o Pokémon como pronto. Escape e rolagem fecham o tooltip. Navegação com setas, Home/End, aba selecionada preservada ao mudar nível/marcas e aviso de troca no modo recolhido mantidos.

Validação: 156 testes aprovados, 88 módulos com sintaxe válida, build/ZIP 0.16.0. QA local com leitor e pacote reais sobre formação simulada: compra de Poliwag, troca indicada, guia, abas, receita e opções ocultas. Agora sem rolagem nesse cenário a 1280×720; conteúdos maiores ainda rolam dentro da aba. Capturas em .cache/verification/overlay-d052-*.jpg. Recarregue a extensão na pasta extension/dist e depois a aba do jogo para receber a versão; partida real não foi validada nesta etapa.

## Atualização 0.15.0 — verificador de campo e banco

O overlay acompanha as instâncias, posições, estrelas e itens do campo e banco próprios. A seção “Banco → campo” indica uma ação manual por vez: quem entra, quem sai ou se há vaga livre. Recalcula com compras, movimentos, vendas e mudanças de nível/capacidade. Retratos, estrelas e posições identificam cada cópia; “Ver campo e banco” mostra a leitura atual. Uma troca disponível aparece também no painel recolhido, com o botão “Ver troca”.

A avaliação considera cobertura das famílias da comp, provisórios do guia, atributos, estrelas, itens e sinergias reais após a substituição, com as mesmas regras de famílias/itens/Dragão/Protean do modelo existente. Para o verificador, o guia usa o nível lido do jogador quando disponível; o controle manual de nível e as outras recomendações não são alterados. Evita retirar portador com mais itens que o substituto, reduzir muito as estrelas sem ganhos de sinergia suficientes ou derrubar patamares sem compensação. É uma heurística de melhora do campo, não simulação de combate ou decisão automática.

A capacidade vem do contador nativo próprio, que já inclui regras especiais. Metadados e flags canPlace/countsForTeam são validados na ponte. Campo/banco inconsistente durante um movimento, capacidade desconhecida, campo alheio e carrossel pausam a sugestão; combate rotula a indicação para a próxima preparação. Sem dados reais, o verificador não inventa peças do guia. Ovos não são sugeridos; Gold Bow não consome vaga. Nenhum comando de mover, vender, comprar ou equipar é enviado.

154 testes aprovados e QA visual local: campo Charmander/Raticate; compra de Poliwag no banco indica Poliwag por Charmander; após a troca a recomendação desaparece; vaga livre e Goomy no banco indicam entrada sem retirada e ganho de Aquático. Lista de peças e aviso recolhido conferidos. Screenshots .cache/verification/board-d051-swap.jpg e board-d051-compact-alert.jpg. Pacote 0.15.0 gerado. Validação dentro da partida do usuário depende de atualizar a extensão e recarregar o jogo após a partida.

## Atualização 0.14.0 — recomendações nas escolhas de equipamento completo

Escolhas como Colete de Assalto / Almofadas Protetivas / Óculos de Proteção agora recebem avaliação mesmo quando nenhum item é o equipamento exato da build. Um item pendente da build mantém prioridade. Alternativas são identificadas como “Fora da build · por atributos”, com destino final e portador atual/provisório. A avaliação usa os mesmos perfis de atributos, habilidade, alcance e limitações do modelo de portadores; não considera adversários não lidos ou promete uma decisão ótima de combate.

O destino alternativo precisa ter vaga no plano final, sem substituir equipamentos da build. O portador atual precisa estar no campo próprio, ter vaga e poder segurar o item. Famílias de outras peças finais continuam protegidas. Sem leitura do campo, o texto identifica explicitamente a hipótese do guia. Campo vazio conhecido mostra “Guarde: sem portador com vaga no campo”, sem usar o guia como se a peça estivesse presente. Equipamento já coberto e ausência de encaixe seguro têm rótulos próprios e não recebem a indicação principal. Componentes, consumíveis, itens desconhecidos e efeitos reservados seguem suas regras anteriores.

145 testes aprovados; QA visual local com os três itens fornecidos, comp Sombrio 5 / Normal 3 e campo simulado com Charmander/Raticate/Graveler. A indicação principal foi Colete para Tyranitar, segurado por Graveler; outras opções exibiram seus portadores. Ao esvaziar o campo, as três etiquetas passaram a orientar guardar. Screenshot .cache/verification/items-d050-complete-offers.jpg. Pacote 0.14.0 gerado; partida real do usuário ainda depende da atualização da extensão e recarga da página após a partida.

## Atualização 0.13.2 — planejador incompatível não bloqueia badges nativas

O diagnóstico da partida confirmou leitura válida do campo e dos seis slots da loja na 0.13.1, mas zero badges. A mensagem “Formato do planejador mudou” identificou o bloqueio: o callback do planejador chamava setShopAllowed(false) também para a leitura direta. Esse acoplamento foi removido. Incompatibilidade e edição manual suspendem somente as escritas no planejador; recomendações nativas continuam seguindo a comp, provisórios, nível e marcas do Helper. Preferências existentes continuam preservadas. Desligar os destaques, fechar e perder a conexão continuam limpando as badges.

O diagnóstico inclui agora estado do planejador, número de famílias alvo e ofertas recomendadas. Mensagens não afirmam mais que as badges foram pausadas por uma edição do planejador.

141 testes aprovados; 81 arquivos com sintaxe válida. Regressões cobrem formato incompatível, edição manual preservada e Pupitar para Tyranitar da comp Sombrio 5 / Normal 3. Reprodução local com Phaser 4.2.1 distribuído, seis ofertas e preferência incompatível: loja read 6/6, planejador incompatible e uma badge no Pupitar. Captura: .cache/verification/shop-d049-pupitar-incompatible.jpg. A correção ainda depende de carregar a 0.13.2 na partida do usuário; atualizar arquivos, recarregar extensão e página após a partida.

## Atualização 0.13.1 — cena no Phaser distribuído e loja independente

Foi confirmada uma premissa incorreta da 0.12.1: `src/core/Game.js` do Phaser 4.2.1 contém `PHASER_GAME`, mas `dist/phaser.js`, importado pelo pacote usado pelo jogo, não contém essa exposição. A simulação anterior criava a variável e não reproduzia essa diferença. Sem tooltip, a descoberta podia ficar esperando até os primeiros diálogos.

O leitor agora pode descobrir a cena durante a iteração dos mapas de objetos renderizados do minigame ou campo próprio. A observação preserva o callback, thisArg, retorno, argumentos e erros do Map.forEach nativo; restaura o descritor original ao encontrar a cena, desligar ou expirar em 500 ms. Só aceita a cena gameScene ativa do canvas exato de #game e um mapa conhecido do gerenciador próprio. A tentativa não consulta a sala, mapas de jogadores, rede ou ações de jogo. A referência de debug e os detalhes DOM continuam como alternativas.

A loja também pode ser lida pelos props do componente nativo de cada card já renderizado. Confere origem shop, índice, tooltip, slots vazios e commit atual do React. Isso permite calcular a badge mesmo sem cena, classe planned ou confirmação do planejador. Não lê store, hooks ou dados de outras telas. Todos os IDs ainda passam pelo catálogo local. As regras de provisórios, nível e peças prontas continuam as mesmas.

O painel inclui “Diagnóstico da leitura”: versões do painel/página/leitor, resposta do plano, ponte, descoberta da cena, slots e badges, portais/símbolos e bloqueio por menu. Os campos são limitados e não incluem IDs pessoais, sala ou objetos nativos. Reverificar loja reinicia também a solicitação do contexto de itens, que agora tem aviso de timeout.

138 testes aprovados. QA local com o dist real do Phaser 4.2.1, sem PHASER_GAME ou tooltip: nove portais, 27 símbolos e uma marca no estágio 0; Poliwag/Goomy com badges na loja inicial. QA separado com React 19.2.6 de produção e nenhuma cena: loja lida, rerender de ofertas acompanhado, guia 6 troca Poliwag por Quaxwell e desligar remove todas as badges. A partida do usuário no Brave ainda não foi validada. Nenhuma permissão nova. Atualize os arquivos da extensão e recarregue a extensão e a página do jogo após a partida; confira versão 0.13.1.

## Atualização 0.13.0 — loja nativa e reserva antes do estágio 5

A badge e o contorno agora podem ser calculados diretamente pelas ofertas do jogador conectado, sem depender da classe planned ou da confirmação do planejador. A leitura exige jogador/campo próprios e correspondência dos índices com os slots renderizados. Usa a família para reconhecer evoluções (ex.: Quaxwell quando Quaxly é provisório do guia). Ao mudar o nível manual do guia ou marcar um alvo pronto, os destaques são recalculados. Campo alheio, oferta desconhecida, slot incompatível, desligamento e perda da conexão limpam as badges. Edição manual do planejador continua pausando os destaques de Pokémon.

A reserva usa a lista nativa de itens do próprio jogador. Renderização parcial/atrasada dos ícones não apaga essa contagem; os sprites só posicionam as etiquetas. A escolha mostra o componente já possuído quando a oferta completa uma receita. O painel informa Reserva lida: N itens e Loja lida: N ofertas, M recomendadas.

Diagnósticos de abas não seguram a fila do worker e têm prazo de 2 segundos. Solicitações do planejador sem resposta saem do estado de conexão em 8 segundos; Reverificar loja pode solicitar novamente. O caminho direto continua funcionando mesmo sem essa resposta. A integração anterior e a restauração do planejador foram preservadas.

134 testes e QA local aprovados. Simulação na etapa 1, sem classe planned e com solicitação do planejador suspensa: Poliwag/Goomy destacados; guia 6 troca Poliwag por Quaxwell; escolha reconhece Carvão na reserva sem ícones e sugere Magneto para completar Luva de Soco. Renderização posterior mostra os pares numerados. Sem permissão nova, OCR, compra automática ou leitura de outro jogador. A inspeção real do Brave foi bloqueada pela validação de URL da ferramenta; confirmação na partida permanece pendente. O screenshot do usuário mostrava 0.12.0. Para aplicar, recarregue extension/dist ou substitua a pasta instalada pelo ZIP 0.13.0, recarregue a extensão e a aba do jogo após a partida.

## Atualização 0.12.1 — portais do estágio 0

A descoberta da cena usa também a referência PHASER_GAME publicada pelo Phaser 4 no boot. Só aceita o canvas de #game, a cena gameScene ativa e a mesma instância de jogo. Assim, o carrossel inicial pode conectar antes de existir qualquer tooltip, diálogo, reserva ou formação. O caminho anterior pelos detalhes continua como alternativa; cenas de lobby, canvas alheio e boot incompleto não são aceitos.

129 testes e QA visual local aprovados. Simulação começou no estágio 0 com nove portais, nenhum detalhe nativo aberto e nenhuma reserva; uma badge apareceu para o portal compatível com Goomy/Sligoo e sumiu após a entrada própria. Jogo real no Brave ainda requer validação. Nenhuma permissão nova. Atualize os arquivos/recarregue a extensão e a aba do jogo após a partida; confira Extensão 0.12.1.

## Atualização 0.12.0 — marcações, escolhas e ordem das receitas

As etiquetas da reserva usam posicionamento próprio em cada elemento, sem depender de um bloco de CSS dentro da página. Componentes recebem o mesmo número quando pertencem à mesma receita; “O que juntar primeiro” mostra os pares e prioriza receitas completas. O tooltip informa quem segura agora no campo e o destino final, com fallback do guia explícito. Mudanças de portador atualizam também o tooltip já aberto. Uma geometria temporariamente inválida não descarta a reserva inteira.

A escolha de Pokémon com item considera o item anexo. Únicos e outras recompensas consideram alvos pendentes da equipe final e patamares do campo próprio, incluindo itens de tipo, famílias repetidas e banco. A projeção é condicional à entrada da peça, sem decidir quem vender nem presumir vaga livre. Só a primeira recompensa já visível é lida; duos sem identificador canônico usam apenas a afinidade dos ícones visíveis. Os portais também consideram apoio aos tipos atuais, sem prometer o resultado do sorteio.

Ao perder o contexto após atualizar/desligar a extensão, o host interrompe as chamadas antigas, limpa badges e restaura o planejador anterior quando ainda pertence ao Helper. Um aviso pede recarregar a página do jogo. Isso não reconecta automaticamente scripts que o navegador invalidou. Depois da partida, atualize a extensão e recarregue Helper/jogo; confira Extensão 0.12.0. Se usa uma pasta extraída diferente de extension/dist, substitua seus arquivos pelo novo ZIP. Nenhuma permissão nova. 126 testes e QA visual local aprovados: etiqueta alinhada mesmo sem stylesheet inline, detalhes nativos preservados, portador mudando com o campo, recompensa pelo item/alvo/patamar e limpeza após invalidação. Validação na partida real do Brave permanece pendente.

## Atualização 0.11.0 — portadores temporários dos itens

O painel agora tenta ler sua própria formação dinamicamente. Em Use agora no seu campo, mostra qual item equipar, quem segura agora e para quem vai depois, com motivo e vagas disponíveis. Banco é separado do campo. Evoluções, trocas e equipamentos atualizam a indicação; o modelo usa atributos/alcance/habilidade, sem simular a batalha.

Um equipamento já no provisório aparece como Já está com, sem pedir outra cópia. Quando a família definitiva entra com vaga, aparece a transferência pendente. Equipar, retirar e transferir são manuais. Pela regra padrão, muitos itens só voltam ao vender o portador; o painel pede aguardar reposição. Itens removíveis indicam voltar ao banco. Não orienta vender outra peça da comp final para recuperar equipamento. Monte a receita na reserva antes de equipar componentes em provisórios.

Sem leitura de campo, usa o guia do nível selecionado com aviso condicional; confirme peças e vagas. Se a reserva estiver conectada, usa os equipamentos que você realmente tem. Campo vazio/só banco detectado não é substituído pelo guia. Nível continua manual.

Após a partida, recarregue a extensão e a aba do jogo. Se usa outra pasta extraída, substitua os arquivos pelo ZIP novo antes. Confira Extensão 0.11.0. Se aguardar conexão, abra detalhes nativos de um item/Pokémon. 117 testes e QA local simulado aprovados; confirmação na partida real do Brave pendente. Sem permissão nova, OCR ou envio de campo/inventário ao backend. As versões abaixo são histórico.

## Atualização 0.10.0 — carrossel e portais

- Itens: somente uma oferta recebe Prioridade com insígnia dourada. Alternativas da build têm marca discreta sem logo; reserva desconhecida fica explícita. Cópias iguais não multiplicam a prioridade.
- Portais: uma badge Portal sugerido indica afinidade com os alvos pendentes da comp. Painel/tooltip mostram símbolos, etapa e Pokémon favorecidos. Etapa 10 oferece Únicos; 20 Lendários. Os tipos orientam o sorteio, não garantem o Pokémon. Região e regras especiais podem mudar ofertas.
- Usa tipos nativos da forma obtida antes de evoluir, sem tipos concedidos por equipamentos. Marcar como pronto retira aquele alvo. Sem etapa reconhecida, mostra apenas afinidade geral. Depois de entrar no portal, a indicação termina com a animação nativa do seu avatar.

Após a partida, recarregue a extensão existente e a aba do jogo. Se usa outra pasta extraída, substitua antes pelos arquivos do novo ZIP. Confira Extensão 0.10.0 no painel. Se aguardar conexão, abra detalhes nativos de um item/Pokémon. Continua sem permissões novas ou ações automáticas. 107 testes e QA visual local aprovados; confirmação na partida real do Brave ainda pendente.

A fonte interna do jogo pode mudar. Leitura restrita aos sprites/símbolos públicos renderizados do minigame próprio e etapa visível; não acessa estado privado da sala nem prevê resultado do sorteio. As versões anteriores abaixo são histórico.

## Atualização 0.9.0 — itens e menus

- Carrossel deixa de depender da leitura da reserva. Itens livres continuam como Da build quando sua reserva está indisponível, sem presumir posse.
- Escolha de itens diferencia uma sugestão principal e alternativas. Prioriza equipamento pendente pronto ou componente que completa uma receita com sua reserva; não representa uma estratégia ótima.
- Na reserva, a etiqueta mostra o Pokémon de destino. Passe o mouse para ver o que combinar, o equipamento resultante e o destinatário; a mesma receita aparece no painel.
- Painel e badges cedem aos menus de escolha/diálogos do jogo e retornam depois. O botão nativo Mostrar/Esconder fica livre; caso conflite com o painel, este aguarda o espaço ficar disponível.

Após a partida, recarregue a extensão existente e a aba do jogo. Se usa outra pasta extraída, substitua os arquivos pelo ZIP novo antes. Confira Extensão 0.9.0 no painel. Se aguardar conexão, abra detalhes nativos de um item ou Pokémon; o GameDialog também serve de ligação quando disponível. 100 testes e verificação local com objetos simulados aprovados; execução no Brave/partida real ainda precisa confirmação. Mecânica de loja/backup de 0.8.1 preservada, sem permissões adicionais.

As instruções de versões anteriores abaixo são histórico; 0.9.0 substitui os antigos rótulos Guardar/Montar/Equipar na reserva pelo destinatário e pela explicação ao apontar.

## Atualização 0.8.1 — loja que perdeu a atualização inicial

Corrigida a falta de reapresentação quando a loja monta/remonta após o plano ter sido enviado. Notificação repetida depois da montagem/atualização de ofertas, também no contexto MAIN da página. Continua usando o planejador nativo, com backup e pausa após edição manual. Sem compras automáticas ou permissões novas.

Após a partida, recarregue a extensão existente e as abas do Helper/jogo. Se usa ZIP extraído em outra pasta, substitua seus arquivos pelo pacote atualizado primeiro. No controle Destacar Pokémon e itens deve aparecer Extensão 0.8.1. Há um botão Reverificar loja para solicitar atualização imediata; ele respeita pausas por edição manual.

Reprodução local anterior deixou Goomy sem planned; corrigida marcou Goomy e, após atualizar ofertas, Poliwag/Goomy. 96 testes aprovados, incluindo assinante tardio, preservação do backup/conflito e proteção contra loop. A execução no Brave/partida real ainda precisa confirmação. Se continuar sem marcar, a mensagem abaixo do checkbox distingue desligado/conflito/incompatível/erro de plano atualizado sem marcação.

## Atualização 0.8.0 — carrossel, reserva e receitas

Recarregue a extensão existente e a aba do jogo fora da partida. Se usa ZIP extraído, substitua os arquivos antes. Controle Destacar Pokémon e itens liga as duas assistências; fechar/desligar limpa as marcações. Recolher mantém ativo.

Abra os detalhes de um item ou Pokémon dentro da partida para ligar a leitura nativa de itens. Até isso acontecer, o painel informa que aguarda conexão e não presume o que você tem. Ligação depende de contrato interno do Phaser verificado na revisão do jogo 6.11.1; atualização futura pode exigir ajuste. Teste no jogo real ainda pendente.

- Pegar: item livre do carrossel útil para uma receita/equipamento pendente.
- Guardar: componente da reserva alocado a uma receita ainda incompleta.
- Montar: componentes na reserva suficientes para uma receita.
- Equipar: equipamento já pronto na reserva.

Receitas e destinos, no próprio overlay, mostra destinatário, receita canônica, falta e itens já equipados. Contabiliza cópias sem reutilizá-las e não pede novamente equipamento já resolvido. Marcar Pokémon pronto não marca seus itens como prontos. Itens equipados em outra família não são considerados disponíveis. Escolhas HTML de itens também recebem recomendação; antes da conexão indicam somente Da build.

Somente própria reserva/equipe e itens livres visíveis são lidos; campo alheio/espectador pausa. Sem screenshots, OCR, sockets, credenciais, comandos, montagem/escolha automática ou envio do inventário a servidor. Snapshots efêmeros ficam na aba/painel; nenhuma permissão extra. Conflito no planejador pausa os Pokémon; itens continuam seguindo a comp, conforme mensagem. D039 detalha fonte e falha segura.

## Atualização 0.7.0 — provisórios do nível + contorno

Badge e contorno amarelo agora indicam famílias finais ainda pendentes e provisórios da base do nível escolhido no overlay. Ao avançar o nível no guia, provisórios que saírem da base deixam de ser procurados; os atuais entram. A mesma lógica mostrada no guia calcula os destaques. Atualize manualmente seu nível no guia: não há leitura do nível real da partida. Marcas prontas retiram vagas finais como antes.

O planejador nativo recebe uma lista de compras com finais + provisórios, que pode ultrapassar a quantidade de peças em campo; a formação correta está no guia. Desligar restaura o plano anterior, preservando edições nativas. Mesmo tamanho/logo/relevo da badge. ZIP reconstruído; recarregue a extensão 0.7.0 e Helper/jogo fora de uma partida. Se instalou por ZIP extraído, substitua seus arquivos primeiro.

## Atualização 0.6.5 — nova redução da badge

Badge 36 × 41 px no desktop, 30 × 34 px em viewport estreita, mantendo logo e relevo. ZIP reconstruído; recarregue extensão/jogo para aplicar.

## Atualização 0.6.4 — insígnia menor

Redução de cerca de 20%: 46 × 52 px no desktop, 38 × 43 px em viewport estreita. Mantém o canto esquerdo, a logo e o relevo. Pacote reconstruído; recarregue a extensão e o jogo para aplicar.

## Atualização 0.6.3 — badge encaixada no cartão

Insígnia mais baixa no canto superior esquerdo, parcialmente sobre o retrato, preservando sinergias à direita. Logo, relevo e tamanho mantidos. ZIP atualizado; recarregue a extensão e a página do jogo para aplicar.

## Atualização 0.6.2 — insígnia hexagonal com nossa logo

Marca maior (58 × 66 px, 48 × 54 px em viewport estreita), hexágono metálico com bisel/espessura e logo original. Substitui o carrinho de 0.6.1, sem alterar reconhecimento ou controle. O painel deixa espaço para as novas insígnias acima da loja. ZIP atualizado; recarregue a extensão instalada e a página do jogo para aplicar.

## Atualização 0.6.1 — insígnia de compra

Substitui a faixa DA SUA COMP e o contorno adicional por um pequeno medalhão dourado com carrinho no canto superior direito. Ícone local, sem texto/animação e sem capturar cliques. Reconhecimento, controle e backup de 0.6.0 preservados. Recarregue a extensão e o jogo para aplicar; se usa ZIP extraído, substitua os arquivos pelo pacote atualizado antes.

## Atualização 0.6.0 — D032: destaques nativos da loja

Importar a equipe pelo botão amarelo ativa **Destacar minha comp na loja** no painel do jogo. O Helper preenche o planejador nativo com a variação final; o próprio jogo compara famílias (por exemplo, Magikarp para Gyarados) e atribui planned às ofertas. Uma moldura dourada e a badge DA SUA COMP identificam esses cartões. A leitura é de classes do DOM da loja, sem imagens/OCR, sockets ou compras automáticas. Não há backend novo nem permissões novas.

Marcar uma vaga como pronta retira esse alvo; outra vaga pendente da mesma família continua sendo procurada. Provisórios do guia não entram como alvos. Recolher mantém os destaques; fechar restaura o plano anterior e reabrir os reativa. O posicionamento inicial fica acima da loja, preservando posições arrastadas pelo usuário.

O valor anterior de team_planner é preservado no backup local pokechess-native-planner-v1. Desligar restaura o valor exato se ele ainda pertencer ao Helper. Se você editar o planejador no jogo, a integração pausa sem sobrescrever sua edição; desligue/ligue para assumir novamente esta comp, agora preservando sua nova edição. Múltiplas abas do jogo compartilham essa preferência. Desligue os destaques antes de remover/desativar a extensão; código desativado não consegue executar restauração, mas o backup fica local para recuperação ao reativar.

Estado antigo migra desligado. Reimporte uma comp ou ative o checkbox. Recarregue a extensão existente em brave://extensions; se usa uma pasta extraída de ZIP, substitua os arquivos por site/downloads/pokechess-overlay.zip atualizado antes. Atualize Helper e jogo fora de uma partida. Não precisa reinstalar nem conceder novos acessos.

Diagnóstico distingue plano preparado, loja detectada, contagem de cartões com marcação nativa, conflito e falha de armazenamento. Plano preparado não comprova execução do leitor do jogo. A integração depende de um contrato interno verificado no código oficial fixado em D032; alterações futuras exigem revisão. QA local não comprova execução na sua partida real. Nesta sessão o Brave não está disponível no inventário de navegadores conectados.

## Atualização 0.5.0 — D031

Controles usam SVGs locais Lucide. Evoluções mostram Evoluir e receita; substituições usam faixas compactas vermelha/verde. Bases intermediárias só incluem obtenções especiais após você marcar a forma como pronta na equipe superior. Nível não comprova um portal ou eclosão. Referência final e condições preservadas.

Build/ZIP atualizados. Recarregue se usa extension/dist; se usa outra pasta extraída, substitua pelos arquivos do ZIP atualizado antes de recarregar. Atualize Helper/jogo fora de partida. Nenhuma permissão nova. SVGs/licença/origens incluídos no pacote; para refazer o cache, node tools/cache-ui-icons.mjs. Verificação local/iframe não comprova execução da extensão instalada no jogo.

## Atualização 0.4.1 — D030

Corrige vagas intermediárias e a identificação das trocas. Guia estende o campo anterior e mostra Sai → Entra com retratos para toda substituição/evolução, incluindo provisórios. Adições isoladas ficam somente na equipe exibida. Níveis 2–8 conferidos nas 778 variações; referência final preservada.

Build já gerado. Recarregue se instalou extension/dist; se usa pasta extraída, substitua pelos arquivos do ZIP atualizado antes de recarregar. Depois atualize Helper e jogo fora de partida. Sem novas permissões. Validação local/iframe não comprova execução da extensão instalada no Brave.

## Atualização 0.4.0 — D029

Guia orientado à variação final: níveis iniciais combinam linhagens e sinergias, há evoluções condicionais, trocas e famílias para guardar; nível 9 mostra a equipe exata (capacidade extra explicitada quando necessária). Chances/picos são da tabela da versão e metas não significam peças já obtidas. Sem permissões novas.

Pacote atualizado em extension/dist e site/downloads/pokechess-overlay.zip. Se instalado de dist, recarregue a extensão; se instalado de uma pasta extraída, substitua seus arquivos pelo ZIP atualizado e recarregue. Depois atualize Helper/jogo fora de partida. Detalhes do modelo e limites em planejamento/17 e D029. Versões anteriores abaixo ficam como histórico.

## Atualização 0.3.0 — D028

Retratos preenchem as casas, itens aparecem na base de cada peça e guia por nível fica dentro do overlay. Níveis 2–9 mostram ação, base/provisórios, evolução/cópias, chances e economia; usa as mesmas regras do guia completo. Nível e peças prontas persistem/sincronizam com a seleção. Guia é sugestão, não um histórico de compra dos jogadores.

Painel expandido limitado a 640 px/altura disponível; cabeçalho/equipe permanecem visíveis e o corpo rola. Abrir O que procurar não aumenta o quadro. Recolhido: 150 px. Os recursos e as regras são locais, sem depender do servidor do Helper após importar. Não há permissões novas.

Para aplicar na pasta dist já instalada: npm run extension:build (já executado nesta entrega), Recarregar a extensão no navegador e atualizar Helper/jogo fora de partida. Se usa ZIP extraído em outra pasta, substitua pelos arquivos do ZIP novo antes de recarregar. Verificação: 60 testes e UI/scroll do pacote em iframe local com APIs simuladas; execução real no jogo não foi verificada nesta etapa.

## Atualização 0.2.0 — D027

O overlay agora aparece no Helper pela própria aplicação e no jogo por esta extensão, incluindo lobby/salas. O Helper não depende da extensão para mostrar a equipe. Na página do jogo, o atalho PokeChess permite escolher composição ou reabrir o painel; outras páginas não recebem nada. Diagnóstico no Helper distingue aba aberta, script conectado e painel pronto. Seleção e marcas acompanham a mesma equipe; fechar/recolher são independentes.

Se já instalou usando `extension/dist`, abra `brave://extensions`, encontre PokeChess Helper e clique Recarregar para usar 0.2.0. Recarregue Helper e jogo fora de uma partida. Se instalou um ZIP extraído em outra pasta, baixe o ZIP novo no Helper, substitua os arquivos dessa pasta e recarregue a extensão. Não é necessário reinstalar quando a pasta carregada permanece a mesma.

Permissão de host em 0.2.0: somente `https://pokemon-auto-chess.com/*`, para consultar as abas desse jogo e enviar o estado/diagnóstico. Sem permissão tabs ampla, histórico, cookies ou acesso a outros sites. API storage continua sendo a única permissão geral. Não há leitura da loja. O texto histórico abaixo sobre painel vazio/escopo somente-jogo foi substituído por este fluxo.

Humano confirmou extensão instalada. A atualização foi empacotada e passou 58 testes locais; Helper verificado no navegador IAB. A ferramenta nativa continuou sem conseguir determinar a URL do Brave; a versão carregada e a exibição real no jogo ainda precisam de verificação. Primeiro use Verificar conexão no Helper e procure o atalho PokeChess no lobby após recarregar.

Manifest V3 para Brave/Chrome/Edge desktop. Exibe o painel somente em `https://pokemon-auto-chess.com/*`, no documento principal. Trocar para outra aba esconde naturalmente o painel porque ele faz parte da página do jogo. Não usa Picture in Picture nem janela global. Se existirem várias abas do jogo, todas acompanham a mesma equipe.

## Ativar no Brave

1. Execute `npm run extension:build` na raiz, se precisar regenerar o pacote.
2. Abra `brave://extensions` no perfil em que joga.
3. Ative Modo do desenvolvedor e escolha Carregar sem compactação.
4. Selecione a pasta `C:\Users\Lucas\Documents\Study\PokeChessHelper\extension\dist`, que contém `manifest.json`.
5. Recarregue o Helper e a aba do jogo quando não houver uma partida em andamento. No Helper, escolha a variação e clique no botão amarelo. A confirmação aparece apenas após a extensão salvar a seleção.

No Chrome/Edge, use `chrome://extensions`/`edge://extensions`. Alternativamente baixe `site/downloads/pokechess-overlay.zip`, extraia e carregue a pasta extraída. O ZIP também está disponível no painel de configuração das composições.

Fechou o overlay? Na aba do jogo, clique no ícone desta extensão para reabri-lo. Pode recolher, mover pelo cabeçalho/setas, marcar peças prontas e trocar a variação. Abrir o jogo sem uma equipe importada não cobre a interface com um painel vazio. O Helper precisa estar no mesmo navegador/perfil da extensão para enviar a seleção. O painel já importado não depende do servidor local continuar aberto.

## Escopo e dados

Permissão de API: somente storage. Scripts visuais apenas no domínio HTTPS exato do jogo; ponte sem painel apenas em `http://127.0.0.1:4173/` ou `http://localhost:4173/`, caminho raiz/index.html. Sem `<all_urls>`, cookies, histórico, captura de tela, abas amplas, scripting API, código remoto ou acesso ao JavaScript interno do jogo. O script monta seu host/iframe e observa somente a loja do DOM para acompanhar a classe nativa planned. A escrita no jogo se limita à preferência team_planner e seu backup local. Fullscreen usa o evento padrão para recolocar o host no elemento em tela cheia.

O serviço valida origem, extensão, quadro, tipo de mensagem e referência ao pacote. Grava apenas equipe selecionada, marcações manuais e preferências em chrome.storage.local, separadas dos dados do jogo. Mensagens de atualização são serializadas. O iframe isolado reutiliza renderer/CSS do Helper e imagens locais. Destaques são reconhecidos pelo planejador nativo, sem ler o inventário, comprar automaticamente ou fazer login. Uma versão publicada do Helper exigirá atualizar explicitamente a lista de origens permitidas.

## Atualizar e verificar

`npm run extension:build` gera dist, planos das equipes e ZIP sem dependências adicionais; `build.json` registra snapshot, tamanho e SHA-256 dos recursos. Atualização de snapshot exige reconstruir/recarregar a extensão. Referências não presentes no pacote são recusadas, sem escolher outra composição. Arquivos de apresentação/vídeo e dados pessoais não entram no ZIP.

`npm run check` inclui os fontes da extensão e ignora dist; `npm test` cobre protocolo, escopo, estado, duplicatas, pacote/recursos e as equipes. Para testes a partir de uma instalação nova, prepare o snapshot/assets conforme planejamento/15 e execute o build da extensão primeiro.

Validação real pendente: atualizar a extensão já instalada no Brave, importar, abrir uma partida, conferir as badges ao renovar a loja e testar desligar/restaurar. Em D032 somente o navegador interno do Codex estava conectado; Brave não disponível para inspeção direta. Nenhuma instalação foi feita automaticamente. A simulação local não comprova execução no jogo.

Base oficial: [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [recursos acessíveis](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources). Recursos Pokémon/dados mantêm seus titulares e proveniência; `build.json` referencia o snapshot do Helper. Distribuição pública/lojas de extensões não realizada.
