# Versiones

[English](../../RELEASES.md) · [Português](../pt-BR/RELEASES.md)

## Numeración

refy sigue el [versionado semántico](https://semver.org/lang/es/). `@refy-design/web` y `@refy-design/mobile` comparten la versión mayor. `@refy-design/a2ui` tiene versión propia mientras esté por debajo de la 1.0.

| Cambio | Versión |
|---|---|
| Corrección que no cambia la API | Patch |
| Componente, prop, token o paquete nuevo, sin romper | Minor |
| Export, prop, token o default eliminado o renombrado | Major, con guía de migración en el CHANGELOG |

Una prop obsoleta sigue funcionando hasta la próxima major y se marca con `@deprecated` y su reemplazo.

## Ritmo

Una versión sale cuando está lista, sin fecha fija. Cada versión lista sus cambios en el [CHANGELOG.md](../../CHANGELOG.md), en las categorías de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## Cómo sale una versión

1. El mantenedor aprueba el árbol, como se describe en [GOVERNANCE.md](GOVERNANCE.md), paso 3.
2. El commit `refy X.Y.Z` llega a `main`.
3. `release.yml` crea la etiqueta anotada `vX.Y.Z` y el release en GitHub con los paquetes adjuntos, y publica `@refy-design/web`, `@refy-design/mobile` y `@refy-design/a2ui` en npm por Trusted Publishing, cada uno con su propia versión y solo cuando esa versión todavía no está en npm, con procedencia. Nadie guarda un token de npm.
4. El sitio refy.design y el servidor MCP remoto pasan a la versión nueva.
5. La versión solo está lista cuando npm, la documentación en inglés, portugués y español y refy.design muestran la misma versión. `node scripts/docs-sync.mjs --live` compara la versión que declara el sitio publicado con la de npm.

## Soporte

Solo la última minor recibe correcciones y mejoras de seguridad. Ver [SECURITY.md](SECURITY.md).
