---
name: refy-tema-de-site
description: Cria um tema do Refy a partir das cores, fontes e raios de um site que a pessoa indicar, e mostra uma tela com o tema aplicado. Use quando a pessoa pedir para clonar o estilo, extrair os tokens ou copiar a identidade visual de um endereço para usar com o Refy.
---

# Tema do Refy a partir de um site

Use as ferramentas do servidor MCP `refy`. Responda na língua da pessoa.

## Fluxo

1. **Leitura.** Chame `refy_theme_extract` com `url`. O servidor lê o HTML e o CSS servidos.
2. **Site montado por JavaScript.** Se a ferramenta disser que não achou cor de destaque, ou `source.observations` vier baixo (menos de 30), e você tiver um navegador (Claude in Chrome, Playwright, navegador do Codex): abra o site, leia o recurso `refy://theme-probe`, rode o script na página (se o resultado trouxer `frames`, a tela está num iframe: abra o endereço do frame e rode de novo lá) e chame `refy_theme_extract` de novo com `observations` igual ao campo `observations` do resultado.
3. **Arquivo.** Grave `theme` em `<name>.theme.json` na pasta de temas do projeto (ou em `src/themes/` se não houver uma).
4. **Explicação.** Mostre à pessoa, em lista curta, o que veio de onde: `decided` com a razão em `evidence` (ex.: "primária #7c5cff: variável --accent e fundo de botão"). Inclua `notes`, que dizem o que foi ajustado para passar no contraste AA.
5. **Prova.** Monte uma tela de exemplo com `ThemeProvider theme={tema}`: um cabeçalho, um cartão com texto, um botão primário e um campo. Rode `refy_validate` nela. Abra no servidor de desenvolvimento, em claro e escuro, para a pessoa comparar com o site.
6. **Fontes.** Se `decided.fontBody` ou `fontHeading` existirem, avise que a fonte precisa ser carregada no projeto (Google Fonts ou arquivo local) e ofereça fazer isso.

## Limites que você diz à pessoa

- Cores, fontes e marca do site pertencem a quem o fez. O tema serve de ponto de partida no projeto dela; não publique como tema do Refy nem como marca de outra pessoa.
- Endereço local ou de rede interna é recusado. Para site privado, peça o HTML/CSS e passe em `html`/`css`.
