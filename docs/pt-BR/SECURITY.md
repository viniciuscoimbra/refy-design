# Política de segurança

[English](../../SECURITY.md) · [Español](../es/SECURITY.md)

O refy recebe melhorias de segurança por um canal privado, para a correção sair antes de os detalhes ficarem públicos.

## Versões atendidas

| Pacote | Recebe melhorias de segurança |
|---|---|
| `@refy-design/web` | Última minor da 1.x |
| `@refy-design/mobile` | Última minor da 1.x |
| `@refy-design/a2ui` | Última minor da 0.x |
| Servidor MCP remoto em `https://refy.design/mcp` | Versão no ar |

Versão antiga não recebe correção retroativa. Atualize para a versão mais nova para receber a melhoria.

## Escopo

Os pacotes do npm acima, o servidor MCP local (`refy-mcp`), o servidor MCP remoto, os plugins `refy` e `refy-local`, a CLI `refy-agent` e o site refy.design.

## Como relatar uma melhoria de segurança

1. Abra a aba **Security** do repositório e escolha **Report a vulnerability**. O relato fica privado entre você e os mantenedores.
2. Descreva o que pode melhorar, o pacote e a versão afetados e os passos para reproduzir.
3. Não abra issue, pull request ou discussão pública sobre isso, e não inclua credencial nem dado pessoal.

## O que acontece depois

| Etapa | Prazo |
|---|---|
| Confirmação de recebimento | 3 dias úteis |
| Primeira avaliação, com a gravidade | 7 dias |
| Correção publicada | 90 dias, antes se a gravidade for alta |

A correção sai numa versão nova, com um GitHub Security Advisory e uma entrada `Segurança` no CHANGELOG. Você recebe o crédito no advisory, a não ser que prefira não receber.

## Dependências

O `npm audit` roda em toda versão. Um aviso de dependência é resolvido atualizando a dependência ou com um override restrito a quem a usa, nunca escondendo o aviso.

## Servidores de desenvolvimento

O servidor de desenvolvimento do Storybook escuta em 127.0.0.1. Não o exponha na internet; publique a saída estática. Nenhum segredo de npm ou de hospedagem entra no repositório ou no pacote.
