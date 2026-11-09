import { Component, Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { Callout, CodeBlock, DeviceFrame, Skeleton } from "../../index";
import { useResolvedMode } from "../../lib/ThemeProvider";
import { tr } from "../RefySitePage/i18n";
import nativeDocs from "../RefySitePage/nativeDocs.json";
import { mobileInstall } from "../RefySitePage/packageRelease";
import { useSiteTheme } from "../RefySitePage/platform";
import { Section } from "./AccordionDocumentation";
import styles from "./ComponentDocumentation.module.css";

// Carregado só na aba Mobile: os dados do pacote nativo e a prévia não pesam na ficha da web.
type NativeDoc = {
  byType: boolean;
  props: { name: string; type: string; required: boolean; onlyMobile: boolean }[];
  onlyWeb: string[];
  example: string | null;
  section: string | null;
};
const docs = nativeDocs as Record<string, NativeDoc>;

// Só a aba Mobile baixa o react-native-web e o pacote nativo.
const NativePreview = lazy(() => import("../RefySitePage/NativePreview"));

class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p className={styles.serviceNote}>{tr("A prévia não abriu neste navegador. O código abaixo é o mesmo do app.")}</p> : this.props.children;
  }
}

/** A ficha na aba Mobile: prévia real, instalação, uso e props de @refy-design/mobile. */
export default function MobileBody({ id, webProps }: { id: string; webProps: { name: string; description?: string }[] }) {
  const doc = docs[id];
  const theme = useSiteTheme();
  const mode = useResolvedMode();
  const describe = (name: string) => webProps.find((prop) => prop.name === name)?.description;
  return (
    <>
      {doc.section && (
        <div id="mobile-preview" className={styles.mobilePreview}>
          <DeviceFrame variant="phone" viewport={{ width: 390, height: 640 }} caption={tr("Prévia com react-native-web: o mesmo código do app, no tema do site.")}>
            <PreviewBoundary>
              <Suspense fallback={<Skeleton height={480} />}>
                <NativePreview section={doc.section} theme={theme} mode={mode} />
              </Suspense>
            </PreviewBoundary>
          </DeviceFrame>
        </div>
      )}
      <Section id="installation" title={tr("Instalação")}>
        <p>{tr("Num app Expo, instale o pacote e o react-native-svg:")}</p>
        <CodeBlock label="Terminal" language="bash" code={mobileInstall} wrap />
      </Section>
      <Section id="usage" title={tr("Uso")}>
        <CodeBlock label={tr("Importação")} language="tsx" code={`import { RefyProvider, ${id} } from "@refy-design/mobile";`} wrap />
        {doc.example ? (
          <>
            <p>{tr("Trecho da galeria do pacote, dentro de um RefyProvider:")}</p>
            <div className={styles.usageCode}>
              <CodeBlock label="Gallery.tsx" language="tsx" code={doc.example} />
            </div>
          </>
        ) : (
          <p>{tr("Este componente ainda não aparece na galeria do pacote.")}</p>
        )}
      </Section>
      <Section id="api-reference" title={tr("Referência da API")}>
        <p>{tr("Propriedades do tipo público em @refy-design/mobile. As de View, Text e Pressable também são aceitas.")}</p>
        {doc.byType && <Callout tone="info" title={tr("Propriedades por tipo")}>{tr("As propriedades mudam conforme o valor de type. A tabela junta todas as variantes.")}</Callout>}
        <div className={styles.apiGroup}>
          <div className={styles.tableScroll}>
            <table>
              <caption>{tr("Propriedades de")} {id} (mobile)</caption>
              <thead>
                <tr>
                  <th>{tr("Propriedade")}</th>
                  <th>{tr("Tipo")}</th>
                  <th>{tr("Uso")}</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((prop) => (
                  <tr key={prop.name}>
                    <td>
                      <code>{prop.name}</code>
                      {prop.required && <span className={styles.required}>{tr("Obrigatória")}</span>}
                      {prop.onlyMobile && <span className={styles.required}>{tr("Só mobile")}</span>}
                    </td>
                    <td>
                      <code>{prop.type}</code>
                    </td>
                    <td>{tr(describe(prop.name) || (prop.required ? "Informe esta propriedade." : "Opcional."))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {doc.onlyWeb.length > 0 && (
          <p>
            {tr("Só web:")} {doc.onlyWeb.map((name, index) => <span key={name}>{index ? ", " : ""}<code>{name}</code></span>)}.
          </p>
        )}
      </Section>
    </>
  );
}

