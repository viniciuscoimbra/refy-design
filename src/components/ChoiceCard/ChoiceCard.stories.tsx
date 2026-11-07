import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChoiceCard, ChoiceCardGroup } from "./ChoiceCard";

/** `ChoiceCard` — card selecionável com semântica de radio/checkbox. */
const meta = {
  id: "components-molecules-choicecard",
  title: "Components/Molecules/ChoiceCard",
  component: ChoiceCardGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Card-as-radio (or checkbox, `mode=\"multiple\"`): title + description + icon/preview + meta. Group with keyboard navigation: roving tabindex in single mode (arrows move AND select, like a native radio; Home/End go to the ends). Selection with a primary ring and a transition through motion tokens.",
          "",
          "**Where to use:** theme choice (light/dark/system), credit packs with prices, items of a collection, and the future case of the **recommendation engine profiles: Careful / Balanced / Explorer** (one choice, each option with a name + a description of the behavior).",
          "",
          "**Where NOT to use:** a simple choice without description/preview (use `RadioGroup`); a compact toolbar toggle (use `Segmented`/`ToggleGroup`); a card that navigates (use `NavCard`); a plan with its own CTA (use `PlanCard`).",
        ].join("\n"),
      },
    },
  },
  args: { mode: "single", columns: 3, label: "Options" },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "multiple"] },
    columns: { control: { type: "number", min: 1, max: 4 } },
    label: { control: "text" },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ChoiceCardGroup>;
export default meta;

type Story = StoryObj<typeof ChoiceCardGroup>;

const themePreview = (bg: string, fg: string, label: string) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      alignSelf: "stretch",
      minHeight: 78,
      background: bg,
      color: fg,
      fontFamily: "var(--font-headline)",
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    {label}
  </span>
);

const roomPreview = (
  <svg viewBox="0 0 320 120" role="img" aria-label="Bright living room with a window and plants" style={{ display: "block", width: "100%", minHeight: 78 }}>
    <rect width="320" height="120" fill="#e9f0f2" />
    <rect x="30" y="20" width="110" height="70" rx="4" fill="#b8d8ea" />
    <path d="M30 55h110M85 20v70" stroke="#fff" strokeWidth="4" />
    <rect x="172" y="55" width="105" height="44" rx="12" fill="#f47a42" />
    <circle cx="260" cy="37" r="18" fill="#76a66e" />
    <rect x="256" y="37" width="8" height="38" fill="#6b4a32" />
  </svg>
);

export const EscolhaDeTema: Story = {
  name: "Theme choice (single)",
  render: (args) => (
    <ChoiceCardGroup {...args} label="Interface theme" defaultValue="light">
      <ChoiceCard
        value="light"
        title="Light"
        description="White background, dark ink."
        preview={themePreview("var(--surface)", "var(--ink-1)", "Aa")}
      />
      <ChoiceCard
        value="dark"
        title="Dark"
        description="Light ink on a dark background."
        preview={themePreview("var(--legacy-ink-1)", "var(--legacy-white)", "Aa")}
      />
      <ChoiceCard
        value="system"
        title="System"
        description="Follows the device setting."
        preview={roomPreview}
      />
    </ChoiceCardGroup>
  ),
};

export const PacotesDeCreditos: Story = {
  name: "Credit packs (with meta/price)",
  render: () => (
    <ChoiceCardGroup label="Credit pack" defaultValue="200">
      <ChoiceCard value="100" title="100 credits" description="Occasional use." meta="R$ 90 · R$ 0.90/credit" />
      <ChoiceCard value="200" title="200 credits" description="Best value." meta="R$ 160 · R$ 0.80/credit" />
      <ChoiceCard value="500" title="500 credits" description="Heavy use." meta="R$ 350 · R$ 0.70/credit" />
    </ChoiceCardGroup>
  ),
};

export const PerfisDeRecomendacao: Story = {
  name: "Recommendation engine profiles (future case)",
  render: () => (
    <ChoiceCardGroup label="Recommendation profile" defaultValue="balanced">
      <ChoiceCard
        value="careful"
        title="Strict"
        description="Recommends only with high confidence; fewer, sharper suggestions."
      />
      <ChoiceCard
        value="balanced"
        title="Balanced"
        description="Balances confidence and coverage; the default for most."
      />
      <ChoiceCard
        value="explorer"
        title="Explorer"
        description="Suggests more options, including bets outside the client's usual pattern."
      />
    </ChoiceCardGroup>
  ),
};

export const MultiplaControlada: Story = {
  name: "Controlled multiple (checkbox)",
  render: () => {
    const [values, setValues] = useState<string[]>(["globo"]);
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <ChoiceCardGroup
          mode="multiple"
          columns={1}
          label="Available collections"
          value={values}
          onChange={(v) => setValues(v as string[])}
        >
          <ChoiceCard value="globo" title="sc-domain:example.com" meta="42 mil cliques / 28d" />
          <ChoiceCard value="vogue" title="sc-domain:design.example.com" meta="8 mil cliques / 28d" />
          <ChoiceCard
            value="casavogue"
            title="sc-domain:colecao.example.com"
            meta="3 mil cliques / 28d"
          />
        </ChoiceCardGroup>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
          selected: {values.join(", ") || "none"}
        </span>
      </div>
    );
  },
};

export const ComOpcaoDesabilitada: Story = { name: "With disabled option",
  render: () => (
    <ChoiceCardGroup label="Analysis plan" defaultValue="default">
      <ChoiceCard value="default" title="Default" description="Full site analysis." />
      <ChoiceCard value="quick" title="Quick" description="Main pages only." />
      <ChoiceCard
        value="deep"
        title="Deep"
        description="Available on the Growth plan."
        disabled
      />
    </ChoiceCardGroup>
  ),
};
