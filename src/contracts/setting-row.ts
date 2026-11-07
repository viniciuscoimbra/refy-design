// Contrato de props do SettingRow: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

/** Props for the SettingRow list/settings line. */
export interface SettingRowCoreProps {
  /** Título da linha. Cabem `Badge`/`Chip` inline (ex.: status "Conectado"). */
  title: ReactNode;
  /** Descrição em texto corrido sob o título. */
  description?: ReactNode;
  /** Meta mono sob a descrição (e-mail, IP, data, chave mascarada…). */
  meta?: ReactNode;
  /** Slot inicial — ícone ou `Avatar`. */
  leading?: ReactNode;
  /** Moldura 36px em volta do `leading` (padrão `.oauth-icon` — logos de provedor/bandeira). */
  leadingFrame?: boolean;
  /** Ações à direita (`Button`/`IconButton`/`Badge`/texto mono). Em linha clicável use só conteúdo NÃO interativo. */
  actions?: ReactNode;
  /** Desabilita a linha clicável (sem clique, sem foco por Tab no link). */
  disabled?: boolean;
  /** Chevron ">" à direita nas linhas clicáveis. Padrão `true`. */
  showChevron?: boolean;
}

/** Props for the SettingRowGroup list wrapper. */
export interface SettingRowGroupCoreProps {
  /** `SettingRow`s (ou qualquer linha) — cada filho vira um `listitem` com divisor. */
  children: ReactNode;
  /** Rótulo acessível da lista (ex.: "Sessões ativas"). */
  "aria-label"?: string;
}
