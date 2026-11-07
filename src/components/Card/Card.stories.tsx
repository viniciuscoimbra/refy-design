import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader } from "./Card";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { ThemeProvider } from "../../lib/ThemeProvider";

const meta = {
  id: "components-molecules-card",
  title: "Components/Molecules/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Base surface of the app. `tone=\"inverted\"` becomes the dark highlight surface (ink + brand radial) used in billing/usage heroes; ink tokens are re-scoped inside the card, so child atoms stay readable without an extra prop.",
          "",
          "**Where to use:** grouping related content on one surface; `inverted` only for ONE highlight per screen (plan summary, usage hero, upsell).",
          "",
          "**Where NOT to use:** a whole clickable card that navigates (use `NavCard`); a selectable option (use `ChoiceCard`); `inverted` on ordinary form/list cards, where it loses its highlight role.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    elevation: { control: "inline-radio", options: [0, 1, 2, 3, 4] },
    padding: { control: "inline-radio", options: ["none", "sm", "md"] },
    tone: { control: "inline-radio", options: ["default", "inverted"] },
  },
} satisfies Meta<typeof Card>;
export default meta;

type Story = StoryObj<typeof Card>;

export const Simples: Story = { name: "Simple",
  args: { elevation: 0, children: "Card content." },
  render: (args) => <Card {...args} style={{ maxWidth: 360 }} />,
};

export const ComHeader: Story = { name: "With header",
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <CardHeader
        title="Usage this month"
        count="12 / 50"
        action={
          <Button variant="ghost" size="sm">
            Details
          </Button>
        }
      />
      <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)" }}>
        Credit usage in the current cycle.
      </p>
    </Card>
  ),
};

export const NiveisDeElevacao: Story = {
  name: "Elevation · e0–e4",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        minHeight: 520,
      }}
    >
      {(["light", "dark"] as const).map((theme) => (
        <section
          key={theme}
          data-theme={theme}
          style={{
            padding: 32,
            color: "var(--ink-1)",
            background: "var(--bg)",
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <span
              style={{
                color: "var(--ink-3)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: ".16em",
                textTransform: "uppercase",
              }}
            >
              Components · Data · {theme}
            </span>
            <h3
              style={{
                margin: "6px 0 4px",
                fontFamily: "var(--font-headline)",
                fontSize: 22,
              }}
            >
              Cards · 5 elevation levels
            </h3>
            <p
              style={{
                maxWidth: "56ch",
                margin: 0,
                color: "var(--ink-3)",
                fontSize: 12.5,
                lineHeight: 1.55,
              }}
            >
              e0 for dense lists, e2 for highlights and e4 for overlays.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 16,
            }}
          >
            {(["Flat", "Resting", "Hover", "Lifted", "Overlay"] as const).map(
              (label, elevation) => (
                <Card
                  key={label}
                  elevation={elevation as 0 | 1 | 2 | 3 | 4}
                  style={{ minHeight: 112 }}
                >
                  <span
                    style={{
                      color: "var(--ink-3)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                    }}
                  >
                    e{elevation}
                  </span>
                  <div style={{ marginTop: 8, fontWeight: 600 }}>{label}</div>
                </Card>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  ),
  parameters: { layout: "fullscreen" },
};

export const Invertido: Story = {
  name: "Inverted (tone=inverted)",
  render: () => (
    <Card tone="inverted" style={{ maxWidth: 480 }}>
      <p
        style={{
          margin: "0 0 10px",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-eyebrow)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-eyebrow)",
          color: "var(--brand-primary)",
        }}
      >
        Current plan
      </p>
      <h3
        style={{
          margin: "0 0 6px",
          fontFamily: "var(--font-headline)",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: "var(--ink-1)",
        }}
      >
        Growth
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "var(--ink-2)" }}>
        Renews on August 12 · billed yearly
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <Badge tone="success">Active</Badge>
        <Button variant="secondary" size="sm">
          Manage plan
        </Button>
      </div>
    </Card>
  ),
};

export const ComDescricao: Story = { name: "With description",
  render: () => (
    <Card>
      <CardHeader
        title="Aurora project"
        description="A layout to organize the team's work."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 7h6l2 2h10v12H3z" />
          </svg>
        }
        action={<Button size="sm">View project</Button>}
      />
    </Card>
  ),
};

export const HeaderCompacto: Story = { name: "Compact header",
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 480 }}>
      <Card>
        <CardHeader title="Aurora project" description="Main header." />
      </Card>
      <Card>
        <CardHeader
          size="sm"
          title="Team deliveries"
          description="Secondary header, with the same API."
        />
      </Card>
      <ThemeProvider
        theme={{
          name: "Custom headers",
          tokens: {
            "--card-sm-title-size": "20px",
            "--card-sm-description-size": "15px",
            "--card-sm-icon-size": "42px",
            "--card-sm-icon-glyph-size": "22px",
          },
        }}
      >
        <Card>
          <CardHeader
            size="sm"
            title="Custom header"
            description="Metrics provided by the public configuration."
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7h6l2 2h10v12H3z" />
              </svg>
            }
          />
        </Card>
      </ThemeProvider>
    </div>
  ),
};
