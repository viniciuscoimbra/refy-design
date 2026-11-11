"use client";
import { useState } from 'react';
import { Button } from '../Button';
import { Menu } from '../Menu';
import type { MenuEntry } from '../Menu';
import styles from './NavigationMenu.module.css';
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface NavigationMenuItem {
  id: string;
  label: string;
  href?: string;
  entries?: MenuEntry[];
}
export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  label?: string;
}
export function NavigationMenu({
  items,
  activeId,
  onNavigate,
  label: labelProp,
}: NavigationMenuProps) {
  const m = useComponentMessages("navigationMenu", enMessages.navigationMenu);
  const label = labelProp ?? m.label;
  const [open, setOpen] = useState('');
  return (
    <nav
      aria-label={label}
      className={styles.menu}
    >
      {items.map((item) =>
        item.entries ? (
          <Menu
            key={item.id}
            open={open === item.id}
            onOpenChange={(next) => setOpen(next ? item.id : '')}
            entries={item.entries}
            onSelect={onNavigate}
            ariaLabel={item.label}
          >
            <Button
              variant="ghost"
              className={styles.item}
              onClick={() => setOpen(open === item.id ? '' : item.id)}
            >
              {item.label} ▾
            </Button>
          </Menu>
        ) : item.href ? (
          <a
            key={item.id}
            href={item.href}
            aria-current={activeId === item.id ? 'page' : undefined}
            className={styles.link}
            onClick={(event) => {
              if (onNavigate) {
                event.preventDefault();
                onNavigate(item.id);
              }
            }}
          >
            {item.label}
          </a>
        ) : (
          <Button
            key={item.id}
            variant="ghost"
            className={styles.item}
            aria-current={activeId === item.id ? 'page' : undefined}
            onClick={() => onNavigate?.(item.id)}
          >
            {item.label}
          </Button>
        ),
      )}
    </nav>
  );
}
