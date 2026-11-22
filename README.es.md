# refy

<!-- badges:start -->
<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/viniciuscoimbra/refy-design"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/viniciuscoimbra/refy-design/ci.yml?branch=main"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/releases/latest"><img alt="Version" src="https://img.shields.io/github/v/release/viniciuscoimbra/refy-design"></a>
  <img alt="Node" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fviniciuscoimbra%2Frefy-design%2Fmain%2Fpackage.json&query=%24.engines.node&label=node">
  <a href="https://github.com/viniciuscoimbra/refy-design/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/viniciuscoimbra/refy-design"></a>
  <a href="https://github.com/viniciuscoimbra/refy-design/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/viniciuscoimbra/refy-design"></a>
</p>
<!-- badges:end -->

**Tu diseño, a tu manera.** refy es un design system en React y TypeScript, para web y móvil, hecho para que los agentes de IA lo usen bien. Un archivo de tema cambia toda la interfaz, y los componentes mantienen su comportamiento.

[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md)

## Enlaces rápidos

- Sitio y documentación: [refy.design](https://refy.design/es)
- [Playground](https://refy.design/es/playground): elige un tema, cambia colores, fuentes, formas y movimiento, y expórtalo.
- [Plantillas](https://refy.design/es/plantillas): pantallas completas por finalidad, funcionando con refy.
- [Servidor MCP](docs/MCP.md) para Claude Code, Codex, Kiro y VS Code.
- [Changelog](CHANGELOG.md) · [Roadmap](docs/es/ROADMAP.md)

## Cuándo usar refy

- Quieres la interfaz de tu producto con tu identidad sin hacer fork de un design system. Un tema es un archivo JSON: colores, fuentes, forma, espaciado y movimiento.
- Un agente de IA construye o cambia tus pantallas. refy trae un catálogo versionado, una CLI y un servidor MCP, y el agente encuentra el componente correcto y revisa su propio código.
- Publicas en la web y en React Native con las mismas props y el mismo tema.
- Tu agente envía mensajes [A2UI](https://a2ui.org) y quieres que se dibujen con tu design system.

## Principios

- **Personalización desde el inicio.** La apariencia vive en los tokens. Cambiar el archivo de tema cambia todos los componentes, sin CSS aparte.
- **Poco código y build liviano.** ESM, tree shaking y CSS por familia. Una pantalla con Button e Input no carga los gráficos.
- **Atomic design.** Una página es composición de átomos, moléculas y organismos. La capacidad nueva entra en el componente, no en un solo producto.
- **Agentes primero.** Cada familia tiene API, ejemplos, cuándo usarla y cuándo usar otra, en un formato que los agentes leen.

## Empezar

| Camino | Lo que obtienes |
|---|---|
| [Instalar en un proyecto React](#instalar) | `@refy-design/web` con tu tema |
| [Partir de un proyecto listo](examples/react-starter/) | App Vite con un tema ya exportado |
| [Usarlo desde un agente](#usar-con-agentes) | El servidor MCP o la CLI `refy-agent` |
| [Ejecutar el catálogo en tu máquina](#ejecutar-el-catálogo-en-tu-máquina) | Storybook con todas las familias y el editor de tema |

## Paquetes

| Paquete | Qué es | Versión |
|---|---|---|
| [`@refy-design/web`](https://www.npmjs.com/package/@refy-design/web) | Componentes React, temas, catálogo para agentes, CLI y servidor MCP | [![npm](https://img.shields.io/npm/v/@refy-design/web.svg)](https://www.npmjs.com/package/@refy-design/web) |
| [`@refy-design/mobile`](packages/native/README.md) | Componentes React Native con las mismas props y el mismo tema | [![npm](https://img.shields.io/npm/v/@refy-design/mobile.svg)](https://www.npmjs.com/package/@refy-design/mobile) |
| [`@refy-design/a2ui`](packages/a2ui/README.md) | refy como catálogo A2UI 1.0, en la web y en React Native | [![npm](https://img.shields.io/npm/v/@refy-design/a2ui.svg)](https://www.npmjs.com/package/@refy-design/a2ui) |

## Instalar

```bash
npm install @refy-design/web
```

Carga los estilos una vez y usa los exports públicos:

```tsx
import '@refy-design/web/tokens.css';
import '@refy-design/web/fonts.css'; // opcional: fuentes locales que trae refy
import { Button, Input, ThemeProvider } from '@refy-design/web';
import type { RefyTheme } from '@refy-design/web';
import themeData from './theme.json';

const theme: RefyTheme = themeData;

export function Registro() {
  return (
    <ThemeProvider theme={theme} mode="system">
      <Input label="Nombre completo" placeholder="Escribe tu nombre" />
      <Button variant="primary" onClick={() => console.log('Guardar')}>
        Guardar
      </Button>
    </ThemeProvider>
  );
}
```

`global.css` es un reset opcional para proyectos nuevos y afecta toda la aplicación. `fonts.css` también es opcional si tu producto ya carga sus fuentes. [Temas y exportación](docs/THEMING.md).

Next.js App Router (Server Components): [docs/NEXT_E_REACT_NATIVE.md](docs/NEXT_E_REACT_NATIVE.md). React Native: `npx expo install @refy-design/mobile react-native-svg`, con las mismas props y el mismo JSON de tema que la web ([guía](packages/native/README.md)).

A2UI: `npm install @refy-design/a2ui` dibuja los mensajes A2UI 1.0 de un agente con los componentes y el tema de refy, en la web o en React Native (`@refy-design/a2ui/native`) ([guía](packages/a2ui/README.md)).

## Usar con agentes

El paquete trae un catálogo versionado de componentes, APIs, ejemplos e instrucciones. `catalog` acepta el nombre exacto o la necesidad en español, inglés o portugués:

```bash
npm exec --offline -- refy-agent catalog tabla de datos
npm exec --offline -- refy-agent component Input
npm exec --offline -- refy-agent check src/Pantalla.tsx src/pantalla.css
```

El mismo kit funciona como servidor MCP. En Claude Code:

```bash
claude mcp add refy -- npx --no-install refy-mcp
```

Tiene 8 herramientas: `refy_search` encuentra la familia por la necesidad escrita en español, inglés o portugués; `refy_component` lee la API; `refy_collections` lista las colecciones; `refy_validate` revisa el código contra la API y las reglas del `check`; `refy_theme_generate` y `refy_theme_validate` generan y revisan un tema con contraste AA; `refy_theme_extract` saca el tema de un sitio; `refy_compare` compara la captura del original con la pantalla de refy. El servidor remoto (refy.design/mcp) tiene las siete primeras, porque no lee archivos de tu máquina. [Otros clientes y límites](docs/MCP.md).

## Qué hay en el catálogo

- **Componentes:** 135 familias (35 átomos, 71 moléculas y 29 organismos), con uso, API, ejemplos interactivos y código para copiar. Los 570 fragmentos tomados de las fuentes compilan contra la API pública.
- **Plantillas** (`Block` en el código): pantallas completas por finalidad, con vista previa responsive. [Guía](docs/BLOCKS.md).
- **Charts:** catálogo D3 con 24 tipos, ejes, leyendas, tooltip, zoom, brush y streaming. [Contratos](docs/CHARTS.md).
- **Colecciones:** medios, geolocalización, conversación, datos, colaboración, comercio, finanzas y contenido. [Colecciones](docs/COLLECTIONS.md).

Los ejemplos guardan login, archivos y preferencias en local. Tu aplicación conecta autenticación, persistencia, permisos y reglas de negocio. Los límites de cada familia están en [docs/QUALITY.md](docs/QUALITY.md).

## Ejecutar el catálogo en tu máquina

Node **22.12+** y npm.

```bash
git clone https://github.com/viniciuscoimbra/refy-design.git
cd refy-design
npm ci
npm run storybook
```

Abre http://localhost:6006 y ve a **Playground → Componentes**. Elige **Tema** y **Modo** en la barra, ajusta el tema en **Personalizar tema** y descarga el JSON en **Exportar**.

```bash
npm run check            # tokens, contraste, motion, tipos, build y ejemplos
npm run test:browser     # pruebas de interacción
```

## Roadmap

El roadmap del proyecto está en [docs/es/ROADMAP.md](docs/es/ROADMAP.md).

## Contribuir

Lee [docs/es/CONTRIBUTING.md](docs/es/CONTRIBUTING.md). Los cambios siguen [OpenSpec](openspec/specs). El proyecto funciona como se describe en [docs/es/GOVERNANCE.md](docs/es/GOVERNANCE.md), con las personas de [docs/es/MAINTAINERS.md](docs/es/MAINTAINERS.md).

[Código de conducta](docs/es/CODE_OF_CONDUCT.md) · [Seguridad](docs/es/SECURITY.md) · [Soporte](docs/es/SUPPORT.md) · [Versiones](docs/es/RELEASES.md) · [Quién lo usa](docs/es/ADOPTERS.md) · [Privacidad](PRIVACY.md) · [Avisos de terceros](THIRD_PARTY_NOTICES.md)

## Licencia

refy está bajo la licencia [Apache 2.0](LICENSE), con el [NOTICE](NOTICE). Las versiones hasta la 1.9.3 salieron bajo MIT. El nombre y el logo de refy siguen [docs/es/TRADEMARKS.md](docs/es/TRADEMARKS.md).
