// Contrato de props do AspectRatio: o que a web e o nativo implementam igual.

/** Props for the AspectRatio box. */
export interface AspectRatioCoreProps {
  /** Largura dividida pela altura. Padrão 16/9; valor inválido volta ao padrão. */
  ratio?: number;
}
