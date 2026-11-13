# Changelog

O refy segue [versionamento semântico](https://semver.org/lang/pt-BR/) e o formato do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Cada versão separa o que foi adicionado, modificado, marcado como obsoleto, removido, corrigido e o que é de segurança. As seções abaixo da 1.0.0 registram o trabalho anterior ao primeiro lançamento público.

## 1.7.0 (12/11/2026)

### Adicionado

- Cada família do catálogo de IA traz `maturity`, um dos quatro estados do QUALITY.md (`nao-avaliado`, `experimental`, `estavel`, `depreciado`), lido de `src/catalog/maturity.json`. Hoje as 122 famílias estão em `nao-avaliado`. `refy-agent catalog`, `refy-agent component` e o `refy_component` do MCP devolvem o campo (#16).
- O check recusa família promovida sem a evidência que o estado exige, com estado desconhecido, campo a mais ou nome fora do catálogo.

## 1.6.2 (12/11/2026)

### Corrigido

- O catálogo do site mostra a descrição de cada componente, e a busca do menu acha o componente pela descrição (#14).
- `AvatarGroup` anuncia o grupo no idioma da página e o "+N" sem botão é lido pelo leitor de tela (#15).
- **Mudança de comportamento:** tela sem `LocaleProvider` passa a ler o grupo do `AvatarGroup` em inglês ("3 people"), como o resto das mensagens. Quem passa um objeto de mensagens completo ganha a chave `avatarGroup.people`.

## 1.6.1 (12/11/2026)

### Corrigido

- A 1.6.0 não chegou ao npm: um teste do repositório falhava no CI público, que roda num contêiner onde o git recusa o checkout. O teste passa a ler a pasta quando o git não responde. O pacote é o mesmo da 1.6.0, com as correções das issues #6 a #13.

## 1.6.0 (12/11/2026)

Correções das issues #6 a #13, abertas por @iosbilario. Obrigado.

### Adicionado

- `Command` aceita `search(items, query)`: quem usa a paleta decide quais itens aparecem e em que ordem. Sem a propriedade, a busca continua como antes ([#7](https://github.com/viniciuscoimbra/refy-design/issues/7)).

### Corrigido

- A busca do site, do Playground e do `refy-agent catalog` acha termos em português e espanhol: "tabela" traz Table, "botao" traz Button e "senha" traz Input ([#7](https://github.com/viniciuscoimbra/refy-design/issues/7)).
- A página inicial baixa 274 KB de JavaScript comprimido em vez de 436 KB. A ficha dos componentes e os exemplos baixam quando a página precisa deles ou quando o navegador fica ocioso, e nunca com economia de dados ligada ([#6](https://github.com/viniciuscoimbra/refy-design/issues/6)).
- No celular, o título, a frase e os botões da abertura aparecem no primeiro quadro em vez de surgir depois de cerca de 2 segundos ([#9](https://github.com/viniciuscoimbra/refy-design/issues/9)).
- O editor de tema avisa no próprio campo quando a cor principal fica sem contraste com o texto e oferece usar texto preto ([#8](https://github.com/viniciuscoimbra/refy-design/issues/8)).
- O validador de tema não arredonda mais a razão de contraste antes de comparar com o mínimo e mostra a razão arredondada para baixo ([#8](https://github.com/viniciuscoimbra/refy-design/issues/8)).
- O tema escolhido na página inicial vale também no Playground, e o caminho inverso também ([#10](https://github.com/viniciuscoimbra/refy-design/issues/10)).
- `AvatarGroup` anuncia o nome de cada pessoa para leitores de tela, com ou sem foto ([#10](https://github.com/viniciuscoimbra/refy-design/issues/10)).
- A página /contribuir, o CLI, as skills e o template de issue mandam rodar `npx -p @refy-design/web refy contribute`, que não baixa um pacote `refy` de terceiros ([#11](https://github.com/viniciuscoimbra/refy-design/issues/11)).
- A label `gap`, usada pelo template "Falta no refy", passa a existir no repositório ([#12](https://github.com/viniciuscoimbra/refy-design/issues/12)).
- O CONTRIBUTING.md abre com o caminho para propor um componente: as perguntas antes de abrir, a issue "Falta no refy", a pasta `refy-extensions/` e o comando seguro ([#13](https://github.com/viniciuscoimbra/refy-design/issues/13)).

## 1.5.2 (12/11/2026)

### Adicionado

- Plugin `refy-local` no mesmo marketplace: roda o `refy-mcp` na sua máquina com `npx` (`@refy-design/web@1.5.2`) e traz `refy-tela`, `refy-tema-de-site` e `refy-reproduzir-tela`, que usa `refy_compare`.

### Modificado

- O plugin `refy` liga o servidor remoto `https://refy.design/mcp` em vez de rodar o `refy-mcp` com `npx`. O diretório de plugins do Claude só aceita servidor que roda na máquina de quem usa vindo de organização verificada. Sem instalar nada, o plugin traz `refy-tela` e `refy-tema-de-site`.

### Removido

- O plugin `refy` deixa de trazer `refy-reproduzir-tela`, a conferência por `files` e o Playwright do projeto em `refy_theme_extract`, que precisam do servidor na sua máquina. Para tê-los, instale `refy-local@refy` no lugar de `refy@refy`.

## 1.5.1 (11/11/2026)

### Adicionado

- `PRIVACY.md`: o que o pacote, o plugin e os servidores MCP local e remoto leem, enviam e guardam (nada é guardado).
- `server.json` descreve o servidor remoto para o registro oficial de servidores MCP.

### Modificado

- O plugin fixa a versão exata do pacote (`@refy-design/web@1.5.1`) em vez de `^1.5.0`. Os diretórios de plugins do Claude e do OpenAI recusam `npx` com faixa de versão; cada release sobe o plugin junto com o pacote.
- O README do plugin diz o que ele roda e o que envia, e traz privacidade e suporte. O manifesto do Codex ganha ícone, privacidade, termos e suporte.

## 1.5.0 (11/11/2026)

### Adicionado

- `refy search <necessidade>`: a mesma busca do `refy_search` na linha de comando, em português, inglês ou espanhol.

### Modificado

- `refy catalog` responde a necessidade além do nome: `catalog tabela` e `catalog login` voltavam vazios e agora trazem Table e GoogleButton primeiro. O nome exato de família ou de membro da API continua respondendo pelo casamento literal.
- A busca (`refy_search` e `refy catalog`) não sobe mais família que cita o termo só para recusá-lo ("no nested submenus", "instead of hiding the table"), dá peso ao nome da família e lê "data table" e "tabela de dados" como tabela.
- Cada componente leva para a tela só o próprio texto pronto. Antes, Tabs, Pagination, Callout, Table e outros 65 levavam o texto em inglês de todos os componentes: o JS gzip mediano por família cai de 6,5 KB para 1,8 KB. `LocaleProvider` continua trazendo os três idiomas.
- `tokens.css` declara uma vez o que é igual nos modos claro, escuro e editorial: de 98 KB para 54 KB (8,0 KB para 6,8 KB gzip), com os mesmos valores computados.

### Corrigido

- `Modal`: as ações do rodapé quebram linha quando não cabem lado a lado, em vez de serem cortadas num diálogo da largura de um celular.
- O README dizia 118 famílias, seis ferramentas no MCP e React Native "em breve". São 122 famílias, oito ferramentas e `@refy-design/mobile` está no npm.

## 1.4.0 (10/11/2026)

### Modificado

- **Mudança de comportamento:** `ThemeProvider` dentro de outro herda o que o escopo de fora calculou e aplica só o próprio tema. Ele não pinta fundo e não muda fonte, tamanho, entrelinha nem quebra de palavra. Com `mode` diferente do pai, aplica os papéis daquele modo e a cor do texto, e reaplica os temas de fora no modo novo. Antes, todo provider aninhado voltava à fundação inteira: virava uma caixa com `--bg`, voltava o texto ao tamanho do tema e apagava o que o escopo de fora tinha sobreposto. Token derivado (`--field-radius: var(--control-radius)`) resolve com o token do aninhado; se o tema de fora fixou o derivado com valor, esse valor continua valendo. Para manter o comportamento antigo numa vitrine, numa prévia de outro tema ou numa troca de identidade inteira, passe `isolate`.
- **Mudança de comportamento:** o escopo do Refy usa `overflow-wrap: normal`; antes era `anywhere`, que quebrava palavra entre letras em barra estreita. Para voltar, defina `--scope-overflow-wrap: anywhere` no tema.
- **Mudança de comportamento:** no `Hero`, a margem de baixo de `--hero-title-margin` passa a valer e `--hero-align` vale também abaixo de 720 px. Tema que declarava a margem sem querer a de baixo usa `calc(var(--hero-title-descender, 0.12em) * -1)` no terceiro valor, como os temas incluídos.
- `--site-footer-columns` passa a ser o template inteiro da grade do `SiteFooter`; a contagem de colunas que o componente escrevia virou `--site-footer-column-count`.
- `refy check` aceita hook ou token do tema declarado no CSS da tela com `var(--token)`, em qualquer seletor, media query ou pseudo-classe. Com valor literal, continua erro.
- `refy check` dá um aviso `unverified-token` por token, com a contagem de usos, e trata como verificado o que o tema do projeto declara (`--theme <arquivo>` ou `theme.json` na raiz). `refy_validate` aceita `theme`.
- Os temas Cobalto e Terracota declaram a cor primária do claro em `modes.light`, sem mudar a aparência.

### Adicionado

- `isolate` no `ThemeProvider`.
- `refy check` avisa `class-override` quando uma classe passada a componente do Refy muda cor, fundo, borda, raio, sombra ou fonte, e sugere o hook da família. O catálogo leva os hooks que o CSS de cada família lê.
- `refy_theme_validate` avisa `token-shadowed-by-mode` quando o mesmo token está em `tokens` e num modo. `docs/THEMING.md` explica a precedência, os escopos aninhados e o tema derivado.
- Hooks de medida: `--chip-padding-inline`, `--chip-gap`, `--chip-icon-size`, `--badge-height`, `--badge-padding-inline`, `--badge-radius`, `--bubble-padding`, `--bubble-max-width`, `--bubble-radius`, `--bubble-tail-radius`, `--bubble-end-border-width`, `--icon-button-icon-md`, `--icon-button-icon-lg`, `--switch-thumb-inset`, `--switch-track-off`, `--input-prefix-color`, `--field-font-family`, `--hero-lead-leading`.
- `Button`: borda por variante (`--button-primary-border-width`, `--button-secondary-border-width`, `--button-ghost-border-width`, `--button-danger-border-width`) e `--button-white-space`.
- `PlanCard`: `description`, `ctaPosition` e `--plan-card-tag-inset-inline`. `SiteFooter`: `--site-footer-heading-weight` e `--site-footer-link-gap`.

### Corrigido

- O polegar do `Switch` anda o que sobra da largura, do polegar e do recuo; antes andava 16 px fixos.

## 1.3.4 (10/11/2026)

### Corrigido

- A 1.3.3 ficou no repositório sem tag nem release, porque o GitHub recusou criar a tag pela API. O release cria a tag anotada pelo git e, se for recusado, publica com tag leve, e a 1.3.4 leva ao npm o conteúdo da 1.3.1 à 1.3.3.

## 1.3.3 (10/11/2026)

### Corrigido

- A 1.3.2 ficou no repositório sem tag nem release: a tag criada pelo release agora é anotada pelo mantenedor e conferida pelo commit para onde aponta, e a 1.3.3 leva ao npm o conteúdo da 1.3.1 e da 1.3.2.

## 1.3.2 (10/11/2026)

### Adicionado

- A doc de cada componente diz desde que versão a família e cada propriedade existem, e marca a propriedade obsoleta com a troca. O histórico sai das tags de release (`src/catalog/versions.json`), e a verificação recusa remover família ou propriedade dentro da mesma versão maior.

### Corrigido

- A 1.3.1 ficou só no release do GitHub e não chegou ao npm. A 1.3.2 leva o conteúdo dela ao npm.

## 1.3.1 (10/11/2026)

### Adicionado

- `ChipGroup`: rótulo, setas, Home e End e foco único para Chips de escolha única ou múltipla. Chip com `selectionMode="radio"` fora do grupo avisa em desenvolvimento.
- O servidor MCP informa a versão que o npm instala hoje (`publishedVersion`) e avisa quando a documentação lida é de outra. As ferramentas aceitam `version` para ler a API de uma versão anterior e declaram `annotations` (só leitura).
- `refy check` marca prop deprecada (`deprecated-prop`) com a substituta, e todo achado de cor, fonte, raio ou sombra literal traz `suggestion` com o token ou componente a usar.

### Modificado

- Rótulo do `Range` e do `Slider` usa o rótulo de campo do tema, igual ao do `Input`.
- README e `docs/THEMING.md` explicam que o esbuild leva a folha inteira pela raiz do pacote e mostram o import direto por componente.

### Corrigido

- O sufixo do valor no `ContentCard` desce inteiro quando não cabe, sem quebrar o número.

## 1.3.0 (09/11/2026)

### Adicionado

- Plugin do Refy para Claude Code, app do Claude, Cowork e Codex, instalado pelo repositório (`/plugin marketplace add viniciuscoimbra/refy-design`, `codex plugin marketplace add viniciuscoimbra/refy-design`), com os atalhos `refy-tela`, `refy-tema-de-site` e `refy-reproduzir-tela`. Extensão `refy.mcpb` para o chat do Claude Desktop no release.
- `refy_theme_extract`: tema claro e escuro a partir das cores, fontes e raios de um site, com a razão de cada escolha e contraste AA conferido. Sonda `refy://theme-probe` para ler site montado por JavaScript no navegador do agente. O jeito de botão, cartão, campo e selo vira token, e o que o Refy não recebe volta como lacuna com a rota de extensão.
- `refy_compare`: compara a captura do original com a da tela do Refy e mostra onde diferem.

### Segurança

- `refy_theme_extract` com `url` só fala com endereço público: confere o IP para onde o nome aponta, cada redirecionamento e cada pedido feito pela página no navegador, e conecta no IP conferido.

## 1.2.0 (09/11/2026)

### Adicionado

- Servidor MCP no pacote `@refy-design/web` (`npx --no-install refy-mcp`). O agente acha a família pela necessidade escrita em português, inglês ou espanhol, lê a API, confere o código contra o contrato dos componentes e gera tema claro e escuro com contraste AA a partir de uma cor. Configuração em `docs/MCP.md`.

## 1.1.0 (07/11/2026)

### Adicionado

- Novo pacote `@refy-design/mobile`: os componentes do Refy em React Native, com o mesmo contrato de props da web (`npx expo install @refy-design/mobile react-native-svg`).

## 1.0.0 (07/11/2026)

Primeira versão pública.

### Adicionado

- 118 famílias de componentes React e TypeScript em átomos, moléculas e organismos, com API, exemplos e teclado documentados.
- Tema por arquivo: um JSON define cor, fonte, forma, espaço e movimento. Temas Refy, Fluido, Terracota e Cobalto incluídos.
- Kit para agentes de código (`refy-agent catalog`, `component`, `inspect`, `check`) instalado junto com o pacote.
- Pacote `@refy-design/web` no npm (`npm install @refy-design/web`), com o `.tgz` também anexado ao release `v1.0.0`.
- Site [refy.design](https://refy.design) com páginas estáticas por rota, sitemap, `llms.txt` e `llms-full.txt`.
- Testes de navegador em Chromium, Firefox e WebKit no CI público, e a publicação passa por varredura de segredos no código e no pacote.
- Código de conduta, governança e mantenedores publicados.

### Obsoleto

- `ContentCard` (e o nome antigo `PropertyCard`): `address`, `price` e `priceSuffix` continuam funcionando e podem sair a partir da 2.0.0. Use `subtitle`, `value` e `valueSuffix`.

## Fechamento técnico local —31/10/2026

- Button loading respeita movimento reduzido também sem ThemeProvider/reset global opcional; a correção limita iterações no reset local, preservando o ciclo e a aparência normais.

- Correção restrita da cadeia de desenvolvimento do Storybook: docgen resolve glob14.0.2/minimatch11.0.1, com descoberta TSX ESM/CJS e controles negativos. Storybook8.6.19 e o override uuid permanecem; dependências e implementação de runtime preservadas. Audit runtime/dev sem alertas na rodada datada.
- O fixture de consumidor instalado aplica a mesma restrição de largura do exemplo no Storybook. Essa correção estrutural não encerra diferenças de pixels.
- Testes nativos observam estado pressionado durante eventos confiáveis, abertura, fechamento e seleção; a pintura do popup do sistema continua sem certificação pela captura de página.
- Tudo local. Gates visuais/assistivos, revisão humana e publicação permanecem separados.

## Capacidades e autoria —30/10/2026

- Core e oito coleções complementam Atomic Design e áreas; filtros e harness usam a fonte curada compartilhada. Coleções não são pacotes setoriais nem certificados de maturidade.
- Coverflow finito como organismo genérico, com seleção por ID, ativação, teclado, gesto/cancelamento e hooks públicos de geometria. Sem autoplay ou assets de produtos.
- GeoAreaPicker demonstra mapa D3 local sintético por adapter. ConversationBlock compõe organismos existentes com exemplos inline/Drawer e coordenação de envio/erro/repetição/cancelamento. Sem backend integrado.
- Catálogo atual:118 famílias/499 exemplos. [Autoria avançada](docs/ADVANCED_ORGANISMS.md) e [playbook do Coverflow](docs/ORGANISM_PLAYBOOK.md) mostram como estender o Refy com API, tema e provas reais.

## Desenvolvimento local — 29/10/2026
- Kit para agentes com catálogo gerado da documentação, consulta por componente, inspeção estática, exceções justificadas e piloto React antes/depois. Sem modelo, telemetria ou parser no runtime da UI. [Guia e limites](docs/AGENT_ADOPTION.md).
- CardHeader oferece tamanho compacto opcional; Command aceita largura e descrição pesquisável por item. Defaults e APIs existentes preservados.
- Refy Site: filtro de período funcional, cópia do exemplo de Accordion, busca com descrições e navegação que retorna ao início da página.
- Revisão das 117 famílias e fidelidade das referências continuam sujeitas aos gates do OpenSpec. Esta lista registra alterações locais, sem declarar aceite integral ou publicação.

## Adoção local — 25/10/2026
- Roteiro ponta a ponta do editor ao consumidor limpo, com tema exportado e arquivos reais de Block; React 18/19, tipos, SSR, build e fluxos.
- Verificador aceita tema/Block opcionais, recusa entradas inválidas e preserva ambiente de produção na medição. Sem mudança de API pública ou publicação.
- [Guia](docs/ADOPTION_END_TO_END.md).

## Alterações locais em revisão — 24/10/2026
- Charts com oito cores próprias de dados nos dois modos, editor visual e respeito a colorScale explícito.
- Blocks com títulos humanos; prévia/código e dispositivos com ícones, Tooltip e teclado no Segmented compartilhado.
- [De–para de charts e controles](docs/CHART_VISUAL_LANGUAGE.md).
- Tipografia com seis conjuntos pesquisáveis, nomes completos e papéis editorial/mono atualizados; artigo Lorem ipsum longo com sumário.
- Charts D3 e Blocks com navegação documental lateral, uma seleção por vez; entrada pública Demonstração.
- OAuthButton compõe controles existentes para oito provedores; login em duas colunas demonstra Google/GitHub/Apple.
- Storybook ignora HTML gerado de build/testes para preservar estado da prévia durante revisão.
Nenhuma publicação. [De–para](docs/PLAYGROUND_CATALOGS.md).

## Não publicado — candidato local da primeira prévia

Versão de trabalho no pacote: 0.4.0. Ainda sem tag ou nova release pública; a versão definitiva será escolhida antes de qualquer publicação.

- Editor visual de tema completo com exportação/importação JSON; identidade e modo independentes.
- Catálogo Atomic Design com documentação e exemplos compiláveis, Blocks responsivos, tipografia neutra e jornadas locais de Acesso/Setup/Aplicação.
- Catálogo D3, zoom/brush e streaming conforme tipo de gráfico.
- Distribuição ESM preserva módulos; controles básicos não devem reter D3/Prism. Imports públicos e estilos existentes preservados; CSS seletivo acompanha componentes usados no browser; styles.css conserva o opt-in agregado. Export Node sem CSS preserva SSR nativo.
- BlogBlock conserva o nome e assinatura sem props, mas agora usa Lorem ipsum. Artigo autoral e imagens antigos retirados da distribuição; consumidores que dependiam daquele conteúdo precisam fornecer seu próprio artigo.

Compatibilidade verificada com React 18.3.1 e 19.2.4. Sem certificação de acessibilidade ou homologação de produtos. Não interpretar esta lista como histórico de versões já publicadas.

- Correção da cadeia de desenvolvimento Storybook: uuid 11.1.1 restrito ao addon-actions, sem alertas conhecidos no audit da rodada.

- Auditoria do CSS seletivo: prioridade de estilos em ActivityItem, CodeBlock e IntentComposer; foco genérico scoped/reset como fallback, sem segundo contorno em campos compostos. Catálogo instalado comparado com a folha completa nos modos claro/escuro.
