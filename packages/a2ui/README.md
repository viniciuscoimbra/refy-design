# @refy-design/a2ui

Refy components as an [A2UI](https://a2ui.org) 1.0 catalog. An agent sends A2UI messages; your React app (web or React Native) draws them with Refy's components and your Refy theme.

- Catalog id: `https://refy.design/a2ui/v1`
- 12 components: Text, Image, Row, Column, List, Card, Divider, Button, TextField, CheckBox, ChoicePicker, Slider. They use the A2UI basic catalog v1 schemas.
- Web (React 19, `@refy-design/web`) and React Native (`@refy-design/mobile`): the same messages draw the same 12 components on both.
- Experimental (0.x): the A2UI libraries are pinned at 0.15.0 and the API may change between minor versions.

## Install

```bash
# Web
npm install @refy-design/a2ui @a2ui/react@0.15.0 @refy-design/web react react-dom
# React Native (Expo)
npx expo install @refy-design/a2ui @refy-design/mobile react-native-svg
```

Each platform installs only its own renderer: `@a2ui/react` and `react-dom` are optional peers, so a React Native app does not get them.

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

## React Native

```tsx
import { RefyProvider } from "@refy-design/mobile";
import { A2uiNativeSurface, createRefyNativeProcessor } from "@refy-design/a2ui/native";

const processor = createRefyNativeProcessor((action) => {
  // Same action as on the web: name, surfaceId, resolved context.
});

processor.processMessages(messagesFromAgent);
const surface = processor.model.surfacesMap.get("my-surface");

export function Screen() {
  return <RefyProvider theme={appTheme}>{surface ? <A2uiNativeSurface surface={surface} /> : null}</RefyProvider>;
}
```

The theme is your app's, as on the web: `RefyProvider` takes the same theme JSON as `ThemeProvider`. Pass `fonts` to `RefyProvider` with the families your app loaded through expo-font, or the system font is used.

The bridge reads the component schemas from a file of `@a2ui/web_core` that its `exports` map does not list (the catalog index uses `document`, which Hermes does not have). Metro resolves it by file path and prints a warning about it; the warning is expected.

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

Apache-2.0
