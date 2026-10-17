# Pendências e riscos

## Portadores após D044 — extensão 0.11.0

Implementada leitura própria da formação/preparação e orientação de itens em provisórios, com fallback condicional pelo guia. Validar na extensão real do Brave: campos id/posição/estrelas da revisão publicada, transições pick/battle/town, evolução/fusão, venda/devolução, entrada de definitivo, visita de campos, reconexão/CSP. QA atual é simulado, 117 testes aprovados. Afinidade é heurística por dados estáticos, não otimizador; habilidades/regiões/regras especiais/itens transformadores podem exigir curadoria. Banco não é candidato ativo; itens em outra peça final não autorizam vendê-la. Retirada padrão varia entre removíveis e venda. Manter itens/campo efêmeros e restritos ao próprio jogador.

## Portais após D043 — extensão 0.10.0

Assistência implementada/testada localmente: símbolos agrupados por portal, etapa visível, afinidade por forma obtida/método e retirada de alvos prontos; uma prioridade de itens com alternativas discretas. Validar na instalação real do Brave: formação/movimento dos símbolos, etapa 0/10/20, retirada após entrada própria/alheia e retorno de menu/partida. Sem chance calculada ou garantia de oferta, sem simulação regional/regras especiais; estas podem mudar o resultado. QA é simulado. Requer referência nativa/cena ativa e avatar próprio renderizado; nenhuma sala/socket privado é acessado. Não inferir que todos Pegar na screenshot confirma uma falha do pacote 0.9.0: versão e causa não foram observadas.

## Itens após D042 — extensão 0.9.0

Resolvidos localmente: carrossel acoplado à reserva, destinatário/receita pouco claros e camadas sobre menus. Validar na instalação real do Brave: carrossel em rodadas consecutivas, menu de itens/Únicos, ocultar/mostrar escolha, alinhamento ao mover/zoom/fullscreen e nome/receita por cópia da reserva. 100 testes/QA simulado não comprovam execução no jogo publicado. Referência nativa ainda necessária; GameDialog amplia a descoberta, sem garantir todos os estados de uma versão futura. Prioridade é progresso de receita, não estratégia validada por especialista. Dados continuam efêmeros e inventário alheio não é lido. D042 substitui limpeza de todo carrossel por reserva indisponível mencionada no histórico D039.

D041: imagem humana comprova ausência de destaque no Goomy com controle ativo. Corrigida e reproduzida uma lacuna de sincronização por montagem tardia da loja; não foi comprovada a causa específica na instalação real, nem recebida a mensagem abaixo do checkbox. Confirmar pacote 0.8.1 no Brave após recarga, notificação entre mundos, reroll/compra/remontagem e recuperação manual. Botão Reverificar não deve superar conflito. Não voltar a declarar que testes locais comprovam marcação na partida.

## D039 — Validação real dos itens pendente

Implementado leitor local da própria reserva/equipamentos e sprites livres do carrossel por DOMElement.phaser; supera a ausência de leitura de inventário dos registros históricos abaixo somente nesse escopo. Nível/etapa/PV/ouro/cópias de Pokémon não são detectados. Ver D039/18/22 para fonte e limites.

Confirmar na versão 0.8.0 recarregada no Brave: acesso MAIN sob CSP, criação de detalhe nativo, propriedade durante visita de campos, zoom/pan/fullscreen, animação/claim do carrossel, equipar/montar/consumir itens e reconexão de cena. QA atual usa cena simulada com os mesmos contratos, não a partida. Novo patch/IDs desconhecidos falham sem presumir posse. Vinculação exige abrir detalhes nativos e não funciona só pela existência do lobby. Alocação é determinística por ordem da build, sem inferir prioridade estratégica ou remover equipamentos de outras famílias. Sem envio de inventário para backend e sem automação de seleção/compra/montagem.

