import { tr } from "../RefySitePage/i18n";
import { Icons } from "../../_demo/icons";
import { useState, useMemo } from "react";
import { Button, CodeBlock, D3Chart, Segmented, Slider } from "../../index";
import type {
  ChartSeries,
  ChartStreamOptions,
  ChartBrushSelection,
} from "../../index";
import styles from "./D3ChartCatalog.module.css";
const initial: ChartSeries[] = [
  {
    id: "received",
    label: tr("Recebidos"),
    data: Array.from({ length: 24 }, (_, i) => ({
      x: i,
      y: 40 + Math.round(Math.sin(i / 3) * 12),
    })),
  },
  {
    id: "processed",
    label: tr("Processados"),
    data: Array.from({ length: 24 }, (_, i) => ({
      x: i,
      y: 31 + Math.round(Math.cos(i / 4) * 8),
    })),
  },
];
function createSource(): ChartStreamOptions["subscribe"] {
  let next = 24;
  return (push) => {
    const timer = setInterval(() => {
      const x = next++;
      push([
        {
          seriesId: "received",
          points: [{ x, y: 40 + Math.round(Math.sin(x / 3) * 12) }],
        },
        {
          seriesId: "processed",
          points: [{ x, y: 31 + Math.round(Math.cos(x / 4) * 8) }],
        },
      ]);
    }, 600);
    return () => clearInterval(timer);
  };
}
export function ChartStreamingExample() {
  const subscribe = useMemo(createSource, []);
  const [running, setRunning] = useState(false),
    [maxPoints, setMax] = useState(40),
    [tab, setTab] = useState("preview");
  const [range, setRange] = useState<ChartBrushSelection | null>(null);
  const code = `import { useState, useMemo } from 'react';
import { Button, D3Chart } from '@refy-design/web';
import type { ChartSeries, ChartStreamOptions } from '@refy-design/web';
const initial: ChartSeries[] = ${JSON.stringify(initial, null, 2)};
function createSource(): ChartStreamOptions['subscribe'] {
  let next = 24;
  return push => {
    const timer = setInterval(() => { const x = next++;
      push([{seriesId:'received',points:[{x,y:40+Math.round(Math.sin(x/3)*12)}]}, {seriesId:'processed',points:[{x,y:31+Math.round(Math.cos(x/4)*8)}]}]);
    }, 600);
    return () => clearInterval(timer);
  };
}
export function Example() {
  const [running, setRunning] = useState(false);
  const subscribe = useMemo(createSource, []);
  return <><Button onClick={() => setRunning(v => !v)}>{running ? 'Pausar' : 'Retomar'}</Button><D3Chart type="line" title="Fluxo de eventos" label="Eventos em tempo real" series={initial} zoom brush stream={{subscribe, paused:!running, maxPoints:${maxPoints}}} /></>;
}`;
  return (
    <section
      id="refy-chart-streaming"
      className={styles.live}
      aria-label={tr("Zoom, brush e streaming")}
    >
      <header className={styles.exampleHeader}>
        <div>
          <h2>{tr("Dados ao vivo e inspeção")}</h2>
          <p>
            {tr("Origem simulada local. Pause para inspecionar; arraste a faixa inferior para recortar o período. Ctrl + scroll amplia e o arraste no gráfico desloca a janela.")}</p>
        </div>
        <Segmented
          iconOnly
          label={tr("Exibir streaming")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "preview", label: tr("Demonstração"), icon: Icons.monitor },
            { value: "code", label: tr("Código do streaming"), icon: Icons.code },
          ]}
        />
      </header>
      <div className={styles.switches}>
        <Button onClick={() => setRunning((v) => !v)}>
          {running ? tr("Pausar dados") : tr("Retomar dados")}
        </Button>
        <span role="status">
          {running ? tr("Recebendo a cada 600 ms") : tr("Pausado · sem novos pontos")}
        </span>
      </div>
      <Slider
        label={tr("Limite de pontos por série")}
        min={24}
        max={120}
        step={8}
        value={maxPoints}
        onChange={setMax}
      />
      {tab === "preview" ? (
        <D3Chart
          type="line"
          title={tr("Fluxo de eventos")}
          label={tr("Eventos recebidos e processados em tempo real")}
          series={initial}
          curve="monotone"
          zoom
          brush={{ onChange: setRange }}
          stream={{ subscribe, paused: !running, maxPoints }}
          xAxis={{ title: tr("Amostra") }}
        />
      ) : (
        <CodeBlock
          code={code}
          language="tsx"
          label={tr("Streaming · exemplo completo")}
        />
      )}
      <p data-testid="stream-range">
        {range
          ? `Intervalo: ${range.range.map((value) => (typeof value === "number" ? value.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : value instanceof Date ? value.toLocaleDateString("pt-BR") : value)).join(" a ")} · ${range.items.length} marcas`
          : tr("Intervalo completo")}
      </p>
    </section>
  );
}
