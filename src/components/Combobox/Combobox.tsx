"use client";
import field from "../Input/Field.module.css";
import { InputControl } from "../Input/InputControl";
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Avatar } from "../Avatar";
import { cn } from "../../lib/cn";
import styles from "./Combobox.module.css";

import { useMessages } from "../../lib/locale";
/** Avatar de uma opção "pessoa ou equipe". */
export interface ComboboxOptionAvatar {
  /** Nome — origem das iniciais quando não há foto. */
  name: string;
  /** URL da foto. */
  src?: string;
  /** Cor de fundo das iniciais (repassada ao Avatar). */
  color?: string;
}

/** Uma opção sugerida pelo Combobox. */
export interface ComboboxOption {
  /** Identificador estável da opção. */
  value: string;
  /** Texto exibido (recebe destaque do trecho digitado). */
  label: string;
  /** Badge curto à esquerda (iniciais, "/", etc.). */
  lead?: string;
  /** Texto mono à direita (ex.: "DA 78", "2.3k/mês"). */
  meta?: string;
  /** Avatar (foto/iniciais) à esquerda — variante "pessoas". Tem precedência sobre `lead`. */
  avatar?: ComboboxOptionAvatar;
  /** Linha secundária sob o label (ex.: "CRECI 34.512"). */
  description?: string;
  /** Rótulo de seção — opções com o mesmo `group` ficam juntas. */
  group?: string;
  disabled?: boolean;
}

/** Props for the Combobox field. */
export interface ComboboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "onSelect" | "size"
> {
  /** Suggested options. With `filter` (default) they are filtered by the typed text. */
  options: ComboboxOption[];
  /** `value` of the selected option (controlled). `null` = nothing selected. */
  value?: string | null;
  /** Initial selection (uncontrolled). */
  defaultValue?: string | null;
  /** Fired when an option is selected (or `null` when cleared). */
  onChange?: (option: ComboboxOption | null) => void;
  /** Controlled input text (for async suggest, filter outside and pass `filter={false}`). */
  inputValue?: string;
  onInputValueChange?: (text: string) => void;
  /** Field label (mono eyebrow above the input). */
  label?: string;
  /** Filters options by the typed text. `false` = the list comes already filtered. */
  filter?: boolean | ((option: ComboboxOption, query: string) => boolean);
  /** Icon on the left of the input (default: magnifier). */
  icon?: ReactNode;
  /** Message when no option matches the search. */
  emptyMessage?: string;
  /** Starts with the list open (uncontrolled), as in previews and catalogs. Default `false`. */
  defaultOpen?: boolean;
  /** Shows the clear button when there is text. Default `true`. */
  clearable?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

const defaultFilter = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.toLowerCase());

/** Deriva iniciais (1ª letra do primeiro e do último nome). */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Avatar 24px de opção/seleção (decorativo — o nome já está no texto). */
function OptionAvatar({ avatar }: { avatar: ComboboxOptionAvatar }) {
  return (
    <span className={styles.avatarWrap} aria-hidden="true">
      <Avatar
        size="sm"
        src={avatar.src}
        alt=""
        initials={initialsOf(avatar.name)}
        color={avatar.color}
      />
    </span>
  );
}

/** Destaca o trecho digitado dentro do label (primeira ocorrência). */
function highlight(label: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return label;
  const at = label.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return label;
  return (
    <>
      {label.slice(0, at)}
      <mark className={styles.mark}>{label.slice(at, at + q.length)}</mark>
      {label.slice(at + q.length)}
    </>
  );
}

const SearchIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/**
 * Combobox — input com sugestões ancoradas (padrão ARIA 1.2 combobox).
 *
 * Campo e lista compartilham uma única borda, fundo e foco. A lista
 * expande no fluxo do layout, deslocando o conteúdo abaixo. Filtro com destaque do trecho digitado, seções por
 * `group`, teclado completo (setas, Enter, Escape, Home/End) e
 * `aria-activedescendant`. Controlado (`value`/`onChange`) ou não-controlado
 * (`defaultValue`); texto também pode ser controlado via `inputValue`.
 *
 *   <Combobox label="Projeto" options={projects} onChange={setProject} />
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(
    {
      options,
      value,
      defaultValue = null,
      onChange,
      inputValue,
      onInputValueChange,
      label,
      filter = true,
      icon = SearchIcon,
      emptyMessage: emptyMessageProp,
      defaultOpen = false,
      clearable = true,
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
    const m = useMessages("combobox");
    const emptyMessage = emptyMessageProp ?? m.empty;
    const placeholder = placeholderProp ?? m.placeholder;
    const uid = useId();
    const inputId = id || `${uid}-input`;
    const listboxId = `${uid}-listbox`;

    // ----- seleção (controlada ou não) -----
    const [selectedInternal, setSelectedInternal] = useState<string | null>(
      defaultValue,
    );
    const selected = value !== undefined ? value : selectedInternal;
    const selectedOption = useMemo(
      () => options.find((o) => o.value === selected) ?? null,
      [options, selected],
    );

    // ----- texto do input (controlado ou não) -----
    const [textInternal, setTextInternal] = useState(
      selectedOption?.label ?? "",
    );
    const text = inputValue !== undefined ? inputValue : textInternal;
    function setText(next: string) {
      if (inputValue === undefined) setTextInternal(next);
      onInputValueChange?.(next);
    }

    const [open, setOpen] = useState(defaultOpen);
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapRef = useRef<HTMLDivElement>(null);

    // ----- filtro (se o texto é o label selecionado, mostra tudo ao reabrir) -----
    const query = selectedOption && text === selectedOption.label ? "" : text;
    const filtered = useMemo(() => {
      if (filter === false) return options;
      const fn = filter === true ? defaultFilter : filter;
      return query.trim() ? options.filter((o) => fn(o, query)) : options;
    }, [options, filter, query]);

    // seções na ordem de aparição; opções sem `group` ficam numa seção sem rótulo
    const sections = useMemo(() => {
      const map = new Map<string, ComboboxOption[]>();
      for (const option of filtered) {
        const key = option.group ?? "";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(option);
      }
      return Array.from(map, ([group, items]) => ({ group, items }));
    }, [filtered]);

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

    function commit(option: ComboboxOption) {
      if (option.disabled) return;
      if (value === undefined) setSelectedInternal(option.value);
      setText(option.label);
      onChange?.(option);
      setOpen(false);
    }

    function clear() {
      if (value === undefined) setSelectedInternal(null);
      setText("");
      onChange?.(null);
      setActiveIndex(0);
      document.getElementById(inputId)?.focus();
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
            commit(active);
          }
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    }

    // índice corrido por seção para ids/aria-activedescendant
    let flatIndex = -1;

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
            // Focus ring comes from :focus-within; an open list without focus (defaultOpen) shows no ring.
            error && field.error,
            disabled && field.disabled,
          )}
        >
          <div className={styles.inputWrap}>
            {selectedOption?.avatar && text === selectedOption.label ? (
              <OptionAvatar avatar={selectedOption.avatar} />
            ) : (
              <span className={styles.icon}>{icon}</span>
            )}
            <InputControl
              {...rest}
              ref={ref}
              id={inputId}
              className={styles.input}
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={open ? activeId : undefined}
              aria-invalid={error ? true : undefined}
              autoComplete="off"
              spellCheck={false}
              placeholder={placeholder}
              disabled={disabled}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setOpen(true);
                setActiveIndex(0);
              }}
              onClick={(event) => {
                rest.onClick?.(event);
                if (!event.defaultPrevented) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
            />
            {clearable && text && !disabled && (
              <button
                type="button"
                className={styles.clear}
                aria-label={m.clear}
                onClick={clear}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {open && (
            <div
              id={listboxId}
              role="listbox"
              className={field.options}
              aria-label={label || placeholder}
            >
              {filtered.length === 0 ? (
                <div className={styles.empty}>{emptyMessage}</div>
              ) : (
                sections.map(({ group, items }) => (
                  <div className={styles.section} key={group || "__default"}>
                    {group && (
                      <div className={styles.sectionLabel}>{group}</div>
                    )}
                    {items.map((option) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const isActive = index === activeIndex;
                      return (
                        <div
                          key={option.value}
                          id={`${uid}-opt-${index}`}
                          role="option"
                          aria-selected={option.value === selected}
                          aria-disabled={option.disabled || undefined}
                          className={cn(
                            styles.row,
                            isActive && styles.active,
                            option.disabled && styles.rowDisabled,
                          )}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={
                            (e) =>
                              e.preventDefault() /* não rouba o foco do input */
                          }
                          onClick={() => commit(option)}
                        >
                          {option.avatar ? (
                            <OptionAvatar avatar={option.avatar} />
                          ) : (
                            option.lead && (
                              <span className={styles.lead}>{option.lead}</span>
                            )
                          )}
                          <span className={styles.rowText}>
                            <span className={styles.rowLabel}>
                              {highlight(option.label, query)}
                            </span>
                            {option.description && (
                              <span className={styles.description}>
                                {option.description}
                              </span>
                            )}
                          </span>
                          {option.meta && (
                            <span className={styles.meta}>{option.meta}</span>
                          )}
                          {isActive && <kbd className={styles.kbd}>↵</kbd>}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
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
