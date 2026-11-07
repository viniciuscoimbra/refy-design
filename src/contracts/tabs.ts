// Contrato de props do Tabs: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  /** Estado da parte representada pela aba. */
  status?: "complete" | "warning";
  content?: ReactNode;
  disabled?: boolean;
}

/** Props for the Tabs component. */
export interface TabsCoreProps {
  items: TabItem[];
  /** Aba ativa controlada. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** underline (padrão) ou pill. */
  variant?: "underline" | "pill";
  orientation?: "horizontal" | "vertical";
  /** Permite quebrar as abas em linhas quando não há largura suficiente. */
  wrap?: boolean;
}
