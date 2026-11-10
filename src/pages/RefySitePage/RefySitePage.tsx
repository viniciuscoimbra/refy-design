import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  Hero,
  Section,
  DeviceFrame,
  SiteFooter,
  Badge,
  BrandLogo,
  Button,
  Callout,
  Card,
  CardHeader,
  CodeBlock,
  Command,
  Drawer,
  IconButton,
  Input,
  Divider,
  Item,
  Kbd,
  Menu,
  NavigationMenu,
  Segmented,
  SettingsSubnav,
  ThemeProvider,
} from "../../index";
import { useResolvedMode } from "../../lib/ThemeProvider";
import type { RefyTheme, SettingsSubnavLinkProps, ThemeMode } from "../../index";
import { Icons } from "../../_demo/icons";
import { componentCatalog, componentAreas } from "../PlaygroundPage/catalog";
import { BlocksPreview } from "../PlaygroundPage/BlocksPreview";
import { D3ChartCatalog } from "../PlaygroundPage/D3ChartCatalog";
import { SiteTypography } from "./SiteTypography";
import { loadThemeFonts, playHeroEntrance, switchWithTransition } from "./heroMotion";
import { ThemeEditor } from "../PlaygroundPage/ThemeEditor";
import {
  changeConfig,
  defaultConfig,
  presetFonts,
  resolveTheme,
} from "../PlaygroundPage/themeConfig";
import type { PlaygroundConfig, Skin } from "../PlaygroundPage/themeConfig";
import type { PlaygroundSelection } from "../PlaygroundPage/PlaygroundPage";
import { blockRegistry } from "../PlaygroundPage/blockRegistry";
import { skins } from "../../stories/skins";
import { fontSets } from "../../lib/fontSets";
import styles from "./RefySitePage.module.css";
import { SiteThemeContext } from "./platform";
import { SiteLocaleProvider, canonicalPath, flags, htmlLang, localeNames, localePath, locales, stripLocale, useSiteLocale, useText, useTr } from "./i18n";
import type { Locale } from "./i18n";
import { homeSeo } from "./seo";
import { packageName, packagePublished, packageVersion } from "./packageRelease";
import { DocsPage, docGroupLabel, docTopics, localizedDocPages } from "./SiteDocs";
import { HeroWords, ManifestoScene, ShowcaseReel, ThemeScroll, heroText, playWords } from "./SiteHome";
import type { DocTopic } from "./SiteDocs";
import { ProjectPage, projectDescription, projectGroupLabel, projectLabel } from "./SiteProject";
import { AiGuidePage, aiHref, aiNavLinks, aiPagesLabel, aiTopics, localizedAiPages } from "./SiteAI";
import type { AiTopic } from "./SiteAI";
import {
  areaIcons,
  SideNav,
  ComponentNav,
  stroke,
  ComponentCatalog,
  AccordionPage,
  describe,
  CollectionPage,
  familySlug,
} from "./SiteCatalog";
import { collectionDefinitions } from "../PlaygroundPage/collections";


export type SitePage =
  | "home"
  | "docs"
  | "components"
  | "accordion"
  | "blocks"
  | "charts"
  | "themes"
  | "ai"
  | "playground"
  | "typography"
  | "collection"
  | "contribute";
export interface RefySitePageProps {
  initialPage?: SitePage;
  initialMode?: ThemeMode;
  initialSearchOpen?: boolean;
  initialMenuOpen?: boolean;
  configuration?: PlaygroundConfig;
  onConfigurationChange?: (patch: Partial<PlaygroundConfig>) => void;
  /** Liga a barra de endereço: cada página e cada família ganham caminho próprio, e Voltar/Avançar funcionam. Só o site publicado liga; o Storybook não. */
  routing?: boolean;
}
const pagePaths: Record<SitePage, string> = {
  home: "/",
  docs: "/docs",
  components: "/componentes",
  accordion: "/componentes",
  blocks: "/templates",
  charts: "/componentes/charts",
  themes: "/temas",
  typography: "/temas/tipografia",
  ai: "/para-ias",
  playground: "/playground",
  collection: "/componentes/colecoes",
  contribute: "/contribuir",
};
const pageTitles: Record<SitePage, Record<Locale, string>> = {
  home: { pt: homeSeo.pt.title, en: homeSeo.en.title, es: homeSeo.es.title },
  docs: { pt: "Instalação · refy", en: "Installation · refy", es: "Instalación · refy" },
  components: { pt: "Componentes · refy", en: "Components · refy", es: "Componentes · refy" },
  accordion: { pt: "Componentes · refy", en: "Components · refy", es: "Componentes · refy" },
  blocks: { pt: "Templates · refy", en: "Templates · refy", es: "Plantillas · refy" },
  charts: { pt: "Gráficos D3 · refy", en: "D3 charts · refy", es: "Gráficos D3 · refy" },
  themes: { pt: "Temas · refy", en: "Themes · refy", es: "Temas · refy" },
  typography: { pt: "Tipografia · refy", en: "Typography · refy", es: "Tipografía · refy" },
  ai: { pt: "Para IAs · refy", en: "For AI · refy", es: "Para IAs · refy" },
  playground: { pt: "Playground · refy", en: "Playground · refy", es: "Playground · refy" },
  collection: { pt: "Coleções · refy", en: "Collections · refy", es: "Colecciones · refy" },
  contribute: { pt: "Contribuir · refy", en: "Contributing · refy", es: "Contribuir · refy" },
};
const cta = {
  playground: { pt: "Abrir no Playground →", en: "Open in Playground →", es: "Abrir en el Playground →" },
  github: { pt: "Ver no GitHub ↗", en: "View on GitHub ↗", es: "Ver en GitHub ↗" },
  test: { pt: "Testar no Playground →", en: "Try it in Playground →", es: "Probar en el Playground →" },
  install: { pt: "Instalar no projeto", en: "Install in your project", es: "Instalar en el proyecto" },
};
const pathFor = (page: SitePage, component: string, template: string, doc: DocTopic = "primeiros-passos", collection = "core", ai?: AiTopic) =>
  page === "collection" ? `/componentes/colecoes/${collection}` : page === "accordion" ? `/componentes/${familySlug(component)}` : page === "blocks" ? (template ? `/templates/${template}` : "/templates") : page === "docs" ? `/docs/${doc}` : page === "ai" ? aiHref(ai) : pagePaths[page];
// Endereços antigos continuam abrindo a página certa (o build também gera 301 para cada um).
// Mapa de 09/11: MCP mora em Para IAs, Mobile entrou na Instalação, Releases virou Versões das Docs
// e a página Gráficos D3 deu lugar à ficha Charts, que já tem os 30 tipos de gráfico.
const legacyPaths: Record<string, string> = {
  "/blocks": "/templates", "/charts": "/componentes/charts", "/componentes/graficos": "/componentes/charts",
  "/docs/celular": "/docs/instalacao", "/docs/mobile": "/docs/instalacao", "/docs/primeira-tela": "/docs/primeiros-passos",
  "/docs/comecar": "/docs/primeiros-passos", "/docs/mcp": "/para-ias/mcp", "/releases": "/docs/versoes",
};
export interface SiteRoute { page: SitePage; component?: string; template?: string; doc?: DocTopic; collection?: string; ai?: AiTopic }
/** Lê qualquer endereço do site (em qualquer idioma, novo ou antigo) e devolve a página. */
export function routeFromLocation(pathname: string): SiteRoute | null {
  const trim = (path: string) => path.replace(/\/+$/, "") || "/";
  const stripped = trim(stripLocale(pathname));
  const canonical = trim(canonicalPath(pathname));
  const path = legacyPaths[stripped] ?? legacyPaths[canonical] ?? canonical;
  const doc = /^\/docs(?:\/([^/]+))?$/.exec(path);
  if (doc) return { page: "docs", doc: docTopics.find((topic) => topic === doc[1]) ?? "primeiros-passos" };
  const ai = /^\/para-ias(?:\/([^/]+))?$/.exec(path);
  if (ai) return { page: "ai", ai: aiTopics.find((topic) => topic === ai[1]) };
  const group = /^\/componentes\/colecoes\/([^/]+)$/.exec(path);
  if (group) return collectionDefinitions.some((item) => item.id === group[1]) ? { page: "collection", collection: group[1] } : { page: "components" };
  const template = /^\/templates(?:\/([^/]+))?$/.exec(path);
  if (template) return { page: "blocks", template: blockRegistry.find((item) => item.id === template[1])?.id };
  const family = /^\/componentes\/([^/]+)$/.exec(path);
  if (family) {
    const slug = decodeURIComponent(family[1]).toLowerCase();
    // Aceita também o nome colado de antes (visitschedulepicker).
    const id = componentCatalog.find((entry) => familySlug(entry.id) === slug || entry.id.toLowerCase() === slug)?.id;
    return id ? { page: "accordion", component: id } : { page: "components" };
  }
  const page = (Object.keys(pagePaths) as SitePage[]).find((key) => key !== "accordion" && key !== "charts" && pagePaths[key] === path);
  return page ? { page } : null;
}
// Mapa aprovado em 05/11: Charts virou coleção de Componentes, Temas entra no Playground, e o
// Playground fica como botão fixo no cabeçalho.
const destinationLabels: Array<[SitePage, Record<Locale, string>]> = [
  ["docs", { pt: "Docs", en: "Docs", es: "Docs" }],
  ["components", { pt: "Componentes", en: "Components", es: "Componentes" }],
  ["blocks", { pt: "Templates", en: "Templates", es: "Plantillas" }],
  ["themes", { pt: "Temas", en: "Themes", es: "Temas" }],
  ["ai", { pt: "Para IAs", en: "For AI", es: "Para IAs" }],
];
const CreationPlayground = lazy(() => import("../PlaygroundPage/PlaygroundPage").then((module) => ({ default: module.StandalonePlayground })));

