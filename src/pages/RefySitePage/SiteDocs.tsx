import type { ReactNode } from "react";
import { Callout, CodeBlock, NavCard, Prose, SettingsSubnav } from "../../index";
import type { SettingsSubnavLinkProps } from "../../index";
import { Heading, SideNav, Toc } from "./SiteCatalog";
import styles from "./RefySitePage.module.css";
import { useSiteLocale } from "./i18n";
import type { Locale } from "./i18n";
import { installCommands, packageName, packagePublished, packageVersion } from "./packageRelease";

// Docs técnica: uma página por assunto, menu da esquerda lista as páginas e o sumário da
// direita lista as seções da página aberta. Texto curto, só o que o pacote faz hoje.

export type DocTopic = "instalacao" | "primeira-tela" | "tema-por-arquivo" | "mobile" | "compatibilidade";

const appCodeFor = (label: string) => `import { Button, ThemeProvider, refySiteTheme } from "@refy-design/web";
import "@refy-design/web/tokens.css";
import "@refy-design/web/fonts.css";

export default function App() {
  return (
    <ThemeProvider theme={refySiteTheme} mode="light">
      <Button variant="primary">${label}</Button>
    </ThemeProvider>
  );
}`;

const themeFile = `{
  "name": "cobalto",
  "label": "Cobalto",
  "tokens": {
    "--font-brand": "\\"Space Grotesk\\", system-ui, sans-serif",
    "--primary": "#2643d1",
    "--radius-md": "8px"
  },
  "modes": {
    "dark": { "--primary": "#8ea0ff" }
  }
}`;

const themeUseFor = (file: string) => `import { ThemeProvider } from "@refy-design/web";
import theme from "./${file}";

<ThemeProvider theme={theme} mode="system">
  <App />
</ThemeProvider>`;

const nativeCodeFor = (file: string, synced: string, save: string, handler: string) => `import { RefyProvider, Button, Badge } from "@refy-design/mobile";
import theme from "./${file}";

export default function App() {
  return (
    <RefyProvider theme={theme} mode="system">
      <Badge tone="success" dot>${synced}</Badge>
      <Button variant="primary" onPress={${handler}}>${save}</Button>
    </RefyProvider>
  );
}`;

type DocGroup = "start" | "use";
interface DocPage {
  label: string;
  group: DocGroup;
  description: string;
  sections: Array<[string, string]>;
  body: ReactNode;
}

const groupLabels: Record<Locale, Record<DocGroup, string>> = {
  pt: { start: "Começar", use: "Usar" },
  en: { start: "Get started", use: "Use" },
  es: { start: "Empezar", use: "Usar" },
};
const warnIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

interface InstallText { notYetTitle: string; notYet: ReactNode; later: string; viaNpm: string; requires: ReactNode; firstScreen: ReactNode }
const installText: Record<Locale, InstallText> = {
  pt: {
    notYetTitle: "Ainda não publicado",
    notYet: <>A versão {packageVersion} vai sair no npm como <code>{packageName}</code>. Até lá, nem o npm nem o repositório <code>refy-design</code> têm o pacote, e todo comando de instalação dá erro 404.</>,
    later: "Quando o pacote sair, o comando aparece aqui.",
    viaNpm: "Instale pelo npm:",
    requires: <>Precisa de <code>react</code> e <code>react-dom</code> 18 ou mais.</>,
    firstScreen: <>Este código roda depois que o pacote for publicado. Hoje o import de <code>{packageName}</code> falha.</>,
  },
  en: {
    notYetTitle: "Not published yet",
    notYet: <>Version {packageVersion} will ship on npm as <code>{packageName}</code>. Until then, neither npm nor the <code>refy-design</code> repository has the package, and every install command fails with a 404.</>,
    later: "Once the package ships, the command shows up here.",
    viaNpm: "Install from npm:",
    requires: <>Requires <code>react</code> and <code>react-dom</code> 18 or later.</>,
    firstScreen: <>This code runs once the package is published. Today the <code>{packageName}</code> import fails.</>,
  },
  es: {
    notYetTitle: "Todavía no publicado",
    notYet: <>La versión {packageVersion} saldrá en npm como <code>{packageName}</code>. Hasta entonces, ni npm ni el repositorio <code>refy-design</code> tienen el paquete, y todo comando de instalación da error 404.</>,
    later: "Cuando salga el paquete, el comando aparece aquí.",
    viaNpm: "Instala desde npm:",
    requires: <>Requiere <code>react</code> y <code>react-dom</code> 18 o superior.</>,
    firstScreen: <>Este código funciona cuando el paquete esté publicado. Hoy el import de <code>{packageName}</code> falla.</>,
  },
};

