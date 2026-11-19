# Gobernanza

[English](../../GOVERNANCE.md) · [Português](../pt-BR/GOVERNANCE.md)

refy tiene un mantenedor responsable, que responde por lo que se publica. Cualquier persona puede proponer un cambio, revisar uno o reportar una mejora de seguridad.

## Roles

- **Mantenedor responsable**: decide qué entra, aprueba cada versión y responde por seguridad y conducta. Hoy es Vinícius Coimbra. Los nombres están en [MAINTAINERS.md](MAINTAINERS.md).
- **Mantenedor**: revisa y une pull requests en las áreas indicadas junto a su nombre en MAINTAINERS.md. El mantenedor responsable invita a un mantenedor después de contribuciones constantes y registra el cambio en MAINTAINERS.md y en el CHANGELOG.
- **Contribuidor**: cualquier persona que abre un issue, un pull request o una revisión. Quien tuvo una contribución aceptada aparece en la lista de contribuidores de GitHub y recibe crédito en el CHANGELOG de la versión que publica su trabajo.

## Cómo se toman las decisiones

Los defectos, las propuestas y las discusiones ocurren en los [issues públicos](https://github.com/viniciuscoimbra/refy-design/issues). Un pull request entra cuando sus verificaciones pasan y un mantenedor lo aprueba. Cuando hay desacuerdo, la conversación ocurre en el issue o en el pull request, en público. Sin acuerdo, el mantenedor responsable decide y escribe el motivo en la misma conversación.

Los cambios que rompen compatibilidad, los cambios de licencia y los cambios en este documento siempre los decide el mantenedor responsable.

## Cómo entra un cambio

1. El cambio nace como issue o pull request, con el problema, la propuesta y el impacto en exports, props, tokens y defaults.
2. Un cambio de comportamiento trae una spec en `openspec/specs/` y una prueba que lo cubre.
3. El CI del pull request tiene que pasar. Después el mantenedor ejecuta de nuevo los mismos pasos del CI en el proceso de publicación, dos veces: en el árbol de trabajo y en el árbol que va al público. La publicación también revisa la sincronía entre código y documentación (números, versiones y promesas de README, docs, plugins y sitio), hace el escaneo de nombres y enlaces internos, el escaneo de secretos con gitleaks en el código y en el paquete de npm, y revisa el historial de `main`. Las pruebas de navegador y de accesibilidad son las mismas del CI público: quien contribuye reproduce en su máquina cualquier falla de componente.
4. Pasó: el pull request se aprueba y sale en la próxima versión. No pasó: el pull request se cierra con el motivo, el comando y la prueba que fallaron y el fragmento de la salida.
5. La versión sale como un commit del mantenedor, `refy X.Y.Z`, con el árbol aprobado. Los pull requests aceptados en esa versión entran en ese commit como merge: GitHub marca cada uno como unido, los commits mantienen la autoría de quien los escribió, y la persona aparece entre los contribuidores del repositorio y en el CHANGELOG.
6. La línea principal de `main` (el primer padre de cada commit) solo tiene versiones. El CI del repositorio (`scripts/check-release-history.mjs`) rechaza cualquier otra cosa en esa línea.

## Versiones

refy sigue el [versionado semántico](https://semver.org/lang/es/). Patch corrige sin cambiar la API. Minor agrega sin romper. Major rompe, con guía de migración en el CHANGELOG. Cada versión tiene la etiqueta `vX.Y.Z` y su paquete adjunto al release. El proceso está en [RELEASES.md](RELEASES.md).

## Cambiar esta gobernanza

Un cambio en este documento sigue el mismo camino que cualquier otro y se registra en el CHANGELOG.