// The logo is 24px tall wherever the site shows it (header, menu and footer).
function SiteBrand() {
  return <BrandLogo height={24} symbol aria-label="Refy" />;
}
function LanguageControl({ side = "bottom" }: { side?: "top" | "bottom" }) {
  const { locale, setLocale } = useSiteLocale();
  const [open, setOpen] = useState(false);
  const label = { pt: "Idioma", en: "Language", es: "Idioma" }[locale];
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      align="end"
      side={side}
      ariaLabel={label}
      onSelect={(id) => setLocale(id as Locale)}
      entries={locales.map((id) => ({ id, label: localeNames[id], icon: flags[id], meta: id === locale ? "✓" : undefined }))}
    >
      <Button variant="ghost" aria-label={`${label}: ${localeNames[locale]}`} leadingIcon={flags[locale]} onClick={() => setOpen(!open)}>
        {locale.toUpperCase()}
      </Button>
    </Menu>
  );
}
function ModeControl({ mode, onChange }: { mode: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  const t = useText();
  // "system" shows the mode the browser resolved; picking one there turns it into an explicit choice.
  const resolved = useResolvedMode();
  return <Segmented label={t({ pt: "Modo de cor", en: "Color mode", es: "Modo de color" })} iconOnly value={mode === "system" ? resolved : mode} onChange={value => onChange(value as ThemeMode)} options={[
    { value:"light", label:t({ pt: "Ativar modo claro", en: "Switch to light mode", es: "Activar modo claro" }), icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg> },
    { value:"dark", label:t({ pt: "Ativar modo escuro", en: "Switch to dark mode", es: "Activar modo oscuro" }), icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/></svg> },
  ]} />;
}
// Mock 25/10: on the site, the site theme is shown as "Refy"; the base preset becomes "Refy original".
// The display name comes from the theme file's own `label`.
function siteSkinLabel(id: string, label: string) {
  return skins[id as Skin]?.theme?.label ?? label;
}
function Home({
  navigate,
  config,
  update,
}: {
  navigate: (page: SitePage) => void;
  config: PlaygroundConfig;
  update: (patch: Partial<PlaygroundConfig>) => void;
}) {
  const home = useRef<HTMLElement>(null);
  const t = useText();
  // The switcher lists every theme file marked `featured`, in that order: dropping a file adds it.
  const heroSkins = Object.keys(skins).filter((id) => skins[id].featured).sort((a, b) => (skins[a].featured ?? 0) - (skins[b].featured ?? 0));
  // Entrance choreography on load only. A theme switch is the View Transition's job: replaying the
  // entrance after it reset the parts to opacity 0 and flashed the hero blank.
  useEffect(() => {
    const root = home.current;
    if (!root) return;
    const targets = [...root.querySelectorAll("[data-hero-part]")];
    const entrance = playHeroEntrance(root, targets);
    const words = playWords(root);
    return () => { entrance(); words(); };
  }, []);
  // Preload every featured theme's faces; the switcher is enabled only after every face is ready,
  // so the first switch never snapshots a fallback font.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void Promise.all(heroSkins.map((id) => loadThemeFonts(themeFonts(id), undefined, 3000)))
      .then(() => document.fonts?.ready)
      .then(() => { if (alive) setFontsReady(true); });
    return () => { alive = false; };
  }, []);
  const switchSkin = (skin: Skin) => {
    if (skin === config.skin && !config.customTheme) return;
    const before = home.current?.closest("[data-refy-brand]")?.getAttribute("data-refy-brand");
    // The update may land asynchronously (Storybook globals); wait for the new theme on the DOM.
    // rAF does not run while a View Transition holds rendering, so watch the attribute instead.
    const apply = () => new Promise<void>((resolve) => {
      const scope = home.current?.closest("[data-refy-brand]");
      if (!scope) { update({ skin }); resolve(); return; }
      const done = () => { observer.disconnect(); clearTimeout(timer); resolve(); };
      const observer = new MutationObserver(() => { if (scope.getAttribute("data-refy-brand") !== before) done(); });
      const timer = setTimeout(done, 600);
      observer.observe(scope, { attributes: true, attributeFilter: ["data-refy-brand"] });
      update({ skin });
    });
    void switchWithTransition(apply, themeFonts(skin));
  };
  return (
    <main id="site-content" className={styles.home} ref={home}>
      <Hero
        className={styles.hero}
        transitionNames
        top={
          <Segmented
            label={t({ pt: "Tema do site", en: "Site theme", es: "Tema del sitio" })}
            disabled={!fontsReady}
            value={config.customTheme ? "" : config.skin}
            onChange={(value) => switchSkin(value as Skin)}
            options={heroSkins.map((id) => ({ value: id, label: siteSkinLabel(id, skins[id].label) }))}
          />
        }
        title={<HeroWords key={t(heroText.title)} text={t(heroText.title)} />}
        accent="."
        lead={t(heroText.lead)}
        actions={
          <>
            <Button variant="primary" size="lg" onClick={() => navigate("playground")}>
              {t(cta.playground)}
            </Button>
            {githubEnabled && (
              <Button size="lg" href={githubUrl} target="_blank">
                {t(cta.github)}
              </Button>
            )}
          </>
        }
      />
      <ShowcaseReel />
      {!embedded && <LandingSections navigate={navigate} config={config} />}
    </main>
  );
}
const githubUrl = "https://github.com/viniciuscoimbra/refy-design";
// A build with VITE_REFY_GITHUB=off shows no GitHub button, icon, Fork or repository links anywhere.
const githubEnabled = import.meta.env.VITE_REFY_GITHUB !== "off";
// Header call to action: a star on the public repository, not a fork. The count comes from the
// public GitHub API and is kept for the session; without it the button still links to the repo.
const githubIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.4-1.22.71-1.5-2.47-.28-5.07-1.24-5.07-5.52 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.07-1.15 3.07-1.15.61 1.54.22 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.6 5.24-5.08 5.52.4.35.76 1.03.76 2.07v3.09c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/></svg>;
const starsKey = "refy:github-stars";
// The unauthenticated GitHub API allows 60 requests per hour per visitor: one request per page
// load at most, and the count is kept for an hour across tabs.
let starsRequest: Promise<number | null> | null = null;
const readStars = (): number | null => {
  try {
    const cached = JSON.parse(localStorage.getItem(starsKey) ?? "null");
    return cached && Date.now() - cached.at < 3_600_000 && typeof cached.count === "number" ? cached.count : null;
  } catch { return null; }
};
const fetchStars = () => (starsRequest ??= fetch("https://api.github.com/repos/viniciuscoimbra/refy-design")
  .then((response) => (response.ok ? response.json() : null))
  .then((repo) => {
    if (typeof repo?.stargazers_count !== "number") return null;
    try { localStorage.setItem(starsKey, JSON.stringify({ count: repo.stargazers_count, at: Date.now() })); } catch { /* no storage */ }
    return repo.stargazers_count as number;
  })
  .catch(() => null));