const installDescription: Record<Locale, string> = packagePublished
  ? { pt: "Instale o pacote e importe os estilos uma vez.", en: "Install the package and import the styles once.", es: "Instala el paquete e importa los estilos una vez." }
  : { pt: "O refy ainda não foi publicado: hoje nenhum comando instala o pacote.", en: "refy is not published yet: no command installs the package today.", es: "refy todavía no se publicó: hoy ningún comando instala el paquete." };

const packageSection = (locale: Locale, heading: string) => {
  const text = installText[locale];
  return (
    <section id="pacote">
      <h2>{heading}</h2>
      {packagePublished ? (<>
        <p>{text.viaNpm}</p>
        <figure>
          <CodeBlock language="bash" code={installCommands.npm} />
          <figcaption>{text.requires}</figcaption>
        </figure>
      </>) : (<>
        <Callout tone="warn" icon={warnIcon} title={text.notYetTitle}>{text.notYet}</Callout>
        <p>{text.later} {text.requires}</p>
      </>)}
    </section>
  );
};

const firstScreenNotice = (locale: Locale) =>
  packagePublished ? null : <Callout tone="warn" icon={warnIcon} title={installText[locale].notYetTitle}>{installText[locale].firstScreen}</Callout>;
const styleImports = 'import "@refy-design/web/tokens.css";\nimport "@refy-design/web/fonts.css";';
const nativeList = "Avatar, Badge, BrandLogo, Button, Card, CardHeader, Chip, ChoiceCard, ConnectorCard, D3Chart, EmptyState, Fab, IconButton, Input, Item, Modal, OAuthButton, PageHeader, ProgressBar, ScrollArea, Segmented, Select, SettingRow, Stat, Tabs, Textarea, Toast, WizardStepper";

const pt: Record<DocTopic, DocPage> = {
  instalacao: {
    label: "Instalação", group: "start",
    description: installDescription.pt,
    sections: [["pacote", "Pacote"], ["estilos", "Estilos"]],
    body: (<>
      {packageSection("pt", "Pacote")}
      <section id="estilos">
        <h2>Estilos</h2>
        <p>Importe os tokens e as fontes uma vez, na entrada do app.</p>
        <figure>
          <CodeBlock label="main.tsx" language="tsx" code={styleImports} />
          <figcaption><code>@refy-design/web/global.css</code> é opcional: aplica o reset na página inteira.</figcaption>
        </figure>
      </section>
    </>),
  },
  "primeira-tela": {
    label: "Primeira tela", group: "start",
    description: "Um botão do refy dentro do tema do site.",
    sections: [["codigo", "Código"], ["proximo", "Próximo passo"]],
    body: (<>
      <section id="codigo">
        <h2>Código</h2>
        {firstScreenNotice("pt")}
        <CodeBlock label="App.tsx" language="tsx" code={appCodeFor("Começar")} />
        <p><code>ThemeProvider</code> aplica o tema em tudo que está dentro dele. <code>mode</code> aceita <code>light</code>, <code>dark</code> ou <code>system</code>.</p>
      </section>
      <section id="proximo">
        <h2>Próximo passo</h2>
        <p>Escolha as peças no catálogo de componentes. Cada família tem exemplo e API.</p>
      </section>
    </>),
  },
  "tema-por-arquivo": {
    label: "Tema por arquivo", group: "use",
    description: "Um JSON define cor, fonte, raio e densidade. Troque o arquivo e a interface toda muda.",
    sections: [["arquivo", "O arquivo"], ["aplicar", "Aplicar"], ["modos", "Claro e escuro"]],
    body: (<>
      <section id="arquivo">
        <h2>O arquivo</h2>
        <p><code>tokens</code> vale para todos os modos. Token que você não escreve vem da base do refy.</p>
        <CodeBlock label="tema.json" language="json" code={themeFile} />
      </section>
      <section id="aplicar">
        <h2>Aplicar</h2>
        <CodeBlock language="tsx" code={themeUseFor("tema.json")} />
        <p>No Playground você monta o tema na tela e exporta esse mesmo arquivo.</p>
      </section>
      <section id="modos">
        <h2>Claro e escuro</h2>
        <p><code>modes.dark</code> só troca o que muda no escuro. A geometria fica igual nos dois modos.</p>
      </section>
    </>),
  },
  mobile: {
    label: "Mobile", group: "use",
    description: "@refy-design/mobile usa o mesmo JSON de tema e o mesmo contrato de props da web.",
    sections: [["uso", "Uso"], ["componentes", "Componentes"], ["requisitos", "Requisitos"]],
    body: (<>
      <section id="uso">
        <h2>Uso</h2>
        <CodeBlock label="App.tsx" language="tsx" code={nativeCodeFor("tema.json", "Sincronizado", "Salvar", "salvar")} />
        <p><code>RefyProvider</code> recebe o mesmo <code>tema.json</code> da web.</p>
      </section>
      <section id="componentes">
        <h2>Componentes</h2>
        <p>{nativeList.replace("D3Chart", "D3Chart (linha e área)").replace(", WizardStepper", " e WizardStepper")}.</p>
        <p>A navegação fica com o roteador do app (React Navigation ou Expo Router).</p>
      </section>
      <section id="requisitos">
        <h2>Requisitos</h2>
        <p><code>react</code> 19.1 ou mais, <code>react-native</code> 0.76 ou mais e <code>react-native-svg</code> 15 ou mais.</p>
      </section>
    </>),
  },
  compatibilidade: {
    label: "Compatibilidade", group: "use",
    description: "Versões que o pacote exige.",
    sections: [["web", "Web"], ["mobile-req", "Mobile"]],
    body: (<>
      <section id="web">
        <h2>Web</h2>
        <p><code>react</code> e <code>react-dom</code> 18 ou mais. Os componentes rodam em Next.js com <code>"use client"</code> já declarado.</p>
      </section>
      <section id="mobile-req">
        <h2>Mobile</h2>
        <p><code>react</code> 19.1, <code>react-native</code> 0.76 (nova arquitetura) e <code>react-native-svg</code> 15.</p>
      </section>
    </>),
  },
};

