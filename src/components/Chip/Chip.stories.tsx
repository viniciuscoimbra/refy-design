import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chip, ChipGroup } from "./Chip";

function ChipShowcase({ theme }: { theme?: "light" | "dark" }) {
  const [severities, setSeverities] = useState(["critical"]);
  const [period, setPeriod] = useState("7");
  const [active, setActive] = useState([
    "Severity: critical",
    "Priority: high",
    "Language: pt-BR",
  ]);
  const severity = [
    { id: "critical", label: "Critical", count: 8, tone: "critical" as const },
    { id: "warning", label: "Medium", count: 14, tone: "warning" as const },
    { id: "success", label: "Resolved", count: 23, tone: "success" as const },
    { id: "info", label: "In progress", count: 5, tone: "info" as const },
  ];

  return (
    <section
      data-theme={theme}
      style={{ padding: 32, color: "var(--ink-1)", background: "var(--bg)" }}
    >
      <span
        style={{
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: ".16em",
          textTransform: "uppercase",
        }}
      >
        Interactive filters{theme ? ` · ${theme}` : ""}
      </span>
      <h3
        style={{
          margin: "6px 0 4px",
          fontFamily: "var(--font-headline)",
          fontSize: 22,
        }}
      >
        Selection and states
      </h3>
      <p
        style={{
          maxWidth: "56ch",
          margin: "0 0 22px",
          color: "var(--ink-3)",
          fontSize: 12.5,
          lineHeight: 1.55,
        }}
      >
        Multiple selection, period and active filters.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <div
          style={{
            padding: 22,
            border: "1px solid var(--line)",
            borderRadius: "var(--card-radius)",
            background: "var(--surface)",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: 14,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            Filter · severity
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {severity.map((item) => (
              <Chip
                key={item.id}
                tone={item.tone}
                count={item.count}
                showCheck
                selected={severities.includes(item.id)}
                onClick={() =>
                  setSeverities((current) =>
                    current.includes(item.id)
                      ? current.filter((id) => id !== item.id)
                      : [...current, item.id],
                  )
                }
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 22,
            border: "1px solid var(--line)",
            borderRadius: "var(--card-radius)",
            background: "var(--surface)",
          }}
        >
          <ChipGroup
            label="Period · single selection"
            mode="single"
            value={period}
            onChange={(next) => setPeriod(next as string)}
          >
            {[
              ["7", "7 days"],
              ["30", "30 days"],
              ["90", "90 days"],
              ["all", "All"],
            ].map(([id, label]) => (
              <Chip key={id} value={id} showCheck>
                {label}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        <div
          style={{
            padding: 22,
            border: "1px solid var(--line)",
            borderRadius: "var(--card-radius)",
            background: "var(--surface)",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: 14,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            Filter · active + removable
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
            }}
          >
            {active.map((label) => (
              <Chip
                key={label}
                selected
                removable
                onRemove={() =>
                  setActive((items) => items.filter((item) => item !== label))
                }
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const meta = {
  id: "components-atoms-chip",
  title: "Components/Atoms/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "inline-radio", options: ["filter", "selection"] },
    selected: { control: "boolean" },
    removable: { control: "boolean" },
    count: { control: "number" },
    tone: {
      control: "inline-radio",
      options: ["neutral", "critical", "warning", "success", "info"],
    },
    selectionMode: { control: "inline-radio", options: ["toggle", "radio"] },
    showCheck: { control: "boolean" },
    children: { control: "text" },
    onRemove: { control: false },
  },
} satisfies Meta<typeof Chip>;
export default meta;

type Story = StoryObj<typeof Chip>;

export const Semanticos: Story = {
  name: "Interactive semantic filters",
  render: () => <ChipShowcase />,
};

export const FiltrosDeSeveridade: Story = { name: "Severity filters",
  render: () => {
    const [sel, setSel] = useState("critical");
    const filters = [
      { id: "all", label: "All", count: 87 },
      { id: "critical", label: "Critical", count: 12 },
      { id: "medium", label: "Medium", count: 34 },
      { id: "resolved", label: "Resolved", count: 41 },
    ];
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filters.map((f) => (
          <Chip
            key={f.id}
            selected={sel === f.id}
            count={f.count}
            onClick={() => setSel(f.id)}
          >
            {f.label}
          </Chip>
        ))}
      </div>
    );
  },
};

export const Removivel: Story = { name: "Removable",
  parameters: {
    docs: {
      description: {
        story:
          "The selection variant is the atom used by Multiselect, including the +N counter. Remove a selection or reveal the rest through the counter.",
      },
    },
  },
  render: () => {
    const [items, setItems] = useState(["Document", "Design", "Image"]);
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? items : items.slice(0, 1);
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {visible.map((label) => (
          <Chip
            key={label}
            variant="selection"
            removable
            aria-pressed={undefined}
            aria-label={`Remove ${label}`}
            onRemove={() =>
              setItems((current) => current.filter((item) => item !== label))
            }
          >
            {label}
          </Chip>
        ))}
        {items.length > visible.length && (
          <Chip
            variant="selection"
            aria-pressed={undefined}
            aria-label="Show other selections"
            onClick={() => setExpanded(true)}
          >
            +{items.length - visible.length}
          </Chip>
        )}
        {items.length === 0 && (
          <Chip
            onClick={() => {
              setItems(["Document", "Design", "Image"]);
              setExpanded(false);
            }}
          >
            Restart
          </Chip>
        )}
      </div>
    );
  },
};

export const VariacoesDoHandoff: Story = {
  name: "Variations · toggle, radio and removable",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
      }}
    >
      <ChipShowcase theme="light" />
      <ChipShowcase theme="dark" />
    </div>
  ),
  parameters: { layout: "fullscreen" },
};

/** The disabled selection keeps its value and accepts no interaction. */
export const Desabilitado: Story = { name: "Disabled",
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Chip disabled>Filter unavailable</Chip>
      <Chip disabled selected>
        Selected filter
      </Chip>
    </div>
  ),
};

function RoomsFilter() {
  const [rooms, setRooms] = useState("any");
  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <ChipGroup
        label="Bedrooms"
        mode="single"
        value={rooms}
        onChange={(next) => setRooms(next as string)}
      >
        <Chip value="any">Any</Chip>
        <Chip value="1">1+</Chip>
        <Chip value="2">2+</Chip>
        <Chip value="3" disabled>
          3+
        </Chip>
        <Chip value="4">4+</Chip>
      </ChipGroup>
      <span style={{ color: "var(--ink-3)" }}>Selected: {rooms}</span>
    </div>
  );
}

/**
 * One option in a row: the group is one Tab stop, arrow keys move focus and selection together,
 * Home and End jump to the ends and a disabled chip is skipped.
 */
export const GrupoSelecaoUnica: Story = {
  name: "Group · single selection",
  render: () => <RoomsFilter />,
};

function AmenitiesFilter() {
  const [amenities, setAmenities] = useState<string[]>(["pool"]);
  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <ChipGroup
        label="Amenities"
        mode="multiple"
        value={amenities}
        onChange={(next) => setAmenities(next as string[])}
      >
        <Chip value="balcony" count={42}>
          Balcony
        </Chip>
        <Chip value="pool" count={18}>
          Pool
        </Chip>
        <Chip value="garage" count={65}>
          Garage
        </Chip>
        <Chip value="pets" count={31}>
          Pets allowed
        </Chip>
      </ChipGroup>
      <span style={{ color: "var(--ink-3)" }}>
        Selected: {amenities.join(", ") || "none"}
      </span>
    </div>
  );
}

/** Independent options: Tab visits each chip and Space or Enter turns it on or off. */
export const GrupoSelecaoMultipla: Story = {
  name: "Group · multiple selection",
  render: () => <AmenitiesFilter />,
};

/** A long group label wraps above the chips, with the same style as a field label. */
export const GrupoRotuloLongo: Story = {
  name: "Group · long label",
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <ChipGroup
        label="Minimum number of parking spaces included in the price"
        mode="single"
        defaultValue="0"
      >
        <Chip value="0">Any</Chip>
        <Chip value="1">1+</Chip>
        <Chip value="2">2+</Chip>
      </ChipGroup>
    </div>
  ),
};
