# Roadmap

[Português](docs/pt-BR/ROADMAP.md) · [Español](docs/es/ROADMAP.md)

What the project is working toward. Items have no dates; each one ships in a minor version when it is ready, and the CHANGELOG records it. To suggest an item, open an issue.

- **A2UI catalog**: cover every component of the A2UI basic catalog with refy components, on the web and in React Native, so an agent can use refy wherever it uses the basic catalog.
- **Web and mobile parity**: the same props and behavior in `@refy-design/web` and `@refy-design/mobile`, family by family. Current parity is in the agent catalog (`mobile` field of each family).
- **Maturity**: assess each component family as experimental, stable or deprecated, following [docs/QUALITY.md](docs/QUALITY.md).
- **Interaction tests**: click, keyboard and typing tests for every family. Current coverage is in [docs/INTERACTION_COVERAGE.md](docs/INTERACTION_COVERAGE.md).
- **Themes**: more starting themes and a better theme extraction from an existing site.
- **Performance**: smaller first load for the packages and the site.
- **Agent kit**: more checks in `refy_validate` and better answers from `refy_search`.
