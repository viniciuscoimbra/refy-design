import { useState } from "react";
import type { Meta } from "@storybook/react";
import { Coverflow } from "./Coverflow";
import { Button } from "../Button";
import { AspectRatio } from "../AspectRatio";
import { Modal } from "../Modal";
import { ThemeProvider } from "../../lib/ThemeProvider";
const items = [
  { id: "one", label: "First reference" },
  { id: "two", label: "Second reference" },
  { id: "three", label: "Third reference" },
  { id: "four", label: "Fourth reference" },
];
const renderItem = (
  item: { id: string; label: string },
  state: { selected: boolean; index: number },
) => (
  <span
    style={{
      display: "grid",
      gap: "var(--space-3)",
      paddingBlock: "var(--space-6)",
    }}
  >
    <span
      aria-hidden="true"
      style={{ fontSize: "var(--text-h2)", color: "var(--primary)" }}
    >
      {String(state.index + 1).padStart(2, "0")}
    </span>
    <strong>{item.label}</strong>
    <span>{state.selected ? "Selected" : "Select"}</span>
  </span>
);
export default {
  id: "components-organisms-coverflow",
  title: "Components/Organisms/Coverflow",
  component: Coverflow,
  tags: ["autodocs"],
} satisfies Meta<typeof Coverflow>;
export const Padrao = { name: "Default",
  render: () => <Coverflow items={items} renderItem={renderItem} />,
};
export const Controlado = { name: "Controlled",
  render: () => {
    const [selected, setSelected] = useState("one"),
      [activated, setActivated] = useState("No item activated"),
      [reversed, setReversed] = useState(false),
      [short, setShort] = useState(false);
    return (
      <div data-coverflow-example="controlled">
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}
        >
          <Button onClick={() => setSelected("three")}>
            Select the third one externally
          </Button>
          <Button onClick={() => setReversed(!reversed)}>Reverse order</Button>
          <Button onClick={() => setShort(!short)}>
            Toggle short list
          </Button>
        </div>
        <Coverflow
          items={
            short ? items.slice(0, 1) : reversed ? [...items].reverse() : items
          }
          selectedId={selected}
          onSelectionChange={setSelected}
          onActivate={(item) => setActivated(item.label)}
          renderItem={renderItem}
        />
        <p role="status">Activation: {activated}</p>
      </div>
    );
  },
};
export const Vazio = { name: "Empty",
  render: () => <Coverflow items={[]} renderItem={renderItem} />,
};
export const Desabilitado = { name: "Disabled",
  render: () => <Coverflow items={items} disabled renderItem={renderItem} />,
};
export const ItensLongos = { name: "Long items",
  render: () => (
    <Coverflow
      items={items.map((item) => ({
        ...item,
        label: `${item.label}: a long description that must stay readable in a narrow viewport`,
      }))}
      renderItem={renderItem}
    />
  ),
};
export const UmItem = { name: "One item",
  render: () => <Coverflow items={items.slice(0, 1)} renderItem={renderItem} />,
};

export const MovimentoReduzido = { name: "Reduced motion",
  render: () => (
    <ThemeProvider
      theme={{
        name: "Reduced motion",
        tokens: { "--motion-reduced": "1" },
      }}
    >
      <Coverflow items={items} renderItem={renderItem} />
    </ThemeProvider>
  ),
};

export const TemaConfigurado = { name: "Configured theme",
  render: () => (
    <ThemeProvider
      theme={{
        name: "Configured example",
        tokens: {
          "--font-body": "monospace",
          "--coverflow-item-width": "12rem",
          "--radius-md": "0",
        },
      }}
    >
      <Coverflow items={items} renderItem={renderItem} />
    </ThemeProvider>
  ),
};


/** Abstract covers made for the demo, with no albums, artists or external assets. */
export const Capas = { name: "Covers",
  render: () => {
    const [active, setActive] = useState<string | null>(null);
    return <>
      <Coverflow
        label="Browse content covers"
        items={[
          { id: "lines", label: "Volume 01 — Lines" },
          { id: "orbits", label: "Volume 02 — Orbits" },
          { id: "layers", label: "Volume 03 — Layers" },
          { id: "paths", label: "Volume 04 — Paths" },
        ]}
        onActivate={item => setActive(item.label)}
        renderItem={(item, state) => <span style={{ display: "grid", width: "100%", gap: "var(--space-3)" }}>
          <AspectRatio ratio={1}>
            <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ background: "var(--surface-2)" }}>
              <circle cx={62 + state.index * 19} cy="92" r={48 + state.index * 5} fill="var(--primary-soft)" />
              <path d={`M20 ${130 - state.index * 12} L180 ${60 + state.index * 18}`} stroke="var(--primary)" strokeWidth="3" />
              <circle cx="100" cy="100" r={22 + state.index * 8} fill="none" stroke="var(--ink-2)" strokeWidth="1" />
              <text x="20" y="178" fill="var(--ink-1)" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-h2)" }}>{String(state.index + 1).padStart(2, "0")}</text>
            </svg>
          </AspectRatio>
          <strong>{item.label}</strong>
        </span>}
      />
      <p>Select a cover to center it. Activate the selected one to open its details.</p>
      <Modal open={active !== null} onClose={() => setActive(null)} title={active ?? "Content details"}>
        <p>Sample content. Activation comes from the app, with no external service.</p>
      </Modal>
    </>;
  },
};
