# Política de seguridad

[English](../../SECURITY.md) · [Português](../pt-BR/SECURITY.md)

refy recibe mejoras de seguridad por un canal privado, para que la corrección salga antes de que los detalles sean públicos.

## Versiones con soporte

| Paquete | Recibe mejoras de seguridad |
|---|---|
| `@refy-design/web` | Última minor de la 1.x |
| `@refy-design/mobile` | Última minor de la 1.x |
| `@refy-design/a2ui` | Última minor de la 0.x |
| Servidor MCP remoto en `https://refy.design/mcp` | Versión en línea |

Las versiones antiguas no reciben correcciones retroactivas. Actualiza a la versión más nueva para recibir la mejora.

## Alcance

Los paquetes de npm de arriba, el servidor MCP local (`refy-mcp`), el servidor MCP remoto, los plugins `refy` y `refy-local`, la CLI `refy-agent` y el sitio refy.design.

## Cómo reportar una mejora de seguridad

1. Abre la pestaña **Security** del repositorio y elige **Report a vulnerability**. El reporte queda privado entre tú y los mantenedores.
2. Describe qué se puede mejorar, el paquete y la versión afectados y los pasos para reproducirlo.
3. No abras un issue, pull request o discusión pública sobre esto, y no incluyas credenciales ni datos personales.

## Qué pasa después

| Etapa | Plazo |
|---|---|
| Confirmación de recepción | 3 días hábiles |
| Primera evaluación, con la gravedad | 7 días |
| Corrección publicada | 90 días, antes si la gravedad es alta |

La corrección sale en una versión nueva, con un GitHub Security Advisory y una entrada `Seguridad` en el CHANGELOG. Recibes el crédito en el advisory, salvo que prefieras no recibirlo.

## Dependencias

`npm audit` corre en cada versión. Un aviso de dependencia se resuelve actualizando la dependencia o con un override limitado a quien la usa, nunca ocultando el aviso.

## Servidores de desarrollo

El servidor de desarrollo de Storybook escucha en 127.0.0.1. No lo expongas en internet; publica la salida estática. Ningún secreto de npm o de hosting entra en el repositorio o en el paquete.
