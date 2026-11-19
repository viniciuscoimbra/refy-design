# Changelog

[Português](docs/pt-BR/CHANGELOG.md) · [Español](docs/es/CHANGELOG.md)

All notable changes to refy are recorded here. The format follows [Keep a Changelog 1.1](https://keepachangelog.com/en/1.1.0/) and refy follows [Semantic Versioning](https://semver.org/). Each version groups its changes into Added, Changed, Deprecated, Removed, Fixed and Security.

## [Unreleased]

## [1.9.4] - 2026-11-18

### Added

- Project documents in English, Portuguese and Spanish: governance, maintainers, security, code of conduct, support, trademarks, releases, roadmap and adopters. The README, CONTRIBUTING and this CHANGELOG also come in the three languages.
- Issue forms for bugs, feature requests and documentation. Security reports go through the private advisory of the repository.

### Changed

- The license changes from MIT to Apache 2.0 in `@refy-design/web` and `@refy-design/a2ui` 0.2.1. The [NOTICE](NOTICE) ships with the packages: whoever redistributes keeps the license and the NOTICE, and the refy name is not covered by the license. Versions up to 1.9.3 stay under MIT.
- The CHANGELOG is written in English in the Keep a Changelog format, with dates in ISO format and links to compare each version.
- The site footer says "Maintained by Vinícius Coimbra and contributors", and the contributors link opens the list on GitHub. The maintainers page names the lead maintainer.

## [1.9.3] - 2026-11-18

### Added

- `@refy-design/a2ui` 0.2.0 with React Native: `@refy-design/a2ui/native` draws the same agent JSON with the same 12 pieces on `@refy-design/mobile`, using the theme of the app's `RefyProvider`. The `openUrl` function opens through `Linking`, and surface errors (refused function, link the system cannot open, invalid expression) reach the `onError` of `A2uiNativeSurface`.

### Changed

- In `@refy-design/a2ui`, `@a2ui/react`, `react-dom`, `@refy-design/web`, `@refy-design/mobile` and `react-native` become optional peers: each app installs only its platform's. On the web, install `@a2ui/react@0.15.0` alongside.

## [1.9.2] - 2026-11-18

### Changed

- The site downloads only what each page uses: GSAP stays in the home page scroll scenes and arrives after the first paint, documentation text arrives per page and per family, and the source tokens JSON left the first load. The home page in Portuguese downloads 233 KB of gzipped JavaScript instead of 287 KB, and a component page 330 KB instead of 462 KB. The look and the published packages do not change.

## [1.9.1] - 2026-11-15

### Fixed

- 1.9.0 was not published to npm; everything in it is in 1.9.1.

## [1.9.0] - 2026-11-15

### Added

- New package `@refy-design/a2ui` 0.1.0: refy components as an [A2UI](https://a2ui.org) 1.0 catalog, with id `https://refy.design/a2ui/v1` and 12 components (Text, Image, Row, Column, List, Card, Divider, Button, TextField, CheckBox, ChoicePicker, Slider). An agent sends the messages; the React app draws them with refy's components and theme. Web only in this version: there is no React Native bridge yet.
- `@refy-design/a2ui/definition` has the catalog without React or the DOM, so the app's server can validate the agent's response with the same rules as the renderer. A component outside the catalog is rejected with `A2uiValidationError`.
- The release attaches the `@refy-design/a2ui` package and publishes it to npm when its version is not there yet.
- `node scripts/docs-sync.mjs --check` checks the README, docs, plugins, AI catalog, server.json and the site in pt, en and es against numbers and versions computed from the code (families, MCP tools and resources, D3 types, snippets, templates, languages) and rejects promises about the future for what already exists. It runs in check, in CI and in the promotion; in the tree the promotion exports, which has no git, it checks only the facts and ignores `test-results*` and `playwright-report*`.

### Fixed

- README: 524 compiled snippets, not 523.
- `docs/MCP.md`: the `version` example is the previous version the remote server loads; it said 1.2.0.
- REFY_SITE.md, THEMING.md and DESIGN.md: 122 families; they said 117 and 113.
- For AI, in pt, en and es: the MCP resource list includes `refy://theme-probe`.
- PLAYGROUND_CATALOGS.md: Charts has 24 types, not 24 families.

## [1.8.0] - 2026-11-13

### Added

- Each family in the AI catalog carries `mobile`: `igual`, `com-divergencia` or `so-web`, generated from `src/catalog/native-parity.json`. Today the counts are 12, 92 and 18. `refy-agent component` and the MCP `refy_component` return the field.
- `docs/INTERACTION_COVERAGE.md` lists the families with a click, keyboard or typing test: 21 of 122. The check refuses a drop in that number.
- After each release, a workflow renders Button, Input and Card straight from jsDelivr, without a bundler, and checks the theme and the console.

### Changed

- GOVERNANCE.md and CONTRIBUTING.md describe only the checks the promotion runs, and a test compares that list with the script.

## [1.7.0] - 2026-11-12

### Added

- Each family in the AI catalog carries `maturity`, one of the four QUALITY.md states (`nao-avaliado`, `experimental`, `estavel`, `depreciado`), read from `src/catalog/maturity.json`. Today all 122 families are `nao-avaliado`. `refy-agent catalog`, `refy-agent component` and the MCP `refy_component` return the field (#16).
- The check refuses a promoted family without the evidence its state requires, with an unknown state, an extra field or a name outside the catalog.

## [1.6.2] - 2026-11-12

### Fixed

- The site catalog shows each component's description, and the menu search finds a component by its description (#14).
- `AvatarGroup` announces the group in the page language, and the "+N" without a button is read by screen readers (#15).
- **Behavior change:** a screen without `LocaleProvider` now reads the `AvatarGroup` group in English ("3 people"), like every other message. Anyone passing a full messages object gets the new `avatarGroup.people` key.

## [1.6.1] - 2026-11-12

### Fixed

- 1.6.0 never reached npm: a repository test failed in the public CI, which runs in a container where git refuses the checkout. The test now reads the folder when git does not answer. The package is the same as 1.6.0, with the fixes for issues #6 to #13.

## [1.6.0] - 2026-11-12

Fixes for issues #6 to #13, opened by @iosbilario. Thank you.

### Added

- `Command` accepts `search(items, query)`: whoever uses the palette decides which items show and in what order. Without the prop, search works as before ([#7](https://github.com/viniciuscoimbra/refy-design/issues/7)).

### Fixed

- Search on the site, in the Playground and in `refy-agent catalog` finds Portuguese and Spanish terms: "tabela" brings Table, "botao" brings Button and "senha" brings Input ([#7](https://github.com/viniciuscoimbra/refy-design/issues/7)).
- The home page downloads 274 KB of compressed JavaScript instead of 436 KB. Component docs and examples download when a page needs them or when the browser is idle, and never with data saver on ([#6](https://github.com/viniciuscoimbra/refy-design/issues/6)).
- On mobile, the hero title, text and buttons show in the first frame instead of appearing after about 2 seconds ([#9](https://github.com/viniciuscoimbra/refy-design/issues/9)).
- The theme editor warns in the field itself when the main color loses contrast with the text, and offers black text ([#8](https://github.com/viniciuscoimbra/refy-design/issues/8)).
- The theme validator no longer rounds the contrast ratio before comparing it with the minimum, and shows the ratio rounded down ([#8](https://github.com/viniciuscoimbra/refy-design/issues/8)).
- The theme picked on the home page also applies in the Playground, and the other way around ([#10](https://github.com/viniciuscoimbra/refy-design/issues/10)).
- `AvatarGroup` announces each person's name to screen readers, with or without a photo ([#10](https://github.com/viniciuscoimbra/refy-design/issues/10)).
- The /contribuir page, the CLI, the skills and the issue template now say `npx -p @refy-design/web refy contribute`, which does not download a third-party `refy` package ([#11](https://github.com/viniciuscoimbra/refy-design/issues/11)).
- The `gap` label, used by the "Falta no refy" template, now exists in the repository ([#12](https://github.com/viniciuscoimbra/refy-design/issues/12)).
- CONTRIBUTING.md opens with the path to propose a component: the questions to ask first, the "Falta no refy" issue, the `refy-extensions/` folder and the safe command ([#13](https://github.com/viniciuscoimbra/refy-design/issues/13)).

## [1.5.2] - 2026-11-12

### Added

- `refy-local` plugin in the same marketplace: runs `refy-mcp` on your machine with `npx` (`@refy-design/web@1.5.2`) and brings `refy-tela`, `refy-tema-de-site` and `refy-reproduzir-tela`, which uses `refy_compare`.

### Changed

- The `refy` plugin connects the remote server `https://refy.design/mcp` instead of running `refy-mcp` with `npx`. The Claude plugin directory only accepts servers that run on the user's machine from verified organizations. With nothing to install, the plugin brings `refy-tela` and `refy-tema-de-site`.

### Removed

- The `refy` plugin no longer brings `refy-reproduzir-tela`, checking by `files` or the project's Playwright in `refy_theme_extract`, which need the server on your machine. To keep them, install `refy-local@refy` instead of `refy@refy`.

## [1.5.1] - 2026-11-11

### Added

- `PRIVACY.md`: what the package, the plugin and the local and remote MCP servers read, send and keep (nothing is kept).
- `server.json` describes the remote server for the official MCP server registry.

### Changed

- The plugin pins the exact package version (`@refy-design/web@1.5.1`) instead of `^1.5.0`. The Claude and OpenAI plugin directories refuse `npx` with a version range; each release bumps the plugin with the package.
- The plugin README says what it runs and what it sends, with privacy and support. The Codex manifest gets an icon, privacy, terms and support.

## [1.5.0] - 2026-11-11

### Added

- `refy search <need>`: the same search as `refy_search` on the command line, in Portuguese, English or Spanish.

### Changed

- `refy catalog` answers the need as well as the name: `catalog tabela` and `catalog login` used to come back empty and now bring Table and GoogleButton first. An exact family name or API member still answers through the literal match.
- Search (`refy_search` and `refy catalog`) no longer ranks a family that mentions the term only to rule it out ("no nested submenus", "instead of hiding the table"), gives weight to the family name and reads "data table" and "tabela de dados" as table.
- Each component ships only its own built-in text. Before, Tabs, Pagination, Callout, Table and 65 others shipped the English text of every component: the median gzip JS per family drops from 6.5 KB to 1.8 KB. `LocaleProvider` still brings all three languages.
- `tokens.css` declares once what is the same in the light, dark and editorial modes: from 98 KB to 54 KB (8.0 KB to 6.8 KB gzip), with the same computed values.

### Fixed

- `Modal`: footer actions wrap when they don't fit side by side, instead of being cut off in a phone-width dialog.
- The README said 118 families, six MCP tools and React Native "coming soon". There are 122 families, eight tools, and `@refy-design/mobile` is on npm.

## [1.4.0] - 2026-11-10

### Changed

- **Behavior change:** a `ThemeProvider` inside another inherits what the outer scope computed and applies only its own theme. It paints no background and does not change font, size, line height or word breaking. With a `mode` different from its parent, it applies that mode's roles and text color, and reapplies the outer themes in the new mode. Before, every nested provider went back to the whole foundation: it became a box with `--bg`, reset text to the theme size and erased what the outer scope had overridden. A derived token (`--field-radius: var(--control-radius)`) resolves with the nested token; if the outer theme fixed the derived token with a value, that value still applies. To keep the old behavior in a showcase, a preview of another theme or a whole identity switch, pass `isolate`.
- **Behavior change:** the Refy scope uses `overflow-wrap: normal`; it used to be `anywhere`, which broke words between letters in a narrow bar. To go back, set `--scope-overflow-wrap: anywhere` in the theme.
- **Behavior change:** in `Hero`, the bottom value of `--hero-title-margin` now applies and `--hero-align` also applies below 720 px. A theme that declared the margin without meaning the bottom one uses `calc(var(--hero-title-descender, 0.12em) * -1)` as the third value, like the bundled themes.
- `--site-footer-columns` is now the whole grid template of `SiteFooter`; the column count the component used to write became `--site-footer-column-count`.
- `refy check` accepts a hook or theme token declared in the screen CSS with `var(--token)`, in any selector, media query or pseudo-class. With a literal value, it is still an error.
- `refy check` gives one `unverified-token` warning per token, with the number of uses, and treats what the project theme declares as verified (`--theme <file>` or `theme.json` at the root). `refy_validate` accepts `theme`.
- The Cobalto and Terracota themes declare the light primary color in `modes.light`, with no change in appearance.

### Added

- `isolate` in `ThemeProvider`.
- `refy check` warns `class-override` when a class passed to a Refy component changes color, background, border, radius, shadow or font, and suggests the family's hook. The catalog carries the hooks each family's CSS reads.
- `refy_theme_validate` warns `token-shadowed-by-mode` when the same token is in `tokens` and in a mode. `docs/THEMING.md` explains precedence, nested scopes and derived themes.
- Measure hooks: `--chip-padding-inline`, `--chip-gap`, `--chip-icon-size`, `--badge-height`, `--badge-padding-inline`, `--badge-radius`, `--bubble-padding`, `--bubble-max-width`, `--bubble-radius`, `--bubble-tail-radius`, `--bubble-end-border-width`, `--icon-button-icon-md`, `--icon-button-icon-lg`, `--switch-thumb-inset`, `--switch-track-off`, `--input-prefix-color`, `--field-font-family`, `--hero-lead-leading`.
- `Button`: border per variant (`--button-primary-border-width`, `--button-secondary-border-width`, `--button-ghost-border-width`, `--button-danger-border-width`) and `--button-white-space`.
- `PlanCard`: `description`, `ctaPosition` and `--plan-card-tag-inset-inline`. `SiteFooter`: `--site-footer-heading-weight` and `--site-footer-link-gap`.

### Fixed

- The `Switch` thumb travels what is left of the width, thumb and inset; it used to travel a fixed 16 px.

## [1.3.4] - 2026-11-10

### Fixed

- 1.3.3 stayed in the repository without a tag or release, because GitHub refused to create the tag through the API. The release now creates the annotated tag with git and, if that is refused, publishes with a lightweight tag, and 1.3.4 takes the content of 1.3.1 through 1.3.3 to npm.

## [1.3.3] - 2026-11-10

### Fixed

- 1.3.2 stayed in the repository without a tag or release: the tag the release creates is now annotated by the maintainer and checked by the commit it points to, and 1.3.3 takes the content of 1.3.1 and 1.3.2 to npm.

## [1.3.2] - 2026-11-10

### Added

- Each component's doc says since which version the family and each property exist, and marks a deprecated property with its replacement. The history comes from the release tags (`src/catalog/versions.json`), and the check refuses to remove a family or property within the same major version.

### Fixed

- 1.3.1 stayed in the GitHub release only and did not reach npm. 1.3.2 brings its content to npm.

## [1.3.1] - 2026-11-10

### Added

- `ChipGroup`: label, arrow keys, Home and End, and a single focus stop for single- or multi-choice Chips. A Chip with `selectionMode="radio"` outside the group warns in development.
- The MCP server reports the version npm installs today (`publishedVersion`) and warns when the docs it read belong to another one. Tools accept `version` to read the API of an earlier version and declare `annotations` (read-only).
- `refy check` flags deprecated props (`deprecated-prop`) with the replacement, and every literal color, font, radius or shadow finding carries a `suggestion` with the token or component to use.

### Changed

- `Range` and `Slider` labels use the theme's field label, same as `Input`.
- README and `docs/THEMING.md` explain that esbuild pulls the whole stylesheet through the package root and show the direct per-component import.

### Fixed

- The value suffix in `ContentCard` wraps as a whole when it doesn't fit, without breaking the number.

## [1.3.0] - 2026-11-09

### Added

- Refy plugin for Claude Code, the Claude app, Cowork and Codex, installed from the repository (`/plugin marketplace add viniciuscoimbra/refy-design`, `codex plugin marketplace add viniciuscoimbra/refy-design`), with the `refy-tela`, `refy-tema-de-site` and `refy-reproduzir-tela` shortcuts. `refy.mcpb` extension for Claude Desktop chat in the release.
- `refy_theme_extract`: light and dark theme from a site's colors, fonts and radii, with the reason for each choice and AA contrast checked. The `refy://theme-probe` probe reads sites built by JavaScript in the agent's browser. The look of buttons, cards, fields and badges becomes tokens, and what Refy doesn't take comes back as a gap with the extension route.
- `refy_compare`: compares the capture of the original with the Refy screen and shows where they differ.

### Security

- `refy_theme_extract` with `url` only talks to public addresses: it checks the IP the name points to, every redirect and every request the page makes in the browser, and connects to the checked IP.

## [1.2.0] - 2026-11-09

### Added

- MCP server in the `@refy-design/web` package (`npx --no-install refy-mcp`). The agent finds the family from a need written in Portuguese, English or Spanish, reads the API, checks the code against the component contract and generates a light and dark theme with AA contrast from one color. Setup in `docs/MCP.md`.

## [1.1.0] - 2026-11-07

### Added

- New package `@refy-design/mobile`: the Refy components in React Native, with the same props contract as the web (`npx expo install @refy-design/mobile react-native-svg`).

## [1.0.0] - 2026-11-07

First public version.

### Added

- 118 React and TypeScript component families in atoms, molecules and organisms, with API, examples and keyboard documented.
- Theme as a file: one JSON sets color, font, shape, spacing and motion. Refy, Fluido, Terracota and Cobalto themes included.
- Kit for coding agents (`refy-agent catalog`, `component`, `inspect`, `check`) installed with the package.
- Package `@refy-design/web` on npm (`npm install @refy-design/web`), with the `.tgz` also attached to the `v1.0.0` release.
- [refy.design](https://refy.design) site with static pages per route, sitemap, `llms.txt` and `llms-full.txt`.
- Browser tests on Chromium, Firefox and WebKit in the public CI, and publishing runs a secret scan over the code and the package.
- Code of conduct, governance and maintainers published.

### Deprecated

- `ContentCard` (and its old name `PropertyCard`): `address`, `price` and `priceSuffix` still work and may be removed from 2.0.0 on. Use `subtitle`, `value` and `valueSuffix`.

[Unreleased]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.4...HEAD
[1.9.4]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.3...v1.9.4
[1.9.3]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.2...v1.9.3
[1.9.2]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.6.2...v1.7.0
[1.6.2]: https://github.com/viniciuscoimbra/refy-design/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/viniciuscoimbra/refy-design/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.3.4...v1.4.0
[1.3.4]: https://github.com/viniciuscoimbra/refy-design/compare/v1.3.1...v1.3.4
[1.3.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/viniciuscoimbra/refy-design/releases/tag/v1.0.0