D038: integração de provisórios implementada por nível selecionado manualmente no guia. Ler nível real/inventário/cópias continua pendente; não prometer atualização automática pela partida. Lista nativa é união de compras, não o campo simultâneo. Mecânica/isolamento/backup mantidos; validar na extensão instalada no Brave.

## Destaques nativos da loja — D032

Integração local 0.6.0 implementada por team_planner/planned, substituindo a ausência de integração dos registros históricos abaixo. Confirmar no jogo real após recarregar a extensão instalada e as abas fora de partida: CSP, eventos entre mundos isolados, versão publicada do planejador, badges em ofertas novas, compra manual e restauração. Navegadores conectados em 16/10: somente Codex In-app Browser e MCP Apps; Brave indisponível para inspeção nesta sessão. Iniciar partida sozinho não conecta o navegador à ferramenta. Contrato é interno e pode mudar; diagnóstico zero não prova reconhecimento. Preservar backup e não sobrescrever edições nativas. Se remover/desativar a extensão antes de desligar, restauração depende de reativá-la. Inventário/etapa/cópias continuam sem leitura automática.

## Correção de aquisição — D031

Removida a inclusão por nível de únicos/lendários e demais obtenções especiais na base. Confirmação manual de posse obrigatória antes do nível final; a referência final permanece condicional. Etapa real, inventário/ofertas e eventos não são lidos pelo Helper. Curadoria estratégica, 78 rotas em revisão e validação da extensão instalada no Brave/jogo continuam pendentes. Não voltar a inferir aquisição de portal pelo nível.

## Progressão após D029 — 16/10/2026

Resolvido o desvio de iniciais/provisórios no nível 9; as 778 variações convergem à referência. Restam revisão estratégica por especialista, 78 rotas de obtenção em revisão e condições não resolvidas da fonte. O planejador é sugestão editorial por regras/sinergias, sem inventário ou cronograma observado; marcos de especiais não representam desbloqueios. Validação da extensão instalada no Brave/jogo continua pendente; teste de iframe usa APIs simuladas.

## Overlay após D027

Humano confirmou extensão instalada; nova versão 0.2.0 precisa de recarga e validação real no Brave. Helper restaurado e testado sem extensão. Conferir diagnóstico/atalho no lobby e equipe no jogo após atualizar; ferramenta nativa não conseguiu verificar URL mesmo com barra visível. Não pedir nova instalação se a pasta dist já está carregada: usar Recarregar; se veio de ZIP em outra pasta, substituir o pacote. Não há detecção de loja. D027 substitui a restrição somente-jogo anterior.

## Overlay após D026 — ativação pendente

Extensão para mostrar painel somente na aba do jogo preparada/testada localmente e empacotada. Ativar no Brave e validar importação, presença só no domínio exato, troca/retorno de abas, CSP/assets, fullscreen e controles. Automação do navegador foi interrompida por não confirmar URL; nenhuma instalação foi realizada. A dependência de PiP de D025 foi removida do fluxo. Detecção de loja continua pendente e independente; ver extension/README.md e 18-OVERLAY.md.

## Overlay após D025

Importação/painel manual e página independente entregues; integração com a loja permanece pendente. Investigar fonte pública/documentada do estado da partida e regras do jogo antes de escolher extensão/aplicativo/adaptador. Validar Document PiP sobre o jogo no navegador Windows do proprietário; janela comum não garante sempre por cima. Sem detecção de ofertas, marcação automática ou compras nesta etapa. Ver 18-OVERLAY.md.

Estado inicial em 15/10/2026. “Pendente” não significa funcionalidade descartada. Prioridade essencial bloqueia a parte dependente, não a documentação nem o trabalho independente.

Progressão (D014): guia de níveis, probabilidades, economia, XP e receitas implementados conforme [17](17-GUIA-DE-NIVEIS.md). Permanecem pendentes a curadoria estratégica por especialista, 78 rotas de obtenção e três listas de itens condicionais. As janelas de fast level/reroll são sugestões explicadas; os relatórios não comprovam trajetórias por rodada.

