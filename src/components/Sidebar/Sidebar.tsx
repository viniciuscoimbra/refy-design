"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { BrandLogo } from "../BrandLogo";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";
import { UserMenu } from "../UserMenu";
import type { MenuEntry } from "../Menu";
import { WorkspaceSwitcher } from "../WorkspaceSwitcher";
import type { Workspace } from "../WorkspaceSwitcher";
import styles from "./Sidebar.module.css";

import { useMessages } from "../../lib/locale";
export interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  target?: string;
  badge?: string | number;
}

export interface SidebarNavGroup {
  /** Título do grupo (some quando colapsado). */
  section?: string;
  items: SidebarNavItem[];
}

export type SidebarMode = "expanded" | "rail" | "compact";

/** Props for the application sidebar. */
export interface SidebarProps {
  /** Navigation groups. */
  groups: SidebarNavGroup[];
  /** Active item id (controlled). */
  activeId?: string;
  /** Initial active item (uncontrolled); clicking changes it on its own. */
  defaultActiveId?: string;
  /** Current workspace (static). Prefer `workspaces` for the full switcher. */
  workspace?: { name: string; role?: string; initials: string };
  /** List of workspaces; becomes a `WorkspaceSwitcher` (combobox). */
  workspaces?: Workspace[];
  /** Current workspace id when `workspaces` is used. */
  workspaceId?: string;
  onWorkspaceChange?: (workspace: Workspace) => void;
  account?: { name: string; email?: string; initials: string; seed?: string; src?: string };
  footerActions?: ReactNode;
  showHeader?: boolean;
  /** Account menu items (opens above the footer). Default: Profile/Settings/Sign out. */
  accountMenu?: MenuEntry[];
  onAccountSelect?: (id: string) => void;
  /** Primary CTA at the top (e.g. New project). */
  cta?: { label: string; icon?: ReactNode; onClick?: () => void; href?: string };
  /** Wordmark/logo shown at the top. Accepts text or markup (e.g. `<img>`). Default `"refy"`. */
  brand?: ReactNode;
  /** Starts collapsed. */
  defaultCollapsed?: boolean;
  /** Controlled mode; `rail` shows icon + label and `compact` icon only. */
  mode?: SidebarMode;
  defaultMode?: SidebarMode;
  onModeChange?: (mode: SidebarMode) => void;
  onNavigate?: (item: SidebarNavItem) => void;
}

/** Navegação principal do app. Composição: `WorkspaceSwitcher`, `Button` (CTA),
 * `Badge` (contadores) e `UserMenu` (conta, abre para cima). Colapsável para
 * 64px. No modo compacto, seletores continuam funcionais e recebem dicas.
 * Item ativo controlado via `activeId` ou não-controlado via `defaultActiveId`. */
export function Sidebar({
  groups,
  activeId,
  defaultActiveId,
  workspace,
  workspaces,
  workspaceId,
  onWorkspaceChange,
  account,
  accountMenu,
  footerActions,
  onAccountSelect,
  cta,
  brand = "refy",
  showHeader = true,
  defaultCollapsed = false,
  mode,
  defaultMode,
  onModeChange,
  onNavigate,
}: SidebarProps) {
  const m = useMessages("sidebar");
  const [internalMode, setInternalMode] = useState<SidebarMode>(defaultMode ?? (defaultCollapsed ? "compact" : "expanded"));
  const [internalActive, setInternalActive] = useState(defaultActiveId);
  const active = activeId !== undefined ? activeId : internalActive;
  const currentMode = mode ?? internalMode;
  const collapsed = currentMode !== "expanded";
  const showLabels = currentMode !== "compact";

  function setMode(next: SidebarMode) {
    if (mode === undefined) setInternalMode(next);
    onModeChange?.(next);
  }

  return (
    <aside className={cn(styles.sidebar, styles[currentMode], collapsed && styles.collapsed)} data-mode={currentMode}>
      {showHeader && <div className={styles.top}>
        {!collapsed && <span className={styles.logo}>{brand === "refy" ? <BrandLogo brand="refy" size="sm" symbol /> : brand}</span>}
        <Tooltip label={collapsed ? m.expand : m.collapse} side="right" portalled>
          <IconButton className={styles.collapseBtn} aria-label={collapsed ? m.expand : m.collapse}
            onClick={() => setMode(collapsed ? "expanded" : "compact")}
            icon={<><span className={styles.compactBrand}>{brand === "refy" ? <BrandLogo brand="refy" size="sm" symbol markOnly /> : brand}</span><svg className={styles.expandIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d={collapsed ? "m13 9 3 3-3 3" : "m16 9-3 3 3 3"} /></svg></>} />
        </Tooltip>
      </div>}

      {workspaces ? (
        <div className={styles.wsWrap}>
          {collapsed ? <Tooltip label={m.switchWorkspace} side="right" portalled><WorkspaceSwitcher workspaces={workspaces} value={workspaceId} onChange={onWorkspaceChange} compact /></Tooltip> : <WorkspaceSwitcher workspaces={workspaces} value={workspaceId} onChange={onWorkspaceChange} />}
        </div>
      ) : (
        workspace && (
          <div className={styles.ws} aria-label={m.currentWorkspace}>
            <Avatar size="md" initials={workspace.initials} shape="square" />
            {!collapsed && (
              <span className={styles.wsMeta}>
                <span className={styles.wsName}>{workspace.name}</span>
                {workspace.role && <span className={styles.wsRole}>{workspace.role}</span>}
              </span>
            )}
          </div>
        )
      )}

      {cta && <div className={styles.ctaWrap}>
        {collapsed ? <Tooltip label={cta.label} side="right" portalled>
          <IconButton variant="solid" className={styles.cta} aria-label={cta.label} icon={cta.icon} onClick={cta.onClick} />
        </Tooltip> : <Button variant="primary" block className={styles.cta} leadingIcon={cta.icon} onClick={cta.onClick}>{cta.label}</Button>}
      </div>}

      <nav className={styles.nav}>
        {groups.map((group, gi) => (
          <div key={group.section ?? gi}>
            {group.section && <div className={styles.section}>{group.section}</div>}
            {group.items.map((item) => {
              const isActive = item.id === active;
              const Tag = item.href ? "a" : "button";
              const navItem = (
                <Tag
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  className={cn(styles.item, isActive && styles.itemActive)}
                  data-tip={item.label}
                  aria-label={currentMode === "compact" ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    if (activeId === undefined) setInternalActive(item.id);
                    onNavigate?.(item);
                  }}
                >
                  <span className={styles.itemIcon}>{item.icon}</span>
                  {showLabels && <span className={styles.itemLabel}>{item.label}</span>}
                  {item.badge != null && (
                    <Badge tone="danger" className={styles.badge}>
                      {item.badge}
                    </Badge>
                  )}
                </Tag>
              );
              return collapsed ? (
                <Tooltip key={item.id} label={item.label} side="right" delayMs={250} portalled>
                  {navItem}
                </Tooltip>
              ) : navItem;
            })}
          </div>
        ))}
      </nav>

      {(account || footerActions) && (
        <div className={styles.footer}>
          {account && (collapsed ? <Tooltip label={m.account(account.name)} side="right" portalled><UserMenu user={account} entries={accountMenu} onSelect={onAccountSelect} side="top" compact /></Tooltip> : <UserMenu user={account} entries={accountMenu} onSelect={onAccountSelect} side="top" />)}
          {footerActions}
        </div>
      )}
    </aside>
  );
}
