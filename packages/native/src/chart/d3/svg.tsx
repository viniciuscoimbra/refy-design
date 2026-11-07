// Traduz o SVG do DOM que as cenas da web montam para react-native-svg, com as classes do
// D3Chart.module.css resolvidas no tema. Como no CSS, a classe vence o atributo do elemento.
import { Children, Fragment, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, Polyline, Rect, Stop, Text, TSpan } from "react-native-svg";
import type { RefyContext } from "../../theme";

const tags: Record<string, unknown> = {
  g: G, path: Path, rect: Rect, circle: Circle, line: Line, text: Text, tspan: TSpan, defs: Defs,
  linearGradient: LinearGradient, stop: Stop, clipPath: ClipPath, polygon: Polygon, polyline: Polyline, ellipse: Ellipse,
};
const colorKeys = ["fill", "stroke", "stopColor", "color"];

/** "var(--x, var(--y))" resolvido no tema nativo. */
export function resolveColor(t: RefyContext, value: string): string {
  const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(value.trim());
  if (!match) return value;
  const fallback = match[2] ? resolveColor(t, match[2]) : "#888888";
  return t.pick<string>(match[1], fallback);
}

function classStyle(t: RefyContext, className: string | undefined): Record<string, unknown> {
  if (!className) return {};
  const xs = t.pick<number>("--text-xs", 12);
  const body = t.font("--font-body", "--weight-regular").fontFamily;
  const out: Record<string, unknown> = {};
  for (const name of className.split(/\s+/)) {
    if (name === "axes") Object.assign(out, { fill: t.pick<string>("--ink-3"), fontSize: xs, fontFamily: body });
    else if (name === "grid") Object.assign(out, { stroke: t.pick<string>("--line"), strokeWidth: 1, opacity: 0.4 });
    else if (name === "axisLine" || name === "links") Object.assign(out, { stroke: t.pick<string>("--ink-4", "--ink-3"), strokeWidth: 1 });
    else if (name === "track") Object.assign(out, { fill: t.pick<string>("--surface-2") });
    else if (name === "markLabel") Object.assign(out, { fill: t.pick<string>("--ink-1"), stroke: "none", fontSize: xs, fontFamily: body });
    else if (name === "centerValue") Object.assign(out, { fill: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--text-h3", 22), fontWeight: "600", fontFamily: body });
  }
  return out;
}

/** Converte a árvore; `color` é o `currentColor` herdado da marca. */
export function toNativeSvg(node: ReactNode, t: RefyContext, color: string, key?: string | number): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return null;
  if (typeof node === "string" || typeof node === "number") return node;
  if (Array.isArray(node)) return node.map((child, i) => toNativeSvg(child, t, color, i));
  if (!isValidElement(node)) return null;
  const element = node as ReactElement<Record<string, unknown>>;
  if (element.type === Fragment) return Children.toArray(element.props.children as ReactNode).map((child, i) => toNativeSvg(child, t, color, i));
  if (typeof element.type !== "string") return node;
  const Component = tags[element.type] as ((p: Record<string, unknown>) => ReactNode) | undefined;
  if (!Component) return null;
  const { children, className, style, ...rest } = element.props;
  const props: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(rest)) {
    if (name.startsWith("aria-") || name.startsWith("data-") || name === "role" || name === "tabIndex") continue;
    props[name] = value;
  }
  Object.assign(props, style as object, classStyle(t, className as string | undefined));
  const ownColor = typeof props.color === "string" ? resolveColor(t, props.color) : color;
  for (const name of colorKeys) {
    const value = props[name];
    if (typeof value !== "string") continue;
    props[name] = value === "currentColor" ? ownColor : resolveColor(t, value);
  }
  delete props.color;
  const kids = Children.toArray(children as ReactNode).filter((child) => !(isValidElement(child) && ((child.type as string) === "title" || (child.type as string) === "desc")));
  const converted = kids.map((child, i) => toNativeSvg(child, t, ownColor, i));
  const nodeKey = element.key ?? key;
  return element.type === "text" || element.type === "tspan"
    ? <Component key={nodeKey} {...props}>{converted.length === 1 ? converted[0] : converted}</Component>
    : <Component key={nodeKey} {...props}>{converted}</Component>;
}
