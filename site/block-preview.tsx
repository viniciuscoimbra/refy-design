// Entrada da prévia de template dentro de site/: o servidor de dev só serve módulos a partir da
// raiz site/, e um <script src="../src/..."> no HTML dá 404 lá. Importado daqui, resolve no dev e no build.
import { siteLocale } from "./locale";
import "../src/stories/BlockFrame";
document.documentElement.dataset.locale = siteLocale;
