import type { SettingRowCoreProps, SettingRowGroupCoreProps } from "../../contracts/setting-row";
import { Children, forwardRef, useId } from "react";
import type { HTMLAttributes, MouseEventHandler, ReactNode, Ref } from "react";
import { Switch } from "../Switch";
import type { SwitchProps } from "../Switch";
import { cn } from "../../lib/cn";
import styles from "./SettingRow.module.css";

/** Props for the SettingRow list/settings line. */
export interface SettingRowProps
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "onClick">, SettingRowCoreProps {
  /** Row title. `Badge`/`Chip` fit inline (e.g. status "Connected"). */
  title: ReactNode;
  /** Running-text description under the title. */
  description?: ReactNode;
  /** Mono meta under the description (email, IP, date, masked key…). */
  meta?: ReactNode;
  /** Leading slot: icon or `Avatar`. */
  leading?: ReactNode;
  /** 36px frame around `leading` (`.oauth-icon` pattern: provider/brand logos). */
  leadingFrame?: boolean;
  /** Actions on the right (`Button`/`IconButton`/`Badge`/mono text). In a clickable row use only NON-interactive content. */
  actions?: ReactNode;
  /** With `href` the whole row becomes `<a>` (like `NavCard`). */
  href?: string;
  /** Link `target` (only with `href`). */
  target?: string;
  /** Link `rel` (only with `href`). */
  rel?: string;
  /** Without `href`, makes the whole row a `<button>`. */
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /** Disables the clickable row (no click, no Tab focus on the link). */
  disabled?: boolean;
  /** ">" chevron on the right of clickable rows. Default `true`. */
  showChevron?: boolean;
  /**
   * `Switch` attached on the right (`.pref-row` pattern). The component links
`aria-labelledby`/`aria-describedby` to the title/description automatically.
   */
  switchProps?: SwitchProps;
}

const chevron = (
  <svg
    className={styles.chevron}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/**
 * SettingRow — linha de lista/configuração (padrão `.shell-card-row`,
 * `.oauth-row`, `.session-row`, `.pref-row`, `.key-row`, `.activity-row`…
 * das telas de referência). Slot `leading` (ícone/`Avatar`) + título +
 * descrição + meta mono + ações à direita.
 *
 * Variantes: estática (padrão, `<div>`); clicável — com `href` vira `<a>`,
 * com `onClick` vira `<button>` (linha inteira é o alvo, como o `NavCard`);
 * com `Switch` acoplado via `switchProps` (rótulo ligado por aria).
 * Agrupe linhas com `SettingRowGroup` (lista semântica + divisores).
 *
 *   <SettingRow leading={<GoogleIcon />} leadingFrame
 *     title={<>Google <Badge tone="success" dot>Conectado</Badge></>}
 *     meta="joao@example.com · conectado em 12 jan. 2026"
 *     actions={<Button size="sm" variant="ghost">Desconectar</Button>} />
 */
export const SettingRow = forwardRef<HTMLElement, SettingRowProps>(
  function SettingRow(
    {
      title,
      description,
      meta,
      leading,
      leadingFrame = false,
      actions,
      href,
      target,
      rel,
      onClick,
      disabled = false,
      showChevron = true,
      switchProps,
      className,
      ...rest
    },
    ref
  ) {
    const titleId = useId();
    const descId = useId();
    const clickable = !switchProps && (href != null || onClick != null);

    const cls = cn(
      styles.row,
      clickable && styles.clickable,
      disabled && styles.disabled,
      className
    );

    const body = (
      <>
        {leading != null && (
          <span className={cn(styles.leading, leadingFrame && styles.leadingFrame)}>
            {leading}
          </span>
        )}
        <span className={styles.body}>
          <span id={titleId} className={styles.title}>
            {title}
          </span>
          {description != null && (
            <span id={descId} className={styles.description}>
              {description}
            </span>
          )}
          {meta != null && <span className={styles.meta}>{meta}</span>}
        </span>
        {actions != null && <span className={styles.actions}>{actions}</span>}
        {switchProps != null && (
          <span className={styles.actions}>
            <Switch
              aria-labelledby={titleId}
              aria-describedby={description != null ? descId : undefined}
              disabled={disabled || switchProps.disabled}
              {...switchProps}
            />
          </span>
        )}
        {clickable && showChevron && chevron}
      </>
    );

    if (clickable && href != null) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={cls}
          href={disabled ? undefined : href}
          target={target}
          rel={rel}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            onClick?.(e);
          }}
          {...(rest as HTMLAttributes<HTMLAnchorElement>)}
        >
          {body}
        </a>
      );
    }

    if (clickable) {
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={cls}
          disabled={disabled}
          onClick={onClick}
          {...(rest as HTMLAttributes<HTMLButtonElement>)}
        >
          {body}
        </button>
      );
    }

    return (
      <div ref={ref as Ref<HTMLDivElement>} className={cls} {...rest}>
        {body}
      </div>
    );
  }
);

/** Props for the SettingRowGroup list wrapper. */
export interface SettingRowGroupProps extends HTMLAttributes<HTMLDivElement>, SettingRowGroupCoreProps {
  /** `SettingRow`s (or any row): each child becomes a `listitem` with a divider. */
  children: ReactNode;
  /** Accessible label of the list (e.g. "Active sessions"). */
  "aria-label"?: string;
}

/**
 * SettingRowGroup — agrupa `SettingRow`s numa lista semântica
 * (`role="list"`/`role="listitem"`) com divisores por token entre as linhas.
 * É o miolo típico de um `Card` de configurações.
 *
 *   <SettingRowGroup aria-label="Preferências">
 *     <SettingRow title="Análise concluída" switchProps={{ defaultChecked: true }} />
 *     <SettingRow title="Resumo semanal" switchProps={{}} />
 *   </SettingRowGroup>
 */
export const SettingRowGroup = forwardRef<HTMLDivElement, SettingRowGroupProps>(
  function SettingRowGroup({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} role="list" className={cn(styles.group, className)} {...rest}>
        {Children.map(children, (child) =>
          child == null ? child : (
            <div role="listitem" className={styles.item}>
              {child}
            </div>
          )
        )}
      </div>
    );
  }
);
