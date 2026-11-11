// A página do site, importada por main.tsx depois que os textos do idioma chegam.
import { siteLocale } from "./locale";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RefySitePage } from "../src/pages/RefySitePage/RefySitePage";
import { changeConfig, defaultConfig, presetFonts } from "../src/pages/PlaygroundPage/themeConfig";
import type { PlaygroundConfig } from "../src/pages/PlaygroundPage/themeConfig";
import type { ThemeMode } from "../src/lib/ThemeProvider";
// The color mode chosen on the site survives reloads. Without a choice it follows the browser.
// index.html applies the same key to <html> before this script loads, so the first paint is right.
const modeKey = "refy:mode";
const topWindow = window.self === window.top;
function storedMode(): ThemeMode {
  try {
    const value = localStorage.getItem(modeKey);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch { /* no storage */ }
  return "system";
}
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function paintRoot(mode: ThemeMode) {
  const resolved = mode === "system" ? (darkQuery.matches ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved === "editorial" ? "light" : resolved;
}

function Site() {
  const [config, setConfig] = useState<PlaygroundConfig>({ ...defaultConfig, skin: "refy-site", fonts: presetFonts["refy-site"], theme: storedMode() });
  useEffect(() => {
    paintRoot(config.theme);
    if (config.theme !== "system") return;
    const follow = () => paintRoot("system");
    darkQuery.addEventListener("change", follow);
    return () => darkQuery.removeEventListener("change", follow);
  }, [config.theme]);
  const change = (patch: Partial<PlaygroundConfig>) => {
    if (patch.theme && topWindow) {
      try { localStorage.setItem(modeKey, patch.theme); } catch { /* no storage */ }
    }
    setConfig((current) => changeConfig(current, patch));
  };
  return <RefySitePage routing initialLocale={siteLocale} configuration={config} onConfigurationChange={change} />;
}

export function mount() {
  createRoot(document.getElementById("root")!).render(<StrictMode><Site /></StrictMode>);
}
