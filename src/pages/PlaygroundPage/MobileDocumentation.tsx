import { Suspense, lazy } from "react";
import { Segmented, Skeleton, TableOfContents } from "../../index";
import { tr } from "../RefySitePage/i18n";
import nativeComponents from "../RefySitePage/nativeComponents.json";
import { mobilePublished } from "../RefySitePage/packageRelease";
import { setPlatform, usePlatform } from "../RefySitePage/platform";
import styles from "./ComponentDocumentation.module.css";

/** O componente existe em @refy-design/mobile e o pacote já está no npm. */
export const hasMobile = (id: string) => mobilePublished && (nativeComponents as string[]).includes(id);

const MobileBody = lazy(() => import("./MobileBody"));

/** Web | Mobile no topo da ficha. Componente só da web fica com o seletor desligado. */
export function PlatformToggle({ id }: { id: string }) {
  const platform = usePlatform();
  const available = hasMobile(id);
  return (
    <div className={styles.platform}>
      <Segmented
        label={tr("Plataforma")}
        value={available ? platform : "web"}
        disabled={!available}
        onChange={(value) => setPlatform(value as "web" | "mobile")}
        options={[{ value: "web", label: "Web" }, { value: "mobile", label: "Mobile" }]}
      />
      {!available && <span className={styles.platformNote}>{tr("Só web")}</span>}
    </div>
  );
}

export const mobileSections = () => [
  { id: "installation", label: tr("Instalação") },
  { id: "usage", label: tr("Uso") },
  { id: "api-reference", label: tr("Referência da API") },
];

/** A ficha na aba Mobile: prévia real, instalação, uso e props de @refy-design/mobile. */
export function MobileDocumentation(props: { id: string; webProps: { name: string; description?: string }[] }) {
  return (
    <Suspense fallback={<Skeleton height={480} />}>
      <MobileBody {...props} />
    </Suspense>
  );
}

export function MobileToc({ id }: { id: string }) {
  return <TableOfContents key={`${id}-mobile`} items={mobileSections()} label={tr("Nesta página")} />;
}
