// Entrada da prévia de template no Storybook (block-preview.html): o dicionário do idioma chega
// antes do BlockFrame, que traduz texto no nível de módulo. No site, quem faz isso é site/block-preview.tsx.
import { currentLocale, loadLocaleText } from "../pages/RefySitePage/i18n";

loadLocaleText(currentLocale()).then(() => import("./BlockFrame"));
