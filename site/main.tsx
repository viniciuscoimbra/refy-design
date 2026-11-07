// Entrada do site refy.design: a mesma página do Storybook, servida sozinha, sem o Storybook.
import { siteLocale } from "./locale";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../src/tokens/tokens.css";
import "../src/styles/fonts.css";
import "../src/styles/global.css";
import "./site.css";
import { RefySitePage } from "../src/pages/RefySitePage/RefySitePage";
import { changeConfig, defaultConfig, presetFonts } from "../src/pages/PlaygroundPage/themeConfig";
import type { PlaygroundConfig } from "../src/pages/PlaygroundPage/themeConfig";

function Site() {
  const [config, setConfig] = useState<PlaygroundConfig>({ ...defaultConfig, skin: "refy-site", fonts: presetFonts["refy-site"] });
  return <RefySitePage routing initialLocale={siteLocale} configuration={config} onConfigurationChange={(patch) => setConfig((current) => changeConfig(current, patch))} />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><Site /></StrictMode>);
