---
name: docs-sync
description: Mantém README, docs, plugins, kit de IA, server.json e o site (pt, en, es) em sincronia com o código do refy. Use ao terminar qualquer mudança de código, quando `node scripts/docs-sync.mjs --check` reprovar, ou quando pedirem "sincronizar documentação", "atualizar as superfícies" ou "docs-sync".
---

# docs-sync

Toda mudança no refy diz o que mexeu, que superfícies isso toca e o que cada uma decidiu. O gate
`node scripts/docs-sync.mjs --check` roda no `npm run check`, no CI e na promoção; mudança com registro
aberto não junta nem promove.

## Peças

- `docs/sync/surfaces/<id>.md`: o que a superfície afirma, de que fonte vem cada afirmação e como atualizar nas três línguas.
- `docs/sync/impact-map.json`: caminho de código -> superfícies impactadas. Arquivo sem entrada reprova.
- `docs/sync/changes/<branch>.json`: o registro desta branch, gerado do diff contra a base.
- `docs/sync/exceptions.json`: linha que cita número que não é o atual (rodada datada, subconjunto), com motivo. Expira quando a linha muda.
- `node scripts/docs-sync.mjs facts`: os números e versões calculados do código. Nunca escreva número de memória.

## Loop

No repositório de trabalho (onde ficam o mapa e os registros). No clone público só o `--check` roda, e confere os fatos.

1. Depois de mexer no código: `node scripts/docs-sync.mjs record`. O registro lista o que mudou e as superfícies impactadas, todas `pendente`.
2. `node scripts/docs-sync.mjs plan --out <pasta>` grava um pedido por superfície impactada: contrato da superfície, arquivos, fatos calculados e diff do código que a toca.
3. Um agente por superfície, em paralelo quando der. Cada um recebe só o seu pedido, lê os arquivos da superfície, atualiza o texto em pt, en e es quando houver, e grava no registro `status` (`atualizada` ou `revisada sem mudança`) e `motivo` (uma frase).
4. `node scripts/docs-sync.mjs record` de novo (mantém as decisões e acrescenta o que mudou depois) e `node scripts/docs-sync.mjs --check`. Repita até passar.

## Regras

- O valor vem do código. Se o código mudou um número, a frase muda; se a frase está certa, `revisada sem mudança` com o motivo.
- Nada de promessa de futuro para o que já existe (as frases recusadas estão em `FORBIDDEN_PHRASES` do script), nem recurso anunciado que a versão publicada não tem.
- Site: o texto pt fica no TSX; com `tr("...")`, a mesma frase é a chave em `locales/en.json` e `locales/es.json`. Mude as três juntas.
- Registro histórico (CHANGELOG, changelog do site, evidências) não se reescreve.
- Superfície nova: crie `docs/sync/surfaces/<id>.md` com `id`, `files` e a tabela de fontes; o gate reprova texto público fora de qualquer superfície.
- Arquivo de código novo sem regra no mapa reprova: acrescente a regra com `surfaces` e `why`.