Atualização da implementação: P01 tem uma revisão prod declaradamente compatível e validada contra IDs publicados, mas o SHA do deploy não é exposto. P05/P06 possuem validação, cache, snapshots atômicos e recortes locais. P07 tem oito perfis iniciais, com demais funções em revisão. P13 registra IDs divergentes em qualidade; as oito ausências de retrato foram resolvidas usando o mapa oficial do jogo, conforme D018, com zero imagens ausentes no snapshot atual. P15 foi resolvida para o ambiente local com Node/módulos nativos e parser TypeScript fixado. Hospedagem, cadência externa, distribuição e curadoria abrangente seguem pendentes. Evidências em [15](15-AMBIENTE-E-IMPORTACAO.md) e [22](22-STATUS-DO-PROJETO.md).

| ID | Prioridade | Pendência / risco | Próxima ação e evidência necessária |
| --- | --- | --- | --- |
| P01 | Essencial | Identificar revisão do catálogo correspondente à versão publicada | Relacionar release/subpatch e commit; comparar casos conhecidos de 6.11/6.12 |
| P02 | Essencial | Confirmar semântica dos relatórios | Documentar denominadores, winrate, ratio, count, item_count, filtros de Elo e possível sobreposição |
| P03 | Essencial | Acesso técnico não garante contrato de integração | Consultar documentação/condições e alinhar uso recorrente com os mantenedores |
| P04 | Essencial antes de distribuir assets/código | Direitos e créditos distintos | Inventariar fontes, autores e condições de código, dados e imagens |
| P05 | Alta | Schemas e fontes podem mudar | Validar contratos e manter snapshots com proveniência |
| P06 | Alta | Dados grandes e cache antigo | Normalizar no serviço de atualização; medir tráfego e verificar datas de geração |
| P07 | Alta | Funções e builds ainda não estão curadas | Definir taxonomia, critérios, revisão e justificativas por versão |
| P08 | Alta | Exemplos não têm posição comprovada | Sugestão automática identificada implementada em 16; revisão tática de habilidades, auras e adversários continua pendente |
| P09 | Alta | Modo e patch das partidas podem não vir na fonte | Verificar gerador; manter “não informado” quando não demonstrado |
| P10 | Alta para complementos | Regiões, dendrograma, distribuição de ranking e atividade sem prova equivalente | Consultar rotas publicadas, interpretar payload e reproduzir a interface de referência |
| P11 | Alta | Regras exatas do montador | Confirmar tabuleiro, equipe, duplicatas, slots, sinergias, formas e Double Up |
| P12 | Média | Traduções incompletas e placeholders | Mapear sintaxe, interpolação, termos e fallback; comparar com inglês |
| P13 | Média | Divergência de IDs entre catálogo e relatórios | Auditar especiais, formas, registros futuros e sentinelas |
| P14 | Média | Faixas e amostras podem induzir conclusão errada | Metodologia explícita, amostra mínima revisável e ordenações separadas |
| P15 | Antes da implementação | Stack, hospedagem e cadência ainda não escolhidas | Definir arquitetura concreta com custo/limites verificados; registrar decisão |
| P16 | Antes do design final | Identidade, domínio e estilo visual | Definir com foco na leitura e nos ícones existentes; não copiar marca de terceiros |
| P17 | Antes da publicação | Operação, custo e disponibilidade | Validar ambiente próprio, recuperação e condições de publicação |

Não são bloqueios atuais: ausência de acesso direto ao MongoDB e ausência de login no Helper. As fontes públicas permitem avançar na base de consulta e na validação dos dados.

Fora do escopo definido: automação no jogo, informações ocultas, integração com contas pessoais, reprodução de replays e overlays em tempo real. Registrar solicitação nova antes de acrescentar essas áreas ao produto.