const en: Record<DocTopic, DocPage> = {
  instalacao: {
    label: "Installation", group: "start",
    description: installDescription.en,
    sections: [["pacote", "Package"], ["estilos", "Styles"]],
    body: (<>
      {packageSection("en", "Package")}
      <section id="estilos">
        <h2>Styles</h2>
        <p>Import the tokens and fonts once, at the app entry.</p>
        <figure>
          <CodeBlock label="main.tsx" language="tsx" code={styleImports} />
          <figcaption><code>@refy-design/web/global.css</code> is optional: it applies the reset to the whole page.</figcaption>
        </figure>
      </section>
    </>),
  },
  "primeira-tela": {
    label: "First screen", group: "start",
    description: "A refy button inside the site theme.",
    sections: [["codigo", "Code"], ["proximo", "Next step"]],
    body: (<>
      <section id="codigo">
        <h2>Code</h2>
        {firstScreenNotice("en")}
        <CodeBlock label="App.tsx" language="tsx" code={appCodeFor("Get started")} />
        <p><code>ThemeProvider</code> applies the theme to everything inside it. <code>mode</code> accepts <code>light</code>, <code>dark</code> or <code>system</code>.</p>
      </section>
      <section id="proximo">
        <h2>Next step</h2>
        <p>Pick the pieces in the component catalog. Every family has an example and an API.</p>
      </section>
    </>),
  },
  "tema-por-arquivo": {
    label: "Theme from a file", group: "use",
    description: "One JSON sets color, font, radius and density. Swap the file and the whole interface changes.",
    sections: [["arquivo", "The file"], ["aplicar", "Apply"], ["modos", "Light and dark"]],
    body: (<>
      <section id="arquivo">
        <h2>The file</h2>
        <p><code>tokens</code> applies to every mode. Any token you leave out comes from the refy base.</p>
        <CodeBlock label="theme.json" language="json" code={themeFile} />
      </section>
      <section id="aplicar">
        <h2>Apply</h2>
        <CodeBlock language="tsx" code={themeUseFor("theme.json")} />
        <p>In the Playground you build the theme on screen and export this same file.</p>
      </section>
      <section id="modos">
        <h2>Light and dark</h2>
        <p><code>modes.dark</code> only swaps what changes in dark mode. Geometry stays the same in both modes.</p>
      </section>
    </>),
  },
  mobile: {
    label: "Mobile", group: "use",
    description: "@refy-design/mobile uses the same theme JSON and the same props contract as the web.",
    sections: [["uso", "Usage"], ["componentes", "Components"], ["requisitos", "Requirements"]],
    body: (<>
      <section id="uso">
        <h2>Usage</h2>
        <CodeBlock label="App.tsx" language="tsx" code={nativeCodeFor("theme.json", "Synced", "Save", "save")} />
        <p><code>RefyProvider</code> takes the same <code>theme.json</code> as the web.</p>
      </section>
      <section id="componentes">
        <h2>Components</h2>
        <p>{nativeList.replace("D3Chart", "D3Chart (line and area)").replace(", WizardStepper", " and WizardStepper")}.</p>
        <p>Navigation belongs to the app router (React Navigation or Expo Router).</p>
      </section>
      <section id="requisitos">
        <h2>Requirements</h2>
        <p><code>react</code> 19.1 or later, <code>react-native</code> 0.76 or later and <code>react-native-svg</code> 15 or later.</p>
      </section>
    </>),
  },
  compatibilidade: {
    label: "Compatibility", group: "use",
    description: "Versions the package requires.",
    sections: [["web", "Web"], ["mobile-req", "Mobile"]],
    body: (<>
      <section id="web">
        <h2>Web</h2>
        <p><code>react</code> and <code>react-dom</code> 18 or later. Components run in Next.js with <code>"use client"</code> already declared.</p>
      </section>
      <section id="mobile-req">
        <h2>Mobile</h2>
        <p><code>react</code> 19.1, <code>react-native</code> 0.76 (new architecture) and <code>react-native-svg</code> 15.</p>
      </section>
    </>),
  },
};

