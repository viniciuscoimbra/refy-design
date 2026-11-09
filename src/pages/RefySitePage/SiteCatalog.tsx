import { collectionDefinitions, collectionLabels, matchesCollection, matchesCollectionSearch } from "../PlaygroundPage/collections";
import { Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Accordion,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  CodeBlock,
  Combobox,
  IconButton,
  Input,
  Select,
  SettingsSubnav,
  Skeleton,
  StatusDot,
  Tabs,
  Table,
  TableOfContents,
} from "../../index";
import type { SettingsSubnavLinkProps } from "../../index";
import { Icons } from "../../_demo/icons";
import { accordionItems as files } from "../../_demo/accordion";
import { componentCatalog, componentAreas } from "../PlaygroundPage/catalog";
import { ComponentDocumentation } from "../PlaygroundPage/ComponentDocumentation";
import { ComponentExample } from "../PlaygroundPage/ComponentArea";
import { DocumentationGuidance } from "../PlaygroundPage/AccordionDocumentation";
import { usage as accordionUsage } from "../PlaygroundPage/documentation/Accordion.json";
import styles from "./RefySitePage.module.css";
import type { SitePage } from "./RefySitePage";
import anaPhoto from "./assets/avatars/ana.jpg";
import liaPhoto from "./assets/avatars/lia.jpg";
import ruiPhoto from "./assets/avatars/rui.jpg";
import leoPhoto from "./assets/avatars/leo.jpg";
import type { ComponentAreaId } from "../PlaygroundPage/catalog";
import { useTr } from "./i18n";

// Component catalog and family pages, shared by the site and the Playground.

