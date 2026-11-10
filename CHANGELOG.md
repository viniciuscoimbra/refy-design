# Changelog

O refy segue [versionamento semântico](https://semver.org/lang/pt-BR/) e o formato do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Cada versão separa o que foi adicionado, modificado, marcado como obsoleto, removido, corrigido e o que é de segurança. As seções abaixo da 1.0.0 registram o trabalho anterior ao primeiro lançamento público.

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