function GitHubStars() {
  const t = useText();
  const { locale } = useSiteLocale();
  const [stars, setStars] = useState<number | null>(readStars);
  useEffect(() => {
    if (stars !== null) return;
    let live = true;
    fetchStars().then((count) => { if (live && count !== null) setStars(count); });
    return () => { live = false; };
  }, [stars]);
  return (
    <Button
      variant="ghost"
      href={githubUrl}
      target="_blank"
      leadingIcon={githubIcon}
      trailingIcon={stars === null ? undefined : <span className={styles.starCount}>{stars.toLocaleString(htmlLang[locale])}</span>}
      aria-label={t({ pt: "Dar estrela ao refy no GitHub", en: "Star refy on GitHub", es: "Dar estrella a refy en GitHub" })}
    >
      <span className={styles.starLabel}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" /></svg>
        <span className={styles.starWord}>{t({ pt: "Estrela", en: "Star", es: "Estrella" })}</span>
      </span>
    </Button>
  );
}
// Font families a theme file paints with (heading and body), read from the resolved theme.
const themeFonts = (skin: string) => {
  const tokens = resolveTheme({ ...defaultConfig, skin, fonts: presetFonts[skin] ?? defaultConfig.fonts, customTheme: "" }).tokens ?? {};
  return [tokens["--font-heading"], tokens["--font-body"]].map((value) => String(value ?? "").split(",")[0].trim()).filter(Boolean);
};
// The device frames show this same page, live, at the device's real width. Inside a frame the
// page renders only its first fold, so frames never nest.
const embedded = typeof window !== "undefined" && window.self !== window.top && window.frameElement?.hasAttribute("data-refy-device-frame");
// The frame carries the theme chosen when it was created (skin, fonts, mode), so it opens already
// painted; later switches arrive by message, without reloading it (06/11: frames stayed on Refy).
const liveHome = (width: number, config: PlaygroundConfig) => {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("refyFrame", String(width));
  url.searchParams.set("refySkin", config.skin);
  url.searchParams.set("refyFonts", config.fonts);
  url.searchParams.set("refyMode", config.theme);
  return url.toString();
};
const frameThemeMessage = "refy:site-theme";
const frameReadyMessage = "refy:site-theme-ready";
// Theme the host asked for in the frame URL; the page applies it before the first paint.
function frameThemeFromUrl(): Partial<PlaygroundConfig> | null {
  const params = new URLSearchParams(window.location.search);
  const skin = params.get("refySkin");
  if (!skin || !Object.prototype.hasOwnProperty.call(skins, skin)) return null;
  const patch: Partial<PlaygroundConfig> = { skin };
  const fonts = params.get("refyFonts");
  if (fonts && Object.prototype.hasOwnProperty.call(fontSets, fonts)) patch.fonts = fonts as PlaygroundConfig["fonts"];
  const mode = params.get("refyMode");
  if (mode === "light" || mode === "dark" || mode === "system") patch.theme = mode;
  return patch;
}
const footerPageLabels = {
  components: { pt: "Componentes", en: "Components", es: "Componentes" },
  blocks: { pt: "Templates", en: "Templates", es: "Plantillas" },
  themes: { pt: "Temas", en: "Themes", es: "Temas" },
  playground: { pt: "Playground", en: "Playground", es: "Playground" },
  ai: { pt: "Para IAs", en: "For AI", es: "Para IAs" },
} satisfies Partial<Record<SitePage, Record<Locale, string>>>;
const footerDocs: DocTopic[] = ["primeiros-passos", "instalacao", "tema-por-arquivo", "versoes"];
const projectLinks: Array<[string, Record<Locale, string>]> = [
  ["", { pt: "Código no GitHub", en: "Source on GitHub", es: "Código en GitHub" }],
  ["/blob/main/SECURITY.md", { pt: "Segurança", en: "Security", es: "Seguridad" }],
  ["/blob/main/LICENSE", { pt: "Licença MIT", en: "MIT License", es: "Licencia MIT" }],
];
// Sales sections: one per argument, each with a live proof built from refy.
function LandingCtas({ navigate }: { navigate: (page: SitePage) => void }) {
  const t = useText();
  return (
    <div className={styles.landingCtas}>
      <Button variant="primary" size="lg" onClick={() => navigate("playground")}>{t(cta.playground)}</Button>
      {githubEnabled && <Button size="lg" href={githubUrl} target="_blank">{t(cta.github)}</Button>}
    </div>
  );
}
// The same featured theme files the hero switcher lists.
const landingThemes = Object.keys(skins).filter((id) => skins[id].featured).sort((a, b) => (skins[a].featured ?? 0) - (skins[b].featured ?? 0)).map((id) => ({
  id,
  label: siteSkinLabel(id, skins[id].label),
  theme: resolveTheme({ ...defaultConfig, skin: id, fonts: presetFonts[id], customTheme: "" }),
}));
const agentCommands = {
  pt: "npm exec --offline -- refy-agent component Table\nnpm exec --offline -- refy-agent catalog tabela\nnpm exec --offline -- refy-agent check <seus arquivos>",
  en: "npm exec --offline -- refy-agent component Table\nnpm exec --offline -- refy-agent catalog table\nnpm exec --offline -- refy-agent check <your files>",
  es: "npm exec --offline -- refy-agent component Table\nnpm exec --offline -- refy-agent catalog tabla\nnpm exec --offline -- refy-agent check <tus archivos>",
};
const agentCheckOutput = '{\n  "rule": "raw-control",\n  "severity": "error",\n  "message": "Use Button ou IconButton; justify intrinsic/external widgets explicitly."\n}';
function LandingSection({ id, eyebrow, title, text, reverse, stacked, wide, navigate, children }: { id: string; eyebrow: string; title: string; text: string; reverse?: boolean; stacked?: boolean; wide?: boolean; navigate: (page: SitePage) => void; children: ReactNode }) {
  return (
    <Section layout={stacked ? "stacked" : "split"} reverse={reverse} wide={wide} aside={children} aria-labelledby={id}>
      <div className={styles.landingText}>
        <span className={styles.landingEyebrow}>{eyebrow}</span>
        <h2 id={id}>{title}</h2>
        <p>{text}</p>
        <LandingCtas navigate={navigate} />
      </div>
    </Section>
  );
}
const landingCopy = {
  extensible: {
    eyebrow: { pt: "Extensível", en: "Extensible", es: "Extensible" },
    title: { pt: "Monte componentes novos com os que já existem.", en: "Build new components from the ones you have.", es: "Arma componentes nuevos con los que ya existen." },
    text: { pt: "Pegue átomos prontos, como Input, Button e Badge, e junte numa molécula nova. As peças de baixo não mudam, e o componente novo já sai com o tema e com os estados de cada peça.", en: "Take ready atoms like Input, Button and Badge and combine them into a new molecule. The pieces underneath stay the same, and the new component ships with the theme and the states of every piece.", es: "Toma átomos listos, como Input, Button y Badge, y únelos en una molécula nueva. Las piezas de abajo no cambian, y el componente nuevo ya sale con el tema y con los estados de cada pieza." },
    atoms: { pt: "Átomos", en: "Atoms", es: "Átomos" },
    molecule: { pt: "Molécula", en: "Molecule", es: "Molécula" },
    atomInput: { pt: "Átomo Input", en: "Input atom", es: "Átomo Input" },
    invite: { pt: "Convidar", en: "Invite", es: "Invitar" },
    seats: { pt: "3 vagas", en: "3 seats", es: "3 plazas" },
    cardTitle: { pt: "Convidar pessoas", en: "Invite people", es: "Invitar personas" },
    inviteEmail: { pt: "E-mail do convite", en: "Invite email", es: "Correo de la invitación" },
    codeLabel: { pt: "A molécula, em código", en: "The molecule, in code", es: "La molécula, en código" },
    code: {
      pt: 'export const ConvidarPessoas = () => (\n  <Card>\n    <CardHeader\n      title="Convidar pessoas"\n      action={<Badge>3 vagas</Badge>}\n    />\n    <Input placeholder="E-mail" />\n    <Button variant="primary">Convidar</Button>\n  </Card>\n);',
      en: 'export const InvitePeople = () => (\n  <Card>\n    <CardHeader\n      title="Invite people"\n      action={<Badge>3 seats</Badge>}\n    />\n    <Input placeholder="E-mail" />\n    <Button variant="primary">Invite</Button>\n  </Card>\n);',
      es: 'export const InvitarPersonas = () => (\n  <Card>\n    <CardHeader\n      title="Invitar personas"\n      action={<Badge>3 plazas</Badge>}\n    />\n    <Input placeholder="E-mail" />\n    <Button variant="primary">Invitar</Button>\n  </Card>\n);',
    },
  },
  themes: {
    eyebrow: { pt: "Temas", en: "Themes", es: "Temas" },
    title: { pt: "Temas bem diferentes, a mesma base.", en: "Very different themes, one base.", es: "Temas muy distintos, la misma base." },
    text: { pt: "Os componentes são os mesmos nos quatro exemplos. O que muda é só o arquivo de tokens: cor, fonte, raio e densidade. Você escreve um arquivo novo e tem um tema novo.", en: "The components are the same in all four examples. Only the token file changes: color, font, radius and density. Write a new file and you have a new theme.", es: "Los componentes son los mismos en los cuatro ejemplos. Solo cambia el archivo de tokens: color, fuente, radio y densidad. Escribes un archivo nuevo y tienes un tema nuevo." },
  },
  ai: {
    eyebrow: { pt: "IA nativa", en: "Native AI", es: "IA nativa" },
    title: { pt: "A IA monta com o que existe.", en: "AI builds with what exists.", es: "La IA arma con lo que existe." },
    text: { pt: "Cada componente traz exemplo e regras num formato que o agente lê antes de escrever; os principais trazem também o contrato de props. Ele consulta o catálogo, monta a tela e confere se usou só peças do refy.", en: "Every component ships an example and rules in a format the agent reads before writing; the main ones also ship their props contract. The agent queries the catalog, builds the screen and checks that it used only refy pieces.", es: "Cada componente trae ejemplo y reglas en un formato que el agente lee antes de escribir; los principales traen también el contrato de props. Consulta el catálogo, arma la pantalla y verifica que usó solo piezas de refy." },
    queries: { pt: "O que o agente consulta", en: "What the agent queries", es: "Lo que consulta el agente" },
    check: { pt: "O que o check devolve quando a tela usa um botão solto", en: "What the check returns when a screen uses a raw button", es: "Lo que devuelve el check cuando la pantalla usa un botón suelto" },
  },
  platforms: {
    eyebrow: { pt: "Web e mobile", en: "Web and mobile", es: "Web y móvil" },
    title: { pt: "Responsivo na web, nativo no celular.", en: "Responsive on the web, native on the phone.", es: "Responsive en la web, nativo en el móvil." },
    text: { pt: "Você compõe uma vez e a tela se ajusta do desktop ao celular. Para app, o pacote nativo usa os mesmos tokens.", en: "You compose once and the screen adapts from desktop to phone. For apps, the native package uses the same tokens.", es: "Compones una vez y la pantalla se ajusta del escritorio al móvil. Para apps, el paquete nativo usa los mismos tokens." },
    browserTitle: { pt: "A home do refy num navegador a 1280 px", en: "The refy home in a 1280 px browser", es: "La home de refy en un navegador de 1280 px" },
    browser: { pt: "Navegador, 1280 px", en: "Browser, 1280 px", es: "Navegador, 1280 px" },
    phoneTitle: { pt: "A home do refy num celular a 390 px", en: "The refy home on a 390 px phone", es: "La home de refy en un móvil de 390 px" },
    phone: { pt: "Celular, 390 px", en: "Phone, 390 px", es: "Móvil, 390 px" },
  },
};
function LandingSections({ navigate, config }: { navigate: (page: SitePage) => void; config: PlaygroundConfig }) {
  const t = useText();
  const c = landingCopy;
  // A new src reloads the frame; the URL keeps the first theme and messages carry the rest.
  const [frames] = useState(() => ({ browser: liveHome(1280, config), phone: liveHome(390, config) }));
  return (
    <div className={styles.landing}>
      <LandingSection id="landing-extensible" eyebrow={t(c.extensible.eyebrow)} navigate={navigate} reverse
        title={t(c.extensible.title)}
        text={t(c.extensible.text)}>
        <div className={styles.landingProof}>
          <div className={styles.landingAtoms}>
            <figure className={styles.landingPart}>
              <figcaption>{t(c.extensible.atoms)}</figcaption>
              <Input aria-label={t(c.extensible.atomInput)} placeholder="E-mail" />
              <div className={styles.landingSampleRow}>
                <Button variant="primary">{t(c.extensible.invite)}</Button>
                <Badge tone="success">{t(c.extensible.seats)}</Badge>
              </div>
            </figure>
            <span className={styles.landingArrow} aria-hidden="true">→</span>
            <figure className={styles.landingPart}>
              <figcaption>{t(c.extensible.molecule)}</figcaption>
              <Card>
                <CardHeader size="sm" title={t(c.extensible.cardTitle)} action={<Badge tone="success">{t(c.extensible.seats)}</Badge>} />
                <div className={styles.landingSampleRow}>
                  <Input aria-label={t(c.extensible.inviteEmail)} placeholder="E-mail" />
                  <Button variant="primary">{t(c.extensible.invite)}</Button>
                </div>
              </Card>
            </figure>
          </div>
          <CodeBlock label={t(c.extensible.codeLabel)} language="tsx" code={t(c.extensible.code)} />
        </div>
      </LandingSection>
      <ThemeScroll themes={landingThemes} intro={
        <div className={styles.landingText}>
          <span className={styles.landingEyebrow}>{t(c.themes.eyebrow)}</span>
          <h2 id="landing-theme">{t(c.themes.title)}</h2>
          <p>{t(c.themes.text)}</p>
          <LandingCtas navigate={navigate} />
        </div>
      } />
      <LandingSection id="landing-ai" eyebrow={t(c.ai.eyebrow)} navigate={navigate} reverse
        title={t(c.ai.title)}
        text={t(c.ai.text)}>
        <div className={styles.landingProof}>
          <CodeBlock label={t(c.ai.queries)} language="bash" code={t(agentCommands)} />
          <CodeBlock label={t(c.ai.check)} language="json" code={agentCheckOutput} />
        </div>
      </LandingSection>
      <LandingSection id="landing-platforms" eyebrow={t(c.platforms.eyebrow)} navigate={navigate}
        title={t(c.platforms.title)}
        text={t(c.platforms.text)}>
        <div className={styles.landingDevices}>
          <DeviceFrame variant="browser" src={frames.browser} frameTitle={t(c.platforms.browserTitle)} address="refy" caption={t(c.platforms.browser)} />
          <DeviceFrame variant="phone" src={frames.phone} frameTitle={t(c.platforms.phoneTitle)} viewport={{ width: 390, height: 844 }} caption={t(c.platforms.phone)} className={styles.landingPhone} />
        </div>
      </LandingSection>
      <ManifestoScene>
        <div className={styles.landingCtas}>
          <Button variant="primary" size="lg" onClick={() => navigate("playground")}>{t(cta.test)}</Button>
          <Button size="lg" onClick={() => navigate("docs")}>{t(cta.install)}</Button>
        </div>
      </ManifestoScene>
    </div>
  );
}
// In-page side menu: the navigation component marks the section the reader chose.
const aiIcons = {
  start: stroke(<path d="M7 4v16l13-8z" />),
  rules: stroke(<><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>),
  catalog: stroke(<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>),
  recipes: stroke(<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>),
  examples: stroke(<path d="m8 8-4 4 4 4M16 8l4 4-4 4" />),
  limits: stroke(<><path d="M12 3 5 6v6c0 4.2 3 7.5 7 9 4-1.5 7-4.8 7-9V6z" /><path d="m9 12 2 2 4-4" /></>),
  package: stroke(<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>),
  palette: stroke(<><circle cx="12" cy="12" r="9" /><circle cx="8" cy="10" r="1" /><circle cx="12" cy="7" r="1" /><circle cx="16" cy="10" r="1" /></>),
  access: stroke(<><circle cx="12" cy="4.5" r="1.5" /><path d="M5 8h14M12 8v6M9 21l3-7 3 7" /></>),
  copy: stroke(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></>),
  quote: stroke(<path d="M9 7H5v6h4l-2 4M19 7h-4v6h4l-2 4" />),
};
const aiNavItems = [
  { href: "#start", label: { pt: "Começar", en: "Get started", es: "Empezar" }, icon: aiIcons.start },
  { href: "#rules", label: { pt: "Regras de composição", en: "Composition rules", es: "Reglas de composición" }, icon: aiIcons.rules },
  { href: "#catalog", label: { pt: "Catálogo", en: "Catalog", es: "Catálogo" }, icon: aiIcons.catalog },
  { href: "#recipes", label: { pt: "Receitas", en: "Recipes", es: "Recetas" }, icon: aiIcons.recipes },
  { href: "#examples", label: { pt: "Exemplos", en: "Examples", es: "Ejemplos" }, icon: aiIcons.examples },
  { href: "#limits", label: { pt: "Limites e validação", en: "Limits and validation", es: "Límites y validación" }, icon: aiIcons.limits },
];
const suggestedComposition = {
  pt: '<Input label="Nome" />\n<Button>Continuar</Button>',
  en: '<Input label="Name" />\n<Button>Continue</Button>',
  es: '<Input label="Nombre" />\n<Button>Continuar</Button>',
};
const aiPrompt = {
  pt: "Leia o contrato de adoção em @refy-design/web/ai/instructions.md.\nInspecione a tela React e seus fluxos antes de alterar o código.\nApresente o de–para dos elementos e preserve validações, eventos e integrações.\nBusque os componentes no catálogo da versão instalada do refy.\nComponha a tela com a API pública e personalize pelo ThemeProvider.\nExecute o checker, tipos e testes de interação; informe gaps e limites.",
  en: "Read the adoption contract in @refy-design/web/ai/instructions.md.\nInspect the React screen and its flows before changing code.\nMap each current element to its refy equivalent and keep validations, events and integrations.\nLook up components in the catalog of the installed refy version.\nCompose the screen with the public API and customize through ThemeProvider.\nRun the checker, types and interaction tests; report gaps and limits.",
  es: "Lee el contrato de adopción en @refy-design/web/ai/instructions.md.\nInspecciona la pantalla React y sus flujos antes de cambiar el código.\nPresenta la equivalencia de cada elemento y conserva validaciones, eventos e integraciones.\nBusca los componentes en el catálogo de la versión instalada de refy.\nCompón la pantalla con la API pública y personaliza con ThemeProvider.\nEjecuta el checker, los tipos y las pruebas de interacción; informa brechas y límites.",
};
const agentToolsCode = {
  pt: "npm exec --offline -- refy-agent catalog formulário\nnpm exec --offline -- refy-agent component Input\nnpm exec --offline -- refy-agent inspect src/Tela.tsx\nnpm exec --offline -- refy-agent check src/Tela.tsx src/tela.css",
  en: "npm exec --offline -- refy-agent catalog form\nnpm exec --offline -- refy-agent component Input\nnpm exec --offline -- refy-agent inspect src/Screen.tsx\nnpm exec --offline -- refy-agent check src/Screen.tsx src/screen.css",
  es: "npm exec --offline -- refy-agent catalog formulario\nnpm exec --offline -- refy-agent component Input\nnpm exec --offline -- refy-agent inspect src/Pantalla.tsx\nnpm exec --offline -- refy-agent check src/Pantalla.tsx src/pantalla.css",
};
function AIPage({ navigate, go, config }: { navigate: (page: SitePage) => void; go: (href: string) => void; config: PlaygroundConfig }) {
  const [copyState, setCopyState] = useState("");
  const t = useText();
  const { locale } = useSiteLocale();
  const prompt = t(aiPrompt);
  const themeLabel = `${config.customTheme ? t({ pt: "Personalizado", en: "Custom", es: "Personalizado" }) : skins[config.skin]?.label ?? config.skin} (${config.theme === "dark" ? "Dark" : config.theme === "system" ? t({ pt: "Sistema", en: "System", es: "Sistema" }) : "Light"})`;
  // The navigation component owns the active state; sections scroll in place, Catálogo opens the catalog page.
  const link = (item: { href: string }, props: SettingsSubnavLinkProps) => (
    <a
      {...props}
      onClick={(event) => {
        event.preventDefault();
        if (item.href === "#catalog") return navigate("components");
        document.getElementById(item.href.slice(1))?.scrollIntoView({ block: "start" });
      }}
    />
  );
  return (
    <main id="site-content" className={styles.aiGrid}>
      <SideNav title={t({ pt: "Para IAs", en: "For AI", es: "Para IAs" })}>
        <div className={styles.sideLinks}>
          {/* Um menu só, com uma marca de página atual: as páginas de Para IAs e, abaixo, as seções desta. */}
          <SettingsSubnav
            label={t({ pt: "Guia para IAs", en: "Guide for AI", es: "Guía para IAs" })}
            activeHref={aiHref()}
            groups={[
              { title: aiPagesLabel(locale), items: aiNavLinks(locale) },
              { title: t({ pt: "Nesta página", en: "On this page", es: "En esta página" }), items: aiNavItems.map((item) => ({ ...item, label: t(item.label) })) },
            ]}
            renderLink={(item, props) => item.href.startsWith("#")
              ? link(item, props)
              : <a {...props} href={localePath(locale, item.href)} onClick={(event) => { event.preventDefault(); go(item.href); }} />}
          />
        </div>
      </SideNav>
      <article className={styles.article}>
        <header id="start" className={styles.heading}>
          <div className={styles.eyebrow}>{t({ pt: "Para IAs / Composição", en: "For AI / Composition", es: "Para IAs / Composición" })}</div>
          <div className={styles.titleRow}>
            <h1>{t({ pt: "Uma linguagem comum para compor", en: "A shared language for composing", es: "Un lenguaje común para componer" })}<span className={styles.brandDot}>.</span></h1>
            <Button
              leadingIcon={aiIcons.copy}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(prompt);
                  setCopyState(t({ pt: "Contexto copiado.", en: "Context copied.", es: "Contexto copiado." }));
                } catch {
                  setCopyState(t({ pt: "Não foi possível copiar. Use o bloco em Exemplos.", en: "Could not copy. Use the block under Examples.", es: "No se pudo copiar. Usa el bloque en Ejemplos." }));
                }
              }}
            >
              {t({ pt: "Copiar contexto", en: "Copy context", es: "Copiar contexto" })}
            </Button>
          </div>
          <p>{t({ pt: "Componentes, contratos e exemplos para orientar a construção de interfaces.", en: "Components, contracts and examples to guide how interfaces are built.", es: "Componentes, contratos y ejemplos para guiar la construcción de interfaces." })}</p>
          {copyState && <p role="status">{copyState}</p>}
        </header>
        <div className={styles.aiTop}>
          <ol id="rules" className={styles.aiRules}>
            {t({
              pt: [["Escolha componentes existentes", "Consulte finalidade, camada e API pública."], ["Preserve a composição", "Átomos formam moléculas. Organismos coordenam interações."], ["Aplique a identidade por tokens", "O tema define cores, fontes, forma e movimento."]],
              en: [["Pick existing components", "Check purpose, layer and public API."], ["Keep the composition", "Atoms form molecules. Organisms coordinate interactions."], ["Apply identity through tokens", "The theme sets colors, fonts, shape and motion."]],
              es: [["Elige componentes existentes", "Consulta finalidad, capa y API pública."], ["Conserva la composición", "Los átomos forman moléculas. Los organismos coordinan interacciones."], ["Aplica la identidad con tokens", "El tema define colores, fuentes, forma y movimiento."]],
            }).map(([title, body], index) => (
              <li key={title}>
                <span className={styles.aiStep} aria-hidden="true">{index + 1}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Card padding="sm" className={styles.aiContext}>
            <h2 className={styles.aiContextTitle}>{t({ pt: "Contexto do projeto", en: "Project context", es: "Contexto del proyecto" })}</h2>
            {[
              [aiIcons.package, t({ pt: "Versão do pacote", en: "Package version", es: "Versión del paquete" }), packagePublished ? `${packageName}@${packageVersion}` : `${packageName}@${packageVersion} · ${t({ pt: "ainda não publicado", en: "not published yet", es: "todavía no publicado" })}`],
              [aiIcons.palette, t({ pt: "Tema aplicado", en: "Applied theme", es: "Tema aplicado" }), themeLabel],
              [aiIcons.catalog, t({ pt: "Componentes permitidos", en: "Allowed components", es: "Componentes permitidos" }), t({ pt: "Todos do catálogo", en: "Everything in the catalog", es: "Todos los del catálogo" })],
              [aiIcons.access, t({ pt: "Estados e acessibilidade", en: "States and accessibility", es: "Estados y accesibilidad" }), t({ pt: "Foco, teclado e ARIA", en: "Focus, keyboard and ARIA", es: "Foco, teclado y ARIA" })],
            ].map(([icon, title, value]) => (
              <Item key={title as string} variant="plain" media={icon} title={title as string} description={<code className={styles.mono}>{value}</code>} />
            ))}
          </Card>
        </div>
        <div id="examples" className={styles.aiExamples}>
          <Card padding="sm">
            <h2 className={styles.aiCardTitle}>{t({ pt: "Exemplo de instrução", en: "Sample instruction", es: "Ejemplo de instrucción" })}</h2>
            <blockquote className={styles.aiQuote}>
              <span aria-hidden="true">{aiIcons.quote}</span>
              {t({
                pt: <p>Monte um formulário com <code>Input</code> e <em>Button</em>. Use os tokens do tema e mostre os estados de erro e envio.</p>,
                en: <p>Build a form with <code>Input</code> and <em>Button</em>. Use the theme tokens and show the error and submitting states.</p>,
                es: <p>Arma un formulario con <code>Input</code> y <em>Button</em>. Usa los tokens del tema y muestra los estados de error y envío.</p>,
              })}
            </blockquote>
          </Card>
          <CodeBlock label={t({ pt: "Composição sugerida", en: "Suggested composition", es: "Composición sugerida" })} language="tsx" code={t(suggestedComposition)} />
        </div>
        <nav className={styles.aiLinks} aria-label={t({ pt: "Próximos passos para IAs", en: "Next steps for AI", es: "Próximos pasos para IAs" })}>
          <a href="#catalog" onClick={(event) => { event.preventDefault(); navigate("components"); }}>{t({ pt: "Ver catálogo estruturado →", en: "See the structured catalog →", es: "Ver catálogo estructurado →" })}</a>
          <span className={styles.aiDivider} aria-hidden="true" />
          <a href="#recipes" onClick={(event) => { event.preventDefault(); document.getElementById("recipes")?.scrollIntoView({ block: "start" }); }}>{t({ pt: "Receitas de composição →", en: "Composition recipes →", es: "Recetas de composición →" })}</a>
        </nav>
        <section id="recipes">
          <h2>{t({ pt: "Receitas de composição", en: "Composition recipes", es: "Recetas de composición" })}</h2>
          <p>{t({ pt: "O pacote inclui um catálogo versionado, APIs e exemplos reais para consulta local. Depois de instalar o tarball no projeto, use:", en: "The package includes a versioned catalog, APIs and real examples for local lookup. After installing the tarball in your project, run:", es: "El paquete incluye un catálogo versionado, APIs y ejemplos reales para consulta local. Después de instalar el tarball en el proyecto, usa:" })}</p>
          <CodeBlock language="bash" label={t({ pt: "Ferramentas locais para agentes", en: "Local tools for agents", es: "Herramientas locales para agentes" })} code={t(agentToolsCode)} />
          <p>{t({ pt: "As verificações de código usam o TypeScript de desenvolvimento do projeto. A aplicação não carrega o parser nem executa um serviço de IA.", en: "Code checks use the project's development TypeScript. The app does not load the parser or run an AI service.", es: "Las verificaciones de código usan el TypeScript de desarrollo del proyecto. La aplicación no carga el parser ni ejecuta un servicio de IA." })}</p>
          <CodeBlock label={t({ pt: "Contexto para o agente", en: "Context for the agent", es: "Contexto para el agente" })} language="text" code={prompt} />
        </section>
        <section id="limits">
          <h2>{t({ pt: "Limites e validação", en: "Limits and validation", es: "Límites y validación" })}</h2>
          <Callout tone="note" title={t({ pt: "Guia de composição", en: "Composition guide", es: "Guía de composición" })}>
            {t({ pt: "O kit consulta arquivos e verifica regras conhecidas localmente, sem rede ou alteração automática da tela. Testes de fluxo e revisão visual continuam necessários." + (packagePublished ? " O catálogo vem dentro do pacote @refy-design/web, em ai/catalog.json." : " O pacote e o catálogo remoto ainda não foram publicados."), en: "The kit reads files and checks known rules locally, with no network and no automatic changes to the screen. Flow tests and visual review are still needed." + (packagePublished ? " The catalog ships inside the @refy-design/web package, in ai/catalog.json." : " The package and the remote catalog are not published yet."), es: "El kit consulta archivos y verifica reglas conocidas localmente, sin red ni cambios automáticos en la pantalla. Las pruebas de flujo y la revisión visual siguen siendo necesarias." + (packagePublished ? " El catálogo viene dentro del paquete @refy-design/web, en ai/catalog.json." : " El paquete y el catálogo remoto aún no se publicaron.") })}
          </Callout>
        </section>
      </article>
    </main>
  );
}
export function RefySitePage({ initialLocale, ...props }: RefySitePageProps & { initialLocale?: Locale }) {
  return <SiteLocaleProvider initial={initialLocale}><SiteShell {...props} /></SiteLocaleProvider>;
}
function SiteShell({
  initialPage = "home",
  initialMode,
  initialSearchOpen = false,
  initialMenuOpen = false,
  configuration,
  onConfigurationChange,
  routing = false,
}: RefySitePageProps) {
  const startRoute = routing && typeof window !== "undefined" ? routeFromLocation(window.location.pathname) : null;
  const [page, setPage] = useState<SitePage>(startRoute?.page ?? initialPage);
  const [component, setComponent] = useState(startRoute?.component ?? "Accordion");
  // Sem id, /templates abre a vitrine com todos os templates.
  const [template, setTemplate] = useState(startRoute?.template ?? "");
  const [doc, setDoc] = useState<DocTopic>(startRoute?.doc ?? "primeiros-passos");
  const [aiTopic, setAiTopic] = useState<AiTopic | undefined>(startRoute?.ai);
  const [collection, setCollection] = useState(startRoute?.collection ?? "core");
  const [localConfig, setConfig] = useState<PlaygroundConfig>({
    ...defaultConfig,
    theme: initialMode ?? defaultConfig.theme,
    skin: initialPage === "playground" ? defaultConfig.skin : "refy-site",
  });
  const config = configuration ?? localConfig;
  const [search, setSearch] = useState(initialSearchOpen);
  const [menu, setMenu] = useState(initialMenuOpen);
  const [customize, setCustomize] = useState(false);
  const [selection, setSelection] = useState<PlaygroundSelection>(() => {
    const requested = initialPage === "playground" && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("component") ??
        new URLSearchParams(window.location.hash.slice(1)).get("component")
      : null;
    return {
      view: "components",
      componentId: componentCatalog.some((entry) => entry.id === requested) ? requested! : "Button",
      blockId: blockRegistry[0].id,
    };
  });
  const preview = useRef<HTMLDivElement>(null);
  const t = useText();
  const tr = useTr();
  const { locale } = useSiteLocale();
  const docPages = localizedDocPages[locale];
  const destinations = destinationLabels.map(([id, label]): [SitePage, string] => [id, t(label)]);
  const theme: RefyTheme = resolveTheme(config);
  const update = (patch: Partial<PlaygroundConfig>) =>
    onConfigurationChange
      ? onConfigurationChange(patch)
      : setConfig((current) => changeConfig(current, patch));
  // Device frames show this page live. The host sends its theme to every frame on each change and
  // answers a frame that just loaded; a frame applies only what its own parent sends.
  useEffect(() => {
    if (embedded) return;
    const send = (target: MessageEventSource | Window | null | undefined) =>
      (target as Window | null)?.postMessage({ type: frameThemeMessage, config }, window.location.origin);
    document.querySelectorAll<HTMLIFrameElement>("iframe[data-refy-device-frame]").forEach((frame) => send(frame.contentWindow));
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === frameReadyMessage) send(event.source);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [config]);
  // The listener lives for the whole page; update is a new function on every render, so it calls the latest one.
  const latestUpdate = useRef(update);
  latestUpdate.current = update;
  useLayoutEffect(() => {
    if (!embedded) return;
    const initial = frameThemeFromUrl();
    if (initial) latestUpdate.current(initial);
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== frameThemeMessage) return;
      latestUpdate.current(event.data.config as PlaygroundConfig);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: frameReadyMessage }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const navigate = (next: SitePage, family = component, templateId = next === "blocks" ? "" : template, topic: DocTopic = "primeiros-passos", group = collection, ai?: AiTopic) => {
    setPage(next);
    // Docs sem página escolhida abre em Primeiros passos; Para IAs sem página abre a visão geral.
    if (next === "docs") setDoc(topic);
    if (next === "ai") setAiTopic(ai);
    if (next === "blocks") setTemplate(templateId);
    setMenu(false);
    if (routing) {
      const path = localePath(locale, pathFor(next, family, templateId, topic, group, ai));
      if (path !== window.location.pathname) window.history.pushState({ page: next, component: family }, "", path);
    }
    window.scrollTo({ top: 0, left: 0 });
  };
  const select = (id: string) => {
    setComponent(id);
    navigate("accordion", id);
  };
  const openCollection = (id: string) => {
    setCollection(id);
    navigate("collection", component, template, doc, id);
  };
  const openDoc = (topic: DocTopic) => {
    setDoc(topic);
    navigate("docs", component, template, topic);
  };
  /** Abre a página de qualquer link interno (caminho em português, novo ou antigo). */
  const go = (href: string) => {
    const route = routeFromLocation(href.split("#")[0]);
    if (!route) return;
    if (route.page === "accordion" && route.component) return select(route.component);
    if (route.page === "collection" && route.collection) return openCollection(route.collection);
    if (route.page === "blocks" && route.template) { setPage("blocks"); return selectTemplate(route.template); }
    navigate(route.page, component, route.page === "blocks" ? "" : template, route.doc, collection, route.ai);
  };
  const selectTemplate = (id: string) => {
    setTemplate(id);
    if (routing) window.history.pushState({ page: "blocks", template: id }, "", localePath(locale, pathFor("blocks", component, id)));
    window.scrollTo({ top: 0, left: 0 });
  };
  const openComponent = (id: string) => {
    setSelection((current) => ({ ...current, view: "components", componentId: id }));
    navigate("playground");
  };
  const openTemplate = (id: string) => {
    setSelection((current) => ({ ...current, view: "blocks", blockId: id }));
    navigate("playground");
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (routing) return;
    setPage(initialPage);
    setComponent("Accordion");
  }, [initialPage, routing]);
  // Endereço antigo ou com nome colado (/docs/mcp, /componentes/visitschedulepicker) troca pelo atual
  // sem criar entrada no histórico; o build também responde 301 para eles.
  useEffect(() => {
    if (!routing || !startRoute) return;
    const current = localePath(locale, pathFor(startRoute.page, startRoute.component ?? component, startRoute.template ?? "", startRoute.doc, startRoute.collection, startRoute.ai));
    if (current !== window.location.pathname.replace(/\/+$/, "") && window.location.pathname !== "/") window.history.replaceState(window.history.state, "", current + window.location.search + window.location.hash);
  }, []);
  useEffect(() => {
    if (!routing) return;
    const onPop = () => {
      const route = routeFromLocation(window.location.pathname) ?? { page: "home" as SitePage };
      setPage(route.page);
      if (route.component) setComponent(route.component);
      if (route.page === "blocks") setTemplate(route.template ?? "");
      if (route.doc) setDoc(route.doc);
      if (route.page === "ai") setAiTopic(route.ai);
      if (route.collection) setCollection(route.collection);
      setMenu(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [routing]);
  useEffect(() => {
    if (!routing) return;
    document.title = page === "accordion" ? `${component} · refy` : page === "blocks" ? `${tr(blockRegistry.find((item) => item.id === template)?.title ?? "Templates")} · refy` : page === "docs" ? `${docPages[doc].label} · refy` : page === "ai" && aiTopic ? `${localizedAiPages[locale][aiTopic].label} · refy` : page === "collection" ? `${tr(collectionDefinitions.find((item) => item.id === collection)?.label ?? "")} · refy` : t(pageTitles[page]);
  }, [routing, page, component, template, doc, collection, aiTopic, locale]);
  useEffect(() => {
    if (initialMode !== undefined) update({ theme: initialMode });
  }, [initialMode]);
  const commands = [
    ...docTopics.map((topic) => ({id:`doc-${topic}`, label:docPages[topic].label, description:`Docs / ${docGroupLabel(locale, docPages[topic].group)}`, group:t({ pt: "Documentação", en: "Documentation", es: "Documentación" }), icon:Icons.code, keywords:docPages[topic].description, onSelect:() => openDoc(topic)})),
    ...[...destinations, ["playground", "Playground"] as [SitePage, string]].map(([id, label]) => ({
      id,
      label,
      group: t({ pt: "Páginas", en: "Pages", es: "Páginas" }),
      keywords: label,
      onSelect: () => navigate(id),
    })),
    {
      id: "typography",
      label: t({ pt: "Tipografia", en: "Typography", es: "Tipografía" }),
      group: t({ pt: "Temas", en: "Themes", es: "Temas" }),
      onSelect: () => navigate("typography"),
    },
    ...componentCatalog.map((item) => ({
      id: item.id,
      label: item.label,
      group: t({ pt: "Componentes", en: "Components", es: "Componentes" }),
      description: tr(item.level) + " · " + tr(componentAreas[item.area]),
      icon: areaIcons[item.area],
      // A descrição em português entra na busca: "tabela" acha Table, "botão" acha Button.
      keywords: componentAreas[item.area] + " " + describe(item.id) + " " + tr(componentAreas[item.area]) + " " + tr(describe(item.id)) + (["Accordion", "AppShell"].includes(item.id) ? " composição" : ""),
      onSelect: () => select(item.id),
    })),
    { id: "contribute", label: projectLabel(locale, "contribuir"), description: projectDescription(locale, "contribuir"), group: projectGroupLabel(locale), icon: Icons.projects, keywords: "contribuir contributing pull request contribuir", onSelect: () => navigate("contribute") },
    ...aiTopics.map((topic) => ({ id: `ai-${topic}`, label: localizedAiPages[locale][topic].label, description: localizedAiPages[locale][topic].description, group: t({ pt: "Para IAs", en: "For AI", es: "Para IAs" }), icon: Icons.code, keywords: `${topic} agente agent claude codex`, onSelect: () => navigate("ai", component, template, doc, collection, topic) })),
    {id:"agent-rules", label:t({ pt: "Regras de composição", en: "Composition rules", es: "Reglas de composición" }), description:t({ pt: "Contexto, componentes e contratos", en: "Context, components and contracts", es: "Contexto, componentes y contratos" }), group:t({ pt: "Para IAs", en: "For AI", es: "Para IAs" }), icon:Icons.code, keywords:"composição agente composition agent", onSelect:() => navigate("ai")},
    {id:"agent-recipes", label:t({ pt: "Receitas de composição", en: "Composition recipes", es: "Recetas de composición" }), description:t({ pt: "Padrões e exemplos práticos", en: "Patterns and practical examples", es: "Patrones y ejemplos prácticos" }), group:t({ pt: "Para IAs", en: "For AI", es: "Para IAs" }), icon:Icons.projects, keywords:"composição agente composition agent", onSelect:() => navigate("ai")},
  ];
  const navigation = <NavigationMenu
    items={destinations.map(([id,label]) => ({id,label}))}
    activeId={page === "accordion" || page === "charts" || page === "collection" ? "components" : page === "typography" ? "themes" : page}
    onNavigate={id => navigate(id as SitePage)}
  />;
  return (
    <SiteThemeContext.Provider value={theme}>
    <ThemeProvider theme={theme} mode={config.theme} data-refy-site-root="" className={styles.site + (page === "home" ? " " + styles.homeSite : "")}>
      <a href="#site-content" className={styles.skip}>
        {t({ pt: "Ir para conteúdo", en: "Skip to content", es: "Ir al contenido" })}
      </a>
      <header className={styles.siteHeader}>
        <button
          type="button"
          className={styles.brandLink}
          onClick={() => navigate("home")}
          aria-label={t({ pt: "Refy, início", en: "Refy, home", es: "Refy, inicio" })}
        >
          <SiteBrand />
        </button>
        <div className={styles.desktopNav}>{navigation}</div>
        <div className={styles.headerActions}>
          <span className={styles.desktopSearch}><Button
            appearance="field"
            aria-label={t({ pt: "Buscar páginas e componentes", en: "Search pages and components", es: "Buscar páginas y componentes" })}
            onClick={() => setSearch(true)}
            leadingIcon={Icons.search}
          >
            <span className={styles.searchContent}>
              <span className={styles.searchText}>{t({ pt: "Buscar…", en: "Search…", es: "Buscar…" })}</span>
              <span className={styles.searchShortcut}><Kbd>⌘ K</Kbd></span>
            </span>
          </Button></span>
          <span className={styles.mobileSearch}><IconButton variant="ghost" size="lg" aria-label={t({ pt: "Buscar páginas e componentes", en: "Search pages and components", es: "Buscar páginas y componentes" })} icon={Icons.search} onClick={() => setSearch(true)} /></span>
          <span className={styles.playgroundCta}>
            <Button
              variant="primary"
              href={pagePaths.playground}
              aria-current={page === "playground" ? "page" : undefined}
              onClick={(event) => { event.preventDefault(); navigate("playground"); }}
            >
              Playground
            </Button>
          </span>
          <div className={styles.modeSwitch}>
            <ModeControl mode={config.theme} onChange={theme => update({theme})} />
            {githubEnabled && <Divider orientation="vertical" />}
          </div>
          {githubEnabled && <span className={styles.github}><GitHubStars /></span>}
          <span className={styles.installCta}>
            <Button
              href={`${pagePaths.docs}/instalacao`}
              aria-current={page === "docs" && doc === "instalacao" ? "page" : undefined}
              onClick={(event) => { event.preventDefault(); openDoc("instalacao"); }}
              leadingIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>}
            >
              <span className={styles.installText}>{t({ pt: "Instalar", en: "Install", es: "Instalar" })}</span>
            </Button>
          </span>
          <span className={styles.language}><LanguageControl /></span>
          <span className={styles.mobileMenu}>
            <IconButton
              aria-label={t({ pt: "Abrir navegação", en: "Open navigation", es: "Abrir navegación" })}
              variant="ghost"
              size="lg"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              }
              onClick={() => setMenu(true)}
            />
          </span>
        </div>
      </header>
      <div ref={preview} className={styles.pageBody}>
        {page === "home" && (
          <Home navigate={navigate} config={config} update={update} />
        )}
        {page === "docs" && <DocsPage topic={doc} onLink={go} />}
        {page === "components" && <ComponentCatalog select={select} openCollection={openCollection} openCharts={() => select("Charts")} />}
        {page === "collection" && <CollectionPage id={collection} select={select} openCollection={openCollection} openCharts={() => select("Charts")} onCatalog={() => navigate("components")} />}
        {page === "accordion" && (
          <AccordionPage
            navigate={navigate}
            select={select}
            component={component}
            onCustomize={() => openComponent(component)}
          />
        )}
        {page === "blocks" && (
          <div id="site-content">
            <BlocksPreview theme={theme} mode={config.theme} label="Templates" selectedId={template} onSelect={selectTemplate} onCustomize={openTemplate} />
          </div>
        )}
        {page === "playground" && (
          <div id="site-content">
            <Suspense fallback={<p role="status">{t({ pt: "Carregando Playground…", en: "Loading Playground…", es: "Cargando Playground…" })}</p>}>
              <CreationPlayground
                chromeMode={config.theme}
                selection={selection}
                onSelectionChange={(patch) => setSelection((current) => ({ ...current, ...patch }))}
              />
            </Suspense>
          </div>
        )}
        {page === "charts" && (
          <div id="site-content">
            <D3ChartCatalog />
          </div>
        )}
        {page === "ai" && (aiTopic ? <AiGuidePage topic={aiTopic} onLink={go} /> : <AIPage navigate={navigate} go={go} config={config} />)}
        {page === "themes" && (
          <div id="site-content">
            <Suspense fallback={<p role="status">{t({ pt: "Carregando Playground…", en: "Loading Playground…", es: "Cargando Playground…" })}</p>}>
              <CreationPlayground chromeMode={config.theme} initialView="theme" />
            </Suspense>
          </div>
        )}
        {page === "contribute" && <ProjectPage topic="contribuir" onLink={go} />}
        {page === "typography" && (
          <SiteTypography config={config} update={update} onBack={() => navigate("themes")} />
        )}
      </div>
      <SiteFooter
        className={styles.footer}
        externalIcon={false}
        brand={<SiteBrand />}
        tagline={<>{t({ pt: "Seu design, do seu jeito.", en: "Your design, your way.", es: "Tu diseño, a tu manera." })}<br />{t({ pt: "Construa UI extensíveis e com IA nativa.", en: "Build extensible UI with native AI.", es: "Construye UI extensibles y con IA nativa." })}</>}
        // Four columns, each named for where its links lead: what refy offers, how to use it, what agents use, and the open-source project.
        columns={[
          {
            title: t({ pt: "Produto", en: "Product", es: "Producto" }),
            links: (["components", "blocks", "themes", "playground"] as const).map((id) => ({
              label: t(footerPageLabels[id]),
              href: localePath(locale, pagePaths[id]),
              onClick: (event: { preventDefault: () => void }) => { event.preventDefault(); navigate(id); },
            })),
          },
          {
            title: t({ pt: "Documentação", en: "Documentation", es: "Documentación" }),
            links: footerDocs.map((topic) => ({
              label: docPages[topic].label,
              href: localePath(locale, `${pagePaths.docs}/${topic}`),
              onClick: (event: { preventDefault: () => void }) => { event.preventDefault(); openDoc(topic); },
            })),
          },
          {
            title: t(footerPageLabels.ai),
            links: aiNavLinks(locale).map(({ href, label }) => ({
              label,
              href: localePath(locale, href),
              onClick: (event: { preventDefault: () => void }) => { event.preventDefault(); go(href); },
            })),
          },
          // Contributing is a site page; repository links only once the public repository is live.
          {
            title: projectGroupLabel(locale),
            links: [
              { label: projectLabel(locale, "contribuir"), href: localePath(locale, pagePaths.contribute), onClick: (event: { preventDefault: () => void }) => { event.preventDefault(); navigate("contribute"); } },
              ...(githubEnabled ? projectLinks.map(([href, label]) => ({ label: t(label), href: `${githubUrl}${href}`, external: true })) : []),
            ],
          },
        ]}
        settings={<>
          <LanguageControl side="top" />
          <ModeControl mode={config.theme} onChange={theme => update({theme})} />
        </>}
        credits={<>{t({ pt: "Criado por", en: "Created by", es: "Creado por" })} <a href="https://github.com/viniciuscoimbra" target="_blank" rel="noreferrer">Vinícius Coimbra</a>.</>}
        legal={<>© 2026 refy · {t({ pt: "Licença MIT", en: "MIT License", es: "Licencia MIT" })} · <a href="https://refy.design">refy.design</a></>}
      />
      <Command
        width={760}
        open={search}
        onOpenChange={setSearch}
        items={commands}
        placeholder={t({ pt: "Buscar páginas e componentes…", en: "Search pages and components…", es: "Buscar páginas y componentes…" })}
        emptyMessage={t({ pt: "Nenhum resultado. Tente outro termo.", en: "No results. Try another term.", es: "Sin resultados. Prueba otro término." })}
      />
      <Drawer
        open={menu}
        onOpenChange={setMenu}
        side="full"
        title={<SiteBrand />}
        footer={<div className={styles.drawerSettings}><Segmented label={t({ pt: "Modo de cor", en: "Color mode", es: "Modo de color" })} value={config.theme} onChange={value => update({theme:value as ThemeMode})} options={[
          {value:"light",label:t({ pt: "Claro", en: "Light", es: "Claro" })},{value:"dark",label:t({ pt: "Escuro", en: "Dark", es: "Oscuro" })},{value:"system",label:t({ pt: "Sistema", en: "System", es: "Sistema" })},
        ]} /><LanguageControl side="top" /></div>}
      >
        <div className={styles.mobileNavigation}>
          <SettingsSubnav label={t({ pt: "Navegação principal", en: "Main navigation", es: "Navegación principal" })} activeHref={localePath(locale, pagePaths[page === "accordion" || page === "charts" || page === "collection" ? "components" : page === "typography" ? "themes" : page])} items={
            [...destinations, ["playground", "Playground"] as [SitePage, string], ["contribute", projectLabel(locale, "contribuir")] as [SitePage, string]].map(([id, label], index) => ({ href: localePath(locale, pagePaths[id]), label, icon: [Icons.code, Icons.projects, Icons.dashboard, Icons.monitor, Icons.code, Icons.settings, Icons.projects][index] }))
          } renderLink={(item,props) => <a {...props} onClick={event => {event.preventDefault();go(item.href);}} />} />
          <ComponentNav mobile selected={component} onSelect={select} />
        </div>
      </Drawer>
      <Drawer
        open={customize}
        onOpenChange={setCustomize}
        title={t({ pt: "Personalizar tema", en: "Customize theme", es: "Personalizar tema" })}
        width={460}
      >
        <ThemeEditor config={config} onChange={update} preview={preview} />
      </Drawer>
    </ThemeProvider>
    </SiteThemeContext.Provider>
  );
}
