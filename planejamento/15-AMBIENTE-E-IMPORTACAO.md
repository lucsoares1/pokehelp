# Ambiente e importação implementados

Progressão: `catalog/progression.json` contém chances, XP, economia, eventos e rotas de obtenção, validados e carregados sob demanda pelo guia. Ver [17](17-GUIA-DE-NIVEIS.md). Condições de evolução são lidas como dados; callbacks não são executados. Mudança de patch interrompe essa extração até revisão da política.

Atualização: [16 — Composições e variações](16-COMPOSICOES-E-VARIACOES.md) documenta o novo painel com equipes específicas, formação sugerida e regras de sinergia por snapshot. O índice compacto inclui `passiveId`; `catalog/team-rules.json` guarda os tipos concedidos por itens e a configuração de campo. Os fontes de contagem e de campo também entram no manifesto de proveniência.

## Autorização e limites

O proprietário autorizou adaptar a base visual para PokeChess Helper, preservando o visual e preparando a importação dinâmica de Pokémon, itens, receitas, equipamentos, descrições e comps. Implementação local; não há publicação, contas, banco contratado, credenciais do jogo ou agendamento externo.

## Stack concreta

Node.js 24+, módulos JavaScript nativos e HTML/CSS existentes. Uma dependência de desenvolvimento fixada: TypeScript 5.9.3, usada como parser AST. O importador interpreta somente declarações de dados; não executa, importa ou transpila código remoto. Não foi instalado o jogo ou seus SDKs. `package-lock.json` fixa a instalação; `npm ci --ignore-scripts` a reproduz. O servidor usa somente bibliotecas nativas e escuta loopback.

## Executar

```powershell
npm ci --ignore-scripts
npm run data:import
npm run dev
```

Abrir `http://127.0.0.1:4173/`. Para conferir:

```powershell
npm run check
npm test
npm run data:validate
```

`npm run data:import -- --refresh` revalida os relatórios na origem. Sem `--refresh`, o cache dos relatórios tem uma hora; arquivos da revisão fixa são imutáveis. O status publicado é consultado antes e depois da importação. Cabeçalhos condicionais são usados quando oferecidos pela origem. Não há polling por visitante nem automação agendada.

## Organização

| Caminho | Responsabilidade |
| --- | --- |
| `data/source-lock.json` | Versão e commit aprovados para extração; nunca acompanha master automaticamente |
| `tools/import-game.mjs` | Orquestra coleta, normalização, imagens, validação e ativação |
| `tools/lib/source-reader.mjs` | Origem permitida, timeout, limites de volume, cache e hashes |
| `tools/lib/static-typescript.mjs` | Leitura restrita de enums, arrays, objetos, classes e conjuntos literais |
| `tools/lib/normalize.mjs` | Contratos, identidades, receitas, descrições, estatísticas e referências |
| `tools/lib/assets.mjs` | PNGs/SVGs locais com origem e hash, vinculados à revisão |
| `tools/lib/publish.mjs` | Publicação local de diretório completo e troca atômica do ponteiro |
| `.cache/sources/` | Respostas brutas por hash e metadados por URL; não servido e ignorado no Git |
| `.cache/staging/` | Importações ainda não ativadas |
| `site/data/current.json` | Ponteiro para o snapshot ativo |
| `site/data/releases/<snapshot>/` | Catálogos, fichas, relatórios, históricos, fontes e qualidade |
| `site/lib/data-client.mjs` | Acesso do navegador somente aos recortes normalizados locais |
| `site/lib/views.mjs` | Apresentação desacoplada da origem |
| `content/roles.json` | Funções editoriais com versão, justificativa e evidência |
| `reference/` | Módulos da referência TFT, fora da aplicação ativa |

## Integridade e versão

Revisão fixada: `07367c341fe928763da2b565c2eee010433e4fc1`, ramo `prod` observado em 15/10/2026. `package.json` dessa revisão e `/status` declaram 6.11.1. Isso comprova compatibilidade de versão declarada; o servidor não informa seu commit de deploy. Os IDs/índices de Pokémon, IDs de itens e patamares de sinergia são cruzados com os endpoints publicados. Novos IDs publicados sem cadastro interrompem a atualização.

