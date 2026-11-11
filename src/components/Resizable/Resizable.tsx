"use client";
import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './Resizable.module.css';
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface ResizableProps {
  first: ReactNode;
  second: ReactNode;
  label?: string;
  defaultSize?: number;
  size?: number;
  onSizeChange?: (size: number) => void;
  min?: number;
  max?: number;
}
export function Resizable({
  first,
  second,
  label: labelProp,
  defaultSize = 50,
  size,
  onSizeChange,
  min = 20,
  max = 80,
}: ResizableProps) {
  const m = useComponentMessages("resizable", enMessages.resizable);
  const label = labelProp ?? m.label;
  const [internal, setInternal] = useState(defaultSize),
    ref = useRef<HTMLDivElement>(null),
    id = useId();
  const lower = Math.max(0, Math.min(min, max, 100)),
    upper = Math.max(lower, Math.min(100, Math.max(min, max))),
    current = Math.max(
      lower,
      Math.min(
        upper,
        Number.isFinite(size ?? internal) ? (size ?? internal) : 50,
      ),
    );
  const update = (value: number) => {
    const next = Math.max(lower, Math.min(upper, value));
    if (size === undefined) setInternal(next);
    onSizeChange?.(next);
  };
  return (
    <div className={styles.root} ref={ref}>
      <div
        id={id}
        className={styles.panel}
        style={{ flexBasis: `${current}%` }}
      >
        {first}
      </div>
      <div
        className={styles.handle}
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={lower}
        aria-valuemax={upper}
        aria-valuenow={Math.round(current)}
        aria-controls={id}
        onKeyDown={(event) => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            update(
              event.key === 'Home'
                ? lower
                : event.key === 'End'
                  ? upper
                  : current + (event.key === 'ArrowLeft' ? -2 : 2),
            );
          }
        }}
        onPointerDown={(event) => {
          if (event.button === 0)
            event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            const box = ref.current!.getBoundingClientRect();
            if (box.width)
              update(((event.clientX - box.left) / box.width) * 100);
          }
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <span aria-hidden="true">⋮</span>
      </div>
      <div className={styles.panel} style={{ flexBasis: `${100 - current}%` }}>
        {second}
      </div>
    </div>
  );
}
