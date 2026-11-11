"use client";
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Menu } from '../Menu';
import type { MenuEntry } from '../Menu';
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface ContextMenuProps {
  children: ReactNode;
  entries: MenuEntry[];
  label?: string;
  onSelect?: (id: string) => void;
}
export function ContextMenu({
  children,
  entries,
  label: labelProp,
  onSelect,
}: ContextMenuProps) {
  const m = useComponentMessages("contextMenu", enMessages.contextMenu);
  const label = labelProp ?? m.label;
  const [open, setOpen] = useState(false),
    [point, setPoint] = useState({ x: 0, y: 0 }),
    ref = useRef<HTMLDivElement>(null);
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      entries={entries}
      onSelect={onSelect}
      ariaLabel={label}
      anchorPoint={point}
    >
      <div
        ref={ref}
        tabIndex={0}
        role="region"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onContextMenu={(event) => {
          event.preventDefault();
          setPoint({ x: event.clientX, y: event.clientY });
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (
            event.key === 'ContextMenu' ||
            (event.shiftKey && event.key === 'F10')
          ) {
            event.preventDefault();
            const box = ref.current!.getBoundingClientRect();
            setPoint({ x: box.left + 12, y: box.top + 12 });
            setOpen(true);
          }
        }}
        style={{
          padding: 'var(--space-5)',
          border: '1px dashed var(--outline)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {children}
      </div>
    </Menu>
  );
}
