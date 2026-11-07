// Percorre a galeria inteira e cobra, de cada elemento tocável: papel de acessibilidade,
// nome acessível e área de toque de pelo menos 44 pt (tamanho declarado + hitSlop).
import { act, create } from "react-test-renderer";
import type { ReactTestInstance } from "react-test-renderer";
import { StyleSheet } from "react-native";
import { RefyProvider } from "../src";
import { Gallery } from "../example/Gallery";
import { readFileSync } from "fs";
import refySite from "../../../src/themes/refy-site.json";

// Tema de produto extra sem trazer a marca do produto para o repositório:
// REFY_EXTRA_THEME=/caminho/tema.json npm test
const extra = process.env.REFY_EXTRA_THEME ? JSON.parse(readFileSync(process.env.REFY_EXTRA_THEME, "utf8")) : undefined;

const ROLES = new Set(["button", "radio", "checkbox", "tab", "switch", "link", "adjustable", "combobox", "togglebutton", "imagebutton"]);

type Finding = { kind: string; name: string; detail: string };

function textOf(node: ReactTestInstance | string): string {
  if (typeof node === "string") return node;
  return node.children.map(textOf).join("");
}
const sideOf = (slop: unknown, a: "top" | "left", b: "bottom" | "right") =>
  typeof slop === "number" ? 2 * slop : slop && typeof slop === "object" ? ((slop as Record<string, number>)[a] ?? 0) + ((slop as Record<string, number>)[b] ?? 0) : 0;

export function audit(root: ReactTestInstance) {
  const findings: Finding[] = [];
  const unmeasured: string[] = [];
  let checked = 0;
  const hosts = root.findAll((node) => typeof node.type === "string");
  for (const node of hosts) {
    const p = node.props;
    if (p.accessible === false) continue;
    const pressable = typeof p.onClick === "function";
    const role = p.accessibilityRole ?? p.role;
    const type = node.type as unknown as string;
    const isSwitch = type === "RCTSwitch" || type === "AndroidSwitch";
    if (!pressable && !ROLES.has(role) && !isSwitch) continue;
    checked++;
    const name = p.accessibilityLabel ?? p["aria-label"] ?? textOf(node).trim();
    if (!role && !isSwitch) findings.push({ kind: "sem papel", name, detail: type });
    if (!name && !isSwitch) findings.push({ kind: "sem nome", name: "(vazio)", detail: role ?? type });
    if (isSwitch) continue; // o Switch do sistema já tem a área de toque da plataforma
    const style = StyleSheet.flatten(p.style) ?? {};
    const h = typeof style.height === "number" ? style.height : typeof style.minHeight === "number" ? style.minHeight : undefined;
    const w = typeof style.width === "number" ? style.width : typeof style.minWidth === "number" && style.minWidth > 0 ? style.minWidth : undefined;
    if (h === undefined) { unmeasured.push(`${role}:${name}`); continue; }
    const touchH = h + sideOf(p.hitSlop, "top", "bottom");
    if (touchH < 44) findings.push({ kind: "altura < 44", name, detail: `${h} + hitSlop = ${touchH}` });
    if (w !== undefined && w + sideOf(p.hitSlop, "left", "right") < 44) findings.push({ kind: "largura < 44", name, detail: `${w} + hitSlop = ${w + sideOf(p.hitSlop, "left", "right")}` });
  }
  return { findings, unmeasured, checked };
}

const cases: [string, unknown, "light" | "dark" | "editorial"][] = [
  ["refy light", undefined, "light"],
  ["refy dark", undefined, "dark"],
  ["refy editorial", undefined, "editorial"],
  ["refy-site dark", refySite, "dark"],
  ["refy-site light", refySite, "light"],
  ...(extra ? [[`${extra.name ?? "extra"} dark`, extra, "dark"], [`${extra.name ?? "extra"} light`, extra, "light"]] as [string, unknown, "dark" | "light"][] : []),
];

describe.each(cases)("galeria %s", (_, theme, mode) => {
  test("renderiza e passa na auditoria", () => {
    jest.useFakeTimers();
    let tree!: ReturnType<typeof create>;
    act(() => { tree = create(<RefyProvider theme={theme as never} mode={mode}><Gallery initialModalOpen /></RefyProvider>); });
    act(() => { jest.runOnlyPendingTimers(); });
    const result = audit(tree.root);
    if (process.env.A11Y_REPORT) console.log(JSON.stringify({ case: _, ...result }, null, 1));
    expect(result.checked).toBeGreaterThan(60);
    expect(result.findings).toEqual([]);
    expect(result.unmeasured).toEqual([]);
    act(() => tree.unmount());
    jest.useRealTimers();
  });
});

test("controle negativo: a auditoria pega alvo pequeno e sem nome", () => {
  const { Pressable, View } = jest.requireActual("react-native");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<View><Pressable onPress={() => {}} style={{ height: 20, width: 20 }} /><Pressable accessibilityRole="button" accessibilityLabel="ok" onPress={() => {}} style={{ height: 30 }} hitSlop={6} /><Pressable accessibilityRole="button" accessibilityLabel="limite" onPress={() => {}} style={{ height: 30 }} hitSlop={7} /></View>); });
  const kinds = audit(tree.root).findings.map((f) => f.kind).sort();
  expect(kinds).toEqual(["altura < 44", "altura < 44", "largura < 44", "sem nome", "sem papel"]);
});

test("menus, popover e tooltip abertos passam na auditoria", async () => {
  const { Menu, Popover, Tooltip, SplitButton, FabMenu, Button, Checkbox } = require("../src");
  let tree!: ReturnType<typeof create>;
  const noop = () => {};
  act(() => {
    tree = create(<RefyProvider>
      <Menu open onOpenChange={noop} entries={[{ type: "label", label: "Arquivo" }, { id: "a", label: "Editar" }, { type: "separator" }, { id: "b", label: "Vender", disabled: true }]}><Button>Ações</Button></Menu>
      <Popover open onOpenChange={noop} label="Filtros" content={<Checkbox label="Só publicado" />}><Button>Filtrar</Button></Popover>
      <Tooltip defaultOpen label="Copiar"><Button>Compartilhar</Button></Tooltip>
      <SplitButton defaultOpen size="sm" label="Salvar" options={[{ label: "rascunho" }]} />
      <FabMenu defaultOpen actions={[{ id: "x", label: "Adicionar" }]} />
    </RefyProvider>);
  });
  await act(async () => {});
  const result = audit(tree.root);
  expect(result.checked).toBeGreaterThanOrEqual(10);
  expect(result.findings).toEqual([]);
  expect(result.unmeasured).toEqual([]);
  act(() => tree.unmount());
});