const es: Record<DocTopic, DocPage> = {
  instalacao: {
    label: "Instalación", group: "start",
    description: installDescription.es,
    sections: [["pacote", "Paquete"], ["estilos", "Estilos"]],
    body: (<>
      {packageSection("es", "Paquete")}
      <section id="estilos">
        <h2>Estilos</h2>
        <p>Importa los tokens y las fuentes una vez, en la entrada de la app.</p>
        <figure>
          <CodeBlock label="main.tsx" language="tsx" code={styleImports} />
          <figcaption><code>@refy-design/web/global.css</code> es opcional: aplica el reset a toda la página.</figcaption>
        </figure>
      </section>
    </>),
  },
  "primeira-tela": {
    label: "Primera pantalla", group: "start",
    description: "Un botón de refy dentro del tema del sitio.",
    sections: [["codigo", "Código"], ["proximo", "Siguiente paso"]],
    body: (<>
      <section id="codigo">
        <h2>Código</h2>
        {firstScreenNotice("es")}
        <CodeBlock label="App.tsx" language="tsx" code={appCodeFor("Empezar")} />
        <p><code>ThemeProvider</code> aplica el tema a todo lo que está dentro. <code>mode</code> acepta <code>light</code>, <code>dark</code> o <code>system</code>.</p>
      </section>
      <section id="proximo">
        <h2>Siguiente paso</h2>
        <p>Elige las piezas en el catálogo de componentes. Cada familia tiene ejemplo y API.</p>
      </section>
    </>),
  },
  "tema-por-arquivo": {
    label: "Tema por archivo", group: "use",
    description: "Un JSON define color, fuente, radio y densidad. Cambia el archivo y cambia toda la interfaz.",
    sections: [["arquivo", "El archivo"], ["aplicar", "Aplicar"], ["modos", "Claro y oscuro"]],
    body: (<>
      <section id="arquivo">
        <h2>El archivo</h2>
        <p><code>tokens</code> vale para todos los modos. El token que no escribes viene de la base de refy.</p>
        <CodeBlock label="tema.json" language="json" code={themeFile} />
      </section>
      <section id="aplicar">
        <h2>Aplicar</h2>
        <CodeBlock language="tsx" code={themeUseFor("tema.json")} />
        <p>En el Playground armas el tema en pantalla y exportas este mismo archivo.</p>
      </section>
      <section id="modos">
        <h2>Claro y oscuro</h2>
        <p><code>modes.dark</code> solo cambia lo que cambia en oscuro. La geometría queda igual en los dos modos.</p>
      </section>
    </>),
  },
  mobile: {
    label: "Móvil", group: "use",
    description: "@refy-design/mobile usa el mismo JSON de tema y el mismo contrato de props que la web.",
    sections: [["uso", "Uso"], ["componentes", "Componentes"], ["requisitos", "Requisitos"]],
    body: (<>
      <section id="uso">
        <h2>Uso</h2>
        <CodeBlock label="App.tsx" language="tsx" code={nativeCodeFor("tema.json", "Sincronizado", "Guardar", "guardar")} />
        <p><code>RefyProvider</code> recibe el mismo <code>tema.json</code> de la web.</p>
      </section>
      <section id="componentes">
        <h2>Componentes</h2>
        <p>{nativeList.replace("D3Chart", "D3Chart (línea y área)").replace(", WizardStepper", " y WizardStepper")}.</p>
        <p>La navegación queda a cargo del router de la app (React Navigation o Expo Router).</p>
      </section>
      <section id="requisitos">
        <h2>Requisitos</h2>
        <p><code>react</code> 19.1 o superior, <code>react-native</code> 0.76 o superior y <code>react-native-svg</code> 15 o superior.</p>
      </section>
    </>),
  },
  compatibilidade: {
    label: "Compatibilidad", group: "use",
    description: "Versiones que exige el paquete.",
    sections: [["web", "Web"], ["mobile-req", "Móvil"]],
    body: (<>
      <section id="web">
        <h2>Web</h2>
        <p><code>react</code> y <code>react-dom</code> 18 o superior. Los componentes funcionan en Next.js con <code>"use client"</code> ya declarado.</p>
      </section>
      <section id="mobile-req">
        <h2>Móvil</h2>
        <p><code>react</code> 19.1, <code>react-native</code> 0.76 (nueva arquitectura) y <code>react-native-svg</code> 15.</p>
      </section>
    </>),
  },
};

