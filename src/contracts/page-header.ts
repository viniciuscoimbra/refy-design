// Contrato de props do PageHeader: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

/** Props for the PageHeader page hero. */
export interface PageHeaderCoreProps {
  /** Eyebrow mono uppercase acima do título (ex.: "Workspace · Equipe Exemplo"). */
  eyebrow?: ReactNode;
  /** Título da página (vira o `<h1>` — só existe um por página). */
  title: ReactNode;
  /** Lead/descrição sob o título (máx. 62ch, cor secundária). */
  lead?: ReactNode;
  /** Ações à direita (`Button`/`SplitButton`), alinhadas à base do bloco de texto. */
  actions?: ReactNode;
  /** Slot de trilha acima do eyebrow — passe o átomo `Breadcrumb`. Regra do PO: breadcrumb sempre com volta ao pai. */
  breadcrumb?: ReactNode;
}
