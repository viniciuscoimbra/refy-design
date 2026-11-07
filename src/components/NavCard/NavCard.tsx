import { forwardRef } from "react";
import type { MouseEventHandler, ReactNode, Ref } from "react";
import { cn } from "../../lib/cn";
import styles from "./NavCard.module.css";

/** Props for the NavCard navigation card. */
export interface NavCardProps {
  /** Destination title (main line). */
  title: ReactNode;
  /** Optional secondary line (destination description/metadata). */
  description?: ReactNode;
  /** Meta on the right, before the chevron (e.g. role pill, counter). */
  meta?: ReactNode;
  /** Optional leading slot: `Avatar` or icon via ReactNode. */
  leading?: ReactNode;
  /** With `href` it renders `<a>`; without `href` it renders `<button>`. */
  href?: string;
  /** Link `target` (only when `href` is used). */
  target?: string;
  /** Link `rel` (only when `href` is used). */
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /** Disables the card (no click, no Tab focus on the link). */
  disabled?: boolean;
  /** Marks as the current destination (primary border + background, `aria-current`). */
  current?: boolean;
  /** `dashed` variant = create action ("create new…"), dashed border. */
  variant?: "solid" | "dashed";
  /** Hides the ">" chevron on the right. */
  showChevron?: boolean;
  /** Short label above the title (e.g. "Next", "Previous"). */
  eyebrow?: ReactNode;
  /** `back` points the chevron backwards and puts it on the left; `forward` aligns the text to the right. Default: chevron on the right, text on the left. */
  direction?: "back" | "forward";
  className?: string;
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
 * NavCard — card de navegação clicável com chevron ">" (padrão do workspace
 * picker). O card INTEIRO é o alvo: renderiza `<a>` quando há `href`, senão
 * `<button>`. Composição: `leading` recebe `Avatar`/ícone; `meta` recebe
 * `Badge`/pill. Teclado nativo (Tab + Enter/Espaço) e foco visível.
 *
 *   <NavCard leading={<Avatar initials="GE" />} title="Equipe Exemplo"
 *     description="4 membros · 3 projetos" href="/ws/globo" />
 */
export const NavCard = forwardRef<HTMLAnchorElement | HTMLButtonElement, NavCardProps>(
  function NavCard(
    {
      title,
      description,
      meta,
      leading,
      href,
      target,
      rel,
      onClick,
      disabled = false,
      current = false,
      variant = "solid",
      showChevron = true,
      eyebrow,
      direction,
      className,
    },
    ref
  ) {
    const cls = cn(
      styles.card,
      variant === "dashed" && styles.dashed,
      current && styles.current,
      disabled && styles.disabled,
      direction && styles[direction],
      className
    );

    const body = (
      <>
        {showChevron && direction === "back" && chevron}
        {leading != null && <span className={styles.leading}>{leading}</span>}
        <span className={styles.info}>
          {eyebrow != null && <span className={styles.eyebrow}>{eyebrow}</span>}
          <span className={styles.title}>{title}</span>
          {description != null && <span className={styles.description}>{description}</span>}
        </span>
        {meta != null && <span className={styles.meta}>{meta}</span>}
        {showChevron && direction !== "back" && chevron}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={cls}
          href={disabled ? undefined : href}
          target={target}
          rel={rel}
          aria-disabled={disabled || undefined}
          aria-current={current ? "page" : undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            onClick?.(e);
          }}
        >
          {body}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        disabled={disabled}
        aria-current={current ? "true" : undefined}
        onClick={onClick}
      >
        {body}
      </button>
    );
  }
);
