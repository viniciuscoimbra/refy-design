---
id: docs-components
title: Guias de componentes, coleções, templates e charts
files: docs/COMPONENT_USAGE.md, docs/CONTROL_CHOICES.md, docs/COLLECTIONS.md, docs/CORE_CONTRACTS.md, docs/ORGANISM_PLAYBOOK.md, docs/ADVANCED_ORGANISMS.md, docs/CAPABILITY_PILOTS.md, docs/KANBAN.md, docs/TIMELINES.md, docs/BLOCKS.md, docs/CHARTS.md, docs/CHART_VISUAL_LANGUAGE.md, docs/INTERACTION_COVERAGE.md
---
Uso de cada família, escolha entre controles, coleções, templates e charts. COMPONENT_USAGE e CONTROL_CHOICES são gerados; o resto é escrito.

| Afirmação | Fonte |
|---|---|
| Uso, alternativas e coleções de cada família | `scripts/component-usage.mjs`, `src/catalog/collections.json` |
| Número de famílias | `ai/catalog.json` |
| Tipos de chart D3 | `src/components/Charts/d3/types.ts` |
| Templates | `blockRegistry` em `src/pages/PlaygroundPage/blockRegistry.tsx` |
| Cobertura de interação | `docs/interaction-coverage.json` (gerado por `scripts/interaction-coverage.mjs`) |

Como atualizar: arquivo gerado se regenera pelo script (`npm run docs:build`); texto escrito troca o número pelo fato.
