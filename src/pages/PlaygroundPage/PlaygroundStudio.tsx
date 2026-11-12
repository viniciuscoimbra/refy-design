import { tr } from "../RefySitePage/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, CodeBlock, Drawer, Input, Segmented, Select, SettingsSubnav, Switch, ThemeProvider } from "../../index";
import type { RefyTheme, ThemeMode } from "../../lib/ThemeProvider";
import type { FontSet } from "../../lib/fontSets";
import { Icons } from "../../_demo/icons";
import { componentCatalog } from "./catalog";
import { searchFamilies, useFamilySearch } from "../RefySitePage/familySearch";
import { normalizeSearchText } from "./collections";
import { PreviewFrame } from "./PreviewFrame";
import { ThemeEditor } from "./ThemeEditor";
import { changeConfig, defaultConfig, resolveTheme, usePreviewConfig } from "./themeConfig";
import type { PlaygroundConfig, Skin } from "./themeConfig";
import { downloadThemeFile } from "./themeFile";
import { typographyNames, typographyTheme } from "./typographySample";
import { hasStory, jsxSample, loadComponentTokens, loadExampleCode, loadStudioSource, plainArgs } from "./studioSources";
import type { StudioControl } from "./studioSources";
import styles from "./PlaygroundStudio.module.css";

/**
 * The Playground: one component working in a real viewport, a compact picker, and a panel that
 * customizes the component (props from its story) and the theme tokens it reads.
 */