export const localizedDocPages: Record<Locale, Record<DocTopic, DocPage>> = { pt, en, es };
export const docGroupLabel = (locale: Locale, group: DocGroup) => groupLabels[locale][group];
export const docTopics = Object.keys(pt) as DocTopic[];
export const docHref = (topic: DocTopic) => `/docs/${topic}`;
const docsText = {
  pt: { title: "Documentação", pages: "Páginas da documentação", previous: "Anterior", next: "Próximo", pager: "Anterior e próximo" },
  en: { title: "Documentation", pages: "Documentation pages", previous: "Previous", next: "Next", pager: "Previous and next" },
  es: { title: "Documentación", pages: "Páginas de la documentación", previous: "Anterior", next: "Siguiente", pager: "Anterior y siguiente" },
};

export function DocsPage({ topic, onTopic }: { topic: DocTopic; onTopic: (topic: DocTopic) => void }) {
  const { locale } = useSiteLocale();
  const pages = localizedDocPages[locale];
  const page = pages[topic];
  const text = docsText[locale];
  const link = (item: { href: string }, props: SettingsSubnavLinkProps) => (
    <a {...props} onClick={(event) => { event.preventDefault(); onTopic(item.href.split("/").pop() as DocTopic); }} />
  );
  const index = docTopics.indexOf(topic);
  const previous = docTopics[index - 1];
  const next = docTopics[index + 1];
  const go = (target: DocTopic) => (event: { preventDefault: () => void }) => { event.preventDefault(); onTopic(target); };
  return (
    <main id="site-content" className={styles.docGrid}>
      <SideNav title={text.title}>
        <div className={styles.sideLinks}>
          <SettingsSubnav
            label={text.pages}
            activeHref={docHref(topic)}
            renderLink={link}
            groups={(["start", "use"] as const).map((group) => ({
              title: docGroupLabel(locale, group),
              items: docTopics.filter((id) => pages[id].group === group).map((id) => ({ href: docHref(id), label: pages[id].label })),
            }))}
          />
        </div>
      </SideNav>
      <article className={styles.article}>
        <Heading eyebrow={`${text.title} / ${docGroupLabel(locale, page.group)}`} title={page.label} description={page.description} />
        <Prose measure="full" className={styles.docProse}>{page.body}</Prose>
        <nav className={styles.docPager} aria-label={text.pager}>
          {previous && <NavCard direction="back" eyebrow={text.previous} title={pages[previous].label} href={docHref(previous)} onClick={go(previous)} />}
          {next && <NavCard direction="forward" eyebrow={text.next} title={pages[next].label} href={docHref(next)} onClick={go(next)} className={styles.docPagerNext} />}
        </nav>
      </article>
      <Toc items={page.sections} />
    </main>
  );
}
