import { act, create } from "react-test-renderer";
import { Text, TextInput } from "react-native";
import { Badge, RefyProvider } from "../src";
import refySite from "../../../src/themes/refy-site.json";

test("Badge renderiza com tema de produto", () => {
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider theme={refySite as never} mode="dark"><Badge tone="success" dot>Sincronizado</Badge></RefyProvider>); });
  expect(tree.root.findByType(Text).props.children).toBe("Sincronizado");
});

test("Switch, Checkbox e RadioGroup mudam de estado no toque e anunciam o estado", () => {
  const { Switch, Checkbox, RadioGroup } = require("../src");
  const changes: unknown[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<RefyProvider>
      <Switch accessibilityLabel="Avisos" onCheckedChange={(v: boolean) => changes.push(["switch", v])} />
      <Checkbox label="Ofertas" defaultChecked onCheckedChange={(v: boolean) => changes.push(["check", v])} />
      <RadioGroup label="Entrega" defaultValue="pac" onChange={(v: string) => changes.push(["radio", v])} options={[{ value: "pac", label: "PAC" }, { value: "sedex", label: "Sedex" }]} />
    </RefyProvider>);
  });
  const controls = () => tree.root.findAll((n) => typeof n.type === "string" && ["switch", "checkbox", "radio"].includes(n.props.accessibilityRole));
  const states = () => controls().map((p) => p.props.accessibilityState);
  expect(states().map((s) => s.checked)).toEqual([false, true, true, false]);
  for (const i of [0, 1, 3]) act(() => { controls()[i].props.onClick({}); });
  expect(changes).toEqual([["switch", true], ["check", false], ["radio", "sedex"]]);
  expect(states().map((s) => s.checked)).toEqual([true, false, false, true]);
});

test("Divider é separador e o rótulo aparece só na horizontal", () => {
  const { Divider } = require("../src");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Divider label="ou" /><Divider orientation="vertical" label="ou" /></RefyProvider>); });
  const separators = tree.root.findAll((n) => n.props.role === "separator" && typeof n.type === "string");
  expect(separators).toHaveLength(2);
  expect(tree.root.findAllByType(Text).map((n) => n.props.children)).toEqual(["ou"]);
});

test("Slider e Range andam um passo pelo leitor de tela e o mínimo não passa do máximo", async () => {
  const { Slider, Range } = require("../src");
  const got: unknown[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<RefyProvider>
      <Slider label="Volume" defaultValue={10} step={5} onChange={(v: number) => got.push(["slider", v])} />
      <Range label="Preço" defaultValue={[40, 50]} step={10} onChange={(v: number[]) => got.push(["range", v])} />
    </RefyProvider>);
  });
  await act(async () => {}); // a consulta de movimento reduzido responde depois da montagem
  const adjustables = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "adjustable");
  expect(adjustables().map((n) => n.props.accessibilityLabel)).toEqual(["Volume", "Preço — mínimo", "Preço — máximo"]);
  act(() => adjustables()[0].props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  act(() => adjustables()[1].props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  act(() => adjustables()[1].props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  expect(got).toEqual([["slider", 15], ["range", [50, 50]]]);
  expect(adjustables()[0].props.accessibilityValue).toMatchObject({ now: 15, text: "15" });
});

test("Pagination segue a sequência da web e desliga as setas nos limites", () => {
  const { Pagination, paginationPages } = require("../src");
  expect(paginationPages(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
  expect(paginationPages(6, 20, 1)).toEqual([1, "…", 5, 6, 7, "…", 20]);
  expect(paginationPages(2, 20, 1)).toEqual([1, 2, 3, "…", 20]);
  const pages: number[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Pagination page={1} pageCount={3} onPageChange={(p: number) => pages.push(p)} /></RefyProvider>); });
  const buttons = tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
  expect(buttons.map((b) => [b.props.accessibilityLabel, b.props.accessibilityState.disabled])).toEqual([["Página anterior", true], ["Página 1", false], ["Página 2", false], ["Página 3", false], ["Próxima página", false]]);
  act(() => buttons[4].props.onClick({}));
  expect(pages).toEqual([2]);
});

test("Otp distribui o código colado e avisa quando completa", () => {
  const { Otp } = require("../src");
  const { TextInput } = require("react-native");
  const done: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Otp length={4} onComplete={(c: string) => done.push(c)} /></RefyProvider>); });
  act(() => tree.root.findAllByType(TextInput)[0].props.onChangeText("12a34"));
  expect(done).toEqual(["1234"]);
  expect(tree.root.findAllByType(TextInput).map((i) => i.props.value)).toEqual(["1", "2", "3", "4"]);
});

test("ToggleGroup liga e desliga cada opção sem mexer nas outras", () => {
  const { ToggleGroup } = require("../src");
  const got: string[][] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><ToggleGroup defaultValue={["a"]} onChange={(v: string[]) => got.push(v)} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} /></RefyProvider>); });
  const toggles = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "togglebutton");
  act(() => toggles()[1].props.onClick({}));
  act(() => toggles()[0].props.onClick({}));
  expect(got).toEqual([["a", "b"], ["b"]]);
  expect(toggles().map((n) => n.props.accessibilityState.selected)).toEqual([false, true]);
});

test("Accordion single fecha o anterior; multiple mantém os dois abertos", async () => {
  const { Accordion } = require("../src");
  const items = [{ id: "a", title: "A", content: "conteúdo A" }, { id: "b", title: "B", content: "conteúdo B" }];
  for (const [type, expected] of [["single", ["b"]], ["multiple", ["a", "b"]]] as const) {
    const got: string[][] = [];
    let tree!: ReturnType<typeof create>;
    act(() => { tree = create(<RefyProvider><Accordion type={type} defaultValue={["a"]} items={items} onChange={(v: string[]) => got.push(v)} /></RefyProvider>); });
    await act(async () => {});
    const triggers = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
    act(() => triggers()[1].props.onClick({}));
    expect(got.pop()).toEqual(expected);
    expect(triggers().map((n) => n.props.accessibilityState.expanded)).toEqual([type === "multiple", true]);
    const texts = tree.root.findAllByType(Text).map((n) => n.props.children);
    expect(texts.includes("conteúdo A")).toBe(type === "multiple");
  }
});

