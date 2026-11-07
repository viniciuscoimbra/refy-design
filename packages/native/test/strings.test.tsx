import { act, create } from "react-test-renderer";
import { RefyProvider } from "../src";
import { Gallery } from "../example/Gallery";
// iOS recusa texto solto fora de <Text> ("Text strings must be rendered within a <Text>"); o simulador achou um em 06/11.
test("galeria não tem texto solto fora de <Text>", () => {
  jest.useFakeTimers();
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Gallery initialModalOpen /></RefyProvider>); });
  act(() => { jest.runOnlyPendingTimers(); });
  const bad: string[] = [];
  const walk = (n: any, path: string[]) => {
    if (n == null || typeof n !== "object") return;
    if (Array.isArray(n)) { n.forEach((c) => walk(c, path)); return; }
    const kids = n.children ?? [];
    if (n.type !== "Text" && !String(n.type).includes("Text")) for (const c of kids) if (typeof c === "string") bad.push(`${n.type} <- ${JSON.stringify(c)} @ ${path.slice(-4).join(">")}`);
    for (const c of kids) walk(c, [...path, `${n.type}${n.props?.accessibilityLabel ? `[${n.props.accessibilityLabel}]` : ""}`]);
  };
  walk(tree.toJSON(), []);
  expect(bad).toEqual([]);
  act(() => tree.unmount());
  jest.useRealTimers();
});
