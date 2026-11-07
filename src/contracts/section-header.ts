// Contrato de props do SectionHeader: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

/** Props for the SectionHeader section title. */
export interface SectionHeaderCoreProps {
  title: ReactNode;
  /** Descrição sob o título. */
  sub?: ReactNode;
  /** Contador da seção, num Badge neutro. */
  count?: ReactNode;
  /** Ação à direita. */
  action?: ReactNode;
  /** Título compacto em caixa alta com régua até a borda. */
  rule?: boolean;
}
