## Why

O docs/QUALITY.md define quatro estados de maturidade e o requisito LIFE-01 diz que cada família SHALL ter maturidade registrada. Na versão 1.6.2 nenhuma das 122 famílias tem esse registro em dado: não existe campo no `ai/catalog.json`, em `src/catalog/` nem na ficha da família. Quem consome o catálogo (pessoa, agente, MCP) não consegue perguntar quais famílias são estáveis, e uma promoção não tem onde ficar gravada nem regra que a recuse sem evidência.

## What Changes

- Novo registro `src/catalog/maturity.json`, no molde de `collections.json`: os quatro estados do QUALITY.md e um mapa esparso de famílias. Família ausente do mapa está em `nao-avaliado`, o estado inicial que o QUALITY.md já declara.
- Novo validador `scripts/maturity-registry.mjs`, que transforma LIFE-02 em regra de dado: `experimental` exige versão e lacunas, `estavel` exige versão e evidência, `depreciado` exige substituta, migração e condição de remoção. Estado desconhecido, família inexistente ou campo a mais são recusados.
- `scripts/agent-kit.mjs` valida o registro, inclui o arquivo no hash de origem e publica `maturity` (estados) no topo do catálogo e `maturity` (estado) em cada família. `refy-agent catalog/search` passa a devolver o campo.
- `ai/instructions.md` explica que `nao-avaliado` é estado declarado e proíbe apresentar família como estável sem o registro.
- Teste `tests/maturity-registry.test.mjs` entra em `agent:check`.

Mudança aditiva no catálogo (`schemaVersion` segue 1). Nenhum export, prop, token ou default muda: versão minor.

## Predecessor

`establish-refy-governance`, já implementada (specs `component-lifecycle` e `change-governance`). Esta mudança só cumpre em dado o que LIFE-01 e LIFE-02 já exigem.

## Não objetivos

- Avaliar ou promover qualquer família. Todas as 122 entram como `nao-avaliado`; promoção é decisão do mantenedor, família a família, com evidência.
- Alegar conformidade WCAG, equivalência Figma ou homologação.
- Mostrar o estado no site ou no Storybook (fatia seguinte, depois do aceite desta).
- Registrar responsável por família (LIFE-01 também pede; fica para mudança própria).

## Capabilities

### Modified Capabilities
- `component-lifecycle`: adiciona LIFE-03, registro de maturidade verificável no catálogo.

## Impact

`src/catalog/maturity.json`, `scripts/maturity-registry.mjs`, `scripts/agent-kit.mjs`, `tools/refy-agent/search.mjs`, `ai/instructions.md`, `ai/catalog.json` (regenerado), `package.json` (lista de testes do `agent:check`), `tests/maturity-registry.test.mjs`.

## Autorização

Proposta de contribuidor externo (Gabriel Gripp), sem autorização de escopo do mantenedor até aqui. Esta proposta é o pedido: a implementação acompanha para mostrar o tamanho real, e o mantenedor decide aceitar, ajustar ou recusar.

## Gate de saída

`npm run check` e `npm run check:specs` passam; o catálogo gerado traz um estado para cada uma das 122 famílias; o validador recusa cada caso de falha do LIFE-03; o mantenedor aprova o escopo.
