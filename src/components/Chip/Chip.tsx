import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";
import field from "../Input/Field.module.css";
import styles from "./Chip.module.css";

declare const process: { env: { NODE_ENV?: string } };

export type ChipTone = "neutral" | "critical" | "warning" | "success" | "info";
export type ChipSelectionMode = "toggle" | "radio";

/** Props for the selectable Chip control. */
export interface ChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onSelect"
> {
  /** Compact selection embedded in fields; filter keeps the default. */
  variant?: "filter" | "selection";
  /** Selected state (active filter). */
  selected?: boolean;
  /** Counter on the right (e.g. number of items in the filter). */
  count?: number;
  /** Optional semantic dot for severity/status filters. */
  tone?: ChipTone;
  /**
   * Toggle uses `aria-pressed`; radio uses `role=radio` + `aria-checked`.
   * Radio needs ChipGroup with `mode="single"` for arrow keys; inside a ChipGroup the group decides.
   */
  selectionMode?: ChipSelectionMode;
  /** Value of the chip inside a ChipGroup. Defaults to the text of `children`. */
  value?: string;
  /** Shows the animated check when selected. */
  showCheck?: boolean;
  /** Close icon: fires onRemove. */
  removable?: boolean;
  onRemove?: () => void;
  leadingIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Chip / filter-chip. Clicável para alternar seleção; opcionalmente removível.
 * A seleção inverte o par semântico, preservando contraste também em hover.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    variant = "filter",
    selected: selectedProp = false,
    count,
    tone = "neutral",
    selectionMode: selectionModeProp = "toggle",
    showCheck = false,
    removable = false,
    onRemove,
    onClick,
    leadingIcon,
    className,
    children,
    value: valueProp,
    ...rest
  },
  ref,
) {
  const group = useContext(ChipGroupContext);
  const value = valueProp ?? (typeof children === "string" ? children : undefined);
  const inGroup = group !== null && value !== undefined;
  const selected = inGroup ? group.isSelected(value) : selectedProp;
  const selectionMode = inGroup
    ? group.mode === "single"
      ? "radio"
      : "toggle"
    : selectionModeProp;
  useEffect(() => {
    if (group || selectionModeProp !== "radio" || !isDevelopment()) return;
    console.warn(
      'Refy Chip: selectionMode="radio" outside ChipGroup has no arrow-key navigation. Wrap the chips in <ChipGroup mode="single" label="…">.',
    );
  }, [group, selectionModeProp]);
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        styles.chip,
        styles[`tone-${tone}`],
        selected && styles.selected,
        variant === "selection" && styles.selection,
        className,
      )}
      role={selectionMode === "radio" ? "radio" : undefined}
      aria-checked={selectionMode === "radio" ? selected : undefined}
      aria-pressed={selectionMode === "toggle" ? selected : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (inGroup && !event.defaultPrevented) group.select(value);
        if (removable) onRemove?.();
      }}
      {...rest}
      {...(inGroup
        ? {
            "data-chip-value": value,
            tabIndex:
              group.mode === "single" && group.focusValue !== value ? -1 : 0,
          }
        : {})}
    >
      {showCheck && (
        <span className={styles.check} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
      {tone !== "neutral" && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
      {typeof count === "number" && (
        <span className={styles.count}>{count}</span>
      )}
      {removable && (
        <span className={styles.remove} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      )}
    </button>
  );
});

function isDevelopment() {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

interface ChipGroupContextValue {
  mode: ChipGroupMode;
  isSelected: (value: string) => boolean;
  select: (value: string) => void;
  /** Chip that receives Tab in single mode. */
  focusValue?: string;
}
const ChipGroupContext = createContext<ChipGroupContextValue | null>(null);

export type ChipGroupMode = "single" | "multiple";

/** Props for the group that gives Chips radio or toggle keyboard semantics. */
export interface ChipGroupProps {
  /** Visible label of the group, with the field label tokens. */
  label: ReactNode;
  /** `single`: one chip at a time, arrow keys move focus and selection. `multiple`: each chip toggles. */
  mode?: ChipGroupMode;
  /** Selected value (`single`) or values (`multiple`), controlled. */
  value?: string | string[];
  /** Initial selection in uncontrolled state. */
  defaultValue?: string | string[];
  /** Receives the value (`single`) or the list of values (`multiple`). */
  onChange?: (value: string | string[]) => void;
  /** Hides the label visually; it keeps naming the group. */
  hideLabel?: boolean;
  className?: string;
  /** Chips with `value` (or plain text children). */
  children: ReactNode;
}

const asList = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * ChipGroup — row of Chips with one label and real keyboard semantics.
 * `single` is a radio group: one Tab stop, ←/→/↑/↓ move focus and selection, Home and End jump.
 * `multiple` is a group of toggles: Tab visits each chip, Space or Enter turns it on or off.
 *
 *   <ChipGroup label="Quartos" mode="single" defaultValue="any">
 *     <Chip value="any">Qualquer</Chip>
 *     <Chip value="1">1+</Chip>
 *   </ChipGroup>
 */
export function ChipGroup({
  label,
  mode = "single",
  value,
  defaultValue,
  onChange,
  hideLabel = false,
  className,
  children,
}: ChipGroupProps) {
  const labelId = useId();
  const [internal, setInternal] = useState(() => asList(defaultValue));
  const selected = value !== undefined ? asList(value) : internal;
  const [enabled, setEnabled] = useState<string[]>([]);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  // Tab stop: the selected chip, or the first enabled one. Read from the DOM so the order and
  // the disabled state are the ones the person sees.
  useEffect(() => {
    if (!root) return;
    const read = () =>
      setEnabled((previous) => {
        const next = Array.from(
          root.querySelectorAll<HTMLButtonElement>("[data-chip-value]"),
        )
          .filter((chip) => !chip.disabled)
          .map((chip) => chip.dataset.chipValue ?? "");
        return next.join("\u0000") === previous.join("\u0000") ? previous : next;
      });
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["disabled", "data-chip-value"],
    });
    return () => observer.disconnect();
  }, [root]);

  const commit = (next: string[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(mode === "single" ? (next[0] ?? "") : next);
  };
  const select = (chip: string) => {
    if (mode === "single") {
      if (selected[0] !== chip) commit([chip]);
    } else
      commit(
        selected.includes(chip)
          ? selected.filter((item) => item !== chip)
          : [...selected, chip],
      );
  };
  const focusValue =
    selected.find((item) => enabled.includes(item)) ?? enabled[0];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (mode !== "single" || !root) return;
    const chips = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-chip-value]"),
    ).filter((chip) => !chip.disabled);
    const at = chips.indexOf(event.target as HTMLButtonElement);
    if (at < 0 || !chips.length) return;
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next: number;
    if (event.key in step)
      next = (at + step[event.key] + chips.length) % chips.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = chips.length - 1;
    else return;
    event.preventDefault();
    const target = chips[next];
    target.focus();
    select(target.dataset.chipValue ?? "");
  }

  return (
    <div className={cn(styles.group, className)}>
      <span
        id={labelId}
        className={cn(field.label, hideLabel && styles.hiddenLabel)}
      >
        {label}
      </span>
      <div
        ref={setRoot}
        role={mode === "single" ? "radiogroup" : "group"}
        aria-labelledby={labelId}
        className={styles.options}
        onKeyDown={onKeyDown}
      >
        <ChipGroupContext.Provider
          value={{
            mode,
            isSelected: (chip) => selected.includes(chip),
            select,
            focusValue,
          }}
        >
          {children}
        </ChipGroupContext.Provider>
      </div>
    </div>
  );
}
