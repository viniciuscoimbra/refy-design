// Contrato de props do PersonCell: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

/** Props for the PersonCell component. */
export interface PersonCellCoreProps {
  avatar?: ReactNode;
  name: ReactNode;
  tag?: ReactNode;
  secondary?: ReactNode;
  size?: "sm" | "md";
}
