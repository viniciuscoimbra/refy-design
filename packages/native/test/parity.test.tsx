// A cópia nativa não pode divergir da web: ícones de provedor e geometria do gráfico.
import { readFileSync } from "fs";
import { join } from "path";
import { providerIcons as nativeIcons } from "../src/components/providerIcons";
import { providerIcons as webIcons } from "../../../src/components/OAuthButton/providerIcons";
import { cartesianScene } from "../../../src/components/Charts/d3/cartesian";
import type { D3ChartProps as WebChartProps } from "../../../src/components/Charts/d3/types";
import { lineScene } from "../src/chart/scene";
import { floatingPosition as webFloating } from "../../../src/lib/AnchoredSurface";
import { floatingPosition as nativeFloating } from "../src/overlay";
import { phoneCountries as webCountries, formatBrazilianPhone as webPhone } from "../../../src/components/PhoneInput/PhoneInput";
import { phoneCountries as nativeCountries, formatBrazilianPhone as nativePhone } from "../src/components/PhoneInput";
import type { D3ChartProps } from "../src/chart/types";

const root = join(__dirname, "../../..");
const paths = (file: string) => [...readFileSync(join(root, file), "utf8").matchAll(/\bd="([^"]+)"/g)].map((m) => m[1]);

test("ícones de provedor iguais aos da web", () => {
  expect(nativeIcons).toEqual(webIcons);
});

test("ícone Google igual ao GoogleButton da web", () => {
  expect(paths("packages/native/src/components/OAuthButton.tsx")).toEqual(paths("src/components/GoogleButton/GoogleButton.tsx"));
});

const layout = { width: 360, height: 240, top: 24, right: 20, bottom: 42, left: 84 };
const day = (d: string) => new Date(`${d}T12:00:00Z`);
const cases: [string, D3ChartProps][] = [
  ["datas, linear, dots", { type: "line", title: "Preço", label: "Preço", curve: "linear", dots: true, yAxis: { tickCount: 4 }, xAxis: { tickCount: 3 }, series: [{ id: "min", label: "Mínimo", data: [{ x: day("2023-07-01"), y: 112 }, { x: day("2023-08-01"), y: 119 }, { x: day("2023-09-01"), y: 115 }, { x: day("2023-10-15"), y: 98 }] }] }],
  ["números, monotone, área", { type: "area", title: "A", label: "A", curve: "monotone", series: [{ id: "a", label: "A", data: [249, 219, 229, 199, 179].map((y, x) => ({ x, y })) }] }],
  ["duas séries, empilhado", { type: "area", title: "B", label: "B", stacked: true, series: [{ id: "a", label: "A", data: [1, 2, 3].map((y, x) => ({ x, y })) }, { id: "b", label: "B", data: [3, 1, 2].map((y, x) => ({ x, y })) }] }],
  ["percentual", { type: "line", title: "C", label: "C", stacked: "percent", series: [{ id: "a", label: "A", data: [1, 2].map((y, x) => ({ x, y })) }, { id: "b", label: "B", data: [3, 2].map((y, x) => ({ x, y })) }] }],
  ["categorias, domínio fixo", { type: "line", title: "D", label: "D", yAxis: { domain: [0, 300], nice: false }, series: [{ id: "a", label: "A", data: [{ x: "jan", y: 10 }, { x: "fev", y: 250 }] }] }],
];

describe.each(cases)("gráfico %s", (_, props) => {
  test("mesma geometria que a web", () => {
    const web = cartesianScene(props as WebChartProps, layout, []);
    const native = lineScene(props, layout, []);
    expect(native.marks.map(({ id, datum, color, x, y }) => ({ id, datum, color, x, y }))).toEqual(web.marks.map(({ id, datum, color, x, y }) => ({ id, datum, color, x, y })));
    const webPaths = (web.plot as { key: string; props: { d: string } }[]).map((el) => ({ id: el.key, d: el.props.d }));
    expect(native.paths.map(({ id, d }) => ({ id, d }))).toEqual(webPaths);
    expect(native.legend).toEqual(web.legend);
    // Ticks: a web devolve <text> dentro de <g data-axis>; comparar o texto e a posição.
    const texts: { x: number; y: number; text: string }[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      const el = node as { type?: unknown; props?: { x?: number; y?: number; children?: unknown } };
      if (el.type === "text") texts.push({ x: el.props!.x!, y: el.props!.y!, text: String(el.props!.children) });
      else walk(el.props?.children);
    };
    walk(web.decorations);
    const nativeTexts = [
      ...native.xTicks.map((tick) => ({ x: tick.at, y: layout.height - layout.bottom + 20, text: tick.text })),
      ...native.yTicks.map((tick) => ({ x: layout.left - 10, y: tick.at + 4, text: tick.text })),
    ];
    expect(texts.length).toBeGreaterThan(3);
    expect(native.marks.length).toBeGreaterThan(1);
    expect(nativeTexts).toEqual(texts);
  });
});

