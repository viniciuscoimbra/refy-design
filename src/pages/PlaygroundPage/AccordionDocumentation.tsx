import { tr } from "../RefySitePage/i18n";
import { PackageInstall } from "../RefySitePage/PackageInstall";
import { installCommands, packagePublished } from "../RefySitePage/packageRelease";
import { useWebPin } from "../RefySitePage/docsVersion";
import { useEffect, useId, useState } from "react";
import { api as accordionApi, usage as accordionUsage } from "./documentation/Accordion.json";
import { MobileDocumentation, MobileToc, PlatformToggle } from "./MobileDocumentation";
import { syncPlatformUrl, usePlatform } from "../RefySitePage/platform";
import type { ReactNode } from "react";
import {
  Accordion,
  Button,
  Card,
  Kbd,
  CardHeader,
  CodeBlock,
  Select,
  Tabs,
  TableOfContents,
} from "../../index";
import type { AccordionItem } from "../../index";
import styles from "./ComponentDocumentation.module.css";
import { collectionLabels } from "./collections";
import {
  accordionQuestions as questions,
  accordionItems,
} from "../../_demo/accordion";

const arabic = [
  {
    id: "files",
    title: "كيف أنظم ملفاتي؟",
    content: "أنشئ مجموعات ونظم الملفات حسب المشروع.",
  },
  {
    id: "share",
    title: "هل يمكنني مشاركة مجموعة؟",
    content: "اختر الأشخاص وحدد صلاحيات العرض أو التعديل.",
  },
  {
    id: "archive",
    title: "كيف أقوم بأرشفة مشروع؟",
    content: "استخدم خيار الأرشفة في إعدادات المشروع.",
  },
];
const asItems = (items: typeof questions): AccordionItem[] =>
  items.map((item) => ({ ...item, content: <p>{item.content}</p> }));
const importCode = "import { Accordion } from '@refy-design/web';";
function source(items = questions, props = 'defaultValue={["files"]}') {
  return `${importCode}\n\nexport function Example() {\n  return (\n    <Accordion\n      ${props}\n      items={[\n${items.map((item) => `        {\n          id: ${JSON.stringify(item.id)},\n          title: ${JSON.stringify(item.title)},\n          content: <p>${item.content}</p>,${"disabled" in item ? "\n          disabled: true," : ""}\n        },`).join("\n")}\n      ]}\n    />\n  );\n}`;
}
const disabledItems = questions.map((item, index) => ({
  ...item,
  ...(index === 1 ? { disabled: true } : {}),
}));
const sections = [
  ["installation", "Instalação"],
  ["usage", "Uso"],
  ["composition", "Composição"],
  ["guidance", "Orientações de uso"],
  ["basic", "Básico"],
  ["multiple", "Múltiplos"],
  ["disabled", "Desabilitado"],
  ["borders", "Bordas"],
  ["card", "Card"],
  ["rtl", "RTL"],
  ["api-reference", "Referência da API"],
].map(([id, label]) => ({ id, label }));

function wrapSource(code: string, opening: string, closing: string) {
  return code.replace(
    /    <Accordion[\s\S]*?    \/>/,
    (block) =>
      `${opening}\n${block
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")}\n${closing}`,
  );
}
export function Example({
  children,
  code,
  name,
  deferred = false,
  wide = false,
}: {
  children: ReactNode;
  code: string;
  name: string;
  deferred?: boolean;
  wide?: boolean;
}) {
  const [running, setRunning] = useState(!deferred);
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <div className={styles.example} data-example={name}>
      <div className={styles.preview} data-wide={wide}>
        <div className={styles.previewContent}>
          {running ? (
            children
          ) : (
            <div className={styles.deferred}>
              <p>{tr("Este estado pode abrir uma camada sobre a página.")}</p>
              <Button variant="secondary" onClick={() => setRunning(true)}>
                {tr("Testar exemplo")}</Button>
            </div>
          )}
        </div>
      </div>
      <div className={styles.source} data-expanded={expanded} id={id}>
        <CodeBlock label={`${name}.tsx`} language="tsx" code={code} />
      </div>
      <div className={styles.sourceToggle}>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? tr("Ocultar código") : tr("Ver código")}
        </Button>
      </div>
    </div>
  );
}
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-label={title}>
      <h2>
        <a href={`#${id}`}>{title}</a>
      </h2>
      {children}
    </section>
  );
}
export interface DocumentationGuidanceData {
  usage: {
    howToUse: string[];
    alternatives: string[];
    keyboard: { keys: string; action: string }[];
  };
}

