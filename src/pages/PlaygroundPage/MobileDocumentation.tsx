import { Suspense, lazy } from "react";
import { Segmented, Skeleton, TableOfContents } from "../../index";
import { tr } from "../RefySitePage/i18n";
import nativeComponents from "../RefySitePage/nativeComponents.json";
import { mobilePublished } from "../RefySitePage/packageRelease";
import { setPlatform, usePlatform } from "../RefySitePage/platform";
import type { DocumentationGuidanceData } from "./AccordionDocumentation";
import styles from "./ComponentDocumentation.module.css";

/** O componente existe em @refy-design/mobile e o pacote já está no npm. */
export const hasMobile = (id: string) => mobilePublished && (nativeComponents as string[]).includes(id);

const MobileBody = lazy(() => import("./MobileBody"));

/**
 * Web | Mobile no topo da ficha, em todas as famílias. Na aba Mobile, quem existe em
 * @refy-design/mobile mostra o componente nativo; quem é só da web aparece na largura do celular.
 */
export function PlatformToggle({ id }: { id: string }) {
  const platform = usePlatform();
  return (
    <div className={styles.platform}>
      <Segmented
        label={tr("Plataforma")}
        value={platform}
        onChange={(value) => setPlatform(value as "web" | "mobile")}
        options={[{ value: "web", label: "Web" }, { value: "mobile", label: "Mobile" }]}
      />
      {!hasMobile(id) && <span className={styles.platformNote}>{tr("Só web")}</span>}
    </div>
  );
}

export const mobileSections = (id: string) => [
  { id: "mobile-preview", label: tr("Prévia") },
  { id: "guidance", label: tr("Orientações de uso") },
  ...(hasMobile(id)
    ? [
        { id: "installation", label: tr("Instalação") },
        { id: "usage", label: tr("Uso") },
        { id: "api-reference", label: tr("Referência da API") },
      ]
    : []),
];

export interface MobileDocumentationProps extends DocumentationGuidanceData {
  id: string;
  /** Exemplo da web mostrado no celular quando a família não existe no pacote mobile. */
  story?: string;
  webProps: { name: string; description?: string }[];
}

/** A ficha na aba Mobile: prévia no celular, orientações e, no pacote mobile, instalação, uso e props. */
export function MobileDocumentation(props: MobileDocumentationProps) {
  return (
    <Suspense fallback={<Skeleton height={480} />}>
      <MobileBody {...props} />
    </Suspense>
  );
}

export function MobileToc({ id }: { id: string }) {
  return <TableOfContents key={`${id}-mobile`} items={mobileSections(id)} label={tr("Nesta página")} />;
}
