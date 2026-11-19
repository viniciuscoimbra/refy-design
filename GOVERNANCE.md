# Governance

[Português](docs/pt-BR/GOVERNANCE.md) · [Español](docs/es/GOVERNANCE.md)

refy has one lead maintainer, who answers for what ships. Anyone can propose a change, review one or report a security improvement.

## Roles

- **Lead maintainer**: decides what goes in, approves each version and answers for security and conduct. Today this is Vinícius Coimbra. Names are in [MAINTAINERS.md](MAINTAINERS.md).
- **Maintainer**: reviews and merges pull requests in the areas listed next to their name in MAINTAINERS.md. The lead maintainer invites a maintainer after sustained contributions and records the change in MAINTAINERS.md and the CHANGELOG.
- **Contributor**: anyone who opens an issue, a pull request or a review. Accepted contributors appear in the GitHub contributors list and are credited in the CHANGELOG of the version that ships their work.

## How decisions are made

Bugs, proposals and discussions happen in the [public issues](https://github.com/viniciuscoimbra/refy-design/issues). A pull request goes in when its checks pass and a maintainer approves it. When people disagree, the discussion happens in the issue or pull request, in public. If there is no agreement, the lead maintainer decides and writes down the reason in the same thread.

Breaking changes, license changes and changes to this document are always decided by the lead maintainer.

## How a change gets in

1. A change starts as an issue or a pull request, with the problem, the proposal and the impact on exports, props, tokens and defaults.
2. A behavior change comes with a spec in `openspec/specs/` and a test that covers it.
3. The pull request CI must pass. Then the maintainer runs the same CI steps again in the release pipeline, twice: on the working tree and on the tree that goes public. The release also checks the sync between code and documentation (numbers, versions and promises in README, docs, plugins and site), runs the scan for internal names and links, runs the secret scan with gitleaks on the code and on the npm package, and checks the history of `main`. Browser and accessibility tests are the same as in the public CI, so a contributor reproduces any component failure on their own machine.
4. Passed: the pull request is approved and ships in the next version. Did not pass: the pull request is closed with the reason, the command and the test that failed, and the relevant output.
5. The version ships as one commit by the maintainer, `refy X.Y.Z`, with the approved tree. Pull requests accepted in that version are merged into that commit: GitHub marks each one as merged, the commits keep their authors, and each author appears among the repository contributors and in the CHANGELOG.
6. The first-parent line of `main` holds only versions. The repository CI (`scripts/check-release-history.mjs`) rejects anything else on that line.

## Versions

refy follows [Semantic Versioning](https://semver.org/). Patch fixes without changing the API. Minor adds without breaking. Major breaks, with a migration guide in the CHANGELOG. Every version has a `vX.Y.Z` tag and its package attached to the release. The process is in [RELEASES.md](RELEASES.md).

## Changing this governance

A change to this file follows the same path as any other change and is recorded in the CHANGELOG.
