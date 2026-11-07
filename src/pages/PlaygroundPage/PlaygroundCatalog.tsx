import { tr } from "../RefySitePage/i18n";
import { useEffect, useState } from "react";
import { Button } from "../../index";
import { AccordionPage, ComponentCatalog } from "../RefySitePage/SiteCatalog";
import { componentCatalog } from "./catalog";
import styles from "./Workbench.module.css";

const isComponentId = (id: unknown): id is string =>
  typeof id === "string" && componentCatalog.some((entry) => entry.id === id);

// Deep links still open a family (?component=Button or #component=Button); the Playground never writes the URL.
const linkedComponent = () => {
  if (typeof window === "undefined") return undefined;
  const id =
    new URLSearchParams(window.location.search).get("component") ??
    new URLSearchParams(window.location.hash.slice(1)).get("component");
  return isComponentId(id) ? id : undefined;
};

/**
 * The site's component catalog and family page, inside the Playground preview.
 * No family selected shows the catalog grid; a selected family shows its page.
 */
export function PlaygroundCatalog({
  selectedId,
  onSelect,
  onCustomize,
}: {
  selectedId?: string;
  onSelect?: (id: string) => void;
  onCustomize?: (id: string) => void;
}) {
  const controlled = isComponentId(selectedId) ? selectedId : undefined;
  const [family, setFamily] = useState<string | undefined>(() => controlled ?? linkedComponent());
  useEffect(() => {
    if (controlled) setFamily(controlled);
  }, [controlled]);
  useEffect(() => {
    const follow = () => {
      const id = linkedComponent();
      if (id) setFamily(id);
    };
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, []);
  const select = (id: string) => {
    if (!isComponentId(id)) return;
    setFamily(id);
    onSelect?.(id);
  };
  if (!family) return <ComponentCatalog embedded select={select} />;
  return (
    <div className={styles.catalogFamily}>
      <Button variant="ghost" size="sm" onClick={() => setFamily(undefined)}>
        {tr("← Todos os componentes")}</Button>
      <AccordionPage
        embedded
        component={family}
        select={select}
        onCustomize={() => onCustomize?.(family)}
      />
    </div>
  );
}