test("ButtonGroup deixa só a opção ativa como primária e avisa o índice", () => {
  const { ButtonGroup, Button } = require("../src");
  const got: number[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><ButtonGroup label="Ordem" onActiveIndexChange={(i: number) => got.push(i)}><Button>A</Button><Button>B</Button></ButtonGroup></RefyProvider>); });
  const buttons = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
  act(() => buttons()[1].props.onClick({}));
  expect(got).toEqual([1]);
  expect(buttons().map((b) => b.props.accessibilityState.selected)).toEqual([false, true]);
});

test("AvatarGroup mostra no máximo max e resume o resto no +N", () => {
  const { AvatarGroup, initialsOf } = require("../src");
  expect(initialsOf("ana maria souza")).toBe("AS");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><AvatarGroup max={2} items={[{ name: "Ana Souza" }, { name: "Leo Lima" }, { name: "Lia Melo" }, { name: "Rui Costa" }]} /></RefyProvider>); });
  expect(tree.root.findAll((n) => typeof n.type === "string" && (n.props.accessible === true || n.props.role === "group") && typeof n.props.accessibilityLabel === "string").map((n) => n.props.accessibilityLabel))
    .toEqual(["4 pessoas", "Ana Souza", "Leo Lima", "Mais 2 pessoas: Lia Melo, Rui Costa"]);
});

test("Callout dispensado sai e avisa depois da transição", async () => {
  const { Callout } = require("../src");
  const done: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Callout title="Aviso" dismissible onDismiss={() => done.push("x")} /></RefyProvider>); });
  await act(async () => {});
  jest.useFakeTimers();
  const close = tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Dispensar aviso");
  act(() => close.props.onClick({}));
  act(() => { jest.runAllTimers(); });
  expect(done).toEqual(["x"]);
  expect(tree.toJSON()).toBeNull();
  jest.useRealTimers();
});

test("UsageMeter e ScoreGauge usam as mesmas faixas da web", () => {
  const { usageTone, scoreBand, UsageMeter } = require("../src");
  expect([usageTone(79), usageTone(80), usageTone(100), usageTone(50, 40, 60)]).toEqual(["primary", "warn", "critical", "warn"]);
  expect([scoreBand(70), scoreBand(69), scoreBand(39)]).toEqual(["ok", "warn", "critical"]);
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><UsageMeter label="Fotos" used={1050} limit={1000} unit="arquivos" /></RefyProvider>); });
  const bar = tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityRole === "progressbar");
  expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 100, text: "1.050 de 1.000 arquivos" });
});

test("NavCard desligado não responde ao toque", () => {
  const { NavCard } = require("../src");
  const presses: number[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><NavCard title="A" onPress={() => presses.push(1)} /><NavCard disabled title="B" onPress={() => presses.push(2)} /></RefyProvider>); });
  const cards = tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
  act(() => { cards.forEach((c) => c.props.onClick?.({})); });
  expect(presses).toEqual([1]);
  expect(cards.map((c) => c.props.accessibilityState.disabled)).toEqual([false, true]);
});

test("Menu escolhe, chama os dois callbacks, fecha e ignora item desligado", async () => {
  const { Menu, Button } = require("../src");
  const calls: unknown[] = [];
  let open = true;
  let tree!: ReturnType<typeof create>;
  const render = () => <RefyProvider><Menu open={open} onOpenChange={(v: boolean) => { open = v; calls.push(["open", v]); }} onSelect={(id: string) => calls.push(["select", id])} entries={[{ type: "label", label: "Arquivo" }, { id: "a", label: "Editar", onSelect: () => calls.push(["item", "a"]) }, { type: "separator" }, { id: "b", label: "Vender", disabled: true }]}><Button>Ações</Button></Menu></RefyProvider>;
  act(() => { tree = create(render()); });
  await act(async () => {});
  const items = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.role === "menuitem");
  expect(items().map((n) => n.props.accessibilityLabel)).toEqual(["Editar", "Vender"]);
  expect(tree.root.findAll((n) => typeof n.type === "string" && n.props.role === "separator")).toHaveLength(1);
  act(() => { items()[1].props.onClick?.({}); });
  expect(calls).toEqual([]);
  act(() => { items()[0].props.onClick({}); });
  expect(calls).toEqual([["item", "a"], ["select", "a"], ["open", false]]);
  act(() => tree.unmount());
});

test("SplitButton troca a ação principal pela opção escolhida", async () => {
  const { SplitButton } = require("../src");
  const runs: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><SplitButton label="Exportar" onClick={() => runs.push("click")} options={[{ id: "csv", label: "CSV", onSelect: () => runs.push("csv") }, { id: "pdf", label: "PDF", onSelect: () => runs.push("pdf") }]} /></RefyProvider>); });
  await act(async () => {});
  const buttons = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
  expect(buttons().map((b) => b.props.accessibilityLabel)).toEqual(["Exportar CSV", "Mais opções"]);
  act(() => { buttons()[1].props.onClick({}); });
  await act(async () => {});
  expect(buttons()[1].props.accessibilityState.expanded).toBe(true);
  const pdf = tree.root.findAll((n) => typeof n.type === "string" && n.props.role === "menuitem")[1];
  act(() => { pdf.props.onClick({}); });
  await act(async () => {});
  expect(buttons()[0].props.accessibilityLabel).toBe("Exportar PDF");
  act(() => { buttons()[0].props.onClick({}); });
  expect(runs).toEqual(["pdf", "pdf", "click"]);
  act(() => tree.unmount());
});

test("Tooltip abre no toque longo e põe o texto no hint do gatilho", async () => {
  const { Tooltip, Button } = require("../src");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Tooltip label="Copiar link" description="Vale por 7 dias"><Button>Compartilhar</Button></Tooltip></RefyProvider>); });
  await act(async () => {});
  const trigger = tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
  expect(trigger.props.accessibilityHint).toBe("Copiar link. Vale por 7 dias");
  expect(tree.root.findAll((n) => n.props.children === "Copiar link")).toHaveLength(0);
  act(() => { tree.root.findByType(Button).props.onLongPress({}); });
  await act(async () => {});
  expect(tree.root.findAll((n) => typeof n.type === "string" && n.props.children === "Copiar link").length).toBeGreaterThan(0);
  act(() => tree.unmount());
});

