import { tr } from "../RefySitePage/i18n";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, Card, Drawer, Modal, Segmented, Select, ThemeProvider } from "../../index";
import { Icons } from "../../_demo/icons";
import { ApplicationPreview } from "./ApplicationPreview";
import type { CreatedWorkspace } from "./ApplicationPreview";
import type { AccessIdentity, SetupConfiguration } from "../../index";
import type { ThemeMode } from "../../lib/ThemeProvider";
import type { FontSet } from "../../lib/fontSets";
import { BlocksPreview } from "./BlocksPreview";
import { ChartComparison } from "./ChartComparison";
import { D3ChartCatalog } from "./D3ChartCatalog";
import { AccessPreview, SetupPreview } from "./FlowPreviews";
import { PreviewFrame } from "./PreviewFrame";
import type { PreviewEvent } from "./PreviewFrame";
import { ThemeEditor } from "./ThemeEditor";
import { changeConfig, defaultConfig, resolveTheme } from "./themeConfig";
import type { PlaygroundConfig, Skin } from "./themeConfig";
import { downloadThemeFile } from "./themeFile";
import { typographyNames, typographyTheme } from "./typographySample";
import type { TypographySampleView } from "./typographySample";
import { skins } from "../../stories/skins";
import styles from "./Workbench.module.css";

export type PlaygroundView =
  | "theme"
  | "components"
  | "typography"
  // Views without a tab: kept for direct links, stories and regression fixtures. Templates live on
  // their own page now.
  | "blocks"
  | "application"
  | "access"
  | "setup"
  | "charts"
  | "chart-comparison"
  | "charts-d3"
  | "blog";
export interface PlaygroundSelection {
  view: PlaygroundView;
  componentId: string;
  blockId: string;
}
export type PlaygroundViewport = "desktop" | "tablet" | "mobile";
export const viewportWidths: Record<PlaygroundViewport, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

// The Playground page itself always wears the approved Refy theme; the chosen theme only exists inside the preview.
const chromeTheme = resolveTheme(defaultConfig);

