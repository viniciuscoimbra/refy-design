import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";

/** Props for the Avatar component. */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Initials (1–2 letters) when there is no image. */
  initials?: string;
  /** Photo URL; when present, it covers the initials. */
  src?: string;
  alt?: string;
  size?: AvatarSize;
  /**
   * Shape: `circle` (person, default) or `square` (workspace/project/logo,
rounded corners proportional to size).
   */
  shape?: AvatarShape;
  /** Background color (for initials). Default = the active brand color. */
  color?: string;
  /**
   * Seed for a deterministic brand gradient (e.g. the workspace name).
The same string always produces the same gradient. Ignored with `src`/`color`.
   */
  seed?: string;
}

/** Quantidade de gradientes de marca (classes g0–g4 no CSS Module). */
const GRADIENT_COUNT = 5;

/** Hash determinístico simples (charCodes ponderados) → índice de gradiente. */
function gradientIndex(seed: string): number {
  let acc = 0;
  for (let i = 0; i < seed.length; i++) acc = (acc + seed.charCodeAt(i) * (i + 1)) % 997;
  return acc % GRADIENT_COUNT;
}

/**
 * Avatar de pessoa (`circle`) ou de entidade — workspace, projeto, logo
 * (`shape="square"`). Iniciais ou imagem; com `seed`, gradiente de marca
 * determinístico por string (mesmo nome → mesma cor, em qualquer tela).
 */
export function Avatar({
  initials,
  src,
  alt = "",
  size = "md",
  shape = "circle",
  color,
  seed,
  className,
  style,
  ...rest
}: AvatarProps) {
  const useSeed = !src && !color && seed != null && seed.length > 0;
  return (
    <span
      data-refy-avatar=""
      className={cn(
        styles.avatar,
        styles[size],
        shape === "square" && styles.square,
        useSeed && styles[`g${gradientIndex(seed)}`],
        color && styles.customColor,
        className
      )}
      style={{
        background: src || useSeed ? undefined : color ?? "var(--avatar-background, var(--brand-gradient))",
        ...style,
      }}
      {...rest}
    >
      {src ? <img className={styles.img} src={src} alt={alt} /> : initials}
    </span>
  );
}
