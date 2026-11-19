---
name: refy-pagina-solta
description: Monta uma página HTML solta (relatório, protótipo, artefato) com o Refy carregado pelo CDN, sem projeto React nem build, e com o tema do Refy em vez de cor e fonte escritas à mão. Use quando a pessoa pedir uma página ou relatório "com refy" e não houver projeto com bundler.
---

# Página HTML solta com Refy

Use as ferramentas do servidor MCP `refy`. Responda na língua da pessoa.

## Fluxo

1. **Base.** Parta do HTML da página [Sem bundler](https://refy.design/docs/sem-bundler). É o mesmo HTML que o refy testa no navegador depois de cada versão. Mantenha os quatro `<link>` (`tokens.css`, `fonts.css`, `global.css`, `style.css`) e o trecho que lê o endereço do React dentro do `/+esm` do refy: com outro endereço a página carrega duas cópias do React e quebra. A versão é a da página ou a de `npm view @refy-design/web version`, igual em todos os endereços.
2. **Escolha.** Para cada parte da página, chame `refy_search` com a necessidade ("indicador com variação", "tabela de pedidos"). Leia `alternatives` e use a família indicada.
3. **API.** Chame `refy_component` para cada família. Use só as props que a ficha documenta, nos valores que ela aceita.
4. **Código.** Sem build não há JSX: monte a árvore com `createElement` (`h` no trecho) e importe os componentes do mesmo `import(refy)`. Cor, fonte, raio e sombra vêm do tema: nada de hexadecimal, `rgb()`, `font-family` nem `<style>` com cor. Layout (grid, gap, largura) pode ir no `style` com tokens, como `var(--space-6)`.
5. **Conferência.** `refy_validate` lê JSX e não confere chamadas de `createElement`. Passe em `code` a mesma árvore escrita em JSX, com `filename` `Pagina.jsx`, as mesmas props e o mesmo `style`. Corrija cada erro na página e no JSX e rode de novo até `passed: true` com as famílias usadas em `components`.
6. **Entrega.** Se tiver navegador, abra a página, confira o console sem erro e mostre a tela. Diga em uma linha as famílias usadas e o resultado da conferência.

## O que não fazer

- Não troque o React do trecho por outro endereço nem por `react@18` fixo.
- Não copie a paleta ou as fontes do tema para CSS da página: o `tokens.css` já traz.
- Não recrie um componente que o Refy já tem; se faltar algum, diga qual.
- Não esconda erro da conferência: se um ficar, diga qual e por quê.