// O guia escreve propriedade, valor e tecla entre crases; na tela viram código, ou Kbd na coluna de teclas.
function Inline({ text, keys = false }: { text: string; keys?: boolean }) {
  return (
    <>
      {tr(text).split(/(`[^`]+`)/).map((part, index) =>
        !(part.startsWith("`") && part.endsWith("`")) ? part
          : keys ? <Kbd key={index}>{part.slice(1, -1)}</Kbd>
          : <code key={index}>{part.slice(1, -1)}</code>,
      )}
    </>
  );
}

export function DocumentationGuidance({ usage, keyboard = true }: DocumentationGuidanceData & { keyboard?: boolean }) {
  return (
    <Section id="guidance" title={tr("Orientações de uso")}>
      <h3>{tr("Como usar")}</h3>
      <ul className={styles.guidanceList}>
        {usage.howToUse.map((item) => <li key={item}><Inline text={item} /></li>)}
      </ul>
      <h3>{tr("Quando usar outro componente")}</h3>
      <ul className={styles.guidanceList}>
        {usage.alternatives.map((item) => <li key={item}><Inline text={item} /></li>)}
      </ul>
      {keyboard && <>
      <h3>{tr("Teclado e foco")}</h3>
      <div className={styles.tableScroll}>
        <table className={styles.keyTable}>
          <thead>
            <tr>
              <th>{tr("Tecla")}</th>
              <th>{tr("O que faz")}</th>
            </tr>
          </thead>
          <tbody>
            {usage.keyboard.map((row) => (
              <tr key={row.keys + row.action}>
                <td className={styles.keyCell}><Inline text={row.keys} keys /></td>
                <td><Inline text={row.action} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>}
    </Section>
  );
}

export function Installation() {
  const [manager, setManager] = useState("npm");
  const pin = useWebPin();
  const commands: Record<string, string> = Object.fromEntries(Object.entries(installCommands).map(([id, command]) => [id, command + pin]));
  return (
    <>
      <Tabs
        items={[
          {
            id: "command",
            label: tr("Comando"),
            content: (
              <div className={styles.install}>
                {packagePublished ? (
                  <Tabs
                    value={manager}
                    onChange={setManager}
                    items={Object.keys(commands).map((id) => ({
                      id,
                      label: id,
                      content: <CodeBlock language="bash" code={commands[id]} />,
                    }))}
                  />
                ) : (
                  <PackageInstall />
                )}
              </div>
            ),
          },
          {
            id: "manual",
            label: tr("Manual"),
            content: (
              <div className={styles.install}>
                <h3>{tr("1. Instale o pacote")}</h3>
                <PackageInstall />
                <h3>{tr("2. Importe os estilos uma vez")}</h3>
                <CodeBlock
                  label="main.tsx"
                  language="tsx"
                  code={
                    "import '@refy-design/web/tokens.css';\nimport '@refy-design/web/global.css';\nimport '@refy-design/web/fonts.css';"
                  }
                />
                <p>
                  {tr("Requer React e React DOM ≥ 18. O reset global afeta toda a aplicação; avalie-o ao integrar um projeto existente. Nenhuma dependência de Base UI ou Radix é necessária.")}</p>
              </div>
            ),
          },
        ]}
      />
      <p>{tr("Na entrada da aplicação, importe os estilos uma única vez:")}</p>
      <CodeBlock
        label="main.tsx"
        language="tsx"
        code={
          "import '@refy-design/web/tokens.css';\nimport '@refy-design/web/global.css';\nimport '@refy-design/web/fonts.css';"
        }
      />
    </>
  );
}

export function AccordionDocumentation({
  onCustomize,
}: { onCustomize?: () => void } = {}) {
  const [direction, setDirection] = useState("rtl");
  const platform = usePlatform();
  const mobile = platform === "mobile";
  useEffect(() => syncPlatformUrl(true), [platform]);
  const rtlItems = direction === "rtl" ? arabic : questions;
  const usage = `<Accordion\n  defaultValue={["files"]}\n  items={[{\n    id: "files",\n    title: "Como organizar meus arquivos?",\n    content: <p>Crie coleções e agrupe os arquivos por projeto.</p>,\n  }]}\n/>`;
  return (
    <>
      <article
        className={styles.document}
        aria-label={tr("Documentação do Accordion")}
        data-documentation={tr("Accordion")}
      >
        <header className={styles.docHeader}>
          <span className={styles.eyebrow}>{tr("Componentes")} / {tr("Moléculas")}</span>
          <h1>{tr("Accordion")}</h1>
          <p>
            {tr("Seções empilhadas que revelam ou ocultam conteúdo ao acionar seus títulos.")}</p>
          <div className={styles.docMeta}>
            <span>{tr("Coleção:")} {collectionLabels("Accordion").map((label) => tr(label)).join(" · ")}</span>
            {onCustomize && (
              <Button variant="secondary" size="sm" onClick={onCustomize}>
                {tr("Personalizar no Playground")}</Button>
            )}
          </div>
          <PlatformToggle id="Accordion" />
        </header>
        {mobile ? <MobileDocumentation id="Accordion" usage={accordionUsage} webProps={accordionApi.find((item) => item.name === "Accordion")?.props ?? []} /> : (<>
        <Example name="accordion-demo" code={source()}>
          <Accordion defaultValue={["files"]} items={accordionItems} />
        </Example>
        <Section id="installation" title={tr("Instalação")}>
          <Installation />
        </Section>
        <Section id="usage" title={tr("Uso")}>
          <CodeBlock language="tsx" code={importCode} />
          <CodeBlock language="tsx" code={usage} />
        </Section>

        <Section id="composition" title={tr("Composição")}>
          <p>
            {tr("O refy recebe uma lista em")} <code>items</code>. Título e conteúdo
            aceitam elementos React. Esta é a estrutura da API pública; gatilho
            e painel são renderizados internamente.
          </p>
          <CodeBlock
            language="text"
            code={
              "Accordion (molécula)\n└── items: AccordionItem[] (tipo de dados)\n    ├── id: identificador único\n    ├── title: ReactNode → gatilho\n    ├── content: ReactNode → painel\n    └── disabled?: boolean"
            }
          />
          <p>
            <code>AccordionItem</code> {tr("é um tipo TypeScript, não um componente JSX.")}</p>
        </Section>
        <DocumentationGuidance usage={accordionUsage} />
        <Section id="basic" title={tr("Básico")}>
          <p>
            {tr("Um item aberto por vez. O primeiro começa aberto com")}{" "}
            <code>defaultValue</code>.
          </p>
          <Example name="accordion-basic" code={source()}>
            <Accordion defaultValue={["files"]} items={accordionItems} />
          </Example>
        </Section>
        <Section id="multiple" title={tr("Múltiplos")}>
          <p>
            {tr("Use")} <code>type="multiple"</code> {tr("para manter várias seções abertas simultaneamente.")}</p>
          <Example
            name="accordion-multiple"
            code={source(
              questions,
              'variant="plain"\n      type="multiple"\n      defaultValue={["files"]}',
            )}
          >
            <Accordion
              variant="plain"
              type="multiple"
              defaultValue={["files"]}
              items={asItems(questions)}
            />
          </Example>
        </Section>
        <Section id="disabled" title={tr("Desabilitado")}>
          <p>
            <code>disabled</code> {tr("desabilita apenas o item correspondente.")}</p>
          <Example
            name="accordion-disabled"
            code={source(disabledItems, 'variant="plain"')}
          >
            <Accordion variant="plain" items={asItems(disabledItems)} />
          </Example>
        </Section>
        <Section id="borders" title={tr("Bordas")}>
          <p>
            {tr("A variante padrão do refy inclui borda externa e divisores.")}{" "}
            <code>variant="plain"</code> {tr("remove a caixa externa.")}</p>
          <Example
            name="accordion-borders"
            code={source(questions, 'defaultValue={["files"]}')}
          >
            <Accordion defaultValue={["files"]} items={asItems(questions)} />
          </Example>
        </Section>
        <Section id="card" title={tr("Card")}>
          <p>
            {tr("Componha")} <code>{tr("Card")}</code>, <code>CardHeader</code> e{" "}
            <code>{tr("Accordion")}</code> existentes.
          </p>
          <Example
            name="accordion-card"
            code={wrapSource(
              source(
                questions,
                'variant="plain"\n      defaultValue={["files"]}',
              ).replace(
                importCode,
                "import { Accordion, Card, CardHeader } from '@refy-design/web';",
              ),
              '    <Card>\n      <CardHeader title="Arquivos e coleções" />\n      <p>Dúvidas sobre organização e compartilhamento.</p>',
              "    </Card>",
            )}
          >
            <Card>
              <CardHeader title={tr("Arquivos e coleções")} />
              <p className={styles.cardDescription}>
                {tr("Dúvidas sobre organização e compartilhamento.")}</p>
              <Accordion
                variant="plain"
                defaultValue={["files"]}
                items={asItems(questions)}
              />
            </Card>
          </Example>
        </Section>
        <Section id="rtl" title="RTL">
          <p>
            {tr("A direção é herdada do contêiner. Troque o idioma para experimentar a leitura nas duas direções.")}</p>
          <Select
            label={tr("Idioma do exemplo RTL")}
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
          >
            <option value="rtl">{tr("العربية — Árabe (RTL)")}</option>
            <option value="ltr">{tr("Português (LTR)")}</option>
          </Select>
          <Example
            name="accordion-rtl"
            code={wrapSource(
              source(
                rtlItems,
                'variant="plain"\n      defaultValue={["files"]}',
              ),
              `    <div dir="${direction}" lang="${direction === "rtl" ? "ar" : "pt-BR"}">`,
              "    </div>",
            )}
          >
            <div dir={direction} lang={direction === "rtl" ? "ar" : "pt-BR"}>
              <Accordion
                key={direction}
                variant="plain"
                defaultValue={["files"]}
                items={asItems(rtlItems)}
              />
            </div>
          </Example>
        </Section>
        <Section id="api-reference" title={tr("Referência da API")}>
          <p>
            {tr("Propriedades do Accordion exportado por")} <code>@refy-design/web</code>.
          </p>
          <div className={styles.tableScroll}>
            <table>
              <caption>AccordionProps</caption>
              <thead>
                <tr>
                  <th>{tr("Propriedade")}</th>
                  <th>{tr("Tipo")}</th>
                  <th>{tr("Padrão / função")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "items",
                    "AccordionItem[]",
                    "Obrigatório; id único, title, content e disabled opcional",
                  ],
                  ["type", '"single" | "multiple"', '"single"'],
                  ["defaultValue", "string[]", "[]; IDs inicialmente abertos"],
                  ["value", "string[]", "Opcional; estado controlado"],
                  [
                    "onChange",
                    "(open: string[]) => void",
                    "Recebe os IDs abertos",
                  ],
                  [
                    "variant",
                    '"default" | "plain"',
                    '"default"; aparência com bordas',
                  ],
                  ["className", "string", "Classe adicional no contêiner"],
                ].map(([prop, type, description]) => (
                  <tr key={prop}>
                    <td>
                      <code>{prop}</code>
                    </td>
                    <td>
                      <code>{type}</code>
                    </td>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>{tr("Estado controlado")}</h3>
          <CodeBlock
            language="tsx"
            code={
              "import { useState } from 'react';\nimport { Accordion } from '@refy-design/web';\n\nexport function ControlledExample() {\n  const [open, setOpen] = useState<string[]>([]);\n  return (\n    <Accordion\n      value={open}\n      onChange={setOpen}\n      items={[{ id: 'details', title: 'Details', content: <p>Content.</p> }]}\n    />\n  );\n}"
            }
          />
          <h3>{tr("Teclado")}</h3>
          <p>
            {tr("Tab e Shift+Tab percorrem os títulos habilitados. Enter e Espaço abrem ou fecham a seção em foco. Os títulos informam o estado expandido e a relação com seus painéis.")}</p>
        </Section>
        </>)}
      </article>
      <aside className={styles.toc}>
        {mobile ? <MobileToc id="Accordion" /> : <TableOfContents items={sections} label={tr("Nesta página")} />}
      </aside>
    </>
  );
}
