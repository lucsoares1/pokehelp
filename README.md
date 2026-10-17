# PokeChess Helper

Guia local de Pokémon Auto Chess com catálogo, itens, receitas, sinergias e composições importados de fontes públicas. O visual aprovado foi preservado; o conteúdo ativo agora é do PokeChess Helper.

Composições agora mostram uma equipe específica por vez, variações recolhidas, itens por Pokémon e uma formação sugerida em campo 8 × 3. Veja o [fluxo e os critérios](planejamento/16-COMPOSICOES-E-VARIACOES.md).

“Seu caminho até esta equipe” integra o [guia para iniciantes](planejamento/17-GUIA-DE-NIVEIS.md) ao campo final: níveis 2–9 com metas ligadas à equipe final, evoluções/condições, sinergias, trocas, reservas, chances, economia e calculadora de XP. Comps usam retratos hexagonais, molduras por raridade e estrelas. As regras vêm da fonte; decisões estratégicas são sugestões explicadas do Helper.

- [Planejamento completo](planejamento/00-LEIA-PRIMEIRO.md)
- [Status e evidências](planejamento/22-STATUS-DO-PROJETO.md)
- [Aplicação e instruções](site/README.md)
- [Ambiente e fluxo de importação](planejamento/15-AMBIENTE-E-IMPORTACAO.md)

## Abrir a página local

```powershell
npm ci --ignore-scripts
npm run data:import
npm run dev
```

Acesse <http://127.0.0.1:4173/>. Node.js 24+. Os dados já importados ficam em `site/data/`. O navegador consulta esses arquivos locais, sem acessar o banco privado do jogo.

## Atualizar os dados

```powershell
npm run data:import
npm run data:validate
```

Para revalidar os relatórios na origem: `npm run data:import -- --refresh`. A versão/revisão ficam em `data/source-lock.json`; uma mudança de patch exige revisar esse arquivo conscientemente. A importação valida fontes e troca o snapshot de uma vez; em caso de falha, preserva o anterior. Reexecutar com as mesmas fontes e código reutiliza o snapshot.

## Verificar o código

```powershell
npm run check
npm test
```

Catálogo atual: 1.184 registros, incluindo 1.178 Pokémon/formas e seis entidades especiais; 357 itens, 55 receitas, 31 sinergias e 130 grupos de comps. Habilidades, passivas, alcance e itens populares estão nas fichas. Funções táticas têm curadoria separada: oito perfis iniciais revisados; demais marcados em revisão. As limitações das fontes constam no [status](planejamento/22-STATUS-DO-PROJETO.md).
