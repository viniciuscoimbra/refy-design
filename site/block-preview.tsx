// Entrada da prévia de template dentro de site/: o servidor de dev só serve módulos a partir da
// raiz site/, e um <script src="../src/..."> no HTML dá 404 lá. Importado daqui, resolve no dev e no build.
import { siteLocale } from "./locale";
import { loadLocaleText } from "../src/pages/RefySitePage/i18n";
document.documentElement.dataset.locale = siteLocale;
// O template roda depois que os textos do idioma chegam (ver main.tsx).
loadLocaleText(siteLocale).then(() => import("../src/stories/BlockFrame"));
