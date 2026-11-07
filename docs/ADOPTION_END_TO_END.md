# Do Playground ao projeto instalado

Roteiro de adoção local verificado em 25/10/2026. O pacote permanece experimental e não publicado. O consumidor usa o tarball, sem alias para src, symlink ou dependência do Storybook em execução. O editor ajuda a configurar a identidade; a aplicação continua compondo telas com React.

## 1. Crie o tema

No Storybook local, abra Playground → Componentes → Personalizar tema:

1. Escolha Refy, Geométrico ou Fluido como ponto de partida.
2. Dê um nome ao tema; ajuste cores de claro e escuro separadamente. Dados · série 1…8 controlam os charts.
3. Em Tipografia, escolha o conjunto completo. Formas, dimensões e espaçamentos pertencem ao tema e não mudam ao trocar o modo.
4. Em Exportar, baixe o JSON de Tema aplicado e salve como `theme.json` no projeto. Importe esse JSON no ThemeProvider. A fonte também precisa estar carregada: use fonts.css para as famílias fornecidas, ou carregue sua própria fonte.

O teste desta rodada usa Geométrico, IBM Plex Sans/Mono, ações azul claro/escuro e série violeta própria em cada modo. Confere os valores realmente exportados e sua aplicação no build consumidor.

## 2. Instale o pacote local

Na raiz do Refy:

```bash
npm run check
npm run check:specs
npm pack
```

Copie `examples/react-starter` para uma pasta nova fora do repo. Nessa pasta:

```bash
npm install /caminho/refy-design-web-1.0.0.tgz
npm run build
npm run dev
```

Substitua o theme.json pelo seu JSON. Use imports públicos:

```tsx
import { Button, ThemeProvider } from '@refy-design/web';
import '@refy-design/web/tokens.css';
import '@refy-design/web/fonts.css';
import theme from './theme.json';

export function App() {
  return <ThemeProvider theme={theme} mode="system">
    <Button variant="primary" onClick={() => console.log('Ação da aplicação')}>Continuar</Button>
  </ThemeProvider>;
}
```

CSS de componentes acompanha os módulos usados no browser. global.css é reset opcional. styles.css é opt-in pela folha inteira e anula o benefício do CSS seletivo. Não use imports internos de dist nem copie a implementação de Button/Input.

## 3. Use componentes, um Block e D3

- **Componentes:** copie o exemplo da documentação e conecte seus eventos ao estado da aplicação. O starter já demonstra Input, Combobox, AvatarGroup e Modal.
- **Blocks:** no catálogo escolha Painel de projetos → Código. Copie **todos** os arquivos oferecidos, preservando nomes e caminhos: page.tsx, DashboardBlock.tsx e blocks.module.css. Importe Page na sua aplicação, dentro do ThemeProvider. O Block é código de composição editável; seus átomos/moléculas/organismos continuam vindo de @refy-design/web. Esse fluxo não é um gerador por CLI.
- **Charts:** escolha um exemplo em Charts → Código; importe D3Chart de @refy-design/web e forneça seus dados. Use tokens para identidade global ou colors/cor da série/colorScale para semântica específica. onSelect recebe ChartDatum, com label e values (não um campo value). A legenda interativa usa botões com aria-pressed; a tabela nativa de dados abre pelo sumário.

Os exemplos são locais: login não configura um provedor de identidade, tabela não salva no servidor e gráfico não busca uma API. Conecte seus próprios serviços.

## 4. Reproduza a verificação completa

Com Storybook local ativo e Node 22.12+, na raiz Refy:

```bash
REFY_DEMO_ROOT=$(mktemp -d /tmp/refy-adoption-XXXXXX)
REFY_THEME_EXPORT_PATH="$REFY_DEMO_ROOT/theme.json" \
REFY_BLOCK_EXPORT_DIR="$REFY_DEMO_ROOT/block" \
npx playwright test tests/consumer-export.spec.ts --project=chromium --workers=1 --reporter=list

npm pack --pack-destination "$REFY_DEMO_ROOT" --json
REFY_THEME_EXPORT_PATH="$REFY_DEMO_ROOT/theme.json" \
REFY_BLOCK_EXPORT_DIR="$REFY_DEMO_ROOT/block" \
node scripts/verify-local-package.mjs "$REFY_DEMO_ROOT/refy-design-web-1.0.0.tgz" "$REFY_DEMO_ROOT/consumers"
```

O exportador acima é automação de teste, não uma dependência do consumidor. O verificador preserva chamadas antigas sem as duas variáveis; com elas injeta a jornada adicional somente nos projetos de teste. Ele recusa saída existente, tema inválido, nomes inesperados e links nos arquivos do Block. Reutiliza a validação do editor e restaura o ambiente após carregá-la, para que a medição não inclua React de desenvolvimento.

Em terminais separados, sirva os builds, com portas livres:

```bash
# Dentro de consumers/18
npx vite preview --host 127.0.0.1 --port 6178 --strictPort
# Dentro de consumers/19
npx vite preview --host 127.0.0.1 --port 6179 --strictPort
```

Na raiz do Refy, execute para cada URL:

```bash
REFY_CONSUMER_URL=http://127.0.0.1:6178 npx playwright test \
  tests/consumer-install.spec.ts tests/consumer-overlays.spec.ts \
  tests/consumer-package-features.spec.ts tests/consumer-selective-css.spec.ts \
  tests/consumer-adoption.spec.ts \
  --project=chromium --project=webkit --workers=2 --reporter=list
# Repita com REFY_CONSUMER_URL=http://127.0.0.1:6179
```

## O que essa jornada comprova

Instalação real React/DOM 18.3.1 e 19.2.4, uma versão de React por consumidor, tipos sem skipLibCheck, SSR estático em Node sem loader CSS e build Vite. Tema exportado aplica fonte local, cor e forma; modo sistema acompanha a preferência sem perder o estado do Block. Em Chromium e WebKit, os testes cobrem menus em modal/drawer, foco, eventos de componentes, Block copiado concluindo um projeto e D3 com seleção, tooltip por foco, legenda e tabela. A jornada adicional é exercitada em 1280 e 375 px nos dois modos. Tabelas largas mantêm sua rolagem horizontal própria.

O relatório do verificador contém versões, hash do tarball, tamanhos gzip, tempo local e módulos avançados retidos por variante. Button/Input devem excluir D3/Prism e seus estilos; carregar CodeBlock dinamicamente deve carregar seu CSS somente nessa etapa. Instalação pode usar cache npm e os tempos não são benchmark universal.

## O que ainda falta para encerrar

A implementação desta jornada local não publica nem certifica a biblioteca. Para a **primeira prévia experimental**, faltam revisão do candidato/guia pelo mantenedor, decisão de versão/registry/host e autorização para consolidar/enviar/publicar, seguidas de CI e conferência do pacote/site publicados. São etapas de entrega, não uma nova reconstrução do catálogo.

Para declarar **estabilidade/certificação**, continuam os gates de leitores de tela adiados, revisão substantiva/rastreabilidade das fichas e pilotos/rollback de produtos existentes. Não há porcentagem global confiável calculada por número de checkboxes.

## Resultado da rodada

25/10/2026: 22 testes de navegador aprovados por consumidor (React 18 e 19), total 44, em Chromium/WebKit; exportação real de tema/Block aprovada; controles negativos do verificador aprovados. Audit npm completo desta rodada: zero avisos conhecidos. Isso é verificação automatizada datada, não auditoria independente de segurança ou acessibilidade. Recibo do artefato e logs ficam fora do tarball para preservar sua rastreabilidade sem checksum circular.
