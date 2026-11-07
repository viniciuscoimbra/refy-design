import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import type { ButtonProgressEffect } from "./Button";

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const meta = {
  id: "components-atoms-button",
  title: "Components/Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Continue",
    variant: "primary",
    size: "md",
  },
  argTypes: {
    onClick: { action: "onClick" },
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    loading: { control: "boolean" },
    status: { control: "inline-radio", options: ["idle", "loading", "success", "error"] },
    progressEffect: { control: "select", options: ["spinner", "fill-horizontal", "fill-vertical", "shrink-horizontal", "shrink-vertical", "rotate-angle-bottom", "rotate-angle-top", "rotate-angle-left", "rotate-angle-right", "rotate-side-down", "rotate-side-up", "rotate-side-left", "rotate-side-right", "rotate-back", "flip-open", "slide-down", "move-up", "top-line", "lateral-lines"] },
    block: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "Cancel" } };
export const Ghost: Story = { args: { variant: "ghost", children: "View details" } };
export const Danger: Story = { args: { variant: "danger", children: "Cancel plan" } };
export const ComIcone: Story = { name: "With icon", args: { leadingIcon: PlusIcon, children: "New project" } };
export const Carregando: Story = { name: "Loading", args: { loading: true, children: "Analyzing" } };
export const Concluido: Story = { name: "Done", args: { status: "success", children: "Completed" } };
export const Erro: Story = { name: "Error", args: { status: "error", children: "Try again" } };

export const TodasVariantes: Story = { name: "All variants",
  render: () => {
    const [lastAction, setLastAction] = useState('Choose an action.');
    return <div style={{display:'grid',gap:16}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Button variant="primary" onClick={() => setLastAction('Primary action done.')}>Primary</Button>
        <Button variant="secondary" onClick={() => setLastAction('Secondary action done.')}>Secondary</Button>
        <Button variant="ghost" onClick={() => setLastAction('Subtle action done.')}>Ghost</Button>
        <Button variant="danger" onClick={() => setLastAction('Warning action done in this example.')}>Danger</Button>
      </div>
      <p role="status" style={{margin:0,color:'var(--ink-2)'}}>{lastAction}</p>
    </div>;
  },
};

const progressEffects: ButtonProgressEffect[] = [
  "fill-horizontal", "fill-vertical", "shrink-horizontal", "shrink-vertical",
  "rotate-angle-bottom", "rotate-angle-top", "rotate-angle-left", "rotate-angle-right",
  "rotate-side-down", "rotate-side-up", "rotate-side-left", "rotate-side-right",
  "rotate-back", "flip-open", "slide-down", "move-up", "top-line", "lateral-lines",
];

function ProgressButtonDemo({ effect, runSignal }: { effect: ButtonProgressEffect; runSignal: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  function run() {
    setStatus("loading");
    window.setTimeout(() => setStatus("success"), 3500);
    window.setTimeout(() => setStatus("idle"), 4700);
  }
  useEffect(() => { if (runSignal > 0) run(); }, [runSignal]);
  return <Button variant="primary" status={status} progressEffect={effect} loadingLabel="Processing…" onClick={run} style={{ width: 190, height: 46 }}>{status === "success" ? "Completed" : "Run"}</Button>;
}

export const EfeitosDeProgresso: Story = {
  name: "Loading and compatibility",
  render: () => {
    const [runSignal, setRunSignal] = useState(0);
    return (
      <section style={{ minHeight: "100vh", padding: "42px 36px 72px", color: "var(--ink-1)", background: "var(--bg)" }}>
        <header style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, maxWidth: 1280, margin: "0 auto 30px", paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
          <div><h2 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: 32 }}>Processing states</h2><p style={{ margin: "6px 0 0", color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>Spin and shrink aliases use one line; the button and its text stay stable</p></div>
          <Button variant="secondary" onClick={() => setRunSignal((value) => value + 1)}>Run all</Button>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 18, maxWidth: 1280, margin: "0 auto" }}>
          {progressEffects.map((effect, index) => <div key={effect} style={{ display: "grid", minHeight: 170, alignContent: "space-between", gap: 24, padding: 22, border: "1px solid var(--line)", borderRadius: "var(--radius-lg-token)", background: "var(--surface)" }}><span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>{String(index + 1).padStart(2, "0")} · {effect}</span><div style={{ display: "grid", placeItems: "center", minHeight: 72 }}><ProgressButtonDemo effect={effect} runSignal={runSignal} /></div></div>)}
        </div>
      </section>
    );
  },
  parameters: { layout: "fullscreen" },
};
