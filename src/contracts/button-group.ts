// Contrato de props do ButtonGroup: o que a web e o nativo implementam igual.

/** Props for the ButtonGroup component. */
export interface ButtonGroupCoreProps {
  /** Eixo visual do conjunto de ações. */
  orientation?: "horizontal" | "vertical";
  /** Nome acessível do grupo. */
  label?: string;
  /** Índice ativo inicial. */
  defaultActiveIndex?: number;
  /** Índice ativo controlado. */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}