test("Snackbar anuncia como status e a ação responde", () => {
  const { Snackbar } = require("../src");
  const undo: number[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Snackbar action={{ label: "Desfazer", onClick: () => undo.push(1) }}>Arquivo movido</Snackbar></RefyProvider>); });
  const root = tree.root.find((n) => typeof n.type === "string" && n.props.role === "status");
  expect(root.props.accessibilityLiveRegion).toBe("polite");
  act(() => { tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityRole === "button").props.onClick({}); });
  expect(undo).toEqual([1]);
});

test("FabMenu troca o nome do gatilho e fecha ao escolher", async () => {
  const { FabMenu } = require("../src");
  const picked: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><FabMenu onSelect={(id: string) => picked.push(id)} actions={[{ id: "add", label: "Adicionar arquivo" }, { id: "scan", label: "Ler código" }]} /></RefyProvider>); });
  await act(async () => {});
  const fab = () => tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
  expect(fab().props.accessibilityLabel).toBe("Abrir ações");
  act(() => { fab().props.onClick({}); });
  await act(async () => {});
  expect(fab().props.accessibilityLabel).toBe("Fechar ações");
  act(() => { tree.root.findAll((n) => typeof n.type === "string" && n.props.role === "menuitem")[1].props.onClick({}); });
  await act(async () => {});
  expect(picked).toEqual(["scan"]);
  expect(fab().props.accessibilityLabel).toBe("Abrir ações");
  act(() => tree.unmount());
});

test("Calendar marca o dia, fecha o intervalo e respeita o mínimo", () => {
  const { Calendar, nextRange } = require("../src");
  const picks: unknown[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Calendar mode="range" defaultMonth={new Date(2026, 10, 1)} min={new Date(2026, 10, 5)} onChange={(v: unknown) => picks.push(v)} /></RefyProvider>); });
  const days = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "button" && /2026/.test(n.props.accessibilityLabel ?? ""));
  expect(days()).toHaveLength(42);
  const day = (n: number) => days().find((d) => d.props.accessibilityLabel.includes(` ${n} de novembro`))!;
  expect(day(4).props.accessibilityState.disabled).toBe(true);
  act(() => { day(10).props.onClick({}); });
  act(() => { day(14).props.onClick({}); });
  expect(day(10).props.accessibilityState.selected).toBe(true);
  expect(day(14).props.accessibilityState.selected).toBe(true);
  expect(picks).toHaveLength(2);
  expect(nextRange({ start: new Date(2026, 0, 10), end: null }, new Date(2026, 0, 2))).toEqual({ start: new Date(2026, 0, 2), end: null });
});

test("PhoneInput formata o número brasileiro enquanto digita", () => {
  const { PhoneInput } = require("../src");
  const { TextInput } = require("react-native");
  const typed: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><PhoneInput label="Celular" value="31987654321" onChangeText={(v: string) => typed.push(v)} /></RefyProvider>); });
  const input = tree.root.findByType(TextInput);
  expect(input.props.value).toBe("(31) 98765-4321");
  act(() => { input.props.onChangeText("3198"); });
  expect(typed).toEqual(["(31) 98"]);
});

test("PostalCodeInput põe a máscara, busca e avisa a cidade", async () => {
  const { PostalCodeInput, Button } = require("../src");
  const found: unknown[] = [];
  const typed: string[] = [];
  let tree!: ReturnType<typeof create>;
  const lookup = async (cep: string) => (cep === "30130000" ? { postalCode: cep, street: "Av. Afonso Pena", neighborhood: "Centro", city: "Belo Horizonte", state: "MG" } : null);
  act(() => { tree = create(<RefyProvider><PostalCodeInput value="30130-000" onChangeText={(v: string) => typed.push(v)} lookup={lookup} onAddressFound={(a: unknown) => found.push(a)} /></RefyProvider>); });
  const { TextInput } = require("react-native");
  act(() => { tree.root.findByType(TextInput).props.onChangeText("301300001"); });
  expect(typed).toEqual(["30130-000"]);
  await act(async () => { tree.root.findByType(Button).props.onPress(); });
  expect(found).toHaveLength(1);
  expect(tree.root.find((n) => typeof n.type === "string" && n.props.role === "status").props.children).toBe("Endereço encontrado em Belo Horizonte, MG.");
});

test("HelpField passa a ajuda para o campo e o ícone tem nome", () => {
  const { HelpField, Input } = require("../src");
  const { TextInput } = require("react-native");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><HelpField label="Comissão" helpText="Parte que fica com quem indicou."><Input /></HelpField></RefyProvider>); });
  expect(tree.root.findByType(TextInput).props.accessibilityHint).toBe("Parte que fica com quem indicou.");
  expect(tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Ajuda: Comissão").props.accessibilityRole).toBe("button");
});

test("HelpField abre a ajuda no toque e o Saber mais chama o app", async () => {
  const { HelpField, Input } = require("../src");
  const more: number[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><HelpField label="Comissão" helpText="Parte que fica com quem indicou." onLearnMore={() => more.push(1)}><Input /></HelpField></RefyProvider>); });
  act(() => { tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Ajuda: Comissão").props.onClick({}); });
  await act(async () => {});
  const link = tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityRole === "link");
  act(() => { link.props.onClick({}); });
  expect(more).toEqual([1]);
  act(() => tree.unmount());
});

