# Governança

## Papéis

- **Mantenedor**: decide o que entra, aprova versões e responde por segurança e conduta. Os nomes estão em [MAINTAINERS.md](MAINTAINERS.md).
- **Contribuidor**: qualquer pessoa que abre issue, pull request ou revisão.

## Como uma mudança entra

1. A mudança nasce como issue ou pull request, com o problema, a proposta e o impacto em exports, props, tokens e defaults.
2. Mudança de comportamento traz spec em `openspec/specs/` e teste que a cobre.
3. O CI do pull request precisa passar. Depois o mantenedor leva a mudança para o repositório de trabalho do refy e roda ali a bateria inteira: tipos, build, testes de navegador em todos os temas, auditoria de texto e de acessibilidade.
4. Passou: o pull request é aprovado e a mudança sai na próxima versão. Não passou: o pull request é fechado com o motivo e o teste que falhou.
5. A versão sai como um commit do mantenedor, `refy X.Y.Z`, com a árvore aprovada no repositório de trabalho. Os pull requests aceitos naquela versão entram nesse commit como merge: o GitHub marca cada um como mergeado, os commits continuam com a autoria de quem escreveu, e a pessoa aparece entre os contribuidores do repositório e no CHANGELOG.
6. A linha principal de `main` (o primeiro pai de cada commit) só tem versões. O CI do repositório (`scripts/check-release-history.mjs`) recusa qualquer outra coisa nessa linha.

## Versões

O refy segue [versionamento semântico](https://semver.org/lang/pt-BR/). Patch corrige sem mudar API. Minor acrescenta sem quebrar. Major quebra, com guia de migração no CHANGELOG. Cada versão tem tag `vX.Y.Z` e pacote anexado ao release.

## Mudar esta governança

Mudança neste arquivo segue o mesmo caminho de qualquer outra e é registrada no CHANGELOG.
