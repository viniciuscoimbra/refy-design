import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";

const meta = {
  id: "components-molecules-tabs",
  title: "Components/Molecules/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    items: { control: false },
    variant: { control: "inline-radio", options: ["underline", "pill"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    value: { control: false },
    defaultValue: { control: "text" },
    onChange: { control: false },
  },
} satisfies Meta<typeof Tabs>;
export default meta;

type Story = StoryObj<typeof Tabs>;

const items = [
  { id: "general", label: "Overview", content: <p style={{ color: "var(--ink-2)" }}>Coverage panel.</p> },
  { id: "issues", label: "Issues", badge: 14, content: <p style={{ color: "var(--ink-2)" }}>14 issues mapped.</p> },
  { id: "backlog", label: "Tasks", badge: 23, content: <p style={{ color: "var(--ink-2)" }}>Tasks prioritized.</p> },
  { id: "hist", label: "History", content: <p style={{ color: "var(--ink-2)" }}>Previous analyses.</p> },
];

export const Sublinhado: Story = { name: "Underline", args: { items, variant: "underline" } };
export const Pilula: Story = { name: "Pill", args: { items, variant: "pill" } };

/** Use the states only when each tab is a part that is saved independently. */
export const EstadosDoCadastro: Story = {
  name: "Sign-up states",
  args: {
    items: [
      { id: "company", label: "Company", status: "complete", content: <p>Company details saved.</p> },
      { id: "contact", label: "Address and contact", content: <p>Part not filled in yet.</p> },
      { id: "assignee", label: "Owner", status: "warning", content: <p>Some fields need attention.</p> },
      { id: "documents", label: "Documents", content: <p>Documents not sent yet.</p> },
    ],
  },
};

export const Vertical: Story = {
  args: {
    items: [
      ...items.slice(0, 2),
      { id: "unavailable", label: "Unavailable", disabled: true, content: null },
      ...items.slice(2),
    ],
    orientation: "vertical",
  },
};

export const ConteudoExtremo: Story = {
  name: "Extreme content",
  decorators: [(Story) => <div style={{ width: 420, maxWidth: "100%" }}><Story /></div>],
  args: {
    items: [
      { id: "short", label: "Overall", content: <p style={{ color: "var(--ink-2)" }}>Short content.</p> },
      { id: "long", label: "Documents waiting for final review confirmation", badge: 128, content: <p style={{ color: "var(--ink-2)", maxWidth: 760 }}>A deliberately long tab stays on one line and the list gets a quiet horizontal scroll when needed.</p> },
      { id: "other", label: "Full assignment and support history", content: <p style={{ color: "var(--ink-2)" }}>History.</p> },
    ],
    variant: "underline",
  },
};

/** Tabs can wrap onto lines in narrow panels, without hiding options. */
export const ComQuebraDeLinha: Story = {
  name: 'With line wrap',
  args: { items, wrap: true, variant: 'pill' },
  decorators: [(Story) => <div style={{maxWidth:260,width:'100%'}}><Story/></div>],
};
