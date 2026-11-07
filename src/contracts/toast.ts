// Contrato de props do Toast: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.

export type ToastTone = "default" | "success" | "danger";

/** Dados de um toast na pilha. */
export interface ToastData {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Ação inline (ex.: Desfazer). */
  action?: { label: string; onClick: () => void };
  /** ms até auto-dispensar. `null` = fica até fechar. Padrão 5000. */
  duration?: number | null;
}

/** Props for a single Toast notification. */
export interface ToastCoreProps extends ToastData {
  onDismiss?: (id: string) => void;
}

/** Props for the ToastRegion stack. */
export interface ToastRegionCoreProps {
  /** Pilha de toasts (controlada — o app é dono da lista). */
  toasts: ToastData[];
  /** Remove um toast da lista (auto-dismiss, ×, ou após a ação). */
  onDismiss: (id: string) => void;
  /** Canto da tela. Padrão `bottom-right`. */
  position?: "bottom-right" | "bottom-left" | "top-right";
}
