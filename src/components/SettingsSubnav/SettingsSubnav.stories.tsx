import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SettingsSubnav } from "./SettingsSubnav";
import type { SettingsSubnavGroup } from "./SettingsSubnav";

const GROUPS: SettingsSubnavGroup[] = [
  {
    title: "Personal",
    items: [
      { href: "#account", label: "Account", description: "Profile, password, 2FA" },
      { href: "#general", label: "Overall", description: "Language, theme, notifications" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { href: "#workspace", label: "Workspace", description: "Name, domain, logo" },
      { href: "#team", label: "Team", description: "Members and roles" },
      { href: "#projects", label: "Projects", description: "Team work areas" },
      { href: "#billing", label: "Billing", description: "Plan, payment, invoices" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { href: "#connectors", label: "Connectors", description: "External apps" },
      { href: "#api", label: "API & Webhooks", description: "Keys and endpoints" },
    ],
  },
];

const gearIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const userIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/**
 * `SettingsSubnav` — menu secundário vertical de subpáginas do mesmo assunto.
 */
const meta = {
  id: "components-molecules-settingssubnav",
  title: "Components/Molecules/SettingsSubnav",
  component: SettingsSubnav,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: { default: "surface-2" },
    docs: {
      description: {
        component: [
          "Vertical secondary menu of subpages on the SAME subject (e.g. Settings → Account/General/Team/Projects): the left column of the `settings_*` screens. Each item is a real link (`{href, label, icon?, description?}`); the item whose `href` matches `activeHref` gets `aria-current=\"page\"`. `renderLink` injects the router Link (Next etc.) without coupling the library; `groups` groups items under a section title.",
          "",
          "**Where to use:** navigation between sibling subpages of one area (settings, admin, profile), where each item is its own ROUTE (hard rule: CRUD/entity = routed page).",
          "",
          "**Where NOT to use:** the app's main navigation (use `Sidebar`); sections INSIDE one page (use `TableOfContents`); switching content without changing route (use `Tabs`); action menus (use `Menu`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    activeHref: { control: "text", description: "href of the active item."},
    label: { control: "text", description: "aria-label of the nav."},
    items: { control: false },
    groups: { control: false },
    renderLink: { control: false },
    onNavigate: { action: "navigate" },
  },
} satisfies Meta<typeof SettingsSubnav>;
export default meta;

type Story = StoryObj<typeof SettingsSubnav>;

/** Grouped with descriptions, a replica of the `settings_*` screens column. */
export const Playground: Story = {
  args: { groups: GROUPS, activeHref: "#account" },
  render: (args) => {
    const [active, setActive] = useState(args.activeHref);
    return <div style={{ maxWidth: '100%', width: 280 }}>
      <SettingsSubnav {...args} activeHref={active} renderLink={(item, props) => <a {...props} onClick={event => { event.preventDefault(); setActive(item.href); }} />} />
      <p role="status">Selected section: {GROUPS.flatMap(group => group.items).find(item => item.href === active)?.label}</p>
    </div>;
  },
};

/** Flat: only `items`, no groups or description. */
export const Flat: Story = {
  args: {
    items: [
      { href: "#account", label: "Account" },
      { href: "#general", label: "Overall" },
      { href: "#time", label: "Team" },
      { href: "#projects", label: "Projects" },
    ],
    activeHref: "#general",
  },
  render: (args) => (
    <div style={{ width: 200, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
      <SettingsSubnav {...args} />
    </div>
  ),
};

/** With icons via a ReactNode prop (icons are never bundled). */
export const ComIcones: Story = {
  name: "With icons",
  args: {
    items: [
      { href: "#account", label: "Account", icon: userIcon, description: "Profile, password, 2FA" },
      { href: "#general", label: "Overall", icon: gearIcon, description: "Language, theme" },
    ],
    activeHref: "#account",
  },
  render: (args) => (
    <div style={{ width: 220, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
      <SettingsSubnav {...args} />
    </div>
  ),
};

/**
 * Injectable `renderLink`, here simulating a router Link that intercepts navigation and switches the active item by state (same signature as Next `<Link>`).
 */
export const RenderLinkInjetado: Story = {
  name: "Injected renderLink (router)",
  args: { groups: GROUPS },
  render: (args) => {
    const [active, setActive] = useState("#account");
    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ width: 220, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
          <SettingsSubnav
            {...args}
            activeHref={active}
            renderLink={(item, p) => (
              <a
                {...p}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(item.href);
                }}
              />
            )}
          />
        </div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
          current route: {active}
        </code>
      </div>
    );
  },
};
