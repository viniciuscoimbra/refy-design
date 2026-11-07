// Contrato de props do Callout: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

export type CalloutTone = "info" | "note" | "success" | "warn" | "danger" | "upsell";

/** Props for the Callout component. */
export interface CalloutCoreProps {
  /** Tom semântico do aviso (padrão: "info"). */
  tone?: CalloutTone;
  /** Ícone à esquerda. */
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  /** Ação opcional à direita. */
  action?: ReactNode;
  /** Mostra o botão de fechar; o aviso sai com transição e desmonta. */
  dismissible?: boolean;
  /** Chamado depois que o aviso sai. */
  onDismiss?: () => void;
  /** Nome acessível do botão de fechar (padrão: "Dispensar aviso"). */
  dismissLabel?: string;
}
