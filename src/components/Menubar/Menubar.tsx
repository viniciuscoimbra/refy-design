"use client";
import { useRef, useState } from 'react';
import { Button } from '../Button';
import { Menu } from '../Menu';
import type { MenuEntry } from '../Menu';
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface MenubarItem {
  id: string;
  label: string;
  entries: MenuEntry[];
}
export interface MenubarProps {
  items: MenubarItem[];
  label?: string;
  onSelect?: (id: string) => void;
}
export function Menubar({
  items,
  label: labelProp,
  onSelect,
}: MenubarProps) {
  const m = useComponentMessages("menubar", enMessages.menubar);
  const label = labelProp ?? m.label;
  const [open, setOpen] = useState(''),
    ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      role="menubar"
      aria-label={label}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}
      onKeyDown={(event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key))
          return;
        const buttons = Array.from(
          ref.current!.querySelectorAll<HTMLButtonElement>(
            '[role=menuitem][aria-haspopup=menu]',
          ),
        );
        if (!buttons.length) return;
        const focused = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          ),
          current =
            focused >= 0
              ? focused
              : items.findIndex((item) => item.id === open);
        const index =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (current +
                  (event.key === 'ArrowLeft' ? -1 : 1) +
                  buttons.length) %
                buttons.length;
        event.preventDefault();
        buttons[index]?.focus();
        if (open) setOpen(items[index].id);
      }}
    >
      {items.map((item) => (
        <Menu
          key={item.id}
          open={open === item.id}
          onOpenChange={(next) => setOpen(next ? item.id : '')}
          entries={item.entries}
          onSelect={onSelect}
          ariaLabel={item.label}
        >
          <Button
            role="menuitem"
            variant="ghost"
            onClick={() => setOpen(open === item.id ? '' : item.id)}
          >
            {item.label}
          </Button>
        </Menu>
      ))}
    </div>
  );
}