test("mesmo erro que a web para X repetido", () => {
  const props: D3ChartProps = { type: "line", title: "E", label: "E", series: [{ id: "a", label: "A", data: [{ x: 1, y: 1 }, { x: 1, y: 2 }] }] };
  expect(() => lineScene(props, layout, [])).toThrow("Cada série deve ter coordenadas X únicas.");
  expect(() => cartesianScene(props as WebChartProps, layout, [])).toThrow("Cada série deve ter coordenadas X únicas.");
});

test("painel ancorado vira de lado e encosta na borda como na web", () => {
  const viewport = { width: 390, height: 844 };
  const anchors = [
    { left: 20, right: 120, top: 100, bottom: 134, width: 100 },
    { left: 300, right: 380, top: 790, bottom: 824, width: 80 },
    { left: 10, right: 40, top: 400, bottom: 430, width: 30 },
    { left: 200, right: 200, top: 300, bottom: 300, width: 0 },
  ];
  const sizes = [{ width: 220, height: 180 }, { width: 200, height: 900 }, { width: 380, height: 60 }];
  for (const a of anchors) for (const s of sizes) for (const side of ["top", "bottom", "left", "right"] as const) for (const align of ["start", "center", "end"] as const)
    expect(nativeFloating(a, s, viewport, side, align, 8)).toEqual(webFloating(a, s, viewport, side, align, 8));
});

test("telefone: mesma lista de países e mesma máscara da web", () => {
  expect(nativeCountries).toEqual(webCountries);
  for (const v of ["", "3", "31", "319", "319876", "3198765432", "31987654321", "(31) 98765-43219", "abc31x9"]) expect(nativePhone(v)).toBe(webPhone(v));
});

describe("Charts nativos com a geometria da web (largura 520, a padrão da web)", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { renderToStaticMarkup } = require("react-dom/server");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const web = require("../../../src/components/Charts/Charts");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const native = require("../src/chart/Charts");
  const ds = (html: string) => [...html.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  const rects = (html: string) => [...html.matchAll(/<rect[^>]*?\sy="([^"]+)"[^>]*?width="([^"]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);

  test.each([
    ["uma série com área", { title: "V", label: "V", data: [12, 30, 22, 41, 38], xLabels: ["Ago", "Set", "Out", "Hoje"] }],
    ["duas séries empilhadas, degrau", { title: "V", label: "V", stacked: true, curve: "step", series: [{ name: "A", data: [3, 5, 2] }, { name: "B", data: [1, 2, 4], tone: "info" }] }],
  ])("LineChart: %s", (_, props) => {
    const g = native.lineChartGeometry(props, 520);
    expect(ds(renderToStaticMarkup(<web.LineChart {...(props as object)} />))).toEqual([...g.areas, ...g.lines]);
  });

  test("BarChart", () => {
    const items = [{ label: "Centro", value: 42 }, { label: "Savassi", value: 0 }, { label: "Horto", value: 17 }];
    const g = native.barChartGeometry(items, 520);
    expect(rects(renderToStaticMarkup(<web.BarChart title="B" label="B" items={items} />))).toEqual(g.bars.map((b: { y: number; width: number }) => [b.y, b.width]));
  });

  test("DonutChart em segmentos", () => {
    const segments = [{ value: 3, label: "A" }, { value: 1, tone: "info" }];
    const a = native.donutArcs(undefined, segments);
    expect(ds(renderToStaticMarkup(<web.DonutChart label="D" segments={segments} />))).toEqual([a.track, ...a.paths.map((p: { d: string }) => p.d)]);
  });
});

test("cenas do D3Chart nativo são cópia fiel das da web", () => {
  for (const file of ["shared.tsx", "cartesian.tsx", "radial.tsx", "hierarchy.tsx", "relations.tsx", "types.ts"]) {
    const web = readFileSync(join(root, "src/components/Charts/d3", file), "utf8").replace('import styles from "../D3Chart.module.css";', 'import styles from "./styles";');
    expect(readFileSync(join(root, "packages/native/src/chart/d3", file), "utf8")).toBe(web);
  }
});