test("Combobox filtra, separa por grupo e escolhe", () => {
  const { Combobox, comboboxSections } = require("../src");
  const { TextInput } = require("react-native");
  const picked: unknown[] = [];
  const options = [{ value: "a", label: "Ana", group: "Equipe" }, { value: "b", label: "Bruno", group: "Equipe" }, { value: "c", label: "Mariana", group: "Parceiros" }];
  expect(comboboxSections(options, "an").sections.map((s: { group: string; items: unknown[] }) => [s.group, s.items.length])).toEqual([["Equipe", 1], ["Parceiros", 1]]);
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Combobox label="Pessoa" options={options} onChange={(o: { value: string } | null) => picked.push(o?.value ?? null)} /></RefyProvider>); });
  act(() => { tree.root.findByType(TextInput).props.onChangeText("br"); });
  const rows = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.role === "option");
  expect(rows().map((r) => r.props.accessibilityLabel)).toEqual(["Bruno"]);
  act(() => { rows()[0].props.onClick({}); });
  expect(picked).toEqual(["b"]);
  expect(tree.root.findByType(TextInput).props.value).toBe("Bruno");
  act(() => { tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Limpar").props.onClick({}); });
  expect(picked).toEqual(["b", null]);
});

test("Multiselect marca e desmarca e o +N segue a conta da web", () => {
  const { Multiselect, visibleChipCount } = require("../src");
  expect(visibleChipCount([60, 60, 60], 4, 200, 30)).toBe(3);
  expect(visibleChipCount([60, 60, 60], 4, 180, 30)).toBe(2);
  expect(visibleChipCount([60, 60, 60], 4, 120, 30)).toBe(1);
  expect(visibleChipCount([60, 60, 60], 4, 400, 30, 1)).toBe(1);
  const changes: string[][] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Multiselect label="Áreas" defaultValue={["a"]} onChange={(v: string[]) => changes.push(v)} options={[{ value: "a", label: "Design" }, { value: "b", label: "Produto" }]} /></RefyProvider>); });
  act(() => { tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Abrir opções").props.onClick({}); });
  const rows = () => tree.root.findAll((n) => typeof n.type === "string" && n.props.role === "option");
  expect(rows().map((r) => r.props.accessibilityState.selected)).toEqual([true, false]);
  act(() => { rows()[1].props.onClick({}); });
  act(() => { tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Remover Design").props.onClick({}); });
  expect(changes).toEqual([["a", "b"], ["b"]]);
});

test("Carousel avança, para nas pontas e avisa o índice", async () => {
  const { Carousel } = require("../src");
  const { Text: T } = require("react-native");
  const seen: number[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Carousel onIndexChange={(i: number) => seen.push(i)} items={[{ id: "a", label: "A", content: <T>A</T> }, { id: "b", label: "B", content: <T>B</T> }]} /></RefyProvider>); });
  await act(async () => {});
  const btn = (name: string) => tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === name);
  expect(btn("Conteúdo anterior").props.accessibilityState.disabled).toBe(true);
  act(() => { btn("Próximo conteúdo").props.onClick({}); });
  expect(seen).toEqual([1]);
  expect(btn("Próximo conteúdo").props.accessibilityState.disabled).toBe(true);
  act(() => tree.unmount());
});

test("CodeBlock mascara o segredo, revela e copia o valor real", async () => {
  const { CodeBlock, maskSecret } = require("../src");
  const copied: string[] = [];
  expect(maskSecret("abc", 4)).toBe("•".repeat(16));
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><CodeBlock secret label="Chave" code="chave-de-exemplo-3456" copyToClipboard={(c: string) => { copied.push(c); }} /></RefyProvider>); });
  const texts = () => tree.root.findAll((n) => typeof n.type === "string" && typeof n.props.children === "string").map((n) => n.props.children);
  expect(texts()).toContain("•".repeat(16) + "3456");
  act(() => { tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Revelar valor").props.onClick({}); });
  expect(texts()).toContain("chave-de-exemplo-3456");
  await act(async () => { tree.root.find((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Copiar código").props.onClick({}); });
  expect(copied).toEqual(["chave-de-exemplo-3456"]);
  expect(texts()).toContain("Copiado");
  act(() => tree.unmount());
});

test("CodeBlock sem área de transferência injetada não mostra o botão copiar", () => {
  const { CodeBlock } = require("../src");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><CodeBlock code="npm i" /></RefyProvider>); });
  expect(tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityLabel === "Copiar código")).toHaveLength(0);
});

test("PlanCard atual trava o CTA e DangerZoneRow só pede confirmação", () => {
  const { PlanCard, DangerZone, DangerZoneRow } = require("../src");
  const asked: number[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><PlanCard current name="Grátis" price="R$ 0" /><DangerZone title="Perigo"><DangerZoneRow title="Excluir" actionLabel="Excluir" onConfirm={() => asked.push(1)} /></DangerZone></RefyProvider>); });
  const buttons = tree.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityRole === "button");
  expect(buttons.map((b) => [b.props.accessibilityLabel, b.props.accessibilityState.disabled])).toEqual([["Plano atual", true], ["Excluir", false]]);
  act(() => { buttons[1].props.onClick({}); });
  expect(asked).toEqual([1]);
});

const hosts = (tree: ReturnType<typeof create>, pred: (p: Record<string, any>) => boolean) => tree.root.findAll((n) => typeof n.type === "string" && pred(n.props));

test("UserMenu abre a conta e devolve o item escolhido", async () => {
  const { UserMenu } = require("../src");
  const picked: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><UserMenu user={{ name: "Ana", email: "ana@x.com", initials: "AN" }} onSelect={(id: string) => picked.push(id)} /></RefyProvider>); });
  await act(async () => {});
  const trigger = hosts(tree, (p) => p.accessibilityLabel === "Conta de Ana")[0];
  act(() => { trigger.props.onClick({}); });
  await act(async () => {});
  const items = hosts(tree, (p) => p.role === "menuitem");
  expect(items.map((i) => i.props.accessibilityLabel)).toEqual(["Perfil", "Configurações", "Sair"]);
  act(() => { items[2].props.onClick({}); });
  expect(picked).toEqual(["logout"]);
  act(() => tree.unmount());
});

