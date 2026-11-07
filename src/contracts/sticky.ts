// Contrato de props do StickyBar e do StickyFooter: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

/** Props for the StickyBar component. */
export interface StickyBarCoreProps {
  title: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  visible?: boolean;
}

/** Props for the StickyFooter component. */
export interface StickyFooterCoreProps {
  start?: ReactNode;
  children?: ReactNode;
}
