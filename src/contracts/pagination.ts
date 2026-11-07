// Contrato de props do Pagination: o que a web e o nativo implementam igual.

/** Props for the Pagination control. */
export interface PaginationCoreProps {
  /** Página atual (começa em 1, controlada). */
  page: number;
  /** Total de páginas. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Vizinhos visíveis de cada lado da página atual. Padrão 1. */
  siblingCount?: number;
}
