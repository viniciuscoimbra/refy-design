"use client";
import { inertAttribute } from "../../lib/inertAttribute";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { IconButton } from "../IconButton";
import styles from "./Carousel.module.css";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface CarouselItem {
  id: string;
  label: string;
  content: ReactNode;
}
export interface CarouselProps {
  items: CarouselItem[];
  label?: string;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}
export function Carousel({
  items,
  label: labelProp,
  index,
  defaultIndex = 0,
  onIndexChange,
}: CarouselProps) {
  const m = useComponentMessages("carousel", enMessages.carousel);
  const label = labelProp ?? m.label;
  const [internal, setInternal] = useState(defaultIndex),
    id = useId(),
    current = Math.max(0, Math.min(index ?? internal, items.length - 1));
  const move = (next: number) => {
    const value = Math.max(0, Math.min(next, items.length - 1));
    if (index === undefined) setInternal(value);
    if (value !== current) onIndexChange?.(value);
  };
  const arrow = (left: boolean) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={left ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
  return (
    <section
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      className={styles.root}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,textarea,select,a"))
          return;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          move(current + (e.key === "ArrowLeft" ? -1 : 1));
        }
      }}
    >
      {items.length ? (
        <div className={styles.viewport}>
          <div
            id={id}
            className={styles.track}
            style={{ transform: `translateX(${-current * 100}%)` }}
          >
            {items.map((item, itemIndex) => (
              <div
                key={item.id}
                className={styles.slide}
                role="group"
                aria-roledescription="slide"
                aria-label={m.slide(itemIndex + 1, items.length, String(item.label))}
                aria-hidden={itemIndex !== current || undefined}
                inert={inertAttribute(itemIndex !== current)}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>{m.empty}</p>
      )}
      {items.length > 1 && (
        <div className={styles.controls}>
          <IconButton
            aria-controls={id}
            aria-label={m.previous}
            disabled={current === 0}
            icon={arrow(true)}
            onClick={() => move(current - 1)}
          />
          <span role="status">
            {m.position(current + 1, items.length)}
          </span>
          <IconButton
            aria-controls={id}
            aria-label={m.next}
            disabled={current === items.length - 1}
            icon={arrow(false)}
            onClick={() => move(current + 1)}
          />
        </div>
      )}
    </section>
  );
}