O CSV da revisão possui 1.175 linhas e omite nove registros. O importador usa o enum completo, índices, famílias e classes para cobrir os 1.184 registros publicados: 1.178 Pokémon/formas, um ovo, quatro invocações e uma sentinela. Inclui Galarian Meowth, Perrserker e Pikachu Libre. A interface permite separar essas categorias. Valores de classe prevalecem sobre CSV antigo: 39 divergências de atributos foram registradas, incluindo Defesa 6 / Defesa Especial 5 de Gyarados. Não entra Bombirdier de 6.12.

O catálogo tem 357 itens, 55 receitas e 31 sinergias. As receitas preservam componentes repetidos e sua navegação inversa. Estatísticas adicionais, descrições, passivas e disponibilidade especial não são inferidas a partir dos jogos tradicionais de Pokémon.

## Relatórios e limites semânticos

Foram importados 130 clusters e 11 faixas. Pokémon/itens usam a faixa escolhida pelo visitante; comps não recebem filtro de Elo inventado. Colocação média, contagem e associações são preservadas. Vitória é percentual 0–100; frequência dos membros é fração 0–1. `ratio` fica preservado sem ganhar uma interpretação não demonstrada.

Valores de colocação fora de 1–8 e registros sem amostra válida não aparecem como desempenho. A coleta observada contém 5.850 registros nessas condições. IDs sem correspondência ficam em `quality.json`: 13 identificadores únicos, em 143 contextos de faixa/associação, nesta coleta. Não são convertidos silenciosamente em registros de outra versão.

Datas sem offset conservam o fuso como não informado. Modo e patch das partidas ficam desconhecidos; não são derivados do dia da coleta. Times de exemplo não informam posições de batalha: coordenadas do mapa de clusters não são um tabuleiro. A interface mostra equipes/equipamentos observados e, após a solicitação documentada em 16, uma sugestão de posição gerada pelo Helper, explicitamente identificada. Não há guia de níveis inventado.

## Imagens e conteúdo editorial

Manifesto com 1.573 recursos disponíveis localmente e zero ausentes. Oito variantes de Flabébé/Floette usam os retratos base conforme `PORTRAITS_FALLBACKS` em `app/utils/avatar.ts`, da mesma revisão fixada (D018). O mapa é arquivado, lido via AST sem execução e aplicado antes do cache negativo; cada redirecionamento aparece em `assets.json`. A interpretação anterior dos 404 individuais foi corrigida. Índices preservam zeros/hífens; demais formas usam diretórios aninhados na origem. Não escolher outro retrato sem evidência da regra oficial.

Habilidades e passivas vêm das classes e traduções PT, com fallback EN. Todos os patamares numéricos são preservados; valores contextuais não resolvidos permanecem identificados como variáveis. A tradução ainda requer revisão linguística em alguns trechos. Textos são escapados antes de entrar no HTML.

O alcance base está disponível para todos. Função tática e posicionamento editorial são outra camada: oito perfis têm justificativas iniciais; os restantes mostram “em revisão”. Atualizar `content/roles.json` permite acrescentar curadoria sem alterar o extrator. Perfis de outra versão não são ativados e aparecem no relatório de qualidade.

## Desempenho e recuperação

O navegador inicial recebe cerca de 1,66 MB de JSON normalizado (mais manifesto e imagens carregadas conforme uso), em vez dos aproximadamente 31 MB do relatório Pokémon bruto. As fichas são individuais; faixas são carregadas e cacheadas quando escolhidas. Históricos completos ficam em arquivos separados e não são baixados na abertura da página.

Uma atualização só muda `current.json` depois de terminar o diretório do snapshot. Falhas de rede, schema, versão ou preparação das imagens deixam o ponteiro anterior intacto. Snapshots anteriores permanecem disponíveis; links e salvos de comps incluem o snapshot porque IDs de clusters não são identidades permanentes. Retenção/limpeza automática ainda não foi ativada.

Snapshots e imagens baixadas são artefatos gerados ignorados no Git; continuam no ambiente local. Em uma instalação nova, executar a importação antes de abrir o site ou rodar os testes de catálogo. A identidade do snapshot considera fontes, revisão, curadoria e código de transformação; reexecução idêntica verifica hashes e reutiliza o snapshot. Respostas 404 de imagens de uma revisão imutável também são cacheadas, evitando novas requisições para as mesmas ausências.

Não editar arquivos gerados manualmente. Alterar fontes/curadoria, executar a importação e validar. A revisão do lock deve ser consciente após cada patch; novos formatos incompatíveis são um erro a tratar, não um motivo para contornar a validação.
