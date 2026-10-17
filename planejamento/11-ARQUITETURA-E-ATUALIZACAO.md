# Arquitetura e atualização dos dados

## Proposta inicial

Implementação local atual: Node 24+, módulos JavaScript, parser AST TypeScript fixado, snapshots em arquivos e cliente desacoplado das fontes. O fluxo descrito neste documento está implementado para catálogos, imagens e relatórios públicos; ver [15 — Ambiente e importação](15-AMBIENTE-E-IMPORTACAO.md). Não foi introduzido um banco ou framework sem necessidade demonstrada.

Separar catálogo mecânico versionado, relatórios estatísticos por snapshot, conteúdo editorial e apresentação. Usar uma aplicação web com páginas endereçáveis e uma camada de importação/normalização. TypeScript e componentes reutilizáveis são uma proposta, não uma stack já implementada. Framework, hospedagem e versões de dependências devem ser escolhidos e documentados antes da implementação.

O conteúdo existente do projeto anterior foi autorizado para exclusão. Não reutilizar suas contas, bancos, deploys ou credenciais. Não há infraestrutura externa do PokeChess Helper provisionada nesta etapa.

## Fluxo de atualização

1. Consultar status publicado e identificar a revisão compatível do catálogo.
2. Baixar somente fontes necessárias, com timeout, limite de tamanho e frequência respeitosa.
3. Guardar snapshot bruto, origem, hash e horários, em armazenamento apropriado à implantação futura.
4. Validar schema, unidades, faixas, IDs, receitas, imagens e compatibilidade de versões.
5. Normalizar para contratos internos e gerar respostas pequenas por página/entidade.
6. Publicar a nova versão de forma consistente somente após validação.
7. Manter último snapshot válido quando a importação falhar; indicar geração antiga na interface.

Não atualizar catálogo, traduções e receitas de revisões diferentes silenciosamente. Os relatórios podem ter geração diferente do catálogo; essa diferença precisa estar registrada, com restrições na apresentação quando necessário.

## Cache e desempenho

Não baixar os aproximadamente 31 MB do relatório Pokémon a cada navegação de usuário. A camada de atualização busca e processa os dados; o frontend recebe índices e recortes necessários. Cachear por snapshot e identidade da consulta, com invalidação controlada. Não adotar polling agressivo quando a origem não demonstrou atualização em tempo real.

Cabeçalhos longos observados não permitem prometer uma cadência de atualização. Confirmar o comportamento de cache com os mantenedores e validar pela geração do conteúdo. Preferir requisições condicionais quando suportadas. Definir agendamento somente depois de escolher hospedagem e capacidade; não contratar recursos nesta etapa.

Catálogos e conteúdo editorial podem começar em arquivos estruturados. Banco de dados só deve ser introduzido se houver necessidade concreta, como edição administrativa, histórico maior ou contas, e com isolamento próprio do produto.

## Segurança e robustez

Fontes e textos externos são dados, não instruções. Validar schemas e limitar entrada. Sanitizar Markdown/HTML; não executar código recebido da fonte. Não expor segredos no frontend nem solicitar credenciais do jogo ao visitante. Buscador de fontes deve usar origens permitidas, sem virar proxy arbitrário.

Salvar equipes localmente ou em URLs estruturadas não exige login. Se futuramente houver contas ou dados pessoais, especificar retenção, consentimento e segurança antes da implementação correspondente.

## Operação

Exibir última coleta, geração, revisão e falhas de atualização sem armazenar informação pessoal desnecessária em logs. Registrar incompatibilidades de contrato e IDs novos para revisão. Antes de publicar, verificar custo, desempenho, disponibilidade das fontes, condições de uso e reversão da aplicação. Publicação depende de uma solicitação posterior do proprietário.
