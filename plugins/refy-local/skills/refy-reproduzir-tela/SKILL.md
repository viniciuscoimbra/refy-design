---
name: refy-reproduzir-tela
description: Reproduz uma tela existente (site, captura ou prancha) igual ao original, só com componentes do Refy e extensões, e prova com comparação lado a lado. Use só quando a pessoa pedir para reproduzir, copiar ou clonar a tela; para pegar só o estilo, use refy-tema-de-site.
---

# Reproduzir uma tela com o Refy

Use as ferramentas do servidor MCP `refy`. Responda na língua da pessoa. Reproduzir é ficar igual: parecido não é entrega.

## Regra de cada diferença

Toda diferença entre o original e a tela do Refy se resolve nesta ordem, e você diz qual foi usada:

1. **Tema.** O componente já lê um token para isso? Ajuste o token no tema do projeto (`refy_theme_extract` dá o ponto de partida; `elements.tokens` traz o jeito de botão, cartão, campo e selo).
2. **Composição.** É arranjo da página (grade, ordem, espaço entre blocos)? Monte com componentes do Refy e CSS de layout da própria tela, sem cor, fonte ou raio solto.
3. **Extensão.** O componente não tem prop nem token para isso (o `gaps` do `refy_theme_extract` lista os casos, como caixa alta no botão)? Crie a extensão em `refy-extensions/<Nome>/` sobre o componente público, com `contribution.json`. Se servir a outros projetos, `npx -p @refy-design/web refy contribute <Nome>` prepara a contribuição ao Refy.
4. **Sem saída.** Se nada disso deixa igual, diga o que ficou diferente e por quê. Não esconda.

## Fluxo

1. **Original.** Capture o original em PNG numa largura fixa (1440×900 e 390×844), escala 2, depois de a página carregar. Se a tela estiver dentro de um iframe, capture o frame. Guarde em `refy-reproducao/original-<largura>.png`.
2. **Tema.** Chame `refy_theme_extract` (com `observations` da sonda `refy://theme-probe` quando houver navegador). Grave o tema e aplique `elements.tokens`.
3. **Inventário.** Liste os elementos do original de cima para baixo. Para cada um, `refy_search` e `refy_component`; anote a rota da regra acima.
4. **Tela.** Escreva a tela só com `@refy-design/web`, o tema e as extensões. Imagens e textos: os da pessoa; imagem de site de terceiro fica só na máquina dela.
5. **Conferência de código.** `refy_validate` na tela e nas extensões até `passed: true`.
6. **Comparação.** Capture a tela do Refy no mesmo tamanho e escala e chame `refy_compare` com as duas. Abra `diffImage`, corrija a região mais diferente e repita. Pare quando o que sobra for só conteúdo (foto, texto da pessoa) ou o que o passo 4 declarou.
7. **Entrega.** Mostre à pessoa o original e a tela do Refy lado a lado, na mesma escala, e a lista do que virou tema, composição e extensão.
