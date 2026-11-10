import { tr } from "../RefySitePage/i18n";
import { MobileDocumentation, MobileToc, PlatformToggle } from "./MobileDocumentation";
import { syncPlatformUrl, usePlatform } from "../RefySitePage/platform";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Callout,
  CodeBlock,
  Skeleton,
  TableOfContents,
} from "../../index";
import { componentCatalog } from "./catalog";
import { ComponentExample } from "./ComponentArea";
import {
  Example,
  Installation,
  Section,
  DocumentationGuidance,
  type DocumentationGuidanceData,
} from "./AccordionDocumentation";
import styles from "./ComponentDocumentation.module.css";
import { collectionLabels } from "./collections";
import { demoLabel } from "../RefySitePage/demoText";
import { familySince, isNewerThanBaseline, missingIn, NotInVersion, propDeprecation, propSince, SinceBadge, useDocsVersion, VersionSelect } from "../RefySitePage/docsVersion";

// Marca de versão da propriedade: obsoleta (com a troca, na coluna de uso) e a versão em que chegou,
// quando chegou depois da primeira. Na versão escolhida em que ela ainda não existia, o aviso diz isso.
function PropVersion({ api, prop }: { api: string; prop: string }) {
  const version = useDocsVersion();
  const since = propSince(api, prop);
  const deprecation = propDeprecation(api, prop);
  return (
    <>
      {deprecation && <span className={styles.propMark}><Badge tone="warn">{tr("Obsoleta")}</Badge></span>}
      {isNewerThanBaseline(since) && (
        <span className={styles.propMark}>
          <Badge tone={missingIn(since, version) ? "warn" : "neutral"}>
            {missingIn(since, version) ? `${tr("Não existe na")} ${version}` : `${tr("Desde a")} ${since}`}
          </Badge>
        </span>
      )}
    </>
  );
}

const exampleLabel = (text: string) => {
  const site = tr(text);
  return site !== text ? site : demoLabel(text);
};

type Prop = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  deprecated?: { replacement?: string; note?: string };
};
type Api = { name: string; props: Prop[] };
type ExampleSource = {
  id: string;
  label: string;
  description: string;
  code: string;
};
export interface ComponentDocument extends DocumentationGuidanceData {
  id: string;
  publicName: string;
  collections: string[];
  description: string;
  selected: string;
  import: string;
  composition: string[];
  api: Api[];
  examples: ExampleSource[];
}
const sources = import.meta.glob<ComponentDocument>("./documentation/*.json", {
  import: "default",
});
const cache = new Map<string, ComponentDocument>();
const componentLevel = (name: string) =>
  componentCatalog.find((item) => item.label === name)?.level;
