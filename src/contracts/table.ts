// Contrato da Table. `width` da coluna e `minTableWidth` aceitam texto de CSS na web e ficam
// fora; no nativo são números em pt.
import type { ReactNode } from "react";

export interface TableColumnCore<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  align?: "left" | "right" | "num";
  sortable?: boolean;
  sortValue?: (row: Row) => string | number | null;
  filterable?: boolean;
  filterValue?: (row: Row) => string | string[];
}

export interface TablePagination {
  pageSize: number;
  pageSizeOptions?: number[];
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
}

/** Props for the Table component, sem `columns` (tipo da coluna muda em `width`). */
export interface TableCoreProps<Row> {
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  onRowClick?: (row: Row) => void;
  rowLabel?: (row: Row) => string;
  caption?: string;
  empty?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchMatch?: (row: Row, query: string) => boolean;
  loading?: boolean;
  error?: ReactNode;
  pagination?: TablePagination;
}
