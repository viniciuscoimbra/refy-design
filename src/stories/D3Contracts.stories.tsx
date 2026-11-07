import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { D3Chart, Button } from "../index";
import type { D3ChartProps } from "../index";
const meta = {
  id: "verification-d3-contracts",
  title: "Verificação/Contratos D3",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
export const Entradas: StoryObj = {
  render: () => {
    const [index, setIndex] = useState(0);
    const common = { title: "Contrato", label: "Gráfico de contrato" };
    const cases: D3ChartProps[] = [
      {
        ...common,
        type: "line",
        series: [{ id: "s", label: "S", data: [{ x: 1, y: NaN }] }],
      },
      {
        ...common,
        type: "line",
        yAxis: { scale: "log" },
        series: [{ id: "s", label: "S", data: [{ x: 1, y: 0 }] }],
      },
      {
        ...common,
        type: "sankey",
        network: {
          nodes: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
          links: [
            { source: "a", target: "b", value: 2 },
            { source: "b", target: "a", value: 1 },
          ],
        },
      },
      {
        ...common,
        type: "network",
        network: {
          nodes: [{ id: "a", label: "A" }],
          links: [{ source: "a", target: "b", value: 1 }],
        },
      },
      { ...common, type: "pie", items: [{ id: "a", label: "A", value: -1 }] },
      { ...common, type: "line", series: [] },
      {
        ...common,
        type: "bar",
        series: [
          {
            id: "a",
            label: "A",
            data: [
              { x: "Um", y: -10 },
              { x: "Dois", y: 0 },
              { x: "Três", y: 5 },
            ],
          },
        ],
      },
      {
        ...common,
        type: "area",
        stacked: "percent",
        series: [
          {
            id: "a",
            label: "A",
            data: [
              { x: "Um", y: 0 },
              { x: "Dois", y: 0 },
            ],
          },
        ],
      },
      {
        ...common,
        type: "line",
        series: [
          {
            id: "a",
            label: "A",
            data: [
              { x: new Date("2026-01-01"), y: 5 },
              { x: new Date("2026-01-15"), y: 12 },
              { x: new Date("2026-02-01"), y: 8 },
            ],
          },
        ],
        xAxis: { scale: "time", tickCount: 3 },
      },
      {
        ...common,
        type: "line",
        series: [
          {
            id: "a",
            label: "A",
            data: [
              { x: 1, y: 1 },
              { x: 10, y: 10 },
              { x: 100, y: 100 },
            ],
          },
        ],
        xAxis: { scale: "log" },
        yAxis: { scale: "log" },
        tooltip: {
          render: (datum) => <strong>Customizado: {datum.label}</strong>,
        },
        renderOverlay: ({ left, top }) => (
          <text x={left} y={top} data-testid="custom-overlay">
            Camada customizada
          </text>
        ),
      },
    ];
    return (
      <>
        <Button onClick={() => setIndex((i) => (i + 1) % cases.length)}>
          Próximo caso
        </Button>
        <p>Caso{index}</p>
        <D3Chart {...cases[index]} />
      </>
    );
  },
};

/** Isola overrides sem depender da paleta default. */
export const Cores: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <D3Chart
        type="heatmap"
        label="Intensidade customizada"
        title="Intensidade customizada"
        cells={[
          { x: "A", y: "Linha", value: 1 },
          { x: "B", y: "Linha", value: 10 },
        ]}
        colorScale={(value) => (value < 5 ? "#2563eb" : "#c05222")}
      />
      <D3Chart
        type="geo"
        label="Mapa customizado"
        title="Mapa customizado"
        features={{
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Área A", value: 1 },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-10, 0],
                    [0, 0],
                    [0, 10],
                    [-10, 10],
                    [-10, 0],
                  ],
                ],
              },
            },
          ],
        }}
        colorScale={() => "#2563eb"}
      />
      <D3Chart
        type="line"
        label="Séries customizadas"
        title="Séries customizadas"
        colors={["#c05222"]}
        series={[
          {
            id: "a",
            label: "Série A",
            color: "#2563eb",
            data: [
              { x: "Jan", y: 10 },
              { x: "Fev", y: 20 },
            ],
          },
          {
            id: "b",
            label: "Série B",
            data: [
              { x: "Jan", y: 20 },
              { x: "Fev", y: 15 },
            ],
          },
        ]}
      />
    </div>
  ),
};
