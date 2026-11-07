// Contrato de props do Skeleton: o que a web e o nativo implementam igual.

/** Props for the Skeleton loading placeholder. */
export interface SkeletonCoreProps {
  /** Largura (número = px). Padrão 100%. */
  width?: number | string;
  /** Altura (número = px). Padrão 14px (linha de texto). */
  height?: number | string;
  /** Círculo (avatar). Usa `width` como diâmetro. */
  circle?: boolean;
}
