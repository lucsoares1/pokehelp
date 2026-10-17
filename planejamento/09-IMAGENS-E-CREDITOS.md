# Imagens, ícones e créditos

## Disponibilidade confirmada

Foram consultados PNGs públicos do site, sem login, com HTTP 200 e `Content-Type: image/png`:

| Exemplo | URL |
| --- | --- |
| Charizard | <https://pokemon-auto-chess.com/assets/portraits/0006/Normal.png> |
| Razor Fang | <https://pokemon-auto-chess.com/assets/item/RAZOR_FANG.png> |
| Star Piece | <https://pokemon-auto-chess.com/assets/item/STAR_PIECE.png> |

O [diretório de assets no repositório](https://github.com/keldaanCommunity/pokemonAutoChess/tree/master/app/public/src/assets) contém retratos, expressões, formas, sprites, itens, tipos/sinergias e outras imagens. Algumas pastas de origem têm sufixos de empacotamento, como `item{tps}`. O caminho de origem não é necessariamente igual ao URL servido.

## Uso no produto

Relacionar imagens por IDs/índices e variante. Conferir o mapeamento para formas regionais, especiais e shiny; não fabricar caminhos somente substituindo números. Nem toda imagem existente implica unidade disponível no patch atual.

Retratos aparecem nas listas, fichas, comps e montador; ícones de itens aparecem em receitas, equipamentos, rankings e prioridade do carrossel; símbolos de sinergia aparecem no catálogo, filtros e equipes. Sprites de corpo podem complementar o montador se forem adequados e seus formatos estiverem validados.

Não usar geração de imagens para substituir os ícones oficiais do jogo já disponíveis. Preservar transparência, proporção e nitidez de pixel art. Evitar ampliar imagens pequenas com suavização inadequada. Definir tamanho de layout, carregamento progressivo e fallback; fornecer nomes acessíveis e texto adjacente quando necessário.

## Estratégia de distribuição

No desenvolvimento, URLs públicas ajudam a validar o mapeamento. Para publicação, definir cópia local versionada ou outra distribuição compatível com os direitos e a autorização de uso. Evitar dependência permanente de hotlink sem alinhar uso e impacto com os mantenedores. Não fazer downloads em massa antes de verificar escopo, licença e necessidade.

Guardar um manifesto com origem, hash/revisão, entidade, variante, dimensões, crédito e licença quando conhecidos. Não presumir que a licença do código cobre todas as imagens e músicas.

## Direitos e atribuição

O repositório indica GPL-3.0 para o código e ressalva direitos de Pokémon e seus titulares. A página de [termos do jogo](https://pokemon-auto-chess.com/terms-of-service) também diferencia o projeto de fã e os direitos associados. Avaliar as condições específicas ao reutilizar código, dados e assets; a disponibilidade pública não equivale a uma autorização geral de redistribuição ou exploração comercial.

Manter página de fontes e créditos, identificação do Helper como projeto de fã independente e registro dos autores quando fornecidos. Monetização, identidade visual final e condições de redistribuição permanecem decisões abertas. Não afirmar que o site é oficial ou afiliado aos titulares de Pokémon.

## Recursos de apresentação D020

Oito ilustrações transparentes de Gyarados, Volcanion, Umbreon, Lickilicky, Mightyena, Carnivine, Great Tusk e Rampardos, do PokeAPI/sprites, revisão ba403973fdf9d0ac59175813861e6a1f8ed5020c. Direitos Pokémon / Nintendo / Creatures / GAME FREAK; uso não implica afiliação oficial. Demais formas mantêm o retrato próprio do jogo. Arquivos locais, manifesto com SHA-256 e fontes em site/assets/presentation/manifest.json. A fonte Nunito é local e acompanha SIL OFL 1.1. Recursos separados dos snapshots de regras/relatórios, recuperáveis por npm run assets:presentation.

## Vídeo do banner — D022

Arquivo assets/videobanner.mp4 fornecido pelo proprietário, referente ao vídeo de Pokémon Champions https://www.youtube.com/watch?v=FVm9o4R4UIs. Original preservado; derivado de 0–47 s, H.264 1280 × 720 sem áudio em site/assets/presentation/banner.mp4. Hashes, tamanhos e referência em banner.json da mesma pasta. Direitos dos respectivos titulares Nintendo / Creatures / GAME FREAK / The Pokémon Company; não implica vínculo oficial. Fonte local, sem download do YouTube ou player externo na versão final.

## Arte Stadium do destaque de patch — D024

assets/banner2.jpg foi fornecida pelo proprietário e copiada sem alteração para site/assets/presentation/patch-stadium.jpg; igualdade binária verificada em teste. Usada no banner após composições e no modal. A arte identifica 6.11 Stadium; o conteúdo separa novidades 6.11 e correções 6.11.1. Crédito preservado no JSON editorial site/data/patches/latest.json e no modal. Direitos de Pokémon Auto Chess e dos respectivos titulares Pokémon; não implica vínculo oficial.
