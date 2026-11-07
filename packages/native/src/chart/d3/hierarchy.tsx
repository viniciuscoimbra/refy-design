import { en } from "../../messages/en";
import type { RefyMessages } from "../../messages/en";
import {
  hierarchy,
  treemap,
  pack,
  tree,
  cluster,
  partition,
} from "d3-hierarchy";
import { arc, linkHorizontal } from "d3-shape";
import type {
  ChartLayout,
  ChartScene,
  D3ChartProps,
  ChartNode,
  ChartMark,
} from "./types";
import { colorAt, finite, uniqueIds } from "./shared";

const fitLabel = (text: string, max: number) => (text.length <= max ? text : max < 2 ? "" : `${text.slice(0, max - 1)}…`);
import styles from "./styles";
export function hierarchyScene(
  props: D3ChartProps,
  layout: ChartLayout,
  hidden: string[],
  text: RefyMessages["d3Chart"] = en.d3Chart,
): ChartScene {
  if (!("root" in props)) return { marks: [] };
  const { width: w, height: h, top: t, bottom: b, left: l, right: r } = layout,
    W = w - l - r,
    H = h - t - b;
  const input = hierarchy<ChartNode>(props.root);
  uniqueIds(input.descendants().map((n) => n.data));
  input.each((n) => {
    if (n.data.value !== undefined) {
      finite([n.data.value]);
      if (n.data.value < 0)
        throw Error("Hierarchies require non-negative values.");
    }
  });
  const root = input
    .sum((n) => (n.children?.length ? 0 : (n.value ?? 0)))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const branches = root.children ?? [root];
  const branchOf = (n: typeof root) =>
    n.ancestors().find((a) => a.parent === root) ?? root;
  const legend = branches.map((n, i) => ({
    id: n.data.id,
    label: n.data.name,
    color: colorAt(i, props.colors),
  }));
  const color = (n: typeof root) =>
    legend.find((v) => v.id === branchOf(n).data.id)?.color ??
    colorAt(0, props.colors);
  const allowed = (n: typeof root) => !hidden.includes(branchOf(n).data.id);
  const datum = (n: typeof root) => ({
    id: n.data.id,
    label: n
      .ancestors()
      .reverse()
      .map((v) => v.data.name)
      .join(" / "),
    seriesId: branchOf(n).data.id,
    values: { [text.value]: n.value ?? 0, [text.level]: n.depth },
  });
  const padding = props.padding ?? 4;
  finite([padding]);
  if (padding < 0) throw Error("Padding must be non-negative.");
  if (props.type === "treemap") {
    const result = treemap<ChartNode>().size([W, H]).padding(padding)(root);
    const marks = result
      .leaves()
      .filter(allowed)
      .map((n) => ({
        id: n.data.id,
        datum: datum(n),
        color: color(n),
        x: l + (n.x0 + n.x1) / 2,
        y: t + (n.y0 + n.y1) / 2,
        element: (
          <g>
            <rect
              x={l + n.x0}
              y={t + n.y0}
              width={Math.max(0, n.x1 - n.x0)}
              height={Math.max(0, n.y1 - n.y0)}
              fill="currentColor"
              fillOpacity={0.2}
              stroke="currentColor"
            />
            {n.x1 - n.x0 > 65 && n.y1 - n.y0 > 25 && (
              <text
                x={l + n.x0 + 8}
                y={t + n.y0 + 20}
                className={styles.markLabel}
              >
                {fitLabel(n.data.name, Math.floor((n.x1 - n.x0 - 16) / 7))}
              </text>
            )}
          </g>
        ),
      }));
    return { marks: root.value ? marks : [], legend };
  }
  if (props.type === "pack") {
    const result = pack<ChartNode>().size([W, H]).padding(padding)(root);
    return {
      legend,
      marks: root.value
        ? result
            .descendants()
            .filter((n) => n.depth > 0 && allowed(n))
            .map((n) => ({
              id: n.data.id,
              datum: datum(n),
              color: color(n),
              x: l + n.x,
              y: t + n.y,
              element: (
                <g>
                  <circle
                    cx={l + n.x}
                    cy={t + n.y}
                    r={n.r}
                    fill="currentColor"
                    fillOpacity={n.children ? 0.06 : 0.25}
                    stroke="currentColor"
                  />
                  {!n.children && n.r > 28 && (
                    <text
                      x={l + n.x}
                      y={t + n.y + 4}
                      textAnchor="middle"
                      className={styles.markLabel}
                    >
                      {fitLabel(n.data.name, Math.floor(n.r / 4))}
                    </text>
                  )}
                </g>
              ),
            }))
        : [],
    };
  }
  if (props.type === "tree" || props.type === "cluster") {
    const result = (
      props.type === "tree" ? tree<ChartNode>() : cluster<ChartNode>()
    )
      .separation((a, b) =>
        a.parent === b.parent ? 1 : (props.separation ?? 2),
      )
      .size([H - 20, W - 100])(root);
    const nodes = result.descendants();
    const path = linkHorizontal<
      { source: [number, number]; target: [number, number] },
      [number, number]
    >()
      .x((d) => d[0])
      .y((d) => d[1]);
    return {
      legend,
      decorations: (
        <g fill="none" className={styles.links}>
          {result
            .links()
            .filter((link) => allowed(link.target))
            .map((link) => (
              <path
                key={link.target.data.id}
                d={
                  path({
                    source: [l + link.source.y, t + 10 + link.source.x],
                    target: [l + link.target.y, t + 10 + link.target.x],
                  }) ?? ""
                }
              />
            ))}
        </g>
      ),
      marks: nodes.filter(allowed).map((n) => ({
        id: n.data.id,
        datum: datum(n),
        color: color(n),
        x: l + n.y,
        y: t + 10 + n.x,
        element: (
          <g>
            <circle cx={l + n.y} cy={t + 10 + n.x} r={5} fill="currentColor" />
            <text
              x={l + n.y + 10}
              y={t + 14 + n.x}
              className={styles.markLabel}
            >
              {fitLabel(n.data.name, 13)}
            </text>
          </g>
        ),
      })),
    };
  }
  const sun = props.type === "sunburst",
    R = Math.min(W, H) / 2,
    result = partition<ChartNode>()
      .size(sun ? [Math.PI * 2, R] : [W, H])
      .padding(sun ? padding / 500 : padding)(root);
  const shape = arc();
  const marks: ChartMark[] = result
    .descendants()
    .filter((n) => n.depth > 0 && allowed(n))
    .map((n) => {
      if (sun) {
        const radial = {
            innerRadius: n.y0,
            outerRadius: n.y1,
            startAngle: n.x0,
            endAngle: n.x1,
          },
          c = shape.centroid(radial);
        return {
          id: n.data.id,
          datum: datum(n),
          color: color(n),
          x: l + W / 2 + c[0],
          y: t + H / 2 + c[1],
          element: (
            <path
              transform={`translate(${l + W / 2},${t + H / 2})`}
              d={shape(radial) ?? ""}
              fill="currentColor"
              fillOpacity={0.2 + 0.6 / n.depth}
            />
          ),
        };
      }
      return {
        id: n.data.id,
        datum: datum(n),
        color: color(n),
        x: l + (n.x0 + n.x1) / 2,
        y: t + (n.y0 + n.y1) / 2,
        element: (
          <g>
            <rect
              x={l + n.x0}
              y={t + n.y0}
              width={Math.max(0, n.x1 - n.x0)}
              height={Math.max(0, n.y1 - n.y0)}
              fill="currentColor"
              fillOpacity={0.18 + 0.5 / n.depth}
            />
            {n.x1 - n.x0 > 60 && (
              <text
                className={styles.markLabel}
                x={l + n.x0 + 6}
                y={t + n.y0 + 20}
              >
                {fitLabel(n.data.name, Math.floor((n.x1 - n.x0 - 12) / 7))}
              </text>
            )}
          </g>
        ),
      };
    });
  return { marks: root.value ? marks : [], legend };
}
