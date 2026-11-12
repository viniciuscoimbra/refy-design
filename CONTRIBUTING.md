# Contribuir com o Refy

O Refy é uma biblioteca React sob MIT, mantida por Vinícius Coimbra. A licença
permite derivação; não licencia automaticamente marcas, fontes ou assets de terceiros.

## Antes de propor

Faça as três perguntas nesta ordem. A primeira resposta sim diz onde a mudança mora.

1. **O tema resolve?** Se o componente já lê um token ou uma variante que chega no
   visual que você quer, a mudança é no arquivo de tema do seu projeto. O refy não muda.
2. **É composição do seu produto?** Tela ou peça montada com componentes do refy fica
   no seu projeto, mesmo que se repita em várias telas.
3. **Falta prop ou token?** Aí é contribuição: o componente não tem como fazer isso, e a
   capacidade serve pra qualquer produto. Mostre a linha do componente que impede.

Se a resposta foi a terceira, abra uma issue "Falta no refy" com a tela que precisa e o
que o componente não deixa fazer. Faça a peça no seu projeto, em
`refy-extensions/<Nome>/`, com o patch e um `contribution.json`. Depois rode:

```bash
npx -p @refy-design/web refy contribute <Nome>
```

O comando testa a peça numa cópia do refy e escreve o PR. O passo a passo completo está
em [refy.design/contribuir](https://refy.design/contribuir).

## Propor e implementar

1. Descreva a necessidade em uma mudança OpenSpec, com proposal, design, specs e
   tasks. Inclua alternativas existentes, consumidores afetados e critérios de aceite.
2. Registre o escopo autorizado antes de implementar. Para uma nova família,
   justifique por que composição dos componentes existentes não resolve a necessidade.
3. Identifique responsável e revisor no PR. Vinícius é o mantenedor inicial e decide
   alterações incompatíveis e publicação. Contribuidores podem revisar; uma revisão
   feita pelo próprio agente autor deve se identificar, sem alegar independência.
4. Execute os testes aplicáveis e preencha a evidência por requisito/tarefa. Registre
   alterações de API, tokens, defaults e comportamento com um de–para e migração.
5. Sincronize specs implementadas e conclua o gate somente com os aceites atendidos.

O refy segue [versionamento semântico](https://semver.org/lang/pt-BR/): mudança que
quebra export, prop, token ou default só entra em versão major, com de–para e migração.
Não copie dados ou código privado para demonstrar compatibilidade; use fixtures sintéticas.

## O caminho do seu pull request

1. Abra o pull request contra `main`. O CI roda tipos, build e testes.
2. O mantenedor leva a mudança para o repositório de trabalho e roda a bateria
   completa, com testes de navegador em todos os temas.
3. Passou: o pull request é aprovado e entra na próxima versão como merge, com os
   seus commits e a sua autoria. Você aparece entre os contribuidores do GitHub e
   no CHANGELOG. Não passou: o pull request é fechado com o motivo e o teste que
   falhou.

O pull request não é mergeado sozinho antes da versão. Ele entra junto com ela,
para que `main` só tenha versões testadas.

## Desenvolvimento

Node 22.12 ou posterior, instalação pelo lockfile (`npm ci`). `npm run storybook`
abre o catálogo local; `npm run check` verifica tipos, build e distribuição.
Para revisar specs, instale `@fission-ai/openspec@1.5.0` e execute
`npm run check:specs`. O CI usa essa versão fixa.

O [contrato de qualidade](docs/QUALITY.md) explica camadas, maturidade, evidências
e exceções. Um build ou um grande número de stories não certifica uma família.

## Criar capacidades reutilizáveis

Leia o [guia avançado](docs/ADVANCED_ORGANISMS.md) e o [playbook do Coverflow](docs/ORGANISM_PLAYBOOK.md) antes de propor um organismo.
