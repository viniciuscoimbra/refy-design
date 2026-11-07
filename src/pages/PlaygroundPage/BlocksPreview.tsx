import { tr, currentLocale } from "../RefySitePage/i18n";
import { componentCatalog } from "./catalog";
import { Icons } from "../../_demo/icons";
import { useEffect, useRef, useState } from "react";
import { Button, Chip, CodeBlock, Segmented, Input, Select } from "../../index";
import type { RefyTheme, ThemeMode } from "../../lib/ThemeProvider";
import { BlockViewport } from "./BlockViewport";
import {
  blockCategories,
  blockRegistry,
  type BlockEntry,
} from "./blockRegistry";
import catalog from "./ComponentDocumentation.module.css";
import styles from "./BlocksPreview.module.css";

const layerOrder = ["Organismos", "Moléculas", "Átomos"] as const;
/** A template is the layer above organisms: list what it is made of, one row per layer. */
function LayerList({ composition }: { composition: string }) {
  const names = composition.split("·").map((name) => name.trim()).filter(Boolean);
  const rows = layerOrder
    .map((level) => ({
      level,
      names: names.filter((name) => componentCatalog.find((item) => item.label === name || item.id === name)?.level === level),
    }))
    .filter((row) => row.names.length);
  if (!rows.length) return null;
  return (
    <dl className={styles.layers} aria-label={tr("Feito com")}>
      {rows.map((row) => (
        <div key={row.level}>
          <dt>{tr(row.level)}</dt>
          <dd>{row.names.join(" · ")}</dd>
        </div>
      ))}
    </dl>
  );
}
function BlockExample({
  block,
  theme,
  mode,
  viewport: fixedViewport,
}: {
  block: BlockEntry;
  /** Set by the Playground's width control; without it each template has its own. */
  viewport?: string;
  theme: RefyTheme;
  mode: ThemeMode;
}) {
  const [view, setView] = useState("preview"),
    [ownViewport, setViewport] = useState("desktop");
  const viewport = fixedViewport ?? ownViewport;
  const [file, setFile] = useState("page.tsx"),
    [revision, setRevision] = useState(0),
    [expanded, setExpanded] = useState(false);
  const files: Record<string, string> = block.files;
  return (
    <section
      className={styles.example}
      aria-label={`${tr("Template")}: ${block.id}`}
      id={`block-${block.id}`}
    >
      <header className={styles.heading}>
        <div>
          <h2>{block.title}</h2>
          <p>{block.description}</p>
          <LayerList composition={block.composition} />
        </div>
        <Segmented
          iconOnly
          label={`${tr("Exibir")} ${block.id}`}
          value={view}
          onChange={setView}
          options={[
            { value: "preview", label: tr("Prévia"), icon: Icons.monitor },
            { value: "code", label: tr("Código"), icon: Icons.code },
          ]}
        />
      </header>
      <div className={styles.box}>
        {view === "preview" ? (
          <>
            <div className={styles.controls}>
              {!fixedViewport && <Segmented
                iconOnly
                label={`Viewport ${block.id}`}
                value={viewport}
                onChange={setViewport}
                options={[
                  { value: "desktop", label: tr("Desktop"), icon: Icons.desktop },
                  { value: "tablet", label: tr("Tablet"), icon: Icons.tablet },
                  { value: "mobile", label: tr("Celular"), icon: Icons.phone },
                ]}
              />}
              <div className={styles.actions}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  {tr("Reiniciar")}</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-expanded={expanded}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? tr("Reduzir prévia") : tr("Expandir prévia")}
                </Button>
              </div>
            </div>
            <BlockViewport
              id={block.id}
              theme={theme}
              mode={mode}
              width={
                viewport === "mobile"
                  ? "375px"
                  : viewport === "tablet"
                    ? "768px"
                    : "100%"
              }
              expanded={expanded}
              revision={revision}
            />
          </>
        ) : (
          <div className={styles.source}>
            <nav aria-label={`${tr("Arquivos")} ${block.id}`}>
              <strong>{tr("Arquivos")}</strong>
              {Object.keys(files).map((name) => (
                <Button
                  key={name}
                  variant="ghost"
                  size="sm"
                  aria-current={file === name ? "true" : undefined}
                  onClick={() => setFile(name)}
                >
                  {name}
                </Button>
              ))}
            </nav>
            <div className={styles.code}>
              <CodeBlock
                label={file}
                language={
                  file.endsWith(".css")
                    ? "css"
                    : file.endsWith(".json")
                      ? "json"
                      : "tsx"
                }
                code={files[file]}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Live thumbnail: the real template in a 1440 × 900 document, scaled to the card. */
function TemplateThumbnail({ id, theme, mode }: { id: string; theme: RefyTheme; mode: ThemeMode }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const resize = new ResizeObserver(() => setScale(element.clientWidth / 1440));
    resize.observe(element);
    const seen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        seen.disconnect();
      }
    }, { rootMargin: "400px 0px" });
    seen.observe(element);
    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);
  useEffect(() => {
    const send = () => frame.current?.contentWindow?.postMessage({ type: "refy:block-theme", theme, mode }, window.location.origin);
    const ready = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === "refy:block-ready") send();
    };
    window.addEventListener("message", ready);
    const element = frame.current;
    element?.addEventListener("load", send);
    send();
    return () => {
      window.removeEventListener("message", ready);
      element?.removeEventListener("load", send);
    };
  }, [theme, mode, visible]);
  return (
    <div ref={box} className={styles.thumb} aria-hidden="true">
      {visible && scale > 0 && (
        <iframe
          ref={frame}
          title=""
          tabIndex={-1}
          src={`/block-preview.html?refy-block=${id}&lang=${currentLocale()}`}
          style={{ transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

// Abertura da vitrine: uma tela de cada finalidade com componente forte (mapa, conversa, mídia).
const highlights = ["area-01", "assistant-01", "playlist-01", "store-01", "board-01", "dashboard-01"];

function TemplateGallery({ theme, mode, onOpen }: { theme: RefyTheme; mode: ThemeMode; onOpen: (id: string) => void }) {
  const [category, setCategory] = useState("all");
  const groups = blockCategories
    .filter((item) => item.id !== "featured" && (category === "all" || item.id === category))
    .map((item) => ({ ...item, entries: blockRegistry.filter((block) => block.category === item.id) }))
    .filter((item) => item.entries.length);
  if (category === "all")
    groups.unshift({
      id: "featured",
      label: tr("Destaques"),
      entries: highlights.map((id) => blockRegistry.find((block) => block.id === id)!).filter(Boolean),
    });
  return (
    <div className={styles.showcase}>
      <div className={styles.filters} role="group" aria-label={tr("Filtrar por finalidade")}>
        <Chip selected={category === "all"} count={blockRegistry.length} onClick={() => setCategory("all")}>
          {tr("Todos")}</Chip>
        {blockCategories
          .filter((item) => item.id !== "featured")
          .map((item) => {
            const count = blockRegistry.filter((block) => block.category === item.id).length;
            return count ? (
              <Chip key={item.id} selected={category === item.id} count={count} onClick={() => setCategory(item.id)}>
                {item.label}
              </Chip>
            ) : null;
          })}
      </div>
      {groups.map((group) => (
        <section key={group.id} className={styles.group} aria-labelledby={`grupo-${group.id}`}>
          <h2 id={`grupo-${group.id}`}>{group.label}</h2>
          <ul className={styles.cards}>
            {group.entries.map((block) => (
              <li key={block.id} className={styles.card}>
                <TemplateThumbnail id={block.id} theme={theme} mode={mode} />
                <div className={styles.cardText}>
                  <h3>
                    <button type="button" data-block-target={block.id} onClick={() => onOpen(block.id)}>
                      {block.title}
                    </button>
                  </h3>
                  <p>{block.composition.split("·").slice(0, 3).join(" · ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export interface BlocksPreviewProps {
  theme: RefyTheme;
  mode: ThemeMode;
  selectedId?: string;
  onSelect?: (id: string) => void;
  onCustomize?: (id: string) => void;
  label?: string;
  /** Width of every template preview, driven by the Playground toolbar. */
  viewport?: string;
}

export function BlocksPreview({
  theme,
  mode,
  selectedId,
  onSelect,
  onCustomize,
  label = "Blocks",
  viewport,
}: BlocksPreviewProps) {
  const [internalSelected, setInternalSelected] = useState(blockRegistry[0].id);
  // An empty id opens the showcase of every template.
  const showcase = selectedId === "";
  const controlled = blockRegistry.some((item) => item.id === selectedId);
  const selected = controlled ? selectedId! : internalSelected;
  const itemLabel = label === "Templates" ? "template" : "block";
  const title = itemLabel === "template" ? tr("Templates") : label;
  const selectBlock = (id: string) => {
    if (id === "") {
      onSelect?.("");
      return;
    }
    if (!blockRegistry.some((item) => item.id === id)) return;
    if (!controlled) setInternalSelected(id);
    onSelect?.(id);
  };
  const [query, setQuery] = useState("");
  const block = blockRegistry.find((item) => item.id === selected)!;
  const items = blockRegistry.filter((item) =>
    `${item.id} ${item.title} ${item.description}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <main
      className={`${catalog.layout} ${catalog.catalogLayout}`}
      aria-label={`${title} ${tr("prontos")}`}
    >
      <aside className={catalog.sidebar}>
        <div className={catalog.navigationHead}>
          <strong>{title}</strong>
          <span>
            {blockRegistry.length} {tr("composições · variantes responsivas")}</span>
        </div>
        <Input
          label={tr(itemLabel === "template" ? "Buscar template" : "Buscar block")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tr("Login, painel, conteúdo…")}
        />
        <nav className={catalog.componentNav} aria-label={tr(itemLabel === "template" ? "Escolher template" : "Escolher block")}>
          {selectedId !== undefined && (
            <Button block variant="ghost" size="sm" aria-current={showcase ? "page" : undefined} onClick={() => selectBlock("")}>
              {tr("Todos os templates")}</Button>
          )}
          {blockCategories
            .filter((category) => category.id !== "featured")
            .map((category) => {
              const entries = items.filter(
                (item) => item.category === category.id,
              );
              return (
                entries.length > 0 && (
                  <section key={category.id}>
                    <h2>
                      {category.label}
                      <span>{entries.length}</span>
                    </h2>
                    {entries.map((item) => (
                      <Button
                        key={item.id}
                        data-block-target={item.id}
                        block
                        variant="ghost"
                        size="sm"
                        aria-current={!showcase && item.id === selected ? "page" : undefined}
                        onClick={() => selectBlock(item.id)}
                      >
                        {item.title}
                      </Button>
                    ))}
                  </section>
                )
              );
            })}
          {!items.length && <p role="status">{tr(itemLabel === "template" ? "Nenhum template encontrado." : "Nenhum block encontrado.")}</p>}
        </nav>
      </aside>
      <div className={catalog.mobileNavigation}>
        <Select
          label={itemLabel === "template" ? tr("Template") : tr("Block")}
          value={showcase ? "" : selected}
          onChange={(event) => selectBlock(event.target.value)}
        >
          {selectedId !== undefined && <option value="">{tr("Todos os templates")}</option>}
          {blockRegistry.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </Select>
      </div>
      {showcase ? (
        <div className={catalog.document}>
          <header className={catalog.docHeader}>
            <h1>{title}</h1>
            <p>
              {tr("Telas inteiras, cada uma pronta para uma finalidade e montada só com componentes do refy. Abra uma para mexer nela, trocar o tema e copiar o código.")}</p>
          </header>
          <TemplateGallery theme={theme} mode={mode} onOpen={selectBlock} />
        </div>
      ) : (
      <div className={catalog.document}>
        <header className={catalog.docHeader}>
          <span className={catalog.eyebrow}>
            {title} /{" "}
            {blockCategories.find((item) => item.id === block.category)?.label}
          </span>
          <h1>{title}</h1>
          <p>
            {tr("Escolha uma composição, experimente suas variações e copie o código real.")}</p>
          {onCustomize && (
            <Button onClick={() => onCustomize(block.id)}>
              {tr("Personalizar no Playground")}</Button>
          )}
        </header>
        <BlockExample key={block.id} block={block} theme={theme} mode={mode} viewport={viewport} />
      </div>
      )}
    </main>
  );
}
