// Contrato de props do Avatar: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";

/** Props for the Avatar component. */
export interface AvatarCoreProps {
  /** Iniciais (1–2 letras) quando não há imagem. */
  initials?: string;
  /** URL da foto; se presente, sobrepõe as iniciais. */
  src?: string;
  alt?: string;
  size?: AvatarSize;
  /**
   * Forma: `circle` (pessoa, default) ou `square` (workspace/projeto/logo,
   * cantos arredondados proporcionais ao tamanho).
   */
  shape?: AvatarShape;
  /** Cor de fundo (para iniciais). Default = cor da marca ativa. */
  color?: string;
  /**
   * Semente p/ gradiente determinístico de marca (ex.: nome do workspace).
   * A mesma string sempre gera o mesmo gradiente. Ignorada com `src`/`color`.
   */
  seed?: string;
}
