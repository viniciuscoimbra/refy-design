// Entrada do site refy.design: a mesma página do Storybook, servida sozinha, sem o Storybook.
import { siteLocale } from "./locale";
import { loadLocaleText } from "../src/pages/RefySitePage/i18n";
import "../src/tokens/tokens.css";
import "../src/styles/fonts.css";
import "../src/styles/global.css";
import "./site.css";

// A tab opened before a deploy still asks for the previous build's chunks, which the new deploy
// no longer has: the page lost its styles mid-navigation. Reload once to get the current build.
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const key = "refy:reloaded-for-build";
  try { if (sessionStorage.getItem(key) === location.pathname) return; sessionStorage.setItem(key, location.pathname); } catch { /* no storage */ }
  location.reload();
});

// Os textos do idioma chegam antes da página: há frase traduzida no nível de módulo, que precisa
// do dicionário já carregado quando o módulo roda. Cada visita baixa só o próprio idioma.
loadLocaleText(siteLocale).then(() => import("./app")).then(({ mount }) => mount());
