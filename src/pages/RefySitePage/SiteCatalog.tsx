import { matchesCollectionSearch } from "../PlaygroundPage/collections";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Input, SettingsSubnav, TableOfContents } from "../../index";
import type { SettingsSubnavLinkProps } from "../../index";
import { Icons } from "../../_demo/icons";
import { componentCatalog, componentAreas } from "../PlaygroundPage/catalog";
import styles from "./RefySitePage.module.css";
import anaPhoto from "./assets/avatars/ana.jpg";
import liaPhoto from "./assets/avatars/lia.jpg";
import ruiPhoto from "./assets/avatars/rui.jpg";
import leoPhoto from "./assets/avatars/leo.jpg";
import type { ComponentAreaId } from "../PlaygroundPage/catalog";
import { useTr } from "./i18n";
import { searchFamilies, useFamilySearch } from "./familySearch";

// Peças do catálogo que o site usa em toda página (menu, busca, cabeçalho das Docs). As páginas
// do catálogo, da família e da coleção moram em SiteCatalogPages.tsx e só baixam quando abrem.

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
  const rankFamilies = useFamilySearch(query.trim() !== "");
  const matches = searchFamilies(componentCatalog, query, rankFamilies, (item) =>
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
// One-line descriptions come from each family's documentation file. The query gives this import its own
// module, so only the description lands in the main chunk; the full file (examples, about 1 MB in
// all) stays in the chunk ComponentDocumentation loads on demand.
export const familyDescriptions = import.meta.glob<string>("../PlaygroundPage/documentation/*.json", { eager: true, import: "description", query: "?description" });
export const describe = (id: string) => familyDescriptions[`../PlaygroundPage/documentation/${id}.json?description`] ?? "";
export const stroke = (children: ReactNode) => areaIcon(children);
// Rostos fictícios gerados por IA; origem em assets/avatars/AVATAR_CREDITS.md.
export const ana = { name: "Ana Lima", src: anaPhoto };
export const rui = { name: "Rui Costa", src: ruiPhoto };
export const lia = { name: "Lia Alves", src: liaPhoto };
export const leo = { name: "Leo Melo", src: leoPhoto };
export const people = [ana, rui, lia];
export const projectTeam = [rui, ana, leo];
