"use client";
import type { SegmentedCoreProps } from "../../contracts/segmented";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Tooltip } from "../Tooltip";
import styles from "./Segmented.module.css";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Props for the single-select segmented control. */
export interface SegmentedProps extends SegmentedCoreProps {
  options: SegmentedOption[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial selection (uncontrolled). Default: first option. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible group label. */
  label?: string;
  disabled?: boolean;
  sliding?: boolean;
  /** Icons only; text labels become accessible names and tooltips. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Segmented — seleção única em pílula (switch de visões).
 *
 * Trilho com fundo rebaixado; o segmento ativo ganha superfície elevada.
 * Semântica de `radiogroup`: ←/→ movem a seleção, cada segmento é um
 * `role="radio"`. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <Segmented options={[{ value: "lista", label: "Lista" }, { value: "kanban", label: "Kanban" }]} />
 */
export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  label,
  disabled,
  className,
  sliding = false,
  iconOnly = false,
}: SegmentedProps) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const current = value !== undefined ? value : internal;

  const rootRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!sliding || !root) return;
    const measure = () => {
      const active = root.querySelector<HTMLElement>('[aria-checked="true"]');
      if (active)
        setIndicator((previous) => {
          const next = {
            x:
              active.getBoundingClientRect().left -
              root.getBoundingClientRect().left -
              root.clientLeft +
              root.scrollLeft,
            width: active.offsetWidth,
          };
          return previous.x === next.x && previous.width === next.width
            ? previous
            : next;
        });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    root
      .querySelectorAll("button")
      .forEach((button) => observer.observe(button));
    return () => observer.disconnect();
  }, [sliding, current, options]);

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    const at = enabled.findIndex((o) => o.value === current);
    const next =
      enabled[
        (at + (e.key === "ArrowRight" ? 1 : enabled.length - 1)) %
          enabled.length
      ];
    if (next) {
      select(next.value);
      (
        e.currentTarget.querySelector(
          `[data-value="${next.value}"]`,
        ) as HTMLElement
      )?.focus();
    }
  }

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label={label}
      className={cn(
        styles.segmented,
        sliding && styles.sliding,
        disabled && styles.disabled,
        iconOnly && styles.iconOnly,
        className,
      )}
      onKeyDown={onKeyDown}
    >
      {sliding && (
        <span
          className={styles.indicator}
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.x}px)`,
          }}
          aria-hidden="true"
        />
      )}
      {options.map((option) => {
        const isActive = option.value === current;
        const compact =
          iconOnly && Boolean(option.icon) && typeof option.label === "string";
        const button = (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-value={option.value}
            data-icon-only={compact || undefined}
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled || option.disabled}
            className={cn(styles.segment, isActive && styles.active)}
            onClick={() => select(option.value)}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            {compact ? (
              <span className={styles.srOnly}>{option.label}</span>
            ) : (
              option.label
            )}
          </button>
        );
        return compact ? (
          <Tooltip
            key={option.value}
            label={
              typeof option.label === "string" ? option.label : option.value
            }
            portalled
          >
            {button}
          </Tooltip>
        ) : (
          button
        );
      })}
    </div>
  );
}
