import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Skeleton.module.css";

/** Props for the Skeleton loading placeholder. */
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Width (number = px). Default 100%. */
  width?: number | string;
  /** Height (number = px). Default 14px (text line). */
  height?: number | string;
  /** Circle (avatar). Uses `width` as the diameter. */
  circle?: boolean;
}

/**
 * Skeleton — placeholder com shimmer enquanto o conteúdo carrega.
 *
 * Bloco de 14px por padrão (linha de texto); componha vários para formar
 * cards e listas. `circle` para avatares. Marque o container real com
 * `aria-busy="true"` enquanto os skeletons estiverem visíveis; o shimmer
 * congela com `prefers-reduced-motion`.
 *
 *   <Skeleton width={180} /> <Skeleton circle width={32} />
 */
export function Skeleton({ width = "100%", height = 14, circle, className, style, ...rest }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skel, circle && styles.circle, className)}
      style={{
        width,
        height: circle ? width : height,
        ...style,
      }}
      {...rest}
    />
  );
}
