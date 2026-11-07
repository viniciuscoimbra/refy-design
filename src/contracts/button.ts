// Contrato de props do Button: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStatus = "idle" | "loading" | "success" | "error";

export type ButtonProgressEffect = "spinner" | "fill-horizontal" | "fill-vertical" | "shrink-horizontal" | "shrink-vertical" | "rotate-angle-bottom" | "rotate-angle-top" | "rotate-angle-left" | "rotate-angle-right" | "rotate-side-down" | "rotate-side-up" | "rotate-side-left" | "rotate-side-right" | "rotate-back" | "flip-open" | "slide-down" | "move-up" | "top-line" | "lateral-lines";

/** Props for the base Refy button. */
export interface ButtonCoreProps {
  /** Hierarquia visual. Primário usa texto definido pelo token on-primary. */
  variant?: ButtonVariant;
  /** Prévia visual de gesto vinculado; não dispara clique nem muda disabled. */
  interactionState?: "hover" | "pressed";
  size?: ButtonSize;
  /** Ícone à esquerda do label (16px recomendado). */
  leadingIcon?: ReactNode;
  /** Ícone à direita do label. */
  trailingIcon?: ReactNode;
  /** Mostra spinner e bloqueia cliques. */
  loading?: boolean;
  /** Estado explícito para apresentar conclusão ou erro; `loading` continua compatível. */
  status?: ButtonStatus;
  /** Loading: spinner, preenchimento ou linha. Opções antigas de giro/encolhimento usam linha sem esconder o rótulo. */
  progressEffect?: ButtonProgressEffect;
  /** Label acessível/visível durante processamento. */
  loadingLabel?: ReactNode;
  /** Ocupa 100% da largura do container. */
  block?: boolean;
}
