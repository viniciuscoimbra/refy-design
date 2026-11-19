# Changelog

[English](../../CHANGELOG.md) · [Português](../pt-BR/CHANGELOG.md)

Todos los cambios relevantes de refy quedan registrados aquí. El formato sigue [Keep a Changelog 1.1](https://keepachangelog.com/es-ES/1.1.0/) y refy sigue el [Versionado Semántico](https://semver.org/lang/es/). Cada versión agrupa los cambios en Añadido, Cambiado, Obsoleto, Eliminado, Corregido y Seguridad. El original en inglés es la referencia.

## [No publicado][Unreleased]

## [1.9.5] - 2026-11-18

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- Página de las Docs para `@refy-design/a2ui` en refy.design/docs/a2ui, en inglés, portugués y español: instalación en la web y en React Native, las 12 piezas, validación en el servidor con `@refy-design/a2ui/definition`, y `onError` y `openUrl` en React Native. El menú de las Docs, las páginas de Para IAs, el llms.txt y el sitemap llevan a ella.
- refy.design/version.json declara las versiones de `@refy-design/web`, `@refy-design/mobile` y `@refy-design/a2ui` que documenta el sitio.

### Cambiado

- La página del MCP indica buscar Refy Design en el directorio de conectores de Claude, además de la configuración manual con la dirección.
- El sitio dice que la licencia es Apache 2.0 a partir de la 1.9.4 y que las versiones hasta la 1.9.3 salieron con MIT, en las preguntas frecuentes y en la página de contribución.
- El workflow de release publica `@refy-design/mobile` en npm por Trusted Publishing, con procedencia, como `@refy-design/web` y `@refy-design/a2ui` ([RELEASES.md](../../RELEASES.md), paso 3).
- Una versión solo está lista cuando npm, la documentación en inglés, portugués y español y refy.design muestran la misma versión ([RELEASES.md](../../RELEASES.md), paso 5).

## [1.9.4] - 2026-11-18

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- Documentos del proyecto en inglés, portugués y español: gobernanza, mantenedores, seguridad, código de conducta, soporte, marcas, versiones, roadmap y adoptantes. El README, el CONTRIBUTING y este CHANGELOG también salen en los tres idiomas.
- Formularios de issue para bug, pedido de funcionalidad y documentación. El reporte de seguridad va por el aviso privado del repositorio.

### Cambiado

- La licencia pasa de MIT a Apache 2.0 en `@refy-design/web` y `@refy-design/a2ui` 0.2.1. El [NOTICE](../../NOTICE) acompaña los paquetes: quien redistribuye mantiene la licencia y el NOTICE, y el nombre refy queda fuera de la licencia. Las versiones hasta la 1.9.3 siguen bajo MIT.
- El CHANGELOG pasa a escribirse en inglés en el formato Keep a Changelog, con fecha en formato ISO y enlace para comparar cada versión.
- El pie del sitio dice "Mantenido por Vinícius Coimbra y contribuidores", y el enlace de contribuidores abre la lista en GitHub. La página de mantenedores nombra al mantenedor responsable.

## [1.9.3] - 2026-11-18

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- `@refy-design/a2ui` 0.2.0 con React Native: `@refy-design/a2ui/native` dibuja el mismo JSON del agente con las mismas 12 piezas sobre `@refy-design/mobile`, con el tema del `RefyProvider` de la app. La función `openUrl` abre por `Linking` y los errores de la superficie (función rechazada, enlace que el sistema no abre, expresión inválida) llegan al `onError` de `A2uiNativeSurface`.

### Cambiado

- En `@refy-design/a2ui`, `@a2ui/react`, `react-dom`, `@refy-design/web`, `@refy-design/mobile` y `react-native` pasan a ser peers opcionales: cada app instala solo el de su plataforma. En la web, instala `@a2ui/react@0.15.0` junto.

## [1.9.2] - 2026-11-18

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Cambiado

- El sitio descarga solo lo que usa cada página: GSAP queda en las escenas de desplazamiento de la home y llega después de la primera pintura, los textos de la documentación llegan por página y por familia, y el JSON de tokens de origen salió de la primera carga. La home en portugués descarga 233 KB de JavaScript gzip en lugar de 287 KB, y la ficha de un componente, 330 KB en lugar de 462 KB. La apariencia y los paquetes publicados no cambian.

## [1.9.1] - 2026-11-15

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Corregido

- La 1.9.0 no se publicó en npm; todo lo que trae está en la 1.9.1.

## [1.9.0] - 2026-11-15

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- Paquete nuevo `@refy-design/a2ui` 0.1.0: los componentes de refy como catálogo [A2UI](https://a2ui.org) 1.0, con id `https://refy.design/a2ui/v1` y 12 piezas (Text, Image, Row, Column, List, Card, Divider, Button, TextField, CheckBox, ChoicePicker, Slider). Un agente envía los mensajes; la app React los dibuja con los componentes y el tema de refy. Solo web en esta versión: todavía no hay puente para React Native.
- `@refy-design/a2ui/definition` trae el catálogo sin React y sin DOM, para que el servidor de la app valide la respuesta del agente con las mismas reglas del renderizador. Una pieza fuera del catálogo se rechaza con `A2uiValidationError`.
- El release adjunta el paquete `@refy-design/a2ui` y lo publica en npm cuando su versión todavía no está allí.
- `node scripts/docs-sync.mjs --check` revisa el README, la documentación, los plugins, el catálogo de IA, server.json y el sitio en pt, en y es contra números y versiones calculados del código (familias, herramientas y recursos del MCP, tipos D3, fragmentos, plantillas, idiomas) y rechaza promesas a futuro para lo que ya existe. Corre en el check, en la CI y en la promoción; en el árbol que exporta la promoción, que no tiene git, revisa solo los hechos e ignora `test-results*` y `playwright-report*`.

### Corregido

- README: 524 fragmentos compilados, no 523.
- `docs/MCP.md`: el ejemplo de `version` es la versión anterior que carga el servidor remoto; decía 1.2.0.
- REFY_SITE.md, THEMING.md y DESIGN.md: 122 familias; decían 117 y 113.
- Para IAs, en pt, en y es: la lista de recursos del MCP incluye `refy://theme-probe`.
- PLAYGROUND_CATALOGS.md: Charts tiene 24 tipos, no 24 familias.

## [1.8.0] - 2026-11-13

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- Cada familia del catálogo de IA trae `mobile`: `igual`, `com-divergencia` o `so-web`, generado de `src/catalog/native-parity.json`. Hoy son 12, 92 y 18. `refy-agent component` y el `refy_component` del MCP devuelven el campo.
- `docs/INTERACTION_COVERAGE.md` lista las familias con prueba de clic, teclado o escritura: 21 de 122. El check rechaza que ese número baje.
- Después de cada release, un workflow monta Button, Input y Card directo desde jsDelivr, sin bundler, y revisa el tema y la consola.

### Cambiado

- GOVERNANCE.md y CONTRIBUTING.md describen solo las verificaciones que corre la promoción, y una prueba compara esa lista con el script.

## [1.7.0] - 2026-11-12

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- Cada familia del catálogo de IA trae `maturity`, uno de los cuatro estados de QUALITY.md (`nao-avaliado`, `experimental`, `estavel`, `depreciado`), leído de `src/catalog/maturity.json`. Hoy las 122 familias están en `nao-avaliado`. `refy-agent catalog`, `refy-agent component` y el `refy_component` del MCP devuelven el campo (#16).
- El check rechaza una familia promovida sin la evidencia que su estado exige, con un estado desconocido, un campo de más o un nombre fuera del catálogo.

## [1.6.2] - 2026-11-12

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Corregido

- El catálogo del sitio muestra la descripción de cada componente, y la búsqueda del menú encuentra el componente por su descripción (#14).
- `AvatarGroup` anuncia el grupo en el idioma de la página, y el "+N" sin botón lo lee el lector de pantalla (#15).
- **Cambio de comportamiento:** una pantalla sin `LocaleProvider` pasa a leer el grupo del `AvatarGroup` en inglés ("3 people"), como el resto de los mensajes. Quien pasa un objeto de mensajes completo gana la clave `avatarGroup.people`.

## [1.6.1] - 2026-11-12

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Corregido

- La 1.6.0 no llegó a npm: una prueba del repositorio fallaba en el CI público, que corre en un contenedor donde git rechaza el checkout. La prueba ahora lee la carpeta cuando git no responde. El paquete es el mismo de la 1.6.0, con las correcciones de los issues #6 a #13.

## [1.6.0] - 2026-11-12

Correcciones de las issues #6 a #13, abiertas por @iosbilario. Gracias.

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; solo en la web: `Command.search`.

### Añadido

- `Command` acepta `search(items, query)`: quien usa la paleta decide qué elementos aparecen y en qué orden. Sin la propiedad, la búsqueda sigue como antes ([#7](https://github.com/viniciuscoimbra/refy-design/issues/7)).

### Corregido

- La búsqueda del sitio, del Playground y de `refy-agent catalog` encuentra términos en portugués y español: "tabela" trae Table, "botao" trae Button y "senha" trae Input ([#7](https://github.com/viniciuscoimbra/refy-design/issues/7)).
- La página de inicio descarga 274 KB de JavaScript comprimido en lugar de 436 KB. La ficha de los componentes y los ejemplos se descargan cuando la página los necesita o cuando el navegador está inactivo, y nunca con el ahorro de datos activado ([#6](https://github.com/viniciuscoimbra/refy-design/issues/6)).
- En el celular, el título, la frase y los botones de la portada aparecen en el primer cuadro en lugar de surgir después de unos 2 segundos ([#9](https://github.com/viniciuscoimbra/refy-design/issues/9)).
- El editor de tema avisa en el propio campo cuando el color principal queda sin contraste con el texto y ofrece usar texto negro ([#8](https://github.com/viniciuscoimbra/refy-design/issues/8)).
- El validador de tema ya no redondea la razón de contraste antes de compararla con el mínimo y muestra la razón redondeada hacia abajo ([#8](https://github.com/viniciuscoimbra/refy-design/issues/8)).
- El tema elegido en la página de inicio vale también en el Playground, y al revés también ([#10](https://github.com/viniciuscoimbra/refy-design/issues/10)).
- `AvatarGroup` anuncia el nombre de cada persona a los lectores de pantalla, con o sin foto ([#10](https://github.com/viniciuscoimbra/refy-design/issues/10)).
- La página /contribuir, el CLI, las skills y la plantilla de issue indican `npx -p @refy-design/web refy contribute`, que no descarga un paquete `refy` de terceros ([#11](https://github.com/viniciuscoimbra/refy-design/issues/11)).
- La etiqueta `gap`, usada por la plantilla "Falta no refy", ahora existe en el repositorio ([#12](https://github.com/viniciuscoimbra/refy-design/issues/12)).
- CONTRIBUTING.md empieza con el camino para proponer un componente: las preguntas antes de abrir, la issue "Falta no refy", la carpeta `refy-extensions/` y el comando seguro ([#13](https://github.com/viniciuscoimbra/refy-design/issues/13)).

## [1.5.2] - 2026-11-12

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- Plugin `refy-local` en el mismo marketplace: ejecuta `refy-mcp` en tu máquina con `npx` (`@refy-design/web@1.5.2`) y trae `refy-tela`, `refy-tema-de-site` y `refy-reproduzir-tela`, que usa `refy_compare`.

### Cambiado

- El plugin `refy` conecta el servidor remoto `https://refy.design/mcp` en lugar de ejecutar `refy-mcp` con `npx`. El directorio de plugins de Claude solo acepta servidores que corren en la máquina de quien usa si vienen de una organización verificada. Sin instalar nada, el plugin trae `refy-tela` y `refy-tema-de-site`.

### Eliminado

- El plugin `refy` ya no trae `refy-reproduzir-tela`, la revisión por `files` ni el Playwright del proyecto en `refy_theme_extract`, que necesitan el servidor en tu máquina. Para tenerlos, instala `refy-local@refy` en lugar de `refy@refy`.

## [1.5.1] - 2026-11-11

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- `PRIVACY.md`: qué leen, envían y guardan el paquete, el plugin y los servidores MCP local y remoto (no se guarda nada).
- `server.json` describe el servidor remoto para el registro oficial de servidores MCP.

### Cambiado

- El plugin fija la versión exacta del paquete (`@refy-design/web@1.5.1`) en lugar de `^1.5.0`. Los directorios de plugins de Claude y de OpenAI rechazan `npx` con rango de versión; cada versión sube el plugin junto con el paquete.
- El README del plugin dice qué ejecuta y qué envía, con privacidad y soporte. El manifiesto de Codex suma ícono, privacidad, términos y soporte.

## [1.5.0] - 2026-11-11

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- `refy search <necesidad>`: la misma búsqueda de `refy_search` en la línea de comandos, en portugués, inglés o español.

### Cambiado

- `refy catalog` responde a la necesidad además del nombre: `catalog tabela` y `catalog login` volvían vacíos y ahora traen Table y GoogleButton primero. El nombre exacto de una familia o de un miembro de la API sigue respondiendo por coincidencia literal.
- La búsqueda (`refy_search` y `refy catalog`) ya no sube una familia que cita el término solo para descartarlo ("no nested submenus", "instead of hiding the table"), da peso al nombre de la familia y lee "data table" y "tabela de dados" como tabla.
- Cada componente lleva a la pantalla solo su propio texto incluido. Antes, Tabs, Pagination, Callout, Table y otros 65 llevaban el texto en inglés de todos los componentes: el JS gzip mediano por familia baja de 6,5 KB a 1,8 KB. `LocaleProvider` sigue trayendo los tres idiomas.
- `tokens.css` declara una sola vez lo que es igual en los modos claro, oscuro y editorial: de 98 KB a 54 KB (de 8,0 KB a 6,8 KB gzip), con los mismos valores calculados.

### Corregido

- `Modal`: las acciones del pie pasan a la línea siguiente cuando no caben lado a lado, en lugar de cortarse en un diálogo del ancho de un teléfono.
- El README decía 118 familias, seis herramientas en el MCP y React Native "pronto". Son 122 familias, ocho herramientas y `@refy-design/mobile` está en npm.

## [1.4.0] - 2026-11-10

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; solo en la web: `PlanCard.ctaPosition` y `PlanCard.description`.

### Cambiado

- **Cambio de comportamiento:** un `ThemeProvider` dentro de otro hereda lo que calculó el ámbito de afuera y aplica solo su propio tema. No pinta fondo y no cambia fuente, tamaño, interlineado ni corte de palabra. Con un `mode` distinto al del padre, aplica los roles de ese modo y el color del texto, y vuelve a aplicar los temas de afuera en el modo nuevo. Antes, todo provider anidado volvía a la base completa: se volvía una caja con `--bg`, devolvía el texto al tamaño del tema y borraba lo que el ámbito de afuera había sobrescrito. Un token derivado (`--field-radius: var(--control-radius)`) se resuelve con el token del anidado; si el tema exterior fijó el derivado con un valor, ese valor sigue valiendo. Para mantener el comportamiento anterior en una vitrina, una vista previa de otro tema o un cambio de identidad completo, pasa `isolate`.
- **Cambio de comportamiento:** el ámbito del Refy usa `overflow-wrap: normal`; antes era `anywhere`, que cortaba palabras entre letras en una barra estrecha. Para volver, define `--scope-overflow-wrap: anywhere` en el tema.
- **Cambio de comportamiento:** en `Hero`, el margen inferior de `--hero-title-margin` pasa a valer y `--hero-align` vale también por debajo de 720 px. Un tema que declaraba el margen sin querer el inferior usa `calc(var(--hero-title-descender, 0.12em) * -1)` como tercer valor, como los temas incluidos.
- `--site-footer-columns` pasa a ser la plantilla completa de la cuadrícula de `SiteFooter`; el número de columnas que escribía el componente pasó a `--site-footer-column-count`.
- `refy check` acepta un hook o token del tema declarado en el CSS de la pantalla con `var(--token)`, en cualquier selector, media query o pseudoclase. Con valor literal, sigue siendo error.
- `refy check` da un aviso `unverified-token` por token, con el número de usos, y trata como verificado lo que declara el tema del proyecto (`--theme <archivo>` o `theme.json` en la raíz). `refy_validate` acepta `theme`.
- Los temas Cobalto y Terracota declaran el color primario del claro en `modes.light`, sin cambiar la apariencia.

### Añadido

- `isolate` en `ThemeProvider`.
- `refy check` avisa `class-override` cuando una clase pasada a un componente del Refy cambia color, fondo, borde, radio, sombra o fuente, y sugiere el hook de la familia. El catálogo lleva los hooks que lee el CSS de cada familia.
- `refy_theme_validate` avisa `token-shadowed-by-mode` cuando el mismo token está en `tokens` y en un modo. `docs/THEMING.md` explica la precedencia, los ámbitos anidados y el tema derivado.
- Hooks de medida: `--chip-padding-inline`, `--chip-gap`, `--chip-icon-size`, `--badge-height`, `--badge-padding-inline`, `--badge-radius`, `--bubble-padding`, `--bubble-max-width`, `--bubble-radius`, `--bubble-tail-radius`, `--bubble-end-border-width`, `--icon-button-icon-md`, `--icon-button-icon-lg`, `--switch-thumb-inset`, `--switch-track-off`, `--input-prefix-color`, `--field-font-family`, `--hero-lead-leading`.
- `Button`: borde por variante (`--button-primary-border-width`, `--button-secondary-border-width`, `--button-ghost-border-width`, `--button-danger-border-width`) y `--button-white-space`.
- `PlanCard`: `description`, `ctaPosition` y `--plan-card-tag-inset-inline`. `SiteFooter`: `--site-footer-heading-weight` y `--site-footer-link-gap`.

### Corregido

- El pulgar del `Switch` recorre lo que sobra del ancho, del pulgar y del margen interno; antes recorría 16 px fijos.

## [1.3.4] - 2026-11-10

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Corregido

- La 1.3.3 quedó en el repositorio sin tag ni release, porque GitHub rechazó crear el tag por la API. El release crea el tag anotado con git y, si lo rechazan, publica con un tag ligero, y la 1.3.4 lleva a npm el contenido de la 1.3.1 a la 1.3.3.

## [1.3.3] - 2026-11-10

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Corregido

- La 1.3.2 quedó en el repositorio sin tag ni release: el tag que crea el release ahora lo anota el mantenedor y se comprueba por el commit al que apunta, y la 1.3.3 lleva a npm el contenido de la 1.3.1 y la 1.3.2.

## [1.3.2] - 2026-11-10

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- La doc de cada componente dice desde qué versión existen la familia y cada propiedad, y marca la propiedad obsoleta con su reemplazo. El historial sale de las etiquetas de release (`src/catalog/versions.json`), y la verificación rechaza quitar una familia o propiedad dentro de la misma versión mayor.

### Corregido

- La 1.3.1 quedó solo en el release de GitHub y no llegó a npm. La 1.3.2 lleva su contenido a npm.

## [1.3.1] - 2026-11-10

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; solo en la web: `ChipGroup`.

### Añadido

- `ChipGroup`: etiqueta, flechas, Home y End y un único foco para Chips de elección única o múltiple. Un Chip con `selectionMode="radio"` fuera del grupo avisa en desarrollo.
- El servidor MCP informa la versión que npm instala hoy (`publishedVersion`) y avisa cuando la documentación leída es de otra. Las herramientas aceptan `version` para leer la API de una versión anterior y declaran `annotations` (solo lectura).
- `refy check` marca la prop obsoleta (`deprecated-prop`) con su reemplazo, y todo hallazgo de color, fuente, radio o sombra literal trae `suggestion` con el token o componente a usar.

### Cambiado

- La etiqueta de `Range` y `Slider` usa la etiqueta de campo del tema, igual que `Input`.
- README y `docs/THEMING.md` explican que esbuild trae la hoja completa por la raíz del paquete y muestran el import directo por componente.

### Corregido

- El sufijo del valor en `ContentCard` baja entero cuando no cabe, sin partir el número.

## [1.3.0] - 2026-11-09

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; solo en la web: `BrandLogo.height` y `SiteFooter.externalIcon`.

### Añadido

- Plugin de Refy para Claude Code, la app de Claude, Cowork y Codex, instalado desde el repositorio (`/plugin marketplace add viniciuscoimbra/refy-design`, `codex plugin marketplace add viniciuscoimbra/refy-design`), con los atajos `refy-tela`, `refy-tema-de-site` y `refy-reproduzir-tela`. Extensión `refy.mcpb` para el chat de Claude Desktop en el release.
- `refy_theme_extract`: tema claro y oscuro a partir de los colores, fuentes y radios de un sitio, con la razón de cada elección y contraste AA verificado. La sonda `refy://theme-probe` lee sitios montados con JavaScript en el navegador del agente. El aspecto de botón, tarjeta, campo y sello se vuelve token, y lo que Refy no recibe vuelve como hueco con la ruta de extensión.
- `refy_compare`: compara la captura del original con la de la pantalla de Refy y muestra dónde difieren.

### Seguridad

- `refy_theme_extract` con `url` solo habla con direcciones públicas: verifica la IP a la que apunta el nombre, cada redirección y cada pedido que hace la página en el navegador, y se conecta a la IP verificada.

## [1.2.0] - 2026-11-09

Mobile: `@refy-design/mobile` no acompaña y sigue en 1.1.0; ninguna familia ni propiedad nueva.

### Añadido

- Servidor MCP en el paquete `@refy-design/web` (`npx --no-install refy-mcp`). El agente encuentra la familia a partir de una necesidad escrita en portugués, inglés o español, lee la API, revisa el código contra el contrato de los componentes y genera un tema claro y oscuro con contraste AA a partir de un color. Configuración en `docs/MCP.md`.

## [1.1.0] - 2026-11-07

Mobile: debuta en esta versión, con `@refy-design/mobile` 1.1.0.

### Añadido

- Nuevo paquete `@refy-design/mobile`: los componentes de Refy en React Native, con el mismo contrato de props que la web (`npx expo install @refy-design/mobile react-native-svg`).

## [1.0.0] - 2026-11-07

Primera versión pública.

### Añadido

- 118 familias de componentes React y TypeScript en átomos, moléculas y organismos, con API, ejemplos y teclado documentados.
- Tema por archivo: un JSON define color, fuente, forma, espacio y movimiento. Incluye los temas Refy, Fluido, Terracota y Cobalto.
- Kit para agentes de código (`refy-agent catalog`, `component`, `inspect`, `check`) instalado junto con el paquete.
- Paquete `@refy-design/web` en npm (`npm install @refy-design/web`), con el `.tgz` también adjunto al release `v1.0.0`.
- Sitio [refy.design](https://refy.design) con páginas estáticas por ruta, sitemap, `llms.txt` y `llms-full.txt`.
- Pruebas de navegador en Chromium, Firefox y WebKit en el CI público, y la publicación pasa por un escaneo de secretos en el código y en el paquete.
- Código de conducta, gobernanza y mantenedores publicados.

### Obsoleto

- `ContentCard` (y su nombre anterior `PropertyCard`): `address`, `price` y `priceSuffix` siguen funcionando y pueden salir a partir de la 2.0.0. Usa `subtitle`, `value` y `valueSuffix`.

[Unreleased]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.5...HEAD
[1.9.5]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.4...v1.9.5
[1.9.4]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.3...v1.9.4
[1.9.3]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.2...v1.9.3
[1.9.2]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.6.2...v1.7.0
[1.6.2]: https://github.com/viniciuscoimbra/refy-design/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/viniciuscoimbra/refy-design/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.3.4...v1.4.0
[1.3.4]: https://github.com/viniciuscoimbra/refy-design/compare/v1.3.1...v1.3.4
[1.3.1]: https://github.com/viniciuscoimbra/refy-design/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/viniciuscoimbra/refy-design/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/viniciuscoimbra/refy-design/releases/tag/v1.0.0
