// Contrato de props do ConnectorCard: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

/** Props for the ConnectorCard integration row. */
export interface ConnectorCardCoreProps {
  /**
   * Logo do serviço (slot — SVG real do serviço, nunca bundleado no DS).
   * Renderizado num quadrado 40px com borda neutra.
   */
  logo?: ReactNode;
  /** Nome do serviço/conexão. */
  name: ReactNode;
  /** Status ao lado do nome (slot — `Badge` "Conectado", `StatusDot`…). */
  status?: ReactNode;
  /** Descrição curta do que a integração faz. */
  description?: ReactNode;
  /** Linha mono de metadados (conta, nº de sites, último sync). */
  meta?: ReactNode;
  /** Ações à direita (slot — `Button` "Conectar"/"Configurar", `Menu`…). */
  actions?: ReactNode;
  /**
   * Bloqueado pelo plano (upsell): superfície apagada; `lockHint` substitui
   * as ações (ex.: `Badge` "Plano Growth" + `Button` de upgrade).
   */
  locked?: boolean;
  /** Conteúdo exibido no lugar das ações quando `locked`. */
  lockHint?: ReactNode;
}
