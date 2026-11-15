---
id: docs-quality
title: Qualidade, custo, tema e medições
files: docs/QUALITY.md, docs/PACKAGE_COST.md, docs/CSS_AUDIT.md, docs/ASSISTIVE_QA.md, docs/FUNCTIONAL_MOTION.md, docs/TYPOGRAPHY_INTERACTIONS.md, docs/MOLECULE_INTERACTIONS.md, docs/THEME_COVERAGE.md, docs/CORE_VISUAL.md, docs/THEMING.md, docs/SKINS.md, docs/TOKEN_INVENTORY.md, docs/*.json
---
Maturidade, custo medido do pacote, temas e auditorias. Muitas seções são registro de uma rodada (com data): o número dela é o daquela rodada e não muda.

| Afirmação | Fonte |
|---|---|
| Número de famílias do catálogo atual | `ai/catalog.json` |
| Custo medido (kB, JS mediano) | `scripts/measure-family-cost.mjs`, numa rodada datada |
| Temas incluídos | `src/themes/*.json` |
| Tokens | `src/tokens/foundations.tokens.json` (TOKEN_INVENTORY é gerado) |

Como atualizar: frase sobre o catálogo atual usa o número do catálogo; resultado de rodada antiga fica com a data da rodada, e não vira número atual.
