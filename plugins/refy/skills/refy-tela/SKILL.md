---
name: refy-tela
description: Monta ou converte uma tela React com o design system Refy e confere o código contra a API real dos componentes. Use quando a pessoa pedir uma tela, página, formulário ou componente "com refy", ou quiser trocar controles soltos por componentes do Refy.
---

# Tela com Refy

Use as ferramentas do servidor MCP `refy`. Responda na língua da pessoa.

## Fluxo

1. **Projeto.** Confira se `@refy-design/web` está no `package.json`. Se não estiver, instale (`npm install @refy-design/web`) e importe `@refy-design/web/tokens.css` uma vez na entrada do app, com `<ThemeProvider>` em volta da árvore.
2. **Escolha.** Para cada parte da tela, chame `refy_search` com a necessidade em linguagem natural ("confirmar antes de apagar", "lista com busca"). Leia `alternatives` do resultado: se a situação da tela estiver lá, use a família indicada.
3. **API.** Chame `refy_component` para cada família escolhida. Escreva o código só com as props que a ficha documenta, nos valores que ela aceita.
4. **Código.** Importe só de `@refy-design/web`. Cor, fonte, raio e sombra vêm do tema: nada de hexadecimal, `font-family` ou `button`/`input`/`select`/`textarea` crus. Layout (grid, flex) e regra de negócio ficam na tela.
5. **Conferência.** Rode `refy_validate` com `files` (os arquivos que você escreveu) ou `code`. Corrija cada erro e rode de novo até `passed: true`.
6. **Entrega.** Mostre à pessoa o resultado da conferência em uma linha (famílias usadas e zero erros) e, se houver servidor de desenvolvimento, abra a tela para ela ver.

## O que não fazer

- Não recrie um componente que o Refy já tem; se faltar algum, diga qual e use composição local.
- Não copie código de `dist/` ou `src/` do pacote.
- Não esconda erro da conferência: se um ficar, diga qual e por quê.
