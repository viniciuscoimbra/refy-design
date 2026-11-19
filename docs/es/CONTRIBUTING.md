# Contribuir con refy

[English](../../CONTRIBUTING.md) · [Português](../pt-BR/CONTRIBUTING.md)

refy es una biblioteca React bajo Apache 2.0, mantenida por Vinícius Coimbra. La licencia permite obras derivadas; no licencia marcas, fuentes ni assets de terceros. Ver [TRADEMARKS.md](TRADEMARKS.md).

## Antes de proponer

Haz estas tres preguntas en orden. La primera respuesta afirmativa dice dónde vive el cambio.

1. **¿El tema lo resuelve?** Si el componente ya lee un token o una variante que llega al aspecto que quieres, el cambio va en el archivo de tema de tu proyecto. refy no cambia.
2. **¿Es una composición de tu producto?** Una pantalla o pieza armada con componentes de refy se queda en tu proyecto, aunque se repita en varias pantallas.
3. **¿Falta una prop o un token?** Entonces es una contribución: el componente no puede hacerlo, y la capacidad sirve a cualquier producto. Muestra la línea del componente que lo impide.

Si la respuesta fue la tercera, abre un issue **Missing in refy** con la pantalla que lo necesita y lo que el componente no permite. Haz la pieza en tu proyecto, en `refy-extensions/<Nombre>/`, con el patch y un `contribution.json`. Después ejecuta:

```bash
npx -p @refy-design/web refy contribute <Nombre>
```

El comando prueba la pieza en una copia de refy y escribe el pull request. El paso a paso completo está en [refy.design/es/contribuir](https://refy.design/es/contribuir).

## Proponer e implementar

1. Describe la necesidad en un cambio OpenSpec, con proposal, design, specs y tasks. Incluye alternativas existentes, consumidores afectados y criterios de aceptación.
2. Registra el alcance autorizado antes de implementar. Para una familia nueva, explica por qué la composición de los componentes existentes no resuelve la necesidad.
3. Indica responsable y revisor en el pull request. Vinícius es el mantenedor responsable y decide los cambios incompatibles y las publicaciones. Los contribuidores pueden revisar; una revisión hecha por el propio agente autor debe decirlo, sin afirmar independencia.
4. Ejecuta las pruebas aplicables y completa la evidencia por requisito o tarea. Registra los cambios de API, tokens, defaults y comportamiento con un antes y después y la migración.
5. Sincroniza las specs implementadas y cierra el gate solo con los criterios de aceptación cumplidos.

refy sigue el [versionado semántico](https://semver.org/lang/es/): un cambio que rompe un export, prop, token o default solo entra en una versión major, con antes y después y migración. No copies datos ni código privado para mostrar compatibilidad; usa fixtures sintéticos.

## El camino de tu pull request

1. Abre el pull request contra `main`. El CI ejecuta tipos, build y pruebas.
2. El mantenedor ejecuta de nuevo los mismos pasos del CI en el proceso de publicación, más el escaneo de nombres internos y de secretos. Las pruebas de navegador y de accesibilidad son las del CI público, así que reproduces cualquier falla de componente con `npx playwright test`.
3. Pasó: el pull request se aprueba y entra en la próxima versión como merge, con tus commits y tu autoría. Apareces entre los contribuidores de GitHub y en el CHANGELOG. No pasó: el pull request se cierra con el motivo, el comando y la prueba que fallaron y el fragmento de la salida.

El pull request no se une solo antes de la versión. Entra junto con ella, para que `main` solo tenga versiones probadas.

## Pull requests de herramientas

Los gates, scripts de verificación, pruebas y revisores automáticos no usan `npx -p @refy-design/web refy contribute`, que es para componentes. El camino es el general:

1. Un cambio OpenSpec con la regla nueva (proposal, una spec con el escenario de falla y tasks).
2. El caso que el gate rechaza y el vecino parecido que deja pasar, los dos en la prueba. Sin el vecino, el gate enseña a esquivarlo.
3. CI en verde y las mismas revisiones del proceso de publicación.

## Desarrollo

Node 22.12 o posterior, instalación desde el lockfile (`npm ci`). `npm run storybook` abre el catálogo local; `npm run check` verifica tipos, build y distribución. `node scripts/docs-sync.mjs --check` (también parte de `check`) rechaza README, docs, plugins o sitio que digan un número, una versión o una promesa que el código desmiente; lo que cada página afirma y de dónde viene está en `docs/sync/surfaces/`. Para revisar specs, instala `@fission-ai/openspec@1.5.0` y ejecuta `npm run check:specs`. El CI usa esa versión fija.

El [contrato de calidad](../QUALITY.md) explica capas, madurez, evidencias y excepciones. Un build o una gran cantidad de stories no certifica una familia.

## Capacidades reutilizables

Lee la [guía avanzada](../ADVANCED_ORGANISMS.md) y el [playbook del Coverflow](../ORGANISM_PLAYBOOK.md) antes de proponer un organismo.

## Idiomas

Los documentos del repositorio se escriben primero en inglés, con versiones en portugués y español en `docs/pt-BR/` y `docs/es/`. Un cambio en un idioma actualiza los otros dos en el mismo pull request. El código y los identificadores van en inglés.
