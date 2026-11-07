// Contrato de props do Modal: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

/** Props for the Modal dialog. */
export interface ModalCoreProps {
  role?: "dialog" | "alertdialog";
  hideCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  ariaDescribedBy?: string;
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Nome acessível quando não há título visível. */
  ariaLabel?: string;
  /** Ações do rodapé (botões). Sem rodapé se ausente. */
  footer?: ReactNode;
  /** Largura máxima em px. Default 520. */
  width?: number;
  children: ReactNode;
}
