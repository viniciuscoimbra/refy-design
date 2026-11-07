import { useCallback, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, D3Chart, ThemeProvider } from "../index";
import type { ChartStreamBatch, ChartStreamOptions } from "../index";
const meta = {
  id: "verification-chart-exploration",
  title: "Verificação/Exploração de gráficos",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
const initial = [
  {
    id: "live",
    label: "Eventos",
    data: Array.from({ length: 5 }, (_, x) => ({ x, y: 10 + x })),
  },
];
export const FonteControlada: StoryObj = {
  render: () => {
    const [paused, setPaused] = useState(false),
      [mounted, setMounted] = useState(true),
      [listeners, setListeners] = useState(0),
      [mode, setMode] = useState<"light" | "dark">("light");
    const next = useRef(5);
    const subscribers = useRef(new Set<(b: ChartStreamBatch[]) => void>());
    const subscribe = useCallback<ChartStreamOptions["subscribe"]>((push) => {
      subscribers.current.add(push);
      setListeners((n) => n + 1);
      return () => {
        subscribers.current.delete(push);
        setListeners((n) => n - 1);
      };
    }, []);
    const push = (invalid = false) => {
      const x = next.current++;
      subscribers.current.forEach((send) =>
        send([
          { seriesId: "live", points: [{ x, y: x + 10 }] },
          ...(invalid
            ? [{ seriesId: "unknown", points: [{ x: 999, y: NaN }] }]
            : []),
        ]),
      );
    };
    return (
      <ThemeProvider mode={mode}>
        <Button onClick={() => push()}>Receber ponto</Button>
        <Button onClick={() => push(true)}>Lote inválido</Button>
        <Button onClick={() => setPaused((v) => !v)}>Pausar origem</Button>
        <Button onClick={() => setMounted((v) => !v)}>Montar ou remover</Button>
        <Button
          onClick={() => setMode((v) => (v === "light" ? "dark" : "light"))}
        >
          Trocar modo
        </Button>
        <p data-testid="subscriptions">Assinaturas:{listeners}</p>
        {mounted && (
          <D3Chart
            type="line"
            title="Fonte controlada"
            label="Série de teste contínua"
            series={initial}
            zoom
            brush
            stream={{ subscribe, paused, maxPoints: 5 }}
          />
        )}
      </ThemeProvider>
    );
  },
};
