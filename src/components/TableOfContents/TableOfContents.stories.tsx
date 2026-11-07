import type { Meta, StoryObj } from "@storybook/react";
import { useId, useState } from "react";
import { TableOfContents } from "./TableOfContents";
import type { TableOfContentsProps } from "./TableOfContents";

const SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    body: "Your name, photo and public workspace details. Your name shows in comments, mentions and the activity history, so keep it recognizable to the team. The photo is optional but helps in large teams.",
  },
  {
    id: "password",
    label: "Password",
    body: "Use a unique password and change it if you suspect it leaked. A strong password has 12+ characters and mixes uppercase, numbers and symbols. If you signed in with SSO, this section is read-only.",
  },
  {
    id: "twofa",
    label: "Two-step verification",
    body: "Two-step verification protects your account even if the password leaks. We recommend an authenticator app (TOTP) over SMS. Keep the recovery codes somewhere safe; each one works only once.",
  },
  {
    id: "connections",
    label: "Connections",
    body: "External apps allowed to access your account: calendar, email, CRM integrations. Review this list from time to time and revoke what you no longer use; every active connection is a way in.",
  },
  {
    id: "sessions",
    label: "Active sessions",
    body: "Every device with an open session on this account, with browser, approximate IP and last access. End sessions you do not recognize right away, then change your password.",
  },
  {
    id: "remove",
    label: "Delete account",
    body: "Permanent action: removes your access and transfers or deletes your data according to the workspace policy. Projects you solely own must be transferred first. This cannot be undone.",
  },
];

const ITEMS = SECTIONS.map(({ id, label }) => ({ id, label }));

/**
 * `TableOfContents` — trilho "Nesta página" com scrollspy.
 */
const meta = {
  id: "components-molecules-tableofcontents",
  title: "Components/Molecules/TableOfContents",
  component: TableOfContents,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Side table-of-contents rail for a long page (\"On this page\"). Takes anchors `{id, label}` in page order and highlights the visible section through scrollspy (IntersectionObserver). Clicking scrolls smoothly to the anchor (instant with `prefers-reduced-motion`). Pass `activeId`/`onActiveChange` to control it from outside; the scrollspy turns itself off. `level` (2/3) indents sub-items; `sticky` pins the rail while scrolling; `root` points the scrollspy at its own scrollable container (default: viewport).",
          "",
          "**Where to use:** right column of long pages with several sections: settings screens (`settings_*`), documentation, long forms split into sections with an `id`.",
          "",
          "**Where NOT to use:** navigation between different PAGES (use `SettingsSubnav` or `Sidebar`); short pages with 1–2 sections (noise); inside a modal/drawer; as tabs: a TOC does not switch content, it only scrolls.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    scrollSpy: { control: "boolean" },
    sticky: { control: "boolean" },
    rootMargin: { control: "text" },
    onActiveChange: { action: "activeChange" },
    activeId: { control: false },
    defaultActiveId: { control: false },
    items: { control: false },
    root: { control: false },
  },
  args: { items: ITEMS },
} satisfies Meta<typeof TableOfContents>;
export default meta;

type Story = StoryObj<typeof TableOfContents>;

/**
 * Scrollspy vivo: role o CONTEÚDO no painel rolável abaixo (não a página) —
 * o item ativo do trilho acompanha a seção visível. O contêiner é passado ao
 * scrollspy via `root`. Clique num item para rolar suave até a seção.
 */
function ContentsDemo({
  controlled = false,
  items,
  ...props
}: TableOfContentsProps & { controlled?: boolean }) {
  const prefix = useId();
  const localItems = items.map((item) => ({
    ...item,
    id: `${prefix}-${item.id}`,
  }));
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [active, setActive] = useState(`${prefix}-senha`);
  return (
    <div
      ref={setScroller}
      data-testid="toc-scroller"
      style={{
        height: 420,
        overflowY: "auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
        gap: 32,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-default)",
        padding: "0 var(--space-6)",
        background: "var(--surface)",
      }}
    >
      <div>
        {localItems.map((item, index) => (
          <section
            key={item.id}
            id={item.id}
            style={{ minHeight: 340, paddingTop: 24 }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--ink-1)",
              }}
            >
              {item.label}
            </h2>
            <p style={{ color: "var(--ink-2)", lineHeight: 1.6 }}>
              {SECTIONS.find((section) => section.id === items[index].id)
                ?.body ?? `Content of the ${item.label} section.`}
            </p>
            <p style={{ color: "var(--ink-3)" }}>
              Scroll this panel or select an item in the outline.
            </p>
          </section>
        ))}
      </div>
      <div
        style={{
          position: "sticky",
          top: 24,
          alignSelf: "start",
          paddingTop: 24,
        }}
      >
        <TableOfContents
          {...props}
          items={localItems}
          root={scroller}
          rootMargin="-24px 0px -60% 0px"
          defaultActiveId={
            props.defaultActiveId
              ? `${prefix}-${props.defaultActiveId}`
              : undefined
          }
          activeId={controlled ? active : undefined}
          onActiveChange={controlled ? setActive : props.onActiveChange}
        />
        {controlled && (
          <p role="status" style={{ color: "var(--ink-2)" }}>
            Current section:{" "}
            {localItems.find((item) => item.id === active)?.label ?? "None"}
          </p>
        )}
      </div>
    </div>
  );
}
export const Playground: Story = {
  render: (args) => <ContentsDemo {...args} />,
};
/** Active state controlled by the parent, with its own target for each anchor. */
export const Controlado: Story = { name: "Controlled",
  render: (args) => <ContentsDemo {...args} controlled />,
};

/** Levels: `level: 2`/`3` indent sub-items. */
export const ComNiveis: Story = {
  render: (args) => <ContentsDemo {...args} />,
  name: "With levels",
  args: {
    items: [
      { id: "profile", label: "Profile" },
      { id: "avatar", label: "Photo", level: 2 },
      { id: "data", label: "Personal details", level: 2 },
      { id: "password", label: "Password" },
      { id: "requirements", label: "Requirements", level: 2 },
      { id: "history", label: "History", level: 3 },
    ],
    defaultActiveId: "data",
    scrollSpy: false,
  },
};

/** Custom label. */
export const RotuloCustom: Story = {
  render: (args) => <ContentsDemo {...args} />,
  name: "Custom label",
  args: { label: "In this guide", defaultActiveId: "connections", scrollSpy: false },
};
