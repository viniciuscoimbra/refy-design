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

**Your design, your way.** refy is a React and TypeScript design system for web and mobile, built for AI agents to use well. One theme file changes the whole interface; the components keep their behavior.

[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md)

## Quick links

- Site and docs: [refy.design](https://refy.design/en)
- [Playground](https://refy.design/en/playground): pick a theme, change colors, fonts, shapes and motion, and export it.
- [Templates](https://refy.design/en/templates): full screens for a purpose, running on refy.
- [MCP server](docs/MCP.md) for Claude Code, Codex, Kiro and VS Code.
- [Changelog](CHANGELOG.md) · [Roadmap](ROADMAP.md)

## When to use refy

- You want a product interface with your own identity without forking a design system. A theme is one JSON file: colors, fonts, shape, spacing and motion.
- An AI agent builds or changes your screens. refy ships a versioned catalog, a CLI and an MCP server, so the agent looks up the right component and checks its own code.
- You ship on the web and in React Native with the same props and the same theme.
- Your agent sends [A2UI](https://a2ui.org) messages and you want them drawn with your design system.

## Principles

- **Customization from the start.** The look lives in tokens. Changing the theme file changes every component, with no CSS on the side.
- **Low cost of code and build.** ESM, tree shaking and CSS per family. A screen with Button and Input does not carry charts.
- **Atomic design.** Pages are compositions of atoms, molecules and organisms. New capability goes into a component, not into one product.
- **Agents first.** Every family has its API, examples, when to use it and when to use another one, in a form that agents read.

## Getting started

| Path | What you get |
|---|---|
| [Install in a React project](#install) | `@refy-design/web` with your theme |
| [Start from a template project](examples/react-starter/) | A Vite app with a theme already exported |
| [Use it from an agent](#use-with-agents) | The MCP server or the `refy-agent` CLI |
| [Run the catalog locally](#run-the-catalog-locally) | Storybook with every family and the theme editor |

## Packages

| Package | What it is | Version |
|---|---|---|
| [`@refy-design/web`](https://www.npmjs.com/package/@refy-design/web) | React components, themes, agent catalog, CLI and MCP server | [![npm](https://img.shields.io/npm/v/@refy-design/web.svg)](https://www.npmjs.com/package/@refy-design/web) |
| [`@refy-design/mobile`](packages/native/README.md) | React Native components with the same props and theme | [![npm](https://img.shields.io/npm/v/@refy-design/mobile.svg)](https://www.npmjs.com/package/@refy-design/mobile) |
| [`@refy-design/a2ui`](packages/a2ui/README.md) | refy as an A2UI 1.0 catalog, for web and React Native | [![npm](https://img.shields.io/npm/v/@refy-design/a2ui.svg)](https://www.npmjs.com/package/@refy-design/a2ui) |

## Install

```bash
npm install @refy-design/web
```

Load the styles once and use the public exports:

```tsx
import '@refy-design/web/tokens.css';
import '@refy-design/web/fonts.css'; // optional: local fonts shipped by refy
import { Button, Input, ThemeProvider } from '@refy-design/web';
import type { RefyTheme } from '@refy-design/web';
import themeData from './theme.json';

const theme: RefyTheme = themeData;

export function SignUp() {
  return (
    <ThemeProvider theme={theme} mode="system">
      <Input label="Full name" placeholder="Type your name" />
      <Button variant="primary" onClick={() => console.log('Save')}>
        Save
      </Button>
    </ThemeProvider>
  );
}
```

`global.css` is an optional reset for new projects and affects the whole app. `fonts.css` is optional if your product already loads its fonts. [Themes and export](docs/THEMING.md).

Next.js App Router (Server Components): [docs/NEXT_E_REACT_NATIVE.md](docs/NEXT_E_REACT_NATIVE.md). React Native: `npx expo install @refy-design/mobile react-native-svg`, with the same props and the same theme JSON as the web ([guide](packages/native/README.md)).

A2UI: `npm install @refy-design/a2ui` draws an agent's A2UI 1.0 messages with refy components and theme, on the web or in React Native (`@refy-design/a2ui/native`) ([guide](packages/a2ui/README.md)).

## Use with agents

The package ships a versioned catalog of components, APIs, examples and instructions. `catalog` takes the exact name or the need in English, Portuguese or Spanish:

```bash
npm exec --offline -- refy-agent catalog data table
npm exec --offline -- refy-agent component Input
npm exec --offline -- refy-agent check src/Screen.tsx src/screen.css
```

The same kit runs as an MCP server. In Claude Code:

```bash
claude mcp add refy -- npx --no-install refy-mcp
```

It has 8 tools: `refy_search` finds the family for a need written in English, Portuguese or Spanish; `refy_component` reads the API; `refy_collections` lists the collections; `refy_validate` checks code against the API and the `check` rules; `refy_theme_generate` and `refy_theme_validate` create and check a theme with AA contrast; `refy_theme_extract` pulls a theme from a site; `refy_compare` compares a capture of the original with the refy screen. The remote server (refy.design/mcp) has the first seven, because it does not read files from your machine. [Other clients and limits](docs/MCP.md).

## What is in the catalog

- **Components:** 122 families (33 atoms, 63 molecules and 26 organisms), with usage, API, interactive examples and copyable code. The 524 snippets taken from the sources compile against the public API.
- **Templates** (`Block` in code): full screens for a purpose, with responsive preview. [Guide](docs/BLOCKS.md).
- **Charts:** a D3 catalog with 24 types, axes, legends, tooltip, zoom, brush and streaming. [Contracts](docs/CHARTS.md).
- **Collections:** media, geolocation, conversation, data, collaboration, commerce, finance and content. [Collections](docs/COLLECTIONS.md).

Examples keep login, files and preferences local. Your app connects authentication, persistence, permissions and business rules. Limits of each family are in [docs/QUALITY.md](docs/QUALITY.md).

## Run the catalog locally

Node **22.12+** and npm.

```bash
git clone https://github.com/viniciuscoimbra/refy-design.git
cd refy-design
npm ci
npm run storybook
```

Open http://localhost:6006 and go to **Playground → Components**. Pick **Theme** and **Mode** in the toolbar, adjust the theme in **Customize theme**, and download the JSON in **Export**.

```bash
npm run check            # tokens, contrast, motion, types, build and examples
npm run test:browser     # interaction tests
```

## Roadmap

The project roadmap is in [ROADMAP.md](ROADMAP.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Changes follow [OpenSpec](openspec/specs). The project is run as described in [GOVERNANCE.md](GOVERNANCE.md), with the people in [MAINTAINERS.md](MAINTAINERS.md).

[Code of conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md) · [Support](SUPPORT.md) · [Releases](RELEASES.md) · [Adopters](ADOPTERS.md) · [Privacy](PRIVACY.md) · [Third-party notices](THIRD_PARTY_NOTICES.md)

## License

refy is licensed under [Apache 2.0](LICENSE), with the [NOTICE](NOTICE). Versions up to 1.9.3 were released under MIT. The refy name and logo follow [TRADEMARKS.md](TRADEMARKS.md).
