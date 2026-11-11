"use client";
import { inertAttribute } from "../../lib/inertAttribute";
import { AnchoredSurface } from "../../lib/AnchoredSurface";
import { Chip } from "../Chip/Chip";
import field from "../Input/Field.module.css";
import { InputControl } from "../Input/InputControl";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Multiselect.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
/** Uma opção selecionável do Multiselect. */
export interface MultiselectOption {
  /** Identificador estável da opção. */
  value: string;
  /** Texto do chip e da lista. */
  label: string;
  disabled?: boolean;
}

export interface MultiselectProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size"
> {
  /** Available options. The typed text filters the list. */
  options: MultiselectOption[];
  /** Selected values (controlled). */
  value?: string[];
  /** Initial selection (uncontrolled). */
  defaultValue?: string[];
  /** Fired on each change with the full list of values. */
  onChange?: (values: string[]) => void;
  /** Field label (mono eyebrow above the input). */
  label?: string;
  /** Optional chip cap; the available space may reduce this number. */
  maxVisibleChips?: number;
  /** Inline expands the field; overlay sits over the content without shifting the layout. */
  listPlacement?: "inline" | "overlay";
  /** Message when no option matches the search. */
  emptyMessage?: string;
  error?: string;
  hint?: string;
  className?: string;
}

/**
 * Multiselect — seleção múltipla com chips removíveis dentro do campo.
 *
 * O controle mostra chips inteiros que cabem e colapsa o restante num contador `+N`
 * (teto opcional por `maxVisibleChips`). Digite para filtrar, Enter/clique alterna a opção,
 * Backspace com o input vazio remove o último chip. A variante inline expande a
 * superfície; listPlacement="overlay" sobrepõe sem deslocar o layout. Padrão ARIA combobox +
 * listbox `aria-multiselectable`. Controlado (`value`/`onChange`) ou
 * não-controlado (`defaultValue`).
 *
 *   <Multiselect label="Áreas de análise" options={areas} onChange={setAreas} />
 */
