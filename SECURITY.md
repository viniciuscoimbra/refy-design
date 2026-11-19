# Security policy

[Português](docs/pt-BR/SECURITY.md) · [Español](docs/es/SECURITY.md)

refy takes security improvements through a private channel, so a fix ships before the details are public.

## Supported versions

| Package | Receives security improvements |
|---|---|
| `@refy-design/web` | Latest minor of 1.x |
| `@refy-design/mobile` | Latest minor of 1.x |
| `@refy-design/a2ui` | Latest minor of 0.x |
| Remote MCP server at `https://refy.design/mcp` | Current deployment |

Older versions get no backports. Update to the latest version to receive an improvement.

## Scope

The npm packages above, the local MCP server (`refy-mcp`), the remote MCP server, the `refy` and `refy-local` plugins, the `refy-agent` CLI and the refy.design site.

## How to report a security improvement

1. Open the repository **Security** tab and choose **Report a vulnerability**. The report stays private between you and the maintainers.
2. Describe what can be improved, the affected package and version, and the steps to reproduce it.
3. Do not open a public issue, pull request or discussion about it, and do not include credentials or personal data.

## What happens next

| Step | Target |
|---|---|
| Acknowledgment | 3 business days |
| First assessment, with severity | 7 days |
| Fix released | 90 days, sooner for high severity |

The fix ships in a new version with a GitHub Security Advisory and a `Security` entry in the CHANGELOG. You are credited in the advisory unless you prefer not to be.

## Dependencies

`npm audit` runs on every release. A dependency advisory is fixed by updating or by an override scoped to the affected caller, never by suppressing the advisory.

## Development servers

The Storybook dev server listens on 127.0.0.1. Do not expose it to the internet; publish the static build instead. No npm or hosting secret belongs in the repository or the package.
