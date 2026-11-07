import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

/**
 * `Skeleton` — placeholder com shimmer enquanto o conteúdo carrega.
 */
const meta = {
  id: "components-atoms-skeleton",
  title: "Components/Atoms/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "14px block by default (one line of text); compose several for cards and lists. `circle` for avatars. Mark the real container with `aria-busy` while loading; the shimmer freezes with `prefers-reduced-motion`.",
      },
    },
  },
  argTypes: {
    width: { control: "text" },
    height: { control: "text" },
    circle: { control: "boolean" },
  },
} satisfies Meta<typeof Skeleton>;
export default meta;

type Story = StoryObj<typeof Skeleton>;

/** Text line. */
export const Playground: Story = {
  args: { width: 220 },
};

/** Loading card: avatar + title + lines. */
export const CardLoading: Story = {
  name: "Loading card",
  render: () => (
    <div
      aria-busy="true"
      style={{
        width: 320,
        padding: 16,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Skeleton circle width={32} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width="60%" />
          <Skeleton width="35%" height={10} />
        </div>
      </div>
      <Skeleton />
      <Skeleton width="85%" />
      <Skeleton width="70%" />
    </div>
  ),
};

/** Composition catalog for the components used on the screens. */
export const CatalogoDeComponentes: Story = {
  name: "Catalog · components",
  render: () => (
    <div aria-busy="true" style={{ width: "100%", maxWidth: 920, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 }}>
      {[
        ["Buttons", <div style={{ display: "flex", gap: 8 }}><Skeleton width={112} height={40} /><Skeleton width={112} height={40} /></div>],
        ["Field", <div style={{ display: "grid", gap: 7 }}><Skeleton width={90} height={10} /><Skeleton height={44} /></div>],
        ["Avatar and user", <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Skeleton circle width={40} /><div style={{ flex: 1, display: "grid", gap: 6 }}><Skeleton width="55%" /><Skeleton width="38%" height={10} /></div></div>],
        ["Stat", <div style={{ display: "grid", gap: 8 }}><Skeleton width={80} height={10} /><Skeleton width={140} height={34} /><Skeleton width={110} height={10} /></div>],
        ["Table row", <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}><Skeleton /><Skeleton /><Skeleton /></div>],
        ["Timeline item", <div style={{ display: "flex", gap: 12 }}><Skeleton circle width={32} /><div style={{ flex: 1, display: "grid", gap: 8 }}><Skeleton width="62%" /><Skeleton /><Skeleton width="78%" /></div></div>],
        ["Content card", <div style={{ display: "grid", gap: 12 }}><Skeleton height={160} /><Skeleton width="72%" height={20} /><Skeleton width="42%" /><div style={{ display: "flex", gap: 8 }}><Skeleton width={84} height={28} /><Skeleton width={84} height={28} /></div></div>],
        ["Calendar", <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>{Array.from({ length: 12 }, (_, index) => <Skeleton key={index} height={36} />)}</div>],
      ].map(([label, preview]) => (
        <section key={label as string} style={{ minWidth: 0, padding: 16, border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", background: "var(--surface)" }}>
          <p style={{ margin: "0 0 14px", color: "var(--ink-2)", fontSize: 12, fontWeight: 700 }}>{label}</p>
          {preview}
        </section>
      ))}
    </div>
  ),
};