test("NotificationBell conta as não lidas, marca todas e fecha ao escolher", async () => {
  const { NotificationBell } = require("../src");
  const log: string[] = [];
  let tree!: ReturnType<typeof create>;
  const items = [{ id: "a", title: "A", unread: true }, { id: "b", title: "B", unread: true }, { id: "c", title: "C" }];
  act(() => { tree = create(<RefyProvider><NotificationBell items={items} onMarkAllRead={() => log.push("all")} onItemClick={(i: { id: string }) => log.push(i.id)} /></RefyProvider>); });
  await act(async () => {});
  const bell = hosts(tree, (p) => p.accessibilityLabel === "Notificações: 2 não lidas")[0];
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === 2)).toBe(true);
  act(() => { bell.props.onClick({}); });
  await act(async () => {});
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Marcar todas como lidas")[0].props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "B, não lida")[0].props.onClick({}); });
  expect(log).toEqual(["all", "b"]);
  act(() => tree.unmount());
});

test("WorkspaceSwitcher busca a partir de 5 ambientes e troca o atual", async () => {
  const { WorkspaceSwitcher } = require("../src");
  const changed: string[] = [];
  const list = ["Alfa", "Beta", "Gama", "Delta", "Épsilon"].map((name, i) => ({ id: `w${i}`, name, initials: name.slice(0, 2) }));
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><WorkspaceSwitcher workspaces={list} onChange={(w: { id: string }) => changed.push(w.id)} /></RefyProvider>); });
  await act(async () => {});
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Ambiente atual: Alfa. Trocar ambiente")[0].props.onClick({}); });
  await act(async () => {});
  act(() => { tree.root.findAllByType(TextInput)[0].props.onChangeText("ta"); });
  const options = () => hosts(tree, (p) => p.role === "option");
  expect(options().map((o) => o.props.accessibilityLabel)).toEqual(["Beta", "Delta"]);
  act(() => { options()[1].props.onClick({}); });
  expect(changed).toEqual(["w3"]);
  expect(hosts(tree, (p) => p.accessibilityLabel === "Ambiente atual: Delta. Trocar ambiente")).toHaveLength(1);
  act(() => tree.unmount());
});

test("SettingsSubnav marca o ativo e avisa a navegação", () => {
  const { SettingsSubnav } = require("../src");
  const went: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><SettingsSubnav activeHref="/b" onNavigate={(i: { href: string }) => went.push(i.href)} items={[{ href: "/a", label: "A" }, { href: "/b", label: "B", description: "Bê" }]} /></RefyProvider>); });
  const links = hosts(tree, (p) => p.role === "link");
  expect(links.map((l) => [l.props.accessibilityLabel, l.props.accessibilityState.selected])).toEqual([["A", false], ["B, Bê", true]]);
  act(() => { links[0].props.onClick({}); });
  expect(went).toEqual(["/a"]);
});

test("PropertyActionGroup trava as outras ações enquanto uma processa", () => {
  const { PropertyActionGroup, propertyActionMessage, decisionLabels } = require("../src");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><PropertyActionGroup state="processing" activeAction="save" /></RefyProvider>); });
  const buttons = hosts(tree, (p) => p.accessibilityRole === "button");
  expect(buttons.map((b) => b.props.accessibilityState.disabled)).toEqual([true, true, true]);
  expect(buttons[1].props.accessibilityState.busy).toBe(true);
  expect(propertyActionMessage("processing", "save", decisionLabels)).toBe("Salvar: processando…");
  expect(propertyActionMessage("idle", undefined, decisionLabels)).toBe("Escolha o que deseja fazer com este item.");
});

test("PropertyMedia dá a volta nas fotos e mostra o erro com nova tentativa", () => {
  const { PropertyMedia, wrapIndex } = require("../src");
  expect([wrapIndex(-1, 3), wrapIndex(3, 3), wrapIndex(1, 3)]).toEqual([2, 0, 1]);
  const seen: number[] = [];
  let tree!: ReturnType<typeof create>;
  const items = [1, 2, 3].map((n) => ({ src: `https://x/${n}.jpg`, alt: `Foto ${n}` }));
  act(() => { tree = create(<RefyProvider><PropertyMedia items={items} onIndexChange={(i: number) => seen.push(i)} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Foto anterior")[0].props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Mostrar foto 2 de 3")[0].props.onClick({}); });
  expect(seen).toEqual([2, 1]);
  const retried: number[] = [];
  act(() => { tree.update(<RefyProvider><PropertyMedia items={items} errorMessage="Falhou." onRetry={() => retried.push(1)} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Tentar novamente")[0].props.onClick({}); });
  expect(retried).toEqual([1]);
  expect(hosts(tree, (p) => p.accessibilityLabel === "Foto anterior")).toHaveLength(0);
});

test("FileUpload recusa arquivo grande, adiciona pelo seletor e remove", async () => {
  const { FileUpload, fileKind, fileUploadStatus } = require("../src");
  expect([fileKind("a.PDF").kind, fileKind("a.PDF").label, fileKind("semext").label]).toEqual(["document", "PDF", "ARQ"]);
  expect(fileUploadStatus("uploading", 2, 41.6)).toBe("Enviando 2 arquivos: 42%.");
  const lists: string[][] = [];
  let pick = [{ name: "grande.mov", size: 20 * 1024 * 1024 }];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><FileUpload multiple pickFiles={async () => pick} onFilesChange={(f: { name: string }[]) => lists.push(f.map((x) => x.name))} /></RefyProvider>); });
  const chooseBtn = () => hosts(tree, (p) => p.accessibilityLabel === "Escolher arquivos")[0];
  await act(async () => { chooseBtn().props.onClick({}); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "grande.mov excede o limite de 10 MB.")).toBe(true);
  pick = [{ name: "nota.pdf", size: 2048 }];
  await act(async () => { chooseBtn().props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Remover nota.pdf")[0].props.onClick({}); });
  expect(lists).toEqual([["nota.pdf"], []]);
});

test("VoiceRecorder troca pausar por retomar e formata a duração", () => {
  const { VoiceRecorder, formatDuration } = require("../src");
  expect([formatDuration(47), formatDuration(605.9), formatDuration(-3)]).toEqual(["00:47", "10:05", "00:00"]);
  const log: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><VoiceRecorder state="listening" level={50} onPause={() => log.push("pause")} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Pausar gravação")[0].props.onClick({}); });
  act(() => { tree.update(<RefyProvider><VoiceRecorder state="paused" onResume={() => log.push("resume")} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Retomar gravação")[0].props.onClick({}); });
  expect(log).toEqual(["pause", "resume"]);
  act(() => tree.unmount());
});

test("AlertDialog não fecha enquanto confirma e o cancelar fecha", async () => {
  const { AlertDialog } = require("../src");
  const log: unknown[] = [];
  let tree!: ReturnType<typeof create>;
  const el = (pending: boolean) => <RefyProvider><AlertDialog open pending={pending} title="Apagar?" onOpenChange={(o: boolean) => log.push(o)} onConfirm={() => log.push("ok")}>Some tudo.</AlertDialog></RefyProvider>;
  act(() => { tree = create(el(false)); });
  await act(async () => {});
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Apagar")[0]?.props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Confirmar")[0].props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Cancelar")[0].props.onClick({}); });
  expect(log).toEqual(["ok", false]);
  act(() => { tree.update(el(true)); });
  expect(hosts(tree, (p) => p.accessibilityLabel === "Cancelar")[0].props.accessibilityState.disabled).toBe(true);
  act(() => tree.unmount());
});

test("Drawer fecha no ✕", async () => {
  const { Drawer } = require("../src");
  const log: boolean[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Drawer open side="bottom" title="Filtros" onOpenChange={(o: boolean) => log.push(o)}>Corpo</Drawer></RefyProvider>); });
  await act(async () => {});
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Fechar")[0].props.onClick({}); });
  expect(log).toEqual([false]);
  act(() => tree.unmount());
});

test("Timeline formata a data no fuso e EventTimeline agrupa por dia", () => {
  const { Timeline, milestoneDate, groupEvents } = require("../src");
  expect(milestoneDate("2026-01-01T02:00:00Z", "pt-BR", "America/Sao_Paulo").day).toBe("31");
  const groups = groupEvents([{ id: "a", timestamp: "2026-11-04T10:00:00Z", title: "A" }, { id: "b", timestamp: "2026-11-05T10:00:00Z", title: "B" }, { id: "c", timestamp: "2026-11-05T12:00:00Z", title: "C" }], "America/Sao_Paulo", true);
  expect(groups.map(([k, g]: [string, { items: { id: string }[] }]) => [k, g.items.map((i) => i.id)])).toEqual([["2026-11-05", ["c", "b"]], ["2026-11-04", ["a"]]]);
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Timeline items={[]} /></RefyProvider>); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "Nenhum marco ainda")).toBe(true);
});

