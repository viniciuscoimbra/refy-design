import type { ReactNode } from "react";
import { Callout, CodeBlock, NavCard, Prose, Segmented, SettingsSubnav } from "../../index";
import type { SettingsSubnavLinkProps } from "../../index";
import { Heading, SideNav, Toc } from "./SiteCatalog";
import styles from "./RefySitePage.module.css";
import { localePath, useSiteLocale } from "./i18n";
import { setPlatform, usePlatform } from "./platform";
import type { Platform } from "./platform";
import { projectBody, projectDescription, projectLabel, releaseSections } from "./SiteProject";
import type { Locale } from "./i18n";
import nativeComponents from "./nativeComponents.json";
import { mobilePublished, packageName, packagePublished, packageVersion } from "./packageRelease";
import { InstallCommand, NotInVersion, SinceBadge, VersionSelect, mobileSince } from "./docsVersion";
import { versionsPolicy } from "./SiteVersions";

// Docs técnica: uma página por assunto, menu da esquerda lista as páginas e o sumário da
// direita lista as seções da página aberta. Texto curto, só o que o pacote faz hoje.

export type DocTopic = "primeiros-passos" | "instalacao" | "tema-por-arquivo" | "compatibilidade" | "versoes";

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

export type DocGroup = "start" | "use" | "ref" | "ai";
export interface DocPage {
  label: string;
  group: DocGroup;
  description: string;
  sections: Array<[string, string]>;
  /** Sumário quando a plataforma escolhida é Mobile (só na Instalação, que troca o conteúdo). */
  mobileSections?: Array<[string, string]>;
  body: ReactNode;
}

