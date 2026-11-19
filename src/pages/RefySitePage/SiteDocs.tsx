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
import { InstallCommand, NotInVersion, SinceBadge, VersionSelect, mobileSince, useWebVersion, webOnNpm } from "./docsVersion";
import { versionsPolicy } from "./SiteVersions";
import { cdnPage } from "./cdnPage.mjs";

// Docs técnica: uma página por assunto, menu da esquerda lista as páginas e o sumário da
// direita lista as seções da página aberta. Texto curto, só o que o pacote faz hoje.

export type DocTopic = "primeiros-passos" | "instalacao" | "tema-por-arquivo" | "sem-bundler" | "compatibilidade" | "versoes" | "a2ui";

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
    "--radius-md": "8px"
  },
  "modes": {
    "light": { "--primary": "#2643d1" },
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

// Sem bundler: o trecho é o HTML que scripts/check-cdn.mjs abre no navegador (mesma função,
// mesma versão do pacote). Só o texto em volta muda de língua; o HTML fica igual nas três.
interface NoBundlerText {
  label: string; description: string;
  sections: Record<"pagina" | "react" | "tema" | "teste", string>;
  page: ReactNode; react: ReactNode; noJsx: ReactNode; theme: ReactNode; test: ReactNode;
}
const noBundlerText: Record<Locale, NoBundlerText> = {
  pt: {
    label: "Sem bundler", description: "Uma página HTML solta, sem npm nem build: o refy e o React vêm do jsDelivr.",
    sections: { pagina: "A página", react: "Um React só", tema: "Tema e fontes", teste: "Testada a cada versão" },
    page: <>Salve como <code>index.html</code> e abra no navegador. Precisa de internet; não instala nada.</>,
    react: <>O <code>/+esm</code> do jsDelivr serve o pacote como módulo e troca <code>react</code> por um endereço do próprio CDN. A página lê esse endereço e importa o React dele. Com outro endereço, a página e o refy teriam duas cópias do React e o primeiro hook quebraria.</>,
    noJsx: <>Sem build não há JSX: <code>createElement</code> (aqui <code>h</code>) monta a árvore.</>,
    theme: <><code>tokens.css</code> traz o tema do refy, <code>fonts.css</code> as fontes dele, <code>global.css</code> aplica fonte e fundo do tema na página inteira e <code>style.css</code> traz os componentes. Cor, fonte e raio vêm desses arquivos: não escreva cor nem fonte à mão na página.</>,
    test: <>É o mesmo HTML que <code>scripts/check-cdn.mjs</code> abre no Chromium depois de cada release: console sem erro, uma instância só de React, campo com rótulo, botão primário na cor do tema e fontes carregadas. O endereço usa a versão <CdnVersion />.</>,
  },
  en: {
    label: "No bundler", description: "A standalone HTML page, no npm and no build: refy and React come from jsDelivr.",
    sections: { pagina: "The page", react: "One React", tema: "Theme and fonts", teste: "Tested on every release" },
    page: <>Save it as <code>index.html</code> and open it in the browser. It needs internet access and installs nothing.</>,
    react: <>jsDelivr's <code>/+esm</code> serves the package as a module and rewrites <code>react</code> to a URL on the CDN itself. The page reads that URL and imports React from it. With another URL, the page and refy would load two copies of React and the first hook would break.</>,
    noJsx: <>Without a build there is no JSX: <code>createElement</code> (here <code>h</code>) builds the tree.</>,
    theme: <><code>tokens.css</code> brings the refy theme, <code>fonts.css</code> its fonts, <code>global.css</code> applies the theme font and background to the whole page and <code>style.css</code> brings the components. Color, font and radius come from these files: don't hand-write colors or fonts in the page.</>,
    test: <>It is the same HTML that <code>scripts/check-cdn.mjs</code> opens in Chromium after every release: no console errors, a single React instance, a labelled input, the primary button in the theme color and the fonts loaded. The URLs use version <CdnVersion />.</>,
  },
  es: {
    label: "Sin bundler", description: "Una página HTML suelta, sin npm ni build: refy y React vienen de jsDelivr.",
    sections: { pagina: "La página", react: "Un solo React", tema: "Tema y fuentes", teste: "Probada en cada versión" },
    page: <>Guárdala como <code>index.html</code> y ábrela en el navegador. Necesita internet y no instala nada.</>,
    react: <>El <code>/+esm</code> de jsDelivr sirve el paquete como módulo y cambia <code>react</code> por una dirección del propio CDN. La página lee esa dirección e importa React de ella. Con otra dirección, la página y refy tendrían dos copias de React y el primer hook fallaría.</>,
    noJsx: <>Sin build no hay JSX: <code>createElement</code> (aquí <code>h</code>) arma el árbol.</>,
    theme: <><code>tokens.css</code> trae el tema de refy, <code>fonts.css</code> sus fuentes, <code>global.css</code> aplica la fuente y el fondo del tema a toda la página y <code>style.css</code> trae los componentes. Color, fuente y radio vienen de esos archivos: no escribas colores ni fuentes a mano en la página.</>,
    test: <>Es el mismo HTML que <code>scripts/check-cdn.mjs</code> abre en Chromium después de cada release: consola sin errores, una sola instancia de React, campo con etiqueta, botón primario en el color del tema y fuentes cargadas. La dirección usa la versión <CdnVersion />.</>,
  },
};

/** O HTML do teste do CDN na versão web da doc escolhida (`?v=`); `version` fixa a versão (teste). */
const notOnNpm: Record<Locale, { title: string; body: string }> = {
  pt: { title: "Versão fora do npm", body: "Esta versão não foi publicada no npm; o trecho só funciona com versões publicadas." },
  en: { title: "Version not on npm", body: "This version was not published to npm; the snippet only works with published versions." },
  es: { title: "Versión fuera de npm", body: "Esta versión no se publicó en npm; el fragmento solo funciona con versiones publicadas." },
};
export function CdnSnippet({ version }: { version?: string }) {
  const chosen = useWebVersion();
  const { locale } = useSiteLocale();
  const web = version ?? chosen;
  // O jsDelivr só serve o que está no npm: versão com tag que nunca foi publicada daria 404.
  if (!webOnNpm(web)) return <Callout tone="warn" icon={warnIcon} title={notOnNpm[locale].title}>{notOnNpm[locale].body}</Callout>;
  return <CodeBlock label="index.html" language="html" code={cdnPage(web)} />;
}
function CdnVersion() {
  return <>{useWebVersion()}</>;
}

function noBundlerPage(locale: Locale): DocPage {
  const text = noBundlerText[locale];
  return {
    label: text.label, group: "use", description: text.description,
    sections: Object.entries(text.sections),
    body: (<>
      <section id="pagina">
        <h2>{text.sections.pagina}</h2>
        <p>{text.page}</p>
        <CdnSnippet />
      </section>
      <section id="react">
        <h2>{text.sections.react}</h2>
        <p>{text.react}</p>
        <p>{text.noJsx}</p>
      </section>
      <section id="tema">
        <h2>{text.sections.tema}</h2>
        <p>{text.theme}</p>
      </section>
      <section id="teste">
        <h2>{text.sections.teste}</h2>
        <p>{text.test}</p>
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

// A2UI: o pacote @refy-design/a2ui desenha mensagens A2UI 1.0 com os componentes do refy.
// Código conferido contra packages/a2ui (index.ts, definition.ts, native.tsx e README).
const a2uiCatalogId = "https://refy.design/a2ui/v1";
const a2uiPieces = ["Text", "Image", "Row", "Column", "List", "Card", "Divider", "Button", "TextField", "CheckBox", "ChoicePicker", "Slider"];
const a2uiInstallWeb = "npm install @refy-design/a2ui @a2ui/react@0.15.0 @refy-design/web react react-dom";
const a2uiInstallNative = "npx expo install @refy-design/a2ui @refy-design/mobile react-native-svg";
const a2uiWebCode = (comment: string) => `import { ThemeProvider } from "@refy-design/web";
import { A2uiSurface, createRefyProcessor } from "@refy-design/a2ui";
import "@refy-design/web/tokens.css";
import "@refy-design/web/global.css";
import "@refy-design/web/styles.css";
import "@refy-design/a2ui/catalog.css";

const processor = createRefyProcessor((action) => {
  // ${comment}
});

processor.processMessages(messagesFromAgent);
const surface = processor.model.surfacesMap.get("my-surface");

export function Screen() {
  return (
    <ThemeProvider>
      {surface ? <A2uiSurface surface={surface} /> : null}
    </ThemeProvider>
  );
}`;
const a2uiNativeCode = (comment: string) => `import { RefyProvider } from "@refy-design/mobile";
import {
  A2uiNativeSurface,
  createRefyNativeProcessor,
} from "@refy-design/a2ui/native";

const processor = createRefyNativeProcessor((action) => {
  // ${comment}
});

processor.processMessages(messagesFromAgent);
const surface = processor.model.surfacesMap.get("my-surface");

export function Screen() {
  return (
    <RefyProvider theme={appTheme}>
      {surface ? (
        <A2uiNativeSurface
          surface={surface}
          onError={(error) => report(error.code, error.message)}
        />
      ) : null}
    </RefyProvider>
  );
}`;
const a2uiServerCode = (comment: string) => `import { createRefyValidator } from "@refy-design/a2ui/definition";

const validator = createRefyValidator();
// ${comment}
validator.processMessages(messagesFromAgent);`;

interface A2uiText {
  description: string;
  sections: Record<"o-que-e" | "instalar" | "web" | "mobile" | "servidor" | "regras" | "requisitos", string>;
  what: ReactNode; pieces: ReactNode; experimental: ReactNode;
  web: string; native: string; peers: ReactNode;
  webUse: ReactNode; webTheme: ReactNode; action: string;
  nativeUse: ReactNode; onError: ReactNode; openUrl: ReactNode; metro: ReactNode;
  server: ReactNode; serverComment: string;
  rules: ReactNode[]; requires: ReactNode;
}
const a2uiText: Record<Locale, A2uiText> = {
  pt: {
    description: "O agente manda mensagens A2UI e o app desenha a tela com os componentes e o tema do refy, na web e no React Native.",
    sections: { "o-que-e": "O que é", instalar: "Instalar", web: "Web", mobile: "Mobile", servidor: "Validar no servidor", regras: "Regras", requisitos: "Requisitos" },
    what: <><code>@refy-design/a2ui</code> é um catálogo <a href="https://a2ui.org">A2UI</a> 1.0. O agente descreve a tela em mensagens A2UI; o app desenha cada peça com o componente do refy e o tema que ele já usa. Id do catálogo: <code>{a2uiCatalogId}</code>.</>,
    pieces: <>{a2uiPieces.length} peças, com os esquemas do catálogo básico v1 do A2UI: {a2uiPieces.join(", ")}. As mesmas mensagens desenham as mesmas peças na web e no mobile.</>,
    experimental: <>Experimental (0.x): as bibliotecas do A2UI estão fixas na 0.15.0 e a API pode mudar entre versões menores.</>,
    web: "Web", native: "React Native (Expo)",
    peers: <>Cada plataforma instala só o próprio renderizador: <code>@a2ui/react</code> e <code>react-dom</code> são dependências opcionais, e o app React Native não as recebe.</>,
    webUse: <>Crie o processador, entregue a ele as mensagens do agente e desenhe a superfície dentro do <code>ThemeProvider</code>:</>,
    webTheme: <>O A2UI 1.0 não manda tema no <code>createSurface</code>. A aparência vem do <code>ThemeProvider</code> em volta da superfície, então as mesmas mensagens seguem qualquer tema do refy e o modo claro ou escuro.</>,
    action: "Mande a ação (nome, surfaceId, contexto resolvido) de volta ao agente.",
    nativeUse: <>No app, o processador e a superfície vêm de <code>@refy-design/a2ui/native</code>, dentro do <code>RefyProvider</code> com o mesmo JSON de tema da web:</>,
    onError: <>Erros da superfície vão para <code>onError</code> do <code>A2uiNativeSurface</code>, com <code>code</code> e <code>message</code>. Sem <code>onError</code>, saem no <code>console.error</code>.</>,
    openUrl: <>A função <code>openUrl</code> abre o endereço pelo <code>Linking</code> do React Native, com os esquemas <code>https:</code>, <code>http:</code>, <code>mailto:</code> e <code>tel:</code>. Outro esquema, ou um endereço que o sistema não abre, chega como erro em <code>onError</code>.</>,
    metro: <>A ponte lê os esquemas das peças de um arquivo do <code>@a2ui/web_core</code> que o <code>exports</code> dele não lista. O Metro resolve pelo caminho e mostra um aviso sobre isso; o aviso é esperado.</>,
    server: <><code>@refy-design/a2ui/definition</code> tem o catálogo sem React e sem DOM. Use no servidor do app para conferir as mensagens do agente antes de elas chegarem à tela, com as mesmas regras do renderizador. Mensagem inválida lança <code>A2uiValidationError</code>.</>,
    serverComment: "lança A2uiValidationError em mensagem inválida",
    rules: [
      <>Peça fora do catálogo (por exemplo <code>Video</code>) é recusada com <code>A2uiValidationError</code>, e nada é desenhado.</>,
      <>Peças que um <code>updateComponents</code> tira da árvore ficam guardadas: o A2UI 1.0 não tem mensagem para apagar peça.</>,
    ],
    requires: <>Web: <code>react</code> e <code>react-dom</code> 19 ou mais, <code>@refy-design/web</code> 1.8 ou mais e <code>@a2ui/react</code> 0.15.0. Mobile: <code>react-native</code> 0.79 ou mais e <code>@refy-design/mobile</code> 1.1 ou mais.</>,
  },
  en: {
    description: "The agent sends A2UI messages and the app draws the screen with refy's components and theme, on the web and in React Native.",
    sections: { "o-que-e": "What it is", instalar: "Install", web: "Web", mobile: "Mobile", servidor: "Validate on the server", regras: "Rules", requisitos: "Requirements" },
    what: <><code>@refy-design/a2ui</code> is an <a href="https://a2ui.org">A2UI</a> 1.0 catalog. The agent describes the screen in A2UI messages; the app draws each piece with the refy component and the theme it already uses. Catalog id: <code>{a2uiCatalogId}</code>.</>,
    pieces: <>{a2uiPieces.length} pieces, with the A2UI basic catalog v1 schemas: {a2uiPieces.join(", ")}. The same messages draw the same pieces on the web and on mobile.</>,
    experimental: <>Experimental (0.x): the A2UI libraries are pinned at 0.15.0 and the API may change between minor versions.</>,
    web: "Web", native: "React Native (Expo)",
    peers: <>Each platform installs only its own renderer: <code>@a2ui/react</code> and <code>react-dom</code> are optional peers, so a React Native app does not get them.</>,
    webUse: <>Create the processor, hand it the agent's messages and draw the surface inside <code>ThemeProvider</code>:</>,
    webTheme: <>A2UI 1.0 does not carry a theme in <code>createSurface</code>. The look comes from the <code>ThemeProvider</code> around the surface, so the same messages follow any refy theme and light or dark mode.</>,
    action: "Send the action (name, surfaceId, resolved context) back to your agent.",
    nativeUse: <>In the app, the processor and the surface come from <code>@refy-design/a2ui/native</code>, inside <code>RefyProvider</code> with the same theme JSON as the web:</>,
    onError: <>Surface errors go to the <code>onError</code> of <code>A2uiNativeSurface</code>, with <code>code</code> and <code>message</code>. Without <code>onError</code>, they go to <code>console.error</code>.</>,
    openUrl: <>The <code>openUrl</code> function opens the address through React Native's <code>Linking</code>, with the <code>https:</code>, <code>http:</code>, <code>mailto:</code> and <code>tel:</code> schemes. Any other scheme, or an address the system cannot open, arrives as an error in <code>onError</code>.</>,
    metro: <>The bridge reads the piece schemas from a file of <code>@a2ui/web_core</code> that its <code>exports</code> map does not list. Metro resolves it by file path and prints a warning about it; the warning is expected.</>,
    server: <><code>@refy-design/a2ui/definition</code> has the catalog without React or the DOM. Use it on your app's server to check the agent's messages before they reach the screen, with the same rules as the renderer. An invalid message throws <code>A2uiValidationError</code>.</>,
    serverComment: "throws A2uiValidationError on an invalid message",
    rules: [
      <>A piece outside the catalog (for example <code>Video</code>) is rejected with <code>A2uiValidationError</code>, and nothing is drawn.</>,
      <>Pieces that an <code>updateComponents</code> removes from the tree are kept: A2UI 1.0 has no message to delete a piece.</>,
    ],
    requires: <>Web: <code>react</code> and <code>react-dom</code> 19 or later, <code>@refy-design/web</code> 1.8 or later and <code>@a2ui/react</code> 0.15.0. Mobile: <code>react-native</code> 0.79 or later and <code>@refy-design/mobile</code> 1.1 or later.</>,
  },
  es: {
    description: "El agente envía mensajes A2UI y la app dibuja la pantalla con los componentes y el tema de refy, en la web y en React Native.",
    sections: { "o-que-e": "Qué es", instalar: "Instalar", web: "Web", mobile: "Móvil", servidor: "Validar en el servidor", regras: "Reglas", requisitos: "Requisitos" },
    what: <><code>@refy-design/a2ui</code> es un catálogo <a href="https://a2ui.org">A2UI</a> 1.0. El agente describe la pantalla en mensajes A2UI; la app dibuja cada pieza con el componente de refy y el tema que ya usa. Id del catálogo: <code>{a2uiCatalogId}</code>.</>,
    pieces: <>{a2uiPieces.length} piezas, con los esquemas del catálogo básico v1 de A2UI: {a2uiPieces.join(", ")}. Los mismos mensajes dibujan las mismas piezas en la web y en el móvil.</>,
    experimental: <>Experimental (0.x): las bibliotecas de A2UI están fijadas en 0.15.0 y la API puede cambiar entre versiones menores.</>,
    web: "Web", native: "React Native (Expo)",
    peers: <>Cada plataforma instala solo su propio renderizador: <code>@a2ui/react</code> y <code>react-dom</code> son dependencias opcionales, y la app React Native no las recibe.</>,
    webUse: <>Crea el procesador, pásale los mensajes del agente y dibuja la superficie dentro de <code>ThemeProvider</code>:</>,
    webTheme: <>A2UI 1.0 no envía tema en <code>createSurface</code>. La apariencia viene del <code>ThemeProvider</code> alrededor de la superficie, así que los mismos mensajes siguen cualquier tema de refy y el modo claro u oscuro.</>,
    action: "Envía la acción (nombre, surfaceId, contexto resuelto) de vuelta al agente.",
    nativeUse: <>En la app, el procesador y la superficie vienen de <code>@refy-design/a2ui/native</code>, dentro de <code>RefyProvider</code> con el mismo JSON de tema de la web:</>,
    onError: <>Los errores de la superficie van a <code>onError</code> de <code>A2uiNativeSurface</code>, con <code>code</code> y <code>message</code>. Sin <code>onError</code>, salen en <code>console.error</code>.</>,
    openUrl: <>La función <code>openUrl</code> abre la dirección con <code>Linking</code> de React Native, con los esquemas <code>https:</code>, <code>http:</code>, <code>mailto:</code> y <code>tel:</code>. Otro esquema, o una dirección que el sistema no abre, llega como error en <code>onError</code>.</>,
    metro: <>El puente lee los esquemas de las piezas de un archivo de <code>@a2ui/web_core</code> que su <code>exports</code> no lista. Metro lo resuelve por la ruta y muestra un aviso; el aviso es esperado.</>,
    server: <><code>@refy-design/a2ui/definition</code> tiene el catálogo sin React y sin DOM. Úsalo en el servidor de la app para revisar los mensajes del agente antes de que lleguen a la pantalla, con las mismas reglas del renderizador. Un mensaje inválido lanza <code>A2uiValidationError</code>.</>,
    serverComment: "lanza A2uiValidationError con un mensaje inválido",
    rules: [
      <>Una pieza fuera del catálogo (por ejemplo <code>Video</code>) se rechaza con <code>A2uiValidationError</code>, y no se dibuja nada.</>,
      <>Las piezas que un <code>updateComponents</code> saca del árbol se guardan: A2UI 1.0 no tiene mensaje para borrar una pieza.</>,
    ],
    requires: <>Web: <code>react</code> y <code>react-dom</code> 19 o superior, <code>@refy-design/web</code> 1.8 o superior y <code>@a2ui/react</code> 0.15.0. Móvil: <code>react-native</code> 0.79 o superior y <code>@refy-design/mobile</code> 1.1 o superior.</>,
  },
};

function a2uiPage(locale: Locale): DocPage {
  const text = a2uiText[locale];
  return {
    label: "A2UI", group: "ai", description: text.description,
    sections: Object.entries(text.sections),
    body: (<>
      <section id="o-que-e">
        <h2>{text.sections["o-que-e"]}</h2>
        <p>{text.what}</p>
        <p>{text.pieces}</p>
        <p>{text.experimental}</p>
      </section>
      <section id="instalar">
        <h2>{text.sections.instalar}</h2>
        <CodeBlock label={text.web} language="bash" code={a2uiInstallWeb} wrap />
        <CodeBlock label={text.native} language="bash" code={a2uiInstallNative} wrap />
        <p>{text.peers}</p>
      </section>
      <section id="web">
        <h2>{text.sections.web}</h2>
        <p>{text.webUse}</p>
        <CodeBlock label="Screen.tsx" language="tsx" code={a2uiWebCode(text.action)} />
        <p>{text.webTheme}</p>
      </section>
      <section id="mobile">
        <h2>{text.sections.mobile}</h2>
        <p>{text.nativeUse}</p>
        <CodeBlock label="Screen.tsx" language="tsx" code={a2uiNativeCode(text.action)} />
        <p>{text.onError}</p>
        <p>{text.openUrl}</p>
        <p>{text.metro}</p>
      </section>
      <section id="servidor">
        <h2>{text.sections.servidor}</h2>
        <p>{text.server}</p>
        <CodeBlock label="server.ts" language="ts" code={a2uiServerCode(text.serverComment)} />
      </section>
      <section id="regras">
        <h2>{text.sections.regras}</h2>
        {text.rules.map((item, index) => <p key={index}>{item}</p>)}
      </section>
      <section id="requisitos">
        <h2>{text.sections.requisitos}</h2>
        <p>{text.requires}</p>
      </section>
    </>),
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
  "sem-bundler": noBundlerPage("pt"),
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
  a2ui: a2uiPage("pt"),
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
  "sem-bundler": noBundlerPage("en"),
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
  a2ui: a2uiPage("en"),
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
  "sem-bundler": noBundlerPage("es"),
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
  a2ui: a2uiPage("es"),
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
        // MCP, plugin e CLI moram em Para IAs; aqui fica o caminho até lá e as páginas de IA das Docs (A2UI).
        { title: docGroupLabel(locale, "ai"), items: [
          { href: "/para-ias", label: text.ai },
          ...docTopics.filter((id) => pages[id].group === "ai").map((id) => ({ href: docHref(id), label: pages[id].label })),
        ] },
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
