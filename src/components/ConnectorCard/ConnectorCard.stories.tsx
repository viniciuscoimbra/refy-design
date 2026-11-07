import { ConnectorCardExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { ConnectorCard } from "./ConnectorCard";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { StatusDot } from "../StatusDot";

const wpLogo = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#21759b"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 1.5c4.69 0 8.5 3.81 8.5 8.5 0 1.74-.52 3.36-1.42 4.71L13.4 7.36h2.4v-.83h-7.5v.83h2.32l1.99 5.45-2.79 8.36L4.04 7.36h2.27v-.83H4.05A8.49 8.49 0 0 1 12 3.5Zm5.83 14.21L13.94 9.5l3.18 8.66c.48-.13.92-.31 1.34-.55l-.63-1.9Zm-7.66 1.7-3.59-9.84-2.45 7.13a8.49 8.49 0 0 0 6.04 2.71Z"
    />
  </svg>
);

/** `ConnectorCard` — card de integração/conexão OAuth. */
const meta = {
  id: "components-molecules-connectorcard",
  title: "Components/Molecules/ConnectorCard",
  component: ConnectorCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Integration card: logo (slot, the service SVG), name + status (slot: `Badge`/`StatusDot`), description, mono sync meta and actions on the right. `locked` marks a connector outside the plan: dimmed surface and `lockHint` in place of the actions (upsell).",
          "",
          "**Where to use:** list of connectors (WordPress, Search Console, GitHub) and the account's OAuth connections (Google, Apple): the same visual family in both places.",
          "",
          "**Where NOT to use:** settings that are not an integration (use `SettingRow`); navigation to another page (use `NavCard`); the connect flow itself (that is `Modal`/`Drawer`, owned by the app).",
        ].join("\n"),
      },
    },
  },
  args: { name: "WordPress" },
  argTypes: {
    name: { control: "text" },
    description: { control: "text" },
    meta: { control: "text" },
    locked: { control: "boolean" },
    logo: { control: false },
    status: { control: false },
    actions: { control: false },
    lockHint: { control: false },
  },
} satisfies Meta<typeof ConnectorCard>;
export default meta;

type Story = StoryObj<typeof ConnectorCard>;

export const Conectado: Story = { name: "Connected",
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="WordPress"
      status={<Badge tone="success">Connected</Badge>}
      description="Reads posts and suggests edits in place, without publishing anything."
      meta="example.com · 4 sites connected · synced 12 min ago"
      actions={
        <Button variant="secondary" size="sm">
          Configure
        </Button>
      }
    />
  ),
};

export const Desconectado: Story = { name: "Disconnected",
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="WordPress"
      status={<Badge tone="neutral">Disconnected</Badge>}
      description="Reads posts and suggests edits in place, without publishing anything."
      actions={
        <Button variant="primary" size="sm">
          Connect
        </Button>
      }
    />
  ),
};

export const ComStatusDot: Story = {
  name: "Account OAuth connection (StatusDot)",
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="Google"
      status={<StatusDot tone="good">Connected · primary</StatusDot>}
      meta="joao@example.com · connected on Jan 12, 2026"
      actions={
        <Button variant="ghost" size="sm" disabled>
          Primary provider
        </Button>
      }
    />
  ),
};

export const BloqueadoPorPlano: Story = {
  name: "Locked by plan (locked)",
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="GitHub"
      description="Opens PRs with the suggested fixes straight in the site repository."
      locked
      lockHint={
        <>
          <Badge tone="neutral">Growth plan</Badge>
          <Button variant="secondary" size="sm">
            Upgrade
          </Button>
        </>
      }
    />
  ),
};

export const ListaDeConectores: Story = { name: "Connector list",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
      <ConnectorCard
        logo={wpLogo}
        name="WordPress"
        status={<Badge tone="success">Connected</Badge>}
        meta="4 sites · synced 12 min ago"
        actions={
          <Button variant="secondary" size="sm">
            Configure
          </Button>
        }
      />
      <ConnectorCard
        logo={wpLogo}
        name="Search Console"
        status={<Badge tone="success">Connected</Badge>}
        meta="3 properties · synced 1h ago"
        actions={
          <Button variant="secondary" size="sm">
            Configure
          </Button>
        }
      />
      <ConnectorCard
        logo={wpLogo}
        name="GitHub"
        locked
        lockHint={<Badge tone="neutral">Growth plan</Badge>}
      />
    </div>
  ),
};

export const Interativo: Story = { name: "Interactive", render: () => <ConnectorCardExample /> };
