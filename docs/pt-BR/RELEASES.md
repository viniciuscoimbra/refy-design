# Versões

[English](../../RELEASES.md) · [Español](../es/RELEASES.md)

## Numeração

O refy segue o [versionamento semântico](https://semver.org/lang/pt-BR/). `@refy-design/web` e `@refy-design/mobile` compartilham a versão maior. `@refy-design/a2ui` tem versão própria enquanto estiver abaixo da 1.0.

| Mudança | Versão |
|---|---|
| Correção que não muda a API | Patch |
| Componente, prop, token ou pacote novo, sem quebrar | Minor |
| Export, prop, token ou default removido ou renomeado | Major, com guia de migração no CHANGELOG |

Uma prop obsoleta continua funcionando até a próxima major e é marcada com `@deprecated` e a substituta.

## Ritmo

Uma versão sai quando está pronta, sem data fixa. Cada versão lista as mudanças no [CHANGELOG.md](../../CHANGELOG.md), nas categorias do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## Como uma versão sai

1. O mantenedor aprova a árvore, como descrito no [GOVERNANCE.md](GOVERNANCE.md), passo 3.
2. O commit `refy X.Y.Z` chega ao `main`.
3. O `release.yml` cria a tag anotada `vX.Y.Z` e o release no GitHub com os pacotes anexados, e publica no npm por Trusted Publishing, com proveniência. Ninguém guarda token do npm.
4. O site refy.design e o servidor MCP remoto passam para a versão nova.

## Suporte

Só a última minor recebe correções e melhorias de segurança. Veja [SECURITY.md](SECURITY.md).
