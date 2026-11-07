"use client";
import { useState } from "react";
import {
  AppShell,
  Button,
  Input,
  Modal,
  PageHeader,
} from "../index";
import type { SidebarMode } from "../index";
import { ChartExplorer } from "./ChartExplorer";
import { DashboardBlock, dashboardProjects } from "./DashboardBlock";
import { LibraryBlock } from "./LibraryBlock";
import { SettingsBlock } from "./SettingsBlock";
import { photos } from "./photos";
import styles from "./blocks.module.css";
const glyph = (path: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);
export type WorkspaceSection = "overview" | "analytics" | "library" | "settings";
const pages: Record<WorkspaceSection, { label: string; lead: string; icon: ReturnType<typeof glyph> }> = {
  overview: {
    label: "Dashboard",
    lead: "Projects, deliveries and who is on each one.",
    icon: glyph("M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"),
  },
  analytics: {
    label: "Analytics",
    lead: "Library views and downloads over the year.",
    icon: glyph("M4 20V10M10 20V4M16 20v-7M22 20H2"),
  },
  library: {
    label: "Library",
    lead: "Materials the team checks before each delivery.",
    icon: glyph("M4 4h6v16H4zM14 4l6 2-4 14-6-2z"),
  },
  settings: {
    label: "Settings",
    lead: "Your profile and the notices you get.",
    icon: glyph("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2"),
  },
};
const item = (id: WorkspaceSection) => ({ id, label: pages[id].label, icon: pages[id].icon });
/**
 * A complete product page: menu, top bar and account around the real pages
 * (dashboard, analytics, library, settings). Every menu item opens its page.
 */
export function NavigationBlock({
  defaultMode = "expanded",
  defaultSection = "overview",
}: { defaultMode?: SidebarMode; defaultSection?: WorkspaceSection } = {}) {
  const [active, setActive] = useState<WorkspaceSection>(defaultSection),
    [creating, setCreating] = useState(false),
    [name, setName] = useState(""),
    [projects, setProjects] = useState(dashboardProjects);
  const page = pages[active];
  return (
    <AppShell
      responsiveSidebar
      sidebar={{
        brand: "refy",
        defaultMode,
        workspace: { name: "Aurora", role: "Product team", initials: "EA" },
        account: { name: "Ana Lima", email: "ana@aurora.studio", initials: "AL", src: photos.personAna },
        groups: [
          { section: "Work area", items: [item("overview"), item("analytics"), item("library")] },
          { section: "Account", items: [item("settings")] },
        ],
        activeId: active,
        onNavigate: (next) => setActive(next.id as WorkspaceSection),
        cta: {
          label: "New project",
          icon: glyph("M12 5v14M5 12h14"),
          onClick: () => setCreating(true),
        },
      }}
      topbar={{
        showBrand: false,
        composition: "dense",
        crumbs: [
          { label: "Aurora", onClick: () => setActive("overview") },
          { label: page.label },
        ],
      }}
    >
      <div className={styles.workspace}>
        <PageHeader title={page.label} lead={page.lead} />
        {active === "overview" && (
          <DashboardBlock showHeader={false} projects={projects} onProjectsChange={setProjects} />
        )}
        {active === "analytics" && <ChartExplorer />}
        {active === "library" && <LibraryBlock />}
        {active === "settings" && <SettingsBlock avatarSrc={photos.personAna} />}
      </div>
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New project"
      >
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            const next = name.trim();
            if (!next) return;
            setProjects((rows) => [
              ...rows,
              { id: `projeto-${rows.length + 1}`, name: next, state: "Planned" },
            ]);
            setName("");
            setActive("overview");
            setCreating(false);
          }}
        >
          <Input
            label="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            block
          />
          <Button type="submit" variant="primary">
            Create project
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