test("Matrix2x2 seleciona e desmarca e a cor vai de crítico a informação", () => {
  const { Matrix2x2, priorityMix } = require("../src");
  expect([priorityMix(0, 4), priorityMix(3, 4), priorityMix(0, 1)]).toEqual([100, 0, 100]);
  const log: (string | null)[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Matrix2x2 points={[{ id: "a", label: "A", x: 10, y: 10 }]} onPointClick={(p: { id: string } | null) => log.push(p?.id ?? null)} /></RefyProvider>); });
  const point = () => hosts(tree, (p) => p.accessibilityLabel === "1: A")[0];
  act(() => { point().props.onClick({}); });
  expect(point().props.accessibilityState.selected).toBe(true);
  act(() => { point().props.onClick({}); });
  expect(log).toEqual(["a", null]);
});

test("PropertyCard em deck mostra as decisões mesmo sem actions", () => {
  const { PropertyCard } = require("../src");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><PropertyCard layout="deck" title="Casa" media={[{ src: "https://x/1.jpg", alt: "Casa" }]} /></RefyProvider>); });
  expect(hosts(tree, (p) => p.accessibilityLabel === "Decisões sobre o item")).toHaveLength(1);
  act(() => { tree.update(<RefyProvider><PropertyCard title="Casa" media={[{ src: "https://x/1.jpg", alt: "Casa" }]} /></RefyProvider>); });
  expect(hosts(tree, (p) => p.accessibilityLabel === "Decisões sobre o item")).toHaveLength(0);
});

test("tableRows busca, filtra e ordena como a web", () => {
  const { tableRows } = require("../src");
  type R = { id: string; t: string; g: string; a: number | null };
  const rows: R[] = [{ id: "1", t: "Ária", g: "Eng", a: 1972 }, { id: "2", t: "baião", g: "Design", a: null }, { id: "3", t: "Coco", g: "Eng", a: 1968 }];
  const cols = [
    { key: "t", header: "T", cell: (r: R) => r.t, sortable: true },
    { key: "g", header: "G", cell: (r: R) => r.g, filterable: true },
    { key: "a", header: "A", cell: (r: R) => String(r.a), sortable: true, sortValue: (r: R) => r.a },
  ];
  expect(tableRows(rows, cols, { sortKey: "t", sortDir: "asc" }).map((r: R) => r.id)).toEqual(["1", "2", "3"]);
  expect(tableRows(rows, cols, { sortKey: "a", sortDir: "asc" }).map((r: R) => r.id)).toEqual(["3", "1", "2"]);
  expect(tableRows(rows, cols, { sortKey: "a", sortDir: "desc" }).map((r: R) => r.id)).toEqual(["1", "3", "2"]);
  expect(tableRows(rows, cols, { filters: { g: ["Eng"] } }).map((r: R) => r.id)).toEqual(["1", "3"]);
  expect(tableRows(rows, cols, { query: "coco" }).map((r: R) => r.id)).toEqual(["3"]);
});

test("Table pagina, mostra vazio e erro", () => {
  const { Table } = require("../src");
  const rows = Array.from({ length: 7 }, (_, i) => ({ id: String(i), n: `Arquivo ${i}` }));
  const cols = [{ key: "n", header: "Nome", cell: (r: { n: string }) => r.n }];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Table caption="Arquivos" rowKey={(r: { id: string }) => r.id} columns={cols} rows={rows} pagination={{ pageSize: 5 }} /></RefyProvider>); });
  const texts = () => tree.root.findAllByType(Text).map((n) => n.props.children).flat();
  expect(texts()).toContain("Arquivo 4");
  expect(texts()).not.toContain("Arquivo 5");
  act(() => { tree.update(<RefyProvider><Table caption="Arquivos" columns={cols} rows={[]} empty="Nada aqui" /></RefyProvider>); });
  expect(texts()).toContain("Nada aqui");
  act(() => { tree.unmount(); });
});

