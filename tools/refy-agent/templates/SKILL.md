---
name: refy
description: Monta, altera e revisa telas com o design system Refy (@refy-design/web) deste projeto. Use quando pedirem "quero instalar o refy", "usar o refy", "monta essa tela", "cria essa página", formulário, componente visual, tema, cores ou quando for mexer em qualquer JSX/TSX/CSS de interface.
---

# Telas com Refy

O Refy já vem com o próprio contexto em `node_modules/@refy-design/web/ai`: catálogo (`catalog.json`), uma ficha por família (`components/*.json`), regras (`instructions.md`) e escolha de controles (`control-choices.md`). Consulte esse material, não a memória.

## Instalar

Se `node_modules/@refy-design/web` não existir, peça o caminho do pacote (`.tgz`) e rode na raiz do projeto:

```sh
npx --yes --package <caminho/refy-design-web-x.y.z.tgz> refy init --from <caminho/refy-design-web-x.y.z.tgz>
```

O init é idempotente: instala o pacote, importa os CSS do Refy na entrada, envolve a raiz com `ThemeProvider`, escreve a seção "Telas são Refy" no AGENTS.md, esta skill e o script `refy:check`.

## Montar uma tela

1. Busque cada necessidade: `npm exec --offline -- refy catalog <termo>` (ex.: "busca", "tabela", "upload").
2. Leia a ficha da família escolhida: `npm exec --offline -- refy component <Nome>`. Use a API e os exemplos dela.
3. Importe só de `@refy-design/web` (ou `@refy-design/web/<Componente>`). Nunca de `dist/`, `src/` ou caminho absoluto.
4. Aparência vem do tema via `ThemeProvider` (cores, fontes, raios, sombras são tokens). O CSS da tela cuida de layout; sem cor literal.
5. Nada de `button`, `input`, `select` ou `textarea` crus: use `Button`, `Input`, `Select`, `Textarea` e afins.
6. Falta componente ou variação? Registre no arquivo de lacunas indicado na seção "Telas são Refy" do AGENTS.md e proponha no Refy. Não copie nem recrie o componente localmente.
7. Prancha para aprovação é a captura (Playwright) do código que monta a tela com Refy e o tema do projeto, gravada ao lado da origem e registrada no arquivo de aprovações (`boards.registry` no `refy-agent.config.json`). Imagem sem código de origem não vai para aprovação.
8. Antes de entregar: `npm run refy:check`. Exceção só em `refy-agent.config.json`, por arquivo, regra, motivo concreto e `count`.

## Componente novo: tema, produto ou Refy

Responda nesta ordem e pare na primeira resposta que resolver.

1. **Já existe?** Rode `npm exec --offline -- refy catalog <necessidade>`. Fonte: `ai/catalog.json`, campos `id`, `description` e `usage`.
2. **O tema resolve?** Rode `refy component <Nome>` e veja os tokens que o componente lê; a lista completa está em `themeTokens` do catálogo.
   - Valor que vale para todas as instâncias vai no tema do projeto.
   - Valor que vale só para algumas instâncias vai num `ThemeProvider` aninhado em volta delas. É escopo oficial; não use CSS por fora.
3. **Qual a finalidade?** Use o campo `area`: `actions`, `forms`, `navigation`, `feedback`, `data`, `content` ou `structure` (`componentAreas`).
4. **Qual a camada?** Use o campo `level`:
   - Átomo: um controle ou elemento.
   - Molécula: átomos juntos para uma tarefa.
   - Organismo: seção com estado e composição própria.
   - Veja `docs/ADVANCED_ORGANISMS.md`.
5. **É do produto?** Se a peça fala o vocabulário do produto, ou só junta componentes existentes para uma tela, ela fica no produto. Monte com peças Refy em `refy-extensions/` ou num Block.
6. **Falta no Refy?** O componente não expressa o valor por token nem por prop e qualquer produto usaria a peça. Então estenda localmente em `refy-extensions/<Nome>/`, com `contribution.json` informando finalidade, camada e coleção (`collections`, `core` se for de uso geral). Depois rode `npx -p @refy-design/web refy contribute <Nome>`.
   - Gera patch, PR, gates e imagens em `refy-contrib/<Nome>/`.
   - Não abre PR nem faz push.
   - O padrão novo não pode mudar o visual de quem já usa o componente.
