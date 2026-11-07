import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../tokens/tokens.css";
import "../styles/fonts.css";
import "../styles/global.css";
import { ThemeProvider } from "../lib/ThemeProvider";
import { LocaleProvider } from "../lib/locale";
import { currentLocale, htmlLang } from "../pages/RefySitePage/i18n";
import type { RefyTheme, ThemeMode } from "../lib/ThemeProvider";
import { blockRegistry } from "../pages/PlaygroundPage/blockRegistry";
import { PreviewDocument } from "../pages/PlaygroundPage/PreviewFrame";
import {
  defaultConfig,
  resolveTheme,
} from "../pages/PlaygroundPage/themeConfig";
function Preview() {
  const [theme, setTheme] = useState<RefyTheme>(resolveTheme(defaultConfig));
  const [mode, setMode] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(window.parent === window);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "refy:block-theme"
      )
        return;
      const data = event.data;
      if (
        !data.theme ||
        typeof data.theme.name !== "string" ||
        !["light", "dark", "system", "editorial"].includes(data.mode)
      )
        return;
      setTheme(data.theme);
      setMode(data.mode);
      setReady(true);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage(
      { type: "refy:block-ready" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", receive);
  }, []);
  const id = new URLSearchParams(window.location.search).get("refy-block");
  const block = blockRegistry.find((item) => item.id === id);
  if (!block) return <p role="alert">Block not found.</p>;
  const Render = block.component;
  return (
    <ThemeProvider
      theme={theme}
      mode={mode}
      style={{ minHeight: "100vh", visibility: ready ? "visible" : "hidden" }}
    >
      <Render />
    </ThemeProvider>
  );
}
// ?refy-view=<view> is the Playground preview (PreviewFrame); ?refy-block=<id> stays the template preview.
const playgroundView = new URLSearchParams(window.location.search).has("refy-view");
createRoot(document.getElementById("root")!).render(
  <LocaleProvider locale={htmlLang[currentLocale()]}>{playgroundView ? <PreviewDocument /> : <Preview />}</LocaleProvider>,
);
