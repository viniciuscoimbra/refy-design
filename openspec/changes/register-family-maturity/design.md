## Contexto

O catálogo de agentes é gerado por `scripts/agent-kit.mjs` a partir de `catalog.ts`, das fichas em `documentation/` e do registro de coleções em `src/catalog/collections.json`, validado por `scripts/collection-registry.mjs`. A maturidade segue o mesmo caminho para não inaugurar um padrão novo.

## Decisões

1. **Registro separado, não campo na ficha.** Maturidade é decisão de governança, com regras próprias de evidência; a ficha descreve API e uso. Um arquivo único também deixa toda promoção visível num diff só.
2. **Mapa esparso com padrão `nao-avaliado`.** Igual a `collectionIdsFor`, que devolve `core` para família ausente. O QUALITY.md já declara `nao-avaliado` como estado inicial, então o registro vazio é a descrição honesta do estado atual. Entrada explícita com `nao-avaliado` é recusada para o padrão ter uma forma só.
3. **Evidência exigida por estado, como dado.** `experimental`: `since` + `gaps`. `estavel`: `since` + `evidence` (caminhos ou links para o evidence.md da mudança que promoveu). `depreciado`: `since` + `replacement` (outra família) + `migration` + `removal`. Conjunto de campos exato: campo a mais (por exemplo `wcag`) é recusado, para nenhuma alegação entrar de carona.
4. **Estados espelham o QUALITY.md.** O teste compara rótulo e critério de cada estado com a tabela do QUALITY.md, para os dois não divergirem em silêncio.
5. **Aditivo no catálogo.** Novos campos `maturity` no topo e em cada família; nada é removido nem renomeado, por isso `schemaVersion` fica em 1.

## Alternativas rejeitadas

- **122 entradas explícitas.** Diff grande que não informa nada além do padrão e convida a preencher estado sem evidência.
- **Campo em `catalog.ts`.** Mistura governança com o índice do playground e obriga o parser TypeScript a validar regra de evidência.
- **Só documentar no QUALITY.md.** É o estado atual, e é justamente o que não deixa consumidor nem CI perguntarem nada.

## Riscos

- O validador confere forma, não substância: um `evidence` pode apontar para arquivo fraco. A revisão humana da promoção continua necessária (LIFE-02).
- `since` aceita qualquer versão semver; não confere se a versão existe em `versions.json`. Pode virar regra depois, se o mantenedor quiser.

## Migração

Nenhuma para consumidores. Consumidor que lê o catálogo ganha um campo; quem ignora campos desconhecidos não muda.

## Validação

`node --test tests/maturity-registry.test.mjs`, `npm run agent:check`, `npm run check` e `npm run check:specs`. Resultados em `tasks.md`.

## Dúvidas para o mantenedor

- O responsável por família (também em LIFE-01) deve entrar neste registro ou em mudança própria?
- Prefere `since` validado contra `versions.json` já nesta mudança?
- Os ids sem acento (`nao-avaliado`, `estavel`) servem, ou prefere os rótulos com acento como id?