// One icon per catalog area, in the stroke of the demo icon set.
export const areaIcon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
export const areaIcons: Record<ComponentAreaId, ReactNode> = {
  actions: areaIcon(<><path d="m9 9 11 4-5 1.6L13.4 20z" /><path d="M5 3v3M3 5h3M8.5 4.5 7 6" /></>),
  forms: areaIcon(<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10v4" /></>),
  navigation: areaIcon(<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>),
  feedback: areaIcon(<><path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" /><path d="M12 8v3M12 14h.01" /></>),
  data: areaIcon(<><path d="M4 20h16" /><path d="M7 16v-5M12 16V6M17 16v-8" /></>),
  content: areaIcon(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>),
  structure: areaIcon(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>),
};
export const faqFor = (tr: (text: string) => string) => [
  {
    id: "what",
    title: tr("O que é o refy?"),
    content: (
      <p>{tr("Um design system de componentes prontos. Você combina os que existem pra criar os seus, troca o tema mudando só o arquivo de tokens, e os agentes de IA leem as regras e os exemplos de cada componente antes de montar a tela. Web responsiva e pacote nativo para apps.")}</p>
    ),
  },
  {
    id: "start",
    title: tr("Como começar?"),
    content: (
      <p>{tr("Instale o pacote pelo guia de instalação e envolva o app no ThemeProvider. Daí em diante, cada componente já sai com o tema.")}</p>
    ),
  },
  {
    id: "license",
    title: tr("Posso usar em projetos comerciais?"),
    content: (
      <p>{tr("Sim. A licença MIT permite uso comercial; mantenha o aviso de autoria e a licença junto do código.")}</p>
    ),
  },
  {
    id: "contribute",
    title: tr("Como contribuir?"),
    content: (
      <p>{tr("Descreva a mudança numa proposta OpenSpec e abra um pull request com os testes rodados. O passo a passo está no CONTRIBUTING.md.")}</p>
    ),
  },
];
export const accordionCodeFor = (_tr?: (text: string) => string) =>
  'import { Accordion } from "@refy-design/web";\n\nconst items = [\n  { id: "files", title: "How do I organize my files?",\n    content: <p>Create collections and group files by project.</p> },\n];\n\nexport function Example() {\n  return <Accordion items={items} defaultValue={["files"]} />;\n}';
export function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className={styles.heading}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <div className={styles.titleRow}>
        <h1>{title}</h1>
        {children}
      </div>
      <p>{description}</p>
    </header>
  );
}
export function Preview({ children, code }: { children: ReactNode; code: string }) {
  const tr = useTr();
  return (
    <Card padding="md" className={styles.previewFrame}>
      <Tabs
        items={[
          {
            id: "preview",
            label: tr("Prévia"),
            content: <div className={styles.preview}>{children}</div>,
          },
          {
            id: "code",
            label: tr("Código"),
            content: <CodeBlock language="tsx" code={code} />,
          },
        ]}
      />
    </Card>
  );
}
// "Nesta página" marks the section in view (scrollspy) through the library component.
export function Toc({ items }: { items: Array<[string, string]> }) {
  const tr = useTr();
  return (
    <aside className={styles.toc}>
      <TableOfContents items={items.map(([id, label]) => ({ id, label }))} label={tr("Nesta página")} />
    </aside>
  );
}
export function SideNav({ children, title }: { children: ReactNode; title: string }) {
  return (
    <aside className={styles.sidebar}>
      <strong>{title}</strong>
      {children}
    </aside>
  );
}
// Short purpose labels for the site; the Playground keeps the long area names.
export const purposeLabels: Record<ComponentAreaId, string> = {
  actions: "Ações",
  forms: "Formulários",
  navigation: "Navegação",
  feedback: "Feedback",
  data: "Dados",
  content: "Conteúdo",
  structure: "Estrutura",
};
export const levels = ["Átomos", "Moléculas", "Organismos"] as const;
export const levelSingular: Record<string, string> = { Átomos: "Átomo", Moléculas: "Molécula", Organismos: "Organismo" };
export const levelIcons: Record<string, ReactNode> = {
  all: areaIcon(<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>),
  Átomos: areaIcon(<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>),
  Moléculas: areaIcon(<><circle cx="12" cy="6" r="2.5" /><circle cx="6" cy="17" r="2.5" /><circle cx="18" cy="17" r="2.5" /><path d="m10.8 8.2-3.6 6.6M13.2 8.2l3.6 6.6M8.5 17h7" /></>),
  Organismos: areaIcon(<><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>),
};
// Endereço público de cada família; o site liga a barra de endereço, o Playground só usa o clique.
// Nome com hífen entre as palavras (VisitSchedulePicker vira visit-schedule-picker), igual nos três idiomas.
export const familySlug = (id: string) => id.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
export const familyHref = (id: string) => `/componentes/${familySlug(id)}`;
const familyFromHref = (href: string) => {
  const slug = href.split("/").pop() ?? "";
  return componentCatalog.find((item) => familySlug(item.id) === slug || item.id.toLowerCase() === slug)?.id ?? slug;
};
/** Camada de cada família com o ícone da camada, para ninguém precisar ler o rótulo pra distinguir. */
export function LevelBadge({ level }: { level: string }) {
  const tr = useTr();
  return <Badge tone="neutral" className={styles.levelBadge} data-level={level}><span className={styles.icon14}>{levelIcons[level]}</span>{tr(levelSingular[level])}</Badge>;
}
/** Prévia viva de qualquer família, renderizada só quando o cartão entra na tela. */
function FamilyThumb({ id }: { id: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = box.current;
    if (!element || visible) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);
  return (
    <div ref={box} className={styles.thumbStage}>
      {visible ? (
        <div className={styles.thumbScale}>
          <Suspense fallback={<Skeleton height={120} />}>
            <ComponentExample id={id} withDecorators={false} />
          </Suspense>
        </div>
      ) : <Skeleton height={120} />}
    </div>
  );
}
// Component pages: every family, grouped by Atomic Design layer (mock 04/10).
export function ComponentNav({
  selected,
  onSelect,
  mobile = false,
}: {
  selected: string;
  onSelect: (id: string) => void;
  mobile?: boolean;
}) {
  const [query, setQuery] = useState("");
  const tr = useTr();
  // Same catalog and collection registry as the Playground; no hand-written subset.
  const matches = componentCatalog.filter((item) =>
    matchesCollectionSearch(item.id, query, `${item.label} ${item.level} ${componentAreas[item.area]} ${tr(item.level)} ${tr(componentAreas[item.area])} ${tr(describe(item.id))}`),
  );
  const groups = levels
    .map((level) => ({
      id: level,
      title: tr(level),
      items: matches
        .filter((item) => item.level === level)
        .map((item) => ({ href: familyHref(item.id), label: item.label, icon: areaIcons[item.area] })),
    }))
    .filter((group) => group.items.length);
  const link = (item: { href: string }, props: SettingsSubnavLinkProps) => <a {...props} onClick={event => {event.preventDefault(); onSelect(familyFromHref(item.href));}} />;
  // A lista tem 122 famílias e rola sozinha: sem isto a família aberta ficava marcada fora da vista.
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = list.current;
    const current = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !current) return;
    const top = current.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - current.offsetHeight) box.scrollTop = top - box.clientHeight / 3;
  }, [selected]);
  return (
    <SideNav title={tr("Componentes")}>
      <Input
        aria-label={tr("Buscar componente na navegação")}
        placeholder={tr("Buscar componente…")}
        prefix={Icons.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className={styles.sideLinks} data-site-catalog-nav="" ref={list}>
        <SettingsSubnav
          label={mobile ? tr("Componentes por camada") : tr("Catálogo de componentes")}
          activeHref={familyHref(selected)}
          groups={groups}
          renderLink={link}
        />
        {!matches.length && <p role="status">{tr("Nenhum componente encontrado.")}</p>}
      </div>
    </SideNav>
  );
}
export interface CatalogFilter {
  level: string;
  area: string;
  collection: string;
}
// Catalog page: the side menu filters the grid (Explorar by layer, Por finalidade by area).
export function CatalogNav({ filter, onFilter, openCollection, openCharts }: { filter: CatalogFilter; onFilter: (patch: Partial<CatalogFilter>) => void; openCollection?: (id: string) => void; openCharts?: () => void }) {
  const tr = useTr();
  const active = filter.area !== "all" ? `#area=${filter.area}` : filter.collection !== "all" ? `#collection=${filter.collection}` : `#level=${filter.level}`;
  const link = (item: { href: string }, props: SettingsSubnavLinkProps) => <a {...props} onClick={event => {
    event.preventDefault();
    const [key, value] = item.href.slice(1).split("=");
    if (key === "charts" && openCharts) return openCharts();
    if (key === "collection" && openCollection) return openCollection(value);
    onFilter(key === "level" ? { level: value, area: "all", collection: "all" } : key === "area" ? { level: "all", area: value, collection: "all" } : { level: "all", area: "all", collection: value });
  }} />;
  return (
    <SideNav title={tr("Explorar")}>
      <div className={styles.sideLinks} data-site-catalog-nav="">
        <SettingsSubnav
          label={tr("Filtrar catálogo")}
          activeHref={active}
          renderLink={link}
          groups={[
            { title: tr("Explorar"), items: [
              { href: "#level=all", label: tr("Todos os componentes"), icon: levelIcons.all },
              ...levels.map((level) => ({ href: `#level=${level}`, label: tr(level), icon: levelIcons[level] })),
            ] },
            { title: tr("Por finalidade"), items: (Object.keys(purposeLabels) as ComponentAreaId[]).map((area) => ({ href: `#area=${area}`, label: tr(purposeLabels[area]), icon: areaIcons[area] })) },
            { title: tr("Coleções"), items: [
              ...collectionDefinitions.map((item) => ({ href: `#collection=${item.id}`, label: tr(item.label) })),
              ...(openCharts ? [{ href: "#charts=all", label: tr("Gráficos") }] : []),
            ] },
          ]}
        />
      </div>
    </SideNav>
  );
}
// One-line descriptions come from each family's documentation file. The query gives this import its own
// module, so only the description lands in the main chunk; the full file (examples, about 1 MB in
// all) stays in the chunk ComponentDocumentation loads on demand.
export const familyDescriptions = import.meta.glob<string>("../PlaygroundPage/documentation/*.json", { eager: true, import: "description", query: "?description" });
export const describe = (id: string) => familyDescriptions[`../PlaygroundPage/documentation/${id}.json?description`] ?? "";
export const stroke = (children: ReactNode) => areaIcon(children);
export const previewIcons = {
  heart: stroke(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
  pencil: stroke(<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13 7 4 4" /></>),
  trash: stroke(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /><path d="M10 11v6M14 11v6" /></>),
  more: stroke(<><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>),
  mail: stroke(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  arrow: stroke(<path d="M5 12h14m-5-5 5 5-5 5" />),
  close: stroke(<path d="M6 6l12 12M18 6 6 18" />),
  cube: stroke(<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>),
  calendar: stroke(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
};
// Rostos fictícios gerados por IA; origem em assets/avatars/AVATAR_CREDITS.md.
export const ana = { name: "Ana Lima", src: anaPhoto };
export const rui = { name: "Rui Costa", src: ruiPhoto };
export const lia = { name: "Lia Alves", src: liaPhoto };
export const leo = { name: "Leo Melo", src: leoPhoto };
export const people = [ana, rui, lia];
export const projectTeam = [rui, ana, leo];
export function catalogPreviews(tr: (text: string) => string): Record<string, ReactNode> {
  const faq = faqFor(tr);
  return {
    Button: (
      <div className={styles.stack}>
        <div className={styles.actions}>
          <Button variant="primary">{tr("Botão primário")}</Button>
          <Button>{tr("Botão")}</Button>
          <IconButton variant="outline" aria-label={tr("Favoritar")} icon={previewIcons.heart} />
        </div>
        <div className={styles.actions}>
          <IconButton variant="solid" aria-label={tr("Adicionar")} icon={Icons.plus} />
          <IconButton variant="outline" aria-label={tr("Editar")} icon={previewIcons.pencil} />
          <IconButton variant="outline" aria-label={tr("Excluir")} icon={previewIcons.trash} />
          <IconButton variant="outline" aria-label={tr("Mais ações")} icon={previewIcons.more} />
        </div>
      </div>
    ),
    Input: (
      <div className={styles.stack}>
        <Input label={tr("Nome")} defaultValue="Ana Silva" />
        <Input label="E-mail" placeholder={tr("voce@exemplo.com")} type="email" suffix={previewIcons.mail} />
      </div>
    ),
    Accordion: (
      <Accordion variant="joined" size="sm" items={[
        faq[0],
        faq[1],
        { id: "practices", title: tr("Boas práticas"), content: <p>{tr("Use títulos curtos e diretos.")}</p> },
      ]} />
    ),
    Combobox: (
      <Combobox
        label={tr("País")}
        placeholder={tr("Buscar país…")}
        defaultOpen
        defaultValue="br"
        options={[
          { value: "br", label: tr("Brasil"), lead: "🇧🇷" },
          { value: "ar", label: tr("Argentina"), lead: "🇦🇷" },
          { value: "mx", label: tr("México"), lead: "🇲🇽" },
        ]}
      />
    ),
    Card: (
      <Card>
        <CardHeader size="sm" icon={Icons.projects} title={tr("Plataforma")} description={tr("Biblioteca de componentes para produtos digitais.")} action={<IconButton aria-label={tr("Mais opções")} icon={previewIcons.more} />} />
        <div className={styles.tileCardFooter}>
          <AvatarGroup size="sm" max={3} items={[ana, rui, leo, lia, { name: "Bia Rocha" }, { name: "Caio Nunes" }]} />
          <Badge tone="success">{tr("Em andamento")}</Badge>
        </div>
      </Card>
    ),
    Table: (
      <Table
        caption={tr("Pessoas da equipe")}
        rowKey={(row) => row.name}
        minTableWidth={200}
        rows={[
          { name: "Ana Silva", status: tr("Ativo"), tone: "good" as const, role: tr("Admin") },
          { name: "Bruno Costa", status: tr("Pendente"), tone: "warn" as const, role: tr("Editor") },
          { name: "Carla Mendes", status: tr("Inativo"), tone: "neutral" as const, role: tr("Visualizador") },
        ] }
        columns={[
          { key: "name", header: tr("Nome"), cell: (row) => row.name },
          { key: "status", header: tr("Status"), cell: (row) => <StatusDot tone={row.tone}>{row.status}</StatusDot> },
          { key: "role", header: tr("Função"), cell: (row) => row.role },
        ]}
      />
    ),
    Tabs: (
      <Card>
        <Tabs items={["Visão geral", "Documentação", "Exemplos", "API"].map(tr).map((label, index) => ({
          id: String(index),
          label,
          content: <div className={styles.stack}><Skeleton height={12} /><Skeleton height={12} width="70%" /></div>,
        }))} />
      </Card>
    ),
    Avatar: <AvatarGroup size="lg" max={3} items={[...people, leo, { name: "Bia Rocha" }, { name: "Caio Nunes" }]} />,
    Modal: (
      <div className={styles.dialogBackdrop}>
        <Card>
          <CardHeader size="sm" title={tr("Confirmar ação")} description={tr("Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.")} action={<IconButton aria-label={tr("Fechar")} icon={previewIcons.close} variant="ghost" size="sm" />} />
          <div className={styles.dialogActions}>
            <Button size="sm">{tr("Cancelar")}</Button>
            <Button size="sm" variant="primary">{tr("Excluir")}</Button>
          </div>
        </Card>
      </div>
    ),
  };
}
export const preferred = ["Button", "Input", "Accordion", "Combobox", "Card", "Table", "Tabs", "Avatar", "Modal"];
// `embedded` renders inside another page's landmark (the Playground), without a second <main> or #site-content.
export function ComponentCatalog({ select, embedded = false, openCollection, openCharts }: { select: (id: string) => void; embedded?: boolean; /** No site, coleção abre a página da coleção; sem isto (Playground) ela filtra a grade. */ openCollection?: (id: string) => void; openCharts?: () => void }) {
  const Root = embedded ? "div" : "main";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CatalogFilter>({ level: "all", area: "all", collection: "all" });
  const [order, setOrder] = useState("featured");
  const tr = useTr();
  const onFilter = (patch: Partial<CatalogFilter>) => setFilter((current) => ({ ...current, ...patch }));
  const items = componentCatalog.filter(
    (item) =>
      (filter.level === "all" || item.level === filter.level) &&
      (filter.area === "all" || item.area === filter.area) &&
      matchesCollection(item.id, filter.collection) &&
      matchesCollectionSearch(item.id, query, `${item.label} ${componentAreas[item.area]} ${tr(componentAreas[item.area])} ${tr(describe(item.id))}`),
  );
  const rank = (id: string) => (preferred.indexOf(id) < 0 ? 99 : preferred.indexOf(id));
  const sorted = [...items].sort((a, b) =>
    order === "az" ? a.label.localeCompare(b.label) : order === "za" ? b.label.localeCompare(a.label) : rank(a.id) - rank(b.id),
  );
  const previews = catalogPreviews(tr);
  return (
    <Root id={embedded ? undefined : "site-content"} className={styles.catalogGrid}>
      <CatalogNav filter={filter} onFilter={onFilter} openCollection={openCollection} openCharts={openCharts} />
      <article className={styles.article}>
        <Heading
          eyebrow={tr("Catálogo")}
          title={tr("As peças do seu produto.")}
          description={tr("Encontre por função. Componha por camada.")}
        >
          <p className={styles.support} role="status">
            {items.length} {items.length === 1 ? tr("família") : tr("famílias")}
          </p>
        </Heading>
        <div className={styles.filters}>
          <Input
            aria-label={tr("Buscar no catálogo")}
            placeholder={tr("Buscar componente…")}
            prefix={Icons.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select aria-label={tr("Ordem")} value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="featured">{tr("Destaques")}</option>
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
          </Select>
        </div>
        <div className={styles.levelChips} role="group" aria-label={tr("Camada")}>
          {[["all", tr("Todas")] as const, ...levels.map((level) => [level, tr(level)] as const)].map(([value, label]) => (
            <Chip
              key={value}
              selected={filter.level === value}
              leadingIcon={<span className={styles.icon16}>{levelIcons[value]}</span>}
              count={componentCatalog.filter((item) => value === "all" || item.level === value).length}
              onClick={() => onFilter({ level: value, area: "all", collection: "all" })}
            >
              {label}
            </Chip>
          ))}
        </div>
        {(filter.area !== "all" || filter.collection !== "all") && (
          <p className={styles.activeFilter} role="status">
            {tr("Mostrando")} {tr(filter.area !== "all" ? purposeLabels[filter.area as ComponentAreaId] : collectionDefinitions.find((item) => item.id === filter.collection)?.label ?? "")}
            <Button size="sm" variant="ghost" onClick={() => onFilter({ area: "all", collection: "all" })}>{tr("Limpar filtro")}</Button>
          </p>
        )}
        <div className={styles.tiles}>
          {sorted.map((item) => (
            // Pointer users can click anywhere on the card; keyboard users use its button.
            <Card key={item.id} padding="none" className={styles.tile} onClick={() => select(item.id)}>
              {/* Thumbnail only: the whole card is one target that opens the page. Every family has one. */}
              <div className={styles.tilePreview} ref={(element) => element?.setAttribute("inert", "")}>{previews[item.id] ?? <FamilyThumb id={item.id} />}</div>
              <div className={styles.tileCaption}>
                <div>
                  <h2>{item.label} <LevelBadge level={item.level} /></h2>
                  <p>{tr(describe(item.id) || purposeLabels[item.area])}</p>
                </div>
                <IconButton
                  size="sm"
                  aria-label={tr("Ver") + " " + item.label}
                  icon={previewIcons.arrow}
                  onClick={() => select(item.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      </article>
    </Root>
  );
}
export function AccordionPage({
  navigate,
  select,
  component,
  onCustomize,
  embedded = false,
}: {
  /** Absent where there is no site to navigate (the Playground): the install link is hidden. */
  navigate?: (page: SitePage) => void;
  select: (id: string) => void;
  component: string;
  onCustomize: () => void;
  embedded?: boolean;
}) {
  const tr = useTr();
  const [copyState, setCopyState] = useState("");
  const accordionCode = accordionCodeFor(tr);
  const Root = embedded ? "div" : "main";
  return (
    <Root id={embedded ? undefined : "site-content"} className={styles.docGrid}>
      <ComponentNav selected={component} onSelect={select} />
      {component !== "Accordion" ? (
        <ComponentDocumentation id={component} onCustomize={onCustomize} onSelect={select} />
      ) : (
        <>
          <article className={styles.article}>
            <Heading
              eyebrow={`${tr("Componentes")} / ${tr("Moléculas")}`}
              title={tr("Accordion")}
              description={tr("Seções que revelam ou ocultam conteúdo.")}
            >
              <div className={styles.actions}><LevelBadge level={tr("Moléculas")} /><Button size="sm" variant="secondary" onClick={onCustomize}>{tr("Personalizar no Playground")}</Button><Button size="sm" variant="ghost" onClick={async () => { try { await navigator.clipboard.writeText(accordionCode); setCopyState("Exemplo copiado"); } catch { setCopyState("Use a cópia do bloco de código"); } }}>{tr(copyState || "Copiar exemplo")}</Button><span className={styles.srOnly} role="status">{copyState ? tr(copyState) : ""}</span></div>
            </Heading>
            <p className={styles.support}>{tr("Coleção")}: {collectionLabels("Accordion").map(tr).join(" · ")}</p>
            <section id="preview" className={styles.firstSection}>
              <Preview code={accordionCode}>
                <Accordion items={files.map((item) => ({ ...item, title: tr(item.title as string) }))} defaultValue={["files"]} />
              </Preview>
            </section>
            <section id="install">
              <h2>{tr("Instalação")}</h2>
              <div className={styles.installRow}><p>{tr("Adicione o pacote do refy ao seu projeto.")}</p>
              {navigate && <a href="#installation" onClick={event => { event.preventDefault(); navigate("docs"); }}>{tr("Ver guia de instalação →")}</a>}</div>
            </section>
            <section id="usage">
              <h2>{tr("Uso")}</h2>
              <CodeBlock language="tsx" code={'import { Accordion } from "@refy-design/web";\n\n<Accordion items={items} />'} />
            </section>
            <section id="composition">
              <h2>{tr("Composição")}</h2>
              <div className={styles.actions}>
                <Badge>{tr("Gatilho")}</Badge>
                <Badge>{tr("Conteúdo")}</Badge>
                <Badge>{tr("Estado")}</Badge>
              </div>
              <p>{tr("Use os títulos para identificar cada seção. O controle de expansão permanece no componente.")}</p>
            </section>
            <DocumentationGuidance usage={accordionUsage} />
            <section id="variants">
              <h2>{tr("Variantes")}</h2>
              <Preview code='<Accordion variant="plain" type="multiple" items={items} />'>
                <Accordion variant="plain" type="multiple" items={files.map((item) => ({ ...item, title: tr(item.title as string) }))} />
              </Preview>
            </section>
            <section id="api">
              <h2>API</h2>
              <CodeBlock
                language="tsx"
                code={
                  `// ${tr("Uma ou várias seções abertas")}\n<Accordion items={items} type="multiple" />\n\n// ${tr("Estado controlado")}\n<Accordion items={items} value={openIds} onChange={setOpenIds} />`
                }
              />
            </section>
            <section id="keyboard">
              <h2>{tr("Teclado")}</h2>
              <p>{tr("Tab percorre os títulos. Enter ou Espaço expande e recolhe a seção em foco.")}</p>
            </section>
          </article>
          <Toc
            items={([
              ["preview", "Prévia"],
              ["install", "Instalação"],
              ["usage", "Uso"],
              ["composition", "Composição"],
              ["guidance", "Orientações de uso"],
              ["variants", "Variantes"],
              ["api", "API"],
              ["keyboard", "Teclado"],
            ] as Array<[string, string]>).map(([id, label]) => [id, tr(label)])}
          />
        </>
      )}
    </Root>
  );
}

// Página de coleção: explica o domínio de produto que a coleção atende e mostra as famílias dela,
// separadas por camada. Camada, finalidade e coleção são os três eixos do catálogo.
export const collectionHref = (id: string) => `/componentes/colecoes/${id}`;
export function CollectionPage({ id, select, openCollection, openCharts, onCatalog }: { id: string; select: (id: string) => void; openCollection: (id: string) => void; openCharts: () => void; onCatalog: () => void }) {
  const collection = collectionDefinitions.find((item) => item.id === id) ?? collectionDefinitions[0];
  const members = componentCatalog.filter((item) => matchesCollection(item.id, collection.id));
  const tr = useTr();
  const previews = catalogPreviews(tr);
  return (
    <main id="site-content" className={styles.catalogGrid}>
      <CatalogNav filter={{ level: "all", area: "all", collection: collection.id }} onFilter={onCatalog} openCollection={openCollection} openCharts={openCharts} />
      <article className={styles.article}>
        <Heading eyebrow={`${tr("Componentes")} / ${tr("Coleções")}`} title={tr(collection.label)} description={tr(collection.description)}>
          <p className={styles.support}>{members.length} {members.length === 1 ? tr("família") : tr("famílias")}</p>
        </Heading>
        <section className={styles.axes} aria-label={tr("Como o catálogo se organiza")}>
          <div><strong><span className={styles.icon20}>{levelIcons.all}</span> {tr("Camada")}</strong><p>{tr("Diz o tamanho da peça: átomo, molécula ou organismo. Organismo é feito de moléculas, molécula é feita de átomos.")}</p></div>
          <div><strong><span className={styles.icon20}>{areaIcons.actions}</span> {tr("Finalidade")}</strong><p>{tr("Diz o trabalho que a peça faz na tela: ação, formulário, navegação, aviso, dado, conteúdo ou estrutura.")}</p></div>
          <div><strong><span className={styles.icon20}>{levelIcons.Organismos}</span> {tr("Coleção")}</strong><p>{tr("Diz o tipo de produto que pede a peça.")} {collection.kind === "core" ? tr("Core reúne o que qualquer interface usa.") : `${tr(collection.label)} ${tr("reúne o que um produto desse tipo precisa e o Core não cobre.")}`}</p></div>
        </section>
        {levels.map((level) => {
          const items = members.filter((item) => item.level === level);
          if (!items.length) return null;
          return (
            <section key={level} className={styles.collectionLevel}>
              <h2><span className={styles.icon22}>{levelIcons[level]}</span> {tr(level)}</h2>
              <div className={styles.tiles}>
                {items.map((item) => (
                  <Card key={item.id} padding="none" className={styles.tile} onClick={() => select(item.id)}>
                    <div className={styles.tilePreview} ref={(element) => element?.setAttribute("inert", "")}>{previews[item.id] ?? <FamilyThumb id={item.id} />}</div>
                    <div className={styles.tileCaption}>
                      <div>
                        <h3>{item.label} <LevelBadge level={item.level} /></h3>
                        <p>{tr(describe(item.id) || purposeLabels[item.area])}</p>
                      </div>
                      <IconButton size="sm" aria-label={tr("Ver") + " " + item.label} icon={previewIcons.arrow} onClick={() => select(item.id)} />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </article>
    </main>
  );
}
