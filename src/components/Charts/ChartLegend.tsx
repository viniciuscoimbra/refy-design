import type { CSSProperties, ReactNode } from "react";
import { Button } from "../Button";
import type { ChartLegendItem } from "./d3/types";
import styles from "./ChartLegend.module.css";
export function ChartLegend({
  label,
  items,
  hidden = [],
  onToggle,
  marker = "square",
  render,
  className,
}: {
  label: string;
  items: ChartLegendItem[];
  hidden?: string[];
  onToggle?: (id: string) => void;
  marker?: "square" | "circle" | "line";
  render?: (item: ChartLegendItem) => ReactNode;
  className?: string;
}) {
  return (
    <figcaption
      className={[styles.legend, className].filter(Boolean).join(" ")}
      aria-label={label}
    >
      {items.map((item) => {
        const swatch = (
          <span
            className={styles.swatch}
            data-marker={marker}
            style={{ "--series-color": item.color } as CSSProperties}
            aria-hidden="true"
          />
        );
        const text = (
          <span className={styles.label} data-legend-label="">
            {render?.(item) ?? item.label}
          </span>
        );
        return onToggle ? (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={styles.item}
            aria-pressed={!hidden.includes(item.id)}
            leadingIcon={swatch}
            onClick={() => onToggle(item.id)}
          >
            {text}
          </Button>
        ) : (
          <span key={item.id} className={styles.item}>
            {swatch}
            {text}
          </span>
        );
      })}
    </figcaption>
  );
}
