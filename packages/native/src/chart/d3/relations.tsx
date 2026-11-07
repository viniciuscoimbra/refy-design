import { en } from "../../messages/en";
import type { RefyMessages } from "../../messages/en";
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceLink,
} from "d3-force";
import { chordDirected, ribbonArrow } from "d3-chord";
import { arc } from "d3-shape";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { geoMercator, geoEqualEarth, geoOrthographic, geoPath } from "d3-geo";
import type { ChartLayout, ChartMark, ChartScene, D3ChartProps } from "./types";
import { colorAt, finite, uniqueIds } from "./shared";
import styles from "./styles";
export function relationScene(
  props: D3ChartProps,
  layout: ChartLayout,
  hidden: string[],
  text: RefyMessages["d3Chart"] = en.d3Chart,
): ChartScene {
  const { width: w, height: h, left: l, right: r, top: t, bottom: b } = layout,
    W = w - l - r,
    H = h - t - b;
  if (props.type === "geo") {
    if (
      props.features?.type !== "FeatureCollection" ||
      !Array.isArray(props.features.features)
    )
      throw Error("Provide a valid GeoJSON FeatureCollection.");
    function checkCoordinates(value: unknown): void {
      if (!Array.isArray(value)) throw Error("Invalid GeoJSON coordinates.");
      if (value.every((v) => typeof v === "number")) finite(value as number[]);
      else value.forEach(checkCoordinates);
    }
    props.features.features.forEach((f) => {
      if (!f.geometry) throw Error("A region has no geometry.");
      if ("coordinates" in f.geometry) checkCoordinates(f.geometry.coordinates);
      else
        throw Error(
          "GeometryCollection is not supported; provide its geometries as individual features.",
        );
      if (f.properties?.value !== undefined)
        finite([Number(f.properties.value)]);
    });
    if (!props.features.features.length) return { marks: [] };
    const projection =
      typeof props.projection === "function"
        ? props.projection()
        : props.projection === "equal-earth"
          ? geoEqualEarth()
          : props.projection === "orthographic"
            ? geoOrthographic()
            : geoMercator();
    projection.fitExtent(
      [
        [l, t],
        [w - r, h - b],
      ],
      props.features,
    );
    if (!Number.isFinite(projection.scale()))
      projection.scale(Math.min(W, H) / 6).translate([l + W / 2, t + H / 2]);
    const path = geoPath(projection);
    const max = Math.max(
      1,
      ...props.features.features.map((f) =>
        Math.abs(Number(f.properties?.value ?? 0)),
      ),
    );
    const marks: ChartMark[] = props.features.features.map((f, i) => {
      const id = String(f.id ?? i),
        name = String(f.properties?.name ?? text.region(i + 1)),
        value = Number(f.properties?.value ?? 0),
        d = path(f) ?? "",
        c = path.centroid(f);
      if (/NaN|Infinity/.test(d))
        throw Error(
          "The projection produced no finite coordinates for this geometry.",
        );
      return {
        id,
        datum: { id, label: name, values: { [text.value]: value } },
        color:
          props.colorScale?.(value) ?? colorAt(value < 0 ? 3 : 0, props.colors),
        x: c[0],
        y: c[1],
        element: (
          <path
            d={d}
            fill="currentColor"
            fillOpacity={props.colorScale ? 1 : 0.18 + (0.72 * Math.abs(value)) / max}
            stroke="var(--surface)"
            strokeWidth={1}
          />
        ),
      };
    });
    return { marks };
  }
  if (!("network" in props)) return { marks: [] };
  const { nodes, links } = props.network;
  uniqueIds(nodes);
  nodes.forEach((n) => finite([n.value ?? 0]));
  links.forEach((link) => {
    finite([link.value]);
    if (link.value < 0)
      throw Error("A link weight must be non-negative.");
    if (
      !nodes.some((n) => n.id === link.source) ||
      !nodes.some((n) => n.id === link.target)
    )
      throw Error("Some links point to missing nodes.");
  });
  const legend = nodes.map((n, i) => ({
    id: n.id,
    label: n.label,
    color: colorAt(i, props.colors),
  }));
  const visible = nodes.filter((n) => !hidden.includes(n.id)),
    active = links.filter(
      (v) =>
        visible.some((n) => n.id === v.source) &&
        visible.some((n) => n.id === v.target),
    );
  const color = (id: string) => legend.find((v) => v.id === id)!.color;
  if (!visible.length) return { marks: [], legend };
  if (props.type === "sankey") {
    if (!active.length || active.every((v) => !v.value))
      return { marks: [], legend };
    const result = sankey<
      { id: string; label: string },
      { source: string; target: string; value: number }
    >()
      .nodeId((n) => n.id)
      .nodeWidth(14)
      .nodePadding(16)
      .extent([
        [l, t],
        [w - r - 90, h - b],
      ])
      .iterations(Math.min(64, Math.max(1, props.iterations ?? 24)))({
      nodes: visible.map((n) => ({ ...n })),
      links: active.filter((v) => v.value > 0).map((v) => ({ ...v })),
    });
    const flow = sankeyLinkHorizontal();
    const edgeMarks: ChartMark[] = result.links.map((link, i) => {
      const source = link.source as (typeof result.nodes)[number],
        target = link.target as (typeof result.nodes)[number],
        id = `link-${i}`;
      return {
        id,
        datum: {
          id,
          label: `${source.label} → ${target.label}`,
          seriesId: source.id,
          values: { [text.flow]: link.value },
        },
        color: color(source.id),
        x: (source.x1! + target.x0!) / 2,
        y: (link.y0! + link.y1!) / 2,
        element: (
          <path
            d={flow(link) ?? ""}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={Math.max(1, link.width ?? 0)}
          />
        ),
      };
    });
    return {
      legend,
      marks: [
        ...edgeMarks,
        ...result.nodes.map((n) => ({
          id: `node:${n.id}`,
          datum: {
            id: `node:${n.id}`,
            label: n.label,
            seriesId: n.id,
            values: { [text.flow]: n.value ?? 0 },
          },
          color: color(n.id),
          x: (n.x0! + n.x1!) / 2,
          y: (n.y0! + n.y1!) / 2,
          element: (
            <g>
              <rect
                x={n.x0}
                y={n.y0}
                width={n.x1! - n.x0!}
                height={Math.max(1, n.y1! - n.y0!)}
                fill="currentColor"
              />
              <text
                x={n.x1! + 6}
                y={(n.y0! + n.y1!) / 2 + 4}
                className={styles.markLabel}
              >
                {n.label.slice(0, 14)}
              </text>
            </g>
          ),
        })),
      ],
    };
  }
  if (props.type === "chord") {
    const matrix = visible.map((n) =>
      visible.map((target) =>
        active
          .filter((v) => v.source === n.id && v.target === target.id)
          .reduce((sum, v) => sum + v.value, 0),
      ),
    );
    if (matrix.flat().every((v) => !v)) return { marks: [], legend };
    const chords = chordDirected().padAngle(props.padAngle ?? 0.05)(matrix),
      R = Math.max(12, Math.min(W, H) / 2 - 18),
      cx = l + W / 2,
      cy = t + H / 2;
    const shape = arc<import("d3-chord").ChordGroup>()
        .innerRadius(R - 12)
        .outerRadius(R),
      ribbon = ribbonArrow<
        import("d3-chord").Chord,
        import("d3-chord").ChordSubgroup
      >().radius(R - 15);
    const edgeMarks: ChartMark[] = chords.map((ch, i) => {
      const source = visible[ch.source.index],
        target = visible[ch.target.index],
        id = `link-${i}`,
        a = (ch.source.startAngle + ch.source.endAngle) / 2,
        b = (ch.target.startAngle + ch.target.endAngle) / 2;
      return {
        id,
        datum: {
          id,
          label: `${source.label} → ${target.label}`,
          seriesId: source.id,
          values: { [text.flow]: ch.source.value },
        },
        color: color(source.id),
        x: cx + ((Math.sin(a) + Math.sin(b)) * R) / 4,
        y: cy - ((Math.cos(a) + Math.cos(b)) * R) / 4,
        element: (
          <path
            transform={`translate(${cx},${cy})`}
            d={ribbon(ch) ?? ""}
            fill="currentColor"
            fillOpacity={0.18}
          />
        ),
      };
    });
    return {
      legend,
      marks: [
        ...edgeMarks,
        ...chords.groups.map((group) => {
          const node = visible[group.index],
            a = (group.startAngle + group.endAngle) / 2;
          return {
            id: `node:${node.id}`,
            datum: {
              id: `node:${node.id}`,
              label: node.label,
              seriesId: node.id,
              values: { [text.flow]: group.value },
            },
            color: color(node.id),
            x: cx + Math.sin(a) * (R - 6),
            y: cy - Math.cos(a) * (R - 6),
            element: (
              <path
                transform={`translate(${cx},${cy})`}
                d={shape(group) ?? ""}
                fill="currentColor"
              />
            ),
          };
        }),
      ],
    };
  }
  type Node = (typeof visible)[number] & {
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
  };
  const copy: Node[] = visible.map((n) => ({ ...n }));
  const edges = active.map((v) => ({ ...v }));
  const simulation = forceSimulation(copy)
    .stop()
    .force("charge", forceManyBody().strength(-120))
    .force(
      "link",
      forceLink<Node, (typeof edges)[number]>(edges)
        .id((n) => n.id)
        .distance(65),
    )
    .force("center", forceCenter(l + W / 2, t + H / 2))
    .force("collide", forceCollide(20));
  simulation.tick(Math.min(300, Math.max(1, props.iterations ?? 120)));
  simulation.stop();
  copy.forEach((n) => {
    n.x = Math.max(l + 40, Math.min(w - r - 40, n.x ?? l));
    n.y = Math.max(t + 12, Math.min(h - b - 24, n.y ?? t));
  });
  const edgeMarks: ChartMark[] = edges.map((link, i) => {
    const source = link.source as unknown as Node,
      target = link.target as unknown as Node,
      id = `link-${i}`;
    return {
      id,
      datum: {
        id,
        label: `${source.label} → ${target.label}`,
        seriesId: source.id,
        values: { Peso: link.value },
      },
      color: color(source.id),
      x: (source.x! + target.x!) / 2,
      y: (source.y! + target.y!) / 2,
      element: (
        <line
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={Math.min(6, Math.max(1, Math.sqrt(link.value)))}
        />
      ),
    };
  });
  return {
    legend,
    marks: [
      ...edgeMarks,
      ...copy.map((n) => ({
        id: `node:${n.id}`,
        datum: {
          id: `node:${n.id}`,
          label: n.label,
          seriesId: n.id,
          values: {
            [text.connections]: active.filter(
              (v) => v.source === n.id || v.target === n.id,
            ).length,
          },
        },
        color: color(n.id),
        x: n.x,
        y: n.y,
        element: (
          <g>
            <circle cx={n.x} cy={n.y} r={7} fill="currentColor" />
            <text
              x={n.x}
              y={n.y! + 20}
              textAnchor="middle"
              className={styles.markLabel}
            >
              {n.label.slice(0, 12)}
            </text>
          </g>
        ),
      })),
    ],
  };
}
