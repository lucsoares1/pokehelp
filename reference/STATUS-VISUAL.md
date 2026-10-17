# Status do PokeChess Helper

Atualizado em 15/10/2026. Etapa atual: página local de referência concluída, pronta para revisão visual do proprietário.

## Autorização humana mais recente

Após a documentação e limpeza, o proprietário pediu uma cópia somente da página inicial de TFT do Mobalytics e acrescentou o aside esquerdo como parte da base a reutilizar. A solicitação autoriza os arquivos locais da página e supera o estado anterior de conter somente Markdown. Não autoriza por si exclusão de recursos externos, contratação ou publicação.

Solicitação posterior: corrigir ícones/animações e reproduzir o painel expandido de composições mostrado nas duas imagens. Implementação local concluída nas cinco comps; a expansão anterior continha apenas um resumo e não atendia à referência.

## Entrega atual

- `site/` contém a única página de referência, com cabeçalhos, aside, hero, banner, oito campeões, cinco composições e rodapé.
- Menu lateral compacto/expansível/fixável, navegação mobile, busca local, detalhes, salvamento local de comps e opções de exibição implementados.
- 217 recursos locais, 4.175.530 bytes, com origem e hashes no manifesto.
- Detalhes completos das cinco comps, SVGs originais dos controles, estrelas, raridades, sinergias, nove augments por comp, formação de 28 casas e guia de níveis. Animação de 220 ms com redução de movimento respeitada.
- Servidor estático Node sem dependências de terceiros, restrito a loopback; raiz e `/tft` atendem a mesma página.
- `PRODUCT.md`, `DESIGN.md`, README e [documento 14](../planejamento/14-REFERENCIA-MOBALYTICS.md) registram contexto, execução e limites.
- Planejamento preservado e atualizado. Agora há 18 Markdown dentro de `planejamento/`.

Esta é uma reimplementação visual editável; não é uma cópia do backend do Mobalytics. Os dados ainda são um snapshot de TFT. Não houve integração de dados de Pokémon, autenticação, rastreamento ou rede de anúncios. Links de subpáginas não implementadas abrem o site original.

## Verificação realizada

### Correção dos painéis e ícones — 15/10/2026

| Método | Resultado |
| --- | --- |
| `npm.cmd --prefix site run check` | Sintaxe aprovada em seis módulos/scripts |
| SHA-256 e HTTP HEAD dos recursos | 217/217 hashes corretos e respostas HTTP 200; 139 recursos referenciados pelo componente de comps estão no manifesto |
| Cinco comps abertas no navegador | Todas com sete seções, nove augments, 28 hexágonos e guia próprio de seis ou sete níveis |
| Dark Ritual em 1440×1100 | Painel com 726 px; referência consultada com 725 px; posições e estrelas conferidas |
| Teclado | Enter abre/fecha; estado `aria-expanded` acompanha o botão; conteúdo fechado recebe `inert` e `hidden` |
| Celular 390×844 e tablet 768×1024 | Sem overflow horizontal; detalhes e tabuleiro acessíveis no celular |
| Salvamento local | Ícone/estado preservados após reload; estado de teste removido ao final |
| Compartilhar | Link correto de Dark Ritual copiado e confirmado no clipboard |
| Recursos e console | Nenhuma imagem quebrada ou erro/aviso retornado nas consultas realizadas |

O primeiro verificador de referências tratou a entidade HTML de apóstrofo em `sterak's-gage` como parte do caminho; após decodificá-la, a verificação passou. Durante a preparação, duas unidades invocadas foram inicialmente buscadas no diretório de campeões e retornaram 404; os caminhos foram corrigidos para `summoned-units`, conforme o DOM original. A entrega usa os arquivos corretos e não conserva referências a esses caminhos incorretos.

### Verificação inicial da página (histórico)

| Método | Resultado |
| --- | --- |
| `npm.cmd run check`, dentro de `site/` | Sintaxe de app.js, data.js, server.mjs e script de assets aprovada |
| HTTP local em `http://127.0.0.1:4173/` | 200, HTML UTF-8 |
| Inventário do manifesto | 138 arquivos presentes, tamanho registrado e SHA-256 por arquivo |
| HTTP HEAD de todos os assets locais | 138/138 respostas 200 |
| Estrutura e links dos Markdown | 18 documentos de planejamento; 37 links locais válidos entre os 22 Markdown do projeto; somente uma página HTML |
| Navegador, desktop 1440×1000 | Estrutura visual, oito campeões e cinco comps renderizados; sem overflow horizontal |
| Navegador, tablet 768×1024 | Sem overflow horizontal observado |
| Navegador, celular 390×844 | Grade de duas colunas; menu abre/fecha, navegação fecha o painel e busca local funciona |
| Menu desktop | Expansão/fixação com largura de 210 px e estado acessível atualizado |
| Busca por Ashe / Lux | Retorna somente o campeão correspondente, com estado de comps vazio coerente |
| Detalhes de Moonlit Hunt | Abre/fecha e atualiza `aria-expanded` |
| Salvamento de comp | Estado preservado após reload e removido novamente ao final do teste |
| Mais jogos / configurações | Dropdown abre, Escape fecha; opção de ocultar anúncios aplicada e revertida |
| Imagens após inspeção de cards/comps | Nenhuma imagem quebrada observada |
| Console da página local | Nenhum erro ou aviso retornado na consulta realizada |

As verificações são da página local, não do produto final nem de todas as possíveis combinações de dispositivos. O README contém o comando para reabrir a prévia caso o processo seja encerrado.

Correções durante a verificação: ajustados o tamanho do fundo do hero, o comportamento da busca no cabeçalho mobile e a retirada do aside fechado da navegação assistiva. O primeiro script de HEAD montou URLs incorretas por precedência de concatenação; o verificador foi corrigido e a execução final aprovou os 138 recursos. Não houve falha correspondente de assets na página.

## Pesquisa anterior preservada

Repositório do jogo, relatórios públicos de comps/itens/Pokémon, correspondência numérica com as imagens do proprietário, PNGs e notas de patch foram verificados na conversa. O servidor Pokémon consultado informou 6.11.1 enquanto o master já contém alterações de 6.12. Fontes e limites permanecem em [03](../planejamento/03-FONTES-E-CONTRATOS-DE-DADOS.md) e [04](../planejamento/04-VERSOES-E-PATCHES.md); não há monitoramento ativo.

## Histórico de organização

A etapa documental gerou 17 arquivos Markdown e sua validação aprovou 28 links internos. Quando houve suspeita de exclusão acidental, todos os 17 continuavam presentes. O conteúdo antigo de outro projeto deixou de existir na raiz; uma cópia de recuperação havia sido criada fora do projeto e conferida por SHA-256 antes da remoção. Esses arquivos e recursos não foram reutilizados.

## Próxima etapa recomendada

Revisar a base visual local e, quando solicitado, adaptá-la ao PokeChess Helper: marca, conteúdo, navegação e dados reais da versão correta. Antes de publicar dados e assets, resolver as pendências essenciais de revisão de release, semântica e condições de uso. O produto completo do planejamento ainda não está implementado ou publicado.
