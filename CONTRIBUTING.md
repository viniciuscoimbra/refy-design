# Contributing to refy

[Português](docs/pt-BR/CONTRIBUTING.md) · [Español](docs/es/CONTRIBUTING.md)

refy is a React library under Apache 2.0, maintained by Vinícius Coimbra. The license allows derivative work; it does not license trademarks, fonts or third-party assets. See [TRADEMARKS.md](TRADEMARKS.md).

## Before you propose

Ask these three questions in order. The first yes tells you where the change lives.

1. **Does the theme solve it?** If the component already reads a token or a variant that gets you the look you want, the change belongs in your project's theme file. refy does not change.
2. **Is it a composition of your product?** A screen or piece built from refy components stays in your project, even if it repeats across screens.
3. **Is a prop or token missing?** Then it is a contribution: the component cannot do it, and the capability serves any product. Point to the line of the component that blocks it.

If the answer was the third, open a **Missing in refy** issue with the screen that needs it and what the component does not allow. Build the piece in your project, in `refy-extensions/<Name>/`, with the patch and a `contribution.json`. Then run:

```bash
npx -p @refy-design/web refy contribute <Name>
```

The command tests the piece in a copy of refy and writes the pull request. The full walkthrough is at [refy.design/en/contributing](https://refy.design/en/contributing).

## Propose and implement

1. Describe the need in an OpenSpec change, with proposal, design, specs and tasks. Include existing alternatives, affected consumers and acceptance criteria.
2. Record the authorized scope before implementing. For a new family, explain why composing existing components does not solve the need.
3. Name the owner and the reviewer in the pull request. Vinícius is the lead maintainer and decides breaking changes and releases. Contributors can review; a review by the authoring agent must say so, without claiming independence.
4. Run the applicable tests and fill in the evidence per requirement or task. Record changes to API, tokens, defaults and behavior with a before and after and a migration.
5. Sync the implemented specs and close the gate only when the acceptance criteria are met.

refy follows [Semantic Versioning](https://semver.org/): a change that breaks an export, prop, token or default only lands in a major version, with a before and after and a migration. Do not copy private data or code to show compatibility; use synthetic fixtures.

## The path of your pull request

1. Open the pull request against `main`. CI runs types, build and tests.
2. The maintainer runs the same CI steps again in the release pipeline, plus the scan for internal names and secrets. Browser and accessibility tests are the ones in the public CI, so you reproduce any component failure with `npx playwright test`.
3. Passed: the pull request is approved and ships in the next version as a merge, with your commits and your authorship. You appear among the GitHub contributors and in the CHANGELOG. Did not pass: the pull request is closed with the reason, the command and the test that failed, and the relevant output.

The pull request is not merged on its own before the version. It goes in with the version, so `main` only holds tested versions.

## Tooling pull requests

Gates, verification scripts, tests and automated reviewers do not use `npx -p @refy-design/web refy contribute`, which is for components. The path is the general one:

1. An OpenSpec change with the new rule (proposal, a spec with the failure scenario, and tasks).
2. The case the gate rejects and the similar neighbor it lets through, both in the test. Without the neighbor, the gate teaches people to route around it.
3. Green CI and the same checks as the release pipeline.

## Development

Node 22.12 or later, installed from the lockfile (`npm ci`). `npm run storybook` opens the local catalog; `npm run check` verifies types, build and distribution. `node scripts/docs-sync.mjs --check` (also part of `check`) rejects README, docs, plugins or site that state a number, version or promise the code contradicts; what each page claims and where it comes from is in `docs/sync/surfaces/`. To review specs, install `@fission-ai/openspec@1.5.0` and run `npm run check:specs`. CI uses that pinned version.

The [quality contract](docs/QUALITY.md) explains layers, maturity, evidence and exceptions. A build or a large number of stories does not certify a family.

## Reusable capabilities

Read the [advanced guide](docs/ADVANCED_ORGANISMS.md) and the [Coverflow playbook](docs/ORGANISM_PLAYBOOK.md) before proposing an organism.

## Languages

Repository documents are written in English first, with Portuguese and Spanish versions in `docs/pt-BR/` and `docs/es/`. A change to one language updates the other two in the same pull request. Code and identifiers are in English.
