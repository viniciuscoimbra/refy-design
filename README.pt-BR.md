# refy

<!-- badges:start -->
<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/viniciuscoimbra/refy-design"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/viniciuscoimbra/refy-design/ci.yml?branch=main"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/releases/latest"><img alt="Version" src="https://img.shields.io/github/v/release/viniciuscoimbra/refy-design"></a>
  <img alt="Node" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fviniciuscoimbra%2Frefy-design%2Fmain%2Fpackage.json&query=%24.engines.node&label=node">
  <a href="https://github.com/viniciuscoimbra/refy-design/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/viniciuscoimbra/refy-design"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/viniciuscoimbra/refy-design"></a>
</p>
<!-- badges:end -->

**Seu design, do seu jeito.** refy é um design system em React e TypeScript, para web e celular, feito para agentes de IA usarem bem. Um arquivo de tema muda a interface inteira, e os componentes mantêm o comportamento.

[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md)

## Links rápidos

- Site e documentação: [refy.design](https://refy.design)
- [Playground](https://refy.design/playground): escolha um tema, mude cores, fontes, formas e movimento, e exporte.
- [Templates](https://refy.design/templates): telas inteiras por finalidade, rodando com o refy.
- [Servidor MCP](docs/MCP.md) para Claude Code, Codex, Kiro e VS Code.
- [Changelog](CHANGELOG.md) · [Roadmap](docs/pt-BR/ROADMAP.md)

## Quando usar o refy

- Você quer a interface do produto com a sua identidade sem fazer fork de um design system. Tema é um arquivo JSON: cores, fontes, forma, espaçamento e movimento.
- Um agente de IA monta ou altera as suas telas. O refy traz catálogo versionado, CLI e servidor MCP, e o agente acha o componente certo e confere o próprio código.
- Você publica na web e no React Native com as mesmas props e o mesmo tema.
- O seu agente manda mensagens [A2UI](https://a2ui.org) e você quer que elas apareçam com o seu design system.

## Princípios

- **Personalização desde o início.** A aparência mora nos tokens. Trocar o arquivo de tema muda todos os componentes, sem CSS por fora.
- **Pouco código e build leve.** ESM, tree shaking e CSS por família. Uma tela com Button e Input não leva os gráficos junto.
- **Atomic design.** Página é composição de átomos, moléculas e organismos. Capacidade nova entra no componente, não num produto só.
- **Agentes primeiro.** Cada família tem API, exemplos, quando usar e quando usar outra, num formato que agente lê.

## Começar

| Caminho | O que você recebe |
|---|---|
| [Instalar num projeto React](#instalar) | `@refy-design/web` com o seu tema |
| [Partir de um projeto pronto](examples/react-starter/) | App Vite com um tema já exportado |
| [Usar por um agente](#usar-com-agentes) | O servidor MCP ou a CLI `refy-agent` |
| [Rodar o catálogo na sua máquina](#rodar-o-catálogo-na-sua-máquina) | Storybook com todas as famílias e o editor de tema |

## Pacotes

| Pacote | O que é | Versão |
|---|---|---|
| [`@refy-design/web`](https://www.npmjs.com/package/@refy-design/web) | Componentes React, temas, catálogo para agentes, CLI e servidor MCP | [![npm](https://img.shields.io/npm/v/@refy-design/web.svg)](https://www.npmjs.com/package/@refy-design/web) |
| [`@refy-design/mobile`](packages/native/README.md) | Componentes React Native com as mesmas props e o mesmo tema | [![npm](https://img.shields.io/npm/v/@refy-design/mobile.svg)](https://www.npmjs.com/package/@refy-design/mobile) |
| [`@refy-design/a2ui`](packages/a2ui/README.md) | O refy como catálogo A2UI 1.0, na web e no React Native | [![npm](https://img.shields.io/npm/v/@refy-design/a2ui.svg)](https://www.npmjs.com/package/@refy-design/a2ui) |

## Instalar

```bash
npm install @refy-design/web
```

Carregue os estilos uma vez e use os exports públicos:

```tsx
import '@refy-design/web/tokens.css';
import '@refy-design/web/fonts.css'; // opcional: fontes locais fornecidas pelo refy
import { Button, Input, ThemeProvider } from '@refy-design/web';
import type { RefyTheme } from '@refy-design/web';
import themeData from './theme.json';

const theme: RefyTheme = themeData;

export function Cadastro() {
  return (
    <ThemeProvider theme={theme} mode="system">
      <Input label="Nome completo" placeholder="Digite seu nome" />
      <Button variant="primary" onClick={() => console.log('Salvar')}>
        Salvar
      </Button>
    </ThemeProvider>
  );
}
```

`global.css` é um reset opcional para projeto novo e afeta a aplicação inteira. `fonts.css` também é opcional se o produto já carrega as próprias fontes. [Temas e exportação](docs/THEMING.md).

Next.js App Router (Server Components): [docs/NEXT_E_REACT_NATIVE.md](docs/NEXT_E_REACT_NATIVE.md). React Native: `npx expo install @refy-design/mobile react-native-svg`, com as mesmas props e o mesmo JSON de tema da web ([guia](packages/native/README.md)).

A2UI: `npm install @refy-design/a2ui` desenha as mensagens A2UI 1.0 de um agente com os componentes e o tema do refy, na web ou no React Native (`@refy-design/a2ui/native`) ([guia](packages/a2ui/README.md)).

## Usar com agentes

O pacote traz um catálogo versionado de componentes, APIs, exemplos e instruções. `catalog` aceita o nome exato ou a necessidade em português, inglês ou espanhol:

```bash
npm exec --offline -- refy-agent catalog tabela de dados
npm exec --offline -- refy-agent component Input
npm exec --offline -- refy-agent check src/Tela.tsx src/tela.css
```

O mesmo kit roda como servidor MCP. No Claude Code:

```bash
claude mcp add refy -- npx --no-install refy-mcp
```

São oito ferramentas: `refy_search` acha a família pela necessidade escrita em português, inglês ou espanhol; `refy_component` lê a API; `refy_collections` lista as coleções; `refy_validate` confere o código contra a API e as regras do `check`; `refy_theme_generate` e `refy_theme_validate` geram e conferem tema com contraste AA; `refy_theme_extract` tira o tema de um site; `refy_compare` compara a captura do original com a tela do refy. O servidor remoto (refy.design/mcp) tem as sete primeiras, porque não lê arquivos da sua máquina. [Outros clientes e limites](docs/MCP.md).

## O que há no catálogo

- **Componentes:** 123 famílias (33 átomos, 64 moléculas e 26 organismos), com uso, API, exemplos interativos e código copiável. Os 532 trechos tirados das fontes compilam contra a API pública.
- **Templates** (`Block` no código): telas inteiras por finalidade, com prévia responsiva. [Guia](docs/BLOCKS.md).
- **Charts:** catálogo D3 com 24 tipos, eixos, legendas, tooltip, zoom, brush e streaming. [Contratos](docs/CHARTS.md).
- **Coleções:** mídia, geolocalização, conversação, dados, colaboração, comércio, financeiro e conteúdo. [Coleções](docs/COLLECTIONS.md).

Os exemplos guardam login, arquivos e preferências localmente. A sua aplicação liga autenticação, persistência, permissões e regras de negócio. Os limites de cada família estão em [docs/QUALITY.md](docs/QUALITY.md).

## Rodar o catálogo na sua máquina

Node **22.12+** e npm.

```bash
git clone https://github.com/viniciuscoimbra/refy-design.git
cd refy-design
npm ci
npm run storybook
```

Abra http://localhost:6006 e vá a **Playground → Componentes**. Escolha **Tema** e **Modo** na barra, ajuste o tema em **Personalizar tema** e baixe o JSON em **Exportar**.

```bash
npm run check            # tokens, contraste, motion, tipos, build e exemplos
npm run test:browser     # testes de interação
```

## Roadmap

O roadmap do projeto está em [docs/pt-BR/ROADMAP.md](docs/pt-BR/ROADMAP.md).

## Contribuir

Leia [docs/pt-BR/CONTRIBUTING.md](docs/pt-BR/CONTRIBUTING.md). As mudanças seguem o [OpenSpec](openspec/specs). O projeto funciona como descrito em [docs/pt-BR/GOVERNANCE.md](docs/pt-BR/GOVERNANCE.md), com as pessoas de [docs/pt-BR/MAINTAINERS.md](docs/pt-BR/MAINTAINERS.md).

[Código de conduta](docs/pt-BR/CODE_OF_CONDUCT.md) · [Segurança](docs/pt-BR/SECURITY.md) · [Suporte](docs/pt-BR/SUPPORT.md) · [Versões](docs/pt-BR/RELEASES.md) · [Quem usa](docs/pt-BR/ADOPTERS.md) · [Privacidade](PRIVACY.md) · [Avisos de terceiros](THIRD_PARTY_NOTICES.md)

## Licença

O refy está sob a licença [Apache 2.0](LICENSE), com o [NOTICE](NOTICE). As versões até a 1.9.3 saíram sob MIT. O nome e o logo do refy seguem [docs/pt-BR/TRADEMARKS.md](docs/pt-BR/TRADEMARKS.md).
