# Revisão dos catálogos — 24/10/2026

| Antes | Agora |
|---|---|
| Três conjuntos com nomes abreviados | Seis conjuntos com todas as famílias nomeadas, busca e papéis explícitos de títulos, corpo e código |
| Tokens editoriais podiam preservar fonte anterior ao aplicar conjunto | Aplicar conjunto atualiza também os papéis Prose e remove overrides antigos desses papéis nos modos; famílias continuam editáveis individualmente |
| Escala mostrava títulos/corpo, sem amostra mono | Escala inclui código e todas as visões exibem os três papéis |
| Artigo curto tornava navegação pouco útil | Lorem ipsum longo, quatro âncoras e sumário acompanhando a leitura |
| Charts abria explorador, exemplos repetidos, comparação e outro catálogo | Charts abre diretamente D3, com busca/lista lateral, 24 famílias e Streaming separado |
| Blocks montava várias prévias em categoria | Lista lateral de categorias/variantes, uma prévia por vez, viewport e código real preservados |
| Aplicação/Acesso/Setup como destinos públicos paralelos | Demonstração; Acesso/Setup permanecem nos Blocks e fluxos internos |
| Builds e relatórios HTML podiam recarregar a prévia e zerar sua interação | Pastas geradas saem do watcher, mantendo atualizações de src |
| Apenas GoogleButton | OAuthButton compõe Button/GoogleButton para Google, Facebook, LinkedIn, Spotify, GitHub, X, Apple e Microsoft |

## Fontes
Conjuntos são curadoria Refy informada pelos critérios de contraste e superfamília do [Google Fonts](https://fonts.google.com/knowledge/choosing_type/pairing_typefaces), não um espelho integral do catálogo nem uma alegação de que cada combinação foi recomendada oficialmente. Famílias existentes foram reutilizadas. IBM Plex Serif acrescenta três subsets Latin locais de 400/600/700, com licença SIL OFL incluída. A aplicação de conjuntos não requer rede.

DM Sans + Geist Mono tem duas famílias: DM Sans ocupa títulos e corpo; Geist Mono ocupa código. Manrope + Source Sans 3 + Source Code Pro tem três famílias distintas. A amostra identifica cada papel mesmo quando dois usam a mesma família.

## OAuth
São controles de interface com callbacks, não SDKs de autenticação. GoogleButton segue disponível com sua API. Os símbolos monocromáticos adicionais vêm de Simple Icons (CC0); nenhuma dependência de runtime foi instalada. A aplicação configura provedores e callbacks reais.

## Limites
Tudo local. A referência de catálogo continua Componentes/Accordion. Aprovação estética pertence ao mantenedor. Os testes não homologam dispositivos físicos, todas as combinações possíveis de tokens ou serviços OAuth. O pacote compactado anterior não contém estas alterações; não é um candidato atualizado para publicação.
