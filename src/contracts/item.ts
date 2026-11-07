// Contrato de props do Item: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export interface ItemCoreProps {
  title: string;
  description?: ReactNode;
  media?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  /** Remove a superfície para compor metadados dentro de outra superfície. */
  variant?: 'default' | 'plain';
}
