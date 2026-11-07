// Contrato de props do EmptyState: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

/** Props for the EmptyState component. */
export interface EmptyStateCoreProps {
  /** Ícone dentro do quadro (via prop, nunca bundleado). */
  icon?: ReactNode;
  title: ReactNode;
  /** Copy explicativa (máx ~36ch). */
  message?: ReactNode;
  /** CTA opcional (ex.: <Button>Limpar filtros</Button>). */
  action?: ReactNode;
  /** Borda dashed em volta, indicando ausência. Padrão `true`. */
  bordered?: boolean;
}
