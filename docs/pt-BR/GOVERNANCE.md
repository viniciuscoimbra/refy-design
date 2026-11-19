# Governança

[English](../../GOVERNANCE.md) · [Español](../es/GOVERNANCE.md)

O refy tem um mantenedor responsável, que responde pelo que é publicado. Qualquer pessoa pode propor mudança, revisar ou relatar uma melhoria de segurança.

## Papéis

- **Mantenedor responsável**: decide o que entra, aprova cada versão e responde por segurança e conduta. Hoje é Vinícius Coimbra. Os nomes estão em [MAINTAINERS.md](MAINTAINERS.md).
- **Mantenedor**: revisa e junta pull requests nas áreas ao lado do nome dele no MAINTAINERS.md. O mantenedor responsável convida um mantenedor depois de contribuições constantes e registra a mudança no MAINTAINERS.md e no CHANGELOG.
- **Contribuidor**: qualquer pessoa que abre issue, pull request ou revisão. Quem teve contribuição aceita aparece na lista de contribuidores do GitHub e recebe crédito no CHANGELOG da versão que publica o trabalho.

## Como as decisões são tomadas

Defeitos, propostas e discussões acontecem nas [issues públicas](https://github.com/viniciuscoimbra/refy-design/issues). Um pull request entra quando as verificações passam e um mantenedor aprova. Quando há divergência, a conversa acontece na issue ou no pull request, em público. Sem acordo, o mantenedor responsável decide e escreve o motivo na mesma conversa.

Mudança que quebra compatibilidade, mudança de licença e mudança neste documento são sempre decididas pelo mantenedor responsável.

## Como uma mudança entra

1. A mudança nasce como issue ou pull request, com o problema, a proposta e o impacto em exports, props, tokens e defaults.
2. Mudança de comportamento traz spec em `openspec/specs/` e teste que a cobre.
3. O CI do pull request precisa passar. Depois o mantenedor roda de novo os mesmos passos do CI no processo de publicação, duas vezes: na árvore de trabalho e na árvore que vai para o público. A publicação também confere a sincronia entre código e documentação (números, versões e promessas de README, docs, plugins e site), faz a varredura de nomes e links internos, a varredura de segredos com o gitleaks no código e no pacote do npm, e confere o histórico de `main`. Os testes de navegador e de acessibilidade são os mesmos do CI público: quem contribui reproduz na própria máquina qualquer falha de componente.
4. Passou: o pull request é aprovado e sai na próxima versão. Não passou: o pull request é fechado com o motivo, o comando e o teste que falharam e o trecho da saída.
5. A versão sai como um commit do mantenedor, `refy X.Y.Z`, com a árvore aprovada. Os pull requests aceitos naquela versão entram nesse commit como merge: o GitHub marca cada um como mergeado, os commits continuam com a autoria de quem escreveu, e a pessoa aparece entre os contribuidores do repositório e no CHANGELOG.
6. A linha principal de `main` (o primeiro pai de cada commit) só tem versões. O CI do repositório (`scripts/check-release-history.mjs`) recusa qualquer outra coisa nessa linha.

## Versões

O refy segue o [versionamento semântico](https://semver.org/lang/pt-BR/). Patch corrige sem mudar API. Minor acrescenta sem quebrar. Major quebra, com guia de migração no CHANGELOG. Cada versão tem tag `vX.Y.Z` e pacote anexado ao release. O processo está em [RELEASES.md](RELEASES.md).

## Mudar esta governança

Mudança neste documento segue o mesmo caminho de qualquer outra e é registrada no CHANGELOG.