const levels = ["Átomos", "Moléculas", "Organismos"] as const;
const singular: Record<string, string> = { "Átomos": "Átomo", "Moléculas": "Molécula", "Organismos": "Organismo" };
const widths = { desktop: "100%", tablet: "768px", mobile: "390px" } as const;
const chromeTheme = resolveTheme(defaultConfig);
const isColor = (value: string) => /^(#|rgb|hsl|oklch|color-mix)/i.test(value.trim());
type Sheet = "closed" | "half" | "full";

function usePhone() {
  const query = "(max-width: 760px)";
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const change = () => setPhone(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return phone;
}

export function PlaygroundStudio({
  initialComponent = "Button",
  chromeMode = "light",
  initialSheet = "closed",
  onComponentChange,
  skin,
}: {
  initialComponent?: string;
  chromeMode?: ThemeMode;
  initialSheet?: Sheet;
  /** Called when the person picks another component, so the page can keep it in its address. */
  onComponentChange?: (id: string) => void;
  /** Theme chosen on the page around the Playground; the preview starts from it. */
  skin?: Skin;
}) {
  // On a phone the properties live in a bottom sheet that never covers the component: closed, half or full.
  const phone = usePhone();
  const [sheet, setSheet] = useState<Sheet>(initialSheet);
  const [config, setConfig] = usePreviewConfig(skin, chromeMode);
  const update = (patch: Partial<PlaygroundConfig>) => setConfig((current) => changeConfig(current, patch));
  const [componentId, setComponentId] = useState(initialComponent);
  // A link from a component's page ("Open in Playground") arrives as a new initial component.
  useEffect(() => setComponentId(initialComponent), [initialComponent]);
  const [query, setQuery] = useState("");
  const [viewport, setViewport] = useState<keyof typeof widths>("desktop");
  const [panel, setPanel] = useState("component");
  const [controls, setControls] = useState<StudioControl[]>([]);
  const [examples, setExamples] = useState<{ id: string; label: string }[]>([]);
  const [example, setExample] = useState<string>();
  const [ownState, setOwnState] = useState(false);
  const [exampleCode, setExampleCode] = useState<string>();
  const [args, setArgs] = useState<Record<string, string | number | boolean>>({});
  const [tokens, setTokens] = useState<{ hooks: string[]; foundation: string[] }>({ hooks: [], foundation: [] });
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [fonts, setFonts] = useState<FontSet>(config.fonts);
  useEffect(() => {
    let alive = true;
    void Promise.all([loadStudioSource(componentId, example), loadComponentTokens(componentId)]).then(([source, read]) => {
      if (!alive) return;
      setExamples(source.examples);
      if (source.example !== example) setExample(source.example);
      setOwnState(Boolean(source.render));
      setExampleCode(undefined);
      if (source.render && source.example) void loadExampleCode(componentId, source.example).then((code) => alive && setExampleCode(code));
      setControls(source.controls);
      setArgs(plainArgs(source.args));
      setTokens(read);
    });
    return () => { alive = false; };
  }, [componentId, example]);

  const base = resolveTheme(config);
  const theme: RefyTheme = useMemo(() => {
    const typed = typographyTheme(base, fonts, String(base.tokens?.["--text-base"] ?? "16px"), String(base.tokens?.["--prose-leading"] ?? "1.6"));
    return {
      ...typed,
      tokens: { ...typed.tokens, ...overrides },
      modes: { light: { ...typed.modes?.light, ...overrides }, dark: { ...typed.modes?.dark, ...overrides } },
    };
  }, [config, fonts, overrides]); // eslint-disable-line react-hooks/exhaustive-deps

  // Current token values, read from an element wearing the preview theme.
  const probe = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!probe.current) return;
    const css = getComputedStyle(probe.current);
    setValues(Object.fromEntries([...tokens.hooks, ...tokens.foundation].map((name) => [name, css.getPropertyValue(name).trim()])));
  }, [theme, tokens]);

  const rankFamilies = useFamilySearch(query.trim() !== "");
  const matches = searchFamilies(componentCatalog, query, rankFamilies, (item) => normalizeSearchText(item.label).includes(normalizeSearchText(query.trim())));
  const groups = levels
    .map((level) => ({
      id: level,
      title: tr(level),
      items: matches
        .filter((item) => item.level === level && hasStory(item.id))
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((item) => ({ href: `#${item.id}`, label: item.label })),
    }))
    .filter((group) => group.items.length);
  const entry = componentCatalog.find((item) => item.id === componentId);
  const choose = (id: string) => {
    setComponentId(id);
    setExample(undefined);
    setOverrides({});
    onComponentChange?.(id);
  };
  const setArg = (name: string, value: string | number | boolean) => setArgs((current) => ({ ...current, [name]: value }));

  const control = (item: StudioControl) => {
    const value = args[item.name];
    if (item.kind === "boolean")
      return <Switch key={item.name} label={item.name} checked={Boolean(value)} onChange={(event) => setArg(item.name, event.target.checked)} />;
    if (item.kind === "options" && item.options!.length <= 4)
      return (
        <div key={item.name} className={styles.field}>
          <span>{item.name}</span>
          <Segmented
            label={item.name}
            value={String(value ?? item.options![0])}
            onChange={(next) => setArg(item.name, typeof item.options![0] === "number" ? Number(next) : next)}
            options={item.options!.map((option) => ({ value: String(option), label: String(option) }))}
          />
        </div>
      );
    if (item.kind === "options")
      return (
        <Select key={item.name} label={item.name} value={String(value ?? "")} onChange={(event) => setArg(item.name, event.target.value)}>
          {item.options!.map((option) => <option key={option} value={String(option)}>{option}</option>)}
        </Select>
      );
    return <Input key={item.name} label={item.name === "children" ? tr("Texto") : item.name} value={String(value ?? "")} onChange={(event) => setArg(item.name, event.target.value)} />;
  };
  const tokenRow = (name: string) => {
    const value = overrides[name] ?? values[name] ?? "";
    return (
      <label key={name} className={styles.token}>
        <code>{name}</code>
        <span className={styles.tokenValue}>
          {isColor(value) && <span className={styles.swatch} style={{ background: value }} aria-hidden="true" />}
          <Input aria-label={name} value={value} placeholder={tr("padrão do componente")} onChange={(event) => setOverrides((current) => ({ ...current, [name]: event.target.value }))} />
        </span>
      </label>
    );
  };

  const exportTheme = () => downloadThemeFile({ ...config, customTheme: JSON.stringify(theme) });
  const panelBody = (
    <>
            <Segmented
              label={tr("Painel")}
              value={panel}
              onChange={setPanel}
              options={[
                { value: "component", label: tr("Componente") },
                { value: "theme", label: tr("Tema") },
                { value: "type", label: tr("Tipografia") },
              ]}
            />
            {panel === "component" && (
              <>
                <section className={styles.section}>
                  {!phone && <h2>{tr("Propriedades do")} {componentId}</h2>}
                  <p>{tr("Variantes, tamanhos e estados de")} {componentId}{tr(", lidos da documentação do componente.")}</p>
                  {examples.length > 1 && (
                    <Select label={tr("Exemplo")} value={example ?? ""} onChange={(event) => setExample(event.target.value)}>
                      {examples.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </Select>
                  )}
                  {ownState ? <p>{tr("Este exemplo controla o próprio estado: use a prévia para abrir e fechar.")}</p> : controls.map(control)}
                </section>
                <section className={styles.section}>
                  <h2>{tr("Tokens do")} {componentId}</h2>
                  <p>{tr("Mudam só a prévia. Entram no arquivo de tema exportado.")}</p>
                  {tokens.hooks.length > 0 && <h3>{tr("Do componente")}</h3>}
                  {tokens.hooks.map(tokenRow)}
                  {tokens.foundation.length > 0 && <h3>{tr("Da fundação")}</h3>}
                  {tokens.foundation.slice(0, 10).map(tokenRow)}
                </section>
              </>
            )}
            {panel === "theme" && <ThemeEditor config={config} onChange={update} preview={probe} variant="site" />}
            {panel === "type" && (
              <section className={styles.section}>
                <h2>{tr("Tipografia")}</h2>
                <Select label={tr("Conjunto tipográfico")} value={fonts} onChange={(event) => setFonts(event.target.value as FontSet)}>
                  {Object.entries(typographyNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </Select>
              </section>
            )}
      {phone && panel === "theme" && (
        <section className={styles.section}>
          <Segmented label={tr("Modo de cor da prévia")} value={config.theme} onChange={(value) => update({ theme: value as ThemeMode })} options={[{ value: "light", label: tr("Claro") }, { value: "dark", label: tr("Escuro") }]} />
          <Button variant="primary" onClick={exportTheme}>{tr("Exportar arquivo de tema")}</Button>
        </section>
      )}
      {phone && panel === "component" && (
        <section className={styles.section}>
          <h2>{tr("Código")}</h2>
          <CodeBlock label={`${componentId}.tsx`} language="tsx" code={ownState && exampleCode ? exampleCode : jsxSample(componentId, args)} />
        </section>
      )}
    </>
  );
  // The Drawer draws its own grab bar but has no detents or drag: a button switches half and full.
  const sizeToggle = (
    <div className={styles.sheetTop}>
      <Button size="sm" variant="ghost" aria-expanded={sheet === "full"} onClick={() => setSheet(sheet === "full" ? "half" : "full")}>
        {sheet === "full" ? tr("Ver menos ↓") : tr("Ver mais ↑")}
      </Button>
    </div>
  );

  return (
    <ThemeProvider isolate theme={chromeTheme} mode={chromeMode} className={styles.studio} data-testid="playground-studio">
      <ThemeProvider isolate theme={theme} mode={config.theme} hidden aria-hidden="true"><div ref={probe} /></ThemeProvider>
      <header className={styles.bar}>
        <div className={styles.title}>
          <strong>{tr("Playground")}</strong>
          <span>{entry ? `${entry.label} · ${tr(singular[entry.level] ?? entry.level)}` : componentId}</span>
        </div>
        <Select aria-label={tr("Componente")} className={styles.mobilePicker} value={componentId} onChange={(event) => choose(event.target.value)}>
          {groups.map((group) => (
            <optgroup key={group.id} label={group.title}>
              {group.items.map((item) => <option key={item.href} value={item.href.slice(1)}>{item.label}</option>)}
            </optgroup>
          ))}
        </Select>
        <span className={styles.viewportSwitch}><Segmented
          iconOnly
          label={tr("Largura da prévia")}
          value={viewport}
          onChange={(value) => setViewport(value as keyof typeof widths)}
          options={[
            { value: "desktop", label: tr("Desktop"), icon: Icons.desktop },
            { value: "tablet", label: tr("Tablet"), icon: Icons.tablet },
            { value: "mobile", label: "Mobile", icon: Icons.phone },
          ]}
        /></span>
        <span className={styles.desktopOnly}><Segmented
          label={tr("Modo de cor da prévia")}
          value={config.theme}
          onChange={(value) => update({ theme: value as ThemeMode })}
          options={[{ value: "light", label: tr("Claro") }, { value: "dark", label: tr("Escuro") }]}
        /></span>
        <span className={styles.desktopOnly}><Button variant="primary" onClick={exportTheme}>{tr("Exportar arquivo de tema")}</Button></span>
      </header>
      <div className={styles.layout} data-sheet={phone ? sheet : undefined}>
        <aside className={styles.picker} aria-label={tr("Escolher componente")}>
          <Input aria-label={tr("Buscar componente")} placeholder={tr("Buscar componente…")} prefix={Icons.search} value={query} onChange={(event) => setQuery(event.target.value)} />
          <SettingsSubnav
            label={tr("Componentes por camada")}
            activeHref={`#${componentId}`}
            groups={groups}
            renderLink={(item, props) => <a {...props} onClick={(event) => { event.preventDefault(); choose(item.href.slice(1)); }} />}
          />
        </aside>
        <main className={styles.stage}>
          <PreviewFrame state={{ view: "component", theme, mode: config.theme, componentId, example, args }} width={widths[viewport]} />
        </main>
        {!phone && (
          <section className={styles.code} aria-label={`${tr("Código de")} ${componentId}`}>
            <CodeBlock label={`${componentId}.tsx`} language="tsx" code={ownState && exampleCode ? exampleCode : jsxSample(componentId, args)} />
          </section>
        )}
        {!phone && (
          <aside className={styles.panel} aria-label={tr("Personalizar")}>
            {panelBody}
          </aside>
        )}
      </div>
      {phone && sheet === "closed" && (
        <div className={styles.sheetBar}>
          <Button block variant="secondary" aria-expanded={false} onClick={() => setSheet("half")}>
            {tr("Propriedades do")} {componentId} ↑
          </Button>
        </div>
      )}
      {phone && (
        <Drawer
          side="bottom"
          modal={false}
          open={sheet !== "closed"}
          onOpenChange={(open) => setSheet(open ? "half" : "closed")}
          title={`${tr("Propriedades do")} ${componentId}`}
        >
          <div className={styles.sheet} data-size={sheet} aria-label={tr("Personalizar")}>
            {sizeToggle}
            {panelBody}
          </div>
        </Drawer>
      )}
    </ThemeProvider>
  );
}
