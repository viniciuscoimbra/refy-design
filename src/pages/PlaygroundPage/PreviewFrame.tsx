import { tr, currentLocale } from "../RefySitePage/i18n";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { BrandLogo, ThemeProvider } from "../../index";
import type { RefyTheme, ThemeMode } from "../../lib/ThemeProvider";
import type { FontSet } from "../../lib/fontSets";
import { PlaygroundCatalog } from "./PlaygroundCatalog";
import { ThemeStudioPreview } from "./ThemeStudioPreview";
import { TypographySample } from "./typographySample";
import { loadStudioSource } from "./studioSources";
import type { StudioSource } from "./studioSources";
import type { TypographySampleView } from "./typographySample";

/**
 * Playground preview in a real document: the iframe width is the viewport width, so media queries,
 * dialogs and outside-click handlers behave as in a product. The chosen theme lives only inside it.
 * The frame reuses the /block-preview.html entry with ?refy-view=<view>.
 */
export type PreviewView = "theme" | "components" | "typography" | "component";
export interface PreviewState {
  view: PreviewView;
  theme: RefyTheme;
  mode: ThemeMode;
  componentId?: string;
  fonts?: FontSet;
  sample?: TypographySampleView;
  /** view "component": the chosen component's story args with the panel's changes on top. */
  args?: Record<string, string | number | boolean>;
  /** Which documentation example (exported story) the stage shows. */
  example?: string;
}
export type PreviewEvent = { name: "select"; id: string } | { name: "customize"; id: string };

const views: PreviewView[] = ["theme", "components", "typography", "component"];
const modes: ThemeMode[] = ["light", "dark", "system", "editorial"];

export function PreviewFrame({
  state,
  width,
  onEvent,
}: {
  state: PreviewState;
  width: string;
  onEvent?: (event: PreviewEvent) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [actualWidth, setActualWidth] = useState(0);
  const latest = useRef({ state, onEvent });
  latest.current = { state, onEvent };
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setActualWidth(Math.round(element.getBoundingClientRect().width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const send = () =>
      frame.current?.contentWindow?.postMessage({ type: "refy:view-state", state: latest.current.state }, window.location.origin);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "refy:view-ready") send();
      if (event.data?.type === "refy:view-event") latest.current.onEvent?.(event.data.event);
    };
    window.addEventListener("message", receive);
    send();
    return () => window.removeEventListener("message", receive);
  }, [state]);
  return (
    <div className="refy-preview-stage" style={stage}>
      <iframe
        ref={frame}
        title={tr("Prévia do tema")}
        data-testid="playground-frame"
        src={`/block-preview.html?refy-view=${state.view}&lang=${currentLocale()}`}
        style={{ ...frameStyle, width }}
      />
      <div style={caption} aria-live="polite">{actualWidth} px · viewport real</div>
    </div>
  );
}

const stage: CSSProperties = { display: "grid", justifyItems: "center", gap: 8, minWidth: 0 };
const frameStyle: CSSProperties = {
  display: "block",
  maxWidth: "100%",
  // A page can size the frame with --preview-height; the default fills the viewport.
  height: "var(--preview-height, calc(100vh - 220px))",
  minHeight: "var(--preview-min-height, 560px)",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-md)",
  background: "var(--bg)",
};
const caption: CSSProperties = { color: "var(--ink-3)", fontSize: "var(--text-sm)" };

/** Inside the frame: waits for the host's state, then renders the view in the chosen theme. */
export function PreviewDocument() {
  const [state, setState] = useState<PreviewState>();
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "refy:view-state") return;
      const next = event.data.state as PreviewState;
      if (!next || !views.includes(next.view) || typeof next.theme?.name !== "string" || !modes.includes(next.mode)) return;
      setState(next);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "refy:view-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  if (!state) return null;
  const emit = (event: PreviewEvent) => window.parent.postMessage({ type: "refy:view-event", event }, window.location.origin);
  return (
    <ThemeProvider theme={state.theme} mode={state.mode} style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink-1)" }} data-testid="playground">
      {state.view === "theme" && <ThemeStudioPreview brand={<BrandLogo symbol aria-label={tr("Refy")} />} />}
      {state.view === "components" && (
        <PlaygroundCatalog
          selectedId={state.componentId}
          onSelect={(id) => emit({ name: "select", id })}
          onCustomize={(id) => emit({ name: "customize", id })}
        />
      )}
      {state.view === "component" && state.componentId && <ComponentStage id={state.componentId} example={state.example} args={state.args ?? {}} />}
      {state.view === "typography" && (
        <div style={{ padding: "clamp(16px, 4vw, 44px)" }}>
          <TypographySample fonts={state.fonts ?? "humanist"} view={state.sample ?? "article"} />
        </div>
      )}
    </ThemeProvider>
  );
}

/** One component, live: interactive, in the frame's real viewport. */
function ComponentStage({ id, example, args }: { id: string; example?: string; args: Record<string, string | number | boolean> }) {
  const [source, setSource] = useState<StudioSource & { id: string; key?: string }>();
  useEffect(() => {
    let alive = true;
    void loadStudioSource(id, example).then((next) => alive && setSource({ ...next, id, key: example }));
    return () => { alive = false; };
  }, [id, example]);
  if (!source || source.id !== id || source.key !== example || !source.component) return null;
  const merged = { ...source.args, ...args };
  const Component = source.component;
  return (
    <div style={componentStage} data-studio-stage={id}>
      {source.render ? (
        <StoryRender key={`${id}-${source.example}`} render={source.render} args={merged} />
      ) : (
        <Component {...merged} {...("open" in merged ? { onClose: () => undefined } : {})} />
      )}
    </div>
  );
}
/** A story's own render runs as a component, so the hooks inside it keep their state. */
function StoryRender({ render, args }: { render: NonNullable<StudioSource["render"]>; args: Record<string, unknown> }) {
  return <>{render(args, { args })}</>;
}
const componentStage: CSSProperties = {
  display: "grid",
  placeItems: "center",
  minHeight: "100vh",
  padding: "clamp(16px, 5vw, 48px)",
  boxSizing: "border-box",
};
