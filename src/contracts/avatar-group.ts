// Contrato de props do AvatarGroup: o que a web e o nativo implementam igual.
import type { AvatarSize } from "./avatar";

/** Uma pessoa (ou workspace) dentro do AvatarGroup. */
export interface AvatarGroupItem {
  /** Nome completo: vira nome acessível e origem das iniciais. */
  name: string;
  src?: string;
  initials?: string;
  color?: string;
}

/** Props for the AvatarGroup component. */
export interface AvatarGroupCoreProps {
  items: AvatarGroupItem[];
  /** Máximo de avatares visíveis; o excedente vira "+N". Padrão 4. */
  max?: number;
  size?: AvatarSize;
  /** Se presente, cada avatar vira botão. */
  onItemClick?: (item: AvatarGroupItem, index: number) => void;
  /** Se presente, o "+N" vira botão. */
  onOverflowClick?: () => void;
}
