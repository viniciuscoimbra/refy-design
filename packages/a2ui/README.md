# @refy-design/a2ui

Refy components as an [A2UI](https://a2ui.org) 1.0 catalog. An agent sends A2UI messages; your React app draws them with Refy's components and your Refy theme.

- Catalog id: `https://refy.design/a2ui/v1`
- 12 components: Text, Image, Row, Column, List, Card, Divider, Button, TextField, CheckBox, ChoicePicker, Slider. They use the A2UI basic catalog v1 schemas.
- Web only (React 19). The React Native bridge is not part of this version.
- Experimental (0.x): the A2UI libraries are pinned at 0.15.0 and the API may change between minor versions.

## Install

```bash
npm install @refy-design/a2ui @refy-design/web react react-dom
```

## Render a surface

```tsx
import { ThemeProvider } from "@refy-design/web";
import { A2uiSurface, createRefyProcessor } from "@refy-design/a2ui";
import "@refy-design/web/tokens.css";
import "@refy-design/web/global.css";
import "@refy-design/web/styles.css";
import "@refy-design/a2ui/catalog.css";

const processor = createRefyProcessor((action) => {
  // Send the action (name, surfaceId, resolved context) back to your agent.
});

processor.processMessages(messagesFromAgent);
const surface = processor.model.surfacesMap.get("my-surface");

export function Screen() {
  return <ThemeProvider>{surface ? <A2uiSurface surface={surface} /> : null}</ThemeProvider>;
}
```

A2UI 1.0 does not carry a theme in `createSurface`. The look comes from the `ThemeProvider` around the surface, so the same messages follow any Refy theme and light or dark mode.

## Validate on the server

`@refy-design/a2ui/definition` has the catalog without React or the DOM. Use it to check an agent's messages before they reach the browser, with the same rules as the renderer:

```ts
import { createRefyValidator } from "@refy-design/a2ui/definition";

const validator = createRefyValidator();
validator.processMessages(messagesFromAgent); // throws A2uiValidationError on a bad message
```

## Rules

- A component outside the catalog (for example `Video`) is rejected with `A2uiValidationError`, and nothing is drawn.
- Components that an `updateComponents` message removes from the tree are kept, because A2UI 1.0 has no message to delete a component.

## License

MIT
