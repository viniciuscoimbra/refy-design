// Contrato de props do NavCard: o que a web e o nativo implementam igual.
// Navegar é do ambiente: `href`/`onClick` na web, `onPress` no nativo.
import type { ReactNode } from "react";

/** Props for the NavCard component. */
export interface NavCardCoreProps {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  disabled?: boolean;
  current?: boolean;
  variant?: "solid" | "dashed";
  showChevron?: boolean;
}