export const Multiselect = forwardRef<HTMLInputElement, MultiselectProps>(
  function Multiselect(
    {
      options,
      value,
      defaultValue = [],
      onChange,
      label,
      maxVisibleChips,
      listPlacement = "inline",
      emptyMessage: emptyMessageProp,
      error,
      hint,
      disabled,
      placeholder: placeholderProp,
      className,
      id,
      ...rest
    },
    ref,
  ) {
    const m = useComponentMessages("multiselect", enMessages.multiselect);
    const emptyMessage = emptyMessageProp ?? m.empty;
    const placeholder = placeholderProp ?? m.placeholder;
    const uid = useId();
    const inputId = id || `${uid}-input`;
    const listboxId = `${uid}-listbox`;

    // ----- seleção (controlada ou não) -----
    const [selectedInternal, setSelectedInternal] =
      useState<string[]>(defaultValue);
    const selected = value !== undefined ? value : selectedInternal;
    const selectedOptions = useMemo(
      () =>
        selected
          .map((v) => options.find((o) => o.value === v))
          .filter(Boolean) as MultiselectOption[],
      [selected, options],
    );

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapRef = useRef<HTMLDivElement>(null);
    const chipsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const counterMeasureRef = useRef<HTMLButtonElement>(null);
    const [visibleCount, setVisibleCount] = useState(selectedOptions.length);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return q
        ? options.filter((o) => o.label.toLowerCase().includes(q))
        : options;
    }, [options, query]);

    const active = filtered[activeIndex] ?? null;
    const activeId = active ? `${uid}-opt-${activeIndex}` : undefined;

    useEffect(() => {
      if (activeIndex >= filtered.length) setActiveIndex(0);
    }, [filtered.length, activeIndex]);

    // mantém a opção ativa visível ao navegar pelo teclado
    useEffect(() => {
      if (open && activeId)
        document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }, [open, activeId]);

    // Fecha após o clique externo, sem deslocar seu alvo entre pointerdown e click.
    useEffect(() => {
      if (!open) return;
      function onClickOutside(event: MouseEvent) {
        if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
      }
      document.addEventListener("click", onClickOutside);
      return () => document.removeEventListener("click", onClickOutside);
    }, [open]);

    useLayoutEffect(() => {
      const chips = chipsRef.current,
        counter = counterMeasureRef.current;
      if (!chips || !counter) return;
      const measure = () => {
        const widths = Array.from(
          chips.querySelectorAll<HTMLElement>("[data-selection-chip]"),
        ).map((chip) => chip.getBoundingClientRect().width);
        const gap = parseFloat(getComputedStyle(chips).columnGap) || 0;
        const total = widths.length;
        const ceiling = Math.min(
          total,
          maxVisibleChips === undefined || !Number.isFinite(maxVisibleChips)
            ? total
            : Math.max(0, Math.floor(maxVisibleChips)),
        );
        const prefix = [0];
        widths.forEach((width) =>
          prefix.push(prefix[prefix.length - 1] + width),
        );
        let count = ceiling;
        for (; count > 0; count--) {
          const hidden = total - count;
          counter.firstElementChild!.textContent = `+${hidden}`;
          const required =
            prefix[count] +
            gap * (count - 1) +
            (hidden ? counter.getBoundingClientRect().width + gap : 0);
          if (required <= chips.clientWidth) break;
        }
        setVisibleCount(count);
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(chips);
      observer.observe(counter);
      chips
        .querySelectorAll("[data-selection-chip]")
        .forEach((chip) => observer.observe(chip));
      return () => observer.disconnect();
    }, [selectedOptions, maxVisibleChips, query]);

    function setSelected(next: string[]) {
      if (value === undefined) setSelectedInternal(next);
      onChange?.(next);
    }

    function toggle(option: MultiselectOption) {
      if (option.disabled) return;
      setSelected(
        selected.includes(option.value)
          ? selected.filter((v) => v !== option.value)
          : [...selected, option.value],
      );
    }

    function remove(optionValue: string) {
      setSelected(selected.filter((v) => v !== optionValue));
      inputRef.current?.focus();
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) setOpen(true);
          else setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!open) setOpen(true);
          else setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case "Home":
          if (open) {
            e.preventDefault();
            setActiveIndex(0);
          }
          break;
        case "End":
          if (open) {
            e.preventDefault();
            setActiveIndex(filtered.length - 1);
          }
          break;
        case "Enter":
          if (open && active) {
            e.preventDefault();
            toggle(active);
          }
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          break;
        case "Backspace":
          if (!query && selected.length) remove(selected[selected.length - 1]);
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    }

    const hiddenCount =
      selectedOptions.length - Math.min(visibleCount, selectedOptions.length);

    const optionContent =
      filtered.length === 0 ? (
        <div className={styles.empty}>{emptyMessage}</div>
      ) : (
        filtered.map((option, index) => {
          const isSelected = selected.includes(option.value);
          const isActive = index === activeIndex;
          return (
            <div
              key={option.value}
              id={`${uid}-opt-${index}`}
              role="option"
              aria-selected={isSelected}
              aria-disabled={option.disabled || undefined}
              className={cn(
                styles.option,
                isSelected && styles.optionSelected,
                isActive && styles.optionActive,
                option.disabled && styles.optionDisabled,
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={
                (e) => e.preventDefault() /* não rouba o foco do input */
              }
              onClick={() => toggle(option)}
            >
              <span className={styles.check}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {option.label}
            </div>
          );
        })
      );

    return (
      <div className={cn(styles.field, className)}>
        {label && (
          <label className={field.label} htmlFor={inputId}>
            {label}
          </label>
        )}
        <div
          ref={wrapRef}
          data-refy-field=""
          className={cn(
            styles.wrap,
            field.surface,
            open && styles.open,
            open && field.focused,
            listPlacement === "overlay" && field.connected,
            error && field.error,
            disabled && field.disabled,
          )}
        >
          <div
            className={cn(
              styles.shell,
              selectedOptions.length > 0 && styles.withSelection,
            )}
            onClick={() => {
              inputRef.current?.focus();
              setOpen(true);
            }}
          >
            <div ref={chipsRef} className={styles.chips}>
              {selectedOptions.map((option, index) => (
                <Chip
                  key={option.value}
                  variant="selection"
                  removable
                  data-selection-chip=""
                  aria-pressed={undefined}
                  aria-label={m.remove(option.label)}
                  title={option.label}
                  aria-hidden={index >= visibleCount || undefined}
                  inert={inertAttribute(index >= visibleCount)}
                  tabIndex={index >= visibleCount ? -1 : undefined}
                  className={index >= visibleCount ? styles.measure : undefined}
                  disabled={disabled}
                  onClick={(event) => event.stopPropagation()}
                  onRemove={() => remove(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
              {selectedOptions.length > 0 && (
                <Chip
                  ref={counterMeasureRef}
                  variant="selection"
                  className={styles.measure}
                  data-selection-counter-measure=""
                  aria-hidden="true"
                  inert={inertAttribute(true)}
                  tabIndex={-1}
                >
                  {null}
                </Chip>
              )}
              {hiddenCount > 0 && (
                <Chip
                  variant="selection"
                  aria-pressed={undefined}
                  aria-label={m.hidden(hiddenCount)}
                  data-selection-overflow=""
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.focus();
                    setOpen(true);
                  }}
                >
                  +{hiddenCount}
                </Chip>
              )}
            </div>
            <InputControl
              {...rest}
              ref={(node) => {
                inputRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              id={inputId}
              className={styles.input}
              style={{
                ...(selectedOptions.length && query
                  ? { width: `${query.length + 1}ch` }
                  : {}),
                ...rest.style,
              }}
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={open ? activeId : undefined}
              aria-invalid={error ? true : undefined}
              autoComplete="off"
              spellCheck={false}
              placeholder={selected.length ? "" : placeholder}
              disabled={disabled}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
            />
            <button
              type="button"
              className={styles.caret}
              aria-label={open ? m.close : m.open}
              tabIndex={-1}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
                inputRef.current?.focus();
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {listPlacement === "overlay" ? (
            <AnchoredSurface
              open={open}
              onClose={() => setOpen(false)}
              matchWidth
              gap={0}
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              aria-label={label || placeholder}
              className={field.connectedOptions}
            >
              {optionContent}
            </AnchoredSurface>
          ) : (
            open && (
              <div
                id={listboxId}
                role="listbox"
                aria-multiselectable="true"
                aria-label={label || placeholder}
                className={field.options}
              >
                {optionContent}
              </div>
            )
          )}
        </div>
        {(error || hint) && (
          <p className={cn(styles.help, error && styles.helpError)}>
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);
