## 1. Gate do predecessor

- [x] 1.1 Confirmar com o mantenedor que o escopo desta mudança está autorizado. Aceite: resposta do mantenedor registrada. Evidência: respostas M1, M2 e M3 do grill de 12/11/2026 (campo e gate aceitos; promoção feita pelo mantenedor com a evidência do QUALITY.md).
- [ ] 1.2 Confirmar no PR que `establish-refy-governance` está concluída. Aceite: comentário do mantenedor.

## 2. Registro e validador (LIFE-03)

- [x] 2.1 Criar `src/catalog/maturity.json` com os quatro estados do QUALITY.md e `families` vazio. Aceite: teste compara rótulo e critério com a tabela do QUALITY.md.
- [x] 2.2 Criar `scripts/maturity-registry.mjs` com as regras de evidência por estado. Aceite: os casos de falha do LIFE-03 são recusados em `tests/maturity-registry.test.mjs`.
- [x] 2.3 Ligar o registro em `scripts/agent-kit.mjs` (validação, hash de origem, `maturity` no topo e por família) e em `tools/refy-agent/search.mjs`. Aceite: `ai/catalog.json` regenerado com 122 famílias em `nao-avaliado`. Dependência: 2.2.
- [x] 2.4 Documentar o campo em `ai/instructions.md`. Aceite: texto diz que `nao-avaliado` é estado declarado e proíbe alegar estável sem registro.
- [x] 2.5 Incluir o teste em `agent:check`. Aceite: `npm run agent:check` roda e passa o teste.

## 3. Gate da mudança

- [x] 3.1 `npm run check` passa. Evidência: rodado em 12/11/2026 sobre 391903a + esta mudança, Node 22, macOS; exit 0, `agent:check` com 0 falhas e `tests/maturity-registry.test.mjs` com 4 de 4.
- [x] 3.2 `npm run check:specs` passa com esta mudança. Evidência: openspec 1.5.0, `change/register-family-maturity` válida, 6 de 6 itens, controle inválido recusado.
- [ ] 3.3 Revisão do mantenedor e decisão de versão (minor).