test("kanbanBlocked e kanbanMove respeitam WIP e transições", () => {
  const { kanbanBlocked, kanbanMove } = require("../src");
  const cols = [
    { id: "a", title: "A", items: [{ id: "1", title: "Um" }, { id: "2", title: "Dois" }] },
    { id: "b", title: "B", items: [{ id: "3", title: "Três" }], wipLimit: 1 },
    { id: "c", title: "C", items: [] },
  ];
  expect(kanbanBlocked(cols, "a", "b")).toBeTruthy();
  expect(kanbanBlocked(cols, "a", "c")).toBeFalsy();
  expect(kanbanBlocked(cols, "a", "c", undefined, { a: ["b"] })).toBeTruthy();
  const moved = kanbanMove(cols, "1", "a", "c");
  expect(moved[0].items.map((i: { id: string }) => i.id)).toEqual(["2"]);
  expect(moved[2].items.map((i: { id: string }) => i.id)).toEqual(["1"]);
  expect(cols[0].items).toHaveLength(2);
});

test("swipeDecision decide a partir de 72 pt", () => {
  const { swipeDecision } = require("../src");
  expect([swipeDecision(-72), swipeDecision(-71), swipeDecision(0), swipeDecision(71), swipeDecision(72)]).toEqual(["reject", undefined, undefined, undefined, "visit"]);
});

test("Questionnaire exige resposta, avança e envia", () => {
  const { Questionnaire } = require("../src");
  const sent: Record<string, string>[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Questionnaire onSubmit={(a: Record<string, string>) => sent.push(a)} questions={[{ id: "a", title: "Nome", required: true }, { id: "b", title: "Cor", options: [{ value: "azul", label: "Azul" }] }]} /></RefyProvider>); });
  const texts = () => tree.root.findAllByType(Text).map((n) => n.props.children).flat().join("|");
  const button = (label: string) => tree.root.findAll((n) => typeof n.type === "string" && typeof n.props.onClick === "function" && n.findAllByType(Text).some((x) => x.props.children === label))[0];
  act(() => { button("Continuar").props.onClick({}); });
  expect(texts()).toContain("Responda para continuar.");
  act(() => { tree.root.findAllByType(TextInput)[0].props.onChangeText("Ana"); });
  act(() => { button("Continuar").props.onClick({}); });
  expect(texts()).toContain("Pergunta 2 de 2");
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Azul")[0].props.onClick({}); });
  act(() => { button("Enviar respostas").props.onClick({}); });
  expect(sent).toEqual([{ a: "Ana", b: "azul" }]);
  expect(texts()).toContain("Respostas enviadas.");
});

test("GuidedTour avança, volta e conclui", () => {
  const { GuidedTour, GuidedTourAnchor } = require("../src");
  const done: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><GuidedTour defaultOpen onComplete={() => done.push("fim")} onStepChange={(id: string) => done.push(id)} steps={[{ id: "a", title: "Primeiro", description: "Um" }, { id: "b", title: "Segundo", description: "Dois" }]}>
    <GuidedTourAnchor stepId="a"><Text>Alvo A</Text></GuidedTourAnchor>
    <GuidedTourAnchor stepId="b"><Text>Alvo B</Text></GuidedTourAnchor>
  </GuidedTour></RefyProvider>); });
  const button = (label: string) => tree.root.findAll((n) => typeof n.type === "string" && typeof n.props.onClick === "function" && n.findAllByType(Text).some((x) => x.props.children === label))[0];
  const texts = () => tree.root.findAllByType(Text).map((n) => n.props.children).flat();
  expect(texts()).toContain("Primeiro");
  act(() => { button("Próximo").props.onClick({}); });
  expect(texts()).toContain("Segundo");
  act(() => { button("Concluir").props.onClick({}); });
  expect(done).toEqual(["b", "fim"]);
  act(() => { tree.unmount(); });
});

test("Coverflow seleciona, ativa e calcula o destino do arrasto", () => {
  const { Coverflow, coverflowTarget } = require("../src");
  expect([coverflowTarget(1, -130, 272, 4), coverflowTarget(1, -140, 272, 4), coverflowTarget(0, 900, 272, 4), coverflowTarget(3, -900, 272, 4)]).toEqual([1, 2, 0, 3]);
  const log: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><Coverflow items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} renderItem={(i: { label: string }) => i.label} onSelectionChange={(id: string) => log.push(`sel:${id}`)} onActivate={(i: { id: string }) => log.push(`act:${i.id}`)} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "B")[0].props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "B")[0].props.onClick({}); });
  expect(log).toEqual(["sel:b", "act:b"]);
  expect(hosts(tree, (p) => p.accessibilityLabel === "Próximo conteúdo")[0].props.accessibilityState.disabled).toBe(true);
  act(() => { tree.update(<RefyProvider><Coverflow items={[]} renderItem={() => null} /></RefyProvider>); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "Nenhum conteúdo disponível.")).toBe(true);
});

test("groupVisitTimes junta horários de 30 em 30 minutos", () => {
  const { groupVisitTimes } = require("../src");
  expect(groupVisitTimes(["10:00", "09:00", "09:30", "14:00", "09:30"])).toEqual(["09h–10h30", "14h–14h30"]);
  expect(groupVisitTimes([])).toEqual([]);
});

test("VisitSchedulePicker marca horário e resume em faixa", () => {
  const { VisitSchedulePicker } = require("../src");
  const log: Record<string, string[]>[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><VisitSchedulePicker defaultActiveDate={new Date(2026, 10, 10)} minDate={new Date(2026, 10, 1)} onChange={(v: Record<string, string[]>) => log.push(v)} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "09:00")[0].props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "09:30")[0].props.onClick({}); });
  expect(log.at(-1)).toEqual({ "2026-11-10": ["09:00", "09:30"] });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "09h–10h")).toBe(true);
});

