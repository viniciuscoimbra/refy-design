# Releases

[Português](docs/pt-BR/RELEASES.md) · [Español](docs/es/RELEASES.md)

## Versioning

refy follows [Semantic Versioning](https://semver.org/). `@refy-design/web` and `@refy-design/mobile` share the major version. `@refy-design/a2ui` has its own version while it is below 1.0.

| Change | Version |
|---|---|
| Fix that does not change the API | Patch |
| New component, prop, token or package, without breaking | Minor |
| Removed or renamed export, prop, token or default | Major, with a migration guide in the CHANGELOG |

A deprecated prop keeps working until the next major and is marked `@deprecated` with its replacement.

## Cadence

A version ships when it is ready, not on a fixed date. Every version lists its changes in [CHANGELOG.md](CHANGELOG.md), in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) categories.

## How a version ships

1. The maintainer approves the tree, as described in [GOVERNANCE.md](GOVERNANCE.md), step 3.
2. The commit `refy X.Y.Z` reaches `main`.
3. `release.yml` creates the annotated tag `vX.Y.Z`, the GitHub release with the packages attached, and publishes `@refy-design/web`, `@refy-design/mobile` and `@refy-design/a2ui` to npm through Trusted Publishing, each with its own version and only when that version is not on npm yet, with provenance. No person holds an npm token.
4. The site at refy.design and the remote MCP server move to the new version.
5. The version is done only when npm, the documentation in English, Portuguese and Spanish, and refy.design show the same version. `node scripts/docs-sync.mjs --live` compares the version the live site declares with npm.

## Support

Only the latest minor receives fixes and security improvements. See [SECURITY.md](SECURITY.md).
