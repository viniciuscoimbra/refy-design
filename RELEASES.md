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
3. `release.yml` creates the annotated tag `vX.Y.Z`, the GitHub release with the packages attached, and publishes to npm through Trusted Publishing, with provenance. No person holds an npm token.
4. The site at refy.design and the remote MCP server move to the new version.

## Support

Only the latest minor receives fixes and security improvements. See [SECURITY.md](SECURITY.md).
