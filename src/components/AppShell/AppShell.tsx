"use client";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "../BrandLogo";
import type { BrandLogoBrand } from "../BrandLogo";
import { Drawer } from "../Drawer";
import { IconButton } from "../IconButton";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Sidebar } from "../Sidebar";
import type { SidebarProps } from "../Sidebar";
import { Topbar } from "../Topbar";
import type { TopbarProps } from "../Topbar";
import styles from "./AppShell.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
/** Props for the authenticated application shell layout. */
export interface AppShellProps {
  /** Props passed to the Sidebar. */
  sidebar: SidebarProps;
  /** Props passed to the Topbar. */
  topbar: TopbarProps;
  /** Maximum width of the content column. Default 1240px. */
  contentMaxWidth?: number;
  responsiveSidebar?: boolean;
  navigationLabel?: string;
  /** Explicit theme. When omitted, inherits the global Storybook/app theme. */
  theme?: "light" | "dark" | "editorial";
  children: ReactNode;
  className?: string;
}

/**
 * Layout completo do app autenticado: [Sidebar] [Topbar + conteúdo].
 * É só composição — não duplica estilo dos filhos.
 */
export function AppShell({
  sidebar,
  topbar,
  contentMaxWidth = 1240,
  responsiveSidebar = false,
  navigationLabel: navigationLabelProp,
  theme,
  children,
  className,
}: AppShellProps) {
  const m = useComponentMessages("appShell", enMessages.appShell);
  const navigationLabel = navigationLabelProp ?? m.openNavigation;
  const [mobile, setMobile] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  useEffect(() => {
    if (!responsiveSidebar) return;
    const shell = shellRef.current;
    if (!shell) return;
    const update = () => setMobile(shell.getBoundingClientRect().width <= 720);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [responsiveSidebar]);
  const drawerNavigation = responsiveSidebar && mobile;
  const navigationBrand = typeof sidebar.brand === "string" && ["refy"].includes(sidebar.brand) ? <BrandLogo brand={sidebar.brand as BrandLogoBrand} symbol/> : sidebar.brand ?? m.navigation;
  return (
    <div ref={shellRef} className={cn(styles.shell, className)} data-theme={theme}>
      {drawerNavigation ? <Drawer open={navigationOpen} onOpenChange={setNavigationOpen} side="left" title={navigationBrand} className={styles.navigationDrawer}><div className={styles.mobileNavigation}><Sidebar {...sidebar} showHeader={false} mode="expanded" onModeChange={()=>setNavigationOpen(false)} onNavigate={item=>{sidebar.onNavigate?.(item);setNavigationOpen(false);}}/></div></Drawer> : <Sidebar {...sidebar} />}
      <main className={styles.main}>
        <Topbar {...topbar} leading={drawerNavigation ? <><IconButton aria-label={navigationLabel} variant="ghost" aria-expanded={navigationOpen} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>} onClick={()=>setNavigationOpen(true)}/>{topbar.leading}</> : topbar.leading} />
        <div className={styles.body}>
          <div className={styles.content} style={{ maxWidth: contentMaxWidth }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
