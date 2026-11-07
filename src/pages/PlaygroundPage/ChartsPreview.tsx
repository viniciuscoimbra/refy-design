import { tr } from "../RefySitePage/i18n";
import { PackageInstall } from "../RefySitePage/PackageInstall";
import { useState } from "react";
import type { ComponentProps } from "react";
import {
  AreaChart,
  LineChart,
  BarChart,
  DonutChart,
  Sparkline,
  Button,
  Card,
  CodeBlock,
  Drawer,
  Segmented,
  Table,
} from "../../index";
import { ChartExplorer } from "../../blocks/ChartExplorer";
import explorer from "../../blocks/ChartExplorer.tsx?raw";
import styles from "./Workbench.module.css";
import showcase from "./Showcases.module.css";
const data = [186, 305, 237, 273, 209, 314];
const xLabels = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"];
const series = [
  { name: "Consultas", data, tone: "primary" as const },
  {
    name: "Downloads",
    data: [80, 200, 120, 190, 130, 210],
    tone: "info" as const,
  },
];
const examples: Array<{
  name: string;
  description: string;
  props: ComponentProps<typeof AreaChart>;
}> = [
  {
    name: "Área simples",
    description: tr("Uma série, com preenchimento discreto."),
    props: { title: tr("Consultas por mês"), label: tr("Área simples"), data, xLabels },
  },
  {
    name: "Traçado linear",
    description: tr("Segmentos retos entre os pontos."),
    props: {
      title: tr("Consultas por mês"),
      label: tr("Traçado linear"),
      data,
      xLabels,
      curve: "linear",
    },
  },
  {
    name: "Em degraus",
    description: tr("Evidencia mudanças de patamar."),
    props: {
      title: tr("Consultas por mês"),
      label: tr("Em degraus"),
      data,
      xLabels,
      curve: "step",
    },
  },
  {
    name: "Com legenda",
    description: tr("Selecione uma série para ocultar ou exibir."),
    props: {
      title: tr("Consultas e downloads"),
      label: tr("Com legenda"),
      series,
      xLabels,
      showLegend: true,
    },
  },
  {
    name: "Áreas empilhadas",
    description: tr("Compare a contribuição de cada série."),
    props: {
      title: tr("Atividade total"),
      label: tr("Áreas empilhadas"),
      series,
      xLabels,
      showLegend: true,
      stacked: true,
    },
  },
  {
    name: "Com eixos",
    description: tr("Unidades e período deixam a leitura explícita."),
    props: {
      title: tr("Consultas por mês"),
      label: tr("Com eixos"),
      data,
      xLabels,
      xTitle: "Últimos seis meses",
      yTitle: "Consultas",
    },
  },
];
const lineProps = {
  title: tr("Consultas e downloads"),
  label: tr("Consultas e downloads"),
  series,
  xLabels,
  area: false,
  showLegend: true,
} satisfies ComponentProps<typeof LineChart>;
const barProps = {
  title: tr("Materiais publicados"),
  label: tr("Materiais por categoria"),
  items: [
    { label: tr("Documentos"), value: 186 },
    { label: tr("Imagens"), value: 305 },
    { label: tr("Vídeos"), value: 237 },
  ],
} satisfies ComponentProps<typeof BarChart>;
const donutProps = {
  label: tr("Distribuição de materiais"),
  caption: tr("Materiais"),
  centerLabel: "728",
  segments: [
    { label: tr("Documentos"), value: 186, tone: "primary" },
    { label: tr("Imagens"), value: 305, tone: "info" },
    { label: tr("Vídeos"), value: 237, tone: "warn" },
  ],
} satisfies ComponentProps<typeof DonutChart>;
const sparkProps = {
  label: tr("Tendência de consultas"),
  data,
  width: 320,
  height: 100,
} satisfies ComponentProps<typeof Sparkline>;
const otherExamples = [
  {
    family: "line",
    name: "Linha com duas séries",
    component: "LineChart",
    props: lineProps,
    render: <LineChart {...lineProps} />,
  },
  {
    family: "bar",
    name: "Comparação por categoria",
    component: "BarChart",
    props: barProps,
    render: <BarChart {...barProps} />,
  },
  {
    family: "donut",
    name: "Partes do total",
    component: "DonutChart",
    props: donutProps,
    render: <DonutChart {...donutProps} />,
  },
  {
    family: "spark",
    name: "Tendência compacta",
    component: "Sparkline",
    props: sparkProps,
    render: <Sparkline {...sparkProps} />,
  },
];
export function ChartsPreview({ onCompare, onCatalog }: { onCompare: () => void; onCatalog: () => void }) {
  const [family, setFamily] = useState("area");
  const [source, setSource] = useState<{ name: string; code: string }>();
  return (
    <main
      className={`${showcase.page} ${showcase.compactPage}`}
      aria-label={tr("Galeria de gráficos")}
    >
      <header className={showcase.pageHeader}>
        <div>
          <h1>{tr("Charts")}</h1>
          <Button onClick={onCatalog}>{tr("Explorar catálogo D3 · 24 tipos")}</Button>
          <Button onClick={onCompare}>{tr("Comparar com shadcn · claro e escuro")}</Button>
          <p>
            {tr("Dados em primeiro plano. Explore cada tipo, compare as variações e use o código da composição.")}</p>
        </div>
        <Button
          onClick={() =>
            setSource({
              name: "Gráfico interativo",
              code: explorer.replace(
                /from ['"]\.\.\/index['"]/g,
                "from '@refy-design/web'",
              ),
            })
          }
        >
          {tr("Código do explorador")}</Button>
      </header>
      <ChartExplorer />
      <section
        className={showcase.guide}
        aria-label={tr("Escolher família de gráfico")}
      >
        <h2>{tr("Exemplos")}</h2>
        <p>
          {tr("Área e linha mostram evolução. Barras comparam categorias. Distribuição mostra partes de um total. Tendência acompanha um indicador.")}</p>
        <Segmented
          label={tr("Família dos exemplos")}
          value={family}
          onChange={setFamily}
          options={[
            { value: "area", label: tr("Área") },
            { value: "line", label: tr("Linha") },
            { value: "bar", label: tr("Barras") },
            { value: "donut", label: tr("Distribuição") },
            { value: "spark", label: tr("Tendência") },
          ]}
        />
      </section>
      <section className={styles.chartGrid} aria-label={tr("Exemplos de gráficos")}>
        {otherExamples
          .filter((example) => example.family === family)
          .map((example) => (
            <Card key={family}>
              <header className={styles.chartExampleHeader}>
                <h2>{example.name}</h2>
                <p>
                  {family === "spark"
                    ? tr("Um sinal compacto para acompanhar um indicador, com descrição acessível.")
                    : tr("Séries e categorias usam a paleta do tema; os valores permanecem disponíveis em tabela.")}
                </p>
              </header>
              {example.render}
              <footer className={styles.chartExampleFooter}>
                <code>{example.component}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSource({
                      name: example.name,
                      code: `import { ${example.component} } from '@refy-design/web';\nimport type { ComponentProps } from 'react';\n\nconst props = ${JSON.stringify(example.props, null, 2)} satisfies ComponentProps<typeof ${example.component}>;\n\nexport function Example() {\n  return <${example.component} {...props} />;\n}`,
                    })
                  }
                >
                  {tr("Ver código de")} {example.name}
                </Button>
              </footer>
            </Card>
          ))}
        {family === "area" &&
          examples.map((example) => (
            <Card key={example.name}>
              <header className={styles.chartExampleHeader}>
                <h2>{example.name}</h2>
                <p>{example.description}</p>
              </header>
              <AreaChart {...example.props} />
              <footer className={styles.chartExampleFooter}>
                <span>{tr("refy · D3")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSource({
                      name: example.name,
                      code: `import { AreaChart } from '@refy-design/web';\nimport type { ComponentProps } from 'react';\n\nconst props = ${JSON.stringify(example.props, null, 2)} satisfies ComponentProps<typeof AreaChart>;\n\nexport function Example() {\n  return <AreaChart {...props} />;\n}`,
                    })
                  }
                >
                  {tr("Ver código de")} {example.name}
                </Button>
              </footer>
            </Card>
          ))}
      </section>
      <section
        className={showcase.guide}
        aria-label={tr("Documentação dos gráficos")}
      >
        <h2>{tr("Instalação e uso")}</h2>
        <p>
          {tr("Importe os estilos uma vez na aplicação. Os gráficos já incluem D3; não é preciso configurar um segundo motor de visualização.")}</p>
        <PackageInstall />
        <CodeBlock
          language="tsx"
          label="main.tsx"
          code={
            "import '@refy-design/web/tokens.css';\nimport '@refy-design/web/global.css';\nimport '@refy-design/web/fonts.css';\n"
          }
        />
        <CodeBlock
          language="tsx"
          label="grafico.tsx"
          code={
            "import { AreaChart } from '@refy-design/web';\n\nexport function Atividade() {\n  return <AreaChart\n    title=\"Consultas por mês\"\n    label=\"Evolução das consultas de janeiro a junho\"\n    data={[186, 305, 237, 273, 209, 314]}\n    xLabels={['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']}\n  />;\n}"
          }
        />
        <h2>{tr("Como compor")}</h2>
        <p>
          {tr("Card envolve o gráfico quando ele precisa de contexto. Select define o período; Segmented alterna a visualização. O organismo Charts desenha eixos, séries, legenda, tooltip e tabela de dados. O cálculo do negócio pertence à aplicação.")}</p>
        <Table
          caption={tr("Contrato de Área e Linha")}
          rows={[
            {
              name: "title / label",
              type: "string",
              use: "Título visível e descrição acessível, obrigatórios.",
            },
            {
              name: "data / series",
              type: "number[] / LineSeries[]",
              use: "Uma série simples ou séries nomeadas; não é preciso fornecer ambos.",
            },
            {
              name: "xLabels / pointLabels",
              type: "string[]",
              use: "Rótulos dos eixos e de cada ponto.",
            },
            {
              name: "curve",
              type: "smooth | linear | step",
              use: "Suave para tendências; linear para valores pontuais; degraus para patamares.",
            },
            {
              name: "showLegend",
              type: "boolean",
              use: "Legenda interativa para mostrar/ocultar séries.",
            },
            {
              name: "stacked",
              type: "boolean",
              use: "Empilha contribuições; use apenas para séries que formam um total.",
            },
            {
              name: "formatY",
              type: "(value: number) => string",
              use: "Unidade e formatação nos eixos, tabela e tooltip.",
            },
          ]}
          rowKey={(row) => row.name}
          columns={[
            {
              key: "name",
              header: tr("Propriedade"),
              cell: (row) => <code>{row.name}</code>,
            },
            { key: "type", header: tr("Tipo"), cell: (row) => row.type },
            { key: "use", header: tr("Quando usar"), cell: (row) => row.use },
          ]}
        />
        <h2>{tr("Leitura e interação")}</h2>
        <p>
          {tr("Use Tab para focar a área e setas, Home e End para percorrer os pontos. A legenda permite isolar séries; Ver dados abre os valores em tabela. Não dependa apenas da cor para nomear uma série.")}</p>
        <p>
          <a href="/?path=/story/components-organisms-charts--line">
            {tr("Abrir documentação completa de Charts no catálogo")}</a>
        </p>
      </section>
      <Drawer
        open={!!source}
        onOpenChange={(open) => {
          if (!open) setSource(undefined);
        }}
        title={source ? `Código: ${source.name}` : tr("Código")}
        width={760}
      >
        <p className={styles.caption}>
          {tr("Importe os estilos globais uma vez. Este código usa a API pública.")}</p>
        <CodeBlock
          label="grafico.tsx"
          language="tsx"
          code={source?.code ?? ""}
        />
      </Drawer>
    </main>
  );
}