const groupLabels: Record<Locale, Record<DocGroup, string>> = {
  pt: { start: "Começar", use: "Usar", ref: "Referência", ai: "Para IAs" },
  en: { start: "Get started", use: "Use", ref: "Reference", ai: "For AI" },
  es: { start: "Empezar", use: "Usar", ref: "Referencia", ai: "Para IAs" },
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
  ? { pt: "Escolha Web ou Mobile, instale o pacote e aplique o tema.", en: "Pick Web or Mobile, install the package and apply the theme.", es: "Elige Web o Móvil, instala el paquete y aplica el tema." }
  : { pt: "O refy ainda não foi publicado: hoje nenhum comando instala o pacote.", en: "refy is not published yet: no command installs the package today.", es: "refy todavía no se publicó: hoy ningún comando instala el paquete." };

const packageSection = (locale: Locale, heading: string) => {
  const text = installText[locale];
  return (
    <section id="pacote">
      <h2>{heading}</h2>
      {packagePublished ? (<>
        <p>{text.viaNpm}</p>
        <figure>
          <InstallCommand />
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
// Gerada de packages/native por scripts/native-components.mjs: não editar à mão.
const nativeList = nativeComponents.join(", ");

const createApp = (folder: string) => `npm create vite@latest ${folder} -- --template react-ts
cd ${folder}`;

interface StartText {
  label: string; description: string;
  sections: Record<"projeto" | "instalar" | "estilos" | "tela" | "depois", string>;
  project: ReactNode; install: ReactNode; styles: ReactNode; screen: ReactNode; run: ReactNode;
  folder: string; button: string;
  next: Array<[string, string, string]>;
}
const startText: Record<Locale, StartText> = {
  pt: {
    label: "Primeiros passos", description: "Do projeto vazio à primeira tela com o refy, em quatro passos.",
    sections: { projeto: "1. Projeto", instalar: "2. Instalar", estilos: "3. Estilos", tela: "4. Primeira tela", depois: "Depois" },
    project: <>O refy roda em app React 18 ou mais: Vite, Next.js ou outro. Sem projeto ainda, crie um com o Vite:</>,
    install: <>Para app React Native, o pacote é outro: veja a aba Mobile da <a href="/docs/instalacao">Instalação</a>.</>,
    styles: <>Importe os tokens e as fontes uma vez, no arquivo de entrada (<code>src/main.tsx</code> no Vite):</>,
    screen: <>Troque o conteúdo de <code>src/App.tsx</code>. <code>ThemeProvider</code> aplica o tema em tudo que está dentro dele.</>,
    run: <>Rode <code>npm run dev</code>. O botão aparece com o tema do refy. Para usar a sua marca, troque <code>refySiteTheme</code> por um arquivo de tema.</>,
    folder: "meu-app", button: "Começar",
    next: [
      ["/componentes", "Componentes", "Cada ficha mostra a versão web e a mobile, com exemplo, uso e API."],
      ["/docs/tema-por-arquivo", "Tema por arquivo", "Cor, fonte e raio da sua marca num JSON."],
      ["/docs/instalacao", "Mobile", "O mesmo tema e as mesmas props num app React Native."],
      ["/para-ias/mcp", "MCP", "Para o agente de IA achar o componente certo e conferir o código."],
    ],
  },
  en: {
    label: "Quick start", description: "From an empty project to your first refy screen, in four steps.",
    sections: { projeto: "1. Project", instalar: "2. Install", estilos: "3. Styles", tela: "4. First screen", depois: "Next" },
    project: <>refy runs in any React 18+ app: Vite, Next.js or another. No project yet? Create one with Vite:</>,
    install: <>For a React Native app the package is a different one: see the Mobile tab in <a href="/docs/instalacao">Installation</a>.</>,
    styles: <>Import the tokens and fonts once, in the entry file (<code>src/main.tsx</code> in Vite):</>,
    screen: <>Replace the content of <code>src/App.tsx</code>. <code>ThemeProvider</code> applies the theme to everything inside it.</>,
    run: <>Run <code>npm run dev</code>. The button shows up in the refy theme. To use your brand, swap <code>refySiteTheme</code> for a theme file.</>,
    folder: "my-app", button: "Get started",
    next: [
      ["/componentes", "Components", "Every page shows the web and the mobile version, with example, usage and API."],
      ["/docs/tema-por-arquivo", "Theme from a file", "Your brand's color, font and radius in one JSON."],
      ["/docs/instalacao", "Mobile", "The same theme and the same props in a React Native app."],
      ["/para-ias/mcp", "MCP", "For your AI agent to find the right component and check the code."],
    ],
  },
  es: {
    label: "Primeros pasos", description: "Del proyecto vacío a la primera pantalla con refy, en cuatro pasos.",
    sections: { projeto: "1. Proyecto", instalar: "2. Instalar", estilos: "3. Estilos", tela: "4. Primera pantalla", depois: "Después" },
    project: <>refy funciona en cualquier app React 18 o superior: Vite, Next.js u otra. ¿Todavía sin proyecto? Crea uno con Vite:</>,
    install: <>Para una app React Native el paquete es otro: mira la pestaña Móvil de <a href="/docs/instalacao">Instalación</a>.</>,
    styles: <>Importa los tokens y las fuentes una vez, en el archivo de entrada (<code>src/main.tsx</code> en Vite):</>,
    screen: <>Reemplaza el contenido de <code>src/App.tsx</code>. <code>ThemeProvider</code> aplica el tema a todo lo que está dentro.</>,
    run: <>Ejecuta <code>npm run dev</code>. El botón aparece con el tema de refy. Para usar tu marca, cambia <code>refySiteTheme</code> por un archivo de tema.</>,
    folder: "mi-app", button: "Empezar",
    next: [
      ["/componentes", "Componentes", "Cada ficha muestra la versión web y la móvil, con ejemplo, uso y API."],
      ["/docs/tema-por-arquivo", "Tema por archivo", "Color, fuente y radio de tu marca en un JSON."],
      ["/docs/instalacao", "Móvil", "El mismo tema y las mismas props en una app React Native."],
      ["/para-ias/mcp", "MCP", "Para que tu agente de IA encuentre el componente correcto y revise el código."],
    ],
  },
};

function startPage(locale: Locale): DocPage {
  const text = startText[locale];
  return {
    label: text.label, group: "start", description: text.description,
    sections: Object.entries(text.sections),
    body: (<>
      <section id="projeto">
        <h2>{text.sections.projeto}</h2>
        <p>{text.project}</p>
        <CodeBlock label="Terminal" language="bash" code={createApp(text.folder)} />
      </section>
      <section id="instalar">
        <h2>{text.sections.instalar}</h2>
        {packagePublished ? <InstallCommand label="Terminal" /> : firstScreenNotice(locale)}
        <p>{text.install}</p>
      </section>
      <section id="estilos">
        <h2>{text.sections.estilos}</h2>
        <p>{text.styles}</p>
        <CodeBlock label="src/main.tsx" language="tsx" code={styleImports} />
      </section>
      <section id="tela">
        <h2>{text.sections.tela}</h2>
        <p>{text.screen}</p>
        <CodeBlock label="src/App.tsx" language="tsx" code={appCodeFor(text.button)} />
        <p>{text.run}</p>
      </section>
      <section id="depois">
        <h2>{text.sections.depois}</h2>
        <div className={styles.docNext}>
          {text.next.map(([href, title, description]) => <NavCard key={href} href={href} title={title} description={description} />)}
        </div>
      </section>
    </>),
  };
}

// O HTML estático (scripts/site-seo.mjs) leva Web e Mobile juntos; na tela, a plataforma escolhida.
let renderBothPlatforms = false;
export const renderAllPlatforms = (value: boolean) => { renderBothPlatforms = value; };
const platformLabels: Record<Locale, string> = { pt: "Plataforma", en: "Platform", es: "Plataforma" };

/** Web e Mobile na mesma página: a escolha vale para as fichas também (?plataforma=mobile). */
function PlatformBody({ web, mobile }: { web: ReactNode; mobile: ReactNode }) {
  const platform = usePlatform();
  const { locale } = useSiteLocale();
  if (renderBothPlatforms) return <><h2>Web</h2>{web}<h2>{locale === "es" ? "Móvil" : "Mobile"}</h2>{mobile}</>;
  return (
    <>
      <Segmented
        label={platformLabels[locale]}
        value={platform}
        onChange={(value) => setPlatform(value as Platform)}
        options={[{ value: "web", label: "Web" }, { value: "mobile", label: locale === "es" ? "Móvil" : "Mobile" }]}
      />
      {platform === "mobile" ? mobile : web}
    </>
  );
}

// Versões: primeiro o método (o que cada número pode mudar, obsoletos, uma doc por versão maior),
// depois o changelog de cada versão publicada.
function versionsPage(locale: Locale): DocPage {
  const policy = versionsPolicy(locale);
  return {
    label: projectLabel(locale, "releases"), group: "ref",
    description: projectDescription(locale, "releases"),
    sections: [...policy.sections, ...releaseSections(locale)],
    body: (<>{policy.body}{projectBody(locale, "releases")}</>),
  };
}

const pt: Record<DocTopic, DocPage> = {
  "primeiros-passos": startPage("pt"),
  instalacao: {
    label: "Instalação", group: "start",
    description: installDescription.pt,
    sections: [["pacote", "Pacote"], ["estilos", "Estilos"]],
    mobileSections: [...(mobilePublished ? [["instalacao-mobile", "Pacote"] as [string, string]] : []), ["uso", "Uso"], ["componentes", "Componentes"], ["requisitos", "Requisitos"]],
    body: <PlatformBody
      web={<>
      {packageSection("pt", "Pacote")}
      <section id="estilos">
        <h2>Estilos</h2>
        <p>Importe os tokens e as fontes uma vez, na entrada do app.</p>
        <figure>
          <CodeBlock label="main.tsx" language="tsx" code={styleImports} />
          <figcaption><code>@refy-design/web/global.css</code> é opcional: aplica o reset na página inteira.</figcaption>
        </figure>
      </section>
      </>}
      mobile={<>
      {mobilePublished && (
        <section id="instalacao-mobile">
          <h2>Pacote</h2>
          <p>Num app Expo, instale o pacote e o <code>react-native-svg</code>:</p>
          <InstallCommand label="Terminal" mobile />
        </section>
      )}
      <section id="uso">
        <h2>Uso</h2>
        <CodeBlock label="App.tsx" language="tsx" code={nativeCodeFor("tema.json", "Sincronizado", "Salvar", "salvar")} />
        <p><code>RefyProvider</code> recebe o mesmo <code>tema.json</code> da web.</p>
      </section>
      <section id="componentes">
        <h2>Componentes</h2>
        <p>{nativeComponents.length} componentes: {nativeList}.</p>
        <p>A navegação fica com o roteador do app (React Navigation ou Expo Router).</p>
      </section>
      <section id="requisitos">
        <h2>Requisitos</h2>
        <p><code>react</code> 19.1 ou mais, <code>react-native</code> 0.76 ou mais e <code>react-native-svg</code> 15 ou mais.</p>
      </section>
      </>}
    />,
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
  compatibilidade: {
    label: "Compatibilidade", group: "ref",
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
  versoes: versionsPage("pt"),
};

const en: Record<DocTopic, DocPage> = {
  "primeiros-passos": startPage("en"),
  instalacao: {
    label: "Installation", group: "start",
    description: installDescription.en,
    sections: [["pacote", "Package"], ["estilos", "Styles"]],
    mobileSections: [...(mobilePublished ? [["instalacao-mobile", "Package"] as [string, string]] : []), ["uso", "Usage"], ["componentes", "Components"], ["requisitos", "Requirements"]],
    body: <PlatformBody
      web={<>
      {packageSection("en", "Package")}
      <section id="estilos">
        <h2>Styles</h2>
        <p>Import the tokens and fonts once, at the app entry.</p>
        <figure>
          <CodeBlock label="main.tsx" language="tsx" code={styleImports} />
          <figcaption><code>@refy-design/web/global.css</code> is optional: it applies the reset to the whole page.</figcaption>
        </figure>
      </section>
      </>}
      mobile={<>
      {mobilePublished && (
        <section id="instalacao-mobile">
          <h2>Package</h2>
          <p>In an Expo app, install the package and <code>react-native-svg</code>:</p>
          <InstallCommand label="Terminal" mobile />
        </section>
      )}
      <section id="uso">
        <h2>Usage</h2>
        <CodeBlock label="App.tsx" language="tsx" code={nativeCodeFor("theme.json", "Synced", "Save", "save")} />
        <p><code>RefyProvider</code> takes the same <code>theme.json</code> as the web.</p>
      </section>
      <section id="componentes">
        <h2>Components</h2>
        <p>{nativeComponents.length} components: {nativeList}.</p>
        <p>Navigation belongs to the app router (React Navigation or Expo Router).</p>
      </section>
      <section id="requisitos">
        <h2>Requirements</h2>
        <p><code>react</code> 19.1 or later, <code>react-native</code> 0.76 or later and <code>react-native-svg</code> 15 or later.</p>
      </section>
      </>}
    />,
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
  compatibilidade: {
    label: "Compatibility", group: "ref",
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
  versoes: versionsPage("en"),
};

const es: Record<DocTopic, DocPage> = {
  "primeiros-passos": startPage("es"),
  instalacao: {
    label: "Instalación", group: "start",
    description: installDescription.es,
    sections: [["pacote", "Paquete"], ["estilos", "Estilos"]],
    mobileSections: [...(mobilePublished ? [["instalacao-mobile", "Paquete"] as [string, string]] : []), ["uso", "Uso"], ["componentes", "Componentes"], ["requisitos", "Requisitos"]],
    body: <PlatformBody
      web={<>
      {packageSection("es", "Paquete")}
      <section id="estilos">
        <h2>Estilos</h2>
        <p>Importa los tokens y las fuentes una vez, en la entrada de la app.</p>
        <figure>
          <CodeBlock label="main.tsx" language="tsx" code={styleImports} />
          <figcaption><code>@refy-design/web/global.css</code> es opcional: aplica el reset a toda la página.</figcaption>
        </figure>
      </section>
      </>}
      mobile={<>
      {mobilePublished && (
        <section id="instalacao-mobile">
          <h2>Paquete</h2>
          <p>En una app Expo, instala el paquete y <code>react-native-svg</code>:</p>
          <InstallCommand label="Terminal" mobile />
        </section>
      )}
      <section id="uso">
        <h2>Uso</h2>
        <CodeBlock label="App.tsx" language="tsx" code={nativeCodeFor("tema.json", "Sincronizado", "Guardar", "guardar")} />
        <p><code>RefyProvider</code> recibe el mismo <code>tema.json</code> de la web.</p>
      </section>
      <section id="componentes">
        <h2>Componentes</h2>
        <p>{nativeComponents.length} componentes: {nativeList}.</p>
        <p>La navegación queda a cargo del router de la app (React Navigation o Expo Router).</p>
      </section>
      <section id="requisitos">
        <h2>Requisitos</h2>
        <p><code>react</code> 19.1 o superior, <code>react-native</code> 0.76 o superior y <code>react-native-svg</code> 15 o superior.</p>
      </section>
      </>}
    />,
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
  compatibilidade: {
    label: "Compatibilidad", group: "ref",
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
  versoes: versionsPage("es"),
};

export const localizedDocPages: Record<Locale, Record<DocTopic, DocPage>> = { pt, en, es };
export const docGroupLabel = (locale: Locale, group: DocGroup) => groupLabels[locale][group];
export const docTopics = Object.keys(pt) as DocTopic[];
export const docHref = (topic: DocTopic) => `/docs/${topic}`;
const docsText = {
  pt: { title: "Documentação", pages: "Páginas da documentação", previous: "Anterior", next: "Próximo", pager: "Anterior e próximo", ai: "Usar com IA" },
  en: { title: "Documentation", pages: "Documentation pages", previous: "Previous", next: "Next", pager: "Previous and next", ai: "Use with AI" },
  es: { title: "Documentación", pages: "Páginas de la documentación", previous: "Anterior", next: "Siguiente", pager: "Anterior y siguiente", ai: "Usar con IA" },
};

/** Link interno no texto das Docs (para /docs/..., /componentes...): navega sem recarregar a página. */
const internalHref = (event: { target: EventTarget; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; button: number }) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return null;
  const link = (event.target as Element).closest?.("a[href^='/']");
  return link?.getAttribute("href") ?? null;
};

export interface GuideLink { href: string; label: string }
export interface GuideProps {
  /** Nome da seção no menu da esquerda e no rótulo acima do título. */
  title: string;
  navLabel: string;
  groups: Array<{ title: string; items: GuideLink[] }>;
  activeHref: string;
  page: DocPage;
  eyebrow: string;
  previous?: GuideLink;
  next?: GuideLink;
  /** Caminho em português; quem chama resolve a página e o idioma. */
  onLink: (href: string) => void;
  /** Mostra o seletor de versão da doc. */
  versioned?: boolean;
  /** Versão em que o assunto da página chegou (pacote mobile, comando refy-mcp). */
  since?: string | null;
}

/** Moldura das páginas de guia (Docs e Para IAs): menu à esquerda, texto, anterior e próximo, sumário. */
export function GuidePage({ title, navLabel, groups, activeHref, page, eyebrow, previous, next, onLink, versioned = false, since }: GuideProps) {
  const { locale } = useSiteLocale();
  const text = docsText[locale];
  const platform = usePlatform();
  const go = (href: string) => (event: { preventDefault: () => void }) => { event.preventDefault(); onLink(href); };
  const link = (item: { href: string }, props: SettingsSubnavLinkProps) => <a {...props} onClick={go(item.href)} />;
  const sections = platform === "mobile" && page.mobileSections ? page.mobileSections : page.sections;
  return (
    <main id="site-content" className={styles.docGrid}>
      <SideNav title={title}>
        {versioned && <VersionSelect />}
        <div className={styles.sideLinks}>
          <SettingsSubnav label={navLabel} activeHref={activeHref} renderLink={link} groups={groups} />
        </div>
      </SideNav>
      <article
        className={styles.article}
        onClick={(event) => {
          const href = internalHref(event);
          if (!href || event.defaultPrevented) return;
          event.preventDefault();
          onLink(href);
        }}
      >
        <Heading eyebrow={eyebrow} title={page.label} description={page.description}>
          {since && <p className={styles.support}><SinceBadge since={since} /></p>}
        </Heading>
        {versioned && <div className={styles.versionMobile}><VersionSelect compact /></div>}
        <NotInVersion since={since} />
        <Prose measure="full" className={styles.docProse}>{page.body}</Prose>
        <nav className={styles.docPager} aria-label={text.pager}>
          {previous && <NavCard direction="back" eyebrow={text.previous} title={previous.label} href={localePath(locale, previous.href)} onClick={go(previous.href)} />}
          {next && <NavCard direction="forward" eyebrow={text.next} title={next.label} href={localePath(locale, next.href)} onClick={go(next.href)} className={styles.docPagerNext} />}
        </nav>
      </article>
      <Toc key={`${activeHref}-${platform}`} items={sections} />
    </main>
  );
}

export function DocsPage({ topic, onLink }: { topic: DocTopic; onLink: (href: string) => void }) {
  const { locale } = useSiteLocale();
  const platform = usePlatform();
  const pages = localizedDocPages[locale];
  const page = pages[topic];
  const text = docsText[locale];
  const index = docTopics.indexOf(topic);
  const at = (id: DocTopic | undefined) => (id ? { href: docHref(id), label: pages[id].label } : undefined);
  return (
    <GuidePage
      title={text.title}
      navLabel={text.pages}
      activeHref={docHref(topic)}
      groups={[
        ...(["start", "use", "ref"] as const).map((group) => ({
          title: docGroupLabel(locale, group),
          items: docTopics.filter((id) => pages[id].group === group).map((id) => ({ href: docHref(id), label: pages[id].label })),
        })),
        // MCP, plugin e CLI moram em Para IAs; aqui fica só o caminho até lá.
        { title: docGroupLabel(locale, "ai"), items: [{ href: "/para-ias", label: text.ai }] },
      ]}
      page={page}
      eyebrow={`${text.title} / ${docGroupLabel(locale, page.group)}`}
      previous={at(docTopics[index - 1])}
      next={at(docTopics[index + 1])}
      onLink={onLink}
      versioned
      // O pacote mobile chegou depois da primeira versão: a Instalação no Mobile mostra desde quando.
      since={topic === "instalacao" && platform === "mobile" ? mobileSince() : undefined}
    />
  );
}
