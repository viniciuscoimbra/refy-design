# Segurança

Não publique credenciais ou dados privados em issues, PRs ou exemplos. Use relato privado de segurança do GitHub quando habilitado; a preparação local não confirma a configuração remota.

## Verificação de31/10/2026 — cadeia de descoberta do Storybook

A auditoria atual encontrou quatro alertas moderados transitivos em desenvolvimento: react-vite → vite-plugin-react-docgen-typescript → glob/minimatch. Runtime permaneceu sem alertas. Os advisories reportados foram [cancelamento de travessia em glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) e [amplificação em minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249).

Foi mantido Storybook8.6.19 e aplicado override restrito ao caller `@joshwooding/vite-plugin-react-docgen-typescript`: glob14.0.2 e minimatch11.0.1. O plugin usa globSync. A resolução foi validada nesse caller com ESM/CJS, descoberta real de TSX aninhado, resultado vazio e controles negativos que recusam versões anteriores. As engines declaradas de glob/minimatch permitem Node22.12+, requisito do projeto. Dependências de runtime não foram alteradas; o override uuid anterior foi preservado.

Após a correção, `npm audit` e `npm audit --omit=dev` retornaram zero alertas nesta execução. Resultado datado, sem equivaler a auditoria independente. Rever o override quando o plugin suportar essa cadeia segura diretamente; não aceitar um downgrade ou suprimir advisories para limpar o relatório.

## Verificação de 24/10/2026 — após correção

`npm audit` e `npm audit --omit=dev` retornaram **zero alertas** nesta execução. Esse resultado é datado e não é auditoria independente ou garantia de ausência de vulnerabilidades. Novos advisories podem mudar o resultado.

Os três alertas anteriores tinham uma única origem: uuid<11.1.1, na cadeia addon-essentials → addon-actions. O addon 8.6.19 usa v4 via ESM/CJS; foi aplicado override **restrito a @storybook/addon-actions → uuid 11.1.1**, com lockfile atualizado. Não houve supressão de advisories, downgrade de Storybook ou audit fix --force.

A versão corrigida é documentada no [advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq) e na [release oficial 11.1.1](https://github.com/uuidjs/uuid/releases/tag/v11.1.1). scripts/check-storybook-deps.mjs confere resolução, v4 ESM/CJS e rejeição de buffer inválido. O painel Actions também deve ser testado no navegador após mudanças dessa cadeia.

A proposta de exceção moderada anterior deixa de ser necessária para esses três avisos após a correção e a regressão. O override precisa ser removido quando uma atualização compatível do addon já depender de uuid seguro; não trocar para uuid ESM-only sem validar os callers CJS.

O dev server do Storybook permanece em 127.0.0.1. Não exponha esse servidor à internet; uma publicação futura usa a saída estática revisada. Nenhum segredo de npm/hosting deve entrar no repo ou no pacote. Publicação continua exigindo revisão e autorização.
