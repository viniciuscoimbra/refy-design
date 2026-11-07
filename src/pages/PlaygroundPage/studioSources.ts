import type { ComponentType, ReactNode } from "react";
import componentHooks from "../../tokens/component-hooks.json";

/**
 * Draft (Playground proposal): everything the studio shows about a component comes from files
 * that already exist — the story meta (component, args, argTypes) and the component's CSS module
 * (the tokens it reads). Nothing is written by hand per component.
 */
type StoryModule = {
  default: { component?: ComponentType<Record<string, unknown>>; args?: Record<string, unknown>; argTypes?: Record<string, ArgType> };
  [story: string]: unknown;
};
export interface ArgType {
  control?: string | false | { type?: string };
  options?: readonly (string | number)[];
}
export interface StudioControl {
  name: string;
  kind: "options" | "boolean" | "text";
  options?: (string | number)[];
}
type StoryObject = { args?: Record<string, unknown>; render?: (args: Record<string, unknown>, context: unknown) => ReactNode; name?: string };
export interface StudioSource {
  component?: ComponentType<Record<string, unknown>>;
  args: Record<string, unknown>;
  controls: StudioControl[];
  /** Exported stories, in file order: the documentation's own examples. */
  examples: { id: string; label: string }[];
  example?: string;
  /** Set when the example renders itself (organisms that keep their own open/selected state). */
  render?: StoryObject["render"];
}

const stories = import.meta.glob<StoryModule>("../../components/*/*.stories.tsx");
// Generated documentation (npm run agent:build): each example's real source, by story name.
const documents = import.meta.glob<{ id: string; code: string }[]>("../../../ai/components/*.json", { import: "examples" });

/** Source of a documentation example, for examples that render themselves (the props do not describe them). */
export async function loadExampleCode(id: string, example: string) {
  const load = documents[`../../../ai/components/${id}.json`];
  return load ? (await load()).find((item) => item.id === example)?.code : undefined;
}
const styles = import.meta.glob<string>("../../components/*/*.module.css", { query: "?raw", import: "default" });

const storyPath = (id: string) => `../../components/${id}/${id}.stories.tsx`;
const stylePath = (id: string) => `../../components/${id}/${id}.module.css`;

export const hasStory = (id: string) => storyPath(id) in stories;

function controlKind(type: ArgType["control"]) {
  return typeof type === "string" ? type : type ? type.type : undefined;
}

// The preview starts from the component's plain story when there is one (not a loading or error state).
const plain = /^(primary|primario|padrao|default|basico|basic|playground)$/i;

/** Story meta args, then the plain (or first) exported story's args, so the preview starts like the documentation does. */
export async function loadStudioSource(id: string, exampleId?: string): Promise<StudioSource> {
  const load = stories[storyPath(id)];
  if (!load) return { args: {}, controls: [], examples: [] };
  const module = await load();
  const meta = module.default;
  const all = Object.entries(module).filter(([key, value]) => key !== "default" && value && typeof value === "object") as [string, StoryObject][];
  const examples = all.map(([key, story]) => ({ id: key, label: story.name ?? key.replace(/([a-z])([A-Z])/g, "$1 $2") }));
  const withArgs = all.filter(([, story]) => story.args);
  const first = all.find(([key]) => key === exampleId) ?? all.find(([key]) => plain.test(key)) ?? withArgs[0] ?? all[0];
  const args = { ...meta.args, ...(first?.[1].args ?? {}) };
  const controls: StudioControl[] = [];
  for (const [name, type] of Object.entries(meta.argTypes ?? {})) {
    const kind = controlKind(type.control);
    if (type.control === false || !kind) continue;
    if (type.options?.length) controls.push({ name, kind: "options", options: [...type.options] });
    else if (kind === "boolean") controls.push({ name, kind: "boolean" });
    else if (kind === "text") controls.push({ name, kind: "text" });
  }
  if (!controls.some((control) => control.name === "children") && typeof args.children === "string")
    controls.unshift({ name: "children", kind: "text" });
  return { component: meta.component, args, controls, examples, example: first?.[0], render: first?.[1].render };
}

/** Tokens the component's own CSS reads: its component hooks first, then the foundation it relies on. */
export async function loadComponentTokens(id: string): Promise<{ hooks: string[]; foundation: string[] }> {
  const load = styles[stylePath(id)];
  if (!load) return { hooks: [], foundation: [] };
  const css = await load();
  const names = [...new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]))];
  const hooks = new Set(componentHooks as string[]);
  return {
    hooks: names.filter((name) => hooks.has(name)),
    foundation: names.filter((name) => !hooks.has(name)),
  };
}

/** Serializable args only: they cross into the preview frame and into the code sample. */
export function plainArgs(args: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(args).filter(([, value]) => ["string", "number", "boolean"].includes(typeof value)),
  ) as Record<string, string | number | boolean>;
}

export function jsxSample(id: string, args: Record<string, string | number | boolean>) {
  const { children, ...rest } = args;
  const props = Object.entries(rest)
    .filter(([, value]) => value !== "" && value !== false)
    .map(([name, value]) => (value === true ? name : typeof value === "string" ? `${name}="${value}"` : `${name}={${String(value)}}`));
  const open = `<${id}${props.length ? " " + props.join(" ") : ""}`;
  return `import { ${id} } from "@refy-design/web";\n\n${children !== undefined ? `${open}>${children}</${id}>` : `${open} />`}`;
}
