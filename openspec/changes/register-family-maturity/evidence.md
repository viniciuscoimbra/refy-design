# Evidência: register-family-maturity

## Requisito e tarefa

- Requisito: LIFE-03 (registro de maturidade por família com gate de evidência).
- Tarefas cobertas: 1.1 (autorização do mantenedor), 2.1 a 2.5 (registro, validador, catálogo do agente, instruções e teste em `agent:check`), 3.1 (`npm run check`) e 3.2 (`npm run check:specs`).

## Baseline e arquivos afetados

- Baseline: commit 391903a, refy 1.6.2.
- Arquivos afetados: `src/catalog/maturity.json`, `scripts/maturity-registry.mjs`, `scripts/agent-kit.mjs`, `tools/refy-agent/search.mjs`, `tools/refy-agent/cli.mjs`, `tools/refy-agent/mcp-server.mjs`, `ai/catalog.json` (gerado), `ai/instructions.md`, `tests/maturity-registry.test.mjs`, `tests/agent-discovery.test.mjs`, `package.json` (`agent:check`) e os artefatos desta mudança em `openspec/changes/register-family-maturity/`.

## Autorização humana e limites

No grill de contribuição de 12/11/2026, o mantenedor (Vinícius Coimbra) respondeu:

- M1, quantas famílias são estáveis hoje: "Nenhuma".
- M2, campo de maturidade por família com gate que recusa estável sem evidência: "COM CERTEZA".
- M3, quem promove e com qual evidência: "Eu promovo com evidência que o QUALITY.md lista".

Limite: esta mudança cria o campo e o gate. Ela não promove nenhuma família; todas as 122 seguem em `nao-avaliado`, e qualquer promoção é decisão do mantenedor, família a família, com a evidência do QUALITY.md.

## Procedimento e resultado

Rodado em 12/11/2026, macOS, Node v25.8.1 (o repo declara `engines.node >=22.12.0`), sobre 391903a mais esta mudança.

- `node --test tests/maturity-registry.test.mjs`: 4 testes, 4 passam, 0 falhas. O teste de recusa trava o motivo de cada uma das 22 mutações por regex da mensagem, incluindo `evidence: null`, `evidence: ''`, `gaps: null` e `gaps: ''`. Com o validador anterior (teste por truthiness), o mesmo teste falha em `evidence: null` com "Missing expected exception", o que mostra que ele discrimina a correção.
- `npm run agent:build`: "Agent catalog: 122 families, generated from public documentation; written." Nenhum arquivo gerado mudou.
- `npm run check`: exit 0. `docs:check` com 14 de 14 testes; `agent:check` com 163 testes, 159 passam, 0 falhas, 4 ignorados; catálogo "122 families ... current".
- `npm run check:specs` (openspec 1.5.0): 6 de 6 itens válidos, incluindo `change/register-family-maturity`; "controle válido aceito; spec inválida recusada, sem alterar o repositório".

Limitações: a verificação é estática e de contrato; não há revisão visual nem verificação assistiva, e nenhuma é alegada.

## Autoria, revisão e gate

- Autor: Gabriel Gripp, implementação com Claude Code.
- Revisor: mantenedor (Vinícius Coimbra), no PR viniciuscoimbra/refy-design#16.
- A revisão feita até aqui é do próprio agente autor, sem independência.
- Data: 12/11/2026.
- Gate: aguarda revisão do mantenedor (tarefas 1.2 e 3.3).
