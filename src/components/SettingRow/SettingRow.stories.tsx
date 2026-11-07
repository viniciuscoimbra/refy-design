import { SettingRowExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { IconButton } from "../IconButton";
import { SettingRow, SettingRowGroup } from "./SettingRow";

const googleIcon = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

const keyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const copyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/**
 * `SettingRow` — linha de lista/configuração: leading + título + descrição +
 * meta mono + ações. Estática, clicável (`href`/`onClick`) ou com `Switch`.
 */
const meta = {
  id: "components-molecules-settingrow",
  title: "Components/Molecules/SettingRow",
  component: SettingRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "List/setting row: the most improvised pattern in the reference screens (`.shell-card-row`, `.oauth-row`, `.session-row`, `.pref-row`, `.key-row`, `.wh-row`, `.activity-row`, `.pm-row`, `.domain-row`…). Slots: `leading` (icon/`Avatar`; `leadingFrame` turns on the 36px frame for logos), `title` (takes an inline `Badge`), `description` (running text), `meta` (mono: email, IP, date, key), `actions` (on the right). Variants: static (`<div>`); clickable, with `href` becoming `<a>` and `onClick` becoming `<button>`; the whole row is the target, with a chevron. `switchProps` attaches a `Switch` with its label linked through aria. Group with `SettingRowGroup` (semantic list `role=\"list\"` + token dividers), typically inside a `Card`.",
          "",
          "**Where to use:** any list of setting/state items inside a card: OAuth connections, active sessions, preferences with a Switch, API keys, webhooks, payment methods, domains, recent activity.",
          "",
          "**Where NOT to use:** tabular data with sorting/columns (use `Table`); navigation between destinations with individual cards (use `NavCard`); a menu item (use `Menu`); a field-by-field form (use `Input`/`Select`). In a clickable row do NOT put interactive `actions` (a button inside a button is invalid HTML); use `meta`/`Badge`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Title: takes an inline Badge/Chip." },
    description: { control: "text", description: "Description in running text."},
    meta: { control: "text", description: "Meta mono (e-mail, IP, data…)." },
    leading: { control: false, description: "Icon or Avatar." },
    leadingFrame: { control: "boolean", description: "Moldura 36px p/ logos." },
    actions: { control: false, description: "Actions on the right."},
    href: { control: "text", description: "Linha vira `<a>`." },
    disabled: { control: "boolean" },
    showChevron: { control: "boolean", description: "Chevron on clickable rows." },
    onClick: { action: "clicked" },
    switchProps: { control: false, description: "Acopla um `Switch` (pref-row)." },
  },
} satisfies Meta<typeof SettingRow>;
export default meta;

type Story = StoryObj<typeof SettingRow>;

/** Playground: static row with an action on the right (`.shell-card-row` pattern). */
export const Playground: Story = {
  args: {
    title: "Two-factor authentication",
    description: "Protect your account by requiring a second factor at sign-in.",
    actions: (
      <>
        <Badge tone="neutral">Off</Badge>
        <Button size="sm" variant="secondary">
          Turn on
        </Button>
      </>
    ),
  },
};

/** OAuth connections: `leadingFrame` for the logo, status Badge in the title, mono meta. */
export const ConexoesOauth: Story = {
  name: "OAuth connections",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Connections">
        <SettingRow
          leading={googleIcon}
          leadingFrame
          title={
            <>
              Google{" "}
              <Badge tone="success" dot>
                Connected · primary
              </Badge>
            </>
          }
          meta="joao@example.com · connected on Jan 12, 2026"
          actions={
            <Button size="sm" variant="ghost" disabled>
              Primary provider
            </Button>
          }
        />
        <SettingRow
          leading={keyIcon}
          leadingFrame
          title="GitHub"
          meta="Not connected · useful to link repositories to the API"
          actions={
            <Button size="sm" variant="secondary">
              Connect
            </Button>
          }
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Active sessions: chip in the title, mono meta, mixed trailing (text/action). */
export const SessoesAtivas: Story = {
  name: "Active sessions",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Active sessions">
        <SettingRow
          title={
            <>
              MacBook Pro · Chrome 138{" "}
              <Badge tone="success">This session</Badge>
            </>
          }
          meta="Rio de Janeiro, BR · 187.65.xx.xx · 2 min ago"
          actions={<Badge tone="neutral">Active</Badge>}
        />
        <SettingRow
          title="iPhone 15 · Safari iOS 18"
          meta="Rio de Janeiro, BR · 187.65.xx.xx · yesterday"
          actions={
            <Button size="sm" variant="ghost">
              End
            </Button>
          }
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Preferences: `switchProps` attaches the Switch with its label linked by aria. */
export const Preferencias: Story = {
  name: "Preferences (Switch)",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Notifications">
        <SettingRow
          title="Review complete"
          description="Notify me when an analysis I started finishes."
          switchProps={{ defaultChecked: true }}
        />
        <SettingRow
          title="Activity detected changes"
          description="Monitored URLs whose score or search appearance changed."
          switchProps={{ defaultChecked: true }}
        />
        <SettingRow
          title="Weekly email summary"
          description="A workspace summary every Monday morning."
          switchProps={{}}
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** API keys: masked mono meta + copy/rotate IconButtons. */
export const ChavesDeApi: Story = {
  name: "API keys",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="API keys">
        <SettingRow
          title="Production"
          meta="rfy_live_••••••••••••4f2a · created May 3, 2026"
          actions={
            <>
              <IconButton size="sm" aria-label="Copy key" icon={copyIcon} />
              <Button size="sm" variant="ghost">
                Rotate
              </Button>
            </>
          }
        />
        <SettingRow
          title="Development"
          meta="rfy_test_••••••••••••91c8 · created May 3, 2026"
          actions={
            <>
              <IconButton size="sm" aria-label="Copy key" icon={copyIcon} />
              <Button size="sm" variant="ghost">
                Rotate
              </Button>
            </>
          }
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Recent activity: who did what, mono meta, cost in the trailing slot. */
export const AtividadeRecente: Story = {
  name: "Recent activity",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Recent activity">
        <SettingRow
          leading={<Avatar initials="JM" size="sm" />}
          title="Analysis · example.com/projects/aurora"
          meta="João Mendes · 2h ago · Aurora project"
          actions={<span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>−100 cr.</span>}
        />
        <SettingRow
          leading={<Avatar initials="MC" size="sm" />}
          title="Deep synthesis · example.com/project-b/korean-skincare"
          meta="Marina Costa · 5h ago · Horizon project"
          actions={<span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>−300 cr.</span>}
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Clickable: `href` becomes `<a>`, `onClick` becomes `<button>`; the whole row is the target. */
export const Clicavel: Story = {
  name: "Clickable (href/onClick)",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Tasks">
        <SettingRow
          href="#issue-1"
          title="Duplicate title on the home page"
          description="Priority 1 · estimated gain +12 pts"
          meta="example.com · found 2 days ago"
        />
        <SettingRow
          onClick={() => {}}
          title="Meta description missing on 8 pages"
          description="Priority 2 · estimated gain +8 pts"
        />
        <SettingRow
          href="#issue-3"
          disabled
          title="Outdated sitemap"
          description="Resolved on Jul 14, 2026"
        />
      </SettingRowGroup>
    </Card>
  ),
};

export const Interativo: Story = { name: "Interactive", render: () => <SettingRowExample /> };

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled", args: { title: "Manage access", description: "Available to admins only.", disabled: true, onClick: () => {} } };