export function PlaygroundPage({
  config,
  onChange,
  initialView = "components",
  componentPreview,
  selection,
  onSelectionChange,
  onStartDefault,
  chromeMode = "light",
}: {
  config: PlaygroundConfig;
  onChange: (patch: Partial<PlaygroundConfig>) => void;
  initialView?: PlaygroundView;
  componentPreview?: ReactNode;
  selection?: Partial<PlaygroundSelection>;
  onSelectionChange?: (patch: Partial<PlaygroundSelection>) => void;
  onStartDefault?: () => void;
  /** Kept for existing callers: the theme picker is always shown now. */
  showPresets?: boolean;
  /** Color mode of the page around the preview (the site's mode on refy.design). */
  chromeMode?: ThemeMode;
}) {
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1100px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1100px)");
    const update = () => setWide(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const [internalView, setInternalView] = useState<PlaygroundView>(initialView);
  const requested = selection?.view ?? internalView;
  const view: PlaygroundView = requested === "blog" ? "typography" : requested;
  const setView = (next: PlaygroundView) => {
    setInternalView(next);
    onSelectionChange?.({ view: next });
  };
  useEffect(() => setInternalView(initialView), [initialView]);
  const [viewport, setViewport] = useState<PlaygroundViewport>("desktop");
  const [editorOpen, setEditorOpen] = useState(false);
  const [identity, setIdentity] = useState<AccessIdentity>({ name: "Ana Lima", email: "ana@example.com" });
  const [createdSpace, setCreatedSpace] = useState<CreatedWorkspace>();
  const spaceCounter = useRef(0);
  const finishSetup = (configuration: SetupConfiguration) => {
    setCreatedSpace({ id: `local-${++spaceCounter.current}`, configuration });
    setView("application");
  };
  const enter = (next: AccessIdentity) => {
    setIdentity((previous) => (previous.email === next.email && next.name === "Pessoa Exemplo" ? previous : next));
    setView("application");
  };
  // ThemeEditor reads token values from an element wearing the chosen theme; the preview itself is in an iframe.
  const probe = useRef<HTMLDivElement>(null);
  const update = onChange;
  const theme = resolveTheme(config);

  const [fonts, setFonts] = useState<FontSet>(config.fonts);
  // The typography draft starts from the theme: a font set chosen in the editor replaces a stale draft.
  useEffect(() => setFonts(config.fonts), [config.fonts]);
  const [base, setBase] = useState(String(theme.tokens?.["--text-base"] ?? "16px"));
  const [leading, setLeading] = useState(String(theme.tokens?.["--prose-leading"] ?? "1.6"));
  const [sample, setSample] = useState<TypographySampleView>("article");
  const [applied, setApplied] = useState(false);
  const typeTheme = typographyTheme(theme, fonts, base, leading);

  const onFrameEvent = (event: PreviewEvent) => {
    if (event.name === "select") onSelectionChange?.({ componentId: event.id });
    if (event.name === "customize") setEditorOpen(true);
  };
  const width = viewportWidths[viewport];
  const legacy = !["theme", "components", "blocks", "typography"].includes(view) || (view === "components" && componentPreview);
  return (
    <ThemeProvider isolate theme={chromeTheme} mode={chromeMode} className={styles.workbench} data-testid="theme-workbench">
      <ThemeProvider isolate theme={theme} mode={config.theme} hidden aria-hidden="true">
        <div ref={probe} />
      </ThemeProvider>
      <header className={styles.toolbar} aria-label={tr("Editor de tema")}>
        <div className={styles.heading}>
          <strong>{tr("Playground")}</strong>
          <span>{config.customTheme ? tr("Tema personalizado") : tr("Crie o tema do seu produto")}</span>
        </div>
        <div className={styles.toolbarControls}>
          <Select
            label={tr("Tema da prévia")}
            value={config.customTheme ? "custom" : config.skin}
            onChange={(event) => {
              if (event.target.value !== "custom") update({ skin: event.target.value as Skin });
            }}
          >
            {Object.entries(skins).map(([id, preset]) => (
              <option key={id} value={id}>{preset.label}</option>
            ))}
            {config.customTheme && <option value="custom">{tr("Personalizado")}</option>}
          </Select>
          <Segmented
            label={tr("Modo de cor da prévia")}
            value={config.theme}
            onChange={(value) => update({ theme: value as ThemeMode })}
            options={[
              { value: "light", label: tr("Claro") },
              { value: "dark", label: tr("Escuro") },
            ]}
          />
          <Segmented
            iconOnly
            label={tr("Largura da prévia")}
            value={viewport}
            onChange={(value) => setViewport(value as PlaygroundViewport)}
            options={[
              { value: "desktop", label: tr("Desktop"), icon: Icons.desktop },
              { value: "tablet", label: tr("Tablet"), icon: Icons.tablet },
              { value: "mobile", label: tr("Celular"), icon: Icons.phone },
            ]}
          />
        </div>
        <div className={styles.toolbarActions}>
          {onStartDefault && (
            <Button variant="ghost" onClick={onStartDefault}>{tr("Começar do tema padrão")}</Button>
          )}
          <Button variant="secondary" onClick={() => downloadThemeFile(config)}>{tr("Exportar arquivo de tema")}</Button>
          <Button aria-haspopup="dialog" aria-expanded={editorOpen} onClick={() => setEditorOpen(true)}>
            {tr("Personalizar tema")}</Button>
        </div>
      </header>
      <nav className={styles.views} aria-label={tr("Visões do playground")}>
        <Segmented
          label={tr("Visão da prévia")}
          value={view}
          onChange={(value) => setView(value as PlaygroundView)}
          options={[
            { value: "theme", label: tr("Tema") },
            { value: "components", label: tr("Componentes") },
            { value: "typography", label: tr("Tipografia") },
          ]}
        />
        <span className={styles.caption}>{tr("Uma configuração para todas as visões")}</span>
      </nav>
      <div className={styles.workspace} data-editor-open={editorOpen && wide}>
        {view === "theme" && (
          <div className={styles.themeTab}>
            <PreviewFrame state={{ view: "theme", theme, mode: config.theme }} width={width} />
            <Card padding="sm" className={styles.themeTabEditor}>
              <ThemeEditor config={config} onChange={update} preview={probe} variant="site" />
            </Card>
          </div>
        )}
        {view === "components" && !componentPreview && (
          <div className={styles.frameTab}>
            <PreviewFrame
              state={{ view: "components", theme, mode: config.theme, componentId: selection?.componentId }}
              width={width}
              onEvent={onFrameEvent}
            />
          </div>
        )}
        {view === "blocks" && (
          <ThemeProvider isolate theme={theme} mode={config.theme} className={styles.preview} data-testid="playground">
            <BlocksPreview
              theme={theme}
              mode={config.theme}
              viewport={viewport}
              selectedId={selection?.blockId}
              onSelect={(blockId) => onSelectionChange?.({ blockId })}
              label={tr("Templates")}
            />
          </ThemeProvider>
        )}
        {view === "typography" && (
          <div className={styles.typographyTab}>
            <aside className={styles.typographyControls} aria-label={tr("Ajustes tipográficos")}>
              <Select label={tr("Conjunto tipográfico")} value={fonts} onChange={(event) => { setFonts(event.target.value as FontSet); setApplied(false); }}>
                {Object.entries(typographyNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </Select>
              <Select label={tr("Tamanho base")} value={base} onChange={(event) => { setBase(event.target.value); setApplied(false); }}>
                {[14, 16, 18, 20].map((size) => <option key={size} value={`${size}px`}>{size} px</option>)}
              </Select>
              <Select label={tr("Altura de linha")} value={leading} onChange={(event) => { setLeading(event.target.value); setApplied(false); }}>
                {[1.4, 1.5, 1.6, 1.8, 2].map((size) => <option key={size} value={String(size)}>{size}</option>)}
              </Select>
              <Segmented
                label={tr("Amostra tipográfica")}
                value={sample}
                onChange={(value) => setSample(value as TypographySampleView)}
                options={[
                  { value: "article", label: tr("Artigo") },
                  { value: "scale", label: tr("Escala") },
                  { value: "elements", label: tr("Elementos") },
                ]}
              />
              <Button variant="primary" onClick={() => { update({ fonts, customTheme: JSON.stringify(typeTheme) }); setApplied(true); }}>
                {tr("Aplicar ao tema")}</Button>
              {applied && <p role="status">{tr("Tipografia aplicada ao tema. Os valores acompanham a exportação.")}</p>}
            </aside>
            <PreviewFrame state={{ view: "typography", theme: typeTheme, mode: config.theme, fonts, sample }} width={width} />
          </div>
        )}
        {legacy && (
          <ThemeProvider isolate theme={theme} mode={config.theme} className={styles.preview} data-testid="playground">
            <div className={styles.previewInner}>
              {view === "application" && (
                <header className={styles.journeyIntro}>
                  <strong>{tr("Demonstração · Gestão de projetos")}</strong>
                  <span>{tr("Navegue entre visão geral, trabalho, biblioteca e configurações. As alterações ficam nesta sessão.")}</span>
                </header>
              )}
              {["charts", "charts-d3"].includes(view) && <D3ChartCatalog />}
              {view === "chart-comparison" && <ChartComparison theme={theme} onBack={() => setView("charts")} />}
              {view === "components" && componentPreview}
              <ApplicationPreview
                active={view === "application"}
                initialName={tr("Estúdio Aurora")}
                identity={identity}
                createdSpace={createdSpace}
                onComponents={() => setView("components")}
                onAccess={() => setView("access")}
              />
              {view === "access" && (
                <AccessPreview onEnter={enter} onSetup={(next) => { setIdentity(next); setView("setup"); }} />
              )}
              {view === "setup" && <SetupPreview onComplete={finishSetup} onCancel={() => setView("access")} />}
            </div>
          </ThemeProvider>
        )}
      </div>
      <Drawer
        modal={!wide}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        side="right"
        title={tr("Personalizar tema")}
        width={wide ? 420 : 560}
        footer={<Button onClick={() => setEditorOpen(false)}>{tr("Ver prévia")}</Button>}
      >
        <ThemeEditor config={config} onChange={update} preview={probe} />
      </Drawer>
    </ThemeProvider>
  );
}

/** The Playground with its own configuration: choosing a theme here never touches the page around it. */
export function StandalonePlayground({
  chromeMode = "light",
  ...props
}: Omit<Parameters<typeof PlaygroundPage>[0], "config" | "onChange">) {
  const [config, setConfig] = useState<PlaygroundConfig>({ ...defaultConfig, theme: chromeMode === "dark" ? "dark" : "light" });
  const [confirmDefault, setConfirmDefault] = useState(false);
  const startDefault = () => {
    setConfig((current) => ({ ...defaultConfig, theme: current.theme }));
    setConfirmDefault(false);
  };
  return (
    <>
      <PlaygroundPage
        {...props}
        chromeMode={chromeMode}
        config={config}
        onChange={(patch) => setConfig((current) => changeConfig(current, patch))}
        onStartDefault={() => (config.customTheme ? setConfirmDefault(true) : startDefault())}
      />
      <ThemeProvider isolate theme={chromeTheme} mode={chromeMode}>
        <Modal
          open={confirmDefault}
          onClose={() => setConfirmDefault(false)}
          title={tr("Começar uma nova personalização?")}
          footer={<><Button variant="secondary" onClick={() => setConfirmDefault(false)}>{tr("Cancelar")}</Button><Button variant="primary" onClick={startDefault}>{tr("Usar tema padrão")}</Button></>}
        >
          <p>{tr("A configuração atual será substituída pelo tema padrão do refy. Exporte seu tema antes se quiser guardar uma cópia.")}</p>
        </Modal>
      </ThemeProvider>
    </>
  );
}
