import { Component, Suspense, lazy, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Callout, CodeBlock, DeviceFrame, Skeleton } from "../../index";
import { useResolvedMode } from "../../lib/ThemeProvider";
import { currentLocale, tr } from "../RefySitePage/i18n";
import nativeDocs from "../RefySitePage/nativeDocs.json";
import { mobileInstall } from "../RefySitePage/packageRelease";
import { useSiteTheme } from "../RefySitePage/platform";
import { DocumentationGuidance, Section } from "./AccordionDocumentation";
import type { MobileDocumentationProps } from "./MobileDocumentation";
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

/**
 * Família só da web: o exemplo da ficha num iframe de 390 px, para as media queries valerem como
 * num celular. O tema vem do site por mensagem, igual à prévia dos templates.
 */
function WebOnPhone({ id, story }: { id: string; story?: string }) {
  const theme = useSiteTheme();
  const mode = useResolvedMode();
  const holder = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = () => holder.current?.querySelector("iframe")?.contentWindow;
    const send = () => frame()?.postMessage({ type: "refy:block-theme", theme, mode }, window.location.origin);
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === "refy:block-ready" && event.source === frame()) send();
    };
    window.addEventListener("message", onMessage);
    send();
    return () => window.removeEventListener("message", onMessage);
  }, [theme, mode]);
  const src = `/block-preview.html?refy-component=${encodeURIComponent(id)}${story ? `&refy-story=${encodeURIComponent(story)}` : ""}&lang=${currentLocale()}`;
  return (
    <div id="mobile-preview" ref={holder} className={styles.mobilePreview}>
      <Callout tone="info" title={tr("Versão web no celular")}>
        {tr("Esta família ainda não existe em @refy-design/mobile. A prévia mostra a versão web na largura de um celular, 390 px.")}
      </Callout>
      <DeviceFrame
        variant="phone"
        src={src}
        frameTitle={`${id}, ${tr("versão web no celular")}`}
        viewport={{ width: 390, height: 720 }}
        caption={tr("Versão web em 390 px de largura.")}
        className={styles.mobileFrame}
      />
    </div>
  );
}

/** A ficha na aba Mobile: prévia no celular, orientações e, no pacote mobile, instalação, uso e props. */
export default function MobileBody({ id, story, usage, webProps }: MobileDocumentationProps) {
  const doc = docs[id];
  const theme = useSiteTheme();
  const mode = useResolvedMode();
  if (!doc)
    return (
      <>
        <WebOnPhone id={id} story={story} />
        <DocumentationGuidance usage={usage} keyboard={false} />
      </>
    );
  const describe = (name: string) => webProps.find((prop) => prop.name === name)?.description;
  return (
    <>
      <div id="mobile-preview" className={styles.mobilePreview}>
        {doc.section ? (
          <DeviceFrame variant="phone" viewport={{ width: 390, height: 560 }} caption={tr("Prévia com react-native-web: o mesmo código do app, no tema do site.")} className={styles.mobileFrame}>
            <PreviewBoundary>
              <Suspense fallback={<Skeleton height={480} />}>
                <NativePreview section={doc.section} theme={theme} mode={mode} />
              </Suspense>
            </PreviewBoundary>
          </DeviceFrame>
        ) : (
          <p className={styles.serviceNote}>{tr("Este componente ainda não aparece na galeria do pacote.")}</p>
        )}
      </div>
      <DocumentationGuidance usage={usage} keyboard={false} />
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