const externalLimits: Record<string, string> = {
  FileUpload:
    "A seleção e a prévia são locais. Envio, armazenamento e progresso real devem ser conectados pela aplicação.",
  GeoAreaPicker:
    "A seleção textual funciona sem mapa. Os exemplos de mapa exigem um provedor e sua chave configurada no consumidor; o Playground não fornece esse serviço.",
  GoogleButton:
    "A ação demonstra o callback da interface. Autenticação com Google deve ser implementada no projeto consumidor.",
  VoiceRecorder:
    "A UI emite callbacks e apresenta o estado recebido. A aplicação integra captura, permissão de microfone e transcrição; o exemplo é simulado, sem captura ou envio.",
  PostalCodeInput:
    "O exemplo usa uma consulta local de demonstração. A aplicação deve fornecer o provedor de CEP e tratar seus erros.",
  IntentComposer:
    "Sugestões e estados são demonstrativos. Transcrição e processamento por IA não são serviços fornecidos pelo componente.",
  BillingCard:
    "Métodos, cobranças e faturas deste exemplo são dados fictícios, sem transação financeira.",
  PlanCard:
    "A escolha altera somente o estado demonstrativo. Contratação e cobrança pertencem à aplicação.",
  ConnectorCard:
    "O estado de conexão é demonstrativo. OAuth e chamadas ao provedor pertencem ao consumidor.",
};
function needsLaunch(id: string, example: ExampleSource) {
  if (id === "GuidedTour") return true;
  return /\b(?:open|defaultOpen)\s*[:=]\s*(?:\{\s*)?true\b/.test(example.code);
}

export function ComponentDocumentation({
  id,
  onCustomize,
  onSelect,
}: {
  id: string;
  onCustomize?: () => void;
  onSelect?: (id: string) => void;
}) {
  const [loadedDoc, setDoc] = useState<ComponentDocument | undefined>(() =>
    cache.get(id),
  );
  const doc = loadedDoc?.id === id ? loadedDoc : cache.get(id);
  const [failed, setFailed] = useState<string>();
  const platform = usePlatform();
  const mobile = platform === "mobile";
  useEffect(() => syncPlatformUrl(true), [id, platform]);
  useEffect(() => {
    let current = true;
    setFailed(undefined);
    if (cache.has(id)) {
      setDoc(cache.get(id));
      return;
    }
    setDoc(undefined);
    sources[`./documentation/${id}.json`]()
      .then((value) => {
        cache.set(id, value);
        if (current) setDoc(value);
      })
      .catch(() => {
        if (current) setFailed(id);
      });
    return () => {
      current = false;
    };
  }, [id]);
  if (failed === id)
    return (
      <Callout tone="danger" title={tr("Não foi possível carregar a documentação")}>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          {tr("Recarregar")}</Button>
      </Callout>
    );
  if (!doc)
    return (
      <div className={styles.document} aria-label={tr("Carregando documentação")}>
        <Skeleton height={40} />
        <Skeleton height={260} />
      </div>
    );
  const entry = componentCatalog.find((item) => item.id === id)!;
  const primary = doc.examples.find((example) => example.id === doc.selected)!;
  const variants = doc.examples.filter(
    (example) => example.id !== doc.selected,
  );
  const wide =
    entry.level === "Organismos" ||
    [
      "CodeBlock",
      "DatePicker",
      "Calendar",
      "Range",
      "TableOfContents",
    ].includes(id);
  const sections = [
    { id: "installation", label: tr("Instalação") },
    { id: "usage", label: tr("Uso") },
    { id: "composition", label: tr("Composição") },
    { id: "guidance", label: tr("Orientações de uso") },
    ...variants.map((example) => ({
      id: `example-${example.id}`,
      label: exampleLabel(example.label),
    })),
    { id: "api-reference", label: tr("Referência da API") },
  ];
  const slots =
    doc.api
      .find((api) => api.name === doc.publicName)
      ?.props.filter((prop) => !prop.deprecated && /ReactNode|ReactElement/.test(prop.type)) ?? [];
  const composition = [
    `${doc.publicName} (${tr(entry.level).toLocaleLowerCase()})`,
    ...doc.composition.map(
      (name, index) =>
        `${index === doc.composition.length - 1 && !slots.length ? "└" : "├"}── ${name}${componentLevel(name) ? ` (${tr(componentLevel(name)!).toLocaleLowerCase()})` : ""}`,
    ),
    ...slots.map(
      (prop, index) =>
        `${index === slots.length - 1 ? "└" : "├"}── ${prop.name}: ${prop.type}`,
    ),
  ].join("\n");
  return (
    <>
      <article
        className={styles.document}
        data-documentation={id}
        aria-label={`${tr("Documentação de")} ${entry.label}`}
      >
        <header className={styles.docHeader}>
          <span className={styles.eyebrow}>{tr("Componentes")} / {tr(entry.level)}</span>
          <h1>{entry.label}</h1>
          <p>{tr(doc.description)}</p>
          <div className={styles.docMeta}>
            <span>{tr("Coleção:")} {collectionLabels(id).map((label) => tr(label)).join(" · ")}</span>
            <SinceBadge since={familySince(id)} />
            <VersionSelect compact />
            {onCustomize && (
              <Button variant="secondary" size="sm" onClick={onCustomize}>
                {tr("Personalizar no Playground")}</Button>
            )}
          </div>
          <PlatformToggle id={id} />
          <NotInVersion since={familySince(id)} />
        </header>
        {mobile ? <MobileDocumentation id={id} story={primary.id} usage={doc.usage} webProps={doc.api.find((api) => api.name === doc.publicName)?.props ?? []} /> : (<>
        <Example
          name={`${id}-${primary.id}`}
          code={primary.code}
          wide={wide}
          deferred={false}
        >
          <ComponentExample id={id} story={primary.id} />
        </Example>
        {externalLimits[id] && (
          <p className={styles.serviceNote}>{tr(externalLimits[id])}</p>
        )}
        <Section id="installation" title={tr("Instalação")}>
          <Installation />
        </Section>
        <Section id="usage" title={tr("Uso")}>
          <CodeBlock label={tr("Importação")} language="tsx" code={doc.import} />
          <p>
            {tr("Exemplo completo, com os dados e os eventos usados na demonstração.")}</p>
          <div className={styles.usageCode}>
            <CodeBlock
              label={`${entry.label}.example.tsx`}
              language="tsx"
              code={primary.code}
            />
          </div>
        </Section>

        <Section id="composition" title={tr("Composição")}>
          <p>
            {tr("Estrutura do componente e partes reutilizadas na implementação. Conteúdo e controles adicionais são compostos pelas propriedades da API.")}</p>
          <CodeBlock language="text" code={composition} />
          {doc.composition.length > 0 && (
            <div className={styles.relatedComponents}>
              {doc.composition.map((name) => {
                const related = componentCatalog.find(
                  (item) => item.label === name,
                );
                return (
                  related && (
                    <a key={name} href={`#component=${related.id}`} onClick={onSelect ? (event) => {
                      event.preventDefault();
                      onSelect(related.id);
                    } : undefined}>
                      {name} ↗
                    </a>
                  )
                );
              })}
            </div>
          )}
        </Section>
        <DocumentationGuidance usage={doc.usage} />
        {variants.map((example) => (
          <Section
            key={example.id}
            id={`example-${example.id}`}
            title={exampleLabel(example.label)}
          >
            {example.description && <p>{tr(example.description)}</p>}
            <Example
              name={`${id}-${example.id}`}
              code={example.code}
              wide={wide}
              deferred={needsLaunch(id, example)}
            >
              <ComponentExample id={id} story={example.id} />
            </Example>
          </Section>
        ))}
        <Section id="api-reference" title={tr("Referência da API")}>
          <p>
            {tr("Propriedades extraídas dos tipos públicos da implementação. Atributos nativos herdados também são aceitos conforme o tipo do componente.")}</p>
          {doc.api.map((api) => (
            <div key={api.name} className={styles.apiGroup}>
              <h3>{api.name}</h3>
              <div className={styles.tableScroll}>
                <table>
                  <caption>{tr("Propriedades de")} {api.name}</caption>
                  <thead>
                    <tr>
                      <th>{tr("Propriedade")}</th>
                      <th>{tr("Tipo")}</th>
                      <th>{tr("Uso")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {api.props.map((prop) => (
                      <tr key={prop.name}>
                        <td>
                          <code>{prop.name}</code>
                          {prop.required && (
                            <span className={styles.required}>{tr("Obrigatória")}</span>
                          )}
                          <PropVersion api={api.name} prop={prop.name} />
                        </td>
                        <td>
                          <code>{prop.type}</code>
                        </td>
                        <td>
                          {tr(prop.description || (prop.deprecated ? "" :
                            (prop.required
                              ? "Informe esta propriedade."
                              : "Opcional.")))}
                          {propDeprecation(api.name, prop.name) && (
                            <span className={styles.deprecatedNote}>
                              {tr(propDeprecation(api.name, prop.name)!.use)}{" "}
                              {tr("Pode sair a partir da")} {propDeprecation(api.name, prop.name)!.removal}.
                            </span>
                          )}
                          {prop.defaultValue && (
                            <span className={styles.defaultValue}>
                              {tr("Padrão:")} <code>{prop.defaultValue}</code>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </Section>
        </>)}
      </article>
      <aside className={styles.toc}>
        {mobile ? <MobileToc id={id} /> : <TableOfContents key={id} items={sections} label={tr("Nesta página")} />}
      </aside>
    </>
  );
}
