"use client";
import { useState } from "react";
import { Avatar } from "../Avatar";
import { Menu, type MenuEntry } from "../Menu";
import { cn } from "../../lib/cn";
import styles from "./UserMenu.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import type { RefyMessages } from "../../lib/messages/en";
export interface UserMenuUser {
  name: string;
  email?: string;
  initials: string;
  /** Identificador estável usado para manter a mesma cor de avatar em qualquer tela. */
  seed?: string;
  /** URL da foto (sobrepõe as iniciais). */
  src?: string;
}

export interface UserMenuProps {
  user: UserMenuUser;
  /** Menu items. Default: Profile, Settings, ─, Sign out. */
  entries?: MenuEntry[];
  onSelect?: (id: string) => void;
  /** Avatar only (topbar); default shows name + email (sidebar). */
  compact?: boolean;
  /** Menu opens above the trigger (sidebar footer). */
  side?: "top" | "bottom";
  /**
   * Menu edge aligned to the start or end of the trigger. Default: full width
in default mode; `end` in compact.
   */
  align?: "start" | "end";
  className?: string;
  "aria-describedby"?: string;
}

const UserIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);
const GearIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10 10 2.8 2.8M1 12h4m14 0h4M4.2 19.8 7 17m10-10 2.8-2.8" />
  </svg>
);
const LogoutIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const defaultEntries = (m: RefyMessages["userMenu"]): MenuEntry[] => [
  { id: "profile", label: m.profile, icon: UserIcon },
  { id: "settings", label: m.settings, icon: GearIcon },
  { type: "separator" },
  { id: "logout", label: m.logout, icon: LogoutIcon, danger: true },
];

/**
 * UserMenu — bloco de usuário que abre um menu de conta.
 *
 * Compõe `Avatar` + `Menu`: avatar (+ nome/e-mail no modo padrão) como
 * trigger; itens padrão Perfil/Configurações/Sair, customizáveis via
 * `entries`. `compact` para a topbar (só avatar), `side="top"` para o
 * rodapé da sidebar.
 *
 *   <UserMenu user={{ name: "João", email: "joao@…", initials: "JM" }} onSelect={go} />
 */
export function UserMenu({
  user,
  entries: entriesProp,
  onSelect,
  compact,
  side = "bottom",
  align,
  className,
  "aria-describedby": describedBy,
}: UserMenuProps) {
  const m = useComponentMessages("userMenu", enMessages.userMenu);
  const entries = entriesProp ?? defaultEntries(m);
  const [open, setOpen] = useState(false);
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      entries={entries}
      onSelect={onSelect}
      align={align ?? (compact ? "end" : "start")}
      side={side}
      matchWidth={!compact}
      className={cn(
        styles.wrap,
        className
      )}
    >
      <button
        type="button"
        className={cn(styles.trigger, compact && styles.triggerCompact)}
        aria-describedby={describedBy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={m.account(user.name)}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar size="md" initials={user.initials} src={user.src} seed={user.seed} />
        {!compact && (
          <span className={styles.meta}>
            <span className={styles.name}>{user.name}</span>
            {user.email && <span className={styles.email}>{user.email}</span>}
          </span>
        )}
        {!compact && (
          <svg className={styles.caret} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>
    </Menu>
  );
}