test("geoAreaLists e GeoAreaPicker incluem e tiram bairros", () => {
  const { geoAreaLists, GeoAreaPicker } = require("../src");
  const n = [{ id: "a", label: "A", distance: 0 }, { id: "b", label: "B", distance: 1 }, { id: "c", label: "C", distance: 3 }];
  const r = geoAreaLists(n, "a", 2, ["b", "c"]);
  expect([r.included.map((x: { id: string }) => x.id), r.excluded.length, r.extras.length]).toEqual([["a", "b"], 0, 1]);
  const ids: string[][] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><GeoAreaPicker neighborhoods={n} baseId="a" onIncludedIdsChange={(v: string[]) => ids.push(v)} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "Incluir B na busca")[0].props.onClick({}); });
  expect(ids).toEqual([["b"]]);
  expect(hosts(tree, (p) => p.accessibilityLabel === "Remover B da busca")).toHaveLength(1);
  act(() => { tree.unmount(); });
});

test("IntentComposer escreve, usa exemplo, envia e trava no processamento", () => {
  const { IntentComposer, nextIntentFilters } = require("../src");
  const g = { id: "g", label: "G", mode: "multiple", options: [] };
  expect(nextIntentFilters({ g: ["x"] }, g, "x")).toEqual({ g: [] });
  expect(nextIntentFilters({ g: ["x"] }, { ...g, mode: "single" }, "y")).toEqual({ g: ["y"] });
  const sent: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><IntentComposer examples={["Casa com quintal"]} onSubmit={() => sent.push("ok")} /></RefyProvider>); });
  const button = (label: string) => tree.root.findAll((n) => typeof n.type === "string" && typeof n.props.onClick === "function" && n.findAllByType(Text).some((x) => x.props.children === label))[0];
  act(() => { button("Casa com quintal").props.onClick({}); });
  expect(tree.root.findAllByType(TextInput)[0].props.value).toBe("Casa com quintal");
  act(() => { button("Continuar").props.onClick({}); });
  expect(sent).toEqual(["ok"]);
  act(() => { tree.update(<RefyProvider><IntentComposer state="processing" defaultValue="x" /></RefyProvider>); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "Organizando o que você contou")).toBe(true);
  act(() => { tree.unmount(); });
});

test("ApprovalWorkbench conta concluídos e troca o item ativo", () => {
  const { ApprovalWorkbench, Trace } = require("../src");
  const log: string[] = [];
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><ApprovalWorkbench activeId="a" onActiveChange={(id: string) => log.push(id)} items={[{ id: "a", label: "A", state: "complete" }, { id: "b", label: "B", state: "not-started" }]}><Text>Editor</Text></ApprovalWorkbench></RefyProvider>); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "1 de 2 concluídos")).toBe(true);
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "B, Não iniciado")[0].props.onClick({}); });
  expect(log).toEqual(["b"]);
  act(() => { tree.update(<RefyProvider><Trace steps={[{ id: "1", title: "Ler", status: "error", detail: "{}" }]} /></RefyProvider>); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "Erro")).toBe(true);
});

test("LineChart some com a série desligada na legenda e mostra a tabela de dados", () => {
  const { LineChart } = require("../src");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><LineChart title="V" label="V" series={[{ name: "A", data: [1, 2] }, { name: "B", data: [2, 3] }]} /></RefyProvider>); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "A")[0].props.onClick({}); });
  act(() => { hosts(tree, (p) => p.accessibilityLabel === "B")[0].props.onClick({}); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "Selecione uma série na legenda.")).toBe(true);
  expect(JSON.stringify(tree.toJSON())).toContain("Ver dados de V");
  act(() => { tree.update(<RefyProvider><LineChart title="V" label="V" data={[]} /></RefyProvider>); });
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "Sem dados para este período.")).toBe(true);
});

test("DonutChart e BarChart dizem os valores ao leitor de tela", () => {
  const { DonutChart, BarChart } = require("../src");
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<RefyProvider><DonutChart label="Meta" value={64} /><BarChart title="B" label="Bairros" items={[{ label: "Horto", value: 3 }]} /></RefyProvider>); });
  expect(hosts(tree, (p) => p.accessibilityLabel === "Meta: 64%")).toHaveLength(1);
  expect(hosts(tree, (p) => p.accessibilityLabel === "Bairros: Horto 3")).toHaveLength(1);
});

test("D3Chart desenha as famílias da web no SVG nativo", () => {
  const { D3Chart } = require("../src");
  const { Path, Rect, Circle } = require("react-native-svg");
  const cases = [
    { type: "bar", series: [{ id: "a", label: "A", data: [{ x: "Jan", y: 3 }, { x: "Fev", y: 5 }] }] },
    { type: "donut", items: [{ id: "a", label: "A", value: 3 }, { id: "b", label: "B", value: 1 }] },
    { type: "treemap", root: { id: "r", name: "R", children: [{ id: "a", name: "A", value: 3 }, { id: "b", name: "B", value: 2 }] } },
    { type: "sankey", network: { nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }], links: [{ source: "a", target: "b", value: 2 }] } },
    { type: "heatmap", cells: [{ x: "Seg", y: "Manhã", value: 3 }, { x: "Ter", y: "Manhã", value: 1 }] },
    { type: "radar", series: [{ id: "a", label: "A", data: [{ x: "Preço", y: 3 }, { x: "Área", y: 4 }, { x: "Vagas", y: 2 }] }] },
  ];
  for (const props of cases) {
    let tree!: ReturnType<typeof create>;
    act(() => { tree = create(<RefyProvider><D3Chart title="T" label="T" {...props} /></RefyProvider>); });
    const view = tree.root.findAll((n) => typeof n.props.onLayout === "function")[0];
    act(() => { view.props.onLayout({ nativeEvent: { layout: { width: 360, height: 300 } } }); });
    const shapes = tree.root.findAllByType(Path).length + tree.root.findAllByType(Rect).length + tree.root.findAllByType(Circle).length;
    expect([props.type, shapes > 1]).toEqual([props.type, true]);
    expect(tree.root.findAll((n) => n.props.accessibilityRole === "alert")).toHaveLength(0);
    act(() => { tree.unmount(); });
  }
});
