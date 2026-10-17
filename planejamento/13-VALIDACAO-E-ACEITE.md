# Validação e critérios de aceite

## Documentação da etapa 0 — verificação histórica

- A raiz contém somente `planejamento/`.
- A pasta contém apenas arquivos `.md` em UTF-8, com links internos válidos.
- O escopo cobre tudo o que foi conversado e identifica o que ainda precisa de prova.
- Nenhuma infraestrutura, credencial ou configuração do projeto anterior é adotada pelo produto.
- O status distingue pesquisa, planejamento e implementação real.

A solicitação posterior de criar a página local de referência autoriza novos arquivos fora de `planejamento/`; o requisito histórico de raiz contendo apenas Markdown não se aplica à etapa de implementação visual. Ver [14](14-REFERENCIA-MOBALYTICS.md).

## Dados e mecânica

Validar contratos das respostas com exemplos reais, valores ausentes, mudanças de schema, IDs novos e fontes indisponíveis. Conferir escalas de porcentagem, unidades, contagens e arredondamento. Testar associação por ID e formas, receitas, patamares de habilidades e compatibilidade de versões.

Para regras de domínio que influenciam decisões, criar testes relevantes: sinergias, restrições de itens, receitas, limites do montador e formatação de métricas. Comparar o resultado com o comportamento/código da versão publicada, sem depender apenas de mocks que repetem a implementação.

Não apresentar o CSV do master como comprovação da release. Testar explicitamente a exclusão ou identificação de conteúdo futuro, como as diferenças de Totodile/Bombirdier observadas nesta pesquisa.

## Estatísticas

Reproduzir amostras de dados e filtros, registrando snapshot, versão conhecida, janela e faixa. Os números de referência em [03](03-FONTES-E-CONTRATOS-DE-DADOS.md) servem para a reconciliação de 15/10/2026; novas coletas podem mudar os valores legitimamente.

Conferir cálculos derivados, prioridade de componentes e delta histórico. Não inventar denominadores, win rate por item/Pokémon ou resultados de um conjunto de equipamentos se a origem não os fornece. Testar estados de amostra pequena, erro, desatualização e ausência de dados.

## Produto e interface

Executar os fluxos de [10](10-EXPERIENCIA-E-INTERFACE.md) em desktop e celular. Verificar teclado, foco, contraste, zoom, tooltips, imagens ausentes e tabela alternativa aos gráficos. Confirmar que busca e filtros lidam com aliases e formas sem resultados incorretos.

No montador, testar mover peças com e sem drag-and-drop, equipamentos inválidos, cálculo das sinergias, salvar/carregar, compartilhamento, dados malformados e versão incompatível. Uma equipe estatística sem posições não pode aparecer como posicionamento original observado.

Revisar conteúdo de cada guia por mecânica, versão, justificativa, alternativas e diferenciação entre sugestão editorial e evidência estatística.

## Engenharia e operação

Executar build, lint, typecheck e testes adequados à stack escolhida, registrando comandos e resultados reais. Medir volume transferido nas páginas para confirmar que os relatórios grandes não chegam inteiros em toda navegação. Validar sanitização de conteúdo externo, limite de importação e ausência de segredos no bundle.

Ensaiar falha de atualização, restauração do último snapshot válido e publicação consistente dos dados. Conferir créditos e distribuição de assets. Somente declarar publicação concluída após verificar o site no endereço final, quando essa etapa for solicitada.
