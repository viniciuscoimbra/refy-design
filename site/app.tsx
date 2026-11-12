// A página do site, importada por main.tsx depois que os textos do idioma chegam.
import { siteLocale } from "./locale";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RefySitePage } from "../src/pages/RefySitePage/RefySitePage";
import { changeConfig, defaultConfig, presetFonts } from "../src/pages/PlaygroundPage/themeConfig";
import type { PlaygroundConfig, Skin } from "../src/pages/PlaygroundPage/themeConfig";
import type { ThemeMode } from "../src/lib/ThemeProvider";
// The color mode and the theme chosen on the site survive reloads. Without a choice the mode
// follows the browser and the theme is Refy.
// index.html applies the mode key to <html> before this script loads, so the first paint is right.
const modeKey = "refy:mode";
const skinKey = "refy:skin";
const topWindow = window.self === window.top;
function stored(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
// Device frames on the home show this page with the parent's theme: only the top window remembers.
function remember(key: string, value: string) {
  if (!topWindow) return;
  try { localStorage.setItem(key, value); } catch { /* no storage */ }
}
function storedMode(): ThemeMode {
  const value = stored(modeKey);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}
function storedSkin(): Skin {
  const value = stored(skinKey);
  return value && Object.prototype.hasOwnProperty.call(presetFonts, value) ? value : "refy-site";
}
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function paintRoot(mode: ThemeMode) {
  const resolved = mode === "system" ? (darkQuery.matches ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved === "editorial" ? "light" : resolved;
}

function Site() {
  const [config, setConfig] = useState<PlaygroundConfig>(() => {
    const skin = storedSkin();
    return { ...defaultConfig, skin, fonts: presetFonts[skin], theme: storedMode() };
  });
  useEffect(() => {
    paintRoot(config.theme);
    if (config.theme !== "system") return;
    const follow = () => paintRoot("system");
    darkQuery.addEventListener("change", follow);
    return () => darkQuery.removeEventListener("change", follow);
  }, [config.theme]);
  const change = (patch: Partial<PlaygroundConfig>) => {
    if (patch.theme) remember(modeKey, patch.theme);
    if (patch.skin) remember(skinKey, patch.skin);
    setConfig((current) => changeConfig(current, patch));
  };
  return <RefySitePage routing initialLocale={siteLocale} configuration={config} onConfigurationChange={change} />;
}

export function mount() {
  createRoot(document.getElementById("root")!).render(<StrictMode><Site /></StrictMode>);
}
